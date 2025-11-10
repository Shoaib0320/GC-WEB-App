// src/app/api/booking/reschedule/[id]/route.js
import { NextResponse } from "next/server";
import Booking from "@/Models/Booking";
import connectDB from "@/lib/mongodb";
import { googleCalendar } from "@/lib/googleCalendar";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
// // ✅ Reschedule booking
// export async function PUT(req, { params }) {
//   try {
//     await connectDB();
//     const { id } = params;
//     const body = await req.json();

//     const { newDate, newTimeSlot } = body;

//     if (!newDate || !newTimeSlot) {
//       return NextResponse.json(
//         { success: false, error: "Missing date or time slot" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     const booking = await Booking.findById(id);
//     if (!booking) {
//       return NextResponse.json(
//         { success: false, error: "Booking not found" },
//         { status: 404, headers: corsHeaders }
//       );
//     }

//     booking.formData.date = newDate;
//     booking.formData.timeSlot = newTimeSlot;
//     booking.status = "rescheduled";

//     await booking.save();

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Booking successfully rescheduled",
//         data: booking,
//       },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error) {
//     console.error("PUT /api/booking/reschedule/[id] error:", error);
//     return NextResponse.json(
//       { success: false, error: "Failed to reschedule booking" },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
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

    // ✅ Update booking data
    booking.formData.date = newDate;
    booking.formData.timeSlot = newTimeSlot;
    booking.status = "rescheduled";

    await booking.save();

    // ✅ GOOGLE CALENDAR UPDATE FOR RESCHEDULE
    try {
      await googleCalendar.updateEvent(booking.bookingId, booking);
      console.log('✅ Google Calendar event rescheduled successfully');
    } catch (calendarError) {
      console.error('❌ Google Calendar event reschedule failed:', calendarError);
    }

    // ✅ Reschedule confirmation email bhejein
    try {
      const { formData, bookingId } = booking;
      
      const userHtmlBody = `
        <p>Hi ${formData.firstName},</p>
        <p>Your booking has been successfully rescheduled!</p>
        <p><strong>New Date:</strong> ${newDate}</p>
        <p><strong>New Time:</strong> ${newTimeSlot}</p>
        <p><strong>Booking ID:</strong> ${bookingId}</p>
        <br>
        <p>Thank you for choosing our service!</p>
      `;

      await sendEmail({
        to: formData.email,
        subject: `Booking Rescheduled - ${booking.webName} (#${bookingId})`,
        html: userHtmlBody,
      });

      // Owner ko bhi inform karein
      const ownerHtmlBody = `
        <p>Booking #${bookingId} has been rescheduled:</p>
        <p><strong>Customer:</strong> ${formData.firstName} ${formData.lastName}</p>
        <p><strong>New Date:</strong> ${newDate}</p>
        <p><strong>New Time:</strong> ${newTimeSlot}</p>
        <p><strong>Phone:</strong> ${formData.phone}</p>
      `;

      await sendEmail({
        to: process.env.OWNER_EMAIL,
        subject: `Booking Rescheduled (#${bookingId})`,
        html: ownerHtmlBody,
      });

    } catch (mailError) {
      console.error('❌ Reschedule email sending failed:', mailError);
    }

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