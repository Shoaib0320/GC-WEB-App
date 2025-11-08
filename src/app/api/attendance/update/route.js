import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";
import Holiday from "@/Models/Holiday";
import WeeklyOff from "@/Models/WeeklyOff";
import { verifyToken } from "@/lib/jwt";

// Function to check if date is weekly off
async function isWeeklyOff(date) {
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const weeklyOff = await WeeklyOff.findOne({ 
    day: dayName, 
    isActive: true 
  });
  return weeklyOff;
}

// Function to check if date is holiday
async function isHoliday(date) {
  const dateStart = new Date(date);
  dateStart.setHours(0, 0, 0, 0);
  const dateEnd = new Date(dateStart);
  dateEnd.setDate(dateEnd.getDate() + 1);

  const holiday = await Holiday.findOne({
    $or: [
      { date: { $gte: dateStart, $lt: dateEnd } },
      { 
        isRecurring: true,
        $expr: {
          $and: [
            { $eq: [{ $month: "$date" }, date.getMonth() + 1] },
            { $eq: [{ $dayOfMonth: "$date" }, date.getDate()] }
          ]
        }
      }
    ]
  });
  return holiday;
}

export async function PUT(request) {
  try {
    await connectDB();

    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    const body = await request.json();
    const { 
      attendanceId, 
      status, 
      checkInTime, 
      checkOutTime, 
      notes,
      leaveReason,
      leaveType 
    } = body;

    if (!attendanceId) {
      return NextResponse.json({ success: false, message: "Attendance ID is required" }, { status: 400 });
    }

    // Find existing attendance
    const existingAttendance = await Attendance.findById(attendanceId)
      .populate("user", "firstName lastName email")
      .populate("agent", "agentName agentId email")
      .populate("shift", "name startTime endTime");

    if (!existingAttendance) {
      return NextResponse.json({ success: false, message: "Attendance record not found" }, { status: 404 });
    }

    // Check if the date is holiday or weekly off - prevent editing
    const attendanceDate = new Date(existingAttendance.createdAt);
    const weeklyOff = await isWeeklyOff(attendanceDate);
    const holiday = await isHoliday(attendanceDate);

    if (holiday || weeklyOff) {
      return NextResponse.json({ 
        success: false, 
        message: `Cannot edit attendance on ${holiday ? 'holiday' : 'weekly off'} days` 
      }, { status: 400 });
    }

    // Update attendance data
    const updateData = {
      status,
      notes: notes || existingAttendance.notes,
      updatedAt: new Date()
    };

    // Handle check-in time
    if (checkInTime !== undefined) {
      if (checkInTime && checkInTime.trim() !== "") {
        const checkInDateTime = new Date(`${existingAttendance.createdAt.toISOString().split('T')[0]}T${checkInTime}`);
        if (!isNaN(checkInDateTime.getTime())) {
          updateData.checkInTime = checkInDateTime;
        }
      } else {
        updateData.checkInTime = null;
      }
    }

    // Handle check-out time
    if (checkOutTime !== undefined) {
      if (checkOutTime && checkOutTime.trim() !== "") {
        const checkOutDateTime = new Date(`${existingAttendance.createdAt.toISOString().split('T')[0]}T${checkOutTime}`);
        if (!isNaN(checkOutDateTime.getTime())) {
          updateData.checkOutTime = checkOutDateTime;
        }
      } else {
        updateData.checkOutTime = null;
      }
    }

    // Handle leave data
    if (leaveReason !== undefined) {
      updateData.leaveReason = leaveReason;
    }
    if (leaveType !== undefined) {
      updateData.leaveType = leaveType;
    }

    // Calculate late minutes and overtime if check-in/out times are provided
    if (existingAttendance.shift && (checkInTime || checkOutTime)) {
      const shift = existingAttendance.shift;
      
      // Calculate late minutes
      if (checkInTime && shift.startTime) {
        const checkInTimeObj = new Date(`${existingAttendance.createdAt.toISOString().split('T')[0]}T${checkInTime}`);
        const shiftStartTime = new Date(`${existingAttendance.createdAt.toISOString().split('T')[0]}T${shift.startTime}`);
        
        if (checkInTimeObj > shiftStartTime) {
          const lateDiff = checkInTimeObj.getTime() - shiftStartTime.getTime();
          updateData.lateMinutes = Math.round(lateDiff / (1000 * 60));
          updateData.isLate = true;
        } else {
          updateData.lateMinutes = 0;
          updateData.isLate = false;
        }
      }

      // Calculate overtime minutes
      if (checkOutTime && shift.endTime) {
        const checkOutTimeObj = new Date(`${existingAttendance.createdAt.toISOString().split('T')[0]}T${checkOutTime}`);
        const shiftEndTime = new Date(`${existingAttendance.createdAt.toISOString().split('T')[0]}T${shift.endTime}`);
        
        if (checkOutTimeObj > shiftEndTime) {
          const overtimeDiff = checkOutTimeObj.getTime() - shiftEndTime.getTime();
          updateData.overtimeMinutes = Math.round(overtimeDiff / (1000 * 60));
          updateData.isOvertime = true;
        } else {
          updateData.overtimeMinutes = 0;
          updateData.isOvertime = false;
        }
      }
    }

    // Update the attendance record
    const updatedAttendance = await Attendance.findByIdAndUpdate(
      attendanceId,
      updateData,
      { new: true, runValidators: true }
    ).populate("user", "firstName lastName email")
     .populate("agent", "agentName agentId email")
     .populate("shift", "name startTime endTime");

    return NextResponse.json({ 
      success: true, 
      message: "Attendance updated successfully", 
      data: updatedAttendance 
    });
  } catch (error) {
    console.error("PUT /api/attendance/update error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}