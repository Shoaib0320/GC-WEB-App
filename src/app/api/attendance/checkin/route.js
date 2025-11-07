// // app/api/attendance/checkin/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/lib/mongodb";
// import Attendance from "@/Models/Attendance";
// import Shift from "@/Models/Shift";
// import { verifyToken, getUserIdFromToken } from "@/lib/jwt";

// function parseShiftDateTime(baseDate, timeStr) {
//   const [hh, mm] = timeStr.split(":").map(Number);
//   const dt = new Date(baseDate);
//   dt.setHours(hh, mm, 0, 0);
//   return dt;
// }

// export async function POST(request) {
//   try {
//     await connectDB();

//     // Authentication
//     const authHeader = request.headers.get('authorization');
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
//     }
    
//     const token = authHeader.replace('Bearer ', '');
//     const decoded = verifyToken(token);
    
//     if (!decoded) {
//       return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
//     }

//     const body = await request.json();
//     const { shiftId, location, userType = 'agent' } = body;

//     // Get user ID from token
//     let userId;
//     try {
//       userId = getUserIdFromToken(decoded);
//       console.log('🔍 Check-in User ID:', userId);
//     } catch (error) {
//       return NextResponse.json({ 
//         success: false, 
//         message: "Invalid token data: " + error.message 
//       }, { status: 401 });
//     }

//     // Today's date range
//     const now = new Date();
//     const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//     const todayEnd = new Date(todayStart);
//     todayEnd.setDate(todayEnd.getDate() + 1);

//     console.log('🔍 Check-in Request Details:', {
//       userId,
//       userType,
//       shiftId,
//       todayStart: todayStart.toISOString(),
//       todayEnd: todayEnd.toISOString()
//     });

//     // Check for existing attendance
//     let query = {};
    
//     if (userType === 'agent') {
//       query.agent = userId;
//     } else {
//       query.user = userId;
//     }
    
//     query.checkInTime = { $gte: todayStart, $lt: todayEnd };

//     const existingAttendance = await Attendance.findOne(query);

//     if (existingAttendance) {
//       return NextResponse.json({ 
//         success: false, 
//         message: "Already checked in for today." 
//       }, { status: 400 });
//     }

//     // Get shift details
//     const shift = await Shift.findById(shiftId);
//     if (!shift) {
//       return NextResponse.json({ 
//         success: false, 
//         message: "Shift not found" 
//       }, { status: 404 });
//     }

//     // Late calculation
//     let isLate = false;
//     let lateMinutes = 0;
    
//     const shiftStartTime = parseShiftDateTime(todayStart, shift.startTime);
    
//     if (now > shiftStartTime) {
//       isLate = true;
//       lateMinutes = Math.floor((now - shiftStartTime) / (1000 * 60));
//     }

//     // Create attendance
//     const attendanceData = {
//       shift: shiftId,
//       checkInTime: now,
//       checkInLocation: location || null,
//       status: 'present',
//       isLate: isLate,
//       lateMinutes: lateMinutes
//     };

//     // Assign to correct field
//     if (userType === 'agent') {
//       attendanceData.agent = userId;
//     } else {
//       attendanceData.user = userId;
//     }

//     const attendance = new Attendance(attendanceData);
//     await attendance.save();

//     // Populate and return
//     const populated = await Attendance.findById(attendance._id)
//       .populate("agent", "agentName agentId email")
//       .populate("shift", "name startTime endTime hours days");

//     console.log('✅ Check-in Successful:', {
//       attendanceId: populated._id,
//       agent: populated.agent,
//       checkInTime: populated.checkInTime,
//       isLate: populated.isLate,
//       lateMinutes: populated.lateMinutes
//     });

//     let successMessage = "Checked in successfully!";
//     if (isLate) {
//       successMessage = `Checked in successfully! (Late by ${lateMinutes} minutes)`;
//     }

//     return NextResponse.json({ 
//       success: true, 
//       message: successMessage, 
//       data: populated 
//     });

//   } catch (error) {
//     console.error("POST /api/attendance/checkin error:", error);
//     return NextResponse.json({ 
//       success: false, 
//       message: error.message 
//     }, { status: 500 });
//   }
// }








import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";
import Shift from "@/Models/Shift";
import Holiday from "@/Models/Holiday";
import WeeklyOff from "@/Models/WeeklyOff";
import Agent from "@/Models/Agent";
import { verifyToken, getUserIdFromToken } from "@/lib/jwt";
import { 
  isHoliday, 
  isWeeklyOff, 
  isShiftDay, 
  parseShiftDateTime, 
  getTimeDifferenceInMinutes,
  getTodayDateRange 
} from "@/lib/attendanceUtils";

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

    if (!shiftId) {
      return NextResponse.json({ 
        success: false, 
        message: "Shift ID is required" 
      }, { status: 400 });
    }

    // Get user ID from token
    let userId;
    try {
      userId = getUserIdFromToken(decoded);
      console.log('🔍 Check-in User ID:', userId);
    } catch (error) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid token data: " + error.message 
      }, { status: 401 });
    }

    const { todayStart, todayEnd, now } = getTodayDateRange();

    console.log('🔍 Check-in Request Details:', {
      userId,
      userType,
      shiftId,
      currentTime: now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      todayStart: todayStart.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    });

    // Step 1: Check for existing attendance
    let query = {};
    
    if (userType === 'agent') {
      query.agent = userId;
    } else {
      query.user = userId;
    }
    
    query.date = { $gte: todayStart, $lt: todayEnd };

    const existingAttendance = await Attendance.findOne(query);

    if (existingAttendance) {
      return NextResponse.json({ 
        success: false, 
        message: "Already checked in for today." 
      }, { status: 400 });
    }

    // Step 2: Check if today is holiday
    const holiday = await isHoliday(now);
    if (holiday) {
      const holidayAttendance = new Attendance({
        [userType === 'agent' ? 'agent' : 'user']: userId,
        shift: shiftId,
        date: todayStart,
        status: 'holiday',
        notes: `Auto-marked: ${holiday.name}`
      });
      await holidayAttendance.save();

      return NextResponse.json({ 
        success: true, 
        message: `Today is holiday: ${holiday.name}. Attendance auto-marked.`,
        data: holidayAttendance,
        isHoliday: true
      });
    }

    // Step 3: Check if today is weekly off
    const weeklyOff = await isWeeklyOff(now);
    if (weeklyOff) {
      const weeklyOffAttendance = new Attendance({
        [userType === 'agent' ? 'agent' : 'user']: userId,
        shift: shiftId,
        date: todayStart,
        status: 'weekly_off',
        notes: `Auto-marked: ${weeklyOff.name}`
      });
      await weeklyOffAttendance.save();

      return NextResponse.json({ 
        success: true, 
        message: `Today is weekly off: ${weeklyOff.name}. Attendance auto-marked.`,
        data: weeklyOffAttendance,
        isWeeklyOff: true
      });
    }

    // Step 4: Check if shift is assigned for today
    const isTodayShiftDay = await isShiftDay(shiftId, now);
    if (!isTodayShiftDay) {
      return NextResponse.json({ 
        success: false, 
        message: "No shift assigned for today." 
      }, { status: 400 });
    }

    // Step 5: Get shift details for late calculation
    const shift = await Shift.findById(shiftId);
    if (!shift) {
      return NextResponse.json({ 
        success: false, 
        message: "Shift not found" 
      }, { status: 404 });
    }

    console.log('🕒 Shift Details:', {
      shiftName: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      days: shift.days
    });

    // Step 6: PROPER LATE CALCULATION - FIXED
    const shiftStartTime = parseShiftDateTime(todayStart, shift.startTime);
    const gracePeriod = 15; // 15 minutes grace period
    
    let isLate = false;
    let lateMinutes = 0;
    let status = 'present';

    // Debug timing information
    console.log('⏰ Timing Comparison:', {
      currentTime: now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      shiftStartTime: shiftStartTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      currentTimeISO: now.toISOString(),
      shiftStartTimeISO: shiftStartTime.toISOString(),
      currentTimeMs: now.getTime(),
      shiftStartTimeMs: shiftStartTime.getTime()
    });

    // Calculate time difference
    const timeDifferenceMs = now.getTime() - shiftStartTime.getTime();
    const timeDifferenceMinutes = Math.floor(timeDifferenceMs / (1000 * 60));

    console.log('📊 Time Difference Calculation:', {
      timeDifferenceMs,
      timeDifferenceMinutes,
      gracePeriod
    });

    // Check if late (after grace period)
    if (timeDifferenceMinutes > gracePeriod) {
      isLate = true;
      lateMinutes = timeDifferenceMinutes;
      status = 'late';
      
      console.log('⚠️ LATE DETECTED:', {
        lateMinutes,
        gracePeriod,
        status
      });
    } else if (timeDifferenceMinutes > 0) {
      // Within grace period
      console.log('✅ Within grace period:', {
        minutesAfterStart: timeDifferenceMinutes,
        gracePeriod
      });
    } else {
      // Early or on time
      console.log('🎉 On time or early:', {
        minutesBeforeStart: Math.abs(timeDifferenceMinutes)
      });
    }

    // Step 7: Create attendance record
    const attendanceData = {
      [userType === 'agent' ? 'agent' : 'user']: userId,
      shift: shiftId,
      date: todayStart,
      checkInTime: now,
      checkInLocation: location || null,
      status: status,
      isLate: isLate,
      lateMinutes: lateMinutes
    };

    const attendance = new Attendance(attendanceData);
    await attendance.save();

    // Step 8: Populate and return response
    const populated = await Attendance.findById(attendance._id)
      .populate(userType === 'agent' ? "agent" : "user", "name email userId")
      .populate("shift", "name startTime endTime hours days");

    console.log('✅ Check-in Final Result:', {
      attendanceId: populated._id,
      checkInTime: populated.checkInTime?.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      status: populated.status,
      isLate: populated.isLate,
      lateMinutes: populated.lateMinutes,
      shiftStartTime: shift.startTime
    });

    // Generate appropriate message
    let successMessage = "Checked in successfully! ✅";
    
    if (isLate) {
      const hours = Math.floor(lateMinutes / 60);
      const minutes = lateMinutes % 60;
      
      if (hours > 0) {
        successMessage = `Checked in successfully! ⚠️ (Late by ${hours}h ${minutes}m)`;
      } else {
        successMessage = `Checked in successfully! ⚠️ (Late by ${minutes} minutes)`;
      }
    } else if (timeDifferenceMinutes > 0) {
      successMessage = `Checked in successfully! ✅ (Within grace period)`;
    } else {
      successMessage = `Checked in successfully! 🎉 (On time)`;
    }

    return NextResponse.json({ 
      success: true, 
      message: successMessage, 
      data: populated,
      lateInfo: {
        isLate,
        lateMinutes,
        shiftStartTime: shift.startTime,
        checkInTime: now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      }
    });

  } catch (error) {
    console.error("POST /api/attendance/checkin error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}