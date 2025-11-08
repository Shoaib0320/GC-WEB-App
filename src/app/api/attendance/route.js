// app/api/attendance/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";
import Shift from "@/Models/Shift";
import User from "@/Models/User";
import Agent from "@/Models/Agent";
import { verifyToken } from "@/lib/jwt";

export async function GET(request) {
  try {
    await connectDB();

    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const userType = searchParams.get("userType") || "all";
    const status = searchParams.get("status") || "all";
    const date = searchParams.get("date") || "";

    const skip = (page - 1) * limit;

    // Build filter query
    const filter = {};
    
    // User Type filter
    if (userType !== 'all') {
      if (userType === 'user') {
        filter.user = { $exists: true, $ne: null };
      } else if (userType === 'agent') {
        filter.agent = { $exists: true, $ne: null };
      }
    }

    // Status filter
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Date filter - FIXED: Use date field instead of createdAt
    if (date) {
      const dateObj = new Date(date);
      const startDate = new Date(dateObj);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(dateObj);
      endDate.setHours(23, 59, 59, 999);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    console.log("Filter:", filter); // Debug log

    // Get records with proper population
    const records = await Attendance.find(filter)
      .populate("user", "firstName lastName email")
      .populate("agent", "agentName agentId email")
      .populate("shift", "name startTime endTime")
      .sort({ date: -1, createdAt: -1 }) // Sort by date first, then creation time
      .skip(skip)
      .limit(limit);

    const total = await Attendance.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({ 
      success: true, 
      data: records,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Attendance API Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}