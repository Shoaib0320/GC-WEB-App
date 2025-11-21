import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Agent from '@/Models/Agent';
import { sendEmail, emailTemplates } from '@/lib/email';

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    const { isActive } = await request.json();

    // Validation
    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive field is required and must be boolean' },
        { status: 400 }
      );
    }

    // Find and update agent status
    const agent = await Agent.findByIdAndUpdate(
      id,
      { 
        isActive,
        // Optional: Add status update timestamp
        statusUpdatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('shift').select('-password');

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Send status update email notification
    try {
      const status = isActive ? 'activated' : 'deactivated';
      const emailTemplate = emailTemplates.accountStatus(
        agent.agentName,
        agent.agentId,
        status
      );
      
      await sendEmail({
        to: agent.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text
      });
      
      console.log(`Status update email sent to ${agent.email}`);
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
      // Continue even if email fails
    }

    return NextResponse.json({
      success: true,
      message: `Agent ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        agent,
        status: isActive ? 'active' : 'inactive',
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Agent status update error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// GET - Get agent status
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;

    const agent = await Agent.findById(id)
      .select('isActive agentName agentId email statusUpdatedAt');

    if (!agent) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Agent not found' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        agentId: agent.agentId,
        agentName: agent.agentName,
        email: agent.email,
        isActive: agent.isActive,
        statusUpdatedAt: agent.statusUpdatedAt,
        currentStatus: agent.isActive ? 'active' : 'inactive'
      }
    });
  } catch (error) {
    console.error('Get agent status error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error fetching agent status' 
      },
      { status: 500 }
    );
  }
}