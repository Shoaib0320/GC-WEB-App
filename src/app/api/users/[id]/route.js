import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongodb";
import User from "@/Models/User";
import Role from "@/Models/Role";
import { verifyToken } from "@/lib/jwt";
import mongoose from "mongoose"; // ✅ Import mongoose

// GET user by ID
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const user = await User.findById(id).populate("role").select("-password");

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("GET User Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT update user
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const body = await request.json();

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

    const currentUser = await User.findById(decoded.userId).populate("role");
    if (!currentUser.role.permissions.user.edit) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Handle role conversion if needed
    let updateData = { ...body };
    if (body.role && !mongoose.Types.ObjectId.isValid(body.role)) {
      const role = await Role.findOne({ name: body.role });
      if (role) {
        updateData.role = role._id;
      } else {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid role specified",
          },
          { status: 400 }
        );
      }
    }

    // If password is being updated, it will be hashed by the pre-save middleware
    // If password is empty, remove it from update data
    if (updateData.password === '') {
      delete updateData.password;
    }

    // Check if email is being changed and if it already exists
    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase();
      const existingUser = await User.findOne({ 
        email: updateData.email, 
        _id: { $ne: id } 
      });
      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            error: "User with this email already exists",
          },
          { status: 400 }
        );
      }
    }

    updateData.updatedBy = currentUser._id;

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("role")
      .select("-password");

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("PUT User Error:", error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        {
          success: false,
          error: `User with this ${field} already exists`,
        },
        { status: 400 }
      );
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE user
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("DELETE User Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete user",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
