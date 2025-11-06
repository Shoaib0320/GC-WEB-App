// app/api/notifications/route.js
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
    
    console.log('🔐 Checking authentication for notification creation...');
    
    // Verify authentication using JWT
    const auth = await verifyAuth(request);
    console.log('🔑 Auth result:', auth);
    
    if (auth.error) {
      console.log('❌ Authentication failed:', auth.error);
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    console.log('✅ Authentication successful, user:', auth.userId);
    
    const body = await request.json();
    console.log('📦 Request body received:', body);
    
    // Create notification
    const notification = await Notification.create({
      ...body,
      createdBy: auth.userId
    });

    console.log('✅ Notification created:', notification._id);

    // Send notification to recipients (async - don't wait for it)
    sendNotificationToRecipients(notification).catch(error => {
      console.error('❌ Error sending notifications to recipients:', error);
    });

    return NextResponse.json({
      success: true,
      message: 'Notification created successfully',
      notification
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    return NextResponse.json({ 
      error: error.message,
      details: 'Failed to create notification'
    }, { status: 500 });
  }
}

// Helper function to send notifications to recipients
async function sendNotificationToRecipients(notification) {
  try {
    console.log('📤 Sending notification to recipients...');
    
    let users = [];
    let agents = [];

    switch (notification.recipientType) {
      case 'all':
        console.log('👥 Sending to all users and agents');
        users = await User.find({ isActive: true }).select('_id');
        agents = await Agent.find({ isActive: true }).select('_id');
        break;
      
      case 'specific_users':
        console.log('👤 Sending to specific users:', notification.specificUsers);
        users = await User.find({ 
          _id: { $in: notification.specificUsers },
          isActive: true 
        }).select('_id');
        break;
      
      case 'specific_agents':
        console.log('🤖 Sending to specific agents:', notification.specificAgents);
        agents = await Agent.find({ 
          _id: { $in: notification.specificAgents },
          isActive: true 
        }).select('_id');
        break;
      
      case 'role_based':
        console.log('🎯 Sending to role-based users:', notification.roles);
        users = await User.find({ 
          role: { $in: notification.roles },
          isActive: true 
        }).select('_id');
        break;
    }

    console.log(`📊 Found ${users.length} users and ${agents.length} agents`);

    // Create UserNotification records
    const userNotifications = users.map(user => ({
      user: user._id,
      notification: notification._id
    }));

    const agentNotifications = agents.map(agent => ({
      agent: agent._id,
      notification: notification._id
    }));

    const allNotifications = [...userNotifications, ...agentNotifications];
    
    if (allNotifications.length > 0) {
      await UserNotification.insertMany(allNotifications);
      console.log(`✅ Created ${allNotifications.length} user/agent notification records`);
    } else {
      console.log('⚠️ No recipients found for notification');
    }

    // Update total recipients count
    await Notification.findByIdAndUpdate(notification._id, {
      totalRecipients: users.length + agents.length
    });

    console.log('✅ Notification distribution completed');
  } catch (error) {
    console.error('❌ Error in sendNotificationToRecipients:', error);
    throw error;
  }
}