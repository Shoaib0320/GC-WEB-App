// app/api/notifications/user/[userId]/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserNotification from '@/Models/UserNotification';
import { getServerSession } from 'next-auth';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    let query = { user: userId };

    if (unreadOnly) {
      query.isRead = false;
    }

    const userNotifications = await UserNotification.find(query)
      .populate({
        path: 'notification',
        match: { 
          status: 'active',
          $or: [
            { expiresAt: { $gte: new Date() } },
            { expiresAt: null }
          ]
        }
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Filter out null notifications
    const validNotifications = userNotifications.filter(un => un.notification);

    const total = await UserNotification.countDocuments(query);
    const unreadCount = await UserNotification.countDocuments({ 
      ...query, 
      isRead: false 
    });

    return NextResponse.json({
      notifications: validNotifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}