import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Agent from '../../../../Models/Agent';
import connectDB from '@/lib/mongodb';

export async function GET(request) {
  try {
    await connectDB();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Yahan tum apna dashboard data bana sakte ho
    const dashboardData = {
      totalTasks: 15,
      completedTasks: 10,
      pendingTasks: 5,
      todayPerformance: '85%',
      shiftTiming: '9:00 AM - 6:00 PM',
      recentActivities: [
        { id: 1, action: 'Task completed', time: '2 hours ago' },
        { id: 2, action: 'New task assigned', time: '4 hours ago' }
      ]
    };

    return NextResponse.json({ dashboardData });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching dashboard data' },
      { status: 500 }
    );
  }
}