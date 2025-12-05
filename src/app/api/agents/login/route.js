// // app/api/agents/login/route.js
// import { NextResponse } from 'next/server';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import connectDB from '@/lib/mongodb';
// import Agent from '@/Models/Agent';
// import Shift from '@/Models/Shift';

// export async function POST(request) {
//   console.log('🚀 === LOGIN API STARTED ===');

//   try {
//     // Step 1: Check if request body is valid
//     console.log('📥 Step 1: Parsing request body...');
//     let body;
//     try {
//       body = await request.json();
//       console.log('✅ Request body parsed:', {
//         agentId: body.agentId,
//         hasPassword: !!body.password
//       });
//     } catch (parseError) {
//       console.log('❌ JSON Parse Error:', parseError);
//       return NextResponse.json(
//         { error: 'Invalid JSON in request body' },
//         { status: 400 }
//       );
//     }

//     const { agentId, password } = body;

//     // Step 2: Validate input
//     console.log('🔍 Step 2: Validating input...');
//     if (!agentId || !password) {
//       console.log('❌ Missing fields:', {
//         agentId: !!agentId,
//         password: !!password
//       });
//       return NextResponse.json(
//         { error: 'Agent ID and password are required' },
//         { status: 400 }
//       );
//     }

//     // Step 3: Connect to database
//     console.log('🗄️ Step 3: Connecting to database...');
//     try {
//       await connectDB();
//       console.log('✅ Database connected successfully');
//     } catch (dbError) {
//       console.log('❌ Database connection failed:', dbError.message);
//       return NextResponse.json(
//         { error: 'Database connection failed: ' + dbError.message },
//         { status: 500 }
//       );
//     }

//     // Step 4: Find agent
//     console.log('👤 Step 4: Searching for agent:', agentId);
//     let agent;
//     try {
//       agent = await Agent.findOne({ agentId }).populate('shift');
//       console.log('🔎 Agent search result:', agent ? 'FOUND' : 'NOT FOUND');

//       if (agent) {
//         console.log('📋 Agent details:', {
//           id: agent._id,
//           agentName: agent.agentName,
//           isActive: agent.isActive,
//           hasShift: !!agent.shift
//         });
//       }
//     } catch (findError) {
//       console.log('❌ Database query failed:', findError.message);
//       return NextResponse.json(
//         { error: 'Database query failed: ' + findError.message },
//         { status: 500 }
//       );
//     }

//     if (!agent) {
//       console.log('❌ Agent not found in database');
//       return NextResponse.json(
//         { error: 'Invalid credentials' },
//         { status: 401 }
//       );
//     }

//     // Step 5: Check if agent is active
//     if (agent.isActive === false) {
//       console.log('❌ Agent account is inactive');
//       return NextResponse.json(
//         {
//           error: 'Account is deactivated',
//           accountStatus: 'deactivated'  // ✅ Ye field add karo
//         },
//         { status: 401 }
//       );
//     }

//     // Step 6: Check password
//     console.log('🔑 Step 6: Verifying password...');
//     let isPasswordValid;
//     try {
//       console.log('🔐 Comparing passwords...');
//       console.log('📝 Input password length:', password.length);
//       console.log('🗃️ Stored password hash:', agent.password ? 'EXISTS' : 'MISSING');

//       isPasswordValid = await bcrypt.compare(password, agent.password);
//       console.log('✅ Password comparison result:', isPasswordValid);
//     } catch (bcryptError) {
//       console.log('❌ Password comparison failed:', bcryptError.message);
//       return NextResponse.json(
//         { error: 'Password verification failed' },
//         { status: 500 }
//       );
//     }

//     if (!isPasswordValid) {
//       console.log('❌ Invalid password provided');
//       return NextResponse.json(
//         { error: 'Invalid credentials' },
//         { status: 401 }
//       );
//     }

//     // Step 7: Check JWT secret
//     console.log('🎫 Step 7: Generating JWT token...');
//     if (!process.env.JWT_SECRET) {
//       console.log('❌ JWT_SECRET is missing');
//       return NextResponse.json(
//         { error: 'Server configuration error - JWT secret missing' },
//         { status: 500 }
//       );
//     }
//     console.log('✅ JWT_SECRET is available');

//     // Step 8: Generate token
//     let token;
//     try {
//       token = jwt.sign(
//         {
//           agentId: agent.agentId,
//           id: agent._id,
//           email: agent.email,
//           type: 'agent'   // ⭐⭐ MOST IMPORTANT ⭐⭐
//         },
//         process.env.JWT_SECRET,
//         { expiresIn: '7d' }
//       );
//       console.log('✅ JWT token generated successfully');
//     } catch (jwtError) {
//       console.log('❌ JWT generation failed:', jwtError.message);
//       return NextResponse.json(
//         { error: 'Token generation failed' },
//         { status: 500 }
//       );
//     }

//     // Step 9: Prepare response
//     console.log('📤 Step 9: Preparing response...');
//     const responseData = {
//       message: 'Login successful',
//       token,
//       agent: {
//         id: agent._id,
//         agentName: agent.agentName,
//         agentId: agent.agentId,
//         email: agent.email,
//         phone: agent.phone,
//         monthlyTarget: agent.monthlyTarget,
//         employeeType: agent.employeeType,
//         designation: agent.designation,
//         profileImage: agent.profileImage,
//         isActive: agent.isActive,
//         shift: agent.shift
//       }
//     };

//     console.log('🎉 === LOGIN SUCCESSFUL ===');
//     console.log('📦 Response data:', {
//       agentId: agent.agentId,
//       agentName: agent.agentName,
//       tokenLength: token.length
//     });

//     return NextResponse.json(responseData);

//   } catch (error) {
//     console.log('💥 === UNEXPECTED ERROR ===');
//     console.error('❌ Error name:', error.name);
//     console.error('❌ Error message:', error.message);
//     console.error('❌ Error stack:', error.stack);

//     // Check for specific common errors
//     if (error.name === 'MongoServerError') {
//       console.log('🔧 MongoDB Error detected');
//       return NextResponse.json(
//         { error: 'Database error occurred' },
//         { status: 500 }
//       );
//     }

//     if (error.name === 'TypeError') {
//       console.log('🔧 TypeError detected - likely missing import or variable');
//       return NextResponse.json(
//         { error: 'Server configuration error' },
//         { status: 500 }
//       );
//     }

//     return NextResponse.json(
//       { error: 'Internal server error: ' + error.message },
//       { status: 500 }
//     );
//   }
// }



import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Agent from '@/Models/Agent';
import Shift from '@/Models/Shift';

export async function POST(request) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { agentId, password } = body;

    // Validate input
    if (!agentId || !password) {
      return NextResponse.json(
        { success: false, error: 'Agent ID and password are required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find agent
    const agent = await Agent.findOne({ agentId: agentId.toUpperCase() }).populate('shift');

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Invalid Agent ID or Password' },
        { status: 401 }
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

    // Check password
    const isPasswordValid = await bcrypt.compare(password, agent.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid Agent ID or Password' },
        { status: 401 }
      );
    }

    // Check JWT secret
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is missing from environment variables');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Generate token with agent info
    const token = jwt.sign(
      {
        agentId: agent.agentId,
        id: agent._id,
        email: agent.email,
        type: 'agent',
        isActive: agent.isActive,
        employeeType: agent.employeeType,
        designation: agent.designation,
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Prepare response
    const responseData = {
      success: true,
      message: 'Login successful',
      token,
      agent: {
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
      }
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Login error:', error);
    
    // Specific error handling
    if (error.name === 'MongoServerError') {
      return NextResponse.json(
        { success: false, error: 'Database error occurred' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}