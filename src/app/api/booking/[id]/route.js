// src/app/api/booking/[id]/route.js
import { NextResponse } from "next/server";
import Booking from "@/Models/Booking";
import connectDB from "@/lib/mongodb";
import { sendEmail } from "@/lib/mailer";
import { googleCalendar } from "@/lib/googleCalendar";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// // ✅ Update booking status (with cancellation reason)
// export async function PUT(req, { params }) {
//   try {
//     await connectDB();
//     const { id } = params;

//     // <-- 1. YAHAN CHANGE HUA
//     // Hum ab 'status' ke sath 'cancellationReason' ko bhi request se nikal rahe hain
//     const { status, cancellationReason } = await req.json();

//     if (!id || !status) {
//       return NextResponse.json(
//         { success: false, error: "Missing ID or status" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // <-- 2. YAHAN CHANGE HUA (Aapne reschedule add nahi kiya tha, maine kar diya hai)
//     const allowedStatuses = [
//       "pending",
//       "confirmed",
//       "cancelled",
//       "completed",
//       "rescheduled", // Isko bhi check karein
//       "in-progress", // Yeh bhi schema mein tha
//     ];
//     if (!allowedStatuses.includes(status)) {
//       return NextResponse.json(
//         { success: false, error: "Invalid status value" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // <-- 3. YAHAN CHANGE HUA
//     // Hum ek dynamic 'updateData' object banayenge
//     const updateData = {
//       status,
//     };

//     // Agar status 'cancelled' hai aur reason bhi aaya hai, to usko update object mein add karo
//     if (status === "cancelled" && cancellationReason) {
//       updateData.cancellationReason = cancellationReason;
//     }

//     // Ab 'updateData' object ko use karein
//     const updatedBooking = await Booking.findByIdAndUpdate(
//       id,
//       updateData, // Pehle yahan sirf { status } tha
//       { new: true }
//     );
//     // YAHAN TAK CHANGE HUA

//     if (!updatedBooking) {
//       return NextResponse.json(
//         { success: false, error: "Booking not found" },
//         { status: 404, headers: corsHeaders }
//       );
//     }

//     // 📨 Email notifications (AB YEH BHI UPDATED HAI)
//     try {
//       const { formData, bookingId } = updatedBooking;
//       const userEmail = formData.email;
//       const statusDisplay = status.charAt(0).toUpperCase() + status.slice(1);

//       // <-- 4. YAHAN EMAIL LOGIC MEIN CHANGE HUA
//       // User ke liye dynamic email body
//       let userHtmlBody = `<p>Hi ${formData.firstName},</p>
//                           <p>Your booking status has been updated to <strong>${statusDisplay}</strong>.</p>`;

//       // Agar booking cancel hui hai, to reason bhi email mein add karo
//       if (status === "cancelled" && updatedBooking.cancellationReason) {
//         userHtmlBody += `<br><p><strong>Reason for cancellation:</strong> ${updatedBooking.cancellationReason}</p>`;
//       }

//       // User ko email bhejein
//       sendEmail({
//         to: userEmail,
//         subject: `Your Booking #${bookingId} Status Updated: ${statusDisplay}`,
//         html: userHtmlBody, // Dynamic body yahan use karein
//       });

//       // Owner ke liye dynamic email body
//       let ownerHtmlBody = `<p>Booking ID ${bookingId} updated to ${statusDisplay}</p>`;
//       if (status === "cancelled" && updatedBooking.cancellationReason) {
//         ownerHtmlBody += `<br><p><strong>Reason:</strong> ${updatedBooking.cancellationReason}</p>`;
//       }

//       // Owner ko email bhejein
//       sendEmail({
//         to: process.env.OWNER_EMAIL, // Aapke .env file se
//         subject: `Booking #${bookingId} Status Changed (${statusDisplay})`,
//         html: ownerHtmlBody, // Dynamic body yahan use karein
//       });
//       // YAHAN TAK EMAIL LOGIC MEIN CHANGE HUA
//     } catch (mailError) {
//       console.error("❌ Failed to send status emails:", mailError);
//       // Email fail ho to bhi response zaroor bhejein
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


export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

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

    // ✅ Cancellation reason add karein
    if (status === "cancelled" && cancellationReason) {
      updateData.cancellationReason = cancellationReason;
    } else if (status !== "cancelled") {
      // Agar status cancelled nahi hai to cancellation reason remove karein
      updateData.cancellationReason = null;
    }

    // ✅ Agar reschedule ho raha hai to date/time bhi update karein
    if (formData && (formData.date || formData.timeSlot)) {
      updateData.$set = {
        'formData.date': formData.date || undefined,
        'formData.timeSlot': formData.timeSlot || undefined
      };
      
      // Agar date/time change ho raha hai to status automatically rescheduled karein
      if (formData.date || formData.timeSlot) {
        updateData.status = "rescheduled";
      }
    }

    console.log('📝 Update data:', updateData);

    // ✅ Database update karein
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedBooking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    console.log('✅ Database updated:', updatedBooking.bookingId);

    // ✅ GOOGLE CALENDAR UPDATE
    try {
      console.log('📅 Updating Google Calendar event for:', updatedBooking.bookingId);
      await googleCalendar.updateEvent(updatedBooking.bookingId, updatedBooking);
      console.log('✅ Google Calendar event updated successfully');
    } catch (calendarError) {
      console.error('❌ Google Calendar event update failed:', calendarError.message);
      // Calendar error ko fatal nahi banayein
    }

    // ✅ EMAIL NOTIFICATIONS
    try {
      const { formData: bookingFormData, bookingId, webName } = updatedBooking;
      const userEmail = bookingFormData.email;
      const statusDisplay = status.charAt(0).toUpperCase() + status.slice(1);

      // 📨 User ke liye email content
      let userSubject = '';
      let userHtmlBody = '';

      switch (status) {
        case 'confirmed':
          userSubject = `✅ Booking Confirmed - ${webName} (#${bookingId})`;
          userHtmlBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #22c55e;">Booking Confirmed! 🎉</h2>
              <p>Hi <strong>${bookingFormData.firstName}</strong>,</p>
              <p>Your booking has been <strong style="color: #22c55e;">confirmed</strong>!</p>
              
              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Booking Details:</h3>
                <p><strong>Booking ID:</strong> ${bookingId}</p>
                <p><strong>Service Date:</strong> ${bookingFormData.date}</p>
                <p><strong>Time Slot:</strong> ${bookingFormData.timeSlot}</p>
                <p><strong>Service:</strong> ${webName}</p>
                <p><strong>Vehicles:</strong> ${updatedBooking.vehicleCount}</p>
                <p><strong>Address:</strong> ${bookingFormData.address}, ${bookingFormData.city}</p>
              </div>
              
              <p>We're looking forward to serving you! If you have any questions, please contact us.</p>
              
              <div style="margin-top: 30px; padding: 15px; background: #e8f5e8; border-radius: 8px;">
                <p style="margin: 0;"><strong>Thank you for choosing ${webName}!</strong></p>
              </div>
            </div>
          `;
          break;

        case 'cancelled':
          userSubject = `❌ Booking Cancelled - ${webName} (#${bookingId})`;
          userHtmlBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">Booking Cancelled</h2>
              <p>Hi <strong>${bookingFormData.firstName}</strong>,</p>
              <p>Your booking has been <strong style="color: #dc2626;">cancelled</strong>.</p>
              
              ${cancellationReason ? `
              <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Cancellation Reason:</strong> ${cancellationReason}</p>
              </div>
              ` : ''}
              
              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Cancelled Booking Details:</h3>
                <p><strong>Booking ID:</strong> ${bookingId}</p>
                <p><strong>Original Date:</strong> ${bookingFormData.date}</p>
                <p><strong>Service:</strong> ${webName}</p>
              </div>
              
              <p>We hope to serve you in the future. If this was a mistake, please contact us immediately.</p>
            </div>
          `;
          break;

        case 'rescheduled':
          userSubject = `🔄 Booking Rescheduled - ${webName} (#${bookingId})`;
          userHtmlBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #8b5cf6;">Booking Rescheduled! 🔄</h2>
              <p>Hi <strong>${bookingFormData.firstName}</strong>,</p>
              <p>Your booking has been <strong style="color: #8b5cf6;">rescheduled</strong>.</p>
              
              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Updated Booking Details:</h3>
                <p><strong>Booking ID:</strong> ${bookingId}</p>
                <p><strong>New Date:</strong> ${bookingFormData.date}</p>
                <p><strong>New Time:</strong> ${bookingFormData.timeSlot}</p>
                <p><strong>Service:</strong> ${webName}</p>
                <p><strong>Vehicles:</strong> ${updatedBooking.vehicleCount}</p>
                <p><strong>Address:</strong> ${bookingFormData.address}, ${bookingFormData.city}</p>
              </div>
              
              <p>Please make note of the new date and time. We look forward to serving you!</p>
            </div>
          `;
          break;

        case 'in-progress':
          userSubject = `🛠️ Service In Progress - ${webName} (#${bookingId})`;
          userHtmlBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #f59e0b;">Service In Progress 🛠️</h2>
              <p>Hi <strong>${bookingFormData.firstName}</strong>,</p>
              <p>Your service is now <strong style="color: #f59e0b;">in progress</strong>!</p>
              
              <div style="background: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Our team is currently working on your vehicle(s).</strong></p>
                <p>We'll notify you once the service is completed.</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                <p><strong>Booking ID:</strong> ${bookingId}</p>
                <p><strong>Service Date:</strong> ${bookingFormData.date}</p>
                <p><strong>Service:</strong> ${webName}</p>
              </div>
            </div>
          `;
          break;

        case 'completed':
          userSubject = `✅ Service Completed - ${webName} (#${bookingId})`;
          userHtmlBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #059669;">Service Completed! 🎊</h2>
              <p>Hi <strong>${bookingFormData.firstName}</strong>,</p>
              <p>Your service has been <strong style="color: #059669;">completed successfully</strong>!</p>
              
              <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Thank you for choosing our service!</strong></p>
                <p>We hope you're satisfied with the results. Your vehicle is ready for pickup.</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                <h3 style="margin-top: 0;">Service Summary:</h3>
                <p><strong>Booking ID:</strong> ${bookingId}</p>
                <p><strong>Service Date:</strong> ${bookingFormData.date}</p>
                <p><strong>Service:</strong> ${webName}</p>
                <p><strong>Total Amount:</strong> $${updatedBooking.discountedPrice}</p>
                <p><strong>Vehicles Serviced:</strong> ${updatedBooking.vehicleCount}</p>
              </div>
              
              <div style="margin-top: 20px; padding: 15px; background: #e8f5e8; border-radius: 8px;">
                <p style="margin: 0;">We appreciate your business and look forward to serving you again!</p>
              </div>
            </div>
          `;
          break;

        default:
          userSubject = `📋 Booking Status Updated - ${webName} (#${bookingId})`;
          userHtmlBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Booking Status Updated</h2>
              <p>Hi <strong>${bookingFormData.firstName}</strong>,</p>
              <p>Your booking status has been updated to: <strong>${statusDisplay}</strong></p>
              
              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Booking ID:</strong> ${bookingId}</p>
                <p><strong>Service Date:</strong> ${bookingFormData.date}</p>
                <p><strong>Time Slot:</strong> ${bookingFormData.timeSlot}</p>
                <p><strong>Service:</strong> ${webName}</p>
                <p><strong>Status:</strong> ${statusDisplay}</p>
              </div>
            </div>
          `;
      }

      // 📨 User ko email bhejein (agar email configured hai)
      if (process.env.EMAIL_SERVER_HOST) {
        await sendEmail({
          to: userEmail,
          subject: userSubject,
          html: userHtmlBody,
        });
        console.log('✅ Status email sent to user');
      }

      // 📨 Owner ko notification bhejein
      if (process.env.EMAIL_SERVER_HOST && process.env.OWNER_EMAIL) {
        const ownerSubject = `📊 Booking #${bookingId} Status Changed (${statusDisplay})`;
        const ownerHtmlBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Booking Status Update</h2>
            <p>Booking <strong>#${bookingId}</strong> status has been changed to <strong>${statusDisplay}</strong>.</p>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Booking Details:</h3>
              <p><strong>Customer:</strong> ${bookingFormData.firstName} ${bookingFormData.lastName}</p>
              <p><strong>Contact:</strong> ${userEmail} | ${bookingFormData.phone}</p>
              <p><strong>Service Date:</strong> ${bookingFormData.date}</p>
              <p><strong>Time Slot:</strong> ${bookingFormData.timeSlot}</p>
              <p><strong>Vehicles:</strong> ${updatedBooking.vehicleCount}</p>
              <p><strong>Amount:</strong> $${updatedBooking.discountedPrice}</p>
              ${cancellationReason ? `<p><strong>Cancellation Reason:</strong> ${cancellationReason}</p>` : ''}
            </div>
          </div>
        `;

        await sendEmail({
          to: process.env.OWNER_EMAIL,
          subject: ownerSubject,
          html: ownerHtmlBody,
        });
        console.log('✅ Notification email sent to owner');
      }

    } catch (mailError) {
      console.error("❌ Failed to send status emails:", mailError.message);
      // Email error ko fatal nahi banayein
    }

    return NextResponse.json(
      {
        success: true,
        message: `Booking status updated to ${status} successfully`,
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

// // ✅ Delete booking
// export async function DELETE(req, { params }) {
//   try {
//     await connectDB();
//     const { id } = params;

//     const deleted = await Booking.findByIdAndDelete(id);
//     if (!deleted) {
//       return NextResponse.json(
//         { success: false, error: "Booking not found" },
//         { status: 404, headers: corsHeaders }
//       );
//     }

//     return NextResponse.json(
//       { success: true, message: "Booking deleted successfully" },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error) {
//     console.error("DELETE /api/booking/[id] error:", error);
//     return NextResponse.json(
//       { success: false, error: "Failed to delete booking" },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // ✅ Pehle Google Calendar se event delete karein
    try {
      await googleCalendar.deleteEvent(booking.bookingId);
      console.log('✅ Google Calendar event deleted successfully');
    } catch (calendarError) {
      console.error('❌ Google Calendar event deletion failed:', calendarError);
    }

    // Phir database se delete karein
    await Booking.findByIdAndDelete(id);

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

// ✅ GET single booking with promo code details
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const booking = await Booking.findById(id)
      .populate('promoCodeId') // Populate promo code details
      .populate('promoCodeId.agentId', 'agentName agentId email'); // Populate agent details too

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