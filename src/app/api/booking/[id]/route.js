// // src/app/api/booking/[id]/route.js
import { NextResponse } from "next/server";
import Booking from "@/Models/Booking";
import connectDB from "@/lib/mongodb";
import { sendEmail } from "@/lib/mailer";

// ✅ 1. ZAROORI IMPORTS ADD KIYE HAIN
import { getWebsiteConfig } from "@/lib/websiteConfig";
import {
  getConfirmationEmail,
  getCancellationEmail,
  getRescheduledEmail,
  getCompletedEmail,
} from "@/lib/emailTemplates";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// ✅ Update booking status OR reschedule
export async function PUT(req, { params }) {
  try {
    await connectDB();

    // ✅ FIX: Await params before destructuring
    const { id } = await params;

    // ✅ Request body se data lein
    const { status, cancellationReason, formData } = await req.json();

    console.log('🔄 PUT Request received:', { id, status, cancellationReason, formData });

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Missing ID or status" },
        { status: 400, headers: corsHeaders }
      );
    }

    // ✅ Allowed statuses
    const allowedStatuses = [
      "pending",
      "confirmed", 
      "cancelled",
      "completed",
      "rescheduled",
      "in-progress",
    ];
    
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status value" },
        { status: 400, headers: corsHeaders }
      );
    }

    // ✅ Update data prepare karein
    const updateData = {
      status,
      updatedAt: new Date()
    };
    
    // ✅ Booking ki existing copy fetch karein (for potential reschedule old values)
    const originalBooking = await Booking.findById(id);

    if (!originalBooking) {
        return NextResponse.json(
          { success: false, error: "Booking not found" },
          { status: 404, headers: corsHeaders }
        );
    }

    // ✅ Cancellation reason add karein
    if (status === "cancelled" && cancellationReason) {
      updateData.cancellationReason = cancellationReason;
    } else if (status !== "cancelled") {
      // Agar status cancelled nahi hai to cancellation reason remove karein
      updateData.cancellationReason = null;
    }

    // ✅ Agar reschedule ho raha hai to date/time bhi update karein
    // Note: Yeh logic manual status update aur reschedule dono ko handle karta hai
    let isRescheduled = false;
    if (formData && (formData.date || formData.timeSlot)) {
      updateData.$set = {
        'formData.date': formData.date || originalBooking.formData.date,
        'formData.timeSlot': formData.timeSlot || originalBooking.formData.timeSlot
      };
      
      // Agar date/time change ho raha hai to status automatically rescheduled karein
      if (formData.date || formData.timeSlot) {
        updateData.status = "rescheduled";
        isRescheduled = true;
      }
    }

    console.log('📝 Update data:', updateData);

    // ✅ Database update karein
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log('✅ Database updated:', updatedBooking.bookingId);

    // ✅ GOOGLE CALENDAR UPDATE
    try {
      console.log('📅 Updating Google Calendar event for:', updatedBooking.bookingId);
      await googleCalendar.updateEvent(updatedBooking.bookingId, updatedBooking);
      console.log('✅ Google Calendar event updated successfully');
    } catch (calendarError) {
      console.error('❌ Google Calendar event update failed:', calendarError.message);
    }

    // ✅ TEMPLATE-BASED EMAIL NOTIFICATIONS
    try {
      const { formData: bookingFormData, bookingId, webName } = updatedBooking;
      const websiteConfig = getWebsiteConfig(webName);
      const userEmail = bookingFormData.email;
      const statusDisplay = updatedBooking.status.charAt(0).toUpperCase() + updatedBooking.status.slice(1);

      let userSubject = '';
      let userHtmlBody = '';
      
      const currentStatus = updatedBooking.status;

      switch (currentStatus) {
        case 'confirmed':
          userSubject = `✅ Booking Confirmed - ${webName} (#${bookingId})`;
          userHtmlBody = getConfirmationEmail(updatedBooking, websiteConfig);
          break;

        case 'cancelled':
          userSubject = `❌ Booking Cancelled - ${webName} (#${bookingId})`;
          userHtmlBody = getCancellationEmail(updatedBooking, websiteConfig);
          break;

        case 'rescheduled':
          userSubject = `🔄 Booking Rescheduled - ${webName} (#${bookingId})`;
          userHtmlBody = getRescheduledEmail(updatedBooking, websiteConfig);
          break;

        case 'completed':
          userSubject = `✅ Service Completed - ${webName} (#${bookingId})`;
          userHtmlBody = getCompletedEmail(updatedBooking, websiteConfig);
          break;
        
        // For 'pending' and 'in-progress' or others, send the Pending template as a general update
        case 'pending':
          userSubject = `📋 Booking Status Updated to Pending - ${webName} (#${bookingId})`;
          userHtmlBody = getPendingEmail(updatedBooking, websiteConfig);
          break;
        
        case 'in-progress':
        default:
          // Fallback or In-Progress (Using Pending template structure but customized title if needed, 
          // or creating a generic one. Here we reuse Pending for layout consistency or generic notification)
          userSubject = `📋 Booking Status Updated: ${statusDisplay} - ${webName} (#${bookingId})`;
          // Currently reusing getPendingEmail logic for structure, but strictly it says "Pending Review". 
          // If you want a strictly generic one, you can create `getGenericStatusEmail` in templates later.
          // For now, we will skip sending specific HTML for 'in-progress' to User to avoid confusion, 
          // OR use a simple text fallback if no template matches perfectly.
          
          // Let's use a basic fallback constructed here using the helper if needed, 
          // or just skip user email for 'in-progress' if not strictly required.
          // Assuming you want to notify user:
           userHtmlBody = getPendingEmail(updatedBooking, websiteConfig); // Reusing layout
          break;
      }

      // 📨 User ko email bhejein
      if (userHtmlBody) {
        await sendEmail({
          to: userEmail,
          subject: userSubject,
          html: userHtmlBody,
        });
        console.log(`✅ Status email sent to user for status: ${currentStatus}`);
      }

      // 📨 Owner ko notification bhejein (Always send detailed owner notification)
      if (process.env.OWNER_EMAIL) {
        const ownerSubject = `📊 Booking #${bookingId} Status Changed (${statusDisplay})`;
        
        // Owner template automatically includes "Status: [CURRENT STATUS]"
        const ownerHtmlBody = getOwnerNotificationEmail(updatedBooking, websiteConfig); 

        await sendEmail({
          to: websiteConfig.ownerEmail || process.env.OWNER_EMAIL,
          subject: ownerSubject,
          html: ownerHtmlBody,
        });
        console.log('✅ Notification email sent to owner');
      }

    } catch (mailError) {
      console.error("❌ Failed to send status emails:", mailError.message);
    }

    return NextResponse.json(
      {
        success: true,
        message: `Booking status updated to ${updatedBooking.status} successfully`,
        data: updatedBooking,
      },
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error("PUT /api/booking/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update booking" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// // ... (DELETE and GET functions remain same as provided in previous context, assuming they are correct)
// export async function DELETE(req, { params }) {
//   try {
//     await connectDB();
//     const { id } = await params; // Fixed await

//     // destructure fields
//     const { status, newDate, newTimeSlot } = body;

//     if (!id) {
//       return NextResponse.json(
//         { success: false, error: "Missing booking ID" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // 🟢 Case 1: Reschedule booking
//     if (newDate && newTimeSlot) {
//       const booking = await Booking.findById(id);
//       if (!booking) {
//         return NextResponse.json(
//           { success: false, error: "Booking not found" },
//           { status: 404, headers: corsHeaders }
//         );
//       }

//       // Update nested formData fields safely
//       if (booking.formData) {
//         booking.formData.date = newDate;
//         booking.formData.timeSlot = newTimeSlot;
//       }

//       booking.status = "confirmed"; // Reschedule karne par status confirmed set kar rahe hain
//       await booking.save();

//       // ✉️ Send email notifications (FIXED)
//       try {
//         const userEmail = booking.formData.email;

//         // 1. Config hasil karein
//         const config = getWebsiteConfig(booking.webName);

//         // 2. User ke liye template generate karein
//         const userHtml = getRescheduledEmail(booking, config);

//         // 3. User ko email karein
//         await sendEmail({
//           to: userEmail,
//           subject: `Your booking #${booking.bookingId} has been rescheduled`,
//           html: userHtml,
//         });

//         // 4. Owner ko email karein
//         await sendEmail({
//           to: config.ownerEmail, // Sahi owner ka email
//           subject: `Booking Rescheduled: #${booking.bookingId}`,
//           html: `<p>Booking <strong>#${
//             booking.bookingId
//           }</strong> for ${
//             booking.formData.firstName
//           } has been rescheduled.</p>
//                  <p>New Date: <strong>${new Date(
//                    newDate
//                  ).toLocaleDateString()}</strong></p>
//                  <p>New Time: <strong>${newTimeSlot}</strong></p>`,
//         });
//       } catch (mailError) {
//         console.error("❌ Failed to send reschedule email:", mailError);
//       }

//       return NextResponse.json(
//         {
//           success: true,
//           message: "Booking successfully rescheduled",
//           data: booking,
//         },
//         { status: 200, headers: corsHeaders }
//       );
//     }

//     // 🟡 Case 2: Update booking status
//     if (!status) {
//       return NextResponse.json(
//         { success: false, error: "Missing status or reschedule data" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     const allowedStatuses = ["pending", "confirmed", "cancelled", "completed"];
//     if (!allowedStatuses.includes(status)) {
//       return NextResponse.json(
//         { success: false, error: "Invalid status value" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     const updatedBooking = await Booking.findByIdAndUpdate(
//       id,
//       { status },
//       { new: true }
//     );

//     if (!updatedBooking) {
//       return NextResponse.json(
//         { success: false, error: "Booking not found" },
//         { status: 404, headers: corsHeaders }
//       );
//     }

//     // ✉️ Send emails (FIXED)
//     try {
//       const { formData, bookingId, webName } = updatedBooking;
//       const userEmail = formData.email;
//       const statusDisplay = status.charAt(0).toUpperCase() + status.slice(1);

//       // 1. Config hasil karein
//       const config = getWebsiteConfig(webName);

//       // 2. Status ke hisab se user ka template chunein
//       let userHtml = null;
//       switch (status) {
//         case "confirmed":
//           userHtml = getConfirmationEmail(updatedBooking, config);
//           break;
//         case "cancelled":
//           userHtml = getCancellationEmail(updatedBooking, config);
//           break;
//         case "completed":
//           userHtml = getCompletedEmail(updatedBooking, config);
//           break;
//         // Hum "pending" par email nahi bhej rahe kyonke yeh default state hai
//       }

//       // 3. Agar template mojood hai, tab hi email karein
//       if (userHtml) {
//         // User ko email
//         await sendEmail({
//           to: userEmail,
//           subject: `Your Booking #${bookingId} Status Updated: ${statusDisplay}`,
//           html: userHtml,
//         });

//         // Owner ko email
//         await sendEmail({
//           to: config.ownerEmail, // Sahi owner ka email
//           subject: `Booking #${bookingId} Status Changed (${statusDisplay})`,
//           html: `<p>Booking ID <strong>#${bookingId}</strong> for ${formData.firstName} has been updated to <strong>${statusDisplay}</strong>.</p>`,
//         });
//       }
//     } catch (mailError) {
//       console.error("❌ Failed to send status emails:", mailError);
//     }

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Booking status updated successfully",
//         data: updatedBooking,
//       },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error) {
//     console.error("PUT /api/booking/[id] error:", error);
//     return NextResponse.json(
//       { success: false, error: "Failed to update booking" },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }

// ✅ Delete booking
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const deleted = await Booking.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: "Booking deleted successfully" },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("DELETE /api/booking/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete booking" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params; // Fixed await

    const booking = await Booking.findById(id)
      .populate('promoCodeId') 
      .populate('promoCodeId.agentId', 'agentName agentId email');

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: booking,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("GET /api/booking/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch booking" },
      { status: 500, headers: corsHeaders }
    );
  }
}