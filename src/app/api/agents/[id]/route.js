// import { NextResponse } from 'next/server';
// import bcrypt from 'bcryptjs';
// import Shift from '../../../../Models/Shift';
// import { sendEmail, emailTemplates } from '@/lib/email';
// import connectDB from '@/lib/mongodb';
// import Agent from '@/Models/Agent';

// // GET - Get single agent by ID
// export async function GET(request, { params }) {
//   try {
//     await connectDB();
    
//     const { id } = await params;

//     const agent = await Agent.findById(id)
//       .populate('shift')
//       .select('-password');

//     if (!agent) {
//       return NextResponse.json(
//         { error: 'Agent not found' },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({ agent });
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Error fetching agent' },
//       { status: 500 }
//     );
//   }
// }

// // PUT - Update agent
// export async function PUT(request, { params }) {
//   try {
//     await connectDB();
    
//     const { id } = await params;
//     const updateData = await request.json();

//     // Find existing agent
//     const existingAgent = await Agent.findById(id);
//     if (!existingAgent) {
//       return NextResponse.json(
//         { error: 'Agent not found' },
//         { status: 404 }
//       );
//     }

//     // If email is being updated, check for duplicates
//     if (updateData.email && updateData.email !== existingAgent.email) {
//       const emailExists = await Agent.findOne({ 
//         email: updateData.email,
//         _id: { $ne: id } // Exclude current agent
//       });
      
//       if (emailExists) {
//         return NextResponse.json(
//           { error: 'Email already exists' },
//           { status: 400 }
//         );
//       }
//     }

//     // If agentId is being updated, check for duplicates
//     if (updateData.agentId && updateData.agentId !== existingAgent.agentId) {
//       const agentIdExists = await Agent.findOne({ 
//         agentId: updateData.agentId,
//         _id: { $ne: id }
//       });
      
//       if (agentIdExists) {
//         return NextResponse.json(
//           { error: 'Agent ID already exists' },
//           { status: 400 }
//         );
//       }
//     }

//     // If shift is being updated, validate it exists
//     if (updateData.shift) {
//       const shiftExists = await Shift.findById(updateData.shift);
//       if (!shiftExists) {
//         return NextResponse.json(
//           { error: 'Invalid shift' },
//           { status: 400 }
//         );
//       }
//     }

//     // If password is being updated, hash it
//     if (updateData.password) {
//       updateData.password = await bcrypt.hash(updateData.password, 12);
      
//       // Send password update email
//       try {
//         const emailTemplate = emailTemplates.passwordUpdate(
//           existingAgent.agentName, 
//           updateData.agentId || existingAgent.agentId
//         );
//         await sendEmail({
//           to: updateData.email || existingAgent.email,
//           subject: emailTemplate.subject,
//           html: emailTemplate.html,
//           text: emailTemplate.text
//         });
//       } catch (emailError) {
//         console.error('Failed to send password update email:', emailError);
//       }
//     }

//     // Update agent
//     const updatedAgent = await Agent.findByIdAndUpdate(
//       id,
//       { $set: updateData },
//       { new: true, runValidators: true }
//     ).populate('shift').select('-password');

//     // Send profile update email if critical details changed
//     if (updateData.agentName || updateData.agentId || updateData.shift) {
//       try {
//         const emailTemplate = emailTemplates.profileUpdate(
//           updateData.agentName || existingAgent.agentName,
//           updateData.agentId || existingAgent.agentId
//         );
//         await sendEmail({
//           to: updateData.email || existingAgent.email,
//           subject: emailTemplate.subject,
//           html: emailTemplate.html,
//           text: emailTemplate.text
//         });
//       } catch (emailError) {
//         console.error('Failed to send profile update email:', emailError);
//       }
//     }

//     return NextResponse.json({
//       message: 'Agent updated successfully',
//       agent: updatedAgent
//     });
//   } catch (error) {
//     console.error('Agent update error:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// // DELETE - Delete agent
// export async function DELETE(request, { params }) {
//   try {
//     await connectDB();
    
//     const { id } = params;

//     const agent = await Agent.findByIdAndDelete(id);

//     if (!agent) {
//       return NextResponse.json(
//         { error: 'Agent not found' },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({
//       message: 'Agent deleted successfully'
//     });
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Error deleting agent' },
//       { status: 500 }
//     );
//   }
// }

// // PATCH - Update agent status
// export async function PATCH(request, { params }) {
//   try {
//     await connectDB();
    
//     const { id } = params;
//     const { isActive } = await request.json();

//     if (typeof isActive !== 'boolean') {
//       return NextResponse.json(
//         { error: 'isActive field is required and must be boolean' },
//         { status: 400 }
//       );
//     }

//     const agent = await Agent.findByIdAndUpdate(
//       id,
//       { isActive },
//       { new: true, runValidators: true }
//     ).populate('shift').select('-password');

//     if (!agent) {
//       return NextResponse.json(
//         { error: 'Agent not found' },
//         { status: 404 }
//       );
//     }

//     // Send status update email
//     try {
//       const status = isActive ? 'activated' : 'deactivated';
//       const emailTemplate = emailTemplates.accountStatus(
//         agent.agentName,
//         agent.agentId,
//         status
//       );
//       await sendEmail({
//         to: agent.email,
//         subject: emailTemplate.subject,
//         html: emailTemplate.html,
//         text: emailTemplate.text
//       });
//     } catch (emailError) {
//       console.error('Failed to send status update email:', emailError);
//     }

//     return NextResponse.json({
//       message: `Agent ${isActive ? 'activated' : 'deactivated'} successfully`,
//       agent
//     });
//   } catch (error) {
//     console.error('Agent status update error:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }




import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Agent from '@/Models/Agent';
import Shift from '@/Models/Shift';
import bcrypt from 'bcryptjs';

// GET single agent
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    
    const agent = await Agent.findById(id)
      .populate('shift')
      .select('-password');
    
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      agent
    });
    
  } catch (error) {
    console.error('Get single agent error:', error);
    return NextResponse.json(
      { success: false, error: 'Error fetching agent' },
      { status: 500 }
    );
  }
}

// PUT - Update agent
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const body = await request.json();
    const { 
      agentName, 
      agentId, 
      shift, 
      email, 
      phone,
      monthlyTargetType,
      monthlyDigitTarget,
      monthlyAmountTarget,
      targetCurrency,
      employeeType,
      designation,
      isActive 
    } = body;
    
    // Find agent
    const agent = await Agent.findById(id);
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }
    
    // Validate Agent ID format if provided
    if (agentId) {
      const agentIdRegex = /^[A-Za-z]{2}\d{4}$/;
      if (!agentIdRegex.test(agentId)) {
        return NextResponse.json(
          { success: false, error: 'Agent ID must be in format: 2 letters followed by 4 digits (e.g., AB1234)' },
          { status: 400 }
        );
      }
      
      // Check if new agentId already exists
      const existingAgentId = await Agent.findOne({ 
        agentId: agentId.toUpperCase(), 
        _id: { $ne: id } 
      });
      if (existingAgentId) {
        return NextResponse.json(
          { success: false, error: 'Agent ID already exists' },
          { status: 400 }
        );
      }
    }
    
    // Check if email already exists
    if (email && email !== agent.email) {
      const existingEmail = await Agent.findOne({ 
        email: email.toLowerCase(), 
        _id: { $ne: id } 
      });
      if (existingEmail) {
        return NextResponse.json(
          { success: false, error: 'Email already exists' },
          { status: 400 }
        );
      }
    }
    
    // Check shift if provided
    if (shift && shift !== agent.shift?.toString()) {
      const shiftExists = await Shift.findById(shift);
      if (!shiftExists) {
        return NextResponse.json(
          { success: false, error: 'Invalid shift' },
          { status: 400 }
        );
      }
    }
    
    // Prepare update data
    const updateData = {};
    
    if (agentName) updateData.agentName = agentName.trim();
    if (agentId) updateData.agentId = agentId.toUpperCase();
    if (shift) updateData.shift = shift;
    if (email) updateData.email = email.toLowerCase().trim();
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : '';
    if (monthlyTargetType !== undefined) updateData.monthlyTargetType = monthlyTargetType;
    if (monthlyDigitTarget !== undefined) updateData.monthlyDigitTarget = parseInt(monthlyDigitTarget) || 0;
    if (monthlyAmountTarget !== undefined) updateData.monthlyAmountTarget = parseFloat(monthlyAmountTarget) || 0;
    if (targetCurrency) updateData.targetCurrency = targetCurrency;
    if (employeeType) updateData.employeeType = employeeType;
    if (designation) updateData.designation = designation;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    // Update agent
    const updatedAgent = await Agent.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('shift').select('-password');
    
    return NextResponse.json({
      success: true,
      message: 'Agent updated successfully',
      agent: updatedAgent
    });
    
  } catch (error) {
    console.error('Update agent error:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: 'Validation error: ' + error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete agent
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    const agent = await Agent.findByIdAndDelete(id);
    
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Agent deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete agent error:', error);
    return NextResponse.json(
      { success: false, error: 'Error deleting agent' },
      { status: 500 }
    );
  }
}

// PATCH - Reset password
export async function PATCH(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const body = await request.json();
    const { newPassword } = body;
    
    if (!newPassword) {
      return NextResponse.json(
        { success: false, error: 'New password is required' },
        { status: 400 }
      );
    }
    
    const agent = await Agent.findById(id);
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password
    agent.password = hashedPassword;
    await agent.save();
    
    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: 'Error resetting password' },
      { status: 500 }
    );
  }
}