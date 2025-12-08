import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Team from '@/Models/Team';
import { cloudinaryService } from '@/lib/cloudinary';

// GET - Fetch single team member
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const team = await Team.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');

    if (!team) {
      return NextResponse.json(
        {
          success: false,
          error: 'Team member not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: team,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get team error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch team member',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT - Update team member
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { name, email, position, github, linkedin, profileImage, backgroundColour, updatedBy, imagePublicId } = body;

    // Find team member
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

    // Check if email is being changed and if new email exists
    if (email && email.toLowerCase() !== team.email) {
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
    }

    // Delete old image if new image is provided
    if (profileImage && profileImage !== team.profileImage && team.imagePublicId) {
      try {
        await cloudinaryService.deleteImage(team.imagePublicId);
      } catch (err) {
        console.error('Error deleting old image:', err);
        // Continue even if deletion fails
      }
    }

    // Update fields
    if (name) team.name = name;
    if (email) team.email = email.toLowerCase();
    if (position) team.position = position;
    if (github !== undefined) team.github = github;
    if (linkedin !== undefined) team.linkedin = linkedin;
    if (profileImage) {
      team.profileImage = profileImage;
      team.imagePublicId = imagePublicId || '';
    }
    if (backgroundColour) team.backgroundColour = backgroundColour;
    if (updatedBy) team.updatedBy = updatedBy;

    await team.save();
    await team.populate('createdBy', 'firstName lastName email');
    await team.populate('updatedBy', 'firstName lastName email');

    return NextResponse.json(
      {
        success: true,
        message: 'Team member updated successfully',
        data: team,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update team error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update team member',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete team member
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

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

    // Delete image from Cloudinary
    if (team.imagePublicId) {
      try {
        await cloudinaryService.deleteImage(team.imagePublicId);
      } catch (err) {
        console.error('Error deleting image:', err);
        // Continue even if deletion fails
      }
    }

    // Delete from database
    await Team.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: 'Team member deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete team error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete team member',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
