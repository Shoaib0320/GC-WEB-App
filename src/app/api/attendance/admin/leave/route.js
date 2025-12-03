// //src/app/api/attendance/admin/leave/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/lib/mongodb";
// import Attendance from "@/Models/Attendance";
// import { verifyToken } from "@/lib/jwt";

// export async function POST(request) {
//   try {
//     await connectDB();

//     const token = request.cookies.get("token")?.value;
//     if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

//     const decoded = verifyToken(token);
//     if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

//     const body = await request.json();
//     const { 
//       userId, 
//       agentId, 
//       startDate, 
//       endDate, 
//       leaveType, 
//       reason 
//     } = body;

//     if ((!userId && !agentId) || !startDate || !endDate || !leaveType || !reason) {
//       return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 });
//     }

//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     const results = [];

//     for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
//       const dateStart = new Date(date);
//       dateStart.setHours(0, 0, 0, 0);
//       const dateEnd = new Date(dateStart);
//       dateEnd.setDate(dateEnd.getDate() + 1);

//       const existingQuery = {
//         createdAt: { $gte: dateStart, $lt: dateEnd }
//       };

//       if (userId) {
//         existingQuery.user = userId;
//       } else {
//         existingQuery.agent = agentId;
//       }

//       const existing = await Attendance.findOne(existingQuery);

//       const attendanceData = {
//         shift: null,
//         status: "approved_leave",
//         leaveReason: reason,
//         leaveType: leaveType,
//         createdAt: date,
//         updatedAt: new Date()
//       };

//       if (userId) {
//         attendanceData.user = userId;
//       } else {
//         attendanceData.agent = agentId;
//       }

//       let attendance;
//       if (existing) {
//         Object.assign(existing, attendanceData);
//         await existing.save();
//         attendance = existing;
//       } else {
//         attendance = await Attendance.create(attendanceData);
//       }

//       results.push(attendance);
//     }

//     return NextResponse.json({ 
//       success: true, 
//       message: `Leave assigned for ${results.length} days`, 
//       data: results 
//     }, { status: 201 });
//   } catch (error) {
//     console.error("POST /api/attendance/admin/leave error:", error);
//     return NextResponse.json({ success: false, message: error.message }, { status: 500 });
//   }
// }

// src/app/api/attendance/admin/leave/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";
import LeaveRequest from "@/Models/LeaveRequest";
import { verifyToken } from "@/lib/jwt";
import Agent from "@/Models/Agent";
import User from "@/Models/User";

export async function POST(request) {
  try {
    await connectDB();

    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    const body = await request.json();
    const { 
      userId, 
      agentId, 
      startDate, 
      endDate, 
      leaveType, 
      reason 
    } = body;

    if ((!userId && !agentId) || !startDate || !endDate || !leaveType || !reason) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ success: false, message: "Invalid dates" }, { status: 400 });
    }

    if (end < start) {
      return NextResponse.json({ success: false, message: "End date cannot be before start date" }, { status: 400 });
    }

    const targetId = userId || agentId;
    const userType = userId ? 'user' : 'agent';

    // 🔴 Step 1: Get agent/user shift information
    let shift = null;
    let agentOrUserInfo = null;
    
    if (userType === 'agent') {
      agentOrUserInfo = await Agent.findById(targetId).select("shift");
      shift = agentOrUserInfo?.shift || null;
    } else {
      agentOrUserInfo = await User.findById(targetId).select("shift");
      shift = agentOrUserInfo?.shift || null;
    }

    // 🔴 Step 2: Check for existing leave requests for these dates
    const dateRange = [];
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      dateRange.push(new Date(date));
    }

    // Check in LeaveRequest collection
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
      existingLeaveQuery.agent = targetId;
    } else {
      existingLeaveQuery.user = targetId;
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
        message: `User already has ${existingLeaves[0].status} leave for date(s): ${conflictingDates.join(', ')}` 
      }, { status: 400 });
    }

    // Also check in Attendance collection for approved leaves
    const existingAttendanceLeaveQuery = {
      $or: dateRange.map(date => {
        const dateStart = new Date(date);
        dateStart.setHours(0, 0, 0, 0);
        const dateEnd = new Date(dateStart);
        dateEnd.setDate(dateEnd.getDate() + 1);

        return {
          createdAt: { $gte: dateStart, $lt: dateEnd },
          status: "approved_leave"
        };
      })
    };

    if (userType === 'agent') {
      existingAttendanceLeaveQuery.agent = targetId;
    } else {
      existingAttendanceLeaveQuery.user = targetId;
    }

    const existingAttendanceLeaves = await Attendance.find(existingAttendanceLeaveQuery);
    
    if (existingAttendanceLeaves.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Leave already assigned for some of these dates" 
      }, { status: 400 });
    }

    // 🔴 Step 3: Create a leave request for tracking
    const leaveRequestData = {
      leaveType,
      startDate: start,
      endDate: end,
      reason,
      status: "approved",
      reviewedBy: decoded.id || decoded.userId,
      reviewedAt: new Date(),
      shift: shift
    };

    if (userType === 'agent') {
      leaveRequestData.agent = targetId;
    } else {
      leaveRequestData.user = targetId;
    }

    const leaveRequest = await LeaveRequest.create(leaveRequestData);

    const results = [];

    // 🔴 Step 4: Process each date
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateStart = new Date(date);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(dateStart);
      dateEnd.setDate(dateEnd.getDate() + 1);

      const existingQuery = {
        createdAt: { $gte: dateStart, $lt: dateEnd }
      };

      if (userType === 'agent') {
        existingQuery.agent = targetId;
      } else {
        existingQuery.user = targetId;
      }

      const existing = await Attendance.findOne(existingQuery);

      const attendanceData = {
        shift: shift, // 🔴 Save the shift
        status: "approved_leave",
        leaveReason: reason,
        leaveType: leaveType,
        leaveRequest: leaveRequest._id,
        createdAt: date,
        updatedAt: new Date()
      };

      if (userType === 'agent') {
        attendanceData.agent = targetId;
      } else {
        attendanceData.user = targetId;
      }

      let attendance;
      if (existing) {
        // If attendance exists (user checked in), update it
        attendanceData.checkOutTime = null; // Clear check out time
        Object.assign(existing, attendanceData);
        await existing.save();
        attendance = existing;
      } else {
        // Create new attendance record
        attendanceData.date = dateStart;
        attendance = await Attendance.create(attendanceData);
      }

      results.push(attendance);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Leave assigned for ${results.length} days`, 
      data: results 
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/attendance/admin/leave error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}