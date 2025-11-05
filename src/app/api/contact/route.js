import { NextResponse } from "next/server";
import ContactMessage from '@/Models/Contact'
import connectDB from "@/lib/mongodb";
/**
 * ✅ CORS Headers — used for every response
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Allow all origins (for testing or public API)
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/**
 * ✅ Handle Preflight (OPTIONS) Request
 */
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

/**
 * ✅ POST — Create a new contact message
 */
export async function POST(req) {
  try {
    await connectDB();

    const data = await req.json();

    if (!data.name || !data.email || !data.message || !data.webName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400, headers: corsHeaders }
      );
    }

    const newMessage = await ContactMessage.create({
      ...data,
      status: "new",
    });

    return NextResponse.json(
      { success: true, data: newMessage },
      { status: 201, headers: corsHeaders }
    );
  } catch (err) {
    console.error("POST /api/contact error:", err);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * ✅ GET — Fetch all contact messages (sorted by latest)
 */
export async function GET() {
  try {
    await connectDB();

    const messages = await ContactMessage.find().sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, count: messages.length, data: messages },
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error("GET /api/contact error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500, headers: corsHeaders }
    );
  }
}
