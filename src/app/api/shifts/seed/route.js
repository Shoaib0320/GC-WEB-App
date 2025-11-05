import { NextResponse } from "next/server";
import Shift from "@/Models/Shift";
import connectDB from "@/lib/mongodb";

export async function GET() {
  await connectDB();

  const shifts = [
    { name: "Day Shift", startTime: "09:00", endTime: "17:00" },
    { name: "Evening Shift", startTime: "17:00", endTime: "01:00" },
    { name: "Night Shift", startTime: "01:00", endTime: "09:00" },
  ];

  await Shift.insertMany(shifts);
  return NextResponse.json({ success: true, message: "Shifts added successfully!" });
}
