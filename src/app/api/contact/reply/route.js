import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ContactMessage from "@/Models/Contact";
import { sendEmail, emailTemplates } from "@/lib/email";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req) {
  try {
    await connectDB();

    const { contactId, subject, message } = await req.json();

    if (!contactId || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Find the contact
    const contact = await ContactMessage.findById(contactId);
    if (!contact) {
      return NextResponse.json(
        { success: false, error: "Contact not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // Send email reply
    const emailContent = emailTemplates.contactReply(
      contact.name,
      contact.message,
      subject,
      message,
      contact.webName || "Our Service"
    );

    await sendEmail({
      to: contact.email,
      subject: subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    // Update contact status to "In Progress"
    contact.status = "replied";
    contact.repliedAt = new Date();
    await contact.save();

    return NextResponse.json(
      {
        success: true,
        message: "Reply sent successfully",
        data: contact,
      },
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error("Error sending contact reply:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send reply" },
      { status: 500, headers: corsHeaders }
    );
  }
}
