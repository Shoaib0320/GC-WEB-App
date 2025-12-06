// src/app/api/admin/users/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/Models/User";
import Agent from "@/Models/Agent";
import { verifyToken } from "@/lib/jwt";

export async function GET(request) {
  try {
    await connectDB();

    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all"; // all, users, agents

    let users = [];
    let agents = [];

    if (type === "all" || type === "users") {
      users = await User.find({}, "firstName lastName email _id").sort({ firstName: 1 });
    }

    if (type === "all" || type === "agents") {
      agents = await Agent.find({}, "agentName agentId email _id").sort({ agentName: 1 });
    }

    return NextResponse.json({
      success: true,
      data: {
        users: users.map(u => ({
          id: u._id,
          name: `${u.firstName} ${u.lastName}`,
          email: u.email,
          type: 'user'
        })),
        agents: agents.map(a => ({
          id: a._id,
          name: a.agentName,
          email: a.email,
          agentId: a.agentId,
          type: 'agent'
        }))
      }
    });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}