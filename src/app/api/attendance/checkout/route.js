// // app/api/attendance/checkout/route.js
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
//     const { attendanceId, location, userType = 'agent' } = body;

//     // Get user ID from token
//     let userId;
//     try {
//       userId = getUserIdFromToken(decoded);
//       console.log('🔍 Check-out User ID:', userId);
//     } catch (error) {
//       return NextResponse.json({ 
//         success: false, 
//         message: "Invalid token data: " + error.message 
//       }, { status: 401 });
//     }

//     const now = new Date();
//     const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//     const todayEnd = new Date(todayStart);
//     todayEnd.setDate(todayEnd.getDate() + 1);

//     console.log('🔍 Check-out Request:', {
//       userId,
//       attendanceId,
//       now: now.toLocaleString()
//     });

//     let attendance;
//     if (attendanceId) {
//       attendance = await Attendance.findById(attendanceId).populate("shift");
//     } else {
//       const query = {
//         checkInTime: { $gte: todayStart, $lt: todayEnd },
//       };

//       if (userType === 'agent') {
//         query.agent = userId;
//       } else {
//         query.user = userId;
//       }

//       attendance = await Attendance.findOne(query).populate("shift");
//     }

//     if (!attendance || !attendance.checkInTime) {
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

//     attendance.checkOutTime = now;
//     attendance.checkOutLocation = location || null;

//     // Overtime calculation
//     const checkInDate = new Date(attendance.checkInTime);
//     const shift = await Shift.findById(attendance.shift);
    
//     if (shift) {
//       const shiftStart = parseShiftDateTime(checkInDate, shift.startTime);
//       let shiftEnd = parseShiftDateTime(checkInDate, shift.endTime);
      
//       if (shiftEnd <= shiftStart) {
//         shiftEnd.setDate(shiftEnd.getDate() + 1);
//       }

//       console.log('🕒 Overtime Calculation:', {
//         checkInTime: attendance.checkInTime,
//         checkOutTime: attendance.checkOutTime,
//         shiftStart: shiftStart.toLocaleString(),
//         shiftEnd: shiftEnd.toLocaleString()
//       });

//       if (attendance.checkOutTime > shiftEnd) {
//         const diffMs = attendance.checkOutTime.getTime() - shiftEnd.getTime();
//         const diffMin = Math.floor(diffMs / (1000 * 60));
//         attendance.isOvertime = true;
//         attendance.overtimeMinutes = diffMin;
        
//         console.log('💰 Overtime Detected:', {
//           overtimeMinutes: diffMin
//         });
//       } else {
//         attendance.isOvertime = false;
//         attendance.overtimeMinutes = 0;
//       }
//     }

//     await attendance.save();

//     const populated = await Attendance.findById(attendance._id)
//       .populate("agent", "agentName agentId email")
//       .populate("shift", "name startTime endTime hours days");

//     let successMessage = "Checked-out successfully";
//     if (attendance.isOvertime) {
//       successMessage = `Checked-out successfully (Overtime: ${attendance.overtimeMinutes} minutes)`;
//     }

//     console.log('✅ Check-out Successful:', {
//       attendanceId: populated._id,
//       checkInTime: populated.checkInTime,
//       checkOutTime: populated.checkOutTime,
//       overtime: populated.overtimeMinutes
//     });

//     return NextResponse.json({ 
//       success: true, 
//       message: successMessage, 
//       data: populated 
//     });

//   } catch (error) {
//     console.error("POST /api/attendance/checkout error:", error);
//     return NextResponse.json({ 
//       success: false, 
//       message: error.message 
//     }, { status: 500 });
//   }
// }




// app/api/attendance/checkout/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";
import Shift from "@/Models/Shift";
import Holiday from "@/Models/Holiday";
import WeeklyOff from "@/Models/WeeklyOff";
import Agent from "@/Models/Agent";
import User from "@/Models/User";
import { verifyToken, getUserIdFromToken } from "@/lib/jwt";
import { 
  parseShiftDateTime, 
  getTimeDifferenceInMinutes,
  getTodayDateRange 
} from "@/lib/attendanceUtils";

export async function POST(request) {
  try {
    await connectDB();

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
    const { attendanceId, location, userType = 'agent' } = body;

    // Get user ID from token
    let userId;
    try {
      userId = getUserIdFromToken(decoded);
      console.log('🔍 Check-out User ID:', userId);
    } catch (error) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid token data: " + error.message 
      }, { status: 401 });
    }

    const { todayStart, todayEnd, now } = getTodayDateRange();

    console.log('🔍 Check-out Request:', {
      userId,
      attendanceId,
      currentTime: now.toLocaleString()
    });

    // Step 1: Find today's attendance
    let attendance;
    if (attendanceId) {
      attendance = await Attendance.findById(attendanceId).populate("shift");
    } else {
      const query = {
        date: { $gte: todayStart, $lt: todayEnd },
      };

      if (userType === 'agent') {
        query.agent = userId;
      } else {
        query.user = userId;
      }

      attendance = await Attendance.findOne(query).populate("shift");
    }

    if (!attendance) {
      return NextResponse.json({ 
        success: false, 
        message: "No attendance record found for today." 
      }, { status: 400 });
    }

    if (!attendance.checkInTime) {
      return NextResponse.json({ 
        success: false, 
        message: "No check-in found for today." 
      }, { status: 400 });
    }

    if (attendance.checkOutTime) {
      return NextResponse.json({ 
        success: false, 
        message: "Already checked-out." 
      }, { status: 400 });
    }

    // Prevent check-out on same day if shift spans multiple days
    const checkInDate = new Date(attendance.checkInTime);
    const isSameDay = checkInDate.getDate() === now.getDate() && 
                     checkInDate.getMonth() === now.getMonth() && 
                     checkInDate.getFullYear() === now.getFullYear();

    if (!isSameDay) {
      return NextResponse.json({ 
        success: false, 
        message: "Can only check-out on the same day as check-in." 
      }, { status: 400 });
    }

    // Step 2: Set check-out details
    // attendance.checkOutTime = now;
    attendance.checkOutTime = new Date();
    attendance.checkOutLocation = location || null;

    // Step 3: Calculate working hours
    const totalWorkingMinutes = getTimeDifferenceInMinutes(attendance.checkInTime, now);
    attendance.totalWorkingMinutes = totalWorkingMinutes;

    // Step 4: Overtime and Early Check-out calculations
    let isOvertime = false;
    let overtimeMinutes = 0;
    let isEarlyCheckout = false;
    let earlyCheckoutMinutes = 0;

    if (attendance.shift) {
      const shift = attendance.shift;
      const checkInDate = new Date(attendance.checkInTime);
      
      const shiftStart = parseShiftDateTime(checkInDate, shift.startTime);
      let shiftEnd = parseShiftDateTime(checkInDate, shift.endTime);
      
      // Handle overnight shifts
      if (shiftEnd <= shiftStart) {
        shiftEnd.setDate(shiftEnd.getDate() + 1);
      }

      console.log('🕒 Shift Timing Analysis:', {
        checkInTime: attendance.checkInTime.toLocaleString(),
        checkOutTime: attendance.checkOutTime.toLocaleString(),
        shiftStart: shiftStart.toLocaleString(),
        shiftEnd: shiftEnd.toLocaleString(),
        totalWorkingMinutes
      });

      // Overtime calculation
      if (attendance.checkOutTime > shiftEnd) {
        isOvertime = true;
        overtimeMinutes = getTimeDifferenceInMinutes(shiftEnd, attendance.checkOutTime);
        console.log('💰 Overtime Detected:', { overtimeMinutes });
      }

      // Early check-out calculation
      if (attendance.checkOutTime < shiftEnd) {
        isEarlyCheckout = true;
        earlyCheckoutMinutes = getTimeDifferenceInMinutes(attendance.checkOutTime, shiftEnd);
        console.log('⚠️ Early Check-out:', { earlyCheckoutMinutes });
      }
    }

    // Step 5: Update attendance status based on working hours
    let finalStatus = attendance.status;
    
    // If worked less than 4 hours, mark as half day
    const requiredMinutesForFullDay = 4 * 60; // 4 hours in minutes
    if (totalWorkingMinutes < requiredMinutesForFullDay && totalWorkingMinutes > 0) {
      finalStatus = 'half_day';
      console.log('📊 Marked as Half Day:', { totalWorkingMinutes, requiredMinutesForFullDay });
    }

    // Update all calculated fields
    attendance.isOvertime = isOvertime;
    attendance.overtimeMinutes = overtimeMinutes;
    attendance.isEarlyCheckout = isEarlyCheckout;
    attendance.earlyCheckoutMinutes = earlyCheckoutMinutes;
    attendance.status = finalStatus;

    await attendance.save();

    // Step 6: Populate and return response
    const populated = await Attendance.findById(attendance._id)
      .populate(userType === 'agent' ? "agent" : "user", "name email userId")
      .populate("shift", "name startTime endTime hours days");

    console.log('✅ Check-out Successful:', {
      attendanceId: populated._id,
      status: populated.status,
      totalWorkingHours: (populated.totalWorkingMinutes / 60).toFixed(2),
      overtime: populated.overtimeMinutes,
      earlyCheckout: populated.earlyCheckoutMinutes
    });

    // Generate appropriate success message
    let successMessage = "Checked-out successfully! ✅";
    const workingHours = (totalWorkingMinutes / 60).toFixed(1);
    
    if (isOvertime) {
      successMessage = `Checked-out successfully! 🕒 (Overtime: ${overtimeMinutes} minutes, Total: ${workingHours} hours)`;
    } else if (isEarlyCheckout) {
      successMessage = `Checked-out successfully! ⚠️ (Early by ${earlyCheckoutMinutes} minutes, Total: ${workingHours} hours)`;
    } else if (finalStatus === 'half_day') {
      successMessage = `Checked-out successfully! 📊 (Half Day: ${workingHours} hours)`;
    } else {
      successMessage = `Checked-out successfully! ✅ (Total: ${workingHours} hours)`;
    }

    return NextResponse.json({ 
      success: true, 
      message: successMessage, 
      data: populated 
    });

  } catch (error) {
    console.error("POST /api/attendance/checkout error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}