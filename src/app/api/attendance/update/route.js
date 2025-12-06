// import { NextResponse } from "next/server";
// import connectDB from "@/lib/mongodb";
// import Attendance from "@/Models/Attendance";
// import Holiday from "@/Models/Holiday";
// import WeeklyOff from "@/Models/WeeklyOff";
// import { verifyToken } from "@/lib/jwt";

// // Function to check if date is weekly off
// async function isWeeklyOff(date) {
//   const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
//   const weeklyOff = await WeeklyOff.findOne({ 
//     day: dayName, 
//     isActive: true 
//   });
//   return weeklyOff;
// }

// // Function to check if date is holiday
// async function isHoliday(date) {
//   const dateStart = new Date(date);
//   dateStart.setHours(0, 0, 0, 0);
//   const dateEnd = new Date(dateStart);
//   dateEnd.setDate(dateEnd.getDate() + 1);

//   const holiday = await Holiday.findOne({
//     $or: [
//       { date: { $gte: dateStart, $lt: dateEnd } },
//       { 
//         isRecurring: true,
//         $expr: {
//           $and: [
//             { $eq: [{ $month: "$date" }, date.getMonth() + 1] },
//             { $eq: [{ $dayOfMonth: "$date" }, date.getDate()] }
//           ]
//         }
//       }
//     ]
//   });
//   return holiday;
// }

// export async function PUT(request) {
//   try {
//     await connectDB();

//     const token = request.cookies.get("token")?.value;
//     if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

//     const decoded = verifyToken(token);
//     if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

//     const body = await request.json();
//     const { 
//       attendanceId, 
//       status, 
//       checkInTime, 
//       checkOutTime, 
//       notes,
//       leaveReason,
//       leaveType 
//     } = body;

//     if (!attendanceId) {
//       return NextResponse.json({ success: false, message: "Attendance ID is required" }, { status: 400 });
//     }

//     // Find existing attendance
//     const existingAttendance = await Attendance.findById(attendanceId)
//       .populate("user", "firstName lastName email")
//       .populate("agent", "agentName agentId email")
//       .populate("shift", "name startTime endTime");

//     if (!existingAttendance) {
//       return NextResponse.json({ success: false, message: "Attendance record not found" }, { status: 404 });
//     }

//     // Check if the date is holiday or weekly off - prevent editing
//     const attendanceDate = new Date(existingAttendance.createdAt);
//     const weeklyOff = await isWeeklyOff(attendanceDate);
//     const holiday = await isHoliday(attendanceDate);

//     if (holiday || weeklyOff) {
//       return NextResponse.json({ 
//         success: false, 
//         message: `Cannot edit attendance on ${holiday ? 'holiday' : 'weekly off'} days` 
//       }, { status: 400 });
//     }

//     // Update attendance data
//     const updateData = {
//       status,
//       notes: notes || existingAttendance.notes,
//       updatedAt: new Date()
//     };

//     // Handle check-in time
//     if (checkInTime !== undefined) {
//       if (checkInTime && checkInTime.trim() !== "") {
//         const checkInDateTime = new Date(`${existingAttendance.createdAt.toISOString().split('T')[0]}T${checkInTime}`);
//         if (!isNaN(checkInDateTime.getTime())) {
//           updateData.checkInTime = checkInDateTime;
//         }
//       } else {
//         updateData.checkInTime = null;
//       }
//     }

//     // Handle check-out time
//     if (checkOutTime !== undefined) {
//       if (checkOutTime && checkOutTime.trim() !== "") {
//         const checkOutDateTime = new Date(`${existingAttendance.createdAt.toISOString().split('T')[0]}T${checkOutTime}`);
//         if (!isNaN(checkOutDateTime.getTime())) {
//           updateData.checkOutTime = checkOutDateTime;
//         }
//       } else {
//         updateData.checkOutTime = null;
//       }
//     }

//     // Handle leave data
//     if (leaveReason !== undefined) {
//       updateData.leaveReason = leaveReason;
//     }
//     if (leaveType !== undefined) {
//       updateData.leaveType = leaveType;
//     }

//     // Calculate late minutes and overtime if check-in/out times are provided
//     if (existingAttendance.shift && (checkInTime || checkOutTime)) {
//       const shift = existingAttendance.shift;
      
//       // Calculate late minutes
//       if (checkInTime && shift.startTime) {
//         const checkInTimeObj = new Date(`${existingAttendance.createdAt.toISOString().split('T')[0]}T${checkInTime}`);
//         const shiftStartTime = new Date(`${existingAttendance.createdAt.toISOString().split('T')[0]}T${shift.startTime}`);
        
//         if (checkInTimeObj > shiftStartTime) {
//           const lateDiff = checkInTimeObj.getTime() - shiftStartTime.getTime();
//           updateData.lateMinutes = Math.round(lateDiff / (1000 * 60));
//           updateData.isLate = true;
//         } else {
//           updateData.lateMinutes = 0;
//           updateData.isLate = false;
//         }
//       }

//       // Calculate overtime minutes
//       if (checkOutTime && shift.endTime) {
//         const checkOutTimeObj = new Date(`${existingAttendance.createdAt.toISOString().split('T')[0]}T${checkOutTime}`);
//         const shiftEndTime = new Date(`${existingAttendance.createdAt.toISOString().split('T')[0]}T${shift.endTime}`);
        
//         if (checkOutTimeObj > shiftEndTime) {
//           const overtimeDiff = checkOutTimeObj.getTime() - shiftEndTime.getTime();
//           updateData.overtimeMinutes = Math.round(overtimeDiff / (1000 * 60));
//           updateData.isOvertime = true;
//         } else {
//           updateData.overtimeMinutes = 0;
//           updateData.isOvertime = false;
//         }
//       }
//     }

//     // Update the attendance record
//     const updatedAttendance = await Attendance.findByIdAndUpdate(
//       attendanceId,
//       updateData,
//       { new: true, runValidators: true }
//     ).populate("user", "firstName lastName email")
//      .populate("agent", "agentName agentId email")
//      .populate("shift", "name startTime endTime");

//     return NextResponse.json({ 
//       success: true, 
//       message: "Attendance updated successfully", 
//       data: updatedAttendance 
//     });
//   } catch (error) {
//     console.error("PUT /api/attendance/update error:", error);
//     return NextResponse.json({ 
//       success: false, 
//       message: error.message 
//     }, { status: 500 });
//   }
// }






import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";
import Holiday from "@/Models/Holiday";
import WeeklyOff from "@/Models/WeeklyOff";
import Shift from "@/Models/Shift";
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

// Function to calculate status based on shift times
function calculateStatusBasedOnShift(checkInTime, checkOutTime, shift, existingStatus) {
  const GRACE_MINUTES = 15;
  let status = existingStatus;
  let isLate = false;
  let lateMinutes = 0;
  let isEarlyCheckout = false;
  let earlyCheckoutMinutes = 0;
  let isOvertime = false;
  let overtimeMinutes = 0;
  
  // If no shift, return existing status
  if (!shift || !shift.startTime || !shift.endTime) {
    return { status, isLate, lateMinutes, isEarlyCheckout, earlyCheckoutMinutes, isOvertime, overtimeMinutes };
  }
  
  // Parse times
  const checkInDate = checkInTime ? new Date(checkInTime) : null;
  const checkOutDate = checkOutTime ? new Date(checkOutTime) : null;
  
  // Get base date from check-in time
  const baseDate = checkInDate || new Date();
  const dateString = baseDate.toISOString().split('T')[0];
  
  // Create shift start and end times for that day
  const shiftStart = new Date(`${dateString}T${shift.startTime}`);
  const shiftEnd = new Date(`${dateString}T${shift.endTime}`);
  
  // Handle night shifts (end time next day)
  if (shiftEnd <= shiftStart) {
    shiftEnd.setDate(shiftEnd.getDate() + 1);
  }
  
  // Calculate full shift duration
  const fullShiftMinutes = Math.floor((shiftEnd - shiftStart) / (1000 * 60));
  const halfShiftThreshold = fullShiftMinutes / 2;
  const halfShiftTime = new Date(shiftStart.getTime() + halfShiftThreshold * 60 * 1000);
  
  // Grace period cutoff
  const graceCutoff = new Date(shiftStart.getTime() + GRACE_MINUTES * 60 * 1000);
  
  // 1. Check check-in status
  if (checkInDate) {
    // If check-in after shift end => absent
    if (checkInDate > shiftEnd) {
      status = "absent";
    }
    // If check-in after half shift => half_day
    else if (checkInDate >= halfShiftTime) {
      status = "half_day";
    }
    // If check-in after grace period => late
    else if (checkInDate > graceCutoff) {
      status = "late";
      isLate = true;
      const minutesLate = Math.floor((checkInDate - shiftStart) / (1000 * 60));
      lateMinutes = Math.max(0, minutesLate - GRACE_MINUTES);
    }
    // Otherwise present
    else {
      status = "present";
    }
  }
  
  // 2. Check check-out status (only if check-out exists)
  if (checkOutDate) {
    // If check-out before shift end => early checkout
    if (checkOutDate < shiftEnd) {
      isEarlyCheckout = true;
      const minutesEarly = Math.floor((shiftEnd - checkOutDate) / (1000 * 60));
      earlyCheckoutMinutes = minutesEarly;
    }
    // If check-out after shift end => overtime
    else if (checkOutDate > shiftEnd) {
      isOvertime = true;
      const minutesOvertime = Math.floor((checkOutDate - shiftEnd) / (1000 * 60));
      overtimeMinutes = minutesOvertime;
    }
  }
  
  // 3. If both check-in and check-out exist, determine final status
  if (checkInDate && checkOutDate) {
    // Calculate working hours
    const workingMinutes = Math.floor((checkOutDate - checkInDate) / (1000 * 60));
    
    // If worked less than half shift => half_day
    if (workingMinutes < halfShiftThreshold && status !== "absent") {
      status = "half_day";
    }
  }
  
  return { status, isLate, lateMinutes, isEarlyCheckout, earlyCheckoutMinutes, isOvertime, overtimeMinutes };
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
      status: providedStatus, 
      checkInTime: providedCheckInTime, 
      checkOutTime: providedCheckOutTime, 
      notes,
      leaveReason,
      leaveType 
    } = body;

    if (!attendanceId) {
      return NextResponse.json({ success: false, message: "Attendance ID is required" }, { status: 400 });
    }

    // Find existing attendance with populated shift
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

    // Determine if admin wants to manually set status
    const adminManuallySettingStatus = providedStatus && providedStatus !== existingAttendance.status;
    
    // Calculate check-in and check-out dates
    let checkInDate = null;
    let checkOutDate = null;
    const baseDate = existingAttendance.date ? 
      new Date(existingAttendance.date) : 
      new Date(existingAttendance.createdAt);
    const dateString = baseDate.toISOString().split('T')[0];
    
    // Handle check-in time
    if (providedCheckInTime !== undefined && providedCheckInTime !== null) {
      if (providedCheckInTime.trim() !== "") {
        checkInDate = new Date(`${dateString}T${providedCheckInTime}:00`);
      } else {
        checkInDate = null;
      }
    } else if (existingAttendance.checkInTime) {
      checkInDate = new Date(existingAttendance.checkInTime);
    }
    
    // Handle check-out time
    if (providedCheckOutTime !== undefined && providedCheckOutTime !== null) {
      if (providedCheckOutTime.trim() !== "") {
        checkOutDate = new Date(`${dateString}T${providedCheckOutTime}:00`);
      } else {
        checkOutDate = null;
      }
    } else if (existingAttendance.checkOutTime) {
      checkOutDate = new Date(existingAttendance.checkOutTime);
    }
    
    // Calculate status based on shift if admin didn't manually set status
    let finalStatus = existingAttendance.status;
    let finalIsLate = existingAttendance.isLate;
    let finalLateMinutes = existingAttendance.lateMinutes;
    let finalIsEarlyCheckout = existingAttendance.isEarlyCheckout;
    let finalEarlyCheckoutMinutes = existingAttendance.earlyCheckoutMinutes;
    let finalIsOvertime = existingAttendance.isOvertime;
    let finalOvertimeMinutes = existingAttendance.overtimeMinutes;
    
    // Only auto-calculate if admin didn't manually set status
    if (!adminManuallySettingStatus && (providedCheckInTime !== undefined || providedCheckOutTime !== undefined)) {
      const calculated = calculateStatusBasedOnShift(
        checkInDate, 
        checkOutDate, 
        existingAttendance.shift, 
        existingAttendance.status
      );
      
      finalStatus = calculated.status;
      finalIsLate = calculated.isLate;
      finalLateMinutes = calculated.lateMinutes;
      finalIsEarlyCheckout = calculated.isEarlyCheckout;
      finalEarlyCheckoutMinutes = calculated.earlyCheckoutMinutes;
      finalIsOvertime = calculated.isOvertime;
      finalOvertimeMinutes = calculated.overtimeMinutes;
    } else if (adminManuallySettingStatus) {
      // Use admin provided status
      finalStatus = providedStatus;
      
      // Reset auto-calculated fields if admin manually sets status
      finalIsLate = false;
      finalLateMinutes = 0;
      finalIsEarlyCheckout = false;
      finalEarlyCheckoutMinutes = 0;
      finalIsOvertime = false;
      finalOvertimeMinutes = 0;
    }
    
    // Update attendance data
    const updateData = {
      status: finalStatus,
      isLate: finalIsLate,
      lateMinutes: finalLateMinutes,
      isEarlyCheckout: finalIsEarlyCheckout,
      earlyCheckoutMinutes: finalEarlyCheckoutMinutes,
      isOvertime: finalIsOvertime,
      overtimeMinutes: finalOvertimeMinutes,
      notes: notes !== undefined ? notes : existingAttendance.notes,
      updatedAt: new Date()
    };

    // Handle check-in time
    if (providedCheckInTime !== undefined) {
      if (checkInDate && !isNaN(checkInDate.getTime())) {
        updateData.checkInTime = checkInDate;
      } else {
        updateData.checkInTime = null;
      }
    }

    // Handle check-out time
    if (providedCheckOutTime !== undefined) {
      if (checkOutDate && !isNaN(checkOutDate.getTime())) {
        updateData.checkOutTime = checkOutDate;
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