// // // app/api/agents/profile/route.js
// // import { NextResponse } from 'next/server';
// // import connectDB from '@/lib/mongodb';
// // import Agent from '@/Models/Agent';
// // import { verifyToken } from '@/lib/jwt';
// // import Shift from '@/Models/Shift';
// // // import { Month } from 'react-day-picker';

// // export async function GET(request) {
// //   try {
// //     await connectDB();

// //     const authHeader = request.headers.get('authorization');
// //     if (!authHeader || !authHeader.startsWith('Bearer ')) {
// //       return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
// //     }

// //     const token = authHeader.replace('Bearer ', '');
// //     const decoded = verifyToken(token);

// //     if (!decoded || decoded.type !== 'agent') {
// //       return NextResponse.json({ error: "Invalid token" }, { status: 401 });
// //     }

// //     const agent = await Agent.findById(decoded.id).populate('shift');

// //     if (!agent) {
// //       return NextResponse.json({ error: "Agent not found" }, { status: 404 });
// //     }

// //     const agentData = {
// //       id: agent._id,
// //       agentName: agent.agentName,
// //       agentId: agent.agentId,
// //       email: agent.email,
// //       phone: agent.phone,
// //       monthlyTarget: agent.monthlyTarget,
// //       isActive: agent.isActive,
// //       shift: agent.shift
// //     };

// //     return NextResponse.json({
// //       success: true,
// //       agent: agentData
// //     });

// //   } catch (error) {
// //     console.error("Profile error:", error);
// //     return NextResponse.json({ error: error.message }, { status: 500 });
// //   }
// // }

// // export async function PUT(request) {
// //   try {
// //     await connectDB();

// //     const authHeader = request.headers.get('authorization');
// //     if (!authHeader || !authHeader.startsWith('Bearer ')) {
// //       return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
// //     }

// //     const token = authHeader.replace('Bearer ', '');
// //     const decoded = verifyToken(token);

// //     if (!decoded || decoded.type !== 'agent') {
// //       return NextResponse.json({ error: "Invalid token" }, { status: 401 });
// //     }

// //     const body = await request.json();
// //     const { agentName, email, phone } = body;

// //     // Validation
// //     if (!agentName || agentName.trim().length < 2) {
// //       return NextResponse.json({
// //         error: "Name is required and must be at least 2 characters"
// //       }, { status: 400 });
// //     }

// //     // Check if email already exists (if provided and different from current)
// //     if (email) {
// //       const existingAgent = await Agent.findOne({
// //         email: email.toLowerCase().trim(),
// //         _id: { $ne: decoded.id }
// //       });

// //       if (existingAgent) {
// //         return NextResponse.json({
// //           error: "Email already exists"
// //         }, { status: 400 });
// //       }
// //     }

// //     // Update agent profile
// //     const updateData = {
// //       agentName: agentName.trim(),
// //       ...(email && { email: email.toLowerCase().trim() }),
// //       ...(phone && { phone: phone.trim() })
// //     };

// //     const updatedAgent = await Agent.findByIdAndUpdate(
// //       decoded.id,
// //       updateData,
// //       { new: true, runValidators: true }
// //     ).populate('shift');

// //     if (!updatedAgent) {
// //       return NextResponse.json({ error: "Agent not found" }, { status: 404 });
// //     }

// //     const agentData = {
// //       id: updatedAgent._id,
// //       agentName: updatedAgent.agentName,
// //       agentId: updatedAgent.agentId,
// //       email: updatedAgent.email,
// //       phone: updatedAgent.phone,
// //       monthlyTarget: updatedAgent.monthlyTarget,
// //       isActive: updatedAgent.isActive,
// //       shift: updatedAgent.shift
// //     };

// //     return NextResponse.json({
// //       success: true,
// //       message: "Profile updated successfully",
// //       agent: agentData
// //     });

// //   } catch (error) {
// //     console.error("Profile update error:", error);

// //     if (error.name === 'ValidationError') {
// //       return NextResponse.json({
// //         error: "Validation failed: " + Object.values(error.errors).map(e => e.message).join(', ')
// //       }, { status: 400 });
// //     }

// //     return NextResponse.json({ error: error.message }, { status: 500 });
// //   }
// // }


// // app/api/agents/profile/route.js
// import { NextResponse } from 'next/server';
// import connectDB from '@/lib/mongodb';
// import Agent from '@/Models/Agent';
// import { verifyToken } from '@/lib/jwt';
// import Shift from '@/Models/Shift';

// function extractDecoded(payloadOrResult) {
//   // support both verifyToken(token) -> decoded
//   // and verifyToken(requestLike) -> { user: decoded } shapes
//   if (!payloadOrResult) return null;
//   if (payloadOrResult.user) return payloadOrResult.user;
//   return payloadOrResult;
// }

// export async function GET(request) {
//   try {
//     await connectDB();

//     const authHeader = request.headers.get('authorization');
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
//     }

//     const token = authHeader.replace('Bearer ', '');
//     const decodedRaw = verifyToken(token);
//     const decoded = extractDecoded(decodedRaw);

//     if (!decoded || decoded.type !== 'agent') {
//       return NextResponse.json({ error: "Invalid token" }, { status: 401 });
//     }

//     const agent = await Agent.findById(decoded.id).populate('shift');

//     if (!agent) {
//       return NextResponse.json({ error: "Agent not found" }, { status: 404 });
//     }

//     // IMPORTANT: block access if agent has been deactivated after token issuance
//     if (agent.isActive === false) {
//       return NextResponse.json({
//         error: "Account deactivated. Please contact admin."
//       }, { status: 401 });
//     }

//     const agentData = {
//       id: agent._id,
//       agentName: agent.agentName,
//       agentId: agent.agentId,
//       email: agent.email,
//       phone: agent.phone,
//       monthlyTarget: agent.monthlyTarget,
//       isActive: agent.isActive,
//       shift: agent.shift,
//       employeeType: agent.employeeType,
//       designation: agent.designation
//     };

//     return NextResponse.json({
//       success: true,
//       agent: agentData
//     });

//   } catch (error) {
//     console.error("Profile error:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// export async function PUT(request) {
//   try {
//     await connectDB();

//     const authHeader = request.headers.get('authorization');
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
//     }

//     const token = authHeader.replace('Bearer ', '');
//     const decodedRaw = verifyToken(token);
//     const decoded = extractDecoded(decodedRaw);

//     if (!decoded || decoded.type !== 'agent') {
//       return NextResponse.json({ error: "Invalid token" }, { status: 401 });
//     }

//     // fetch current agent to check state
//     const currentAgent = await Agent.findById(decoded.id);
//     if (!currentAgent) {
//       return NextResponse.json({ error: "Agent not found" }, { status: 404 });
//     }

//     if (currentAgent.isActive === false) {
//       return NextResponse.json({
//         error: "Account deactivated. Profile changes are not allowed. Please contact admin."
//       }, { status: 401 });
//     }

//     const body = await request.json();
//     const { agentName, email, phone, employeeType, designation } = body;

//     // Validation
//     if (!agentName || agentName.trim().length < 2) {
//       return NextResponse.json({
//         error: "Name is required and must be at least 2 characters"
//       }, { status: 400 });
//     }

//     // Check if email already exists (if provided and different from current)
//     if (email) {
//       const existingAgent = await Agent.findOne({
//         email: email.toLowerCase().trim(),
//         _id: { $ne: decoded.id }
//       });

//       if (existingAgent) {
//         return NextResponse.json({
//           error: "Email already exists"
//         }, { status: 400 });
//       }
//     }

//     // Update agent profile
//     const updateData = {
//       agentName: agentName.trim(),
//       ...(email && { email: email.toLowerCase().trim() }),
//       ...(phone && { phone: phone.trim() }),
//       ...(employeeType && { employeeType }),
//       ...(designation && { designation: designation.trim() })
//     };

//     const updatedAgent = await Agent.findByIdAndUpdate(
//       decoded.id,
//       updateData,
//       { new: true, runValidators: true }
//     ).populate('shift');

//     if (!updatedAgent) {
//       return NextResponse.json({ error: "Agent not found" }, { status: 404 });
//     }

//     const agentData = {
//       id: updatedAgent._id,
//       agentName: updatedAgent.agentName,
//       agentId: updatedAgent.agentId,
//       email: updatedAgent.email,
//       phone: updatedAgent.phone,
//       monthlyTarget: updatedAgent.monthlyTarget,
//       isActive: updatedAgent.isActive,
//       shift: updatedAgent.shift,
//       employeeType: updatedAgent.employeeType,
//       designation: updatedAgent.designation
//     };

//     return NextResponse.json({
//       success: true,
//       message: "Profile updated successfully",
//       agent: agentData
//     });

//   } catch (error) {
//     console.error("Profile update error:", error);

//     if (error.name === 'ValidationError') {
//       return NextResponse.json({
//         error: "Validation failed: " + Object.values(error.errors).map(e => e.message).join(', ')
//       }, { status: 400 });
//     }

//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }








import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Agent from '@/Models/Agent';
import { verifyToken } from '@/lib/jwt';
import Shift from '@/Models/Shift';

// Helper function to extract decoded token
function extractDecoded(payloadOrResult) {
  if (!payloadOrResult) return null;
  if (payloadOrResult.user) return payloadOrResult.user;
  return payloadOrResult;
}

// GET - Get agent profile
export async function GET(request) {
  try {
    await connectDB();

    // Extract token from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' }, 
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const decodedRaw = verifyToken(token);
    const decoded = extractDecoded(decodedRaw);

    if (!decoded || decoded.type !== 'agent') {
      return NextResponse.json(
        { success: false, error: 'Invalid token' }, 
        { status: 401 }
      );
    }

    // Get agent with populated shift
    const agent = await Agent.findById(decoded.id).populate('shift');

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' }, 
        { status: 404 }
      );
    }

    // Check if agent is active
    if (agent.isActive === false) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Your account has been deactivated. Please contact administrator.',
          accountStatus: 'deactivated'
        }, 
        { status: 403 }
      );
    }

    // Prepare response data
    const agentData = {
      id: agent._id,
      agentName: agent.agentName,
      agentId: agent.agentId,
      email: agent.email,
      phone: agent.phone || '',
      monthlyTargetType: agent.monthlyTargetType || 'none',
      monthlyDigitTarget: agent.monthlyDigitTarget || 0,
      monthlyAmountTarget: agent.monthlyAmountTarget || 0,
      targetCurrency: agent.targetCurrency || 'PKR',
      employeeType: agent.employeeType || 'Permanent',
      designation: agent.designation || 'Sales Agent',
      isActive: agent.isActive,
      shift: agent.shift,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt
    };

    return NextResponse.json({
      success: true,
      agent: agentData
    });

  } catch (error) {
    console.error('Profile error:', error);
    
    // Handle JWT errors
    if (error.name === 'TokenExpiredError' || error.message.includes('jwt expired')) {
      return NextResponse.json(
        { success: false, error: 'Session expired. Please login again.' },
        { status: 401 }
      );
    }
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, error: 'Invalid session. Please login again.' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update agent profile
export async function PUT(request) {
  try {
    await connectDB();

    // Extract token from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' }, 
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const decodedRaw = verifyToken(token);
    const decoded = extractDecoded(decodedRaw);

    if (!decoded || decoded.type !== 'agent') {
      return NextResponse.json(
        { success: false, error: 'Invalid token' }, 
        { status: 401 }
      );
    }

    // Get current agent to check status
    const currentAgent = await Agent.findById(decoded.id);
    if (!currentAgent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' }, 
        { status: 404 }
      );
    }

    // Check if agent is active
    if (currentAgent.isActive === false) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Your account has been deactivated. Profile changes are not allowed.' 
        }, 
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { agentName, email, phone, employeeType, designation } = body;

    // Validation
    if (!agentName || agentName.trim().length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name is required and must be at least 2 characters'
        }, 
        { status: 400 }
      );
    }

    // Check if email already exists (if provided and different from current)
    if (email && email !== currentAgent.email) {
      const existingAgent = await Agent.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: decoded.id }
      });

      if (existingAgent) {
        return NextResponse.json(
          { success: false, error: 'Email already exists' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData = {
      agentName: agentName.trim(),
      ...(email && { email: email.toLowerCase().trim() }),
      ...(phone !== undefined && { phone: phone ? phone.trim() : '' }),
      ...(employeeType && { employeeType }),
      ...(designation && { designation: designation.trim() })
    };

    // Update agent profile
    const updatedAgent = await Agent.findByIdAndUpdate(
      decoded.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('shift');

    if (!updatedAgent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' }, 
        { status: 404 }
      );
    }

    // Prepare response data
    const agentData = {
      id: updatedAgent._id,
      agentName: updatedAgent.agentName,
      agentId: updatedAgent.agentId,
      email: updatedAgent.email,
      phone: updatedAgent.phone || '',
      monthlyTargetType: updatedAgent.monthlyTargetType || 'none',
      monthlyDigitTarget: updatedAgent.monthlyDigitTarget || 0,
      monthlyAmountTarget: updatedAgent.monthlyAmountTarget || 0,
      targetCurrency: updatedAgent.targetCurrency || 'PKR',
      employeeType: updatedAgent.employeeType || 'Permanent',
      designation: updatedAgent.designation || 'Sales Agent',
      isActive: updatedAgent.isActive,
      shift: updatedAgent.shift,
      updatedAt: updatedAgent.updatedAt
    };

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      agent: agentData
    });

  } catch (error) {
    console.error('Profile update error:', error);

    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation failed: ' + Object.values(error.errors).map(e => e.message).join(', ')
        }, 
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}