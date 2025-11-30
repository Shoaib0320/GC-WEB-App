// //src/app/api/attendance/leave/requests/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/lib/mongodb";
// import LeaveRequest from "@/Models/LeaveRequest";
// import { verifyToken } from "@/lib/jwt";

// export async function GET(request) {
//   try {
//     await connectDB();

//     const token = request.cookies.get("token")?.value;
//     if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

//     const decoded = verifyToken(token);
//     if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

//     const { searchParams } = new URL(request.url);
//     const status = searchParams.get("status") || "all";

//     const query = {};
//     if (status !== 'all') {
//       query.status = status;
//     }

//     const leaveRequests = await LeaveRequest.find(query)
//       .populate("user", "firstName lastName email")
//       .populate("agent", "agentName agentId email")
//       .populate("reviewedBy", "firstName lastName email")
//       .sort({ createdAt: -1 });

//     return NextResponse.json({ 
//       success: true, 
//       data: leaveRequests 
//     });
//   } catch (error) {
//     console.error("GET /api/attendance/leave/requests error:", error);
//     return NextResponse.json({ success: false, message: error.message }, { status: 500 });
//   }
// }

// export async function PUT(request) {
//   try {
//     await connectDB();

//     const token = request.cookies.get("token")?.value;
//     if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

//     const decoded = verifyToken(token);
//     if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

//     const body = await request.json();
//     const { requestId, status, comments } = body;

//     if (!requestId || !status) {
//       return NextResponse.json({ success: false, message: "Request ID and status are required" }, { status: 400 });
//     }

//     const leaveRequest = await LeaveRequest.findById(requestId)
//       .populate("user")
//       .populate("agent");

//     if (!leaveRequest) {
//       return NextResponse.json({ success: false, message: "Leave request not found" }, { status: 404 });
//     }

//     leaveRequest.status = status;
//     leaveRequest.reviewedBy = decoded.userId;
//     leaveRequest.reviewedAt = new Date();
//     leaveRequest.comments = comments || "";

//     await leaveRequest.save();

//     return NextResponse.json({ 
//       success: true, 
//       message: `Leave request ${status} successfully`,
//       data: leaveRequest 
//     });
//   } catch (error) {
//     console.error("PUT /api/attendance/leave/requests error:", error);
//     return NextResponse.json({ success: false, message: error.message }, { status: 500 });
//   }
// }



// src/app/api/attendance/leave/requests/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import LeaveRequest from "@/Models/LeaveRequest";
import Attendance from "@/Models/Attendance";
import { verifyToken } from "@/lib/jwt";
import User from "@/Models/User";
import Agent from "@/Models/Agent";

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
    const { requestId, status, comments } = body;

    if (!requestId || !status) {
      return NextResponse.json(
        { success: false, message: "Request ID and status are required" },
        { status: 400 }
      );
    }

    const leaveRequest = await LeaveRequest.findById(requestId)
      .populate("agent")
      .populate("user");

    if (!leaveRequest) {
      return NextResponse.json({ success: false, message: "Leave request not found" }, { status: 404 });
    }

    // Update LeaveRequest record
    leaveRequest.status = status;
    leaveRequest.reviewedBy = decoded.userId;
    leaveRequest.reviewedAt = new Date();
    leaveRequest.comments = comments || "";
    await leaveRequest.save();

    // 🚀 Only if approved, create/update Attendance entries
    if (status === "approved") {
      const { agent, startDate, endDate, leaveType, reason } = leaveRequest;
      if (!agent) {
        return NextResponse.json({ success: false, message: "Agent not found for leave request" }, { status: 400 });
      }

      // ✅ Ensure shift exists (required field)
      // const shiftId = agent.shift;
      const shiftId = agent?.shift || user?.shift;
      
      if (!shiftId) {
        console.warn(`⚠️ Agent ${agent.agentName} has no shift assigned — skipping attendance creation`);
        return NextResponse.json({
          success: false,
          message: "Agent shift missing, cannot create attendance records",
        });
      }

      // Loop through each date from startDate to endDate
      const start = new Date(startDate);
      const end = new Date(endDate);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateOnly = new Date(d);
        dateOnly.setHours(0, 0, 0, 0);

        // Find existing attendance for that agent + date
        let attendance = await Attendance.findOne({ agent: agent._id, date: dateOnly });

        if (!attendance) {
          attendance = new Attendance({
            agent: agent._id,
            shift: shiftId, // ✅ Fixed: required field
            date: dateOnly,
            status: "approved_leave",
            leaveType,
            leaveReason: reason,
            approvedBy: decoded.userId,
            approvedAt: new Date(),
          });
        } else {
          attendance.status = "approved_leave";
          attendance.leaveType = leaveType;
          attendance.leaveReason = reason;
          attendance.approvedBy = decoded.userId;
          attendance.approvedAt = new Date();
        }

        await attendance.save();
      }
    }

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
