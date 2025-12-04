import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/Models/User";
import { verifyToken } from "@/lib/jwt";
import mongoose from "mongoose";

/**
 * PATCH /api/users/[id]/status
 * 
 * Toggle user status (activate/deactivate)
 * 
 * Body:
 * {
 *   "isActive": true/false
 * }
 */
export async function PATCH(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid user ID format" },
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

    // Check if user has permission to update user status
    const currentUser = await User.findById(decoded.userId).populate("role");
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Current user not found" },
        { status: 404 }
      );
    }

    // Check permissions
    if (!currentUser.role.permissions.user.edit) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions to update user status" },
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

    // Find and update user
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent admin from deactivating themselves
    if (id === decoded.userId && !isActive) {
      return NextResponse.json(
        { success: false, error: "You cannot deactivate your own account" },
        { status: 400 }
      );
    }

    // Update status
    user.isActive = isActive;
    user.updatedBy = decoded.userId;

    await user.save();

    // Return updated user without password
    const updatedUser = await User.findById(id)
      .populate("role")
      .select("-password");

    return NextResponse.json(
      {
        success: true,
        message: `User ${isActive ? "activated" : "deactivated"} successfully`,
        data: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH User Status Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user status",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/users/[id]/status
 * 
 * Get user active status
 */
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid user ID format" },
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

    // Get user status
    const user = await User.findById(id).select("isActive firstName lastName email");
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          userId: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isActive: user.isActive,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET User Status Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user status",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
