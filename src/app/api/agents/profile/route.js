// //app/api/agents/profile/route.js
// import { NextResponse } from 'next/server';
// import jwt from 'jsonwebtoken';
// import bcrypt from 'bcryptjs';
// import connectDB from '@/lib/mongodb';
// import Agent from '../../../../Models/Agent';

// // GET - Get agent profile
// export async function GET(request) {
//   try {
//     await connectDB();
    
//     const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
//     if (!token) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const agent = await Agent.findById(decoded.id).populate('shift').select('-password');

//     if (!agent) {
//       return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
//     }

//     return NextResponse.json({ agent });
//   } catch (error) {
//     return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
//   }
// }

// // PUT - Update agent profile
// export async function PUT(request) {
//   try {
//     await connectDB();
    
//     const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
//     if (!token) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const { agentName, email } = await request.json();

//     const agent = await Agent.findByIdAndUpdate(
//       decoded.id,
//       { agentName, email },
//       { new: true, runValidators: true }
//     ).populate('shift').select('-password');

//     return NextResponse.json({
//       message: 'Profile updated successfully',
//       agent
//     });
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Error updating profile' },
//       { status: 500 }
//     );
//   }
// }



// app/api/agents/profile/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Agent from "@/Models/Agent";
import { verifyToken, getUserIdFromToken } from "@/lib/jwt";

export async function GET(request) {
  try {
    await connectDB();

    // Authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    // Get user ID from token
    let userId;
    try {
      userId = getUserIdFromToken(decoded);
      console.log('🔍 Profile Request - User ID:', userId);
    } catch (error) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid token data: " + error.message 
      }, { status: 401 });
    }

    // Find agent by ID
    const agent = await Agent.findById(userId).populate('shift');
    
    if (!agent) {
      return NextResponse.json({ 
        success: false, 
        message: "Agent not found" 
      }, { status: 404 });
    }

    // Return agent data (without password)
    const agentData = {
      id: agent._id,
      agentName: agent.agentName,
      agentId: agent.agentId,
      email: agent.email,
      phone: agent.phone,
      shift: agent.shift,
      isActive: agent.isActive,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt
    };

    console.log('✅ Profile fetched successfully:', {
      agentId: agent.agentId,
      agentName: agent.agentName
    });

    return NextResponse.json({
      success: true,
      agent: agentData
    });

  } catch (error) {
    console.error("GET /api/agents/profile error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectDB();

    // Authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    // Get user ID from token
    let userId;
    try {
      userId = getUserIdFromToken(decoded);
    } catch (error) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid token data: " + error.message 
      }, { status: 401 });
    }

    const body = await request.json();
    const { agentName, email, phone } = body;

    // Update agent
    const updatedAgent = await Agent.findByIdAndUpdate(
      userId,
      { 
        agentName, 
        email, 
        phone,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('shift');

    if (!updatedAgent) {
      return NextResponse.json({ 
        success: false, 
        message: "Agent not found" 
      }, { status: 404 });
    }

    // Return updated agent data
    const agentData = {
      id: updatedAgent._id,
      agentName: updatedAgent.agentName,
      agentId: updatedAgent.agentId,
      email: updatedAgent.email,
      phone: updatedAgent.phone,
      shift: updatedAgent.shift,
      isActive: updatedAgent.isActive
    };

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      agent: agentData
    });

  } catch (error) {
    console.error("PUT /api/agents/profile error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}