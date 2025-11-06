import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import UserNotification from '@/Models/UserNotification';
import { getServerSession } from 'next-auth';

// GET my notifications
export async function GET(request) {
  try {
    await connectDB();
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    let query = {
      $or: [
        { user: session.user.id },
        { agent: session.user.id }
      ],
      dismissed: false
    };

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