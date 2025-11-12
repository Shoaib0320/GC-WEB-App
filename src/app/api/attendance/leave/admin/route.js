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

// // Admin can approve/reject leave requests
// src/app/api/attendance/leave/admin/route.js (PUT)
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

    // Update leave request meta
    leaveRequest.status = status;
    leaveRequest.reviewedBy = decoded.userId;
    leaveRequest.reviewedAt = new Date();
    leaveRequest.comments = comments || "";
    await leaveRequest.save();

    // Only create attendance records when approved
    if (status === "approved") {
      // Ensure start/end exist
      if (!leaveRequest.startDate || !leaveRequest.endDate) {
        console.warn("Missing startDate or endDate on leaveRequest");
      } else {
        // Normalize to UTC midnight to avoid timezone drift
        const startRaw = new Date(leaveRequest.startDate);
        const endRaw = new Date(leaveRequest.endDate);

        // If end < start, swap
        let startMs = startRaw.getTime();
        let endMs = endRaw.getTime();
        if (endMs < startMs) {
          const t = startMs; startMs = endMs; endMs = t;
        }

        // normalize to UTC midnight
        const start = new Date(startMs);
        start.setUTCHours(0, 0, 0, 0);
        const end = new Date(endMs);
        end.setUTCHours(0, 0, 0, 0);

        const isAgent = !!leaveRequest.agent;
        const person = isAgent ? leaveRequest.agent : leaveRequest.user;
        const shiftId = isAgent ? leaveRequest.agent?.shift : leaveRequest.user?.shift;

        if (!person) {
          console.warn("No related person (agent/user) on leave request — skipping attendance creation.");
        } else if (!shiftId) {
          console.warn("Shift missing for related person — cannot create attendance (shift is required).");
        } else {
          // Iterate day-by-day using ms arithmetic (safer across DST)
          for (let dayMs = start.getTime(); dayMs <= end.getTime(); dayMs += 24 * 60 * 60 * 1000) {
            const dateOnly = new Date(dayMs);
            dateOnly.setUTCHours(0, 0, 0, 0); // ensure UTC midnight

            // Build exact-match query on normalized date
            const query = { date: dateOnly };
            if (isAgent) query.agent = person._id;
            else query.user = person._id;

            let attendance = await Attendance.findOne(query);

            if (attendance) {
              // update existing
              attendance.status = "approved_leave";
              attendance.leaveType = leaveRequest.leaveType;
              attendance.leaveReason = leaveRequest.reason;
              attendance.approvedBy = decoded.userId;
              attendance.approvedAt = new Date();
              attendance.shift = shiftId; // ensure shift is present
              await attendance.save();
              console.log(`✔ Updated attendance for ${dateOnly.toISOString().slice(0,10)}`);
            } else {
              // create new
              const newAtt = new Attendance({
                shift: shiftId,
                date: dateOnly,
                status: "approved_leave",
                leaveType: leaveRequest.leaveType,
                leaveReason: leaveRequest.reason,
                approvedBy: decoded.userId,
                approvedAt: new Date(),
                ...(isAgent ? { agent: person._id } : { user: person._id }),
              });
              await newAtt.save();
              console.log(`➕ Created attendance for ${dateOnly.toISOString().slice(0,10)}`);
            }
          } // end for
        } // end shift/person checks
      } // end start/end checks
    } // end if approved

    return NextResponse.json({
      success: true,
      message: `Leave request ${status} successfully`,
      data: leaveRequest,
    });
  } catch (error) {
    console.error("PUT /api/attendance/leave/admin error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
