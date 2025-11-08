// app/api/notifications/route.
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/Models/Notification";
import { verifyToken } from "@/lib/jwt"; // ✅ verifyToken use karo

// GET - All notifications (Admin) OR User-specific notifications
export async function GET(req) {
  await connectDB();

  try {
    // ✅ verifyToken use karo directly
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'admin' or 'user'

    // Admin route - get all notifications
    if (type === 'admin') {
      const allowedRoles = ["admin", "super_admin"];
      if (!allowedRoles.includes(decoded.role)) { // ✅ decoded se role check karo
        return NextResponse.json(
          { message: "Unauthorized: Admin access required" },
          { status: 403 }
        );
      }

      const notifications = await Notification.find({})
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });

      return NextResponse.json(notifications, { status: 200 });
    }

    // User route - get user-specific notifications
    const userId = decoded.userId; // ✅ decoded se userId lo
    const notifications = await Notification.find({
      $or: [
        { targetType: "all" },
        { targetUsers: userId },
      ],
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name");

    return NextResponse.json(notifications, { status: 200 });

  } catch (error) {
          console.log('Notifications GET error:', error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new notification
export async function POST(req) {
  await connectDB();

  try {
    // ✅ Same verifyToken logic
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Check admin permissions
    const allowedRoles = ["admin", "super_admin"];
    if (!allowedRoles.includes(decoded.role)) {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const { title, message, type, targetType, targetUsers } = await req.json();

    // Validate required fields
    if (!title || !message) {
      return NextResponse.json(
        { message: "Title and message are required" },
        { status: 400 }
      );
    }

    // Validate specific users
    if (targetType === "specific" && (!targetUsers || targetUsers.length === 0)) {
      return NextResponse.json(
        { message: "Specific target requires targetUsers" },
        { status: 400 }
      );
    }

    const notificationData = {
      title,
      message,
      type: type || "announcement",
      targetType,
      createdBy: decoded.userId, // ✅ decoded se userId
    };

    if (targetType === "specific") {
      notificationData.targetUsers = targetUsers;
    }

    const notification = new Notification(notificationData);
    await notification.save();

    await notification.populate("createdBy", "name email");

    return NextResponse.json(
      { 
        message: "Notification created successfully",
        notification 
      },
      { status: 201 }
    );

  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}








