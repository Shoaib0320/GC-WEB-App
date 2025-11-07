// // app/api/attendance/checkin/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/lib/mongodb";
// import Attendance from "@/Models/Attendance";
// import Shift from "@/Models/Shift";
// import Holiday from "@/Models/Holiday";
// import WeeklyOff from "@/Models/WeeklyOff";
// import Agent from "@/Models/Agent";
// import { verifyToken, getUserIdFromToken } from "@/lib/jwt";
// import { 
//   isHoliday, 
//   isWeeklyOff, 
//   isShiftDay, 
//   parseShiftDateTime, 
//   getTimeDifferenceInMinutes,
//   getTodayDateRange 
// } from "@/lib/attendanceUtils";

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

//     if (!shiftId) {
//       return NextResponse.json({ 
//         success: false, 
//         message: "Shift ID is required" 
//       }, { status: 400 });
//     }

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

//     const { todayStart, todayEnd, now } = getTodayDateRange();

//     console.log('🔍 Check-in Request Details:', {
//       userId,
//       userType,
//       shiftId,
//       currentTime: now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
//       todayStart: todayStart.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
//     });

//     // Step 1: Check for existing attendance
//     let query = {};
    
//     if (userType === 'agent') {
//       query.agent = userId;
//     } else {
//       query.user = userId;
//     }
    
//     query.date = { $gte: todayStart, $lt: todayEnd };

//     const existingAttendance = await Attendance.findOne(query);

//     if (existingAttendance) {
//       return NextResponse.json({ 
//         success: false, 
//         message: "Already checked in for today." 
//       }, { status: 400 });
//     }

//     // Step 2: Check if today is holiday
//     const holiday = await isHoliday(now);
//     if (holiday) {
//       const holidayAttendance = new Attendance({
//         [userType === 'agent' ? 'agent' : 'user']: userId,
//         shift: shiftId,
//         date: todayStart,
//         status: 'holiday',
//         notes: `Auto-marked: ${holiday.name}`
//       });
//       await holidayAttendance.save();

//       return NextResponse.json({ 
//         success: true, 
//         message: `Today is holiday: ${holiday.name}. Attendance auto-marked.`,
//         data: holidayAttendance,
//         isHoliday: true
//       });
//     }

//     // Step 3: Check if today is weekly off
//     const weeklyOff = await isWeeklyOff(now);
//     if (weeklyOff) {
//       const weeklyOffAttendance = new Attendance({
//         [userType === 'agent' ? 'agent' : 'user']: userId,
//         shift: shiftId,
//         date: todayStart,
//         status: 'weekly_off',
//         notes: `Auto-marked: ${weeklyOff.name}`
//       });
//       await weeklyOffAttendance.save();

//       return NextResponse.json({ 
//         success: true, 
//         message: `Today is weekly off: ${weeklyOff.name}. Attendance auto-marked.`,
//         data: weeklyOffAttendance,
//         isWeeklyOff: true
//       });
//     }

//     // Step 4: Check if shift is assigned for today
//     const isTodayShiftDay = await isShiftDay(shiftId, now);
//     if (!isTodayShiftDay) {
//       return NextResponse.json({ 
//         success: false, 
//         message: "No shift assigned for today." 
//       }, { status: 400 });
//     }

//     // Step 5: Get shift details for late calculation
//     const shift = await Shift.findById(shiftId);
//     if (!shift) {
//       return NextResponse.json({ 
//         success: false, 
//         message: "Shift not found" 
//       }, { status: 404 });
//     }

//     console.log('🕒 Shift Details:', {
//       shiftName: shift.name,
//       startTime: shift.startTime,
//       endTime: shift.endTime,
//       days: shift.days
//     });

//     // Step 6: PROPER LATE CALCULATION - FIXED
//     const shiftStartTime = parseShiftDateTime(todayStart, shift.startTime);
//     const gracePeriod = 15; // 15 minutes grace period
    
//     let isLate = false;
//     let lateMinutes = 0;
//     let status = 'present';

//     // Debug timing information
//     console.log('⏰ Timing Comparison:', {
//       currentTime: now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
//       shiftStartTime: shiftStartTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
//       currentTimeISO: now.toISOString(),
//       shiftStartTimeISO: shiftStartTime.toISOString(),
//       currentTimeMs: now.getTime(),
//       shiftStartTimeMs: shiftStartTime.getTime()
//     });

//     // Calculate time difference
//     const timeDifferenceMs = now.getTime() - shiftStartTime.getTime();
//     const timeDifferenceMinutes = Math.floor(timeDifferenceMs / (1000 * 60));

//     console.log('📊 Time Difference Calculation:', {
//       timeDifferenceMs,
//       timeDifferenceMinutes,
//       gracePeriod
//     });

//     // Check if late (after grace period)
//     if (timeDifferenceMinutes > gracePeriod) {
//       isLate = true;
//       lateMinutes = timeDifferenceMinutes;
//       status = 'late';
      
//       console.log('⚠️ LATE DETECTED:', {
//         lateMinutes,
//         gracePeriod,
//         status
//       });
//     } else if (timeDifferenceMinutes > 0) {
//       // Within grace period
//       console.log('✅ Within grace period:', {
//         minutesAfterStart: timeDifferenceMinutes,
//         gracePeriod
//       });
//     } else {
//       // Early or on time
//       console.log('🎉 On time or early:', {
//         minutesBeforeStart: Math.abs(timeDifferenceMinutes)
//       });
//     }

//     // Step 7: Create attendance record
//     const attendanceData = {
//       [userType === 'agent' ? 'agent' : 'user']: userId,
//       shift: shiftId,
//       date: todayStart,
//       checkInTime: now,
//       checkInLocation: location || null,
//       status: status,
//       isLate: isLate,
//       lateMinutes: lateMinutes
//     };

//     const attendance = new Attendance(attendanceData);
//     await attendance.save();

//     // Step 8: Populate and return response
//     const populated = await Attendance.findById(attendance._id)
//       .populate(userType === 'agent' ? "agent" : "user", "name email userId")
//       .populate("shift", "name startTime endTime hours days");

//     console.log('✅ Check-in Final Result:', {
//       attendanceId: populated._id,
//       checkInTime: populated.checkInTime?.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
//       status: populated.status,
//       isLate: populated.isLate,
//       lateMinutes: populated.lateMinutes,
//       shiftStartTime: shift.startTime
//     });

//     // Generate appropriate message
//     let successMessage = "Checked in successfully! ✅";
    
//     if (isLate) {
//       const hours = Math.floor(lateMinutes / 60);
//       const minutes = lateMinutes % 60;
      
//       if (hours > 0) {
//         successMessage = `Checked in successfully! ⚠️ (Late by ${hours}h ${minutes}m)`;
//       } else {
//         successMessage = `Checked in successfully! ⚠️ (Late by ${minutes} minutes)`;
//       }
//     } else if (timeDifferenceMinutes > 0) {
//       successMessage = `Checked in successfully! ✅ (Within grace period)`;
//     } else {
//       successMessage = `Checked in successfully! 🎉 (On time)`;
//     }

//     return NextResponse.json({ 
//       success: true, 
//       message: successMessage, 
//       data: populated,
//       lateInfo: {
//         isLate,
//         lateMinutes,
//         shiftStartTime: shift.startTime,
//         checkInTime: now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
//       }
//     });

//   } catch (error) {
//     console.error("POST /api/attendance/checkin error:", error);
//     return NextResponse.json({ 
//       success: false, 
//       message: error.message 
//     }, { status: 500 });
//   }
// }




// app/api/attendance/checkin/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";
import Shift from "@/Models/Shift";
import Holiday from "@/Models/Holiday";
import WeeklyOff from "@/Models/WeeklyOff";
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
      checkInTime: now,
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
