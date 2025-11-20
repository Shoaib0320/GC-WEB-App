// ✅ 1. Zaroori functions import karein
import { sendEmail } from "@/lib/mailer";
import { getWebsiteConfig } from "@/lib/websiteConfig";
import { getRescheduledEmail } from "@/lib/emailTemplates"; // Reschedule template
import { NextResponse } from "next/server";
import Booking from "@/Models/Booking";
import connectDB from "@/lib/mongodb";
import { googleCalendar } from "@/lib/googleCalendar";
// import { sendEmail } from "@/lib/mailer";


// // ✅ Named imports from emailTemplates
// // Make sure 'emailTemplates.js' is saved in 'src/lib/' or 'lib/' correctly
// import { 
//   getWebsiteConfig, 
//   getRescheduledEmail, 
//   getOwnerNotificationEmail 
// } from "@/lib/emailTemplates"; 

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

    // ✅ FIX: Await the params object before accessing properties
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

    // Booking data update karein
    booking.formData.date = newDate;
    booking.formData.timeSlot = newTimeSlot;
    booking.status = "rescheduled"; // Status ko 'rescheduled' set karein

    // Database mein save karein
    await booking.save();

    // ✅ GOOGLE CALENDAR UPDATE
    try {
      console.log('📅 Updating Google Calendar event...');
      await googleCalendar.updateEvent(booking.bookingId, booking);
      console.log('✅ Google Calendar event rescheduled successfully');
    } catch (calendarError) {
      console.error('❌ Google Calendar event reschedule failed:', calendarError.message);
    }

    // ✅ SEND EMAILS
    try {
      const { formData, bookingId, webName } = booking;
      
      // Ensure config function exists before calling
      if (typeof getWebsiteConfig !== 'function') {
        throw new Error("getWebsiteConfig function missing from imports");
      }

      const websiteConfig = getWebsiteConfig(webName);
      
      // Templates generate karein
      const userHtmlBody = getRescheduledEmail(booking, websiteConfig);
      const ownerHtmlBody = getOwnerNotificationEmail(booking, websiteConfig);

      // Emails send karein
      if (process.env.EMAIL_SERVER_HOST) {
        // User Email
        await sendEmail({
          to: formData.email,
          subject: `🔄 Booking Rescheduled - ${webName} (#${bookingId})`,
          html: userHtmlBody,
        });
        console.log('✅ Reschedule email sent to user');

        // Owner Email
        if (process.env.OWNER_EMAIL) {
          await sendEmail({
            to: websiteConfig.ownerEmail || process.env.OWNER_EMAIL,
            subject: `🚨 RESCHEDULE ALERT: #${bookingId} (${webName}) - NEW: ${newDate}`,
            html: ownerHtmlBody,
          });
          console.log('✅ Reschedule notification sent to owner');
        }
      } else {
        console.log('⚠️ Email not configured - skipping email sending');
      }

      console.log(
        `✅ Reschedule emails sent for booking ${booking.bookingId}`
      );
    } catch (mailError) {
      console.error('❌ Reschedule email sending failed:', mailError.message);
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