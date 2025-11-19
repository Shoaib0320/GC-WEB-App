import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import Agent from '../../../../Models/Agent';

export async function POST(request) {
  try {
    await connectDB();
    
    const { token, newPassword } = await request.json();

    // Hash the token to compare with stored token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const agent = await Agent.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset token
    agent.password = hashedPassword;
    agent.resetPasswordToken = undefined;
    agent.resetPasswordExpires = undefined;
    
    await agent.save();

    return NextResponse.json({
      message: 'Password reset successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}