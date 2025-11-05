import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Role from '@/Models/Role';
import User from '@/Models/User';
import { generateToken, getCookieOptions } from '../../../../lib/jwt';

export async function POST(request) {
  try {
    await connectDB();

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({}).populate('role');
    if (existingSuperAdmin && existingSuperAdmin.role.name === 'super_admin') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Super Admin already exists. Please login instead.' 
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, email, password } = body;

    // Create or get super admin role
    let superAdminRole = await Role.findOne({ name: 'super_admin' });
    
    if (!superAdminRole) {
      superAdminRole = await Role.create({
        name: 'super_admin',
        description: 'Full system access with all permissions',
        permissions: {
          user: { view: true, create: true, edit: true, delete: true, change_role: true },
          category: { view: true, create: true, edit: true, delete: true },
          product: { view: true, create: true, edit: true, delete: true },
          order: { view: true, create: true, edit: true, delete: true, update_status: true },
          inventory: { view: true, create: true, edit: true, delete: true },
          analytics: { view: true, export: true },
          settings: { view: true, edit: true }
        }
      });
    }

    // Create super admin user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: superAdminRole._id,
      isEmailVerified: true,
      createdBy: null // Self-created
    });

    // Generate token
    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role.name
    });

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: superAdminRole.name,
          fullName: user.fullName
        },
        token
      },
      message: 'Super Admin created successfully'
    });

    // Set token in cookie
    response.cookies.set('token', token, getCookieOptions());

    return response;
  } catch (error) {
    console.error('Super Admin Signup Error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User with this email already exists' 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create Super Admin',
        details: error.message 
      },
      { status: 500 }
    );
  }
}