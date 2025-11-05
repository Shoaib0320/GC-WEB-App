// app/api/shifts/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Shift from "@/Models/Shift";

/* 🔹 UPDATE SHIFT */
export async function PUT(request, context) {
  try {
    await connectDB();
    const { id } = await context.params;
    const body = await request.json();

    // ✅ normalize days
    if (body.days && !Array.isArray(body.days)) {
      body.days = [body.days];
    }

    const updated = await Shift.findByIdAndUpdate(id, body, {
      new: true,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Shift not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Shift updated",
      data: updated,
    });
  } catch (error) {
    console.error("PUT /api/shifts/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/* 🔹 DELETE SHIFT */
export async function DELETE(request, context) {
  try {
    await connectDB();
    const { id } = await context.params;

    const deleted = await Shift.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Shift not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Shift deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/shifts/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
