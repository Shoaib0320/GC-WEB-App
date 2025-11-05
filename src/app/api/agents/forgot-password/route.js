import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';
import connectDB from '@/lib/mongodb';
import Agent from '../../../../Models/Agent';

export async function POST(request) {
  try {
    await connectDB();
    
    const { email } = await request.json();

    const agent = await Agent.findOne({ email });

    if (!agent) {
      return NextResponse.json(
        { error: 'No account found with this email' },
        { status: 404 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set token expiry (1 hour)
    agent.resetPasswordToken = resetPasswordToken;
    agent.resetPasswordExpires = Date.now() + 3600000;
    
    await agent.save();

    // Send email (you need to implement sendEmail function)
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    try {
      await sendEmail({
        to: agent.email,
        subject: 'Password Reset Request',
        html: `
          <h3>Password Reset Request</h3>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
        `
      });
    } catch (emailError) {
      // Reset the token if email fails
      agent.resetPasswordToken = undefined;
      agent.resetPasswordExpires = undefined;
      await agent.save();
      
      return NextResponse.json(
        { error: 'Error sending email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Password reset email sent successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}