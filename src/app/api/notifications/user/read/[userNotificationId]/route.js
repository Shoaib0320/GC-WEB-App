// app/api/notifications/user/read/[userNotificationId]/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserNotification from '@/Models/UserNotification';
import Notification from '@/Models/Notification';
import { verifyAuth } from '@/lib/auth';

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    
    // Verify authentication using JWT
    const auth = await verifyAuth(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { userNotificationId } = params;

    const userNotification = await UserNotification.findOneAndUpdate(
      { 
        _id: userNotificationId,
        user: auth.userId // Ensure the notification belongs to the authenticated user
      },
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

    return NextResponse.json({ 
      message: 'Notification marked as read',
      notification: userNotification 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}