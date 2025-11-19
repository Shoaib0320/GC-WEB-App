
// import { NextResponse } from "next/server";
// import Booking from "@/Models/Booking";
// import connectDB from "@/lib/mongodb";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "PUT, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// export async function OPTIONS() {
//   return new NextResponse(null, { status: 204, headers: corsHeaders });
// }

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




import { NextResponse } from "next/server";
import Booking from "@/Models/Booking";
import connectDB from "@/lib/mongodb";

// ✅ 1. Zaroori functions import karein
import { sendEmail } from "@/lib/mailer";
import { getWebsiteConfig } from "@/lib/websiteConfig";
import { getRescheduledEmail } from "@/lib/emailTemplates"; // Reschedule template

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

    // Booking data update karein
    booking.formData.date = newDate;
    booking.formData.timeSlot = newTimeSlot;
    booking.status = "rescheduled"; // Status ko 'rescheduled' set karein

    // Database mein save karein
    await booking.save();

    // ✅ 2. Email logic add karein
    try {
      // Sahi website ka config hasil karein
      const config = getWebsiteConfig(booking.webName);

      // User ke liye email template banayein
      const userHtml = getRescheduledEmail(booking, config);

      // User ko email bhej dein
      await sendEmail({
        to: booking.formData.email,
        subject: `Your Booking is Rescheduled - ${config.name} (#${booking.bookingId})`,
        html: userHtml,
      });

      // Owner ko email bhej dein
      await sendEmail({
        to: config.ownerEmail, // Sahi owner ka email
        subject: `Booking Rescheduled (#${booking.bookingId})`,
        html: `<p>Booking ID <strong>#${booking.bookingId}</strong> for ${booking.formData.firstName} has been rescheduled.</p>
               <p><strong>New Date:</strong> ${newDate}</p>
               <p><strong>New Time:</strong> ${newTimeSlot}</p>`,
      });

      console.log(
        `✅ Reschedule emails sent for booking ${booking.bookingId}`
      );
    } catch (mailError) {
      console.error("❌ Failed to send reschedule emails:", mailError);
      // Agar email fail bhi hojaye, tab bhi booking update hojani chahiye
    }

    // Success response bhej dein
    return NextResponse.json(
      {
        success: true,
        message: "Booking successfully rescheduled and emails sent",
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