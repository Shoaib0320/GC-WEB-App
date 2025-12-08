import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Team from '@/Models/Team';

// PATCH - Toggle team member status (Active/Inactive)
export async function PATCH(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const { isActive, updatedBy } = await request.json();

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          error: 'isActive must be a boolean',
        },
        { status: 400 }
      );
    }

    const team = await Team.findById(id);
    if (!team) {
      return NextResponse.json(
        {
          success: false,
          error: 'Team member not found',
        },
        { status: 404 }
      );
    }

    team.isActive = isActive;
    if (updatedBy) team.updatedBy = updatedBy;

    await team.save();
    await team.populate('createdBy', 'firstName lastName email');
    await team.populate('updatedBy', 'firstName lastName email');

    return NextResponse.json(
      {
        success: true,
        message: `Team member ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: team,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Toggle team status error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update team member status',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
