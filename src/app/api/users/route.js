import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/Models/User";
import Role from "@/Models/Role";
import { verifyToken } from "@/lib/jwt";
import mongoose from "mongoose"; // ✅ Import mongoose

// GET all users (with pagination, filtering, sorting)
export async function GET(request) {
  try {
    await connectDB();

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
    if (!currentUser.role.permissions.user.view) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";

    // Build filter
    let filter = {};

    // Exclude super_admin from results unless current user is super_admin
    if (currentUser.role.name !== "super_admin") {
      const superAdminRole = await Role.findOne({ name: "super_admin" }).select(
        "_id"
      );
      if (superAdminRole) {
        filter.role = { $ne: superAdminRole._id };
      }
    }

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role) {
      const roleDoc = await Role.findOne({ name: role });
      if (roleDoc) {
        filter.role = roleDoc._id;
      }
    }

    if (status) {
      filter.isActive = status === "active";
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;

    const users = await User.find(filter)
      .populate("role")
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("GET Users Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// POST create new user (admin only)
export async function POST(request) {
  try {
    await connectDB();

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
    if (!currentUser.role.permissions.user.create) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Find the role by name and get its ID
    let roleId = body.role;
    
    // Check if role is provided and if it's not a valid ObjectId
    if (body.role && !mongoose.Types.ObjectId.isValid(body.role)) {
      // If it's not a valid ObjectId, try to find role by name
      const role = await Role.findOne({ name: body.role });
      if (role) {
        roleId = role._id;
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

    // Check if user with email already exists
    const existingUser = await User.findOne({ email: body.email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User with this email already exists",
        },
        { status: 400 }
      );
    }

    // Create user with proper role ID
    const userData = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email.toLowerCase(),
      password: body.password,
      phone: body.phone,
      // department: body.department,
      // position: body.position,
      // employeeId: body.employeeId,
      role: roleId,
      createdBy: currentUser._id,
    };

    // Remove empty fields
    Object.keys(userData).forEach(key => {
      if (userData[key] === undefined || userData[key] === '') {
        delete userData[key];
      }
    });

    const user = await User.create(userData);

    const newUser = await User.findById(user._id)
      .populate("role")
      .select("-password");

    return NextResponse.json(
      {
        success: true,
        data: newUser,
        message: "User created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST User Error:", error);

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
        error: "Failed to create user",
        details: error.message,
      },
      { status: 500 }
    );
  }
}