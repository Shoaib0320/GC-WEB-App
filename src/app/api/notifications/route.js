// app/api/notifications/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/Models/Notification';
import UserNotification from '@/Models/UserNotification';

// GET all notifications (no auth required)
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    let query = {};
    if (status && status !== 'all') query.status = status;
    if (type) query.type = type;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Notification.countDocuments(query);

    return NextResponse.json({
      success: true,
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}

// CREATE new notification (no auth required)
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    
    // Create notification
    const notification = await Notification.create(body);

    // Send notification to recipients
    await sendNotificationToRecipients(notification);

    return NextResponse.json({
      success: true,
      message: 'Notification created successfully',
      notification
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}

// Helper function to send notifications to recipients
async function sendNotificationToRecipients(notification) {
  try {
    let userIds = [];

    switch (notification.recipientType) {
      case 'all':
        // For all - you can add logic to get all user IDs if needed
        // For now, we'll handle it differently in the get methods
        break;
      
      case 'specific_users':
        userIds = notification.specificUsers.map(userId => ({
          userId,
          userType: 'user'
        }));
        break;
      
      case 'specific_agents':
        userIds = notification.specificAgents.map(agentId => ({
          userId: agentId,
          userType: 'agent'
        }));
        break;
    }

    // Create UserNotification records
    const userNotifications = userIds.map(({ userId, userType }) => ({
      userId,
      userType,
      notification: notification._id
    }));

    if (userNotifications.length > 0) {
      await UserNotification.insertMany(userNotifications);
    }

    // Update total recipients count
    await Notification.findByIdAndUpdate(notification._id, {
      totalRecipients: userIds.length
    });

  } catch (error) {
    console.error('Error sending notifications:', error);
  }
}