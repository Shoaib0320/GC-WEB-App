//src/app/api/holidays/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Holiday from "@/Models/Holiday";
import Attendance from "@/Models/Attendance";
import { verifyToken } from "@/lib/jwt";

export async function POST(request) {
  try {
    await connectDB();

    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    const body = await request.json();
    const { name, date, description, isRecurring } = body;

    if (!name || !date) {
      return NextResponse.json({ success: false, message: "Name and date are required" }, { status: 400 });
    }

    const holiday = await Holiday.create({
      name,
      date: new Date(date),
      description,
      isRecurring: isRecurring || false,
      createdBy: decoded.userId
    });

    // Update attendance records for this holiday date
    const holidayDate = new Date(date);
    const dateStart = new Date(holidayDate);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(dateStart);
    dateEnd.setDate(dateEnd.getDate() + 1);

    await Attendance.updateMany(
      {
        createdAt: { $gte: dateStart, $lt: dateEnd },
        status: { $ne: "approved_leave" }
      },
      {
        status: "holiday"
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: "Holiday created successfully", 
      data: holiday 
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/holidays error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");

    const query = {};
    if (year) {
      const startDate = new Date(parseInt(year), 0, 1);
      const endDate = new Date(parseInt(year) + 1, 0, 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    const holidays = await Holiday.find(query)
      .populate("createdBy", "firstName lastName email")
      .sort({ date: 1 });

    return NextResponse.json({ success: true, data: holidays });
  } catch (error) {
    console.error("GET /api/holidays error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();

    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Holiday ID is required" }, { status: 400 });
    }

    await Holiday.findByIdAndDelete(id);

    return NextResponse.json({ 
      success: true, 
      message: "Holiday deleted successfully" 
    });
  } catch (error) {
    console.error("DELETE /api/holidays error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}