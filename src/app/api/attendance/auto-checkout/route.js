//src/

import { NextResponse } from "next/server";
import { processAutoCheckout } from "@/lib/autoAttendanceService";

export async function POST(request) {
  try {
    const result = await processAutoCheckout();
    
    return NextResponse.json({
      success: result.success,
      message: `Auto checkout processing completed`,
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