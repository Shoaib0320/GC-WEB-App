//app/api/agents/profile/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import Agent from '../../../../Models/Agent';

// GET - Get agent profile
export async function GET(request) {
  try {
    await connectDB();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const agent = await Agent.findById(decoded.id).populate('shift').select('-password');

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json({ agent });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

// PUT - Update agent profile
export async function PUT(request) {
  try {
    await connectDB();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { agentName, email } = await request.json();

    const agent = await Agent.findByIdAndUpdate(
      decoded.id,
      { agentName, email },
      { new: true, runValidators: true }
    ).populate('shift').select('-password');

    return NextResponse.json({
      message: 'Profile updated successfully',
      agent
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error updating profile' },
      { status: 500 }
    );
  }
}