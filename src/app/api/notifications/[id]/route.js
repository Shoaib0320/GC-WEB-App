import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Notification from '@/Models/Notification';
import UserNotification from '@/Models/UserNotification';
import { getServerSession } from 'next-auth';

// GET single notification
export async function GET(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notification = await Notification.findById(params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('specificUsers', 'firstName lastName email')
      .populate('specificAgents', 'agentName email')
      .populate('roles', 'name');

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json(notification);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// UPDATE notification
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const notification = await Notification.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json(notification);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE notification
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete notification and associated user notifications
    await Promise.all([
      Notification.findByIdAndDelete(params.id),
      UserNotification.deleteMany({ notification: params.id })
    ]);

    return NextResponse.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}