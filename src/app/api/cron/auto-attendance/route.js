import { NextResponse } from "next/server";
import { processAutoAttendance } from "@/lib/autoAttendance";

export async function GET(request) {
  try {
    // Add authentication for cron job
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const result = await processAutoAttendance();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}