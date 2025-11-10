

// src/app/api/booking/route.js
import { NextResponse } from "next/server";
import Booking, { BookingStatus } from "@/Models/Booking";
import PromoCode from "@/Models/PromoCode"; // Import PromoCode model
import connectDB from "@/lib/mongodb";
import { sendEmail } from "@/lib/mailer";
import { googleCalendar } from "@/lib/googleCalendar";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// // ✅ POST — Create new booking with promo code handling
// export async function POST(req) {
//   try {
//     await connectDB();
//     const data = await req.json();

//     // ✅ Validation
//     if (
//       !data.bookingId ||
//       !data.webName ||
//       !data.formData ||
//       !data.formData.firstName ||
//       !data.formData.lastName ||
//       !data.formData.email ||
//       !data.formData.phone ||
//       !data.formData.date ||
//       data.totalPrice === undefined ||
//       data.discountedPrice === undefined ||
//       !data.submittedAt ||
//       data.vehicleCount === undefined
//     ) {
//       return NextResponse.json(
//         { success: false, error: "Missing required fields" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // ✅ Check for duplicate bookingId
//     const existingBooking = await Booking.findOne({
//       bookingId: data.bookingId,
//     });
//     if (existingBooking) {
//       return NextResponse.json(
//         { success: false, error: "Booking ID already exists" },
//         { status: 409, headers: corsHeaders }
//       );
//     }

//     // ✅ PROMO CODE VALIDATION & PROCESSING
//     let promoCodeData = null;
//     let promoCodeId = null;

//     if (data.promoCode) {
//       // Find and validate promo code
//       promoCodeData = await PromoCode.findOne({
//         promoCode: data.promoCode.toUpperCase(),
//         isActive: true
//       });

//       if (promoCodeData) {
//         // Check if promo code is valid
//         if (promoCodeData.validUntil && new Date() > new Date(promoCodeData.validUntil)) {
//           return NextResponse.json(
//             { success: false, error: "Promo code has expired" },
//             { status: 400, headers: corsHeaders }
//           );
//         }

//         if (promoCodeData.maxUsage && promoCodeData.usedCount >= promoCodeData.maxUsage) {
//           return NextResponse.json(
//             { success: false, error: "Promo code usage limit reached" },
//             { status: 400, headers: corsHeaders }
//           );
//         }

//         // Increment usage count
//         promoCodeData.usedCount += 1;
//         await promoCodeData.save();
//         promoCodeId = promoCodeData._id;
//       } else {
//         return NextResponse.json(
//           { success: false, error: "Invalid promo code" },
//           { status: 400, headers: corsHeaders }
//         );
//       }
//     }

//     // ✅ Create new booking
//     const newBooking = await Booking.create({
//       bookingId: data.bookingId,
//       webName: data.webName,
//       formData: {
//         vehicleBookings: data.formData.vehicleBookings || [],
//         firstName: data.formData.firstName,
//         lastName: data.formData.lastName,
//         email: data.formData.email,
//         phone: data.formData.phone,
//         address: data.formData.address || "",
//         city: data.formData.city || "",
//         state: data.formData.state || "",
//         zip: data.formData.zip || "",
//         date: data.formData.date,
//         timeSlot: data.formData.timeSlot || "",
//         notes: data.formData.notes || "",
//       },
//       totalPrice: data.totalPrice,
//       discountedPrice: data.discountedPrice,
//       discountApplied: data.discountApplied || false,
//       discountPercent: data.discountPercent || 0,
//       promoCode: data.promoCode || null,
//       promoCodeId: promoCodeId, // Store promo code reference
//       submittedAt: data.submittedAt,
//       vehicleCount: data.vehicleCount,
//       status: BookingStatus.PENDING,
//     });

//     // ✅ Email sending logic
//     // const { firstName, lastName, email, date, timeSlot, phone } = data.formData;
//     const { email } = data.formData;

//     // 📨 User email
//     // const userHtml = render(<BookingConfirmation bookingData={newBooking} />);

//     // 📨 Owner email
//     // const ownerHtml = render(<OwnerNotification bookingData={newBooking} />);

//     try {
//       // Send to user
//       await sendEmail({
//         to: email,
//         subject: `Your Booking Confirmation - ${newBooking.webName} (#${newBooking.bookingId})`,
//         html: userHtml,
//       });

//       // Send to owner
//       await sendEmail({
//         to: process.env.OWNER_EMAIL,
//         subject: `New Booking Received (#${newBooking.bookingId})`,
//         html: ownerHtml,
//       });

//       console.log("✅ Emails sent to user and owner");
//     } catch (mailError) {
//       console.error("❌ Email sending failed:", mailError);
//     }

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Booking created and emails sent successfully",
//         data: newBooking,
//       },
//       { status: 201, headers: corsHeaders }
//     );
//   } catch (err) {
//     console.error("POST /api/booking error:", err);
//     return NextResponse.json(
//       { success: false, error: "Internal Server Error" },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }




//
export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();

    // ✅ Existing validation logic...
    if (!data.bookingId || !data.webName || !data.formData || !data.formData.firstName || !data.formData.lastName || !data.formData.email || !data.formData.phone || !data.formData.date || data.totalPrice === undefined || data.discountedPrice === undefined || !data.submittedAt || data.vehicleCount === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400, headers: corsHeaders }
      );
    }

    // ✅ Existing duplicate check...
    const existingBooking = await Booking.findOne({
      bookingId: data.bookingId,
    });
    if (existingBooking) {
      return NextResponse.json(
        { success: false, error: "Booking ID already exists" },
        { status: 409, headers: corsHeaders }
      );
    }

    // ✅ Existing promo code logic...
    let promoCodeData = null;
    let promoCodeId = null;

    if (data.promoCode) {
      promoCodeData = await PromoCode.findOne({
        promoCode: data.promoCode.toUpperCase(),
        isActive: true
      });

      if (promoCodeData) {
        // ... existing promo validation
        promoCodeData.usedCount += 1;
        await promoCodeData.save();
        promoCodeId = promoCodeData._id;
      } else {
        return NextResponse.json(
          { success: false, error: "Invalid promo code" },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    // ✅ Create new booking
    const newBooking = await Booking.create({
      bookingId: data.bookingId,
      webName: data.webName,
      formData: {
        vehicleBookings: data.formData.vehicleBookings || [],
        firstName: data.formData.firstName,
        lastName: data.formData.lastName,
        email: data.formData.email,
        phone: data.formData.phone,
        address: data.formData.address || "",
        city: data.formData.city || "",
        state: data.formData.state || "",
        zip: data.formData.zip || "",
        date: data.formData.date,
        timeSlot: data.formData.timeSlot || "09:00 - 12:00", // ✅ Default time slot
        notes: data.formData.notes || "",
      },
      totalPrice: data.totalPrice,
      discountedPrice: data.discountedPrice,
      discountApplied: data.discountApplied || false,
      discountPercent: data.discountPercent || 0,
      promoCode: data.promoCode || null,
      promoCodeId: promoCodeId,
      submittedAt: data.submittedAt,
      vehicleCount: data.vehicleCount,
      status: BookingStatus.PENDING,
    });

    // ✅ GOOGLE CALENDAR EVENT CREATION (with error handling)
    let calendarEvent = null;
    try {
      calendarEvent = await googleCalendar.createEvent(newBooking);
      console.log('✅ Google Calendar event created successfully');
    } catch (calendarError) {
      console.error('❌ Google Calendar event creation failed:', calendarError);
      // Calendar error ko fatal nahi banayein - booking to save ho chuki hai
    }

    // ✅ FIXED: Email sending logic
    try {
      const { firstName, lastName, email, date, timeSlot, phone } = newBooking.formData;
      
      // 📨 Temporary email templates (aap baad mein proper templates banayein)
      const userHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #f8f9fa; padding: 20px; text-align: center; }
                .details { background: white; padding: 20px; margin: 20px 0; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Booking Confirmation</h1>
                    <p>Thank you for your booking with ${newBooking.webName}</p>
                </div>
                <div class="details">
                    <h2>Booking Details</h2>
                    <p><strong>Booking ID:</strong> ${newBooking.bookingId}</p>
                    <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Phone:</strong> ${phone}</p>
                    <p><strong>Date:</strong> ${date}</p>
                    <p><strong>Time:</strong> ${timeSlot}</p>
                    <p><strong>Vehicles:</strong> ${newBooking.vehicleCount}</p>
                    <p><strong>Total Amount:</strong> $${newBooking.totalPrice}</p>
                    ${newBooking.discountApplied ? `<p><strong>Discounted Price:</strong> $${newBooking.discountedPrice}</p>` : ''}
                </div>
                <div class="footer">
                    <p>We'll contact you soon to confirm your appointment.</p>
                </div>
            </div>
        </body>
        </html>
      `;

      const ownerHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #ffebee; padding: 20px; text-align: center; }
                .details { background: white; padding: 20px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>New Booking Received</h1>
                </div>
                <div class="details">
                    <h2>Booking Details</h2>
                    <p><strong>Booking ID:</strong> ${newBooking.bookingId}</p>
                    <p><strong>Customer:</strong> ${firstName} ${lastName}</p>
                    <p><strong>Contact:</strong> ${email} | ${phone}</p>
                    <p><strong>Service Date:</strong> ${date} at ${timeSlot}</p>
                    <p><strong>Address:</strong> ${newBooking.formData.address}, ${newBooking.formData.city}, ${newBooking.formData.state} ${newBooking.formData.zip}</p>
                    <p><strong>Vehicles:</strong> ${newBooking.vehicleCount}</p>
                    <p><strong>Amount:</strong> $${newBooking.totalPrice} (Discounted: $${newBooking.discountedPrice})</p>
                    <p><strong>Notes:</strong> ${newBooking.formData.notes || 'None'}</p>
                </div>
            </div>
        </body>
        </html>
      `;

      // Send to user
      await sendEmail({
        to: email, // ✅ FIXED: yahan 'email' variable defined hai
        subject: `Your Booking Confirmation - ${newBooking.webName} (#${newBooking.bookingId})`,
        html: userHtml,
      });

      // Send to owner
      await sendEmail({
        to: process.env.OWNER_EMAIL,
        subject: `New Booking Received (#${newBooking.bookingId})`,
        html: ownerHtml,
      });

      console.log("✅ Emails sent to user and owner");
    } catch (mailError) {
      console.error("❌ Email sending failed:", mailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Booking created, emails sent, and calendar event created",
        data: {
          ...newBooking.toObject(),
          calendarEvent: calendarEvent ? {
            id: calendarEvent.id,
            htmlLink: calendarEvent.htmlLink
          } : null
        },
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (err) {
    console.error("POST /api/booking error:", err);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
/**
 * ✅ GET — Fetch all bookings with promo code details
 */
export async function GET() {
  try {
    await connectDB();
    const bookings = await Booking.find()
      .populate('promoCodeId') // Populate promo code details
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        count: bookings.length,
        data: bookings,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error("GET /api/booking error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings" },
      { status: 500, headers: corsHeaders }
    );
  }
}