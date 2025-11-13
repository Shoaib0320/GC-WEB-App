// app/api/attendance/my/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";
import { verifyToken, getUserIdFromToken } from "@/lib/jwt";
import Holiday from "@/Models/Holiday";
import WeeklyOff from "@/Models/WeeklyOff";
import Shift from "@/Models/Shift";
import Agent from "@/Models/Agent";
import User from "@/Models/User";

/** ---------- Pakistan Time Utilities ---------- **/

// Convert to Pakistan Time (Asia/Karachi)
function toPakistanDate(date) {
  return new Date(
    new Date(date).toLocaleString("en-US", { timeZone: "Asia/Karachi" })
  );
}

// Stable Key in Pakistan Time (YYYY-MM-DD)
function toKeyPKT(date) {
  const d = toPakistanDate(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Get all month dates up to today (Pakistan)
function getDatesUpToTodayPKT(year, month) {
  const dates = [];
  const today = toPakistanDate(new Date());
  const lastDay =
    today.getFullYear() === year && today.getMonth() + 1 === month
      ? today.getDate()
      : new Date(year, month, 0).getDate();
  for (let d = 1; d <= lastDay; d++) {
    dates.push(new Date(year, month - 1, d));
  }
  return dates;
}

/** ---------- Main API ---------- **/

export async function GET(request) {
  try {
    await connectDB();
    console.log("📅 Attendance Monthly Route Triggered (Pakistan Time)");

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const userId = getUserIdFromToken(decoded);
    const userType = decoded.type || "agent";

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month"));
    const year = parseInt(searchParams.get("year"));
    if (!month || !year) {
      return NextResponse.json({ success: false, message: "Month and Year are required" }, { status: 400 });
    }

    const queryField = userType === "agent" ? "agent" : "user";

    // Range
    const monthStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const monthEnd = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));

    // Attendance records for the month
    const attends = await Attendance.find({
      [queryField]: userId,
      $or: [
        { date: { $gte: monthStart, $lt: monthEnd } },
        { checkInTime: { $gte: monthStart, $lt: monthEnd } },
      ],
    })
      .populate("shift", "name startTime endTime hours days")
      .sort({ date: 1, checkInTime: 1 });

    const attendanceMap = {};
    attends.forEach(att => {
      const source = att.date || att.checkInTime || att.createdAt;
      if (!source) return;
      const key = toKeyPKT(source);
      attendanceMap[key] = att;
    });

    const todayPK = toPakistanDate(new Date());
    const todayKey = toKeyPKT(todayPK);

    const datesUpToToday = getDatesUpToTodayPKT(year, month);

    // Also include future approved leave etc.
    const futureKeys = new Set();
    attends.forEach(att => {
      const key = toKeyPKT(att.date || att.checkInTime || att.createdAt);
      if (key > todayKey) futureKeys.add(key);
    });

    // Combine dates up to today + future records
    const mergedKeysSet = new Set(datesUpToToday.map(d => toKeyPKT(d)));
    for (const fk of futureKeys) mergedKeysSet.add(fk);
    const mergedKeys = Array.from(mergedKeysSet).sort();

    // Weekly Offs & Holidays (month-wide)
    const weeklyOffDocs = await WeeklyOff.find({ isActive: true });
    const weeklyOffSet = new Set(weeklyOffDocs.map(w => w.day.toLowerCase()));

    const monthStartPK = toPakistanDate(new Date(Date.UTC(year, month - 1, 1)));
    const monthEndPK = toPakistanDate(new Date(Date.UTC(year, month, 0)));

    const holidayDocs = await Holiday.find({
      $or: [
        { date: { $gte: monthStart, $lt: monthEnd } },
        { isRecurring: true }
      ],
      isActive: true
    });

    const holidaysSet = new Set();
    for (const h of holidayDocs) {
      const dateKey = toKeyPKT(h.date);
      holidaysSet.add(dateKey);
    }

    /** ---------------- Build Final Data ---------------- **/

    const tableData = [];
    let stats = { present: 0, late: 0, absent: 0, holiday: 0, weeklyOff: 0, leave: 0 };

    const totalLateMinutes = attends.reduce((sum, a) => sum + (a.lateMinutes || 0), 0);
    const totalOvertimeMinutes = attends.reduce((sum, a) => sum + (a.overtimeMinutes || 0), 0);

    for (const key of mergedKeys) {
      const dateObj = new Date(`${key}T00:00:00`);
      const isFuture = key > todayKey;
      const record = attendanceMap[key];
      let status = "absent";
      let remarks = "";
      let checkInTime = null;
      let checkOutTime = null;
      let lateMinutes = 0;
      let overtimeMinutes = 0;

      if (record) {
        status = record.status || "present";
        checkInTime = record.checkInTime
          ? toPakistanDate(record.checkInTime).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: true })
          : null;
        checkOutTime = record.checkOutTime
          ? toPakistanDate(record.checkOutTime).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: true })
          : null;
        lateMinutes = record.lateMinutes || 0;
        overtimeMinutes = record.overtimeMinutes || 0;
      } else {
        // Future with no record → skip
        if (isFuture) continue;

        // Check if holiday or weekly off
        if (holidaysSet.has(key)) {
          status = "holiday";
          remarks = "Holiday";
        } else {
          const weekday = toPakistanDate(dateObj)
            .toLocaleDateString("en-US", { weekday: "long" })
            .toLowerCase();
          if (weeklyOffSet.has(weekday)) {
            status = "weekly_off";
            remarks = "Weekly Off";
          } else {
            status = "absent";
            remarks = "No Attendance Record";
          }
        }
      }

      // Stats (up to today)
      if (!isFuture) {
        if (status === "present") stats.present++;
        else if (status === "late") stats.late++;
        else if (status === "absent") stats.absent++;
        else if (status === "holiday") stats.holiday++;
        else if (status === "weekly_off") stats.weeklyOff++;
        else if (["approved_leave", "pending_leave", "leave"].includes(status)) stats.leave++;
      }

      tableData.push({
        date: key,
        day: toPakistanDate(dateObj).toLocaleDateString("en-PK", { weekday: "short" }),
        status,
        checkInTime,
        checkOutTime,
        remarks,
        lateMinutes,
        overtimeMinutes,
        rawRecord: record || null,
      });
    }

    const workingDays = datesUpToToday.length - (stats.holiday + stats.weeklyOff);
    const attendanceRate =
      workingDays > 0
        ? ((stats.present + stats.late) / workingDays * 100).toFixed(2)
        : "0.00";

    return NextResponse.json({
      success: true,
      data: {
        month,
        year,
        timezone: "Asia/Karachi",
        generatedAt: toPakistanDate(new Date()).toLocaleString("en-PK", { timeZone: "Asia/Karachi" }),
        summary: {
          present: stats.present,
          late: stats.late,
          absent: stats.absent,
          holiday: stats.holiday,
          weeklyOff: stats.weeklyOff,
          leave: stats.leave,
          totalLateMinutes,
          totalOvertimeMinutes,
          attendanceRate,
        },
        records: tableData,
      },
    });
  } catch (error) {
    console.error("❌ Attendance GET error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
