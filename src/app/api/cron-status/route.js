import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";

export async function GET(request) {
  try {
    await connectDB();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Today's auto records
    const autoRecords = await Attendance.find({
      $or: [
        { autoMarked: true },
        { autoCheckedOut: true }
      ],
      createdAt: { $gte: today }
    })
    .populate('agent', 'agentName')
    .populate('user', 'firstName lastName')
    .populate('shift', 'name endTime')
    .sort({ createdAt: -1 })
    .limit(20);

    const stats = {
      today: {
        date: today.toDateString(),
        autoAbsent: autoRecords.filter(r => r.autoMarked).length,
        autoCheckouts: autoRecords.filter(r => r.autoCheckedOut).length,
        total: autoRecords.length
      },
      recent: autoRecords
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}