import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongodb";
import { verifyToken } from "../../../../lib/jwt";
import User from "@/Models/User";
import Role from "@/Models/Role";

export async function GET(request) {
  try {
    await connectDB();

    // Get token from cookie or Authorization header
    let token = request.cookies.get("token")?.value;

    // Check Authorization header if no cookie token
    if (!token) {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // Find user with role populated
    const user = await User.findById(decoded.userId)
      .populate("role")
      .select("-password");

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: "Account is deactivated" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role.name,
          fullName: user.fullName,
          profileImage: user.profileImage,
          phone: user.phone,
          department: user.department,
          position: user.position,
          employeeId: user.employeeId,
          isActive: user.isActive,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
          permissions: user.role.permissions,
        },
      },
    });
  } catch (error) {
    console.error("Get Current User Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get user data",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
