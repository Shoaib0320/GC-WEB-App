// // lib/emailTemplates.js (English/Professional Version)

// /*
//  * =========================================
//  * 1. MASTER EMAIL LAYOUT (Professional)
//  * Hamara main layout, English mein.
//  * =========================================
//  */
// function createBaseEmailTemplate(options) {
//   const {
//     brandColor,
//     logoUrl,
//     websiteName,
//     emailTitle,
//     preheader, // Email preview k liye
//     messageBody,
//     bookingDetailsHtml,
//   } = options;

//   return `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>${emailTitle}</title>
//     <style>
//         body { margin: 0; padding: 0; width: 100%; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
//         .container { width: 100%; max-width: 600px; margin: 0 auto; }
//         .card { background-color: #ffffff; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #e9ecef; }
//         .header { text-align: center; padding: 40px 20px 20px 20px; border-bottom: 1px solid #e9ecef; }
//         .header img { max-width: 160px; }
//         .content { padding: 35px; }
//         .content h1 { font-size: 22px; color: #343a40; margin-top: 0; }
//         .content p { font-size: 16px; color: #495057; line-height: 1.6; }
//         .info-box { background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 25px 0; }
//         .info-box h3 { margin-top: 0; font-size: 16px; color: #343a40; border-bottom: 1px solid #dee2e6; padding-bottom: 10px; }
//         .footer { text-align: center; padding: 30px; font-size: 12px; color: #adb5bd; }
        
//         /* Status-Specific Styles */
//         .status-box { padding: 15px; border-radius: 6px; margin-bottom: 25px; border-left: 5px solid; }
//         .status-confirmed { background-color: #e6f7ec; border-color: #52c41a; color: #0a6847; }
//         .status-cancelled { background-color: #fff1f0; border-color: #ff4d4f; color: #a8071a; }
//         .status-rescheduled { background-color: #fffbe6; border-color: #faad14; color: #8a6d3b; }
//         .status-completed { background-color: #e6f7ff; border-color: #1890ff; color: #0056b3; }
//         .status-box p { margin: 0; font-size: 15px; }

//     </style>
// </head>
// <body style="margin: 0; padding: 0; width: 100%; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
//     <span style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
//         ${preheader}
//     </span>

//     <table class="container" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 600px; margin: 0 auto;">
//         <tr>
//             <td align="center">
//                 <div class="card" style="background-color: #ffffff; border-radius: 8px; margin: 40px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #e9ecef;">
                    
//                     <div class="header" style="text-align: center; padding: 40px 20px 20px 20px; border-bottom: 1px solid #e9ecef;">
//                         <img src="${logoUrl}" alt="${websiteName} Logo" style="max-width: 160px;">
//                     </div>

//                     <div class="content" style="padding: 35px;">
//                         <h1 style="font-size: 22px; color: #343a40; margin-top: 0;">${emailTitle}</h1>
//                         <p style="font-size: 16px; color: #495057; line-height: 1.6;">
//                             Dear <strong>${options.firstName}</strong>,
//                         </p>
                        
//                         ${messageBody}

//                         ${bookingDetailsHtml}

//                         <p style="font-size: 16px; color: #495057; line-height: 1.6;">
//                             If you have any questions, please reply to this email or contact our support team.
//                         </p>
//                         <p style="font-size: 16px; color: #495057; line-height: 1.6;">
//                             Thank you,<br>
//                             The ${websiteName} Team
//                         </p>
//                     </div>
//                 </div>
//             </td>
//         </tr>
//         <tr>
//             <td class="footer" style="text-align: center; padding: 30px; font-size: 12px; color: #adb5bd;">
//                 © ${new Date().getFullYear()} ${websiteName}. All rights reserved.<br>
//             </td>
//         </tr>
//     </table>
// </body>
// </html>
//   `;
// }

// /*
//  * =========================================
//  * 2. BOOKING DETAILS HTML GENERATOR
//  * =========================================
//  */
// function generateBookingDetailsHtml(booking, brandColor) {
//   const vehicleDetailsHtml = booking.formData.vehicleBookings.map(vehicle => `
//     <div style="padding-bottom: 15px; margin-bottom: 15px; border-bottom: 1px dashed #dee2e6;">
//         <h4 style="margin: 0 0 10px 0; color: #495057; font-size: 15px;">Vehicle: ${vehicle.vehicleMake} ${vehicle.vehicleModel} (${vehicle.vehicleYear})</h4>
//         <p style="margin: 5px 0; font-size: 14px; color: #6c757d;"><strong>Main Service:</strong> ${vehicle.mainService}</p>
//         <p style="margin: 5px 0; font-size: 14px; color: #6c757d;"><strong>Package:</strong> ${vehicle.package}</p>
//         ${vehicle.additionalServices.length ? `<p style="margin: 5px 0; font-size: 14px; color: #6c757d;"><strong>Add-ons:</strong> ${vehicle.additionalServices.join(', ')}</p>` : ''}
//     </div>
//   `).join('');

//   return `
//     <div class="info-box" style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 25px 0;">
//         <h3 style="margin-top: 0; font-size: 16px; color: #343a40; border-bottom: 1px solid #dee2e6; padding-bottom: 10px;">Booking Summary</h3>
//         <p style="margin: 10px 0 5px 0; font-size: 14px; color: #495057;"><strong>Booking ID:</strong> ${booking.bookingId}</p>
//         <p style="margin: 5px 0; font-size: 14px; color: #495057;"><strong>Status:</strong> <span style="color: ${brandColor}; text-transform: capitalize;">${booking.status}</span></p>
//         <p style="margin: 5px 0; font-size: 14px; color: #495057;"><strong>Date:</strong> ${booking.formData.date}</p>
//         <p style="margin: 5px 0 0 0; font-size: 14px; color: #495057;"><strong>Time:</strong> ${booking.formData.timeSlot}</p>
//     </div>

//     <div class="info-box" style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 25px 0;">
//         <h3 style="margin-top: 0; font-size: 16px; color: #343a40; border-bottom: 1px solid #dee2e6; padding-bottom: 10px;">Service & Vehicle Details</h3>
//         ${vehicleDetailsHtml}
//     </div>

//     <div class="info-box" style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 25px 0;">
//         <h3 style="margin-top: 0; font-size: 16px; color: #343a40; border-bottom: 1px solid #dee2e6; padding-bottom: 10px;">Payment Summary</h3>
//         <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; color: #495057;">
//             <tbody>
//                 ${booking.discountApplied ? `
//                 <tr>
//                     <td style="padding: 5px 0;">Subtotal:</td>
//                     <td style="padding: 5px 0; text-align: right;">$${booking.totalPrice.toFixed(2)}</td>
//                 </tr>
//                 <tr>
//                     <td style="padding: 5px 0;">Discount (${booking.promoCode}):</td>
//                     <td style="padding: 5px 0; text-align: right;">-$${(booking.totalPrice - booking.discountedPrice).toFixed(2)}</td>
//                 </tr>
//                 ` : ''}
//                 <tr style="font-weight: bold; font-size: 16px; color: #343a40;">
//                     <td style="padding: 10px 0 0 0;">Total:</td>
//                     <td style="padding: 10px 0 0 0; text-align: right;">$${booking.discountedPrice.toFixed(2)}</td>
//                 </tr>
//             </tbody>
//         </table>
//     </div>
//   `;
// }


// /*
//  * =========================================
//  * 3. STATUS-SPECIFIC TEMPLATES (English)
//  * =========================================
//  */

// // A. CONFIRMED Template
// export function getConfirmationEmail(booking, websiteConfig) {
//   const messageBody = `
//     <div class="status-box status-confirmed" style="padding: 15px; border-radius: 6px; margin-bottom: 25px; border-left: 5px solid #52c41a; background-color: #e6f7ec; color: #0a6847;">
//         <p style="margin: 0; font-size: 15px;"><strong>Your booking is confirmed!</strong></p>
//     </div>
//     <p style="font-size: 16px; color: #495057; line-height: 1.6;">
//         We are pleased to confirm your service appointment. Our team will
//         arrive at your location on the scheduled date and time.
//     </p>
//     <p style="font-size: 16px; color: #495057; line-height: 1.6;">
//         Please review your booking details below.
//     </p>
//   `;

//   return createBaseEmailTemplate({
//     brandColor: websiteConfig.brandColor,
//     logoUrl: websiteConfig.logoUrl,
//     websiteName: websiteConfig.name,
//     emailTitle: "Your Booking is Confirmed!",
//     preheader: `Your booking #${booking.bookingId} is confirmed for ${booking.formData.date}.`,
//     firstName: booking.formData.firstName,
//     messageBody: messageBody,
//     bookingDetailsHtml: generateBookingDetailsHtml(booking, websiteConfig.brandColor),
//   });
// }

// // B. CANCELLED Template
// export function getCancellationEmail(booking, websiteConfig) {
//   const messageBody = `
//     <div class="status-box status-cancelled" style="padding: 15px; border-radius: 6px; margin-bottom: 25px; border-left: 5px solid #ff4d4f; background-color: #fff1f0; color: #a8071a;">
//         <p style="margin: 0; font-size: 15px;"><strong>Your booking has been cancelled.</strong></p>
//     </div>
//     <p style="font-size: 16px; color: #495057; line-height: 1.6;">
//         As requested, your booking (ID: ${booking.bookingId}) has been cancelled.
//     </p>
//     ${booking.cancellationReason ? `
//     <p style="font-size: 16px; color: #495057; line-height: 1.6;">
//         <strong>Reason:</strong> ${booking.cancellationReason}
//     </p>` : ''}
//     <p style="font-size: 16px; color: #495057; line-height: 1.6;">
//         If you believe this was a mistake or wish to re-book, please contact us immediately.
//     </p>
//   `;

//   return createBaseEmailTemplate({
//     brandColor: websiteConfig.brandColor,
//     logoUrl: websiteConfig.logoUrl,
//     websiteName: websiteConfig.name,
//     emailTitle: "Your Booking Has Been Cancelled",
//     preheader: `Confirmation of your booking cancellation (ID: ${booking.bookingId}).`,
//     firstName: booking.formData.firstName,
//     messageBody: messageBody,
//     bookingDetailsHtml: generateBookingDetailsHtml(booking, websiteConfig.brandColor), // Details phir bhi bhej dein
//   });
// }

// // C. RESCHEDULED Template
// export function getRescheduledEmail(booking, websiteConfig) {
//   const messageBody = `
//     <div class="status-box status-rescheduled" style="padding: 15px; border-radius: 6px; margin-bottom: 25px; border-left: 5px solid #faad14; background-color: #fffbe6; color: #8a6d3b;">
//         <p style="margin: 0; font-size: 15px;"><strong>Your booking has been rescheduled.</strong></p>
//     </div>
//     <p style="font-size: 16px; color: #495057; line-height: 1.6;">
//         Your appointment has been successfully rescheduled. Please see the new details below.
//     </p>
//     <div class="info-box" style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 25px 0;">
//         <h3 style="margin-top: 0; font-size: 16px; color: #343a40; border-bottom: 1px solid #dee2e6; padding-bottom: 10px;">Updated Appointment</h3>
//         <p style="margin: 10px 0 5px 0; font-size: 14px; color: #495057;"><strong>New Date:</strong> ${booking.formData.date}</p>
//         <p style="margin: 5px 0 0 0; font-size: 14px; color: #495057;"><strong>New Time:</strong> ${booking.formData.timeSlot}</p>
//     </div>
//     <p style="font-size: 16px; color: #495057; line-height: 1.6;">
//         All other service details remain the same.
//     </p>
//   `;

//   return createBaseEmailTemplate({
//     brandColor: websiteConfig.brandColor,
//     logoUrl: websiteConfig.logoUrl,
//     websiteName: websiteConfig.name,
//     emailTitle: "Your Booking Has Been Rescheduled",
//     preheader: `Your booking #${booking.bookingId} is now on ${booking.formData.date}.`,
//     firstName: booking.formData.firstName,
//     messageBody: messageBody,
//     bookingDetailsHtml: generateBookingDetailsHtml(booking, websiteConfig.brandColor),
//   });
// }

// // D. COMPLETED Template
// export function getCompletedEmail(booking, websiteConfig) {
//   const messageBody = `
//     <div class="status-box status-completed" style="padding: 15px; border-radius: 6px; margin-bottom: 25px; border-left: 5px solid #1890ff; background-color: #e6f7ff; color: #0056b3;">
//         <p style="margin: 0; font-size: 15px;"><strong>Your service is complete!</strong></p>
//     </div>
//     <p style="font-size: 16px; color: #495057; line-height: 1.6;">
//         Thank you for choosing ${websiteConfig.name}. We have successfully completed your service.
//     </p>
//     <p style="font-size: 16px; color: #495057; line-height: 1.6;">
//         We hope you are satisfied with the results. We would love to hear your feedback!
//     </p>
//   `;

//   return createBaseEmailTemplate({
//     brandColor: websiteConfig.brandColor,
//     logoUrl: websiteConfig.logoUrl,
//     websiteName: websiteConfig.name,
//     emailTitle: "Your Service is Complete!",
//     preheader: `Thank you for choosing ${websiteConfig.name}. (Booking ID: ${booking.bookingId})`,
//     firstName: booking.formData.firstName,
//     messageBody: messageBody,
//     bookingDetailsHtml: generateBookingDetailsHtml(booking, websiteConfig.brandColor),
//   });
// }



// lib/emailTemplates.js (Professional UI + Table Alignment Fix)

/*
 * =========================================
 * 1. MASTER EMAIL LAYOUT (Professional)
 * =========================================
 */
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
        .card { 
            background-color: #ffffff; 
            border-radius: 12px;
            margin: 20px 0; 
            box-shadow: 0 6px 18px rgba(0,0,0,0.06);
            overflow: hidden;
        }
        .header { text-align: center; padding: 32px; background-color: #ffffff; }
        .header img { max-width: 160px; }
        .content { padding: 30px 40px; }
        .content p { font-size: 16px; color: #495057; line-height: 1.6; }
        
        .info-box { 
            background-color: #ffffff;
            border-radius: 8px; 
            padding: 20px; 
            margin: 25px 0;
            border: 1px solid #e9ecef;
        }
        .info-box h3 {
            margin-top: 0; 
            font-size: 16px; 
            font-weight: 600;
            color: ${brandColor || "#333"};
            border-bottom: 1px solid #dee2e6; 
            padding-bottom: 10px;
        }
        .footer { text-align: center; padding: 30px; font-size: 13px; color: #8898aa; }
        
        /* ✅ Data table (naya) jo alignment set karega */
        .data-table { width: 100%; text-align: left; }
        .data-table td {
            padding: 5px 0;
            font-size: 14px;
            color: #495057;
            vertical-align: top;
        }
        /* Label wala cell (jese "Booking ID:") */
        .data-table td.label {
            width: 120px; /* Ek fixed width */
            font-weight: 600;
            color: #343a40;
        }

        /* Payment table ka naya style */
        .invoice-table { width: 100%; border-collapse: collapse; }
        .invoice-table td { 
            padding: 10px 5px; 
            font-size: 14px; 
            color: #495057;
            text-align: left; /* Ensure left align */
        }
        .invoice-table .subtotal-row td { 
            border-bottom: 1px solid #e9ecef; 
        }
        .invoice-table .total-row td { 
            padding-top: 15px; 
            font-size: 16px; 
            font-weight: 700; 
        }
        
        /* Naya "Total" button/tag style */
        .total-tag {
            background-color: ${brandColor || "#007BFF"}; 
            color: ${contrastColor || "#ffffff"}; 
            padding: 8px 12px; 
            border-radius: 6px; 
            font-size: 17px;
            font-weight: 700;
            display: inline-block; /* text-align:right ke liye zaroori */
        }

        /* ... (Status box styles wese hi hain) ... */
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
    <span style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
        ${preheader}
    </span>
    <table class="container" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 600px; margin: 0 auto;">
        <tr>
            <td align="center">
                <div class="card" style="background-color: #ffffff; border-radius: 12px; margin: 40px 10px; box-shadow: 0 6px 18px rgba(0,0,0,0.06); overflow: hidden;">
                    <div class="header" style="text-align: center; padding: 32px; background-color: #ffffff;">
                        <img src="${logoUrl}" alt="${websiteName} Logo" style="max-width: 160px;">
                    </div>
                    <div class="content" style="padding: 30px 40px;">
                        <h1 style="font-size: 24px; font-weight: 600; color: ${brandColor || "#007BFF"}; margin-top: 0; margin-bottom: 30px;">
                            ${emailTitle}
                        </h1>
                        <p style="font-size: 16px; color: #495057; line-height: 1.6;">
                            Dear <strong>${options.firstName}</strong>,
                        </p>
                        ${messageBody}
                        ${bookingDetailsHtml}
                        <p style="font-size: 16px; color: #495057; line-height: 1.6;">
                            If you have any questions, please reply directly to this email or contact our support team.
                        </p>
                        <p style="font-size: 16px; color: #495057; line-height: 1.6;">
                            Thank you,<br>
                            The ${websiteName} Team
                        </p>
                    </div>
                </div>
            </td>
        </tr>
        <tr>
            <td class="footer" style="text-align: center; padding: 30px; font-size: 13px; color: #8898aa;">
                © ${new Date().getFullYear()} ${websiteName}. All rights reserved.<br>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
}

/*
 * =========================================
 * 2. BOOKING DETAILS HTML GENERATOR (Full)
 * =========================================
 */
function generateBookingDetailsHtml(booking, config) {
  const { brandColor, contrastColor } = config;

  const vehicleDetailsHtml = booking.formData.vehicleBookings
    .map(
      (vehicle) => `
    <table class="data-table" style="padding-bottom: 15px; margin-bottom: 15px; border-bottom: 1px dashed #dee2e6;" width="100%">
        <tr>
            <td class="label" style="width: 120px; font-weight: 600; color: #343a40;">Vehicle:</td>
            <td>${vehicle.vehicleMake} ${vehicle.vehicleModel} (${
        vehicle.vehicleYear
      })</td>
        </tr>
        <tr>
            <td class="label" style="width: 120px; font-weight: 600; color: #343a40;">Main Service:</td>
            <td>${vehicle.mainService}</td>
        </tr>
        <tr>
            <td class="label" style="width: 120px; font-weight: 600; color: #343a40;">Package:</td>
            <td>${vehicle.package}</td>
        </tr>
        ${
          vehicle.additionalServices.length
            ? `
            <tr>
                <td class="label" style="width: 120px; font-weight: 600; color: #343a40;">Add-ons:</td>
                <td>${vehicle.additionalServices.join(", ")}</td>
            </tr>`
            : ""
        }
    </table>
  `
    )
    .join("");

  return `
    <div class="info-box">
        <h3 style="margin-top: 0; font-size: 16px; font-weight: 600; color: ${brandColor}; border-bottom: 1px solid #dee2e6; padding-bottom: 10px;">Booking Summary</h3>
        
        <table class="data-table" width="100%">
            <tr>
                <td class="label" style="width: 120px; font-weight: 600; color: #343a40;">Booking ID:</td>
                <td>${booking.bookingId}</td>
            </tr>
            <tr>
                <td class="label" style="width: 120px; font-weight: 600; color: #343a40;">Status:</td>
                <td><span style="color: ${brandColor}; text-transform: capitalize; font-weight: 600;">${
    booking.status
  }</span></td>
            </tr>
            <tr>
                <td class="label" style="width: 120px; font-weight: 600; color: #343a40;">Date:</td>
                <td>${booking.formData.date}</td>
            </tr>
            <tr>
                <td class="label" style="width: 120px; font-weight: 600; color: #343a40;">Time:</td>
                <td>${booking.formData.timeSlot}</td>
            </tr>
        </table>
    </div>

    <div class="info-box">
        <h3 style="margin-top: 0; font-size: 16px; font-weight: 600; color: ${brandColor}; border-bottom: 1px solid #dee2e6; padding-bottom: 10px;">Service & Vehicle Details</h3>
        ${vehicleDetailsHtml}
    </div>

    <div class="info-box">
        <h3 style="margin-top: 0; font-size: 16px; font-weight: 600; color: ${brandColor}; border-bottom: 1px solid #dee2e6; padding-bottom: 10px;">Payment Summary</h3>
        
        <table class="invoice-table" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse;">
            <tbody>
                ${
                  booking.discountApplied
                    ? `
                <tr class="subtotal-row">
                    <td style="padding: 10px 5px; font-size: 14px; color: #495057; border-bottom: 1px solid #e9ecef; text-align: left;">Subtotal:</td>
                    <td style="padding: 10px 5px; font-size: 14px; color: #495057; border-bottom: 1px solid #e9ecef; text-align: right;">$${booking.totalPrice.toFixed(
                      2
                    )}</td>
                </tr>
                <tr class="subtotal-row">
                    <td style="padding: 10px 5px; font-size: 14px; color: #495057; border-bottom: 1px solid #e9ecef; text-align: left;">Discount (${
                      booking.promoCode
                    }):</td>
                    <td style="padding: 10px 5px; font-size: 14px; color: #495057; border-bottom: 1px solid #e9ecef; text-align: right;">-$${(
                      booking.totalPrice - booking.discountedPrice
                    ).toFixed(2)}</td>
                </tr>
                `
                    : ""
                }
                <tr class="total-row">
                    <td style="padding-top: 15px; font-size: 16px; font-weight: 700; text-align: left;">Total:</td>
                    <td style="padding-top: 15px; text-align: right;">
                        <span class="total-tag" style="background-color: ${brandColor}; color: ${contrastColor || "#ffffff"}; padding: 8px 12px; border-radius: 6px; font-size: 17px; font-weight: 700; display: inline-block;">
                            $${booking.discountedPrice.toFixed(2)}
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
  `;
}

/*
 * =========================================
 * 2b. BOOKING DETAILS (For Reschedule Email)
 * =========================================
 */
function generateServiceAndPaymentDetailsHtml(booking, config) {
  const { brandColor, contrastColor } = config;

  const vehicleDetailsHtml = booking.formData.vehicleBookings
    .map(
      (vehicle) => `
    <table class="data-table" style="padding-bottom: 15px; margin-bottom: 15px; border-bottom: 1px dashed #dee2e6;" width="100%">
        <tr>
            <td class="label" style="width: 120px; font-weight: 600; color: #343a40;">Vehicle:</td>
            <td>${vehicle.vehicleMake} ${vehicle.vehicleModel} (${
        vehicle.vehicleYear
      })</td>
        </tr>
        <tr>
            <td class="label" style="width: 120px; font-weight: 600; color: #343a40;">Main Service:</td>
            <td>${vehicle.mainService}</td>
        </tr>
        <tr>
            <td class="label" style="width: 120px; font-weight: 600; color: #343a40;">Package:</td>
            <td>${vehicle.package}</td>
        </tr>
        ${
          vehicle.additionalServices.length
            ? `
            <tr>
                <td class="label" style="width: 120px; font-weight: 600; color: #343a40;">Add-ons:</td>
                <td>${vehicle.additionalServices.join(", ")}</td>
            </tr>`
            : ""
        }
    </table>
  `
    )
    .join("");

  return `
    <div class="info-box">
        <h3 style="margin-top: 0; font-size: 16px; font-weight: 600; color: ${brandColor}; border-bottom: 1px solid #dee2e6; padding-bottom: 10px;">Service & Vehicle Details</h3>
        ${vehicleDetailsHtml}
    </div>

    <div class="info-box">
        <h3 style="margin-top: 0; font-size: 16px; font-weight: 600; color: ${brandColor}; border-bottom: 1px solid #dee2e6; padding-bottom: 10px;">Payment Summary</h3>
        
        <table class="invoice-table" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse;">
            <tbody>
                ${
                  booking.discountApplied
                    ? `
                <tr class="subtotal-row">
                    <td style="padding: 10px 5px; font-size: 14px; color: #495057; border-bottom: 1px solid #e9ecef; text-align: left;">Subtotal:</td>
                    <td style="padding: 10px 5px; font-size: 14px; color: #495057; border-bottom: 1px solid #e9ecef; text-align: right;">$${booking.totalPrice.toFixed(
                      2
                    )}</td>
                </tr>
                <tr class="subtotal-row">
                    <td style="padding: 10px 5px; font-size: 14px; color: #495057; border-bottom: 1px solid #e9ecef; text-align: left;">Discount (${
                      booking.promoCode
                    }):</td>
                    <td style="padding: 10px 5px; font-size: 14px; color: #495057; border-bottom: 1px solid #e9ecef; text-align: right;">-$${(
                      booking.totalPrice - booking.discountedPrice
                    ).toFixed(2)}</td>
                </tr>
                `
                    : ""
                }
                <tr class="total-row">
                    <td style="padding-top: 15px; font-size: 16px; font-weight: 700; text-align: left;">Total:</td>
                    <td style="padding-top: 15px; text-align: right;">
                        <span class="total-tag" style="background-color: ${brandColor}; color: ${contrastColor || "#ffffff"}; padding: 8px 12px; border-radius: 6px; font-size: 17px; font-weight: 700; display: inline-block;">
                            $${booking.discountedPrice.toFixed(2)}
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
  `;
}

/*
 * =========================================
 * 3. STATUS-SPECIFIC TEMPLATES
 * =========================================
 */

// A. PENDING Template
export function getPendingEmail(booking, websiteConfig) {
  // (Logic wesa hi hai, text wesa hi hai)
  const messageBody = `...`; 
  return createBaseEmailTemplate({ /*...*/ });
}

// B. CONFIRMED Template
export function getConfirmationEmail(booking, websiteConfig) {
  const messageBody = `
    <div class="status-box status-confirmed" style="padding: 15px; border-radius: 6px; margin-bottom: 25px; border-left: 5px solid #52c41a; background-color: #e6f7ec; color: #0a6847;">
        <p style="margin: 0; font-size: 15px;"><strong>Your booking is confirmed!</strong></p>
    </div>
    <p style="font-size: 16px; color: #495057; line-height: 1.6;">
        We are pleased to confirm your service appointment for the following date and time:
    </p>
    <div class="info-box">
        <h3 style="margin-top: 0; font-size: 16px; font-weight: 600; color: ${
          websiteConfig.brandColor
        }; border-bottom: 1px solid #dee2e6; padding-bottom: 10px;">Confirmed Appointment</h3>
        
        <table class="data-table" width="100%">
            <tr>
                <td class="label" style="width: 120px; font-weight: 600; color: #343a40; font-size: 18px;">Date:</td>
                <td style="font-size: 18px; color: #343a40;">${
                  booking.formData.date
                }</td>
            </tr>
            <tr>
                <td class="label" style="width: 120px; font-weight: 600; color: #343a40; font-size: 18px;">Time:</td>
                <td style="font-size: 18px; color: #343a40;">${
                  booking.formData.timeSlot
                }</td>
            </tr>
        </table>
    </div>
    <p style="font-size: 16px; color: #495057; line-height: 1.6;">
        Our team will arrive at your location at the scheduled time. We look forward to serving you.
    </p>
  `;

  return createBaseEmailTemplate({
    ...websiteConfig,
    name: websiteConfig.name,
    emailTitle: "Your Booking is Confirmed!",
    preheader: `Confirmed: Booking #${booking.bookingId} for ${booking.formData.date}.`,
    firstName: booking.formData.firstName,
    messageBody: messageBody,
    bookingDetailsHtml: generateBookingDetailsHtml(booking, websiteConfig),
  });
}

// C. CANCELLED Template
export function getCancellationEmail(booking, websiteConfig) {
  // (Logic wesa hi hai, text wesa hi hai)
  const messageBody = `...`; 
  return createBaseEmailTemplate({ /*...*/ });
}

// D. RESCHEDULED Template
export function getRescheduledEmail(booking, websiteConfig) {
  const messageBody = `
    <div class="status-box status-rescheduled" style="padding: 15px; border-radius: 6px; margin-bottom: 25px; border-left: 5px solid #faad14; background-color: #fffbe6; color: #8a6d3b;">
        <p style="margin: 0; font-size: 15px;"><strong>Your booking has been rescheduled.</strong></p>
    </div>
    <p style="font-size: 16px; color: #495057; line-height: 1.6;">
        Your appointment has been successfully updated. Please review the new details below:
    </p>
    
    <div class="info-box">
        <h3 style="margin-top: 0; font-size: 16px; font-weight: 600; color: ${
          websiteConfig.brandColor
        }; border-bottom: 1px solid #dee2e6; padding-bottom: 10px;">Updated Appointment</h3>
        
        <table class="data-table" width="100%">
            <tr>
                <td class="label" style="width: 120px; font-weight: 600; color: #343a40; font-size: 18px;">New Date:</td>
                <td style="font-size: 18px; color: #343a40;">${
                  booking.formData.date
                }</td>
            </tr>
            <tr>
                <td class="label" style="width: 120px; font-weight: 600; color: #343a40; font-size: 18px;">New Time:</td>
                <td style="font-size: 18px; color: #343a40;">${
                  booking.formData.timeSlot
                }</td>
            </tr>
        </table>
    </div>
    <p style="font-size: 16px; color: #495057; line-height: 1.6;">
        All other service and payment details for your booking remain the same.
    </p>
  `;

  return createBaseEmailTemplate({
    ...websiteConfig,
    name: websiteConfig.name,
    emailTitle: "Your Booking Has Been Rescheduled",
    preheader: `Update: Your booking #${booking.bookingId} is now on ${booking.formData.date}.`,
    firstName: booking.formData.firstName,
    messageBody: messageBody,
    bookingDetailsHtml: generateServiceAndPaymentDetailsHtml( 
      booking,
      websiteConfig
    ),
  });
}

// E. COMPLETED Template
export function getCompletedEmail(booking, websiteConfig) {
  // (Logic wesa hi hai, text wesa hi hai)
  const messageBody = `...`; 
  return createBaseEmailTemplate({ /*...*/ });
}

/*
 * =========================================
 * 4. OWNER NOTIFICATION TEMPLATE (Admin ke liye)
 * =========================================
 */
export function getOwnerNotificationEmail(booking, websiteConfig) {
  const customerDetailsHtml = `
    <div class="info-box" style="background-color: #fdf2f2; border: 1px solid #fadddd;">
        <h3 style="margin-top: 0; font-size: 16px; font-weight: 600; color: #b91c1c; border-bottom: 1px solid #fadddd; padding-bottom: 10px;">Customer Contact Details</h3>
        
        <table class="data-table" width="100%">
            <tr>
                <td class="label" style="width: 120px; font-weight: 600; color: #343a40;">Name:</td>
                <td>${booking.formData.firstName} ${
    booking.formData.lastName
  }</td>
            </tr>
            <tr>
                <td class="label" style="width: 120px; font-weight: 600; color: #343a40;">Email:</td>
                <td>${booking.formData.email}</td>
            </tr>
            <tr>
                <td class="label" style="width: 120px; font-weight: 600; color: #343a40;">Phone:</td>
                <td>${booking.formData.phone}</td>
            </tr>
            <tr>
                <td class="label" style="width: 120px; font-weight: 600; color: #343a40;">Address:</td>
                <td>${booking.formData.address || "N/A"}</td>
            </tr>
        </table>
    </div>
  `;

  const messageBody = `...`; // (text wesa hi hai)

  return createBaseEmailTemplate({
    ...websiteConfig,
    name: websiteConfig.name,
    emailTitle: `New Booking Received (#${booking.bookingId})`,
    preheader: `New booking from ${booking.formData.firstName} for ${booking.formData.date}.`,
    firstName: "Admin",
    messageBody: messageBody,
    bookingDetailsHtml:
      customerDetailsHtml +
      generateBookingDetailsHtml(booking, websiteConfig),
  });
}