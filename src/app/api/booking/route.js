// import { NextResponse } from "next/server";

// import Booking, { BookingStatus } from "@/models/Booking";
// import connectDB from "@/lib/mongodb";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// // ✅ OPTIONS (for CORS preflight)
// export async function OPTIONS() {
//   return new NextResponse(null, { status: 204, headers: corsHeaders });
// }

// /**
//  * ✅ POST — Create a new booking
//  */
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
//     const existingBooking = await Booking.findOne({ bookingId: data.bookingId });
//     if (existingBooking) {
//       return NextResponse.json(
//         { success: false, error: "Booking ID already exists" },
//         { status: 409, headers: corsHeaders }
//       );
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
//       submittedAt: data.submittedAt,
//       vehicleCount: data.vehicleCount,
//       status: BookingStatus.PENDING,
//     });

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Booking created successfully",
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

// /**
//  * ✅ GET — Fetch all bookings (latest first)
//  */
// export async function GET() {
//   try {
//     await connectDB();
//     const bookings = await Booking.find().sort({ createdAt: -1 });

//     return NextResponse.json(
//       {
//         success: true,
//         count: bookings.length,
//         data: bookings,
//       },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (err) {
//     console.error("GET /api/booking error:", err);
//     return NextResponse.json(
//       { success: false, error: "Failed to fetch bookings" },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// // }








import { NextResponse } from "next/server";
import Booking, { BookingStatus } from "@/Models/Booking";
import connectDB from "@/lib/mongodb";
import { sendEmail } from "@/lib/mailer";
import { getWebsiteConfig } from "@/lib/websiteConfig";
import { getConfirmationEmail } from "@/lib/emailTemplates"; // import whichever template you need


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ OPTIONS (for CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

/**
 * ✅ POST — Create a new booking + send emails
 */
export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();

    // ✅ Validation
    if (
      !data.bookingId ||
      !data.webName ||
      !data.formData ||
      !data.formData.firstName ||
      !data.formData.lastName ||
      !data.formData.email ||
      !data.formData.phone ||
      !data.formData.date ||
      data.totalPrice === undefined ||
      data.discountedPrice === undefined ||
      !data.submittedAt ||
      data.vehicleCount === undefined
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400, headers: corsHeaders }
      );
    }

    // ✅ Check for duplicate bookingId
    const existingBooking = await Booking.findOne({
      bookingId: data.bookingId,
    });
    if (existingBooking) {
      return NextResponse.json(
        { success: false, error: "Booking ID already exists" },
        { status: 409, headers: corsHeaders }
      );
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
        timeSlot: data.formData.timeSlot || "",
        notes: data.formData.notes || "",
      },
      totalPrice: data.totalPrice,
      discountedPrice: data.discountedPrice,
      discountApplied: data.discountApplied || false,
      discountPercent: data.discountPercent || 0,
      promoCode: data.promoCode || null,
      submittedAt: data.submittedAt,
      vehicleCount: data.vehicleCount,
      status: BookingStatus.PENDING,
    });

    // ✅ Email sending logic
    const { email } = data.formData;

          // ✅ Fetch correct site configuration
    const websiteConfig = getWebsiteConfig(data.webName);

    // ✅ Generate user email using correct branding
    const userHtml = getConfirmationEmail(newBooking, websiteConfig);


    try {

    // ✅ Send email to user
    await sendEmail({
      to: newBooking.formData.email,
      subject: `Your Booking Confirmation - ${websiteConfig.name} (#${newBooking.bookingId})`,
      html: userHtml,
    });

    // ✅ Send email to site owner
    await sendEmail({
      to: websiteConfig.ownerEmail,
      subject: `New Booking Received (#${newBooking.bookingId}) - ${websiteConfig.name}`,
      html: userHtml, // You can replace this with an owner-specific template if you wish
    });

      console.log("✅ Emails sent to user and owner");
    } catch (mailError) {
      console.error("❌ Email sending failed:", mailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Booking created and emails sent successfully",
        data: newBooking,
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
 * ✅ GET — Fetch all bookings (latest first)
 */
export async function GET() {
  try {
    await connectDB();
    const bookings = await Booking.find().sort({ createdAt: -1 });

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




