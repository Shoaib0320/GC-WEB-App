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
