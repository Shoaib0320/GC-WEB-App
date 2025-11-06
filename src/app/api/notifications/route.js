import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/Models/Notification';
import UserNotification from '@/Models/UserNotification';
import User from '@/Models/User';
import Agent from '@/Models/Agent';
import { verifyAuth } from '@/lib/auth';

// GET all notifications (admin)
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
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    let query = {};
    if (status && status !== 'all') query.status = status;
    if (type) query.type = type;

    const notifications = await Notification.find(query)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Notification.countDocuments(query);

    return NextResponse.json({
      notifications,
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

// CREATE new notification
export async function POST(request) {
  try {
    await connectDB();
    
    // Verify authentication using JWT
    const auth = await verifyAuth(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    
    // Create notification
    const notification = await Notification.create({
      ...body,
      createdBy: auth.userId
    });

    // Send notification to recipients
    await sendNotificationToRecipients(notification);

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper function to send notifications to recipients
async function sendNotificationToRecipients(notification) {
  let users = [];
  let agents = [];

  switch (notification.recipientType) {
    case 'all':
      users = await User.find({ isActive: true }).select('_id');
      agents = await Agent.find({ isActive: true }).select('_id');
      break;
    
    case 'specific_users':
      users = await User.find({ 
        _id: { $in: notification.specificUsers },
        isActive: true 
      }).select('_id');
      break;
    
    case 'specific_agents':
      agents = await Agent.find({ 
        _id: { $in: notification.specificAgents },
        isActive: true 
      }).select('_id');
      break;
    
    case 'role_based':
      users = await User.find({ 
        role: { $in: notification.roles },
        isActive: true 
      }).select('_id');
      break;
  }

  // Create UserNotification records
  const userNotifications = users.map(user => ({
    user: user._id,
    notification: notification._id
  }));

  const agentNotifications = agents.map(agent => ({
    agent: agent._id,
    notification: notification._id
  }));

  if (userNotifications.length > 0 || agentNotifications.length > 0) {
    await UserNotification.insertMany([...userNotifications, ...agentNotifications]);
  }

  // Update total recipients count
  await Notification.findByIdAndUpdate(notification._id, {
    totalRecipients: users.length + agents.length
  });
}