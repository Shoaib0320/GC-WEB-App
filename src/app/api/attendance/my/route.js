// // // // /app/api/attendance/my/route.js
// // // import { NextResponse } from "next/server";
// // // import connectDB from "@/lib/mongodb";
// // // import Attendance from "@/Models/Attendance";
// // // import { verifyToken } from "@/lib/jwt";

// // // export async function GET(request) {
// // //   try {
// // //     await connectDB();
// // //     const token = request.cookies.get("token")?.value;
// // //     if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
// // //     const decoded = verifyToken(token);
// // //     if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

// // //     const { searchParams } = new URL(request.url);
// // //     const month = parseInt(searchParams.get("month") || "", 10);
// // //     const year = parseInt(searchParams.get("year") || "", 10);

// // //     const userId = decoded.userId;

// // //     if (month && year) {
// // //       const from = new Date(year, month - 1, 1, 0, 0, 0, 0);
// // //       const to = new Date(year, month - 1 + 1, 1, 0, 0, 0, 0);

// // //       const attends = await Attendance.find({
// // //         user: userId,
// // //         createdAt: { $gte: from, $lt: to },
// // //       }).populate("shift", "name startTime endTime");

// // //       const present = attends.filter(a => a.checkInTime).length;
// // //       const presentWithCheckout = attends.filter(a => a.checkInTime && a.checkOutTime).length;
// // //       const overtimeMinutes = attends.reduce((s, a) => s + (a.overtimeMinutes || 0), 0);
// // //       const leaves = attends.filter(a => a.status === "leave").length;
// // //       const daysInMonth = Math.floor((to - from) / (24*60*60*1000));
// // //       const absent = Math.max(0, daysInMonth - present - leaves);

// // //       return NextResponse.json({
// // //         success: true,
// // //         data: {
// // //           month,
// // //           year,
// // //           totalDays: daysInMonth,
// // //           present,
// // //           presentWithCheckout,
// // //           absent,
// // //           leaves,
// // //           overtimeMinutes,
// // //           records: attends,
// // //         },
// // //       });
// // //     }

// // //     // otherwise recent records
// // //     const limit = parseInt(searchParams.get("limit") || "20", 10);
// // //     const records = await Attendance.find({ user: userId })
// // //       .populate("shift", "name startTime endTime")
// // //       .populate("manager", "firstName lastName email")
// // //       .sort({ createdAt: -1 })
// // //       .limit(limit);

// // //     return NextResponse.json({ success: true, data: records });
// // //   } catch (error) {
// // //     console.error("GET /api/attendance/my error:", error);
// // //     return NextResponse.json({ success: false, message: error.message }, { status: 500 });
// // //   }
// // // }




// // // app/api/attendance/my/route.js
// // import { NextResponse } from "next/server";
// // import connectDB from "@/lib/mongodb";
// // import Attendance from "@/Models/Attendance";
// // import { verifyToken, getUserIdFromToken } from "@/lib/jwt";

// // export async function GET(request) {
// //   try {
// //     await connectDB();
    
// //     // ✅ FIXED: Get token from headers
// //     const authHeader = request.headers.get('authorization');
// //     if (!authHeader || !authHeader.startsWith('Bearer ')) {
// //       return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
// //     }
    
// //     const token = authHeader.replace('Bearer ', '');
// //     const decoded = verifyToken(token);
    
// //     if (!decoded) {
// //       return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
// //     }

// //     // ✅ FIXED: Use getUserIdFromToken
// //     const userId = getUserIdFromToken(decoded);

// //     const { searchParams } = new URL(request.url);
// //     const month = parseInt(searchParams.get("month") || "", 10);
// //     const year = parseInt(searchParams.get("year") || "", 10);

// //     // ✅ FIXED: Check if user is agent or regular user
// //     const isAgent = decoded.type === 'agent';
// //     const queryField = isAgent ? 'agent' : 'user';

// //     if (month && year) {
// //       const from = new Date(year, month - 1, 1, 0, 0, 0, 0);
// //       const to = new Date(year, month, 1, 0, 0, 0, 0);

// //       const attends = await Attendance.find({
// //         [queryField]: userId, // ✅ Dynamic field based on user type
// //         createdAt: { $gte: from, $lt: to },
// //       }).populate("shift", "name startTime endTime");

// //       const present = attends.filter(a => a.checkInTime).length;
// //       const presentWithCheckout = attends.filter(a => a.checkInTime && a.checkOutTime).length;
// //       const overtimeMinutes = attends.reduce((s, a) => s + (a.overtimeMinutes || 0), 0);
// //       const leaves = attends.filter(a => a.status === "leave").length;
// //       const daysInMonth = Math.floor((to - from) / (24 * 60 * 60 * 1000));
// //       const absent = Math.max(0, daysInMonth - present - leaves);

// //       return NextResponse.json({
// //         success: true,
// //         data: {
// //           month,
// //           year,
// //           totalDays: daysInMonth,
// //           present,
// //           presentWithCheckout,
// //           absent,
// //           leaves,
// //           overtimeMinutes,
// //           records: attends,
// //         },
// //       });
// //     }

// //     // Otherwise recent records
// //     const limit = parseInt(searchParams.get("limit") || "20", 10);
// //     const records = await Attendance.find({ [queryField]: userId })
// //       .populate("shift", "name startTime endTime")
// //       // .populate("manager", "firstName lastName email")
// //       .sort({ createdAt: -1 })
// //       .limit(limit);

// //     return NextResponse.json({ 
// //       success: true, 
// //       data: records 
// //     });

// //   } catch (error) {
// //     console.error("GET /api/attendance/my error:", error);
// //     return NextResponse.json({ 
// //       success: false, 
// //       message: error.message 
// //     }, { status: 500 });
// //   }
// // }



// // app/api/attendance/my/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/lib/mongodb";
// import Attendance from "@/Models/Attendance";
// import { verifyToken, getUserIdFromToken } from "@/lib/jwt";

// export async function GET(request) {
//   try {
//     await connectDB();
    
//     // Get token from headers
//     const authHeader = request.headers.get('authorization');
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
//     }
    
//     const token = authHeader.replace('Bearer ', '');
//     const decoded = verifyToken(token);
    
//     if (!decoded) {
//       return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
//     }

//     const userId = getUserIdFromToken(decoded);

//     const { searchParams } = new URL(request.url);
//     const month = parseInt(searchParams.get("month") || "", 10);
//     const year = parseInt(searchParams.get("year") || "", 10);
//     const limit = parseInt(searchParams.get("limit") || "50", 10);

//     // ✅ FIXED: Check if user is agent or regular user
//     const isAgent = decoded.type === 'agent';
//     const queryField = isAgent ? 'agent' : 'user';

//     console.log('🔍 Attendance Query:', {
//       userId,
//       queryField,
//       month,
//       year,
//       limit
//     });

//     let query = { [queryField]: userId };

//     // If month and year provided, get monthly data
//     if (month && year) {
//       const from = new Date(year, month - 1, 1, 0, 0, 0, 0);
//       const to = new Date(year, month, 1, 0, 0, 0, 0);

//       // ✅ FIXED: Use checkInTime instead of createdAt
//       query.checkInTime = { $gte: from, $lt: to };

//       const attends = await Attendance.find(query)
//         .populate("shift", "name startTime endTime")
//         .sort({ checkInTime: -1 });

//       // Calculate statistics
//       const presentDays = attends.filter(a => a.checkInTime).length;
//       const completedDays = attends.filter(a => a.checkInTime && a.checkOutTime).length;
//       const lateDays = attends.filter(a => a.isLate).length;
//       const overtimeDays = attends.filter(a => a.isOvertime).length;
      
//       const totalLateMinutes = attends.reduce((sum, a) => sum + (a.lateMinutes || 0), 0);
//       const totalOvertimeMinutes = attends.reduce((sum, a) => sum + (a.overtimeMinutes || 0), 0);

//       const daysInMonth = new Date(year, month, 0).getDate();
//       const absentDays = Math.max(0, daysInMonth - presentDays);

//       return NextResponse.json({
//         success: true,
//         data: {
//           month,
//           year,
//           totalDays: daysInMonth,
//           present: presentDays,
//           completed: completedDays,
//           absent: absentDays,
//           late: lateDays,
//           overtime: overtimeDays,
//           totalLateMinutes,
//           totalOvertimeMinutes,
//           records: attends,
//         },
//       });
//     }

//     // Otherwise get recent records with proper sorting
//     const records = await Attendance.find(query)
//       .populate("shift", "name startTime endTime")
//       .sort({ checkInTime: -1 }) // Sort by check-in time descending
//       .limit(limit);

//     console.log('📊 Found records:', records.length);
    
//     // ✅ FIXED: Debug each record
//     if (records.length > 0) {
//       console.log('📅 Sample record dates:');
//       records.forEach((record, index) => {
//         console.log(`Record ${index + 1}:`, {
//           checkInTime: record.checkInTime,
//           checkOutTime: record.checkOutTime,
//           date: record.checkInTime ? new Date(record.checkInTime).toDateString() : 'No date'
//         });
//       });
//     }

//     return NextResponse.json({ 
//       success: true, 
//       data: records 
//     });

//   } catch (error) {
//     console.error("GET /api/attendance/my error:", error);
//     return NextResponse.json({ 
//       success: false, 
//       message: error.message 
//     }, { status: 500 });
//   }
// }

// app/api/attendance/my/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";
import { verifyToken, getUserIdFromToken } from "@/lib/jwt";

export async function GET(request) {
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

    // Get user ID from token
    let userId;
    try {
      userId = getUserIdFromToken(decoded);
      console.log('🔍 My Attendance - User ID:', userId);
    } catch (error) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid token data: " + error.message 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month") || "", 10);
    const year = parseInt(searchParams.get("year") || "", 10);
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    // Determine user type
    const isAgent = decoded.type === 'agent';
    const queryField = isAgent ? 'agent' : 'user';

    console.log('🔍 Attendance Query Details:', {
      userId,
      queryField,
      isAgent,
      month,
      year,
      limit
    });

    // Base query
    let query = { [queryField]: userId };

    // If month and year provided, get monthly data
    if (month && year) {
      const from = new Date(year, month - 1, 1, 0, 0, 0, 0);
      const to = new Date(year, month, 1, 0, 0, 0, 0);

      query.checkInTime = { $gte: from, $lt: to };

      const attends = await Attendance.find(query)
        .populate("shift", "name startTime endTime")
        .sort({ checkInTime: -1 });

      // Calculate statistics
      const presentDays = attends.filter(a => a.checkInTime).length;
      const completedDays = attends.filter(a => a.checkInTime && a.checkOutTime).length;
      const lateDays = attends.filter(a => a.isLate).length;
      const overtimeDays = attends.filter(a => a.isOvertime).length;
      
      const totalLateMinutes = attends.reduce((sum, a) => sum + (a.lateMinutes || 0), 0);
      const totalOvertimeMinutes = attends.reduce((sum, a) => sum + (a.overtimeMinutes || 0), 0);

      const daysInMonth = new Date(year, month, 0).getDate();
      const absentDays = Math.max(0, daysInMonth - presentDays);

      return NextResponse.json({
        success: true,
        data: {
          month,
          year,
          totalDays: daysInMonth,
          present: presentDays,
          completed: completedDays,
          absent: absentDays,
          late: lateDays,
          overtime: overtimeDays,
          totalLateMinutes,
          totalOvertimeMinutes,
          records: attends,
        },
      });
    }

    // Otherwise get recent records
    const records = await Attendance.find(query)
      .populate("shift", "name startTime endTime")
      .sort({ checkInTime: -1 })
      .limit(limit);

    console.log('📊 Found records:', records.length);

    // Debug records
    if (records.length > 0) {
      console.log('📅 Recent attendance records:');
      records.forEach((record, index) => {
        const recordDate = record.checkInTime ? new Date(record.checkInTime).toDateString() : 'No date';
        const isToday = record.checkInTime ? 
          new Date(record.checkInTime).toDateString() === new Date().toDateString() : 
          false;
        
        console.log(`  ${index + 1}. ${recordDate} - Today: ${isToday} - CheckOut: ${!!record.checkOutTime}`);
      });
    } else {
      console.log('❌ No attendance records found for user:', userId);
    }

    return NextResponse.json({ 
      success: true, 
      data: records 
    });

  } catch (error) {
    console.error("GET /api/attendance/my error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}