import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb"; // Aap ka DB connection
import Notification from "@/Models/Notification";
import { verifyAuth } from "@/lib/auth"; // Sahi auth file

export async function POST(req) {
  await connectDB();

  try {
    // Step 1: User ko verify karein
    const authData = await verifyAuth(req); // Agar auth failed (token nahi, ya invalid)

    if (authData.error) {
      return NextResponse.json(
        { message: authData.error },
        { status: authData.status }
      );
    } // <-- YAHAN CHANGE HUA (Behtar tareeqa)
    // Ab hum 'admin' aur 'super_admin' dono ko ijazat de rahe hain

    const allowedRoles = ["admin", "super_admin"]; // <-- YAHAN CHANGE HUA: 'authData.userType' ke bajaye 'authData.user.role'

    if (!allowedRoles.includes(authData.user.role)) {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    } // Step 3: Auth pass - Ab asli admin ki ID use karein

    const adminId = authData.userId; // <-- Asli ID auth se mil gayi

    const { title, message, type, targetType, targetUsers, targetModel } =
      await req.json();

    let notificationData = {
      title,
      message,
      type,
      targetType,
      createdBy: adminId, // <-- Asli Admin ID
    };

    if (targetType === "specific") {
      if (!targetUsers || targetUsers.length === 0) {
        return NextResponse.json(
          { message: "Specific target requires targetUsers" },
          { status: 400 }
        );
      }
      notificationData.targetUsers = targetUsers;
      notificationData.targetModel = "User"; // Default 'User'
    }

    const notification = new Notification(notificationData);
    await notification.save();

    return NextResponse.json(
      { message: "Notification created" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  await connectDB();

  try {
    // Step 1: Admin ko verify karein
    const authData = await verifyAuth(req);
    if (authData.error) {
      return NextResponse.json(
        { message: authData.error },
        { status: authData.status }
      );
    } // <-- YAHAN BHI CHANGE HUA: 'authData.userType' ke bajaye 'authData.user.role'

    const allowedRoles = ["admin", "super_admin"];
    if (!allowedRoles.includes(authData.user.role)) {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    } // Step 3: Sari notifications fetch karein

    const notifications = await Notification.find({})
      .populate("createdBy", "name email") // Creator ka naam/email bhi le ayein
      .sort({ createdAt: -1 }); // Sab se nayi wali pehle

    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
