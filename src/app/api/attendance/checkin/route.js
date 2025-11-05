// // // // /app/api/attendance/checkin/route.js
// // // import { NextResponse } from "next/server";
// // // import connectDB from "@/lib/mongodb";
// // // import Attendance from "@/Models/Attendance";
// // // import Shift from "@/Models/Shift";
// // // import { verifyToken } from "@/lib/jwt";

// // // function parseShiftDateTime(baseDate, timeStr) {
// // //   // baseDate: Date (midnight of the day), timeStr: "HH:MM"
// // //   const [hh, mm] = timeStr.split(":").map(Number);
// // //   const dt = new Date(baseDate);
// // //   dt.setHours(hh, mm, 0, 0);
// // //   return dt;
// // // }

// // // export async function POST(request) {
// // //   try {
// // //     await connectDB();

// // //     const token = request.cookies.get("token")?.value;
// // //     if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

// // //     const decoded = verifyToken(token);
// // //     if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

// // //     const body = await request.json();
// // //     const { shiftId, location } = body;
// // //     if (!shiftId) return NextResponse.json({ success: false, message: "shiftId required" }, { status: 400 });

// // //     const shift = await Shift.findById(shiftId).populate("manager", "firstName lastName email");
// // //     if (!shift) return NextResponse.json({ success: false, message: "Shift not found" }, { status: 404 });

// // //     const now = new Date();
// // //     const todayStart = new Date(now); todayStart.setHours(0,0,0,0);
// // //     const shiftStart = parseShiftDateTime(todayStart, shift.startTime);
// // //     let shiftEnd = parseShiftDateTime(todayStart, shift.endTime);
// // //     if (shiftEnd <= shiftStart) shiftEnd.setDate(shiftEnd.getDate() + 1); // overnight

// // //     // allowed checkin window: from shiftStart -15min up to shiftEnd
// // //     const earliestCheckin = new Date(shiftStart.getTime() - 15 * 60 * 1000);
// // //     const latestCheckin = new Date(shiftEnd.getTime());

// // //     if (now < earliestCheckin) {
// // //       return NextResponse.json({
// // //         success: false,
// // //         message: `Check-in allowed from ${earliestCheckin.toLocaleTimeString()}`,
// // //       }, { status: 400 });
// // //     }
// // //     if (now > latestCheckin) {
// // //       return NextResponse.json({
// // //         success: false,
// // //         message: "Check-in window passed for this shift today.",
// // //       }, { status: 400 });
// // //     }

// // //     // prevent duplicate: same user+shift for today
// // //     const existing = await Attendance.findOne({
// // //       user: decoded.userId,
// // //       shift: shift._id,
// // //       checkInTime: { $gte: todayStart, $lt: new Date(todayStart.getTime() + 24*60*60*1000) },
// // //     });

// // //     if (existing && existing.checkInTime) {
// // //       return NextResponse.json({ success: false, message: "Already checked-in today." }, { status: 400 });
// // //     }

// // //     // late logic
// // //     let isLate = false, lateMinutes = 0;
// // //     if (now > shiftStart) {
// // //       isLate = true;
// // //       lateMinutes = Math.ceil((now - shiftStart) / (60 * 1000));
// // //     }

// // //     let attendance;
// // //     if (existing) {
// // //       existing.checkInTime = now;
// // //       existing.checkInLocation = location || null;
// // //       existing.manager = shift.manager?._id || null;
// // //       existing.status = "present";
// // //       existing.isLate = isLate;
// // //       existing.lateMinutes = lateMinutes;
// // //       await existing.save();
// // //       attendance = existing;
// // //     } else {
// // //       attendance = await Attendance.create({
// // //         user: decoded.userId,
// // //         shift: shift._id,
// // //         manager: shift.manager?._id || null,
// // //         checkInTime: now,
// // //         checkInLocation: location || null,
// // //         status: "present",
// // //         isLate,
// // //         lateMinutes,
// // //       });
// // //     }

// // //     const populated = await Attendance.findById(attendance._id)
// // //       .populate("user", "firstName lastName email")
// // //       .populate("shift", "name startTime endTime hours days")
// // //       .populate("manager", "firstName lastName email");

// // //     return NextResponse.json({ success: true, message: "Checked-in", data: populated }, { status: 201 });
// // //   } catch (error) {
// // //     console.error("POST /api/attendance/checkin error:", error);
// // //     return NextResponse.json({ success: false, message: error.message }, { status: 500 });
// // //   }
// // // }



// // //app/api/attendance/checkin/route.js
// // import { NextResponse } from "next/server";
// // import connectDB from "@/lib/mongodb";
// // import Attendance from "@/Models/Attendance";
// // import Shift from "@/Models/Shift";
// // import Holiday from "@/Models/Holiday";
// // import { verifyToken } from "@/lib/jwt";

// // function parseShiftDateTime(baseDate, timeStr) {
// //   const [hh, mm] = timeStr.split(":").map(Number);
// //   const dt = new Date(baseDate);
// //   dt.setHours(hh, mm, 0, 0);
// //   return dt;
// // }

// // async function isHoliday(date) {
// //   const dateStart = new Date(date);
// //   dateStart.setHours(0, 0, 0, 0);
// //   const dateEnd = new Date(dateStart);
// //   dateEnd.setDate(dateEnd.getDate() + 1);

// //   const holiday = await Holiday.findOne({
// //     date: { $gte: dateStart, $lt: dateEnd }
// //   });
// //   return !!holiday;
// // }

// // export async function POST(request) {
// //   try {
// //     await connectDB();

// //     const token = request.cookies.get("token")?.value;
// //     if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

// //     const decoded = verifyToken(token);
// //     if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

// //     const body = await request.json();
// //     const { shiftId, location, userType = 'user' } = body;
// //     if (!shiftId) return NextResponse.json({ success: false, message: "shiftId required" }, { status: 400 });

// //     // Check if today is holiday
// //     const today = new Date();
// //     if (await isHoliday(today)) {
// //       return NextResponse.json({
// //         success: false,
// //         message: "Today is holiday - check-in not allowed"
// //       }, { status: 400 });
// //     }

// //     const shift = await Shift.findById(shiftId).populate("manager", "firstName lastName email");
// //     if (!shift) return NextResponse.json({ success: false, message: "Shift not found" }, { status: 404 });

// //     const now = new Date();
// //     const todayStart = new Date(now); todayStart.setHours(0,0,0,0);
// //     const shiftStart = parseShiftDateTime(todayStart, shift.startTime);
// //     let shiftEnd = parseShiftDateTime(todayStart, shift.endTime);
// //     if (shiftEnd <= shiftStart) shiftEnd.setDate(shiftEnd.getDate() + 1);

// //     const earliestCheckin = new Date(shiftStart.getTime() - 15 * 60 * 1000);
// //     const latestCheckin = new Date(shiftEnd.getTime());

// //     if (now < earliestCheckin) {
// //       return NextResponse.json({
// //         success: false,
// //         message: `Check-in allowed from ${earliestCheckin.toLocaleTimeString()}`,
// //       }, { status: 400 });
// //     }
// //     if (now > latestCheckin) {
// //       return NextResponse.json({
// //         success: false,
// //         message: "Check-in window passed for this shift today.",
// //       }, { status: 400 });
// //     }

// //     // Build query based on user type
// //     const attendanceQuery = {
// //       shift: shift._id,
// //       checkInTime: { $gte: todayStart, $lt: new Date(todayStart.getTime() + 24*60*60*1000) },
// //     };

// //     if (userType === 'agent') {
// //       attendanceQuery.agent = decoded.userId;
// //     } else {
// //       attendanceQuery.user = decoded.userId;
// //     }

// //     const existing = await Attendance.findOne(attendanceQuery);

// //     if (existing && existing.checkInTime) {
// //       return NextResponse.json({ success: false, message: "Already checked-in today." }, { status: 400 });
// //     }

// //     // late logic
// //     let isLate = false, lateMinutes = 0;
// //     if (now > shiftStart) {
// //       isLate = true;
// //       lateMinutes = Math.ceil((now - shiftStart) / (60 * 1000));
// //     }

// //     // Create attendance data based on user type
// //     const attendanceData = {
// //       shift: shift._id,
// //       manager: shift.manager?._id || null,
// //       checkInTime: now,
// //       checkInLocation: location || null,
// //       status: "present",
// //       isLate,
// //       lateMinutes,
// //     };

// //     if (userType === 'agent') {
// //       attendanceData.agent = decoded.userId;
// //     } else {
// //       attendanceData.user = decoded.userId;
// //     }

// //     let attendance;
// //     if (existing) {
// //       Object.assign(existing, attendanceData);
// //       await existing.save();
// //       attendance = existing;
// //     } else {
// //       attendance = await Attendance.create(attendanceData);
// //     }

// //     const populated = await Attendance.findById(attendance._id)
// //       .populate("user", "firstName lastName email")
// //       .populate("agent", "agentName agentId email")
// //       .populate("shift", "name startTime endTime hours days")
// //       .populate("manager", "firstName lastName email");

// //     return NextResponse.json({ success: true, message: "Checked-in", data: populated }, { status: 201 });
// //   } catch (error) {
// //     console.error("POST /api/attendance/checkin error:", error);
// //     return NextResponse.json({ success: false, message: error.message }, { status: 500 });
// //   }
// // }


// // app/api/attendance/checkin/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/lib/mongodb";
// import Attendance from "@/Models/Attendance";
// import Shift from "@/Models/Shift";
// import Holiday from "@/Models/Holiday";
// import { verifyToken, getUserIdFromToken } from "@/lib/jwt";

// function parseShiftDateTime(baseDate, timeStr) {
//   const [hh, mm] = timeStr.split(":").map(Number);
//   const dt = new Date(baseDate);
//   dt.setHours(hh, mm, 0, 0);
//   return dt;
// }

// async function isHoliday(date) {
//   const dateStart = new Date(date);
//   dateStart.setHours(0, 0, 0, 0);
//   const dateEnd = new Date(dateStart);
//   dateEnd.setDate(dateEnd.getDate() + 1);

//   const holiday = await Holiday.findOne({
//     date: { $gte: dateStart, $lt: dateEnd }
//   });
//   return !!holiday;
// }

// export async function POST(request) {
//   try {
//     await connectDB();

//     // ✅ FIXED: Get token from headers for React Native
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
//     const { shiftId, location, userType = 'agent' } = body; // ✅ Default to agent
    
//     if (!shiftId) {
//       return NextResponse.json({ success: false, message: "shiftId required" }, { status: 400 });
//     }

//     // ✅ FIXED: Use getUserIdFromToken for both user and agent
//     const userId = getUserIdFromToken(decoded);

//     // Check if today is holiday
//     const today = new Date();
//     if (await isHoliday(today)) {
//       return NextResponse.json({
//         success: false,
//         message: "Today is holiday - check-in not allowed"
//       }, { status: 400 });
//     }

//     const shift = await Shift.findById(shiftId)
//     if (!shift) {
//       return NextResponse.json({ success: false, message: "Shift not found" }, { status: 404 });
//     }

//     const now = new Date();
//     const todayStart = new Date(now); 
//     todayStart.setHours(0, 0, 0, 0);
    
//     const shiftStart = parseShiftDateTime(todayStart, shift.startTime);
//     let shiftEnd = parseShiftDateTime(todayStart, shift.endTime);
    
//     if (shiftEnd <= shiftStart) {
//       shiftEnd.setDate(shiftEnd.getDate() + 1);
//     }

//     const earliestCheckin = new Date(shiftStart.getTime() - 15 * 60 * 1000);
//     const latestCheckin = new Date(shiftEnd.getTime());

//     if (now < earliestCheckin) {
//       return NextResponse.json({
//         success: false,
//         message: `Check-in allowed from ${earliestCheckin.toLocaleTimeString()}`,
//       }, { status: 400 });
//     }
    
//     if (now > latestCheckin) {
//       return NextResponse.json({
//         success: false,
//         message: "Check-in window passed for this shift today.",
//       }, { status: 400 });
//     }

//     // ✅ FIXED: Build query with proper user ID
//     const attendanceQuery = {
//       shift: shift._id,
//       checkInTime: { 
//         $gte: todayStart, 
//         $lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000) 
//       },
//     };

//     // ✅ FIXED: Use userId from token for both cases
//     if (userType === 'agent') {
//       attendanceQuery.agent = userId;
//     } else {
//       attendanceQuery.user = userId;
//     }

//     const existing = await Attendance.findOne(attendanceQuery);

//     if (existing && existing.checkInTime) {
//       return NextResponse.json({ 
//         success: false, 
//         message: "Already checked-in today." 
//       }, { status: 400 });
//     }

//     // Late logic
//     let isLate = false, lateMinutes = 0;
//     if (now > shiftStart) {
//       isLate = true;
//       lateMinutes = Math.ceil((now - shiftStart) / (60 * 1000));
//     }

//     // ✅ FIXED: Create attendance data with proper user ID
//     const attendanceData = {
//       shift: shift._id,
//       manager: shift.manager?._id || null,
//       checkInTime: now,
//       checkInLocation: location || null,
//       status: "present",
//       isLate,
//       lateMinutes,
//     };

//     // ✅ FIXED: Use userId from token
//     if (userType === 'agent') {
//       attendanceData.agent = userId;
//     } else {
//       attendanceData.user = userId;
//     }

//     let attendance;
//     if (existing) {
//       Object.assign(existing, attendanceData);
//       await existing.save();
//       attendance = existing;
//     } else {
//       attendance = await Attendance.create(attendanceData);
//     }

//     const populated = await Attendance.findById(attendance._id)
//       .populate("user", "firstName lastName email")
//       .populate("agent", "agentName agentId email")
//       .populate("shift", "name startTime endTime hours days")
//       .populate("manager", "firstName lastName email");

//     return NextResponse.json({ 
//       success: true, 
//       message: "Checked-in successfully", 
//       data: populated 
//     }, { status: 201 });

//   } catch (error) {
//     console.error("POST /api/attendance/checkin error:", error);
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
import { verifyToken, getUserIdFromToken } from "@/lib/jwt";

function parseShiftDateTime(baseDate, timeStr) {
  const [hh, mm] = timeStr.split(":").map(Number);
  const dt = new Date(baseDate);
  dt.setHours(hh, mm, 0, 0);
  return dt;
}

// app/api/attendance/checkin/route.js
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

    // Create new attendance
    const attendanceData = {
      shift: shiftId,
      checkInTime: now,
      checkInLocation: location || null,
      status: 'present'
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
      .populate("shift", "name startTime endTime hours days")
      .populate("manager", "firstName lastName email");

    return NextResponse.json({ 
      success: true, 
      message: "Checked in successfully!", 
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