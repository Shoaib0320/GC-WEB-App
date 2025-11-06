import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserNotification from '@/Models/UserNotification';
import { verifyAuth } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    // Verify authentication using JWT
    const auth = await verifyAuth(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { agentId } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    let query = { agent: agentId };

    if (unreadOnly) {
      query.isRead = false;
    }

    const agentNotifications = await UserNotification.find(query)
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
    const validNotifications = agentNotifications.filter(an => an.notification);

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