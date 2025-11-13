// app/api/agents/profile/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Agent from '@/Models/Agent';
import { verifyToken } from '@/lib/jwt';
import Shift from '@/Models/Shift';
// import { Month } from 'react-day-picker';

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
      monthlyTarget: agent.monthlyTarget,
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

export async function PUT(request) {
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

    const body = await request.json();
    const { agentName, email, phone } = body;

    // Validation
    if (!agentName || agentName.trim().length < 2) {
      return NextResponse.json({ 
        error: "Name is required and must be at least 2 characters" 
      }, { status: 400 });
    }

    // Check if email already exists (if provided and different from current)
    if (email) {
      const existingAgent = await Agent.findOne({ 
        email: email.toLowerCase().trim(),
        _id: { $ne: decoded.id }
      });
      
      if (existingAgent) {
        return NextResponse.json({ 
          error: "Email already exists" 
        }, { status: 400 });
      }
    }

    // Update agent profile
    const updateData = {
      agentName: agentName.trim(),
      ...(email && { email: email.toLowerCase().trim() }),
      ...(phone && { phone: phone.trim() })
    };

    const updatedAgent = await Agent.findByIdAndUpdate(
      decoded.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('shift');

    if (!updatedAgent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const agentData = {
      id: updatedAgent._id,
      agentName: updatedAgent.agentName,
      agentId: updatedAgent.agentId,
      email: updatedAgent.email,
      phone: updatedAgent.phone,
      monthlyTarget: updatedAgent.monthlyTarget,
      isActive: updatedAgent.isActive,
      shift: updatedAgent.shift
    };

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      agent: agentData
    });

  } catch (error) {
    console.error("Profile update error:", error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json({ 
        error: "Validation failed: " + Object.values(error.errors).map(e => e.message).join(', ') 
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}