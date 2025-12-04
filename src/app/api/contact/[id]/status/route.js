import { NextResponse } from "next/server";
import ContactMessage, { ContactStatus } from "@/Models/Contact";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

/**
 * PATCH /api/contact/[id]/status
 * 
 * Update contact message status (new, read, replied, archived, resolved)
 * 
 * Body:
 * {
 *   "status": "new" | "read" | "replied" | "archived" | "resolved"
 * }
 */
export async function PATCH(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid contact ID format" },
        { status: 400 }
      );
    }

    // Get request body
    const body = await request.json();
    const { status } = body;

    // Validate status
    if (!status) {
      return NextResponse.json(
        { success: false, error: "Status is required" },
        { status: 400 }
      );
    }

    // Check if status is valid
    const validStatuses = Object.values(ContactStatus);
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status. Valid statuses are: ${validStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Find and update contact
    const contact = await ContactMessage.findById(id);
    if (!contact) {
      return NextResponse.json(
        { success: false, error: "Contact message not found" },
        { status: 404 }
      );
    }

    // Update status
    contact.status = status;

    // If marking as replied, update repliedAt timestamp
    if (status === ContactStatus.REPLIED) {
      contact.repliedAt = new Date();
    }

    await contact.save();

    return NextResponse.json(
      {
        success: true,
        message: `Contact status updated to "${status}"`,
        data: contact,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/contact/[id]/status error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update contact status",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/contact/[id]/status
 * 
 * Get contact message status
 */
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid contact ID format" },
        { status: 400 }
      );
    }

    // Get contact status
    const contact = await ContactMessage.findById(id).select("_id name email status repliedAt createdAt");
    if (!contact) {
      return NextResponse.json(
        { success: false, error: "Contact message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          contactId: contact._id,
          name: contact.name,
          email: contact.email,
          status: contact.status,
          repliedAt: contact.repliedAt,
          createdAt: contact.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/contact/[id]/status error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch contact status",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
