import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import WeeklyOff from "@/Models/WeeklyOff";
import { verifyToken } from "@/lib/jwt";

export async function POST(request) {
  try {
    await connectDB();

    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    const body = await request.json();
    const { day, name, description, isActive = true } = body;

    if (!day || !name) {
      return NextResponse.json({ success: false, message: "Day and name are required" }, { status: 400 });
    }

    // Check if day already exists
    const existing = await WeeklyOff.findOne({ day });
    if (existing) {
      return NextResponse.json({ success: false, message: `${day} already exists` }, { status: 400 });
    }

    const weeklyOff = await WeeklyOff.create({
      day,
      name,
      description,
      isActive,
      createdBy: decoded.userId
    });

    return NextResponse.json({ 
      success: true, 
      message: "Weekly off day added successfully", 
      data: weeklyOff 
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/weekly-off error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await connectDB();

    const weeklyOffs = await WeeklyOff.find()
      .populate("createdBy", "firstName lastName email")
      .sort({ day: 1 });

    return NextResponse.json({ success: true, data: weeklyOffs });
  } catch (error) {
    console.error("GET /api/weekly-off error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectDB();

    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    const body = await request.json();
    const { id, isActive } = body;

    if (!id || typeof isActive !== 'boolean') {
      return NextResponse.json({ success: false, message: "ID and isActive are required" }, { status: 400 });
    }

    const weeklyOff = await WeeklyOff.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!weeklyOff) {
      return NextResponse.json({ success: false, message: "Weekly off day not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Weekly off ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: weeklyOff 
    });
  } catch (error) {
    console.error("PUT /api/weekly-off error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();

    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
    }

    await WeeklyOff.findByIdAndDelete(id);

    return NextResponse.json({ 
      success: true, 
      message: "Weekly off day deleted successfully" 
    });
  } catch (error) {
    console.error("DELETE /api/weekly-off error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}