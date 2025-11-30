//src/app/api/attendance/leave/request/route.js
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

    // Token extraction (same as before)
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

    // Validation
    if (!leaveType || !startDate || !reason) {
      return NextResponse.json({ 
        success: false, 
        message: "Leave type, start date and reason are required" 
      }, { status: 400 });
    }

    // ✅ Date validation improved
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
      
      // Check if end date is before start date
      if (endDateObj < startDateObj) {
        return NextResponse.json({ 
          success: false, 
          message: "End date cannot be before start date" 
        }, { status: 400 });
      }
    }

    // If no end date, set it same as start date (single day leave)
    if (!endDateObj) {
      endDateObj = new Date(startDateObj);
    }

    const leaveData = {
      leaveType,
      startDate: startDateObj,
      endDate: endDateObj, // ✅ Always valid date
      reason,
      status: "pending"
    };

    // Set user/agent reference
    if (userType === 'agent') {
      leaveData.agent = decoded.id || decoded.userId;
    } else {
      leaveData.user = decoded.id || decoded.userId;
    }

    const leaveRequest = await LeaveRequest.create(leaveData);

    return NextResponse.json({ 
      success: true, 
      message: "Leave request submitted successfully", 
      data: leaveRequest 
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/attendance/leave/request error:", error);
    
    // Better error messages
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