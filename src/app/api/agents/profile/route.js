// app/api/agents/profile/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Agent from '@/Models/Agent';
import { verifyToken } from '@/lib/jwt';
import Shift from '@/Models/Shift';

export async function GET(request) {
  try {
    await connectDB();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.type !== 'agent') {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const agent = await Agent.findById(decoded.id).populate('shift');
    
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const agentData = {
      id: agent._id,
      agentName: agent.agentName,
      agentId: agent.agentId,
      email: agent.email,
      phone: agent.phone,
      isActive: agent.isActive,
      shift: agent.shift
    };

    return NextResponse.json({
      success: true,
      agent: agentData
    });

  } catch (error) {
    console.error("Profile error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}