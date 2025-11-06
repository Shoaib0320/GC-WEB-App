//app/api/attendance/export/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";

function safe(v) {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return `"${v.replace(/"/g, '""')}"`;
  return `"${String(v)}"`;
}

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month") || "", 10);
    const year = parseInt(searchParams.get("year") || "", 10);
    const userType = searchParams.get("userType") || "all";

    const filter = {};
    if (month && year) {
      const from = new Date(year, month - 1, 1, 0, 0, 0, 0);
      const to = new Date(year, month - 1 + 1, 1, 0, 0, 0, 0);
      filter.createdAt = { $gte: from, $lt: to };
    }

    if (userType !== 'all') {
      if (userType === 'user') {
        filter.user = { $exists: true, $ne: null };
      } else if (userType === 'agent') {
        filter.agent = { $exists: true, $ne: null };
      }
    }

    const rows = await Attendance.find(filter)
      .populate("user", "firstName lastName email")
      .populate("agent", "agentName agentId email")
      .populate("shift", "name startTime endTime")
      // .populate("manager", "firstName lastName email")
      .sort({ createdAt: -1 });

    const headers = [
      "Type",
      "Name",
      "Email",
      "Shift",
      "Shift Start",
      "Shift End",
      "CheckInTime",
      "CheckOutTime",
      "Status",
      "IsLate",
      "LateMinutes",
      "IsOvertime",
      "OvertimeMinutes",
      "LeaveType",
      "LeaveReason",
      "CheckInLat",
      "CheckInLng",
      "CheckOutLat",
      "CheckOutLng",
      "Notes",
      "Date"
    ];

    const csvLines = [];
    csvLines.push(headers.join(","));

    for (const r of rows) {
      const line = [
        safe(r.user ? "User" : "Agent"),
        safe(r.user ? `${r.user.firstName} ${r.user.lastName}` : r.agent?.agentName),
        safe(r.user ? r.user.email : r.agent?.email),
        safe(r.shift ? r.shift.name : ""),
        safe(r.shift ? r.shift.startTime : ""),
        safe(r.shift ? r.shift.endTime : ""),
        safe(r.checkInTime ? new Date(r.checkInTime).toISOString() : ""),
        safe(r.checkOutTime ? new Date(r.checkOutTime).toISOString() : ""),
        safe(r.status),
        safe(r.isLate),
        safe(r.lateMinutes),
        safe(r.isOvertime),
        safe(r.overtimeMinutes),
        safe(r.leaveType || ""),
        safe(r.leaveReason || ""),
        safe(r.checkInLocation?.lat ?? ""),
        safe(r.checkInLocation?.lng ?? ""),
        safe(r.checkOutLocation?.lat ?? ""),
        safe(r.checkOutLocation?.lng ?? ""),
        safe(r.notes || ""),
        safe(new Date(r.createdAt).toISOString())
      ];
      csvLines.push(line.join(","));
    }

    const csv = csvLines.join("\n");
    const fileName = `admin_attendance_${year || 'all'}_${month ? String(month).padStart(2,"0") : 'all'}.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("GET /api/attendance/export error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}