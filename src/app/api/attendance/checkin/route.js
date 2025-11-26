// app/api/attendance/checkin/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";
import Shift from "@/Models/Shift";
import Agent from "@/Models/Agent";
import { verifyToken, getUserIdFromToken } from "@/lib/jwt";

function parseShiftDateTime(baseDate, timeStr) {
  const [hh, mm] = timeStr.split(":").map(Number);
  const dt = new Date(baseDate);
  dt.setHours(hh, mm, 0, 0);
  return dt;
}

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

    console.log('🔍 Check-in Request:', {
      userId,
      shiftId,
      now: now.toLocaleString(),
      todayStart: todayStart.toLocaleString(),
      todayEnd: todayEnd.toLocaleString()
    });

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

    // Get shift details for timing calculation
    const shift = await Shift.findById(shiftId);
    if (!shift) {
      return NextResponse.json({ 
        success: false, 
        message: "Shift not found" 
      }, { status: 404 });
    }

    // ✅ FIXED: PROPER LATE CALCULATION
    let isLate = false;
    let lateMinutes = 0;
    
    const shiftStartTime = parseShiftDateTime(todayStart, shift.startTime);
    
    console.log('🕒 Timing Comparison:', {
      now: now.toLocaleString(),
      shiftStart: shiftStartTime.toLocaleString(),
      shiftStartTime: shift.startTime
    });

    // Check if current time is after shift start time
    if (now > shiftStartTime) {
      isLate = true;
      lateMinutes = Math.floor((now - shiftStartTime) / (1000 * 60)); // Convert to minutes
      console.log('⏰ Late Calculation:', {
        isLate,
        lateMinutes,
        timeDifference: now - shiftStartTime
      });
    }

    // Create new attendance
    const attendanceData = {
      shift: shiftId,
      checkInTime: now,
      checkInLocation: location || null,
      status: 'present',
      isLate: isLate,
      lateMinutes: lateMinutes
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
      .populate("shift", "name startTime endTime hours days");

    console.log('✅ Check-in Successful:', {
      attendanceId: populated._id,
      checkInTime: populated.checkInTime,
      isLate: populated.isLate,
      lateMinutes: populated.lateMinutes
    });

    let successMessage = "Checked in successfully!";
    if (isLate) {
      successMessage = `Checked in successfully! (Late by ${lateMinutes} minutes)`;
    }

    return NextResponse.json({ 
      success: true, 
      message: successMessage, 
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