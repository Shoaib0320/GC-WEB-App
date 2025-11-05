// import { NextResponse } from "next/server";
// import Booking from "@/models/Booking";
// import connectDB from "@/lib/mongodb";

// export async function PUT(req, { params }) {
//   try {
//     await connectDB();
//     const { id } = params;
//     const { newDate, newTimeSlot } = await req.json();

//     // 🧠 Booking dhoondho
//     const booking = await Booking.findById(id);
//     if (!booking) {
//       return NextResponse.json({ error: "Booking not found" }, { status: 404 });
//     }

//     // 🛑 Sirf pending, confirmed, ya rescheduled bookings reschedule ho sakti hain
//     if (!["pending", "confirmed", "rescheduled"].includes(booking.status)) {
//       return NextResponse.json(
//         { error: "Only pending, confirmed, or rescheduled bookings can be updated" },
//         { status: 400 }
//       );
//     }

//     // ✅ Update date, time, and status
//     booking.formData.date = newDate;
//     booking.formData.timeSlot = newTimeSlot;
//     booking.status = "rescheduled";

//     await booking.save();

//     return NextResponse.json({
//       success: true,
//       message: "Booking rescheduled successfully",
//       data: booking,
//     });
//   } catch (error) {
//     console.error("Reschedule error:", error);
//     return NextResponse.json(
//       { error: "Failed to reschedule booking" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import Booking from "@/Models/Booking";
import connectDB from "@/lib/mongodb";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();

    const { newDate, newTimeSlot } = body;

    if (!newDate || !newTimeSlot) {
      return NextResponse.json(
        { success: false, error: "Missing date or time slot" },
        { status: 400, headers: corsHeaders }
      );
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    booking.formData.date = newDate;
    booking.formData.timeSlot = newTimeSlot;
    booking.status = "rescheduled";

    await booking.save();

    return NextResponse.json(
      {
        success: true,
        message: "Booking successfully rescheduled",
        data: booking,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("PUT /api/booking/reschedule/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reschedule booking" },
      { status: 500, headers: corsHeaders }
    );
  }
}
