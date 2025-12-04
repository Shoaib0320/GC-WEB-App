import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Shift from "@/Models/Shift";
import { verifyToken } from "@/lib/jwt";
import User from "@/Models/User";
import mongoose from "mongoose";

/**
 * PUT /api/shifts/[id]/status
 * 
 * Toggle shift status (activate/deactivate)
 * 
 * Body:
 * {
 *   "isActive": true/false
 * }
 */
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid shift ID format" },
        { status: 400 }
      );
    }

    // Verify token and check permissions
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // Check if user has permission
    const currentUser = await User.findById(decoded.userId).populate("role");
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check permissions (you can adjust this based on your permission structure)
    // Assuming admin or users with shift management permission can update status
    const hasPermission = 
      currentUser.role?.permissions?.shift?.edit ||
      currentUser.role?.name === "Admin";

    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions to update shift status" },
        { status: 403 }
      );
    }

    // Get request body
    const body = await request.json();
    const { isActive } = body;

    // Validate isActive is a boolean
    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { success: false, error: "isActive must be a boolean value" },
        { status: 400 }
      );
    }

    // Find and update shift
    const shift = await Shift.findById(id);
    if (!shift) {
      return NextResponse.json(
        { success: false, error: "Shift not found" },
        { status: 404 }
      );
    }

    // Update status
    shift.isActive = isActive;
    await shift.save();

    // Return updated shift
    const updatedShift = await Shift.findById(id);

    return NextResponse.json(
      {
        success: true,
        message: `Shift ${isActive ? "activated" : "deactivated"} successfully`,
        data: updatedShift,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT Shift Status Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update shift status",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/shifts/[id]/status
 * 
 * Get shift active status
 */
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid shift ID format" },
        { status: 400 }
      );
    }

    // Verify token
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // Get shift status
    const shift = await Shift.findById(id).select("name startTime endTime isActive");
    if (!shift) {
      return NextResponse.json(
        { success: false, error: "Shift not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          shiftId: shift._id,
          name: shift.name,
          startTime: shift.startTime,
          endTime: shift.endTime,
          isActive: shift.isActive,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET Shift Status Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch shift status",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
