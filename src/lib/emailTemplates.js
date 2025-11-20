// // lib/emailTemplates.js (English/Professional Version)

// =========================================
// 1. WEBSITE CONFIGURATION
// =========================================
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const LOGO_PATH = `${APP_URL}/Web_logo`;

export const WEBSITE_CONFIG = {
  "Decent Auto Detailing": {
    name: "Decent Auto Detailing",
    brandColor: "#007BFF",
    contrastColor: "#121733",
    bgColor: "#CFCFCF",
    logoUrl: `${LOGO_PATH}/Decent-Auto-Detailing_logo.png`,
    ownerEmail: "shoaibrazamemon170@gmail.com",
  },
  "Quality Auto Care": {
    name: "Quality Auto Care",
    brandColor: "#28A745",
    contrastColor: "#ffffff",
    bgColor: "#e8f5e9",
    logoUrl: `${LOGO_PATH}/Qulaity-Auto-clear_logo.png`,
    ownerEmail: "shoaibrazamemon170@gmail.com",
  },
  "Spark Ride": {
    name: "Spark Ride",
    brandColor: "#FF9800",
    contrastColor: "#ffffff",
    bgColor: "#fff3e0",
    logoUrl: `${LOGO_PATH}/spark-ride.png`,
    ownerEmail: "shoaibrazamemon170@gmail.com",
  },
  "Local Auto SPA": {
    name: "Local Auto SPA",
    brandColor: "#17A2B8",
    contrastColor: "#ffffff",
    bgColor: "#e0f7fa",
    logoUrl: `${LOGO_PATH}/Local-auto-spa_logo.png`,
    ownerEmail: "shoaibrazamemon170@gmail.com",
  },
  "Impereal Auto Detailing": {
    name: "Impereal Auto Detailing",
    brandColor: "#6F42C1",
    contrastColor: "#ffffff",
    bgColor: "#f3e8ff",
    logoUrl: `${LOGO_PATH}/imperial_logo.png`,
    ownerEmail: "shoaibrazamemon170@gmail.com",
  },
  "Home Town Detailing": {
    name: "Home Town Detailing",
    brandColor: "#DC3545",
    contrastColor: "#ffffff",
    bgColor: "#fdecea",
    logoUrl: `${LOGO_PATH}/home-town-detailing.png`,
    ownerEmail: "shoaibrazamemon170@gmail.com",
  },
  "Decent Detailers": {
    name: "Decent Detailers",
    brandColor: "#343A40",
    contrastColor: "#f8f9fa",
    bgColor: "#e9ecef",
    logoUrl: `${LOGO_PATH}/Decent-Detailers_logo.png`,
    ownerEmail: "shoaibrazamemon170@gmail.com",
  },
  "Car Wash Pro": {
    name: "Car Wash Pro",
    brandColor: "#009688",
    contrastColor: "#ffffff",
    bgColor: "#e0f2f1",
    logoUrl: `${LOGO_PATH}/car-wash-pro.png`,
    ownerEmail: "support@carwashpro.com",
  },
};

// ✅ EXPORT 1: Config Getter
export function getWebsiteConfig(webName) {
  return WEBSITE_CONFIG[webName] || WEBSITE_CONFIG["Decent Auto Detailing"];
}

// =========================================
// 2. BASE EMAIL TEMPLATE & UTILITIES
// =========================================

function createBaseEmailTemplate(options) {
  const {
    brandColor,
    bgColor,
    contrastColor,
    logoUrl,
    websiteName,
    emailTitle,
    preheader,
    messageBody,
    bookingDetailsHtml,
    firstName
  } = options;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${emailTitle}</title>
    <style>
        body { margin: 0; padding: 0; width: 100%; background-color: ${bgColor || "#f4f7f9"}; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
        .container { width: 100%; max-width: 600px; margin: 0 auto; }
        .card { background-color: #ffffff; border-radius: 12px; margin: 20px 0; box-shadow: 0 6px 18px rgba(0,0,0,0.06); overflow: hidden; }
        .header { text-align: center; padding: 32px; background-color: #ffffff; }
        .header img { max-width: 160px; }
        .content { padding: 30px 40px; }
        .content p { font-size: 16px; color: #495057; line-height: 1.6; }
        .info-box { background-color: #ffffff; border-radius: 8px; padding: 20px; margin: 25px 0; border: 1px solid #e9ecef; }
        .info-box h3 { margin-top: 0; font-size: 16px; font-weight: 600; color: ${brandColor || "#333"}; border-bottom: 1px solid #dee2e6; padding-bottom: 10px; }
        .data-table { width: 100%; text-align: left; }
        .data-table td { padding: 5px 0; font-size: 14px; color: #495057; vertical-align: top; }
        .data-table td.label { width: 120px; font-weight: 600; color: #343a40; }
        .invoice-table { width: 100%; border-collapse: collapse; }
        .invoice-table td { padding: 10px 5px; font-size: 14px; color: #495057; text-align: left; }
        .invoice-table .subtotal-row td { border-bottom: 1px solid #e9ecef; }
        .invoice-table .total-row td { padding-top: 15px; font-size: 16px; font-weight: 700; }
        .total-tag { background-color: ${brandColor || "#007BFF"}; color: ${contrastColor || "#ffffff"}; padding: 8px 12px; border-radius: 6px; font-size: 17px; font-weight: 700; display: inline-block; }
        .status-box { padding: 15px; border-radius: 6px; margin-bottom: 25px; border-left: 5px solid; }
        .status-pending { background-color: #fffbe6; border-color: #faad14; color: #8a6d3b; }
        .status-confirmed { background-color: #e6f7ec; border-color: #52c41a; color: #0a6847; }
        .status-cancelled { background-color: #fff1f0; border-color: #ff4d4f; color: #a8071a; }
        .status-rescheduled { background-color: #fffbe6; border-color: #faad14; color: #8a6d3b; }
        .status-completed { background-color: #e6f7ff; border-color: #1890ff; color: #0056b3; }
        .status-box p { margin: 0; font-size: 15px; }
    </style>
</head>
<body style="margin: 0; padding: 0; width: 100%; background-color: ${bgColor || "#f4f7f9"}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <span style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</span>
    <table class="container" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 600px; margin: 0 auto;">
        <tr>
            <td align="center">
                <div class="card">
                    <div class="header">
                        <img src="${logoUrl}" alt="${websiteName} Logo">
                    </div>
                    <div class="content">
                        <h1 style="font-size: 24px; font-weight: 600; color: ${brandColor || "#007BFF"}; margin-top: 0; margin-bottom: 30px;">${emailTitle}</h1>
                        <p>Dear <strong>${firstName}</strong>,</p>
                        ${messageBody}
                        ${bookingDetailsHtml}
                        <p>If you have any questions, please reply directly to this email.</p>
                        <p>Thank you,<br>The ${websiteName} Team</p>
                    </div>
                </div>
            </td>
        </tr>
        <tr><td class="footer">© ${new Date().getFullYear()} ${websiteName}. All rights reserved.</td></tr>
    </table>
</body>
</html>`;
}

function generateBookingDetailsHtml(booking, config) {
  const { brandColor, contrastColor } = config;
  const vehicleDetailsHtml = booking.formData.vehicleBookings.map(v => `
    <table class="data-table" style="padding-bottom: 15px; margin-bottom: 15px; border-bottom: 1px dashed #dee2e6;" width="100%">
        <tr><td class="label">Vehicle:</td><td>${v.vehicleMake} ${v.vehicleModel} (${v.vehicleYear})</td></tr>
        <tr><td class="label">Main Service:</td><td>${v.mainService}</td></tr>
        <tr><td class="label">Package:</td><td>${v.package}</td></tr>
        ${v.additionalServices.length ? `<tr><td class="label">Add-ons:</td><td>${v.additionalServices.join(", ")}</td></tr>` : ""}
    </table>`).join("");

  return `
    <div class="info-box">
        <h3>Booking Summary</h3>
        <table class="data-table">
            <tr><td class="label">Booking ID:</td><td>${booking.bookingId}</td></tr>
            <tr><td class="label">Status:</td><td><span style="color: ${brandColor}; text-transform: capitalize; font-weight: 600;">${booking.status}</span></td></tr>
            <tr><td class="label">Date:</td><td>${booking.formData.date}</td></tr>
            <tr><td class="label">Time:</td><td>${booking.formData.timeSlot}</td></tr>
            <tr><td class="label">Address:</td><td>${booking.formData.address || "N/A"}</td></tr>
        </table>
    </div>
    <div class="info-box"><h3>Service & Vehicle Details</h3>${vehicleDetailsHtml}</div>
    <div class="info-box">
        <h3>Payment Summary</h3>
        <table class="invoice-table"><tbody>
            <tr class="subtotal-row"><td>Subtotal:</td><td style="text-align: right;">$${booking.totalPrice.toFixed(2)}</td></tr>
            ${booking.discountApplied ? `<tr class="subtotal-row"><td>Discount (${booking.promoCode}):</td><td style="text-align: right;">-$${(booking.totalPrice - booking.discountedPrice).toFixed(2)}</td></tr>` : ""}
            <tr class="total-row"><td>Total:</td><td style="text-align: right;"><span class="total-tag">$${booking.discountedPrice.toFixed(2)}</span></td></tr>
        </tbody></table>
    </div>`;
}

function generateServiceAndPaymentDetailsHtml(booking, config) {
  // Reusing logic for simpler view if needed, currently using full details
  return generateBookingDetailsHtml(booking, config);
}

// =========================================
// 4. STATUS-SPECIFIC TEMPLATES
// =========================================

// ✅ EXPORT 2
export function getPendingEmail(booking, websiteConfig) {
  const messageBody = `
    <div class="status-box status-pending"><p><strong>Your booking is currently pending review.</strong></p></div>
    <p>Thank you for choosing ${websiteConfig.name}! We have received your booking request (ID: <strong>${booking.bookingId}</strong>).</p>
    <p>We will send you a confirmation email shortly.</p>
    <p>Requested: <strong>${booking.formData.date}</strong> at <strong>${booking.formData.timeSlot}</strong>.</p>`;
  return createBaseEmailTemplate({ ...websiteConfig, websiteName: websiteConfig.name, emailTitle: "Your Booking Request is Pending Review", preheader: `Pending: Booking #${booking.bookingId}`, firstName: booking.formData.firstName, messageBody, bookingDetailsHtml: generateBookingDetailsHtml(booking, websiteConfig) });
}

// ✅ EXPORT 3
export function getConfirmationEmail(booking, websiteConfig) {
  const messageBody = `
    <div class="status-box status-confirmed"><p><strong>Your booking is confirmed!</strong></p></div>
    <p>We are pleased to confirm your service appointment.</p>`;
  return createBaseEmailTemplate({ ...websiteConfig, websiteName: websiteConfig.name, emailTitle: "Your Booking is Confirmed!", preheader: `Confirmed: Booking #${booking.bookingId}`, firstName: booking.formData.firstName, messageBody, bookingDetailsHtml: generateBookingDetailsHtml(booking, websiteConfig) });
}

// ✅ EXPORT 4
export function getCancellationEmail(booking, websiteConfig) {
  const messageBody = `
    <div class="status-box status-cancelled"><p><strong>Your booking has been cancelled.</strong></p></div>
    <p>This booking has been cancelled.</p>`;
  return createBaseEmailTemplate({ ...websiteConfig, websiteName: websiteConfig.name, emailTitle: "Booking Cancelled", preheader: `Cancelled: Booking #${booking.bookingId}`, firstName: booking.formData.firstName, messageBody, bookingDetailsHtml: generateBookingDetailsHtml(booking, websiteConfig) });
}

// ✅ EXPORT 5
export function getRescheduledEmail(booking, websiteConfig) {
  const messageBody = `
    <div class="status-box status-rescheduled"><p><strong>Your booking has been rescheduled.</strong></p></div>
    <p>Your appointment has been updated. Please review the new details below:</p>
    <div class="info-box">
        <h3>Updated Appointment</h3>
        <table class="data-table">
            <tr><td class="label">New Date:</td><td>${booking.formData.date}</td></tr>
            <tr><td class="label">New Time:</td><td>${booking.formData.timeSlot}</td></tr>
        </table>
    </div>`;
  return createBaseEmailTemplate({ ...websiteConfig, websiteName: websiteConfig.name, emailTitle: "Your Booking Has Been Rescheduled", preheader: `Rescheduled: Booking #${booking.bookingId}`, firstName: booking.formData.firstName, messageBody, bookingDetailsHtml: generateServiceAndPaymentDetailsHtml(booking, websiteConfig) });
}

// ✅ EXPORT 6
export function getCompletedEmail(booking, websiteConfig) {
  const messageBody = `
    <div class="status-box status-completed"><p><strong>Your service is complete!</strong></p></div>
    <p>We're happy to inform you that the service is complete.</p>`;
  return createBaseEmailTemplate({ ...websiteConfig, websiteName: websiteConfig.name, emailTitle: "Service Completed", preheader: `Completed: Booking #${booking.bookingId}`, firstName: booking.formData.firstName, messageBody, bookingDetailsHtml: generateBookingDetailsHtml(booking, websiteConfig) });
}

// ✅ EXPORT 7
export function getOwnerNotificationEmail(booking, websiteConfig) {
  const customerDetailsHtml = `
    <div class="info-box" style="background-color: #fdf2f2; border: 1px solid #fadddd;">
        <h3 style="color: #b91c1c; border-bottom: 1px solid #fadddd;">Customer Contact Details</h3>
        <table class="data-table">
            <tr><td class="label">Name:</td><td>${booking.formData.firstName} ${booking.formData.lastName}</td></tr>
            <tr><td class="label">Email:</td><td>${booking.formData.email}</td></tr>
            <tr><td class="label">Phone:</td><td>${booking.formData.phone}</td></tr>
            <tr><td class="label">Address:</td><td>${booking.formData.address || "N/A"}</td></tr>
        </table>
    </div>`;
  const messageBody = `
    <div class="status-box" style="background-color: ${websiteConfig.bgColor}; border-left: 5px solid ${websiteConfig.brandColor};"><p><strong>NEW BOOKING / UPDATE ALERT!</strong></p></div>
    <p>A booking (ID: <strong>${booking.bookingId}</strong>) has been updated/received via <strong>${websiteConfig.name}</strong>.</p>
    <p>Status: <strong>${booking.status.toUpperCase()}</strong></p>`;
  return createBaseEmailTemplate({ ...websiteConfig, websiteName: websiteConfig.name, emailTitle: `Booking Notification (#${booking.bookingId})`, preheader: `Notification: ${booking.bookingId}`, firstName: "Admin", messageBody, bookingDetailsHtml: customerDetailsHtml + generateBookingDetailsHtml(booking, websiteConfig) });
}