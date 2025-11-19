//src/app/api/attendance/auto-checkout/route.js

import { NextResponse } from "next/server";
// import { processAutoCheckout } from "@/lib/autoAttendanceService";
import { performAutoCheckout } from "@/lib/autoAttendanceService";

export async function POST(request) {
  try {
    const { attendanceId, locationData } = await request.json();

    if (!attendanceId) {
      return NextResponse.json({
        success: false,
        message: "Attendance ID is required"
      }, { status: 400 });
    }

    // Fetch the attendance record
    const Attendance = (await import("@/Models/Attendance")).default;
    const attendance = await Attendance.findById(attendanceId).populate('shift');

    if (!attendance) {
      return NextResponse.json({
        success: false,
        message: "Attendance record not found"
      }, { status: 404 });
    }

    // Perform auto checkout
    const result = await performAutoCheckout(attendance, new Date(), locationData);

    return NextResponse.json({
      success: result.success,
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error("POST /api/attendance/auto-checkout error:", error);
    return NextResponse.json({
      success: false,
      message: error.message
    }, { status: 500 });
  }
}
