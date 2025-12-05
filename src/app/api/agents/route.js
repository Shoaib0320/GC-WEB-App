import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import Shift from '@/Models/Shift';
import { sendEmail, emailTemplates } from '@/lib/email';
import connectDB from '@/lib/mongodb';
import Agent from '@/Models/Agent';

// GET - Get all agents
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 100;
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { agentName: { $regex: search, $options: 'i' } },
          { agentId: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const agents = await Agent.find(searchQuery)
      .populate('shift')
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Agent.countDocuments(searchQuery);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      agents,
      pagination: {
        currentPage: page,
        totalPages,
        totalAgents: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching agents' },
      { status: 500 }
    );
  }
}

// POST - Create new agent
export async function POST(request) {
  try {
    await connectDB();

    const { agentName, agentId, shift, email, password, monthlyTarget } = await request.json();

    // Validation
    if (!agentName || !agentId || !shift || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if agent already exists
    const existingAgent = await Agent.findOne({
      $or: [{ agentId }, { email }]
    });

    if (existingAgent) {
      return NextResponse.json(
        { error: 'Agent ID or Email already exists' },
        { status: 400 }
      );
    }

    // Check if shift exists
    const shiftExists = await Shift.findById(shift);
    if (!shiftExists) {
      return NextResponse.json(
        { error: 'Invalid shift' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create agent
    const agent = await Agent.create({
      agentName,
      agentId,
      shift,
      email,
      password: hashedPassword,
      monthlyTarget: monthlyTarget || 0
    });

    // Send welcome email
    try {
      const emailTemplate = emailTemplates.agentWelcome(agentName, agentId, password);
      await sendEmail({
        to: email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Continue even if email fails
    }

    const populatedAgent = await Agent.findById(agent._id)
      .populate('shift')
      .select('-password');

    return NextResponse.json(
      {
        message: 'Agent created successfully',
        agent: populatedAgent
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Agent creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
