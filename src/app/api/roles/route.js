import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Role from '@/Models/Role';

// GET all roles
export async function GET() {
  try {
    await connectDB();
    
    const roles = await Role.find({}).sort({ name: 1 });
    
    return NextResponse.json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error('GET Roles Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch roles',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    // Check if role already exists
    const existingRole = await Role.findOne({ name: body.name });
    if (existingRole) {
      return NextResponse.json(
        {
          success: false,
          error: 'Role with this name already exists'
        },
        { status: 400 }
      );
    }

    const role = await Role.create(body);

    return NextResponse.json({
      success: true,
      data: role,
      message: 'Role created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('POST Role Error:', error);

    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Role with this name already exists'
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create role',
        details: error.message
      },
      { status: 500 }
    );
  }
}
