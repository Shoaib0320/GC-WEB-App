import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";
import { verifyToken, getUserIdFromToken } from "@/lib/jwt";

export async function GET(request) {
  try {
    await connectDB();

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const userId = getUserIdFromToken(decoded);
    const userType = decoded.type || "agent";
    const queryField = userType === "agent" ? "agent" : "user";

    // DB سے پہلی attendance record تلاش کریں
    const firstRecord = await Attendance.findOne({ [queryField]: userId })
      .sort({ createdAt: 1, date: 1 })
      .select('date createdAt');

    if (!firstRecord) {
      return NextResponse.json({ 
        success: true, 
        data: null,
        message: "No attendance records found"
      });
    }

    const sourceDate = firstRecord.date || firstRecord.createdAt || firstRecord.checkInTime;
    const date = new Date(sourceDate);

    return NextResponse.json({
      success: true,
      data: {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        date: date.toISOString(),
        readable: date.toLocaleDateString('en-PK', { 
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
    });

  } catch (error) {
    console.error("❌ First record error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}