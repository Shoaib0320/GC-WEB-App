// app/api/notifications/agent/read/[agentNotificationId]/route.js
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

    const { agentNotificationId } = params;

    const agentNotification = await UserNotification.findOneAndUpdate(
      { 
        _id: agentNotificationId,
        agent: auth.userId // Ensure the notification belongs to the authenticated agent
      },
      {
        isRead: true,
        readAt: new Date()
      },
      { new: true }
    );

    if (!agentNotification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    // Update read count in main notification
    await Notification.findByIdAndUpdate(
      agentNotification.notification,
      { $inc: { readCount: 1 } }
    );

    return NextResponse.json({ 
      message: 'Notification marked as read',
      notification: agentNotification 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}