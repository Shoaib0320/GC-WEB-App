//src/app/api/attendance/leave/request/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import LeaveRequest from "@/Models/LeaveRequest";
import Attendance from "@/Models/Attendance";
import Agent from "@/Models/Agent";
import User from "@/Models/User";
import { verifyToken, getUserIdFromToken } from "@/lib/jwt";

export async function POST(request) {
  try {
    await connectDB();

    // ✅ Correct token extraction from headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const userId = getUserIdFromToken(decoded);
    const userType = decoded.type || 'agent'; // ✅ Get user type from token

    const body = await request.json();
    const { leaveType, startDate, endDate, reason } = body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 });
    }

    const leaveData = {
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      status: "pending"
    };

    // ✅ Correct user assignment based on type
    if (userType === 'agent') {
      leaveData.agent = userId;
    } else {
      leaveData.user = userId;
    }

    const leaveRequest = await LeaveRequest.create(leaveData);

    return NextResponse.json({ 
      success: true, 
      message: "Leave request submitted successfully", 
      data: leaveRequest 
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/attendance/leave/request error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await connectDB();

    // ✅ Same token extraction for GET
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const userId = getUserIdFromToken(decoded);
    const userType = decoded.type || 'agent';

    const { searchParams } = new URL(request.url);
    const requestUserType = searchParams.get("userType") || userType;

    const query = {};
    if (requestUserType === 'agent') {
      query.agent = userId;
    } else {
      query.user = userId;
    }

    const leaveRequests = await LeaveRequest.find(query)
      .populate("user", "firstName lastName email")
      .populate("agent", "agentName agentId email")
      .populate("reviewedBy", "firstName lastName email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: leaveRequests });
  } catch (error) {
    console.error("GET /api/attendance/leave/request error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}