import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import LeaveRequest from "@/Models/LeaveRequest";
import Attendance from "@/Models/Attendance";
import { verifyToken } from "@/lib/jwt";

export async function GET(request) {
  try {
    await connectDB();

    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    // Check if user is admin
    // You need to implement this check based on your user model

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const leaveRequests = await LeaveRequest.find(query)
      .populate("user", "firstName lastName email")
      .populate("agent", "agentName agentId email")
      .populate("reviewedBy", "firstName lastName email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: leaveRequests });
  } catch (error) {
    console.error("GET /api/attendance/leave/admin error:", error);
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
    const { leaveRequestId, status, comments } = body;

    if (!leaveRequestId || !status) {
      return NextResponse.json({ success: false, message: "Leave request ID and status are required" }, { status: 400 });
    }

    const leaveRequest = await LeaveRequest.findById(leaveRequestId)
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

    // If approved, create attendance records for each day
    if (status === "approved") {
      const startDate = new Date(leaveRequest.startDate);
      const endDate = new Date(leaveRequest.endDate);
      
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const attendanceData = {
          shift: null, // You might want to get the user's default shift
          status: "approved_leave",
          leaveReason: leaveRequest.reason,
          leaveType: leaveRequest.leaveType,
        };

        if (leaveRequest.user) {
          attendanceData.user = leaveRequest.user._id;
        } else if (leaveRequest.agent) {
          attendanceData.agent = leaveRequest.agent._id;
        }

        // Check if attendance record already exists for this date
        const dateStart = new Date(date);
        dateStart.setHours(0, 0, 0, 0);
        const dateEnd = new Date(dateStart);
        dateEnd.setDate(dateEnd.getDate() + 1);

        const existingQuery = {
          createdAt: { $gte: dateStart, $lt: dateEnd }
        };

        if (leaveRequest.user) {
          existingQuery.user = leaveRequest.user._id;
        } else if (leaveRequest.agent) {
          existingQuery.agent = leaveRequest.agent._id;
        }

        const existingAttendance = await Attendance.findOne(existingQuery);

        if (existingAttendance) {
          existingAttendance.status = "approved_leave";
          existingAttendance.leaveReason = leaveRequest.reason;
          existingAttendance.leaveType = leaveRequest.leaveType;
          await existingAttendance.save();
        } else {
          await Attendance.create({
            ...attendanceData,
            createdAt: date,
            updatedAt: date
          });
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Leave request ${status} successfully`,
      data: leaveRequest 
    });
  } catch (error) {
    console.error("PUT /api/attendance/leave/admin error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}