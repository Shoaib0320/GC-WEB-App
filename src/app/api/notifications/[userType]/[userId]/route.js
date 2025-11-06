// app/api/notifications/[userType]/[userId]/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserNotification from '@/Models/UserNotification';

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { userId, userType } = params;
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    // Validate userType
    if (!['user', 'agent'].includes(userType)) {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid user type' 
      }, { status: 400 });
    }

    let query = { 
      userId,
      userType 
    };

    if (unreadOnly) {
      query.isRead = false;
    }

    const userNotifications = await UserNotification.find(query)
      .populate('notification')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await UserNotification.countDocuments(query);
    const unreadCount = await UserNotification.countDocuments({ 
      ...query, 
      isRead: false 
    });

    return NextResponse.json({
      success: true,
      notifications: userNotifications,
      unreadCount,
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