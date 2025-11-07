//src/app/api/attendance/admin/leave/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";
import { verifyToken } from "@/lib/jwt";

export async function POST(request) {
  try {
    await connectDB();

    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    const body = await request.json();
    const { 
      userId, 
      agentId, 
      startDate, 
      endDate, 
      leaveType, 
      reason 
    } = body;

    if ((!userId && !agentId) || !startDate || !endDate || !leaveType || !reason) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const results = [];

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateStart = new Date(date);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(dateStart);
      dateEnd.setDate(dateEnd.getDate() + 1);

      const existingQuery = {
        createdAt: { $gte: dateStart, $lt: dateEnd }
      };

      if (userId) {
        existingQuery.user = userId;
      } else {
        existingQuery.agent = agentId;
      }

      const existing = await Attendance.findOne(existingQuery);

      const attendanceData = {
        shift: null,
        status: "leave",
        leaveReason: reason,
        leaveType: leaveType,
        createdAt: date,
        updatedAt: new Date()
      };

      if (userId) {
        attendanceData.user = userId;
      } else {
        attendanceData.agent = agentId;
      }

      let attendance;
      if (existing) {
        Object.assign(existing, attendanceData);
        await existing.save();
        attendance = existing;
      } else {
        attendance = await Attendance.create(attendanceData);
      }

      results.push(attendance);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Leave assigned for ${results.length} days`, 
      data: results 
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/attendance/admin/leave error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
