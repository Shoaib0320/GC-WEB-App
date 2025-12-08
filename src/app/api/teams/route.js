import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Team from '@/Models/Team';

// GET - Fetch all teams
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // Build filter
    let filter = {};
    if (isActive !== null) {
      filter.isActive = isActive === 'true';
    }

    // Fetch teams
    const teams = await Team.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await Team.countDocuments(filter);

    return NextResponse.json(
      {
        success: true,
        data: teams,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get teams error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch teams',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Create new team member
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, position, github, linkedin, profileImage, backgroundColour, createdBy } = body;

    // Validation
    if (!name || !email || !position || !profileImage || !createdBy) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          required: ['name', 'email', 'position', 'profileImage', 'createdBy'],
        },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingTeam = await Team.findOne({ email: email.toLowerCase() });
    if (existingTeam) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email already exists',
        },
        { status: 400 }
      );
    }

    // Create new team member
    const newTeam = new Team({
      name,
      email: email.toLowerCase(),
      position,
      github: github || '',
      linkedin: linkedin || '',
      profileImage,
      backgroundColour: backgroundColour || '#3B82F6',
      createdBy,
      isActive: true,
    });

    await newTeam.save();
    await newTeam.populate('createdBy', 'firstName lastName email');

    return NextResponse.json(
      {
        success: true,
        message: 'Team member created successfully',
        data: newTeam,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create team error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create team member',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
