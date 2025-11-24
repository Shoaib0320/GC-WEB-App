import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Role from '@/Models/Role';
import User from '@/Models/User';
import { verifyToken } from '@/lib/jwt';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const role = await Role.findById(id);
    if (!role) return NextResponse.json({ success: false, error: 'Role not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: role });
  } catch (error) {
    console.error('GET Role Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch role', details: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });

    const currentUser = await User.findById(decoded.userId).populate('role');
    // permission: role.manage_roles OR user.edit
    const canManageRoles = currentUser?.role?.permissions?.role?.manage_roles || currentUser?.role?.permissions?.user?.edit;
    if (!canManageRoles) return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });

    const { id } = await params;
    const body = await request.json();

    // Load existing role so we can merge permissions safely
    const existingRole = await Role.findById(id);
    if (!existingRole) return NextResponse.json({ success: false, error: 'Role not found' }, { status: 404 });

    // If permissions provided, merge deeply to ensure nested objects are preserved
    if (body.permissions && typeof body.permissions === 'object') {
      const mergePermissions = (base = {}, incoming = {}) => {
        const out = { ...base };
        for (const key of Object.keys(incoming)) {
          const incVal = incoming[key];
          const baseVal = base[key];
          if (incVal && typeof incVal === 'object' && !Array.isArray(incVal)) {
            out[key] = mergePermissions(baseVal || {}, incVal);
          } else {
            // primitive boolean or value
            out[key] = incVal;
          }
        }
        return out;
      };

      existingRole.permissions = mergePermissions(existingRole.permissions?.toObject?.() || existingRole.permissions || {}, body.permissions);
    }

    // Apply other updatable fields
    if (body.name !== undefined) existingRole.name = body.name;
    if (body.description !== undefined) existingRole.description = body.description;
    if (body.isActive !== undefined) existingRole.isActive = body.isActive;

    // Save with validation
    await existingRole.save();

    return NextResponse.json({ success: true, data: existingRole, message: 'Role updated successfully' });
  } catch (error) {
    console.error('PUT Role Error:', error);
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Role with this name already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to update role', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });

    const currentUser = await User.findById(decoded.userId).populate('role');
    const canManageRoles = currentUser?.role?.permissions?.role?.manage_roles || currentUser?.role?.permissions?.user?.edit;
    if (!canManageRoles) return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });

  const { id } = await params;
    // prevent deleting role if assigned to users
    const usersWithRole = await User.countDocuments({ role: id });
    if (usersWithRole > 0) {
      return NextResponse.json({ success: false, error: 'Cannot delete role assigned to users' }, { status: 400 });
    }

    const role = await Role.findByIdAndDelete(id);
    if (!role) return NextResponse.json({ success: false, error: 'Role not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Role deleted successfully' });
  } catch (error) {
    console.error('DELETE Role Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete role', details: error.message }, { status: 500 });
  }
}
