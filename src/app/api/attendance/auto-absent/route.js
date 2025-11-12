//src/app/api/attendance/auto-checkout/route.js
import { NextResponse } from "next/server";
import { markAutoAbsent } from "@/lib/autoAttendanceService";

export async function POST(request) {
  try {
    const result = await markAutoAbsent();
    
    return NextResponse.json({
      success: result.success,
      message: `Auto absent marking completed`,
      data: result
    });
  } catch (error) {
    console.error("POST /api/attendance/auto-absent error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const result = await markAutoAbsent();
    
    return NextResponse.json({
      success: result.success,
      message: `Auto absent marking completed`,
      data: result
    });
  } catch (error) {
    console.error("GET /api/attendance/auto-absent error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}