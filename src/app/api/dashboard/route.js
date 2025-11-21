import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/Models/User';
import Agent from '@/Models/Agent';
import Booking from '@/Models/Booking';
import Attendance from '@/Models/Attendance';
import LeaveRequest from '@/Models/LeaveRequest';
import PromoCode from '@/Models/PromoCode';
import Notification from '@/Models/Notification';
import Role from '@/Models/Role';
import Shift from '@/Models/Shift';
import WeeklyOff from '@/Models/WeeklyOff';
import Holiday from '@/Models/Holiday';
import ContactMessage from '@/Models/Contact';

export async function GET() {
  try {
    await connectDB();

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const in30Days = new Date(now);
    in30Days.setDate(now.getDate() + 30);

    // Aggregate counts
    const [
      totalUsers,
      activeUsers,
      totalAgents,
      activeAgents,
      totalBookings,
      confirmedBookings,
      pendingBookings,
      attendanceToday,
      totalLeaves,
      pendingLeaves,
      totalPromoCodes,
      activePromoCodes,
      totalNotifications,
      totalRoles,
      totalShifts,
      totalWeeklyOffs,
      upcomingHolidays,
      newContacts,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Agent.countDocuments(),
      Agent.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'pending' }),
      Attendance.countDocuments({ checkInTime: { $gte: startOfDay, $lte: endOfDay } }),
      LeaveRequest.countDocuments(),
      LeaveRequest.countDocuments({ status: 'pending' }),
      PromoCode.countDocuments(),
      PromoCode.countDocuments({ isActive: true }),
      Notification.countDocuments(),
      Role.countDocuments(),
      Shift.countDocuments(),
      WeeklyOff.countDocuments(),
      Holiday.countDocuments({ date: { $gte: now, $lte: in30Days } }),
      ContactMessage.countDocuments({ status: 'new' }),
    ]);

    const data = {
      totalUsers,
      activeUsers,
      totalAgents,
      activeAgents,
      totalBookings,
      confirmedBookings,
      pendingBookings,
      attendanceToday,
      totalLeaves,
      pendingLeaves,
      totalPromoCodes,
      activePromoCodes,
      totalNotifications,
      totalRoles,
      totalShifts,
      totalWeeklyOffs,
      upcomingHolidays,
      newContacts,
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
