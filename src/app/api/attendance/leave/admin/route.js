//src/app/api/attendance/leave/admin/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import LeaveRequest from "@/Models/LeaveRequest";
import Attendance from "@/Models/Attendance";
import User from "@/Models/User";
import Agent from "@/Models/Agent";
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

// Admin can approve/reject leave requests
export async function PUT(request) {
  try {
    await connectDB();

    const token = request.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded)
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    const body = await request.json();
    const { leaveRequestId, status, comments } = body;

    if (!leaveRequestId || !status) {
      return NextResponse.json(
        { success: false, message: "Leave request ID and status are required" },
        { status: 400 }
      );
    }

    const leaveRequest = await LeaveRequest.findById(leaveRequestId)
      .populate("user")
      .populate("agent");

    if (!leaveRequest) {
      return NextResponse.json({ success: false, message: "Leave request not found" }, { status: 404 });
    }

    // ✅ Update leave request status
    leaveRequest.status = status;
    leaveRequest.reviewedBy = decoded.userId;
    leaveRequest.reviewedAt = new Date();
    leaveRequest.comments = comments || "";
    await leaveRequest.save();

    // ✅ Only process attendance if approved
    if (status === "approved") {
      const startDate = new Date(leaveRequest.startDate);
      const endDate = new Date(leaveRequest.endDate);

      const isAgent = !!leaveRequest.agent;
      const relatedPerson = isAgent ? leaveRequest.agent : leaveRequest.user;

      // ✅ Ensure shift exists (required)
      const shiftId = isAgent ? leaveRequest.agent?.shift : leaveRequest.user?.shift;
      if (!shiftId) {
        console.warn("⚠️ Shift is missing for leave request, skipping attendance creation.");
        return NextResponse.json({
          success: false,
          message: "Shift missing for this person — cannot create attendance records.",
        });
      }

      // 🔁 Loop from start to end date
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateOnly = new Date(d);
        dateOnly.setHours(0, 0, 0, 0);

        const query = isAgent
          ? { agent: relatedPerson._id, date: dateOnly }
          : { user: relatedPerson._id, date: dateOnly };

        let attendance = await Attendance.findOne(query);

        if (attendance) {
          attendance.status = "approved_leave";
          attendance.leaveType = leaveRequest.leaveType;
          attendance.leaveReason = leaveRequest.reason;
          attendance.approvedBy = decoded.userId;
          attendance.approvedAt = new Date();
        } else {
          attendance = new Attendance({
            shift: shiftId, // ✅ REQUIRED field
            date: dateOnly, // ✅ REQUIRED field
            status: "approved_leave",
            leaveType: leaveRequest.leaveType,
            leaveReason: leaveRequest.reason,
            approvedBy: decoded.userId,
            approvedAt: new Date(),
            ...(isAgent
              ? { agent: relatedPerson._id }
              : { user: relatedPerson._id }),
          });
        }

        await attendance.save();
        console.log(`✅ Attendance marked for ${dateOnly.toDateString()}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Leave request ${status} successfully`,
      data: leaveRequest,
    });
  } catch (error) {
    console.error("PUT /api/attendance/leave/admin error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
