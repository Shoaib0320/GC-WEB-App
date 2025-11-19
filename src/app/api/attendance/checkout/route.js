// // // // /app/api/attendance/checkout/route.js
// // // import { NextResponse } from "next/server";
// // // import connectDB from "@/lib/mongodb";
// // // import Attendance from "@/Models/Attendance";
// // // import Shift from "@/Models/Shift";
// // // import { verifyToken } from "@/lib/jwt";

// // // function parseShiftDateTime(baseDate, timeStr) {
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
// // //     const { attendanceId, location } = body;

// // //     const now = new Date();
// // //     const todayStart = new Date(now); todayStart.setHours(0,0,0,0);
// // //     const todayEnd = new Date(todayStart); todayEnd.setDate(todayEnd.getDate() + 1);

// // //     let attendance;
// // //     if (attendanceId) {
// // //       attendance = await Attendance.findById(attendanceId).populate("shift");
// // //     } else {
// // //       attendance = await Attendance.findOne({
// // //         user: decoded.userId,
// // //         checkInTime: { $gte: todayStart, $lt: todayEnd },
// // //       }).populate("shift");
// // //     }

// // //     if (!attendance || !attendance.checkInTime) {
// // //       return NextResponse.json({ success: false, message: "No check-in found for today." }, { status: 400 });
// // //     }

// // //     if (attendance.checkOutTime) {
// // //       return NextResponse.json({ success: false, message: "Already checked-out." }, { status: 400 });
// // //     }

// // //     attendance.checkOutTime = now;
// // //     attendance.checkOutLocation = location || null;

// // //     // compute overtime by comparing to shift end for the check-in day
// // //     const checkInDate = new Date(attendance.checkInTime);
// // //     const shift = await Shift.findById(attendance.shift);
// // //     const shiftStart = parseShiftDateTime(checkInDate, shift.startTime);
// // //     let shiftEnd = parseShiftDateTime(checkInDate, shift.endTime);
// // //     if (shiftEnd <= shiftStart) shiftEnd.setDate(shiftEnd.getDate() + 1); // overnight

// // //     if (attendance.checkOutTime > shiftEnd) {
// // //       const diffMs = attendance.checkOutTime.getTime() - shiftEnd.getTime();
// // //       const diffMin = Math.ceil(diffMs / (60 * 1000));
// // //       attendance.isOvertime = true;
// // //       attendance.overtimeMinutes = diffMin;
// // //     } else {
// // //       attendance.isOvertime = false;
// // //       attendance.overtimeMinutes = 0;
// // //     }

// // //     await attendance.save();

// // //     const populated = await Attendance.findById(attendance._id)
// // //       .populate("user", "firstName lastName email")
// // //       .populate("shift", "name startTime endTime hours days")
// // //       .populate("manager", "firstName lastName email");

// // //     return NextResponse.json({ success: true, message: "Checked-out", data: populated });
// // //   } catch (error) {
// // //     console.error("POST /api/attendance/checkout error:", error);
// // //     return NextResponse.json({ success: false, message: error.message }, { status: 500 });
// // //   }
// // // }



// // //app/api/attendance/checkout/route.js
// // import { NextResponse } from "next/server";
// // import connectDB from "@/lib/mongodb";
// // import Attendance from "@/Models/Attendance";
// // import Shift from "@/Models/Shift";
// // import { verifyToken } from "@/lib/jwt";

// // function parseShiftDateTime(baseDate, timeStr) {
// //   const [hh, mm] = timeStr.split(":").map(Number);
// //   const dt = new Date(baseDate);
// //   dt.setHours(hh, mm, 0, 0);
// //   return dt;
// // }

// // export async function POST(request) {
// //   try {
// //     await connectDB();

// //     const token = request.cookies.get("token")?.value;
// //     if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

// //     const decoded = verifyToken(token);
// //     if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

// //     const body = await request.json();
// //     const { attendanceId, location, userType = 'user' } = body;

// //     const now = new Date();
// //     const todayStart = new Date(now); todayStart.setHours(0,0,0,0);
// //     const todayEnd = new Date(todayStart); todayEnd.setDate(todayEnd.getDate() + 1);

// //     let attendance;
// //     if (attendanceId) {
// //       attendance = await Attendance.findById(attendanceId).populate("shift");
// //     } else {
// //       const query = {
// //         checkInTime: { $gte: todayStart, $lt: todayEnd },
// //       };

// //       if (userType === 'agent') {
// //         query.agent = decoded.userId;
// //       } else {
// //         query.user = decoded.userId;
// //       }

// //       attendance = await Attendance.findOne(query).populate("shift");
// //     }

// //     if (!attendance || !attendance.checkInTime) {
// //       return NextResponse.json({ success: false, message: "No check-in found for today." }, { status: 400 });
// //     }

// //     if (attendance.checkOutTime) {
// //       return NextResponse.json({ success: false, message: "Already checked-out." }, { status: 400 });
// //     }

// //     attendance.checkOutTime = now;
// //     attendance.checkOutLocation = location || null;

// //     // compute overtime
// //     const checkInDate = new Date(attendance.checkInTime);
// //     const shift = await Shift.findById(attendance.shift);
// //     const shiftStart = parseShiftDateTime(checkInDate, shift.startTime);
// //     let shiftEnd = parseShiftDateTime(checkInDate, shift.endTime);
// //     if (shiftEnd <= shiftStart) shiftEnd.setDate(shiftEnd.getDate() + 1);

// //     if (attendance.checkOutTime > shiftEnd) {
// //       const diffMs = attendance.checkOutTime.getTime() - shiftEnd.getTime();
// //       const diffMin = Math.ceil(diffMs / (60 * 1000));
// //       attendance.isOvertime = true;
// //       attendance.overtimeMinutes = diffMin;
// //     } else {
// //       attendance.isOvertime = false;
// //       attendance.overtimeMinutes = 0;
// //     }

// //     await attendance.save();

// //     const populated = await Attendance.findById(attendance._id)
// //       .populate("user", "firstName lastName email")
// //       .populate("agent", "agentName agentId email")
// //       .populate("shift", "name startTime endTime hours days")
// //       .populate("manager", "firstName lastName email");

// //     return NextResponse.json({ success: true, message: "Checked-out", data: populated });
// //   } catch (error) {
// //     console.error("POST /api/attendance/checkout error:", error);
// //     return NextResponse.json({ success: false, message: error.message }, { status: 500 });
// //   }
// // }





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

//     // ✅ FIXED: Get token from headers
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

//     // ✅ FIXED: Use getUserIdFromToken
//     const userId = getUserIdFromToken(decoded);

//     const now = new Date();
//     const todayStart = new Date(now); 
//     todayStart.setHours(0, 0, 0, 0);
//     const todayEnd = new Date(todayStart); 
//     todayEnd.setDate(todayEnd.getDate() + 1);

//     let attendance;
//     if (attendanceId) {
//       attendance = await Attendance.findById(attendanceId).populate("shift");
//     } else {
//       // ✅ FIXED: Use userId from token
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

//     // Compute overtime
//     const checkInDate = new Date(attendance.checkInTime);
//     const shift = await Shift.findById(attendance.shift);
//     const shiftStart = parseShiftDateTime(checkInDate, shift.startTime);
//     let shiftEnd = parseShiftDateTime(checkInDate, shift.endTime);
    
//     if (shiftEnd <= shiftStart) {
//       shiftEnd.setDate(shiftEnd.getDate() + 1);
//     }

//     if (attendance.checkOutTime > shiftEnd) {
//       const diffMs = attendance.checkOutTime.getTime() - shiftEnd.getTime();
//       const diffMin = Math.ceil(diffMs / (60 * 1000));
//       attendance.isOvertime = true;
//       attendance.overtimeMinutes = diffMin;
//     } else {
//       attendance.isOvertime = false;
//       attendance.overtimeMinutes = 0;
//     }

//     await attendance.save();

//     const populated = await Attendance.findById(attendance._id)
//       .populate("user", "firstName lastName email")
//       .populate("agent", "agentName agentId email")
//       .populate("shift", "name startTime endTime hours days")
//       // .populate("manager", "firstName lastName email");

//     return NextResponse.json({ 
//       success: true, 
//       message: "Checked-out successfully", 
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
import { verifyToken, getUserIdFromToken } from "@/lib/jwt";

function parseShiftDateTime(baseDate, timeStr) {
  const [hh, mm] = timeStr.split(":").map(Number);
  const dt = new Date(baseDate);
  dt.setHours(hh, mm, 0, 0);
  return dt;
}

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

    const userId = getUserIdFromToken(decoded);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    console.log('🔍 Check-out Request:', {
      userId,
      attendanceId,
      now: now.toLocaleString()
    });

    let attendance;
    if (attendanceId) {
      attendance = await Attendance.findById(attendanceId).populate("shift");
    } else {
      const query = {
        checkInTime: { $gte: todayStart, $lt: todayEnd },
      };

      if (userType === 'agent') {
        query.agent = userId;
      } else {
        query.user = userId;
      }

      attendance = await Attendance.findOne(query).populate("shift");
    }

    if (!attendance || !attendance.checkInTime) {
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

    attendance.checkOutTime = now;
    attendance.checkOutLocation = location || null;

    // ✅ FIXED: Better overtime calculation
    const checkInDate = new Date(attendance.checkInTime);
    const shift = await Shift.findById(attendance.shift);
    
    if (shift) {
      const shiftStart = parseShiftDateTime(checkInDate, shift.startTime);
      let shiftEnd = parseShiftDateTime(checkInDate, shift.endTime);
      
      if (shiftEnd <= shiftStart) {
        shiftEnd.setDate(shiftEnd.getDate() + 1);
      }

      console.log('🕒 Overtime Calculation:', {
        checkInTime: attendance.checkInTime,
        checkOutTime: attendance.checkOutTime,
        shiftStart: shiftStart.toLocaleString(),
        shiftEnd: shiftEnd.toLocaleString()
      });

      if (attendance.checkOutTime > shiftEnd) {
        const diffMs = attendance.checkOutTime.getTime() - shiftEnd.getTime();
        const diffMin = Math.floor(diffMs / (1000 * 60));
        attendance.isOvertime = true;
        attendance.overtimeMinutes = diffMin;
        
        console.log('💰 Overtime Detected:', {
          overtimeMinutes: diffMin,
          diffMs
        });
      } else {
        attendance.isOvertime = false;
        attendance.overtimeMinutes = 0;
      }
    }

    await attendance.save();

    const populated = await Attendance.findById(attendance._id)
      .populate("user", "firstName lastName email")
      .populate("agent", "agentName agentId email")
      .populate("shift", "name startTime endTime hours days");

    let successMessage = "Checked-out successfully";
    if (attendance.isOvertime) {
      successMessage = `Checked-out successfully (Overtime: ${attendance.overtimeMinutes} minutes)`;
    }

    console.log('✅ Check-out Successful:', {
      attendanceId: populated._id,
      checkInTime: populated.checkInTime,
      checkOutTime: populated.checkOutTime,
      overtime: populated.overtimeMinutes
    });

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