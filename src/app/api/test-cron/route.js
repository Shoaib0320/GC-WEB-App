import { NextResponse } from "next/server";
import { runAutoAttendanceCron } from "@/lib/cronJobs";

export async function GET(request) {
  try {
    console.log('🧪 Manual Cron Test Started...');
    
    const result = await runAutoAttendanceCron();
    
    return NextResponse.json({
      success: true,
      message: 'Cron job test completed',
      data: result,
      timestamp: new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })
    });
  } catch (error) {
    console.error('❌ Cron test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}