// import { NextResponse } from 'next/server';
// import bcrypt from 'bcryptjs';
// import Shift from '@/Models/Shift';
// import { sendEmail, emailTemplates } from '@/lib/email';
// import connectDB from '@/lib/mongodb';
// import Agent from '@/Models/Agent';

// // GET - Get all agents
// export async function GET(request) {
//   try {
//     await connectDB();

//     const { searchParams } = new URL(request.url);
//     const page = parseInt(searchParams.get('page')) || 1;
//     const limit = parseInt(searchParams.get('limit')) || 100;
//     const search = searchParams.get('search') || '';

//     const skip = (page - 1) * limit;

//     // Build search query
//     let searchQuery = {};
//     if (search) {
//       searchQuery = {
//         $or: [
//           { agentName: { $regex: search, $options: 'i' } },
//           { agentId: { $regex: search, $options: 'i' } },
//           { email: { $regex: search, $options: 'i' } }
//         ]
//       };
//     }

//     const agents = await Agent.find(searchQuery)
//       .populate('shift')
//       .select('-password')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     const total = await Agent.countDocuments(searchQuery);
//     const totalPages = Math.ceil(total / limit);

//     return NextResponse.json({
//       agents,
//       pagination: {
//         currentPage: page,
//         totalPages,
//         totalAgents: total,
//         hasNext: page < totalPages,
//         hasPrev: page > 1
//       }
//     });
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Error fetching agents' },
//       { status: 500 }
//     );
//   }
// }

// // POST - Create new agent
// export async function POST(request) {
//   try {
//     await connectDB();

//     const { agentName, agentId, shift, email, password, monthlyTarget } = await request.json();

//     // Validation
//     if (!agentName || !agentId || !shift || !email || !password) {
//       return NextResponse.json(
//         { error: 'All fields are required' },
//         { status: 400 }
//       );
//     }

//     // Check if agent already exists
//     const existingAgent = await Agent.findOne({
//       $or: [{ agentId }, { email }]
//     });

//     if (existingAgent) {
//       return NextResponse.json(
//         { error: 'Agent ID or Email already exists' },
//         { status: 400 }
//       );
//     }

//     // Check if shift exists
//     const shiftExists = await Shift.findById(shift);
//     if (!shiftExists) {
//       return NextResponse.json(
//         { error: 'Invalid shift' },
//         { status: 400 }
//       );
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 12);

//     // Create agent
//     const agent = await Agent.create({
//       agentName,
//       agentId,
//       shift,
//       email,
//       password: hashedPassword,
//       monthlyTarget: monthlyTarget || 0
//     });

//     // Send welcome email
//     try {
//       const emailTemplate = emailTemplates.agentWelcome(agentName, agentId, password);
//       await sendEmail({
//         to: email,
//         subject: emailTemplate.subject,
//         html: emailTemplate.html,
//         text: emailTemplate.text
//       });
//     } catch (emailError) {
//       console.error('Failed to send welcome email:', emailError);
//       // Continue even if email fails
//     }

//     const populatedAgent = await Agent.findById(agent._id)
//       .populate('shift')
//       .select('-password');

//     return NextResponse.json(
//       {
//         message: 'Agent created successfully',
//         agent: populatedAgent
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error('Agent creation error:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }









import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import Shift from '@/Models/Shift';
import { sendEmail, emailTemplates } from '@/lib/email';
import connectDB from '@/lib/mongodb';
import Agent from '@/Models/Agent';

// GET - Get all agents with pagination and search
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const shift = searchParams.get('shift');
    const employeeType = searchParams.get('employeeType');
    const targetType = searchParams.get('targetType');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = {};
    
    if (search) {
      searchQuery.$or = [
        { agentName: { $regex: search, $options: 'i' } },
        { agentId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by shift
    if (shift && shift !== 'all') {
      searchQuery.shift = shift;
    }

    // Filter by employee type
    if (employeeType && employeeType !== 'all') {
      searchQuery.employeeType = employeeType;
    }

    // Filter by target type
    if (targetType && targetType !== 'all') {
      searchQuery.monthlyTargetType = targetType;
    }

    // Filter by status
    if (status && status !== 'all') {
      if (status === 'active') {
        searchQuery.isActive = true;
      } else if (status === 'inactive') {
        searchQuery.isActive = false;
      }
    }

    // Get agents with pagination
    const [agents, total] = await Promise.all([
      Agent.find(searchQuery)
        .populate('shift')
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Agent.countDocuments(searchQuery)
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      agents,
      pagination: {
        currentPage: page,
        totalPages,
        total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('GET agents error:', error);
    return NextResponse.json(
      { success: false, error: 'Error fetching agents' },
      { status: 500 }
    );
  }
}

// POST - Create new agent
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { 
      agentName, 
      agentId, 
      shift, 
      email, 
      phone,
      password, 
      monthlyTargetType = 'none',
      monthlyDigitTarget = 0,
      monthlyAmountTarget = 0,
      targetCurrency = 'PKR',
      employeeType = 'Permanent',
      designation = 'Sales Agent' 
    } = body;

    // Validation
    const requiredFields = { agentName, agentId, shift, email, password };
    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value || value.trim() === '') {
        return NextResponse.json(
          { success: false, error: `${field.replace(/^\w/, c => c.toUpperCase())} is required` },
          { status: 400 }
        );
      }
    }

    // Validate Agent ID format (2 letters + 4 digits)
    const agentIdRegex = /^[A-Za-z]{2}\d{4}$/;
    if (!agentIdRegex.test(agentId)) {
      return NextResponse.json(
        { success: false, error: 'Agent ID must be in format: 2 letters followed by 4 digits (e.g., AB1234)' },
        { status: 400 }
      );
    }

    // Check if agent already exists
    const existingAgent = await Agent.findOne({
      $or: [{ agentId: agentId.toUpperCase() }, { email: email.toLowerCase() }]
    });

    if (existingAgent) {
      const conflict = existingAgent.agentId === agentId ? 'Agent ID' : 'Email';
      return NextResponse.json(
        { success: false, error: `${conflict} already exists` },
        { status: 400 }
      );
    }

    // Check if shift exists
    const shiftExists = await Shift.findById(shift);
    if (!shiftExists) {
      return NextResponse.json(
        { success: false, error: 'Invalid shift' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create agent
    const agent = await Agent.create({
      agentName: agentName.trim(),
      agentId: agentId.toUpperCase(),
      shift,
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : '',
      password: hashedPassword,
      monthlyTargetType,
      monthlyDigitTarget: monthlyDigitTarget ? parseInt(monthlyDigitTarget) : 0,
      monthlyAmountTarget: monthlyAmountTarget ? parseFloat(monthlyAmountTarget) : 0,
      targetCurrency,
      employeeType,
      designation
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
        success: true,
        message: 'Agent created successfully',
        agent: populatedAgent
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Agent creation error:', error);
    
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