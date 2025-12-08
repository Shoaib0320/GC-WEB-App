import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/Models/Project';

// PATCH - Toggle project status or featured
export async function PATCH(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { isActive, isFeatured, updatedBy } = body;

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found',
        },
        { status: 404 }
      );
    }

    // Update status if provided
    if (typeof isActive === 'boolean') {
      project.isActive = isActive;
    }

    // Update featured if provided
    if (typeof isFeatured === 'boolean') {
      project.isFeatured = isFeatured;
    }

    if (updatedBy) {
      project.updatedBy = updatedBy;
    }

    await project.save();
    await project.populate('createdBy', 'firstName lastName email');
    await project.populate('updatedBy', 'firstName lastName email');

    let message = 'Project updated successfully';
    if (typeof isActive === 'boolean') {
      message = `Project ${isActive ? 'activated' : 'deactivated'} successfully`;
    } else if (typeof isFeatured === 'boolean') {
      message = `Project ${isFeatured ? 'marked as featured' : 'removed from featured'} successfully`;
    }

    return NextResponse.json(
      {
        success: true,
        message,
        data: project,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Toggle project status error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update project',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
