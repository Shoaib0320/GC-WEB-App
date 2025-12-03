// src/app/api/attendance/leave/request/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import LeaveRequest from "@/Models/LeaveRequest";
import { verifyToken } from "@/lib/jwt";
import Attendance from "@/Models/Attendance";
import Agent from "@/Models/Agent";
import User from "@/Models/User";

export async function POST(request) {
  try {
    await connectDB();

    const authHeader = request.headers.get('authorization');
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    } else {
      token = request.cookies.get("token")?.value;
    }

    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: "Not authenticated" 
      }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid token" 
      }, { status: 401 });
    }

    const body = await request.json();
    const { leaveType, startDate, endDate, reason, userType = 'agent' } = body;

    if (!leaveType || !startDate || !reason) {
      return NextResponse.json({ 
        success: false, 
        message: "Leave type, start date and reason are required" 
      }, { status: 400 });
    }

    const startDateObj = new Date(startDate);
    if (isNaN(startDateObj.getTime())) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid start date" 
      }, { status: 400 });
    }

    let endDateObj = null;
    if (endDate) {
      endDateObj = new Date(endDate);
      if (isNaN(endDateObj.getTime())) {
        return NextResponse.json({ 
          success: false, 
          message: "Invalid end date" 
        }, { status: 400 });
      }
      
      if (endDateObj < startDateObj) {
        return NextResponse.json({ 
          success: false, 
          message: "End date cannot be before start date" 
        }, { status: 400 });
      }
    }

    if (!endDateObj) {
      endDateObj = new Date(startDateObj);
    }

    // 🔴 Step 1: Check for duplicate leave requests (pending or approved)
    const userId = decoded.id || decoded.userId;
    
    // Create date range array for checking
    const dateRange = [];
    for (let date = new Date(startDateObj); date <= endDateObj; date.setDate(date.getDate() + 1)) {
      dateRange.push(new Date(date));
    }

    // Check for existing leave requests for same dates
    const existingLeaveQuery = {
      $or: dateRange.map(date => {
        const dateStart = new Date(date);
        dateStart.setHours(0, 0, 0, 0);
        const dateEnd = new Date(dateStart);
        dateEnd.setDate(dateEnd.getDate() + 1);

        return {
          startDate: { $lt: dateEnd },
          endDate: { $gte: dateStart },
          status: { $in: ['pending', 'approved'] }
        };
      })
    };

    if (userType === 'agent') {
      existingLeaveQuery.agent = userId;
    } else {
      existingLeaveQuery.user = userId;
    }

    const existingLeaves = await LeaveRequest.find(existingLeaveQuery);
    
    if (existingLeaves.length > 0) {
      const conflictingDates = existingLeaves.map(leave => {
        const start = new Date(leave.startDate).toLocaleDateString();
        const end = new Date(leave.endDate).toLocaleDateString();
        return start === end ? start : `${start} to ${end}`;
      });
      
      return NextResponse.json({ 
        success: false, 
        message: `You already have ${existingLeaves[0].status} leave for date(s): ${conflictingDates.join(', ')}` 
      }, { status: 400 });
    }

    // 🔴 Step 2: Get user/agent shift information
    let shift = null;
    let agentOrUserInfo = null;
    
    if (userType === 'agent') {
      agentOrUserInfo = await Agent.findById(userId).select("shift");
      shift = agentOrUserInfo?.shift || null;
    } else {
      agentOrUserInfo = await User.findById(userId).select("shift");
      shift = agentOrUserInfo?.shift || null;
    }

    const leaveData = {
      leaveType,
      startDate: startDateObj,
      endDate: endDateObj,
      reason,
      status: "pending",
      shift: shift // Save shift information with leave
    };

    if (userType === 'agent') {
      leaveData.agent = userId;
    } else {
      leaveData.user = userId;
    }

    const leaveRequest = await LeaveRequest.create(leaveData);

    // 🔴 Step 3: Check if there are existing attendance records for these dates
    // and update them if they exist (for checked-in users)
    for (let date of dateRange) {
      const dateStart = new Date(date);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(dateStart);
      dateEnd.setDate(dateEnd.getDate() + 1);

      const attendanceQuery = {
        createdAt: { $gte: dateStart, $lt: dateEnd }
      };

      if (userType === 'agent') {
        attendanceQuery.agent = userId;
      } else {
        attendanceQuery.user = userId;
      }

      const existingAttendance = await Attendance.findOne(attendanceQuery);
      
      if (existingAttendance) {
        // If user has already checked in, update the attendance to leave
        existingAttendance.status = "pending_leave"; // Temporary status
        existingAttendance.leaveReason = reason;
        existingAttendance.leaveType = leaveType;
        existingAttendance.leaveRequest = leaveRequest._id;
        existingAttendance.checkOutTime = null; // Clear check out time
        
        await existingAttendance.save();
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Leave request submitted successfully", 
      data: leaveRequest 
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/attendance/leave/request error:", error);
    
    let errorMessage = error.message;
    if (error.name === 'ValidationError') {
      errorMessage = Object.values(error.errors).map(err => err.message).join(', ');
    }
    
    return NextResponse.json({ 
      success: false, 
      message: errorMessage 
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await connectDB();

    // Same token extraction logic for GET request
    const authHeader = request.headers.get('authorization');
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    } else {
      token = request.cookies.get("token")?.value;
    }

    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: "Not authenticated" 
      }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid token" 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userType = searchParams.get("userType") || 'user';

    const query = {};
    if (userType === 'agent') {
      query.agent = decoded.id || decoded.userId; // ✅ id use karo
    } else {
      query.user = decoded.id || decoded.userId; // ✅ id use karo
    }

    const leaveRequests = await LeaveRequest.find(query)
      .populate("user", "firstName lastName email")
      .populate("agent", "agentName agentId email")
      .populate("reviewedBy", "firstName lastName email")
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: leaveRequests });
  } catch (error) {
    console.error("GET /api/attendance/leave/request error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

