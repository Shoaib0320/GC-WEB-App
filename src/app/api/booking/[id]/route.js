
// import { NextResponse } from "next/server";
// import Booking from "@/Models/Booking";
// import connectDB from "@/lib/mongodb";
// import { sendEmail } from "@/lib/mailer";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "PUT, DELETE, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// export async function OPTIONS() {
//   return new NextResponse(null, { status: 204, headers: corsHeaders });
// }

// // ✅ Update booking status OR reschedule
// export async function PUT(req, { params }) {
//   try {
//     await connectDB();
//     const { id } = params;
//     const body = await req.json();

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

//       booking.status = "confirmed";
//       await booking.save();

//       // Send email notifications (optional)
//       try {
//         const userEmail = booking.formData.email;
//         sendEmail({
//           to: userEmail,
//           subject: `Your booking #${booking.bookingId} has been rescheduled`,
//           html: `<p>Hi ${booking.formData.firstName},</p>
//                  <p>Your booking has been rescheduled to <strong>${new Date(newDate).toLocaleDateString()}</strong> at <strong>${newTimeSlot}</strong>.</p>
//                  <p>Thank you!</p>`
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
//         { success: false, error:"Invalid status value" },
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

//     // ✉️ Send emails (optional)
//     try {
//       const { formData, bookingId } = updatedBooking;
//       const userEmail = formData.email;
//       const statusDisplay = status.charAt(0).toUpperCase() + status.slice(1);

//       sendEmail({
//         to: userEmail,
//         subject: `Your Booking #${bookingId} Status Updated: ${statusDisplay}`,
//         html: `<p>Hi ${formData.firstName},</p>
//                <p>Your booking status has been updated to <strong>${statusDisplay}</strong>.</p>`,
//       });

//       sendEmail({
//         to: process.env.OWNER_EMAIL,
//         subject: `Booking #${bookingId} Status Changed (${statusDisplay})`,
//         html: `<p>Booking ID ${bookingId} updated to ${statusDisplay}</p>`,
//       });
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
    const { id } = params;
    const body = await req.json();

    // destructure fields
    const { status, newDate, newTimeSlot } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing booking ID" },
        { status: 400, headers: corsHeaders }
      );
    }

    // 🟢 Case 1: Reschedule booking
    if (newDate && newTimeSlot) {
      const booking = await Booking.findById(id);
      if (!booking) {
        return NextResponse.json(
          { success: false, error: "Booking not found" },
          { status: 404, headers: corsHeaders }
        );
      }

      // Update nested formData fields safely
      if (booking.formData) {
        booking.formData.date = newDate;
        booking.formData.timeSlot = newTimeSlot;
      }

      booking.status = "confirmed"; // Reschedule karne par status confirmed set kar rahe hain
      await booking.save();

      // ✉️ Send email notifications (FIXED)
      try {
        const userEmail = booking.formData.email;

        // 1. Config hasil karein
        const config = getWebsiteConfig(booking.webName);

        // 2. User ke liye template generate karein
        const userHtml = getRescheduledEmail(booking, config);

        // 3. User ko email karein
        await sendEmail({
          to: userEmail,
          subject: `Your booking #${booking.bookingId} has been rescheduled`,
          html: userHtml,
        });

        // 4. Owner ko email karein
        await sendEmail({
          to: config.ownerEmail, // Sahi owner ka email
          subject: `Booking Rescheduled: #${booking.bookingId}`,
          html: `<p>Booking <strong>#${
            booking.bookingId
          }</strong> for ${
            booking.formData.firstName
          } has been rescheduled.</p>
                 <p>New Date: <strong>${new Date(
                   newDate
                 ).toLocaleDateString()}</strong></p>
                 <p>New Time: <strong>${newTimeSlot}</strong></p>`,
        });
      } catch (mailError) {
        console.error("❌ Failed to send reschedule email:", mailError);
      }

      return NextResponse.json(
        {
          success: true,
          message: "Booking successfully rescheduled",
          data: booking,
        },
        { status: 200, headers: corsHeaders }
      );
    }

    // 🟡 Case 2: Update booking status
    if (!status) {
      return NextResponse.json(
        { success: false, error: "Missing status or reschedule data" },
        { status: 400, headers: corsHeaders }
      );
    }

    const allowedStatuses = ["pending", "confirmed", "cancelled", "completed"];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status value" },
        { status: 400, headers: corsHeaders }
      );
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedBooking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // ✉️ Send emails (FIXED)
    try {
      const { formData, bookingId, webName } = updatedBooking;
      const userEmail = formData.email;
      const statusDisplay = status.charAt(0).toUpperCase() + status.slice(1);

      // 1. Config hasil karein
      const config = getWebsiteConfig(webName);

      // 2. Status ke hisab se user ka template chunein
      let userHtml = null;
      switch (status) {
        case "confirmed":
          userHtml = getConfirmationEmail(updatedBooking, config);
          break;
        case "cancelled":
          userHtml = getCancellationEmail(updatedBooking, config);
          break;
        case "completed":
          userHtml = getCompletedEmail(updatedBooking, config);
          break;
        // Hum "pending" par email nahi bhej rahe kyonke yeh default state hai
      }

      // 3. Agar template mojood hai, tab hi email karein
      if (userHtml) {
        // User ko email
        await sendEmail({
          to: userEmail,
          subject: `Your Booking #${bookingId} Status Updated: ${statusDisplay}`,
          html: userHtml,
        });

        // Owner ko email
        await sendEmail({
          to: config.ownerEmail, // Sahi owner ka email
          subject: `Booking #${bookingId} Status Changed (${statusDisplay})`,
          html: `<p>Booking ID <strong>#${bookingId}</strong> for ${formData.firstName} has been updated to <strong>${statusDisplay}</strong>.</p>`,
        });
      }
    } catch (mailError) {
      console.error("❌ Failed to send status emails:", mailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Booking status updated successfully",
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