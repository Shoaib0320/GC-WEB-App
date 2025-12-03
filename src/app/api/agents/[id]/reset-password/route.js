import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import Agent from '@/Models/Agent';

export async function POST(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const { newPassword } = await request.json();

    if (!id || !newPassword) {
      return NextResponse.json({ error: 'Missing agent id or newPassword' }, { status: 400 });
    }

    // Basic validation for ObjectId-ish string
    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return NextResponse.json({ error: 'Invalid agent id' }, { status: 400 });
    }

    const agent = await Agent.findById(id);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    agent.password = hashed;
    // clear any existing reset tokens
    agent.resetPasswordToken = undefined;
    agent.resetPasswordExpires = undefined;

    await agent.save();

    return NextResponse.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Admin reset password error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
// // src/app/api/agents/[id]/reset-password/route.js
// import { NextResponse } from 'next/server';
// import bcrypt from 'bcryptjs';
// import connectDB from '@/lib/mongodb';
// import Agent from '../../../../../Models/Agent';

// export async function POST(request, { params }) {
//   try {
//     await connectDB();
    
//     const { id } = params;
//     const { newPassword } = await request.json();

//     const agent = await Agent.findById(id);

//     if (!agent) {
//       return NextResponse.json(
//         { error: 'Agent not found' },
//         { status: 404 }
//       );
//     }

//     // Hash new password
//     const hashedPassword = await bcrypt.hash(newPassword, 12);

//     // Update password
//     agent.password = hashedPassword;
//     await agent.save();

//     return NextResponse.json({
//       message: 'Password reset successfully'
//     });
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }