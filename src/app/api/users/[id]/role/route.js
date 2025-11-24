import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/Models/User';
import Role from '@/Models/Role';
import { verifyToken } from '@/lib/jwt';
import mongoose from 'mongoose';

export async function PATCH(request, { params }) {
  try {
    await connectDB();

    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });

    const currentUser = await User.findById(decoded.userId).populate('role');
    const canChangeRole = currentUser?.role?.permissions?.user?.change_role || currentUser?.role?.permissions?.role?.manage_roles || currentUser?.role?.permissions?.user?.edit;
    if (!canChangeRole) return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });

  const { id } = await params;
    const body = await request.json();
    const { roleId } = body;
    if (!roleId) return NextResponse.json({ success: false, error: 'roleId is required' }, { status: 400 });

    // allow passing role name or id
    let resolvedRoleId = roleId;
    if (!mongoose.Types.ObjectId.isValid(roleId)) {
      const roleDoc = await Role.findOne({ name: roleId });
      if (!roleDoc) return NextResponse.json({ success: false, error: 'Role not found' }, { status: 404 });
      resolvedRoleId = roleDoc._id;
    }

    const user = await User.findByIdAndUpdate(id, { role: resolvedRoleId, updatedBy: currentUser._id }, { new: true }).populate('role').select('-password');
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: user, message: 'User role updated' });
  } catch (error) {
    console.error('PATCH user role error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update role', details: error.message }, { status: 500 });
  }
}
