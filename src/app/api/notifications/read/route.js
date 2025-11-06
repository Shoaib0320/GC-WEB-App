// app/api/notifications/read/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserNotification from '@/Models/UserNotification';
import Notification from '@/Models/Notification';

export async function PATCH(request) {
  try {
    await connectDB();

    const { userNotificationId, userId, userType } = await request.json();

    if (!userNotificationId || !userId || !userType) {
      return NextResponse.json({ 
        success: false,
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    const userNotification = await UserNotification.findOneAndUpdate(
      { 
        _id: userNotificationId,
        userId,
        userType
      },
      {
        isRead: true,
        readAt: new Date()
      },
      { new: true }
    );

    if (!userNotification) {
      return NextResponse.json({ 
        success: false,
        error: 'Notification not found' 
      }, { status: 404 });
    }

    // Update read count in main notification
    await Notification.findByIdAndUpdate(
      userNotification.notification,
      { $inc: { readCount: 1 } }
    );

    return NextResponse.json({ 
      success: true,
      message: 'Notification marked as read',
      notification: userNotification 
    });
  } catch (error) {
return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}