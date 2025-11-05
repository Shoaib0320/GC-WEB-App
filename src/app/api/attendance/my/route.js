// app/api/attendance/my/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";
import { verifyToken, getUserIdFromToken } from "@/lib/jwt";
import Shift from "@/Models/Shift";
import Agent from "@/Models/Agent"; 

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

      query.checkInTime = { 
        $gte: todayStart, 
        $lt: todayEnd 
      };

      const todayAttendance = await Attendance.findOne(query)
        .populate("shift", "name startTime endTime hours days")
        .populate("user", "firstName lastName email")
        .populate("agent", "agentName agentId email")
        .sort({ checkInTime: -1 });

      console.log('📅 Today attendance result:', {
        found: !!todayAttendance,
        checkInTime: todayAttendance?.checkInTime,
        checkOutTime: todayAttendance?.checkOutTime
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
      
      query.checkInTime = { 
        $gte: startDate, 
        $lte: endDate 
      };
    }

    // 📊 Monthly data request
    if (month && year) {
      console.log('📊 Fetching monthly data:', { month, year });
      
      const from = new Date(year, month - 1, 1, 0, 0, 0, 0);
      const to = new Date(year, month, 1, 0, 0, 0, 0);

      query.checkInTime = { $gte: from, $lt: to };

      const attends = await Attendance.find(query)
        .populate("shift", "name startTime endTime hours days")
        .populate("user", "firstName lastName email")
        .populate("agent", "agentName agentId email")
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

      console.log('📈 Monthly stats calculated:', {
        month, year,
        present: presentDays,
        completed: completedDays,
        late: lateDays,
        overtime: overtimeDays,
        absent: absentDays,
        totalRecords: attends.length
      });

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

    // 📜 Regular records with pagination
    const skip = (page - 1) * limit;
    
    console.log('📜 Fetching regular records:', {
      queryField,
      userId,
      limit,
      skip,
      page
    });

    const [records, total] = await Promise.all([
      Attendance.find(query)
        .populate("shift", "name startTime endTime hours days")
        .populate("user", "firstName lastName email")
        .populate("agent", "agentName agentId email")
        .sort({ checkInTime: -1 })
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
          checkInTime: record.checkInTime,
          checkOutTime: record.checkOutTime,
          date: record.checkInTime ? new Date(record.checkInTime).toDateString() : 'No date',
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