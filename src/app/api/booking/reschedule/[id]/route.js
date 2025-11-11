// // src/app/api/booking/reschedule/[id]/route.js
// import { NextResponse } from "next/server";
// import Booking from "@/Models/Booking";
// import connectDB from "@/lib/mongodb";
// import { googleCalendar } from "@/lib/googleCalendar";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "PUT, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// export async function OPTIONS() {
//   return new NextResponse(null, { status: 204, headers: corsHeaders });
// }
// // // ✅ Reschedule booking
// // export async function PUT(req, { params }) {
// //   try {
// //     await connectDB();
// //     const { id } = params;
// //     const body = await req.json();

// //     const { newDate, newTimeSlot } = body;

// //     if (!newDate || !newTimeSlot) {
// //       return NextResponse.json(
// //         { success: false, error: "Missing date or time slot" },
// //         { status: 400, headers: corsHeaders }
// //       );
// //     }

// //     const booking = await Booking.findById(id);
// //     if (!booking) {
// //       return NextResponse.json(
// //         { success: false, error: "Booking not found" },
// //         { status: 404, headers: corsHeaders }
// //       );
// //     }

// //     booking.formData.date = newDate;
// //     booking.formData.timeSlot = newTimeSlot;
// //     booking.status = "rescheduled";

// //     await booking.save();

// //     return NextResponse.json(
// //       {
// //         success: true,
// //         message: "Booking successfully rescheduled",
// //         data: booking,
// //       },
// //       { status: 200, headers: corsHeaders }
// //     );
// //   } catch (error) {
// //     console.error("PUT /api/booking/reschedule/[id] error:", error);
// //     return NextResponse.json(
// //       { success: false, error: "Failed to reschedule booking" },
// //       { status: 500, headers: corsHeaders }
// //     );
// //   }
// // }

// export async function PUT(req, { params }) {
//   try {
//     await connectDB();
//     const { id } = await params;
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

//     // ✅ Update booking data
//     booking.formData.date = newDate;
//     booking.formData.timeSlot = newTimeSlot;
//     booking.status = "rescheduled";

//     await booking.save();

//     // ✅ GOOGLE CALENDAR UPDATE FOR RESCHEDULE
//     try {
//       await googleCalendar.updateEvent(booking.bookingId, booking);
//       console.log('✅ Google Calendar event rescheduled successfully');
//     } catch (calendarError) {
//       console.error('❌ Google Calendar event reschedule failed:', calendarError);
//     }

//     // ✅ Reschedule confirmation email bhejein
//     try {
//       const { formData, bookingId } = booking;
      
//       const userHtmlBody = `
//         <p>Hi ${formData.firstName},</p>
//         <p>Your booking has been successfully rescheduled!</p>
//         <p><strong>New Date:</strong> ${newDate}</p>
//         <p><strong>New Time:</strong> ${newTimeSlot}</p>
//         <p><strong>Booking ID:</strong> ${bookingId}</p>
//         <br>
//         <p>Thank you for choosing our service!</p>
//       `;

//       await sendEmail({
//         to: formData.email,
//         subject: `Booking Rescheduled - ${booking.webName} (#${bookingId})`,
//         html: userHtmlBody,
//       });

//       // Owner ko bhi inform karein
//       const ownerHtmlBody = `
//         <p>Booking #${bookingId} has been rescheduled:</p>
//         <p><strong>Customer:</strong> ${formData.firstName} ${formData.lastName}</p>
//         <p><strong>New Date:</strong> ${newDate}</p>
//         <p><strong>New Time:</strong> ${newTimeSlot}</p>
//         <p><strong>Phone:</strong> ${formData.phone}</p>
//       `;

//       await sendEmail({
//         to: process.env.OWNER_EMAIL,
//         subject: `Booking Rescheduled (#${bookingId})`,
//         html: ownerHtmlBody,
//       });

//     } catch (mailError) {
//       console.error('❌ Reschedule email sending failed:', mailError);
//     }

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





// src/app/api/booking/reschedule/[id]/route.js
import { NextResponse } from "next/server";
import Booking from "@/Models/Booking";
import connectDB from "@/lib/mongodb";
import { googleCalendar } from "@/lib/googleCalendar";
import { sendEmail } from "@/lib/mailer";

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
    const { id } = await params; // ✅ Await add kiya
    const body = await req.json();

    console.log('🔄 Reschedule request received for ID:', id);
    console.log('📅 Reschedule data:', body);

    const { newDate, newTimeSlot } = body;

    if (!newDate || !newTimeSlot) {
      return NextResponse.json(
        { success: false, error: "Missing date or time slot" },
        { status: 400, headers: corsHeaders }
      );
    }

    // ✅ Booking find karein
    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    console.log('📋 Found booking:', booking.bookingId);
    console.log('🕒 Old date/time:', booking.formData.date, booking.formData.timeSlot);
    console.log('🕒 New date/time:', newDate, newTimeSlot);

    // ✅ Store old values for email
    const oldDate = booking.formData.date;
    const oldTimeSlot = booking.formData.timeSlot;

    // ✅ Update booking data
    booking.formData.date = newDate;
    booking.formData.timeSlot = newTimeSlot;
    booking.status = "rescheduled";
    booking.updatedAt = new Date();

    await booking.save();
    console.log('✅ Booking updated in database');

    // ✅ GOOGLE CALENDAR UPDATE FOR RESCHEDULE (with better error handling)
    try {
      console.log('📅 Updating Google Calendar event...');
      await googleCalendar.updateEvent(booking.bookingId, booking);
      console.log('✅ Google Calendar event rescheduled successfully');
    } catch (calendarError) {
      console.error('❌ Google Calendar event reschedule failed:', calendarError.message);
      // Calendar error ko fatal nahi banayein - booking to update ho chuki hai
    }

    // ✅ RESCHEDULE CONFIRMATION EMAILS
    try {
      const { formData, bookingId, webName } = booking;
      
      // 📨 User ke liye professional email
      const userHtmlBody = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
                .footer { text-align: center; margin-top: 30px; padding: 20px; background: #e9ecef; border-radius: 8px; }
                .change-highlight { background: #fff3cd; padding: 10px; border-radius: 5px; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔄 Booking Rescheduled</h1>
                    <p>Your appointment has been successfully rescheduled</p>
                </div>
                <div class="content">
                    <h2>Hello ${formData.firstName}!</h2>
                    <p>Your booking with <strong>${webName}</strong> has been rescheduled as per your request.</p>
                    
                    <div class="change-highlight">
                        <h3>📅 Schedule Change</h3>
                        <p><strong>From:</strong> ${oldDate} at ${oldTimeSlot}</p>
                        <p><strong>To:</strong> ${newDate} at ${newTimeSlot}</p>
                    </div>
                    
                    <div class="details">
                        <h3>📋 Booking Details</h3>
                        <p><strong>Booking ID:</strong> ${bookingId}</p>
                        <p><strong>Service:</strong> ${webName}</p>
                        <p><strong>Customer:</strong> ${formData.firstName} ${formData.lastName}</p>
                        <p><strong>Contact:</strong> ${formData.phone}</p>
                        <p><strong>Vehicles:</strong> ${booking.vehicleCount}</p>
                        <p><strong>Address:</strong> ${formData.address}, ${formData.city}</p>
                        <p><strong>Total Amount:</strong> $${booking.discountedPrice}</p>
                    </div>
                    
                    <div class="footer">
                        <p><strong>Need to make changes?</strong></p>
                        <p>Please contact us if you need to modify your booking further.</p>
                        <p>We look forward to serving you!</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
      `;

      // ✅ Emails send karein (agar email configured hai)
      if (process.env.EMAIL_SERVER_HOST) {
        // User ko email
        await sendEmail({
          to: formData.email,
          subject: `🔄 Booking Rescheduled - ${webName} (#${bookingId})`,
          html: userHtmlBody,
        });
        console.log('✅ Reschedule email sent to user');

        // Owner ko email
        if (process.env.OWNER_EMAIL) {
          const ownerHtmlBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>🔄 Booking Rescheduled</h2>
              <p>Booking <strong>#${bookingId}</strong> has been rescheduled.</p>
              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p><strong>Customer:</strong> ${formData.firstName} ${formData.lastName}</p>
                <p><strong>Old Schedule:</strong> ${oldDate} at ${oldTimeSlot}</p>
                <p><strong>New Schedule:</strong> ${newDate} at ${newTimeSlot}</p>
                <p><strong>Contact:</strong> ${formData.phone} | ${formData.email}</p>
              </div>
            </div>
          `;

          await sendEmail({
            to: process.env.OWNER_EMAIL,
            subject: `🔄 Booking #${bookingId} Rescheduled`,
            html: ownerHtmlBody,
          });
          console.log('✅ Reschedule notification sent to owner');
        }
      } else {
        console.log('⚠️ Email not configured - skipping email sending');
      }

    } catch (mailError) {
      console.error('❌ Reschedule email sending failed:', mailError.message);
      // Email error ko fatal nahi banayein
    }

    return NextResponse.json(
      {
        success: true,
        message: "Booking successfully rescheduled",
        data: {
          ...booking.toObject(),
          previousDate: oldDate,
          previousTimeSlot: oldTimeSlot
        },
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