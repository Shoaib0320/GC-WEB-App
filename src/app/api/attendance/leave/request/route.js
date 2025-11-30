// //src/app/api/attendance/leave/request/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/lib/mongodb";
// import LeaveRequest from "@/Models/LeaveRequest";
// import Attendance from "@/Models/Attendance";
// import { verifyToken } from "@/lib/jwt";

// //
// export async function POST(request) {
//   try {
//     await connectDB();

//     const token = request.cookies.get("token")?.value;
//     if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

//     const decoded = verifyToken(token);
//     if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

//     const body = await request.json();
//     const { leaveType, startDate, endDate, reason, userType = 'user' } = body;

//     if (!leaveType || !startDate || !endDate || !reason) {
//       return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 });
//     }

//     const leaveData = {
//       leaveType,
//       startDate: new Date(startDate),
//       endDate: new Date(endDate),
//       reason,
//       status: "pending"
//     };

//     if (userType === 'agent') {
//       leaveData.agent = decoded.userId;
//     } else {
//       leaveData.user = decoded.userId;
//     }

//     const leaveRequest = await LeaveRequest.create(leaveData);

//     return NextResponse.json({ 
//       success: true, 
//       message: "Leave request submitted successfully", 
//       data: leaveRequest 
//     }, { status: 201 });
//   } catch (error) {
//     console.error("POST /api/attendance/leave/request error:", error);
//     return NextResponse.json({ success: false, message: error.message }, { status: 500 });
//   }
// }

// export async function GET(request) {
//   try {
//     await connectDB();

//     const token = request.cookies.get("token")?.value;
//     if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

//     const decoded = verifyToken(token);
//     if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

//     const { searchParams } = new URL(request.url);
//     const userType = searchParams.get("userType") || 'user';

//     const query = {};
//     if (userType === 'agent') {
//       query.agent = decoded.userId;
//     } else {
//       query.user = decoded.userId;
//     }

//     const leaveRequests = await LeaveRequest.find(query)
//       .populate("user", "firstName lastName email")
//       .populate("agent", "agentName agentId email")
//       .populate("reviewedBy", "firstName lastName email")
//       .sort({ createdAt: -1 });

//     return NextResponse.json({ success: true, data: leaveRequests });
//   } catch (error) {
//     console.error("GET /api/attendance/leave/request error:", error);
//     return NextResponse.json({ success: false, message: error.message }, { status: 500 });
//   }
// }

//src/app/api/attendance/leave/request/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import LeaveRequest from "@/Models/LeaveRequest";
import Attendance from "@/Models/Attendance";
import { verifyToken } from "@/lib/jwt";

export async function POST(request) {
  try {
    await connectDB();

    // Method 1: Authorization header se token lo (frontend compatible)
    const authHeader = request.headers.get('authorization');
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    } else {
      // Method 2: Fallback - cookies se token lo
      token = request.cookies.get("token")?.value;
    }

    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: "Not authenticated" 
      }, { status: 401 });
    }

    // Verify token - string format mein pass karo
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid token" 
      }, { status: 401 });
    }

    const body = await request.json();
    const { leaveType, startDate, endDate, reason, userType = 'user' } = body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return NextResponse.json({ 
        success: false, 
        message: "All fields are required" 
      }, { status: 400 });
    }

    const leaveData = {
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      status: "pending"
    };

    if (userType === 'agent') {
      leaveData.agent = decoded.id || decoded.userId; // ✅ id use karo
    } else {
      leaveData.user = decoded.id || decoded.userId; // ✅ id use karo
    }

    const leaveRequest = await LeaveRequest.create(leaveData);

    return NextResponse.json({ 
      success: true, 
      message: "Leave request submitted successfully", 
      data: leaveRequest 
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/attendance/leave/request error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
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