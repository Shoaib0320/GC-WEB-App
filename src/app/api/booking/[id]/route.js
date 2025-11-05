// import { NextResponse } from "next/server";
// import Booking from "@/models/Booking";
// import connectDB from "@/lib/mongodb";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "PUT, DELETE, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// export async function OPTIONS() {
//   return new NextResponse(null, { status: 204, headers: corsHeaders });
// }

// // ✅ Update booking status
// export async function PUT(req, { params }) {
//   try {
//     await connectDB();
//     const { id } = params;
//     const { status } = await req.json();

//     if (!id || !status) {
//       return NextResponse.json(
//         { success: false, error: "Missing ID or status" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     const allowedStatuses = ["pending", "confirmed", "cancelled"];
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

//     return NextResponse.json(
//       { success: true, data: updatedBooking, message: "Booking updated successfully" },
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

// import { NextResponse } from "next/server";
// import Booking from "@/models/Booking";
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
//       { success: false, error: "Invalid status value" },
//       return NextResponse.json(
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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// ✅ Update booking status only
// export async function PUT(req, { params }) {
//   try {
//     await connectDB();
//     const { id } = params;
//     const { status } = await req.json();

//     if (!id || !status) {
//       return NextResponse.json(
//         { success: false, error: "Missing ID or status" },
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

//     // 📨 Email notifications (keep as is)
//     try {
//       const { formData, bookingId } = updatedBooking;
//       const userEmail = formData.email;
//       const statusDisplay = status.charAt(0).toUpperCase() + status.slice(1);

//       // Send to user
//       sendEmail({
//         to: userEmail,
//         subject: `Your Booking #${bookingId} Status Updated: ${statusDisplay}`,
//         html: `<p>Hi ${formData.firstName},</p>
//                <p>Your booking status has been updated to <strong>${statusDisplay}</strong>.</p>`,
//       });

//       // Send to owner
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

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    // <-- 1. YAHAN CHANGE HUA
    // Hum ab 'status' ke sath 'cancellationReason' ko bhi request se nikal rahe hain
    const { status, cancellationReason } = await req.json();

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Missing ID or status" },
        { status: 400, headers: corsHeaders }
      );
    }

    // <-- 2. YAHAN CHANGE HUA (Aapne reschedule add nahi kiya tha, maine kar diya hai)
    const allowedStatuses = [
      "pending",
      "confirmed",
      "cancelled",
      "completed",
      "rescheduled", // Isko bhi check karein
      "in-progress", // Yeh bhi schema mein tha
    ];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status value" },
        { status: 400, headers: corsHeaders }
      );
    }

    // <-- 3. YAHAN CHANGE HUA
    // Hum ek dynamic 'updateData' object banayenge
    const updateData = {
      status,
    };

    // Agar status 'cancelled' hai aur reason bhi aaya hai, to usko update object mein add karo
    if (status === "cancelled" && cancellationReason) {
      updateData.cancellationReason = cancellationReason;
    }

    // Ab 'updateData' object ko use karein
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      updateData, // Pehle yahan sirf { status } tha
      { new: true }
    );
    // YAHAN TAK CHANGE HUA

    if (!updatedBooking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // 📨 Email notifications (AB YEH BHI UPDATED HAI)
    try {
      const { formData, bookingId } = updatedBooking;
      const userEmail = formData.email;
      const statusDisplay = status.charAt(0).toUpperCase() + status.slice(1);

      // <-- 4. YAHAN EMAIL LOGIC MEIN CHANGE HUA
      // User ke liye dynamic email body
      let userHtmlBody = `<p>Hi ${formData.firstName},</p>
                          <p>Your booking status has been updated to <strong>${statusDisplay}</strong>.</p>`;

      // Agar booking cancel hui hai, to reason bhi email mein add karo
      if (status === "cancelled" && updatedBooking.cancellationReason) {
        userHtmlBody += `<br><p><strong>Reason for cancellation:</strong> ${updatedBooking.cancellationReason}</p>`;
      }

      // User ko email bhejein
      sendEmail({
        to: userEmail,
        subject: `Your Booking #${bookingId} Status Updated: ${statusDisplay}`,
        html: userHtmlBody, // Dynamic body yahan use karein
      });

      // Owner ke liye dynamic email body
      let ownerHtmlBody = `<p>Booking ID ${bookingId} updated to ${statusDisplay}</p>`;
      if (status === "cancelled" && updatedBooking.cancellationReason) {
        ownerHtmlBody += `<br><p><strong>Reason:</strong> ${updatedBooking.cancellationReason}</p>`;
      }

      // Owner ko email bhejein
      sendEmail({
        to: process.env.OWNER_EMAIL, // Aapke .env file se
        subject: `Booking #${bookingId} Status Changed (${statusDisplay})`,
        html: ownerHtmlBody, // Dynamic body yahan use karein
      });
      // YAHAN TAK EMAIL LOGIC MEIN CHANGE HUA
    } catch (mailError) {
      console.error("❌ Failed to send status emails:", mailError);
      // Email fail ho to bhi response zaroor bhejein
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
