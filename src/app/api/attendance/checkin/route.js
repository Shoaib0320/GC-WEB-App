// app/api/attendance/checkin/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";
import Shift from "@/Models/Shift";
import Holiday from "@/Models/Holiday";
import WeeklyOff from "@/Models/WeeklyOff";
import Agent from "@/Models/Agent";
import User from "@/Models/User";
import { verifyToken, getUserIdFromToken } from "@/lib/jwt";
import {
  isHoliday,
  isWeeklyOff,
  isShiftDay,
  parseShiftDateTime,
  getTimeDifferenceInMinutes,
  getTodayDateRange,
} from "@/lib/attendanceUtils";

export async function POST(request) {
  try {
    await connectDB();

    // 🔐 Auth check
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { shiftId, location, userType = "agent" } = body;

    if (!shiftId) {
      return NextResponse.json({ success: false, message: "Shift ID is required" }, { status: 400 });
    }

    const userId = getUserIdFromToken(decoded);

    // 🔹 Get timezone-aware date range (Pakistan)
    const { todayStart, todayEnd, now } = getTodayDateRange("Asia/Karachi");

    console.log("🔍 Check-in Request (Pakistan Time):", {
      userId,
      shiftId,
      currentTime: now.toLocaleString("en-PK", { timeZone: "Asia/Karachi" }),
    });

    // Step 1️⃣: Existing attendance
    const query = {
      date: { $gte: todayStart, $lt: todayEnd },
      [userType === "agent" ? "agent" : "user"]: userId,
    };
    const existing = await Attendance.findOne(query);
    if (existing) {
      return NextResponse.json({
        success: false,
        message: "Already checked in today.",
      }, { status: 400 });
    }

    // Step 2️⃣: Holiday check
    const holiday = await isHoliday(now);
    if (holiday) {
      const attendance = await Attendance.create({
        [userType === "agent" ? "agent" : "user"]: userId,
        shift: shiftId,
        date: todayStart,
        status: "holiday",
        notes: `Auto-marked: ${holiday.name}`,
      });
      return NextResponse.json({
        success: true,
        message: `Today is a holiday (${holiday.name})`,
        data: attendance,
      });
    }

    // Step 3️⃣: Weekly off
    const weeklyOff = await isWeeklyOff(now);
    if (weeklyOff) {
      const attendance = await Attendance.create({
        [userType === "agent" ? "agent" : "user"]: userId,
        shift: shiftId,
        date: todayStart,
        status: "weekly_off",
        notes: `Auto-marked: ${weeklyOff.name}`,
      });
      return NextResponse.json({
        success: true,
        message: `Today is a weekly off (${weeklyOff.name})`,
        data: attendance,
      });
    }

    // Step 4️⃣: Check shift
    const shiftValid = await isShiftDay(shiftId, now);
    if (!shiftValid) {
      return NextResponse.json({
        success: false,
        message: "No shift assigned for today.",
      }, { status: 400 });
    }

    // Step 5️⃣: Get shift
    const shift = await Shift.findById(shiftId);
    if (!shift) {
      return NextResponse.json({ success: false, message: "Shift not found" }, { status: 404 });
    }

    console.log("🕒 Shift Info:", {
      name: shift.name,
      start: shift.startTime,
      end: shift.endTime,
      days: shift.days,
    });

    // Step 6️⃣: Calculate late
    const shiftStart = parseShiftDateTime(todayStart, shift.startTime);
    const grace = 15; // minutes
    const diffMinutes = getTimeDifferenceInMinutes(shiftStart, now);

    console.log("⏰ Timing Info (Asia/Karachi):", {
      shiftStart: shiftStart.toLocaleString("en-PK", { timeZone: "Asia/Karachi" }),
      checkIn: now.toLocaleString("en-PK", { timeZone: "Asia/Karachi" }),
      diffMinutes,
      grace,
    });

    let isLate = false;
    let lateMinutes = 0;
    let status = "present";

    if (diffMinutes > grace) {
      isLate = true;
      lateMinutes = diffMinutes;
      status = "late";
    }

    // Step 7️⃣: Save attendance
    const attendance = await Attendance.create({
      [userType === "agent" ? "agent" : "user"]: userId,
      shift: shiftId,
      date: todayStart,
      // checkInTime: now,
      // checkInLocation: location || null,
      checkInTime: new Date(),
  checkInLocation: location || null,
      status,
      isLate,
      lateMinutes,
    });

    // Step 8️⃣: Response
    let msg = "Checked in successfully ✅";
    if (isLate) {
      msg = `Checked in ⚠️ Late by ${lateMinutes} minutes`;
    } else if (diffMinutes > 0) {
      msg = "Checked in ✅ Within grace period";
    } else {
      msg = "Checked in 🎉 On time";
    }

    const populated = await Attendance.findById(attendance._id)
      .populate(userType === "agent" ? "agent" : "user", "name email userId")
      .populate("shift", "name startTime endTime days");

    return NextResponse.json({
      success: true,
      message: msg,
      data: populated,
      lateInfo: {
        isLate,
        lateMinutes,
        shiftStartTime: shift.startTime,
        checkInTime: now.toLocaleString("en-PK", { timeZone: "Asia/Karachi" }),
      },
    });
  } catch (err) {
    console.error("❌ Check-in Error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
