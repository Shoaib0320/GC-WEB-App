import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserNotification from '@/Models/UserNotification';
import { verifyAuth } from '@/lib/auth';

// GET my notifications
export async function GET(request) {
  try {
    await connectDB();
    
    // Verify authentication using JWT
    const auth = await verifyAuth(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    // Build query based on user type
    let query = { dismissed: false };

    if (auth.userType === 'agent') {
      query.agent = auth.userId;
    } else {
      query.user = auth.userId;
    }

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

    // Filter out notifications where the main notification is null (deleted or inactive)
    const validNotifications = userNotifications.filter(un => un.notification);

    const total = await UserNotification.countDocuments(query);

    return NextResponse.json({
      notifications: validNotifications,
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