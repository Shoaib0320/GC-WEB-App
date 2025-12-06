// app/api/notifications/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/Models/Notification";
import { verifyToken } from "@/lib/jwt";

// GET single notification
export async function GET(req, { params }) {
  await connectDB();

  try {
    const authData = await verifyToken(req);
    
    if (authData.error) {
      return NextResponse.json(
        { message: authData.error },
        { status: authData.status }
      );
    }

    const { id } = params;
    const notification = await Notification.findById(id).populate("createdBy", "name email");

    if (!notification) {
      return NextResponse.json(
        { message: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(notification, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// UPDATE notification
export async function PUT(req, { params }) {
  await connectDB();

  try {
    const authData = await verifyToken(req);
    
    if (authData.error) {
      return NextResponse.json(
        { message: authData.error },
        { status: authData.status }
      );
    }

    // Check admin permissions
    const allowedRoles = ["admin", "super_admin"];
    if (!allowedRoles.includes(authData.user?.role)) {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const { id } = params;
    const updateData = await req.json();

    const notification = await Notification.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("createdBy", "name email");

    if (!notification) {
      return NextResponse.json(
        { message: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        message: "Notification updated successfully",
        notification 
      },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE notification
export async function DELETE(req, { params }) {
  await connectDB();

  try {
    const authData = await verifyToken(req);
    
    if (authData.error) {
      return NextResponse.json(
        { message: authData.error },
        { status: authData.status }
      );
    }

    const { id } = await params;
    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return NextResponse.json(
        { message: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Notification deleted successfully" },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}