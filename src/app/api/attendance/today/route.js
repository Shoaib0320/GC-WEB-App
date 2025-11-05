// app/api/attendance/today/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";
import { verifyToken, getUserIdFromToken } from "@/lib/jwt";

export async function GET(request) {
  try {
    await connectDB();
    console.log('🎯 Today Route - Started');
    
    // Authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        success: false, 
        message: "Not authenticated" 
      }, { status: 401 });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid token" 
      }, { status: 401 });
    }

    const userId = getUserIdFromToken(decoded);
    const userType = decoded.type || 'agent';
    const queryField = userType === 'agent' ? 'agent' : 'user';

    // Calculate today's date range
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    console.log('📅 Today range:', {
      todayStart: todayStart.toISOString(),
      todayEnd: todayEnd.toISOString(),
      userId,
      userType
    });

    const todayAttendance = await Attendance.findOne({
      [queryField]: userId,
      checkInTime: { 
        $gte: todayStart, 
        $lt: todayEnd 
      }
    })
    .populate("shift", "name startTime endTime hours days")
    .populate("user", "firstName lastName email")
    .populate("agent", "agentName agentId email")
    .sort({ checkInTime: -1 });

    console.log('✅ Today query result:', {
      found: !!todayAttendance,
      checkInTime: todayAttendance?.checkInTime,
      checkOutTime: todayAttendance?.checkOutTime,
      isLate: todayAttendance?.isLate,
      isOvertime: todayAttendance?.isOvertime
    });

    return NextResponse.json({
      success: true,
      data: todayAttendance,
      todayInfo: {
        todayStart: todayStart.toISOString(),
        todayEnd: todayEnd.toISOString(),
        currentTime: now.toISOString()
      }
    });

  } catch (error) {
    console.error("❌ GET /api/attendance/today error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}