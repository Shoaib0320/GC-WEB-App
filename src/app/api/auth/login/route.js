import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongodb";
import User from "@/Models/User";
import Role from "@/Models/Role";

import { generateToken, getCookieOptions } from "../../../../lib/jwt";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, password } = body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Please provide email and password" },
        { status: 400 }
      );
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).populate("role");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return NextResponse.json(
        { success: false, error: "Incorrect email or password" },
        { status: 401 }
      );
    }

    // 3) Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Your account has been deactivated. Please contact administrator.",
        },
        { status: 401 }
      );
    }

    // 4) Check if account is locked
    if (user.isLocked()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Account locked due to too many failed login attempts. Try again later.",
        },
        { status: 401 }
      );
    }

    // 5) If everything ok, update last login and reset login attempts
    user.lastLogin = new Date();
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    // 6) Generate token
    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role.name,
    });

    const response = NextResponse.json({
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
          permissions: user.role.permissions,
        },
        token,
      },
      message: "Login successful",
    });

    // 7) Set token in cookie
    response.cookies.set("token", token, getCookieOptions());

    return response;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Login failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
