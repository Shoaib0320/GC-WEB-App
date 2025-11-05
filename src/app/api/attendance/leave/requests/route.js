//src/app/api/attendance/leave/requests/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import LeaveRequest from "@/Models/LeaveRequest";
import { verifyToken } from "@/lib/jwt";

export async function GET(request) {
  try {
    await connectDB();

    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";

    const query = {};
    if (status !== 'all') {
      query.status = status;
    }

    const leaveRequests = await LeaveRequest.find(query)
      .populate("user", "firstName lastName email")
      .populate("agent", "agentName agentId email")
      .populate("reviewedBy", "firstName lastName email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ 
      success: true, 
      data: leaveRequests 
    });
  } catch (error) {
    console.error("GET /api/attendance/leave/requests error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectDB();

    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    const body = await request.json();
    const { requestId, status, comments } = body;

    if (!requestId || !status) {
      return NextResponse.json({ success: false, message: "Request ID and status are required" }, { status: 400 });
    }

    const leaveRequest = await LeaveRequest.findById(requestId)
      .populate("user")
      .populate("agent");

    if (!leaveRequest) {
      return NextResponse.json({ success: false, message: "Leave request not found" }, { status: 404 });
    }

    leaveRequest.status = status;
    leaveRequest.reviewedBy = decoded.userId;
    leaveRequest.reviewedAt = new Date();
    leaveRequest.comments = comments || "";

    await leaveRequest.save();

    return NextResponse.json({ 
      success: true, 
      message: `Leave request ${status} successfully`,
      data: leaveRequest 
    });
  } catch (error) {
    console.error("PUT /api/attendance/leave/requests error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}