// app/api/notifications/user/read/[userNotificationId]/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserNotification from '@/Models/UserNotification';
import { getServerSession } from 'next-auth';

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userNotificationId } = params;

    const userNotification = await UserNotification.findByIdAndUpdate(
      userNotificationId,
      {
        isRead: true,
        readAt: new Date()
      },
      { new: true }
    );

    if (!userNotification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    // Update read count in main notification
    await Notification.findByIdAndUpdate(
      userNotification.notification,
      { $inc: { readCount: 1 } }
    );

    return NextResponse.json({ message: 'Notification marked as read' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}