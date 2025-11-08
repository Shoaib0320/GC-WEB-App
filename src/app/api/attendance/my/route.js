// // app/api/attendance/my/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/lib/mongodb";
// import Attendance from "@/Models/Attendance";
// import { verifyToken, getUserIdFromToken } from "@/lib/jwt";
// import Shift from "@/Models/Shift";
// import Agent from "@/Models/Agent"; 

// export async function GET(request) {
//   try {
//     await connectDB();
//     console.log('🔍 Attendance My Route - Started');
    
//     // Get token from headers
//     const authHeader = request.headers.get('authorization');
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       console.log('❌ No auth header');
//       return NextResponse.json({ 
//         success: false, 
//         message: "Not authenticated" 
//       }, { status: 401 });
//     }
    
//     const token = authHeader.replace('Bearer ', '');
//     const decoded = verifyToken(token);
    
//     if (!decoded) {
//       console.log('❌ Invalid token');
//       return NextResponse.json({ 
//         success: false, 
//         message: "Invalid token" 
//       }, { status: 401 });
//     }

//     const userId = getUserIdFromToken(decoded);
//     const userType = decoded.type || 'agent';

//     console.log('👤 User details:', {
//       userId,
//       userType,
//       agentId: decoded.agentId
//     });

//     const { searchParams } = new URL(request.url);
//     const month = parseInt(searchParams.get("month") || "", 10);
//     const year = parseInt(searchParams.get("year") || "", 10);
//     const limit = parseInt(searchParams.get("limit") || "50", 10);
//     const page = parseInt(searchParams.get("page") || "1", 10);
//     const today = searchParams.get("today");
//     const start = searchParams.get("start");
//     const end = searchParams.get("end");

//     console.log('📋 Query parameters:', {
//       month, year, limit, page, today, start, end
//     });

//     // ✅ Determine query field based on user type
//     const queryField = userType === 'agent' ? 'agent' : 'user';
//     let query = { [queryField]: userId };

//     // 🎯 SPECIAL CASE: Today's attendance
//     if (today === 'true') {
//       console.log('🎯 Fetching today attendance specifically');
      
//       const now = new Date();
//       const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//       const todayEnd = new Date(todayStart);
//       todayEnd.setDate(todayEnd.getDate() + 1);

//       query.checkInTime = { 
//         $gte: todayStart, 
//         $lt: todayEnd 
//       };

//       const todayAttendance = await Attendance.findOne(query)
//         .populate("shift", "name startTime endTime hours days")
//         .populate("user", "firstName lastName email")
//         .populate("agent", "agentName agentId email")
//         .sort({ checkInTime: -1 });

//       console.log('📅 Today attendance result:', {
//         found: !!todayAttendance,
//         checkInTime: todayAttendance?.checkInTime,
//         checkOutTime: todayAttendance?.checkOutTime
//       });

//       return NextResponse.json({
//         success: true,
//         data: todayAttendance
//       });
//     }

//     // 📅 Date range filter
//     if (start && end) {
//       console.log('📅 Applying date range filter');
//       const startDate = new Date(start);
//       const endDate = new Date(end);
      
//       query.checkInTime = { 
//         $gte: startDate, 
//         $lte: endDate 
//       };
//     }

//     // 📊 Monthly data request
//     if (month && year) {
//       console.log('📊 Fetching monthly data:', { month, year });
      
//       const from = new Date(year, month - 1, 1, 0, 0, 0, 0);
//       const to = new Date(year, month, 1, 0, 0, 0, 0);

//       query.checkInTime = { $gte: from, $lt: to };

//       const attends = await Attendance.find(query)
//         .populate("shift", "name startTime endTime hours days")
//         .populate("user", "firstName lastName email")
//         .populate("agent", "agentName agentId email")
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

//       console.log('📈 Monthly stats calculated:', {
//         month, year,
//         present: presentDays,
//         completed: completedDays,
//         late: lateDays,
//         overtime: overtimeDays,
//         absent: absentDays,
//         totalRecords: attends.length
//       });

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

//     // 📜 Regular records with pagination
//     const skip = (page - 1) * limit;
    
//     console.log('📜 Fetching regular records:', {
//       queryField,
//       userId,
//       limit,
//       skip,
//       page
//     });

//     const [records, total] = await Promise.all([
//       Attendance.find(query)
//         .populate("shift", "name startTime endTime hours days")
//         .populate("user", "firstName lastName email")
//         .populate("agent", "agentName agentId email")
//         .sort({ checkInTime: -1 })
//         .skip(skip)
//         .limit(limit),
//       Attendance.countDocuments(query)
//     ]);

//     console.log('✅ Records fetched:', {
//       count: records.length,
//       total,
//       page,
//       totalPages: Math.ceil(total / limit)
//     });

//     // Debug: Log first few records
//     if (records.length > 0) {
//       console.log('📅 Sample records:');
//       records.slice(0, 3).forEach((record, index) => {
//         console.log(`Record ${index + 1}:`, {
//           id: record._id,
//           checkInTime: record.checkInTime,
//           checkOutTime: record.checkOutTime,
//           date: record.checkInTime ? new Date(record.checkInTime).toDateString() : 'No date',
//           shift: record.shift?.name
//         });
//       });
//     }

//     return NextResponse.json({ 
//       success: true, 
//       data: records,
//       pagination: {
//         page,
//         limit,
//         total,
//         totalPages: Math.ceil(total / limit),
//         hasNext: page < Math.ceil(total / limit),
//         hasPrev: page > 1
//       }
//     });

//   } catch (error) {
//     console.error("❌ GET /api/attendance/my error:", error);
//     return NextResponse.json({ 
//       success: false, 
//       message: error.message,
//       error: process.env.NODE_ENV === 'development' ? error.stack : undefined
//     }, { status: 500 });
//   }
// }

// app/api/attendance/my/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";
import { verifyToken, getUserIdFromToken } from "@/lib/jwt";
import Shift from "@/Models/Shift";
import Agent from "@/Models/Agent";
import Holiday from "@/Models/Holiday";
import WeeklyOff from "@/Models/WeeklyOff";

// Helper function to get all dates in a month
function getDatesInMonth(year, month) {
  const dates = [];
  const date = new Date(year, month - 1, 1);
  
  while (date.getMonth() === month - 1) {
    dates.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  
  return dates;
}

// Helper function to check if date is weekly off
async function isWeeklyOff(date) {
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const weeklyOff = await WeeklyOff.findOne({ 
    day: dayName, 
    isActive: true 
  });
  return weeklyOff;
}

// Helper function to check if date is holiday
async function isHoliday(date) {
  const dateStart = new Date(date);
  dateStart.setHours(0, 0, 0, 0);
  const dateEnd = new Date(dateStart);
  dateEnd.setDate(dateEnd.getDate() + 1);

  const holiday = await Holiday.findOne({
    $or: [
      { date: { $gte: dateStart, $lt: dateEnd } },
      { 
        isRecurring: true,
        $expr: {
          $and: [
            { $eq: [{ $month: "$date" }, date.getMonth() + 1] },
            { $eq: [{ $dayOfMonth: "$date" }, date.getDate()] }
          ]
        }
      }
    ]
  });
  return holiday;
}

export async function GET(request) {
  try {
    await connectDB();
    console.log('🔍 Attendance My Route - Started');
    
    // Get token from headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No auth header');
      return NextResponse.json({ 
        success: false, 
        message: "Not authenticated" 
      }, { status: 401 });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      console.log('❌ Invalid token');
      return NextResponse.json({ 
        success: false, 
        message: "Invalid token" 
      }, { status: 401 });
    }

    const userId = getUserIdFromToken(decoded);
    const userType = decoded.type || 'agent';

    console.log('👤 User details:', {
      userId,
      userType,
      agentId: decoded.agentId
    });

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month") || "", 10);
    const year = parseInt(searchParams.get("year") || "", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const today = searchParams.get("today");
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    console.log('📋 Query parameters:', {
      month, year, limit, page, today, start, end
    });

    // ✅ Determine query field based on user type
    const queryField = userType === 'agent' ? 'agent' : 'user';
    let query = { [queryField]: userId };

    // 🎯 SPECIAL CASE: Today's attendance
    if (today === 'true') {
      console.log('🎯 Fetching today attendance specifically');
      
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);

      query.$or = [
        { checkInTime: { $gte: todayStart, $lt: todayEnd } },
        { date: { $gte: todayStart, $lt: todayEnd } },
        { createdAt: { $gte: todayStart, $lt: todayEnd } }
      ];

      const todayAttendance = await Attendance.findOne(query)
        .populate("shift", "name startTime endTime hours days")
        .populate("user", "firstName lastName email")
        .populate("agent", "agentName agentId email")
        .sort({ checkInTime: -1 });

      console.log('📅 Today attendance result:', {
        found: !!todayAttendance,
        checkInTime: todayAttendance?.checkInTime,
        checkOutTime: todayAttendance?.checkOutTime,
        status: todayAttendance?.status
      });

      return NextResponse.json({
        success: true,
        data: todayAttendance
      });
    }

    // 📅 Date range filter
    if (start && end) {
      console.log('📅 Applying date range filter');
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      query.$or = [
        { checkInTime: { $gte: startDate, $lte: endDate } },
        { date: { $gte: startDate, $lte: endDate } }
      ];
    }

    // 📊 Monthly data request - UPDATED SMART LOGIC
    if (month && year) {
      console.log('📊 Fetching monthly data with SMART logic:', { month, year });
      
      const from = new Date(year, month - 1, 1, 0, 0, 0, 0);
      const to = new Date(year, month, 1, 0, 0, 0, 0);

      // Get all attendance records for the month
      query.$or = [
        { checkInTime: { $gte: from, $lt: to } },
        { date: { $gte: from, $lt: to } },
        { createdAt: { $gte: from, $lt: to } }
      ];

      const attends = await Attendance.find(query)
        .populate("shift", "name startTime endTime hours days")
        .populate("user", "firstName lastName email")
        .populate("agent", "agentName agentId email")
        .sort({ checkInTime: -1 });

      console.log(`📅 Found ${attends.length} attendance records for month`);

      // 🎯 SMART ABSENT CALCULATION
      const allDatesInMonth = getDatesInMonth(year, month);
      const daysInMonth = allDatesInMonth.length;
      
      let presentDays = 0;
      let holidayDays = 0;
      let weeklyOffDays = 0;
      let leaveDays = 0;
      let actualAbsentDays = 0;

      // Create a map of attendance by date for quick lookup
      const attendanceByDate = {};
      attends.forEach(att => {
        let dateKey;
        
        if (att.checkInTime) {
          dateKey = new Date(att.checkInTime).toDateString();
        } else if (att.date) {
          dateKey = new Date(att.date).toDateString();
        } else {
          dateKey = new Date(att.createdAt).toDateString();
        }
        
        if (dateKey) {
          attendanceByDate[dateKey] = att;
        }
      });

      // Check each date in the month
      for (const date of allDatesInMonth) {
        const dateKey = date.toDateString();
        const attendance = attendanceByDate[dateKey];
        
        if (attendance) {
          // If attendance record exists, check its status
          if (attendance.status === 'present' || attendance.status === 'late') {
            presentDays++;
          } else if (attendance.status === 'holiday') {
            holidayDays++;
          } else if (attendance.status === 'weekly_off') {
            weeklyOffDays++;
          } else if (attendance.status === 'leave' || attendance.status === 'approved_leave') {
            leaveDays++;
          } else if (attendance.status === 'absent') {
            actualAbsentDays++;
          }
        } else {
          // No attendance record - check if it's holiday/weekly off
          const isHolidayDay = await isHoliday(date);
          const isWeeklyOffDay = await isWeeklyOff(date);
          
          if (isHolidayDay) {
            holidayDays++;
          } else if (isWeeklyOffDay) {
            weeklyOffDays++;
          } else {
            // Not holiday, not weekly off, no attendance = ACTUAL ABSENT
            actualAbsentDays++;
          }
        }
      }

      // Calculate other statistics from existing records
      const completedDays = attends.filter(a => a.checkInTime && a.checkOutTime).length;
      const lateDays = attends.filter(a => a.isLate).length;
      const overtimeDays = attends.filter(a => a.isOvertime).length;
      
      const totalLateMinutes = attends.reduce((sum, a) => sum + (a.lateMinutes || 0), 0);
      const totalOvertimeMinutes = attends.reduce((sum, a) => sum + (a.overtimeMinutes || 0), 0);

      console.log('📈 SMART Monthly stats calculated:', {
        month, 
        year,
        totalDays: daysInMonth,
        present: presentDays,
        actualAbsent: actualAbsentDays,
        holiday: holidayDays,
        weeklyOff: weeklyOffDays,
        leave: leaveDays,
        completed: completedDays,
        late: lateDays,
        overtime: overtimeDays,
        totalRecords: attends.length
      });

      return NextResponse.json({
        success: true,
        data: {
          month,
          year,
          totalDays: daysInMonth,
          present: presentDays,
          absent: actualAbsentDays, // ✅ CORRECT ABSENT COUNT
          holiday: holidayDays,
          weeklyOff: weeklyOffDays,
          leave: leaveDays,
          completed: completedDays,
          late: lateDays,
          overtime: overtimeDays,
          totalLateMinutes,
          totalOvertimeMinutes,
          records: attends,
          summary: {
            workingDays: daysInMonth - holidayDays - weeklyOffDays,
            attendanceRate: ((presentDays / (daysInMonth - holidayDays - weeklyOffDays)) * 100).toFixed(2)
          }
        },
      });
    }

    // 📜 Regular records with pagination (No monthly filter)
    const skip = (page - 1) * limit;
    
    console.log('📜 Fetching regular records:', {
      queryField,
      userId,
      limit,
      skip,
      page
    });

    // For regular queries, use date-based sorting
    const [records, total] = await Promise.all([
      Attendance.find(query)
        .populate("shift", "name startTime endTime hours days")
        .populate("user", "firstName lastName email")
        .populate("agent", "agentName agentId email")
        .sort({ 
          date: -1,
          checkInTime: -1,
          createdAt: -1 
        })
        .skip(skip)
        .limit(limit),
      Attendance.countDocuments(query)
    ]);

    console.log('✅ Records fetched:', {
      count: records.length,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });

    // Debug: Log first few records
    if (records.length > 0) {
      console.log('📅 Sample records:');
      records.slice(0, 3).forEach((record, index) => {
        console.log(`Record ${index + 1}:`, {
          id: record._id,
          status: record.status,
          checkInTime: record.checkInTime,
          checkOutTime: record.checkOutTime,
          date: record.date || (record.checkInTime ? new Date(record.checkInTime).toDateString() : 'No date'),
          shift: record.shift?.name
        });
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error("❌ GET /api/attendance/my error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
