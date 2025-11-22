// // import { NextResponse } from "next/server";
// // import Booking, { BookingStatus } from "@/Models/Booking";
// // import connectDB from "@/lib/mongodb";
// // import { sendEmail } from "@/lib/mailer";
// // import { getWebsiteConfig } from "@/lib/websiteConfig";
// // import { getConfirmationEmail, getOwnerNotificationEmail, getPendingEmail } from "@/lib/emailTemplates"; // import whichever template you need

// // import PromoCode from "@/Models/PromoCode"; // Import PromoCode model
// // import { googleCalendar } from "@/lib/googleCalendar";

// // const corsHeaders = {
// //   "Access-Control-Allow-Origin": "*",
// //   "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
// //   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// // };

// // export async function OPTIONS() {
// //   return new NextResponse(null, { status: 204, headers: corsHeaders });
// // }

// // export async function POST(req) {
// //   try {
// //     await connectDB();
// //     const data = await req.json();

// //     // ✅ Existing validation logic...
// //     if (
// //       !data.bookingId ||
// //       !data.webName ||
// //       !data.formData ||
// //       !data.formData.firstName ||
// //       !data.formData.lastName ||
// //       !data.formData.email ||
// //       !data.formData.phone ||
// //       !data.formData.date ||
// //       data.totalPrice === undefined ||
// //       data.discountedPrice === undefined ||
// //       !data.submittedAt ||
// //       data.vehicleCount === undefined
// //     ) {
// //       return NextResponse.json(
// //         { success: false, error: "Missing required fields" },
// //         { status: 400, headers: corsHeaders }
// //       );
// //     }

// //     // ✅ Check for duplicate bookingId
// //     const existingBooking = await Booking.findOne({
// //       bookingId: data.bookingId,
// //     });
// //     if (existingBooking) {
// //       return NextResponse.json(
// //         { success: false, error: "Booking ID already exists" },
// //         { status: 409, headers: corsHeaders }
// //       );
// //     }

// //     // ✅ Existing promo code logic...
// //     let promoCodeData = null;
// //     let promoCodeId = null;

// //     if (data.promoCode) {
// //       promoCodeData = await PromoCode.findOne({
// //         promoCode: data.promoCode.toUpperCase(),
// //         isActive: true,
// //       });

// //       if (promoCodeData) {
// //         // ... existing promo validation
// //         promoCodeData.usedCount += 1;
// //         await promoCodeData.save();
// //         promoCodeId = promoCodeData._id;
// //       } else {
// //         return NextResponse.json(
// //           { success: false, error: "Invalid promo code" },
// //           { status: 400, headers: corsHeaders }
// //         );
// //       }
// //     }

// //     // ✅ Create new booking
// //     const newBooking = await Booking.create({
// //       bookingId: data.bookingId,
// //       webName: data.webName,
// //       formData: {
// //         vehicleBookings: data.formData.vehicleBookings || [],
// //         firstName: data.formData.firstName,
// //         lastName: data.formData.lastName,
// //         email: data.formData.email,
// //         phone: data.formData.phone,
// //         address: data.formData.address || "",
// //         city: data.formData.city || "",
// //         state: data.formData.state || "",
// //         zip: data.formData.zip || "",
// //         date: data.formData.date,
// //         timeSlot: data.formData.timeSlot || "",
// //         notes: data.formData.notes || "",
// //       },
// //       totalPrice: data.totalPrice,
// //       discountedPrice: data.discountedPrice,
// //       discountApplied: data.discountApplied || false,
// //       discountPercent: data.discountPercent || 0,
// //       promoCode: data.promoCode || null,
// //       submittedAt: data.submittedAt,
// //       vehicleCount: data.vehicleCount,
// //       status: BookingStatus.PENDING,
// //     });

// //     // ✅ Email sending logic
// //     const { email } = data.formData;
// //     // ✅ Fetch correct site configuration
// //     const websiteConfig = getWebsiteConfig(data.webName);

// //     // ✅ Generate user email using correct branding
// //     const userHtml = getConfirmationEmail(newBooking, websiteConfig);

// //     let calendarEvent = null;

// //     try {
// //       // NOTE: `newBooking` Mongoose object hai. `createEvent` isko handle karna chahiye.
// //       calendarEvent = await googleCalendar.createEvent(newBooking);
// //       console.log("✅ Google Calendar event created successfully");
// //     } catch (calendarError) {
// //       console.error("❌ Google Calendar event creation failed:", calendarError);
// //       // Calendar error ko fatal nahi banayein - booking to save ho chuki hai
// //     }

// //     // 📧 TEMPLATE-BASED EMAIL SENDING (Updated Logic)
// //     try {
// //       const { email } = newBooking.formData;

// //       // 1. Website ki configuration fetch karein
// //       const websiteConfig = getWebsiteConfig(newBooking.webName);

// //       // 2. User ke liye PENDING email generate karein
// //       const userHtml = getPendingEmail(newBooking, websiteConfig);

// //       // 3. Owner ke liye NEW BOOKING notification generate karein
// //       const ownerHtml = getOwnerNotificationEmail(newBooking, websiteConfig);

// //       // Send to user
// //       await sendEmail({
// //         to: email,
// //         subject: `Your Booking is Pending Review - ${newBooking.webName} (#${newBooking.bookingId})`,
// //         html: userHtml,
// //       });

// //       // Send to owner (using dynamic email from config, falling back to ENV)
// //       await sendEmail({
// //         to: websiteConfig.ownerEmail || process.env.OWNER_EMAIL,
// //         subject: `🚨 NEW BOOKING ALERT: #${newBooking.bookingId} (${newBooking.webName})`,
// //         html: ownerHtml,
// //       });

// //       console.log("✅ Emails sent to user and owner");
// //     } catch (mailError) {
// //       console.error("❌ Email sending failed:", mailError);
// //     }

// //     return NextResponse.json(
// //       {
// //         success: true,
// //         message: "Booking created, emails sent, and calendar event created",
// //         data: {
// //           ...newBooking.toObject(),
// //           calendarEvent: calendarEvent
// //             ? {
// //               id: calendarEvent.id,
// //               htmlLink: calendarEvent.htmlLink,
// //             }
// //             : null,
// //         },
// //       },
// //       { status: 201, headers: corsHeaders }
// //     );
// //   } catch (err) {
// //     console.error("POST /api/booking error:", err);
// //     return NextResponse.json(
// //       { success: false, error: "Internal Server Error" },
// //       { status: 500, headers: corsHeaders }
// //     );
// //   }
// // }

// // /**
// //  * ✅ GET — Fetch all bookings (latest first)
// //  */
// // export async function GET() {
// //   try {
// //     await connectDB();
// //     const bookings = await Booking.find()
// //       .populate("promoCodeId") // Populate promo code details
// //       .sort({ createdAt: -1 });

// //     return NextResponse.json(
// //       {
// //         success: true,
// //         count: bookings.length,
// //         data: bookings,
// //       },
// //       { status: 200, headers: corsHeaders }
// //     );
// //   } catch (err) {
// //     console.error("GET /api/booking error:", err);
// //     return NextResponse.json(
// //       { success: false, error: "Failed to fetch bookings" },
// //       { status: 500, headers: corsHeaders }
// //     );
// //   }
// // }





import { NextResponse } from "next/server";
import Booking, { BookingStatus } from "@/Models/Booking";
import connectDB from "@/lib/mongodb";
import { sendEmail } from "@/lib/mailer";
import { getWebsiteConfig } from "@/lib/websiteConfig";
import { 
  getConfirmationEmail, 
  getOwnerNotificationEmail, 
  getPendingEmail 
} from "@/lib/emailTemplates";
import PromoCode from "@/Models/PromoCode";
import { googleCalendar } from "@/lib/googleCalendar";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();

    // ✅ UPDATED: discountedPrice ko required se hata diya
    if (
      !data.bookingId ||
      !data.webName ||
      !data.vendorName ||
      !data.bookingType ||
      !data.formData ||
      !data.formData.firstName ||
      !data.formData.lastName ||
      !data.formData.email ||
      !data.formData.phone ||
      !data.formData.date ||
      data.totalPrice === undefined ||
      !data.submittedAt
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

    // ✅ Promo code logic (Optional)
    let promoCodeData = null;
    let promoCodeId = null;
    let discountApplied = false;
    let discountPercent = 0;
    let discountedPrice = data.totalPrice; // Default: totalPrice hi discountedPrice

    if (data.promoCode) {
      promoCodeData = await PromoCode.findOne({
        promoCode: data.promoCode.toUpperCase(),
        isActive: true,
      });

      if (promoCodeData) {
        // ✅ Apply discount calculation
        discountApplied = true;
        discountPercent = promoCodeData.discountPercent;
        discountedPrice = data.totalPrice - (data.totalPrice * discountPercent / 100);
        
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

    // ✅ Calculate serviceCount based on booking type
    let serviceCount = data.serviceCount || 1;
    if (data.bookingType === 'vehicle' && data.vehicleCount) {
      serviceCount = data.vehicleCount;
    }

    // ✅ Create new booking with updated schema
    const newBooking = await Booking.create({
      bookingId: data.bookingId,
      webName: data.webName,
      vendorName: data.vendorName,
      bookingType: data.bookingType,
      formData: {
        vehicleBookings: data.formData.vehicleBookings || [],
        bookingDetails: data.formData.bookingDetails || null,
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
      discountedPrice: discountedPrice, // ✅ Now it's always defined
      discountApplied: discountApplied,
      discountPercent: discountPercent,
      promoCode: data.promoCode || null,
      promoCodeId: promoCodeId,
      submittedAt: data.submittedAt,
      vehicleCount: data.vehicleCount || 0,
      serviceCount: serviceCount,
      status: BookingStatus.PENDING,
    });

    let calendarEvent = null;

    // ✅ Google Calendar Event
    try {
      calendarEvent = await googleCalendar.createEvent(newBooking);
      console.log("✅ Google Calendar event created successfully");
    } catch (calendarError) {
      console.error("❌ Google Calendar event creation failed:", calendarError);
    }

    // ✅ Email sending logic
    try {
      const { email } = newBooking.formData;
      const websiteConfig = getWebsiteConfig(newBooking.webName);

      // User email
      const userHtml = getPendingEmail(newBooking, websiteConfig);
      await sendEmail({
        to: email,
        subject: `Your Booking is Pending Review - ${newBooking.webName} (#${newBooking.bookingId})`,
        html: userHtml,
      });

      // Owner email
      const ownerHtml = getOwnerNotificationEmail(newBooking, websiteConfig);
      await sendEmail({
        to: websiteConfig.ownerEmail || process.env.OWNER_EMAIL,
        subject: `🚨 NEW BOOKING ALERT: #${newBooking.bookingId} (${newBooking.webName})`,
        html: ownerHtml,
      });

      console.log("✅ Emails sent to user and owner");
    } catch (mailError) {
      console.error("❌ Email sending failed:", mailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Booking created successfully",
        data: {
          ...newBooking.toObject(),
          calendarEvent: calendarEvent
            ? {
                id: calendarEvent.id,
                htmlLink: calendarEvent.htmlLink,
              }
            : null,
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
 * ✅ GET — Fetch all bookings (latest first)
 */
export async function GET(req) {
  try {
    await connectDB();
    
    // ✅ Query parameters for filtering
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const vendor = searchParams.get('vendor');
    const status = searchParams.get('status');
    
    let query = {};
    
    // ✅ Filter by booking type
    if (type) {
      query.bookingType = type;
    }
    
    // ✅ Filter by vendor
    if (vendor) {
      query.vendorName = vendor;
    }
    
    // ✅ Filter by status
    if (status) {
      query.status = status;
    }
    
    const bookings = await Booking.find(query)
      .populate("promoCodeId")
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