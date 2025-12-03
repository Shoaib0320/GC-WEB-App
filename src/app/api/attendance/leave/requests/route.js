// // src/app/api/attendance/leave/requests/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/lib/mongodb";
// import LeaveRequest from "@/Models/LeaveRequest";
// import Attendance from "@/Models/Attendance";
// import { verifyToken } from "@/lib/jwt";
// import User from "@/Models/User";
// import Agent from "@/Models/Agent";

// export async function PUT(request) {
//   try {
//     await connectDB();

//     const token = request.cookies.get("token")?.value;
//     if (!token)
//       return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

//     const decoded = verifyToken(token);
//     if (!decoded)
//       return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

//     const body = await request.json();
//     const { requestId, status, comments } = body;

//     if (!requestId || !status) {
//       return NextResponse.json(
//         { success: false, message: "Request ID and status are required" },
//         { status: 400 }
//       );
//     }

//     const leaveRequest = await LeaveRequest.findById(requestId)
//       .populate("agent")
//       .populate("user");

//     if (!leaveRequest) {
//       return NextResponse.json({ success: false, message: "Leave request not found" }, { status: 404 });
//     }

//     // Update LeaveRequest record
//     leaveRequest.status = status;
//     leaveRequest.reviewedBy = decoded.userId;
//     leaveRequest.reviewedAt = new Date();
//     leaveRequest.comments = comments || "";
//     await leaveRequest.save();

//     // 🚀 Only if approved, create/update Attendance entries
//     if (status === "approved") {
//       const { agent, startDate, endDate, leaveType, reason } = leaveRequest;
//       if (!agent) {
//         return NextResponse.json({ success: false, message: "Agent not found for leave request" }, { status: 400 });
//       }

//       // ✅ Ensure shift exists (required field)
//       // const shiftId = agent.shift;
//       const shiftId = agent?.shift || user?.shift;
      
//       if (!shiftId) {
//         console.warn(`⚠️ Agent ${agent.agentName} has no shift assigned — skipping attendance creation`);
//         return NextResponse.json({
//           success: false,
//           message: "Agent shift missing, cannot create attendance records",
//         });
//       }

//       // Loop through each date from startDate to endDate
//       const start = new Date(startDate);
//       const end = new Date(endDate);

//       for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
//         const dateOnly = new Date(d);
//         dateOnly.setHours(0, 0, 0, 0);

//         // Find existing attendance for that agent + date
//         let attendance = await Attendance.findOne({ agent: agent._id, date: dateOnly });

//         if (!attendance) {
//           attendance = new Attendance({
//             agent: agent._id,
//             shift: shiftId, // ✅ Fixed: required field
//             date: dateOnly,
//             status: "approved_leave",
//             leaveType,
//             leaveReason: reason,
//             approvedBy: decoded.userId,
//             approvedAt: new Date(),
//           });
//         } else {
//           attendance.status = "approved_leave";
//           attendance.leaveType = leaveType;
//           attendance.leaveReason = reason;
//           attendance.approvedBy = decoded.userId;
//           attendance.approvedAt = new Date();
//         }

//         await attendance.save();
//       }
//     }

//     return NextResponse.json({
//       success: true,
//       message: `Leave request ${status} successfully`,
//       data: leaveRequest,
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

    // Check if already approved/rejected
    if (leaveRequest.status === 'approved' || leaveRequest.status === 'rejected') {
      return NextResponse.json({ 
        success: false, 
        message: `Leave request is already ${leaveRequest.status}` 
      }, { status: 400 });
    }

    // Update LeaveRequest record
    leaveRequest.status = status;
    leaveRequest.reviewedBy = decoded.userId;
    leaveRequest.reviewedAt = new Date();
    leaveRequest.comments = comments || "";
    await leaveRequest.save();

    // Determine if it's agent or user
    const isAgentRequest = !!leaveRequest.agent;
    const targetUser = isAgentRequest ? leaveRequest.agent : leaveRequest.user;
    
    if (!targetUser) {
      return NextResponse.json({ 
        success: false, 
        message: "User/Agent not found for leave request" 
      }, { status: 400 });
    }

    const targetId = targetUser._id;
    const userType = isAgentRequest ? 'agent' : 'user';

    // 🚀 Handle approved status
    if (status === "approved") {
      const { startDate, endDate, leaveType, reason } = leaveRequest;
      
      // Get shift from leave request or user/agent profile
      const shiftId = leaveRequest.shift || targetUser.shift;
      
      if (!shiftId) {
        console.warn(`⚠️ ${userType === 'agent' ? 'Agent' : 'User'} ${targetUser.agentName || targetUser.firstName} has no shift assigned — skipping attendance creation`);
        return NextResponse.json({
          success: false,
          message: `${userType === 'agent' ? 'Agent' : 'User'} shift missing, cannot create attendance records`,
        });
      }

      // Loop through each date from startDate to endDate
      const start = new Date(startDate);
      const end = new Date(endDate);
      const results = [];

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const currentDate = new Date(d);
        const dateOnly = new Date(currentDate);
        dateOnly.setHours(0, 0, 0, 0);
        
        const dateStart = new Date(dateOnly);
        const dateEnd = new Date(dateStart);
        dateEnd.setDate(dateEnd.getDate() + 1);

        // Find existing attendance for that date
        const query = {
          createdAt: { $gte: dateStart, $lt: dateEnd }
        };
        
        if (userType === 'agent') {
          query.agent = targetId;
        } else {
          query.user = targetId;
        }

        let attendance = await Attendance.findOne(query);

        if (!attendance) {
          // Create new attendance record
          const attendanceData = {
            shift: shiftId,
            date: dateOnly,
            status: "approved_leave",
            leaveType,
            leaveReason: reason,
            leaveRequest: leaveRequest._id,
            approvedBy: decoded.userId,
            approvedAt: new Date(),
            createdAt: currentDate,
            updatedAt: new Date()
          };

          if (userType === 'agent') {
            attendanceData.agent = targetId;
          } else {
            attendanceData.user = targetId;
          }

          attendance = await Attendance.create(attendanceData);
        } else {
          // Update existing attendance
          // 🔴 Important: If user already checked in, clear check out time
          if (attendance.checkInTime) {
            attendance.checkOutTime = null;
          }
          
          attendance.status = "approved_leave";
          attendance.shift = shiftId; // Keep shift updated
          attendance.leaveType = leaveType;
          attendance.leaveReason = reason;
          attendance.leaveRequest = leaveRequest._id;
          attendance.approvedBy = decoded.userId;
          attendance.approvedAt = new Date();
          attendance.updatedAt = new Date();
          
          await attendance.save();
        }

        results.push(attendance);
      }

      return NextResponse.json({
        success: true,
        message: `Leave request approved for ${results.length} days`,
        data: { leaveRequest, attendance: results },
      });
    } 
    // 🚀 Handle rejected status
    else if (status === "rejected") {
      const { startDate, endDate } = leaveRequest;
      const start = new Date(startDate);
      const end = new Date(endDate);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const currentDate = new Date(d);
        const dateOnly = new Date(currentDate);
        dateOnly.setHours(0, 0, 0, 0);
        
        const dateStart = new Date(dateOnly);
        const dateEnd = new Date(dateStart);
        dateEnd.setDate(dateEnd.getDate() + 1);

        const query = {
          createdAt: { $gte: dateStart, $lt: dateEnd },
          leaveRequest: leaveRequest._id
        };
        
        if (userType === 'agent') {
          query.agent = targetId;
        } else {
          query.user = targetId;
        }

        const attendance = await Attendance.findOne(query);
        
        if (attendance) {
          // If it was a pending_leave status (from leave request before approval)
          if (attendance.status === "pending_leave") {
            // If user had checked in, restore to present
            if (attendance.checkInTime) {
              attendance.status = "present";
              attendance.leaveType = undefined;
              attendance.leaveReason = undefined;
              attendance.leaveRequest = undefined;
            } else {
              // If no check in, delete the record
              await Attendance.deleteOne({ _id: attendance._id });
              continue;
            }
          }
          // If it was already approved_leave, revert if possible
          else if (attendance.status === "approved_leave") {
            // If user had checked in, restore to present
            if (attendance.checkInTime) {
              attendance.status = "present";
              attendance.checkOutTime = null; // Keep check out time cleared
            }
            attendance.leaveType = undefined;
            attendance.leaveReason = undefined;
            attendance.leaveRequest = undefined;
            attendance.approvedBy = undefined;
            attendance.approvedAt = undefined;
          }
          
          attendance.updatedAt = new Date();
          await attendance.save();
        }
      }

      return NextResponse.json({
        success: true,
        message: "Leave request rejected successfully",
        data: leaveRequest,
      });
    }
    // 🚀 For other statuses (if any)
    else {
      return NextResponse.json({
        success: true,
        message: `Leave request status updated to ${status}`,
        data: leaveRequest,
      });
    }

  } catch (error) {
    console.error("PUT /api/attendance/leave/requests error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}