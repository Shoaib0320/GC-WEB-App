// app/api/attendance/checkout/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";
import Shift from "@/Models/Shift";
import { verifyToken, getUserIdFromToken } from "@/lib/jwt";
import Agent from "@/Models/Agent";

// Helper to parse "HH:MM" into Date object on a given date
function parseShiftDateTime(baseDate, timeStr) {
  const [hh, mm] = timeStr.split(":").map(Number);
  const dt = new Date(baseDate);
  dt.setHours(hh, mm, 0, 0);
  return dt;
}

// app/api/attendance/checkin/route.js
export async function POST(request) {
  try {
    await connectDB();

    // Authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { shiftId, location, userType = 'agent' } = body;

    const userId = getUserIdFromToken(decoded);

    // ✅ FIXED: Today's date range properly
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    // ✅ FIXED: Check if already checked in today - PROPER QUERY
    const existingAttendance = await Attendance.findOne({
      $or: [
        { agent: userId },
        { user: userId }
      ],
      checkInTime: { 
        $gte: todayStart, 
        $lt: todayEnd 
      }
    });

    if (existingAttendance) {
      return NextResponse.json({ 
        success: false, 
        message: "Already checked in for today." 
      }, { status: 400 });
    }

    // Create new attendance
    const attendanceData = {
      shift: shiftId,
      checkInTime: now,
      checkInLocation: location || null,
      status: 'present'
    };

    // ✅ FIXED: Assign to correct field based on userType
    if (userType === 'agent') {
      attendanceData.agent = userId;
    } else {
      attendanceData.user = userId;
    }

    const attendance = new Attendance(attendanceData);
    await attendance.save();

    // Populate and return
    const populated = await Attendance.findById(attendance._id)
      .populate("user", "firstName lastName email")
      .populate("agent", "agentName agentId email")
      .populate("shift", "name startTime endTime hours days")
      // .populate("manager", "firstName lastName email");

    return NextResponse.json({ 
      success: true, 
      message: "Checked in successfully!", 
      data: populated 
    });

  } catch (error) {
    console.error("POST /api/attendance/checkin error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}