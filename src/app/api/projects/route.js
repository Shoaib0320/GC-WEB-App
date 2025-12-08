import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/Models/Project';

// GET - Fetch all projects
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const isFeatured = searchParams.get('isFeatured');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const skip = (page - 1) * limit;

    // Build filter
    let filter = {};
    if (isActive !== null && isActive !== undefined && isActive !== '') {
      filter.isActive = isActive === 'true';
    }
    if (isFeatured === 'true') {
      filter.isFeatured = true;
    }
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Fetch projects
    const projects = await Project.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await Project.countDocuments(filter);

    return NextResponse.json(
      {
        success: true,
        data: projects,
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
    console.error('Get projects error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch projects',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Create new project
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      title,
      shortDescription,
      fullDescription,
      category,
      projectType,
      technologies,
      frameworks,
      databases,
      tools,
      thumbnail,
      images,
      liveUrl,
      githubUrl,
      demoVideoUrl,
      documentationUrl,
      client,
      duration,
      completedAt,
      teamSize,
      features,
      displayOrder,
      isFeatured,
      metaTitle,
      metaDescription,
      createdBy,
    } = body;

    // Validation
    if (!title || !shortDescription || !thumbnail || !createdBy) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          required: ['title', 'shortDescription', 'thumbnail', 'createdBy'],
        },
        { status: 400 }
      );
    }

    // Create new project
    const newProject = new Project({
      title,
      shortDescription,
      fullDescription: fullDescription || '',
      category: category || 'Web Application',
      projectType: projectType || 'Client Project',
      technologies: technologies || [],
      frameworks: frameworks || [],
      databases: databases || [],
      tools: tools || [],
      thumbnail,
      images: images || [],
      liveUrl: liveUrl || '',
      githubUrl: githubUrl || '',
      demoVideoUrl: demoVideoUrl || '',
      documentationUrl: documentationUrl || '',
      client: client || { name: '', country: '' },
      duration: duration || '',
      completedAt: completedAt || null,
      teamSize: teamSize || 1,
      features: features || [],
      displayOrder: displayOrder || 0,
      isFeatured: isFeatured || false,
      metaTitle: metaTitle || '',
      metaDescription: metaDescription || '',
      createdBy,
      isActive: true,
    });

    await newProject.save();
    await newProject.populate('createdBy', 'firstName lastName email');

    return NextResponse.json(
      {
        success: true,
        message: 'Project created successfully',
        data: newProject,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create project',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
