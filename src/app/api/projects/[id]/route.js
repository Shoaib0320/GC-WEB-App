import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/Models/Project';
import { cloudinaryService } from '@/lib/cloudinary';

// GET - Fetch single project
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    // Try to find by ID first, then by slug
    let project = await Project.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');

    if (!project) {
      project = await Project.findOne({ slug: id })
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email');
    }

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: project,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get project error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch project',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT - Update project
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    // Find project
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

    // Handle old images deletion if new images provided
    if (body.images && Array.isArray(body.images)) {
      // Find images to delete (old ones not in new array)
      const newImageUrls = body.images.map(img => img.url);
      const imagesToDelete = project.images.filter(
        img => !newImageUrls.includes(img.url) && img.publicId
      );

      // Delete old images from Cloudinary
      for (const img of imagesToDelete) {
        try {
          await cloudinaryService.deleteImage(img.publicId);
        } catch (err) {
          console.error('Error deleting image:', err);
        }
      }
    }

    // Handle thumbnail change
    if (body.thumbnail && body.thumbnail.url !== project.thumbnail.url && project.thumbnail.publicId) {
      try {
        await cloudinaryService.deleteImage(project.thumbnail.publicId);
      } catch (err) {
        console.error('Error deleting old thumbnail:', err);
      }
    }

    // Update fields
    const updateFields = [
      'title', 'shortDescription', 'fullDescription', 'category', 'projectType',
      'technologies', 'frameworks', 'databases', 'tools', 'thumbnail', 'images',
      'liveUrl', 'githubUrl', 'demoVideoUrl', 'documentationUrl', 'client',
      'duration', 'completedAt', 'teamSize', 'features', 'displayOrder',
      'isFeatured', 'isActive', 'metaTitle', 'metaDescription', 'updatedBy'
    ];

    updateFields.forEach(field => {
      if (body[field] !== undefined) {
        project[field] = body[field];
      }
    });

    await project.save();
    await project.populate('createdBy', 'firstName lastName email');
    await project.populate('updatedBy', 'firstName lastName email');

    return NextResponse.json(
      {
        success: true,
        message: 'Project updated successfully',
        data: project,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update project error:', error);
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

// DELETE - Delete project
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

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

    // Delete thumbnail from Cloudinary
    if (project.thumbnail && project.thumbnail.publicId) {
      try {
        await cloudinaryService.deleteImage(project.thumbnail.publicId);
      } catch (err) {
        console.error('Error deleting thumbnail:', err);
      }
    }

    // Delete all images from Cloudinary
    for (const img of project.images) {
      if (img.publicId) {
        try {
          await cloudinaryService.deleteImage(img.publicId);
        } catch (err) {
          console.error('Error deleting image:', err);
        }
      }
    }

    // Delete from database
    await Project.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: 'Project deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete project',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
