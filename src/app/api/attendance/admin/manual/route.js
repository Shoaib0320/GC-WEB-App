// src/app/api/attendance/admin/manual/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";
import { verifyToken } from "@/lib/jwt";
import Agent from "@/Models/Agent";
import User from "@/Models/User";

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
      shiftId, 
      date, 
      status, 
      checkInTime, 
      checkOutTime, 
      notes,
      leaveReason,
      leaveType 
    } = body;

    if (!date || !status) {
      return NextResponse.json({ success: false, message: "Date and status are required" }, { status: 400 });
    }

    if (!userId && !agentId) {
      return NextResponse.json({ success: false, message: "Either user or agent is required" }, { status: 400 });
    }

    const attendanceDate = new Date(date);
    const dateStart = new Date(attendanceDate);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(dateStart);
    dateEnd.setDate(dateEnd.getDate() + 1);

    // Check if attendance already exists
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
      status,
      notes: notes || "",
      createdAt: attendanceDate,
      updatedAt: new Date()
    };

    // Only add shift if provided
    if (shiftId) {
      attendanceData.shift = shiftId;
    }

    if (userId) {
      attendanceData.user = userId;
    } else {
      attendanceData.agent = agentId;
    }

    // Handle check-in time properly
    if (checkInTime && checkInTime.trim() !== "") {
      const checkInDateTime = new Date(`${date}T${checkInTime}`);
      if (!isNaN(checkInDateTime.getTime())) {
        attendanceData.checkInTime = checkInDateTime;
      }
    }

    // Handle check-out time properly
    if (checkOutTime && checkOutTime.trim() !== "") {
      const checkOutDateTime = new Date(`${date}T${checkOutTime}`);
      if (!isNaN(checkOutDateTime.getTime())) {
        attendanceData.checkOutTime = checkOutDateTime;
      }
    }

    if (leaveReason) {
      attendanceData.leaveReason = leaveReason;
      attendanceData.leaveType = leaveType || "other";
    }

    let attendance;
    if (existing) {
      Object.assign(existing, attendanceData);
      await existing.save();
      attendance = existing;
    } else {
      attendance = await Attendance.create(attendanceData);
    }

    const populated = await Attendance.findById(attendance._id)
      .populate("user", "firstName lastName email")
      .populate("agent", "agentName agentId email")
      .populate("shift", "name startTime endTime")

    return NextResponse.json({ 
      success: true, 
      message: "Attendance updated successfully", 
      data: populated 
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/attendance/admin/manual error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}