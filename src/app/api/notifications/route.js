// app/api/notifications/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/Models/Notification";
import User from "@/Models/User";
import Agent from "@/Models/Agent";

// ✅ GET - All notifications or user-specific
export async function GET(req) {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // 'admin' or 'user'
    const agentIdParam = searchParams.get("agentId");

    let notifications;

    // If agentId query param provided, return notifications relevant to that agent.
    if (agentIdParam) {
      // agentIdParam can be either a Mongo _id (24 hex) or an agent code (e.g., SR002)
      let agentObjectId = agentIdParam;

      // If not a 24-hex string, try to resolve by Agent.agentId field
      if (!/^[a-fA-F0-9]{24}$/.test(String(agentIdParam))) {
        const found = await Agent.findOne({ agentId: String(agentIdParam) });
        if (!found) {
          // Return empty array if agent not found
          return NextResponse.json([], { status: 200 });
        }
        agentObjectId = found._id;
      }

      // Find notifications targeted specifically to this agent OR global ones
      notifications = await Notification.find({
        $or: [
          { targetType: "specific", targetUsers: agentObjectId },
          { targetType: "all" },
          { targetType: "agent" }
        ],
        isActive: true,
      })
        .sort({ createdAt: -1 })
        .populate("createdBy", "name email")
        .populate("targetUsers", "agentName agentId email");

      return NextResponse.json(notifications, { status: 200 });
    }

    // No agentId — fallback to existing behavior
    if (type === "admin") {
      // ✅ Get all notifications (no auth restriction)
      notifications = await Notification.find({})
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });
    } else {
      // ✅ Normal user route (everyone can access)
      notifications = await Notification.find({
        isActive: true,
      })
        .sort({ createdAt: -1 })
        .populate("createdBy", "name");
    }

    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    console.log("Notifications GET error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// ✅ POST - Create new notification (no token required)
export async function POST(req) {
  await connectDB();

  try {
    const { title, message, type, targetType, targetUsers, createdBy } =
      await req.json();

    // Validate required fields
    if (!title || !message) {
      return NextResponse.json(
        { message: "Title and message are required" },
        { status: 400 }
      );
    }

    // Validate specific target users if needed
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
      targetType: targetType || "all",
      createdBy: createdBy || null, // optional
    };

    if (targetType === "specific") {
      // targetModel is required by the schema when targetType === 'specific'.
      // If the client didn't send targetModel, assume these are Agents (admin UI).
      notificationData.targetUsers = targetUsers;
      notificationData.targetModel = "Agent";
    }

    const notification = new Notification(notificationData);
    await notification.save();
    await notification.populate("createdBy", "name email");

    return NextResponse.json(
      {
        message: "Notification created successfully",
        notification,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("Notifications POST error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

