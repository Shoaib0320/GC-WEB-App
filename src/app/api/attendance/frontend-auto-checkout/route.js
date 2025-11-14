// import { NextResponse } from "next/server";
// import connectDB from "@/lib/mongodb";
// import Attendance from "@/Models/Attendance";
// import { verifyToken, getUserIdFromToken } from "@/lib/jwt";
// import { 
//   parseShiftDateTime, 
//   getTimeDifferenceInMinutes,
//   getTodayDateRange 
// } from "@/lib/attendanceUtils";

// export async function POST(request) {
//   try {
//     await connectDB();

//     // 🔐 Authentication
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
//     const { attendanceId, userType = 'agent' } = body;

//     const userId = getUserIdFromToken(decoded);
//     const { todayStart, todayEnd, now } = getTodayDateRange();

//     console.log('🎯 Frontend Auto Checkout Request:', {
//       userId,
//       attendanceId,
//       currentTime: now.toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })
//     });

//     // Step 1: Find today's attendance
//     let attendance;
//     if (attendanceId) {
//       attendance = await Attendance.findById(attendanceId).populate("shift");
//     } else {
//       const query = {
//         date: { $gte: todayStart, $lt: todayEnd },
//       };

//       if (userType === 'agent') {
//         query.agent = userId;
//       } else {
//         query.user = userId;
//       }

//       attendance = await Attendance.findOne(query).populate("shift");
//     }

//     if (!attendance) {
//       return NextResponse.json({ 
//         success: false, 
//         message: "No attendance record found for today." 
//       }, { status: 400 });
//     }

//     if (!attendance.checkInTime) {
//       return NextResponse.json({ 
//         success: false, 
//         message: "No check-in found for today." 
//       }, { status: 400 });
//     }

//     if (attendance.checkOutTime) {
//       return NextResponse.json({ 
//         success: false, 
//         message: "Already checked-out." 
//       }, { status: 400 });
//     }

//     // Step 2: Check if shift has ended (Auto Checkout Condition)
//     if (attendance.shift && attendance.shift.endTime) {
//       const shiftEnded = hasShiftEnded(attendance.shift.endTime, now, "Asia/Karachi");
      
//       if (!shiftEnded) {
//         return NextResponse.json({ 
//           success: false, 
//           message: `Auto checkout not allowed yet. Shift ends at ${attendance.shift.endTime}` 
//         }, { status: 400 });
//       }
//     }

//     // Step 3: Perform Auto Checkout with Logic
//     const result = await performAutoCheckout(attendance, now);

//     return NextResponse.json({
//       success: true,
//       message: result.message,
//       data: result.attendance,
//       summary: {
//         workingHours: result.workingHours,
//         overtime: result.overtimeMinutes,
//         status: result.finalStatus
//       }
//     });

//   } catch (error) {
//     console.error("POST /api/attendance/frontend-auto-checkout error:", error);
//     return NextResponse.json({ 
//       success: false, 
//       message: error.message 
//     }, { status: 500 });
//   }
// }

// /**
//  * Auto Checkout Logic with Overtime & Half Day Calculation
//  */
// async function performAutoCheckout(attendance, currentTime) {
//   // Set check-out details
//   attendance.checkOutTime = currentTime;
//   attendance.checkOutLocation = 'Auto-checkout: Frontend Triggered';

//   // Calculate working hours
//   const totalWorkingMinutes = getTimeDifferenceInMinutes(attendance.checkInTime, currentTime);
//   attendance.totalWorkingMinutes = totalWorkingMinutes;

//   // Overtime and Early Check-out calculations
//   let isOvertime = false;
//   let overtimeMinutes = 0;
//   let isEarlyCheckout = false;
//   let earlyCheckoutMinutes = 0;

//   if (attendance.shift) {
//     const shift = attendance.shift;
//     const checkInDate = new Date(attendance.checkInTime);
    
//     const shiftStart = parseShiftDateTime(checkInDate, shift.startTime);
//     let shiftEnd = parseShiftDateTime(checkInDate, shift.endTime);
    
//     // Handle overnight shifts
//     if (shiftEnd <= shiftStart) {
//       shiftEnd.setDate(shiftEnd.getDate() + 1);
//     }

//     console.log('🕒 Auto Checkout Timing Analysis:', {
//       checkInTime: attendance.checkInTime.toLocaleString(),
//       checkOutTime: attendance.checkOutTime.toLocaleString(),
//       shiftStart: shiftStart.toLocaleString(),
//       shiftEnd: shiftEnd.toLocaleString(),
//       totalWorkingMinutes
//     });

//     // Overtime calculation
//     if (attendance.checkOutTime > shiftEnd) {
//       isOvertime = true;
//       overtimeMinutes = getTimeDifferenceInMinutes(shiftEnd, attendance.checkOutTime);
//       console.log('💰 Overtime Detected:', { overtimeMinutes });
//     }

//     // Early check-out calculation (for reference)
//     if (attendance.checkOutTime < shiftEnd) {
//       isEarlyCheckout = true;
//       earlyCheckoutMinutes = getTimeDifferenceInMinutes(attendance.checkOutTime, shiftEnd);
//       console.log('⚠️ Early Check-out:', { earlyCheckoutMinutes });
//     }
//   }

//   // Update attendance status based on working hours
//   let finalStatus = attendance.status;
  
//   // If worked less than 4 hours, mark as half day
//   const requiredMinutesForFullDay = 4 * 60; // 4 hours in minutes
//   if (totalWorkingMinutes < requiredMinutesForFullDay && totalWorkingMinutes > 0) {
//     finalStatus = 'half_day';
//     console.log('📊 Marked as Half Day:', { totalWorkingMinutes, requiredMinutesForFullDay });
//   }

//   // Update all calculated fields
//   attendance.isOvertime = isOvertime;
//   attendance.overtimeMinutes = overtimeMinutes;
//   attendance.isEarlyCheckout = isEarlyCheckout;
//   attendance.earlyCheckoutMinutes = earlyCheckoutMinutes;
//   attendance.status = finalStatus;
//   attendance.autoCheckedOut = true;
//   attendance.notes = `Auto checked-out via frontend at ${currentTime.toLocaleTimeString()}`;

//   await attendance.save();

//   // Populate the attendance
//   const populated = await Attendance.findById(attendance._id)
//     .populate(attendance.agent ? "agent" : "user", "name email userId")
//     .populate("shift", "name startTime endTime hours days");

//   console.log('✅ Frontend Auto Checkout Successful:', {
//     attendanceId: populated._id,
//     status: populated.status,
//     totalWorkingHours: (populated.totalWorkingMinutes / 60).toFixed(2),
//     overtime: populated.overtimeMinutes,
//     earlyCheckout: populated.earlyCheckoutMinutes
//   });

//   // Generate appropriate success message
//   const workingHours = (totalWorkingMinutes / 60).toFixed(1);
//   let message = `Auto checked-out successfully! ✅ (Total: ${workingHours} hours)`;
  
//   if (isOvertime) {
//     message = `Auto checked-out successfully! 🕒 (Overtime: ${overtimeMinutes} minutes, Total: ${workingHours} hours)`;
//   } else if (finalStatus === 'half_day') {
//     message = `Auto checked-out successfully! 📊 (Half Day: ${workingHours} hours)`;
//   }

//   return {
//     message,
//     attendance: populated,
//     workingHours,
//     overtimeMinutes,
//     finalStatus
//   };
// }

// /**
//  * Check if shift has ended
//  */
// function hasShiftEnded(shiftEndTime, currentTime, timezone = "Asia/Karachi") {
//   if (!shiftEndTime) return true;
  
//   try {
//     const [endHours, endMinutes] = shiftEndTime.split(':').map(Number);
    
//     // Convert to target timezone
//     const currentInTz = new Date(currentTime.toLocaleString("en-US", { timeZone: timezone }));
//     const shiftEnd = new Date(currentInTz);
//     shiftEnd.setHours(endHours, endMinutes, 0, 0);
    
//     const hasEnded = currentInTz > shiftEnd;
    
//     console.log(`⏰ Shift End Check for Auto Checkout:`, {
//       shiftEndTime,
//       currentTime: currentInTz.toLocaleTimeString(),
//       shiftEnd: shiftEnd.toLocaleTimeString(),
//       hasEnded
//     });
    
//     return hasEnded;
//   } catch (error) {
//     console.error('Error in shift end check:', error);
//     return true;
//   }
// }

// export async function GET(request) {
//   return NextResponse.json({ 
//     success: false, 
//     message: "Use POST method for auto checkout" 
//   }, { status: 405 });
// }





// /app/api/attendance/frontend-auto-checkout/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";
import { verifyToken, getUserIdFromToken } from "@/lib/jwt";
import { getTodayDateRange, performAutoCheckout, APP_TZ, hasShiftEndedSmart } from "@/lib/autoAttendanceService";
import moment from "moment-timezone";

export async function POST(request) {
  try {
    await connectDB();

    // Authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    const body = await request.json();
    const { attendanceId, userType = "agent" } = body;
    const userId = getUserIdFromToken(decoded);
    const { todayStart, todayEnd } = getTodayDateRange(APP_TZ);
    const now = moment().tz(APP_TZ).toDate();

    console.log("🎯 Frontend Auto Checkout Request:", { userId, attendanceId, now: now.toLocaleString("en-PK", { timeZone: APP_TZ }) });

    // Step: find attendance
    let attendance;
    if (attendanceId) {
      attendance = await Attendance.findById(attendanceId).populate("shift").populate("agent").populate("user");
      if (!attendance) {
        return NextResponse.json({ success: false, message: "Attendance not found" }, { status: 404 });
      }
    } else {
      const query = { date: { $gte: todayStart, $lt: todayEnd } };
      if (userType === "agent") query.agent = userId; else query.user = userId;
      attendance = await Attendance.findOne(query).populate("shift").populate("agent").populate("user");
      if (!attendance) {
        return NextResponse.json({ success: false, message: "No attendance record found for today." }, { status: 400 });
      }
    }

    if (!attendance.checkInTime) {
      return NextResponse.json({ success: false, message: "No check-in found for today." }, { status: 400 });
    }
    if (attendance.checkOutTime) {
      return NextResponse.json({ success: false, message: "Already checked-out." }, { status: 400 });
    }

    // Check shift end condition (if shift exists)
    if (attendance.shift && attendance.shift.endTime) {
      const shiftEnded = hasShiftEndedSmart(attendance.shift.endTime, now, APP_TZ);
      if (!shiftEnded) {
        return NextResponse.json({ success: false, message: `Auto checkout not allowed yet. Shift ends at ${attendance.shift.endTime}` }, { status: 400 });
      }
    }

    // Perform auto checkout (this will save attendance)
    const result = await performAutoCheckout(attendance, now);
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error || "Auto checkout failed" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.attendance,
      summary: {
        workingHours: result.workingHours,
        overtime: result.overtimeMinutes,
        status: result.finalStatus
      }
    });

  } catch (err) {
    console.error("POST /api/attendance/frontend-auto-checkout error:", err);
    return NextResponse.json({ success: false, message: err.message || String(err) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ success: false, message: "Use POST method for auto checkout" }, { status: 405 });
}
