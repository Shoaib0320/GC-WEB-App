// // app/api/attendance/checkin/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/lib/mongodb";
// import Attendance from "@/Models/Attendance";
// import Shift from "@/Models/Shift";
// import Agent from "@/Models/Agent";
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

//     const userId = getUserIdFromToken(decoded);

//     // ✅ FIXED: Today's date range properly
//     const now = new Date();
//     const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//     const todayEnd = new Date(todayStart);
//     todayEnd.setDate(todayEnd.getDate() + 1);

//     console.log('🔍 Check-in Request:', {
//       userId,
//       shiftId,
//       now: now.toLocaleString(),
//       todayStart: todayStart.toLocaleString(),
//       todayEnd: todayEnd.toLocaleString()
//     });

//     // ✅ FIXED: Check if already checked in today - PROPER QUERY
//     const existingAttendance = await Attendance.findOne({
//       $or: [
//         { agent: userId },
//         { user: userId }
//       ],
//       checkInTime: { 
//         $gte: todayStart, 
//         $lt: todayEnd 
//       }
//     });

//     if (existingAttendance) {
//       return NextResponse.json({ 
//         success: false, 
//         message: "Already checked in for today." 
//       }, { status: 400 });
//     }

//     // Get shift details for timing calculation
//     const shift = await Shift.findById(shiftId);
//     if (!shift) {
//       return NextResponse.json({ 
//         success: false, 
//         message: "Shift not found" 
//       }, { status: 404 });
//     }

//     // ✅ FIXED: PROPER LATE CALCULATION
//     let isLate = false;
//     let lateMinutes = 0;
    
//     const shiftStartTime = parseShiftDateTime(todayStart, shift.startTime);
    
//     console.log('🕒 Timing Comparison:', {
//       now: now.toLocaleString(),
//       shiftStart: shiftStartTime.toLocaleString(),
//       shiftStartTime: shift.startTime
//     });

//     // Check if current time is after shift start time
//     if (now > shiftStartTime) {
//       isLate = true;
//       lateMinutes = Math.floor((now - shiftStartTime) / (1000 * 60)); // Convert to minutes
//       console.log('⏰ Late Calculation:', {
//         isLate,
//         lateMinutes,
//         timeDifference: now - shiftStartTime
//       });
//     }

//     // Create new attendance
//     const attendanceData = {
//       shift: shiftId,
//       checkInTime: now,
//       checkInLocation: location || null,
//       status: 'present',
//       isLate: isLate,
//       lateMinutes: lateMinutes
//     };

//     // ✅ FIXED: Assign to correct field based on userType
//     if (userType === 'agent') {
//       attendanceData.agent = userId;
//     } else {
//       attendanceData.user = userId;
//     }

//     const attendance = new Attendance(attendanceData);
//     await attendance.save();

//     // Populate and return
//     const populated = await Attendance.findById(attendance._id)
//       .populate("user", "firstName lastName email")
//       .populate("agent", "agentName agentId email")
//       .populate("shift", "name startTime endTime hours days");

//     console.log('✅ Check-in Successful:', {
//       attendanceId: populated._id,
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






// app/api/attendance/checkin/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";
import Shift from "@/Models/Shift";
import { verifyToken, getUserIdFromToken } from "@/lib/jwt";

/**
 * Helper: create a Date object on the baseDate day with hh:mm
 */
function parseShiftDateTime(baseDate, timeStr) {
  const [hh, mm] = (timeStr || "00:00").split(":").map(Number);
  const dt = new Date(baseDate);
  dt.setHours(hh, mm, 0, 0);
  return dt;
}

/**
 * POST /api/attendance/checkin
 * Body: { shiftId, location, userType = 'agent' }
 */
export async function POST(request) {
  try {
    await connectDB();

    // ---------- Auth ----------
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    const userId = getUserIdFromToken(decoded);

    // ---------- Input ----------
    const body = await request.json();
    const { shiftId, location = null, userType = "agent" } = body;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    // ---------- Already checked in TODAY? (respect userType) ----------
    const existingFilter = {
      checkInTime: { $gte: todayStart, $lt: todayEnd },
      ...(userType === "agent" ? { agent: userId } : { user: userId })
    };
    const existing = await Attendance.findOne(existingFilter);
    if (existing) {
      return NextResponse.json({ success: false, message: "Already checked in for today" }, { status: 400 });
    }

    // ---------- Load shift (optional but recommended) ----------
    let shift = null;
    if (shiftId) {
      shift = await Shift.findById(shiftId);
      if (!shift) return NextResponse.json({ success: false, message: "Shift not found" }, { status: 404 });
    }

    // ---------- Defaults / constants ----------
    const GRACE_MINUTES = 15; // change if you want different grace
    const DEFAULT_FULL_DAY_MINUTES = 4 * 60; // fallback if shift missing

    // Determine status, lateMinutes
    let status = "present";
    let isLate = false;
    let lateMinutes = 0;

    // We'll set a `date` field (00:00 PKT local day) so attendance model's required date is satisfied.
    // Use the server date (UTC-local), which aligns with how other endpoints used todayStart.
    const dateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (shift && shift.startTime && shift.endTime) {
      // Build shift start/end for TODAY anchored on todayStart
      let shiftStart = parseShiftDateTime(todayStart, shift.startTime);
      let shiftEnd = parseShiftDateTime(todayStart, shift.endTime);

      // Night shift handling: if end <= start then end belongs to next day
      if (shiftEnd <= shiftStart) {
        shiftEnd = new Date(shiftEnd.getTime() + 24 * 60 * 60 * 1000);
      }

      // Full shift minutes and half-shift threshold
      const fullShiftMinutes = Math.floor((shiftEnd - shiftStart) / 60000);
      const halfShiftMinutes = fullShiftMinutes / 2;
      const halfShiftTime = new Date(shiftStart.getTime() + halfShiftMinutes * 60000);

      // Grace cut-off
      const graceTime = new Date(shiftStart.getTime() + GRACE_MINUTES * 60000);

      // Decision order (priority):
      // 1) If check-in after shiftEnd => absent
      // 2) Else if check-in >= halfShiftTime => half_day
      // 3) Else if check-in > graceTime => late (lateMinutes only count after grace)
      // 4) Else present

      if (now > shiftEnd) {
        status = "absent";
      } else if (now >= halfShiftTime) {
        status = "half_day";
      } else if (now > graceTime) {
        status = "late";
        isLate = true;
        // lateMinutes = minutes from shiftStart minus grace window
        const diffFromStart = Math.floor((now - shiftStart) / 60000);
        lateMinutes = Math.max(0, diffFromStart - GRACE_MINUTES);
      } else {
        status = "present";
      }
    } else {
      // No shift info - fallback logic:
      // Use grace from midnight? Instead: treat grace as GRACE_MINUTES from now's 00:00? Not sensible.
      // We'll use a simple fallback: if user checks in after DEFAULT_FULL_DAY_MINUTES/2 of the day (~noon) mark half_day,
      // but most apps should provide shift. Keep it conservative:
      const fallbackHalfThreshold = Math.floor(DEFAULT_FULL_DAY_MINUTES / 2); // 120 minutes
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const minutesSinceMidnight = Math.floor((now - midnight) / 60000);

      if (minutesSinceMidnight > DEFAULT_FULL_DAY_MINUTES * 2) {
        // very late in day
        status = "absent";
      } else if (minutesSinceMidnight >= fallbackHalfThreshold) {
        status = "half_day";
      } else {
        // treat > GRACE as late relative to 00:00 (not ideal but fallback)
        if (minutesSinceMidnight > GRACE_MINUTES) {
          status = "late";
          isLate = true;
          lateMinutes = Math.max(0, minutesSinceMidnight - GRACE_MINUTES);
        } else {
          status = "present";
        }
      }
    }

    // ---------- Create attendance record ----------
    // Ensure `date` is set (Attendance model requires it)
    const attendanceData = {
      shift: shiftId || null,
      date: dateOnly,
      checkInTime: now,
      checkInLocation: location || null,
      status, // normalized statuses: present | late | half_day | absent
      isLate: !!isLate,
      lateMinutes: lateMinutes || 0,
      totalWorkingMinutes: 0, // will be set on checkout
      isOvertime: false,
      overtimeMinutes: 0,
      isEarlyCheckout: false,
      earlyCheckoutMinutes: 0,
    };

    if (userType === "agent") attendanceData.agent = userId;
    else attendanceData.user = userId;

    const attendance = await Attendance.create(attendanceData);

    // populate for response
    const populated = await Attendance.findById(attendance._id)
      .populate("user", "firstName lastName email")
      .populate("agent", "agentName agentId email")
      .populate("shift", "name startTime endTime days");

    const msg = status === "late"
      ? `Checked in successfully (late by ${lateMinutes} minutes)`
      : `Checked in successfully as ${status}`;

    return NextResponse.json({ success: true, message: msg, data: populated });
  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
