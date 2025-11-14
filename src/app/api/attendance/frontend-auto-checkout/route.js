// // import { NextResponse } from "next/server";
// // import connectDB from "@/lib/mongodb";
// // import Attendance from "@/Models/Attendance";
// // import { verifyToken, getUserIdFromToken } from "@/lib/jwt";
// // import { 
// //   parseShiftDateTime, 
// //   getTimeDifferenceInMinutes,
// //   getTodayDateRange 
// // } from "@/lib/attendanceUtils";

// // export async function POST(request) {
// //   try {
// //     await connectDB();

// //     // 🔐 Authentication
// //     const authHeader = request.headers.get('authorization');
// //     if (!authHeader || !authHeader.startsWith('Bearer ')) {
// //       return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
// //     }
    
// //     const token = authHeader.replace('Bearer ', '');
// //     const decoded = verifyToken(token);
    
// //     if (!decoded) {
// //       return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
// //     }

// //     const body = await request.json();
// //     const { attendanceId, userType = 'agent' } = body;

// //     const userId = getUserIdFromToken(decoded);
// //     const { todayStart, todayEnd, now } = getTodayDateRange();

// //     console.log('🎯 Frontend Auto Checkout Request:', {
// //       userId,
// //       attendanceId,
// //       currentTime: now.toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })
// //     });

// //     // Step 1: Find today's attendance
// //     let attendance;
// //     if (attendanceId) {
// //       attendance = await Attendance.findById(attendanceId).populate("shift");
// //     } else {
// //       const query = {
// //         date: { $gte: todayStart, $lt: todayEnd },
// //       };

// //       if (userType === 'agent') {
// //         query.agent = userId;
// //       } else {
// //         query.user = userId;
// //       }

// //       attendance = await Attendance.findOne(query).populate("shift");
// //     }

// //     if (!attendance) {
// //       return NextResponse.json({ 
// //         success: false, 
// //         message: "No attendance record found for today." 
// //       }, { status: 400 });
// //     }

// //     if (!attendance.checkInTime) {
// //       return NextResponse.json({ 
// //         success: false, 
// //         message: "No check-in found for today." 
// //       }, { status: 400 });
// //     }

// //     if (attendance.checkOutTime) {
// //       return NextResponse.json({ 
// //         success: false, 
// //         message: "Already checked-out." 
// //       }, { status: 400 });
// //     }

// //     // Step 2: Check if shift has ended (Auto Checkout Condition)
// //     if (attendance.shift && attendance.shift.endTime) {
// //       const shiftEnded = hasShiftEnded(attendance.shift.endTime, now, "Asia/Karachi");
      
// //       if (!shiftEnded) {
// //         return NextResponse.json({ 
// //           success: false, 
// //           message: `Auto checkout not allowed yet. Shift ends at ${attendance.shift.endTime}` 
// //         }, { status: 400 });
// //       }
// //     }

// //     // Step 3: Perform Auto Checkout with Logic
// //     const result = await performAutoCheckout(attendance, now);

// //     return NextResponse.json({
// //       success: true,
// //       message: result.message,
// //       data: result.attendance,
// //       summary: {
// //         workingHours: result.workingHours,
// //         overtime: result.overtimeMinutes,
// //         status: result.finalStatus
// //       }
// //     });

// //   } catch (error) {
// //     console.error("POST /api/attendance/frontend-auto-checkout error:", error);
// //     return NextResponse.json({ 
// //       success: false, 
// //       message: error.message 
// //     }, { status: 500 });
// //   }
// // }

// // /**
// //  * Auto Checkout Logic with Overtime & Half Day Calculation
// //  */
// // async function performAutoCheckout(attendance, currentTime) {
// //   // Set check-out details
// //   attendance.checkOutTime = currentTime;
// //   attendance.checkOutLocation = 'Auto-checkout: Frontend Triggered';

// //   // Calculate working hours
// //   const totalWorkingMinutes = getTimeDifferenceInMinutes(attendance.checkInTime, currentTime);
// //   attendance.totalWorkingMinutes = totalWorkingMinutes;

// //   // Overtime and Early Check-out calculations
// //   let isOvertime = false;
// //   let overtimeMinutes = 0;
// //   let isEarlyCheckout = false;
// //   let earlyCheckoutMinutes = 0;

// //   if (attendance.shift) {
// //     const shift = attendance.shift;
// //     const checkInDate = new Date(attendance.checkInTime);
    
// //     const shiftStart = parseShiftDateTime(checkInDate, shift.startTime);
// //     let shiftEnd = parseShiftDateTime(checkInDate, shift.endTime);
    
// //     // Handle overnight shifts
// //     if (shiftEnd <= shiftStart) {
// //       shiftEnd.setDate(shiftEnd.getDate() + 1);
// //     }

// //     console.log('🕒 Auto Checkout Timing Analysis:', {
// //       checkInTime: attendance.checkInTime.toLocaleString(),
// //       checkOutTime: attendance.checkOutTime.toLocaleString(),
// //       shiftStart: shiftStart.toLocaleString(),
// //       shiftEnd: shiftEnd.toLocaleString(),
// //       totalWorkingMinutes
// //     });

// //     // Overtime calculation
// //     if (attendance.checkOutTime > shiftEnd) {
// //       isOvertime = true;
// //       overtimeMinutes = getTimeDifferenceInMinutes(shiftEnd, attendance.checkOutTime);
// //       console.log('💰 Overtime Detected:', { overtimeMinutes });
// //     }

// //     // Early check-out calculation (for reference)
// //     if (attendance.checkOutTime < shiftEnd) {
// //       isEarlyCheckout = true;
// //       earlyCheckoutMinutes = getTimeDifferenceInMinutes(attendance.checkOutTime, shiftEnd);
// //       console.log('⚠️ Early Check-out:', { earlyCheckoutMinutes });
// //     }
// //   }

// //   // Update attendance status based on working hours
// //   let finalStatus = attendance.status;
  
// //   // If worked less than 4 hours, mark as half day
// //   const requiredMinutesForFullDay = 4 * 60; // 4 hours in minutes
// //   if (totalWorkingMinutes < requiredMinutesForFullDay && totalWorkingMinutes > 0) {
// //     finalStatus = 'half_day';
// //     console.log('📊 Marked as Half Day:', { totalWorkingMinutes, requiredMinutesForFullDay });
// //   }

// //   // Update all calculated fields
// //   attendance.isOvertime = isOvertime;
// //   attendance.overtimeMinutes = overtimeMinutes;
// //   attendance.isEarlyCheckout = isEarlyCheckout;
// //   attendance.earlyCheckoutMinutes = earlyCheckoutMinutes;
// //   attendance.status = finalStatus;
// //   attendance.autoCheckedOut = true;
// //   attendance.notes = `Auto checked-out via frontend at ${currentTime.toLocaleTimeString()}`;

// //   await attendance.save();

// //   // Populate the attendance
// //   const populated = await Attendance.findById(attendance._id)
// //     .populate(attendance.agent ? "agent" : "user", "name email userId")
// //     .populate("shift", "name startTime endTime hours days");

// //   console.log('✅ Frontend Auto Checkout Successful:', {
// //     attendanceId: populated._id,
// //     status: populated.status,
// //     totalWorkingHours: (populated.totalWorkingMinutes / 60).toFixed(2),
// //     overtime: populated.overtimeMinutes,
// //     earlyCheckout: populated.earlyCheckoutMinutes
// //   });

// //   // Generate appropriate success message
// //   const workingHours = (totalWorkingMinutes / 60).toFixed(1);
// //   let message = `Auto checked-out successfully! ✅ (Total: ${workingHours} hours)`;
  
// //   if (isOvertime) {
// //     message = `Auto checked-out successfully! 🕒 (Overtime: ${overtimeMinutes} minutes, Total: ${workingHours} hours)`;
// //   } else if (finalStatus === 'half_day') {
// //     message = `Auto checked-out successfully! 📊 (Half Day: ${workingHours} hours)`;
// //   }

// //   return {
// //     message,
// //     attendance: populated,
// //     workingHours,
// //     overtimeMinutes,
// //     finalStatus
// //   };
// // }

// // /**
// //  * Check if shift has ended
// //  */
// // function hasShiftEnded(shiftEndTime, currentTime, timezone = "Asia/Karachi") {
// //   if (!shiftEndTime) return true;
  
// //   try {
// //     const [endHours, endMinutes] = shiftEndTime.split(':').map(Number);
    
// //     // Convert to target timezone
// //     const currentInTz = new Date(currentTime.toLocaleString("en-US", { timeZone: timezone }));
// //     const shiftEnd = new Date(currentInTz);
// //     shiftEnd.setHours(endHours, endMinutes, 0, 0);
    
// //     const hasEnded = currentInTz > shiftEnd;
    
// //     console.log(`⏰ Shift End Check for Auto Checkout:`, {
// //       shiftEndTime,
// //       currentTime: currentInTz.toLocaleTimeString(),
// //       shiftEnd: shiftEnd.toLocaleTimeString(),
// //       hasEnded
// //     });
    
// //     return hasEnded;
// //   } catch (error) {
// //     console.error('Error in shift end check:', error);
// //     return true;
// //   }
// // }

// // export async function GET(request) {
// //   return NextResponse.json({ 
// //     success: false, 
// //     message: "Use POST method for auto checkout" 
// //   }, { status: 405 });
// // }





// // /app/api/attendance/frontend-auto-checkout/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/lib/mongodb";
// import Attendance from "@/Models/Attendance";
// import { verifyToken, getUserIdFromToken } from "@/lib/jwt";
// import { getTodayDateRange, performAutoCheckout, APP_TZ, hasShiftEndedSmart } from "@/lib/autoAttendanceService";
// import moment from "moment-timezone";

// export async function POST(request) {
//   try {
//     await connectDB();

//     // Authentication
//     const authHeader = request.headers.get("authorization");
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
//     }
//     const token = authHeader.replace("Bearer ", "");
//     const decoded = verifyToken(token);
//     if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

//     const body = await request.json();
//     const { attendanceId, userType = "agent" } = body;
//     const userId = getUserIdFromToken(decoded);
//     const { todayStart, todayEnd } = getTodayDateRange(APP_TZ);
//     const now = moment().tz(APP_TZ).toDate();

//     console.log("🎯 Frontend Auto Checkout Request:", { userId, attendanceId, now: now.toLocaleString("en-PK", { timeZone: APP_TZ }) });

//     // Step: find attendance
//     let attendance;
//     if (attendanceId) {
//       attendance = await Attendance.findById(attendanceId).populate("shift").populate("agent").populate("user");
//       if (!attendance) {
//         return NextResponse.json({ success: false, message: "Attendance not found" }, { status: 404 });
//       }
//     } else {
//       const query = { date: { $gte: todayStart, $lt: todayEnd } };
//       if (userType === "agent") query.agent = userId; else query.user = userId;
//       attendance = await Attendance.findOne(query).populate("shift").populate("agent").populate("user");
//       if (!attendance) {
//         return NextResponse.json({ success: false, message: "No attendance record found for today." }, { status: 400 });
//       }
//     }

//     if (!attendance.checkInTime) {
//       return NextResponse.json({ success: false, message: "No check-in found for today." }, { status: 400 });
//     }
//     if (attendance.checkOutTime) {
//       return NextResponse.json({ success: false, message: "Already checked-out." }, { status: 400 });
//     }

//     // Check shift end condition (if shift exists)
//     if (attendance.shift && attendance.shift.endTime) {
//       const shiftEnded = hasShiftEndedSmart(attendance.shift.endTime, now, APP_TZ);
//       if (!shiftEnded) {
//         return NextResponse.json({ success: false, message: `Auto checkout not allowed yet. Shift ends at ${attendance.shift.endTime}` }, { status: 400 });
//       }
//     }

//     // Perform auto checkout (this will save attendance)
//     const result = await performAutoCheckout(attendance, now);
//     if (!result.success) {
//       return NextResponse.json({ success: false, message: result.error || "Auto checkout failed" }, { status: 500 });
//     }

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

//   } catch (err) {
//     console.error("POST /api/attendance/frontend-auto-checkout error:", err);
//     return NextResponse.json({ success: false, message: err.message || String(err) }, { status: 500 });
//   }
// }

// export async function GET() {
//   return NextResponse.json({ success: false, message: "Use POST method for auto checkout" }, { status: 405 });
// }




// /app/api/attendance/frontend-auto-checkout/route.js
// ✅ COMPLETE FIXED VERSION - Auto Checkout API
// Copy this ENTIRE file to your backend

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";
import { verifyToken, getUserIdFromToken } from "@/lib/jwt";
import { 
  getTodayDateRange, 
  performAutoCheckout, 
  APP_TZ, 
  hasShiftEndedSmart 
} from "@/lib/autoAttendanceService";
import moment from "moment-timezone";

/**
 * ============================================================
 * POST /api/attendance/frontend-auto-checkout
 * ============================================================
 * 
 * Purpose: Auto checkout when user leaves office after shift ends
 * 
 * Request Body:
 * {
 *   attendanceId: string (optional),
 *   userType: "agent" | "user" (default: "agent"),
 *   latitude: number (required),
 *   longitude: number (required),
 *   location: string (optional - address),
 *   reason: string (optional - checkout reason)
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   message: "Auto checked-out successfully!",
 *   data: { ...attendance object },
 *   summary: {
 *     workingHours: "9.2",
 *     overtime: 0,
 *     status: "present",
 *     checkOutTime: "06:29:31 pm"
 *   }
 * }
 */
export async function POST(request) {
  try {
    // ============================================================
    // STEP 1: Connect to Database
    // ============================================================
    await connectDB();
    console.log("📊 Database connected for auto checkout");

    // ============================================================
    // STEP 2: Authenticate User
    // ============================================================
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("❌ No authorization header found");
      return NextResponse.json({ 
        success: false, 
        message: "Not authenticated. Please log in again." 
      }, { status: 401 });
    }
    
    const token = authHeader.replace("Bearer ", "");
    const decoded = verifyToken(token);
    
    if (!decoded) {
      console.error("❌ Invalid or expired token");
      return NextResponse.json({ 
        success: false, 
        message: "Invalid or expired token. Please log in again." 
      }, { status: 401 });
    }

    console.log("✅ User authenticated:", decoded.userId || decoded.id);

    // ============================================================
    // STEP 3: Extract Request Data
    // ============================================================
    const body = await request.json();
    
    const { 
      attendanceId,           // Optional: specific attendance ID
      userType = "agent",     // "agent" or "user"
      latitude,               // Required: user's current latitude
      longitude,              // Required: user's current longitude
      location,               // Optional: formatted address
      reason                  // Optional: checkout reason
    } = body;
    
    const userId = getUserIdFromToken(decoded);
    const { todayStart, todayEnd } = getTodayDateRange(APP_TZ);
    const now = moment().tz(APP_TZ).toDate();

    // ✅ Better logging without timezone errors
    console.log("🎯 Frontend Auto Checkout Request:");
    console.log("   User ID:", userId);
    console.log("   User Type:", userType);
    console.log("   Attendance ID:", attendanceId || "Auto-detect");
    console.log("   Location:", latitude && longitude ? `${latitude}, ${longitude}` : "Not provided");
    console.log("   Timestamp:", moment(now).format('DD/MM/YYYY hh:mm:ss A'));

    // ============================================================
    // STEP 4: Validate Location Data
    // ============================================================
    if (!latitude || !longitude) {
      console.error("❌ Location data missing");
      return NextResponse.json({ 
        success: false, 
        message: "Location data is required for auto checkout." 
      }, { status: 400 });
    }

    // Validate latitude and longitude ranges
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      console.error("❌ Invalid coordinates:", { latitude, longitude });
      return NextResponse.json({ 
        success: false, 
        message: "Invalid location coordinates provided." 
      }, { status: 400 });
    }

    console.log("✅ Location data validated:", { lat, lng });

    // ============================================================
    // STEP 5: Find Attendance Record
    // ============================================================
    let attendance;
    
    if (attendanceId) {
      // Case A: Find by specific attendance ID
      console.log("🔍 Finding attendance by ID:", attendanceId);
      
      attendance = await Attendance.findById(attendanceId)
        .populate("shift")
        .populate("agent")
        .populate("user");
        
      if (!attendance) {
        console.error("❌ Attendance not found with ID:", attendanceId);
        return NextResponse.json({ 
          success: false, 
          message: "Attendance record not found." 
        }, { status: 404 });
      }
      
      console.log("✅ Attendance found by ID");
      
    } else {
      // Case B: Find today's attendance automatically
      console.log("🔍 Finding today's attendance for user:", userId);
      
      const query = { 
        date: { 
          $gte: todayStart, 
          $lt: todayEnd 
        } 
      };
      
      // Add user/agent filter based on userType
      if (userType === "agent") {
        query.agent = userId;
      } else {
        query.user = userId;
      }
      
      console.log("📋 Query:", JSON.stringify(query));
      
      attendance = await Attendance.findOne(query)
        .populate("shift")
        .populate("agent")
        .populate("user");
        
      if (!attendance) {
        console.error("❌ No attendance record found for today");
        return NextResponse.json({ 
          success: false, 
          message: "No attendance record found for today. Please check in first." 
        }, { status: 400 });
      }
      
      console.log("✅ Today's attendance found:", attendance._id.toString());
    }

    // ============================================================
    // STEP 6: Validate Attendance State
    // ============================================================
    
    // Check 1: Has user checked in?
    if (!attendance.checkInTime) {
      console.error("❌ No check-in found");
      return NextResponse.json({ 
        success: false, 
        message: "No check-in found for today. Please check in first." 
      }, { status: 400 });
    }
    
    console.log("✅ Check-in found:", moment(attendance.checkInTime).format('hh:mm:ss A'));
    
    // Check 2: Already checked out?
    if (attendance.checkOutTime) {
      const checkOutTime = moment(attendance.checkOutTime).format('hh:mm:ss A');
      console.error("❌ Already checked out at:", checkOutTime);
      return NextResponse.json({ 
        success: false, 
        message: `Already checked-out at ${checkOutTime}.` 
      }, { status: 400 });
    }
    
    console.log("✅ Not checked out yet - proceeding with auto checkout");

    // ============================================================
    // STEP 7: Validate Shift End Condition
    // ============================================================
    if (attendance.shift && attendance.shift.endTime) {
      const shiftName = attendance.shift.name || "Shift";
      const shiftEndTime = attendance.shift.endTime;
      
      console.log("🕐 Checking shift end condition:");
      console.log("   Shift Name:", shiftName);
      console.log("   Shift End Time:", shiftEndTime);
      console.log("   Current Time:", moment(now).format('HH:mm'));
      
      const shiftEnded = hasShiftEndedSmart(shiftEndTime, now, APP_TZ);
      
      if (!shiftEnded) {
        console.error("❌ Shift has not ended yet");
        return NextResponse.json({ 
          success: false, 
          message: `Auto checkout not allowed yet. Your shift ends at ${shiftEndTime}.` 
        }, { status: 400 });
      }
      
      console.log(`✅ Shift ended validation passed (${shiftName} ends at ${shiftEndTime})`);
    } else {
      console.log("⚠️ No shift assigned or no shift end time - skipping shift validation");
    }

    // ============================================================
    // STEP 8: Prepare Location Data
    // ============================================================
    const locationData = {
      latitude: lat,
      longitude: lng,
      address: location || reason || "Auto-checkout location"
    };

    console.log("📍 Location data prepared for checkout:");
    console.log("   Latitude:", locationData.latitude);
    console.log("   Longitude:", locationData.longitude);
    console.log("   Address:", locationData.address);

    // ============================================================
    // STEP 9: Perform Auto Checkout
    // ============================================================
    console.log("🔄 Calling performAutoCheckout function...");
    
    const result = await performAutoCheckout(attendance, now, locationData);
    
    if (!result.success) {
      console.error("❌ Auto checkout failed:", result.error);
      return NextResponse.json({ 
        success: false, 
        message: result.error || "Auto checkout failed. Please try again." 
      }, { status: 500 });
    }

    console.log("✅ Auto checkout completed successfully!");

    // ============================================================
    // STEP 10: Format Success Response
    // ============================================================
    const workingHours = result.workingHours || "0.0";
    const overtimeMinutes = result.overtimeMinutes || 0;
    const finalStatus = result.attendance?.status || result.finalStatus || 'present';
    const checkOutTime = moment(result.attendance?.checkOutTime || now).format('hh:mm:ss A');

    const response = {
      success: true,
      message: result.message || `Auto checked-out successfully! ✅`,
      data: result.attendance,
      summary: {
        workingHours,
        overtime: overtimeMinutes,
        status: finalStatus,
        checkOutTime,
        location: {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          address: locationData.address
        }
      }
    };

    console.log("📤 Sending success response:");
    console.log("   Attendance ID:", result.attendance?._id);
    console.log("   Working Hours:", workingHours);
    console.log("   Status:", finalStatus);
    console.log("   Checkout Time:", checkOutTime);

    return NextResponse.json(response);

  } catch (err) {
    // ============================================================
    // ERROR HANDLING
    // ============================================================
    console.error("❌❌❌ POST /api/attendance/frontend-auto-checkout error ❌❌❌");
    console.error("Error Message:", err.message);
    console.error("Error Stack:", err.stack);
    
    return NextResponse.json({ 
      success: false, 
      message: err.message || "Internal server error. Please try again." 
    }, { status: 500 });
  }
}

/**
 * ============================================================
 * GET /api/attendance/frontend-auto-checkout
 * ============================================================
 * 
 * Not allowed - this endpoint only accepts POST requests
 */
export async function GET() {
  return NextResponse.json({ 
    success: false, 
    message: "Method not allowed. Use POST method for auto checkout.",
    info: {
      method: "POST",
      endpoint: "/api/attendance/frontend-auto-checkout",
      requiredFields: ["latitude", "longitude"],
      optionalFields: ["attendanceId", "userType", "location", "reason"]
    }
  }, { status: 405 });
}

/**
 * ============================================================
 * PUT, DELETE, PATCH - Not Allowed
 * ============================================================
 */
export async function PUT() {
  return NextResponse.json({ 
    success: false, 
    message: "Method not allowed. Use POST method." 
  }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ 
    success: false, 
    message: "Method not allowed. Use POST method." 
  }, { status: 405 });
}

export async function PATCH() {
  return NextResponse.json({ 
    success: false, 
    message: "Method not allowed. Use POST method." 
  }, { status: 405 });
}
