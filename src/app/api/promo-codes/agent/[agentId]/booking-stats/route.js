// src/app/api/agents/[agentId]/booking-stats/route.js
import { NextResponse } from 'next/server';
import Booking from '@/Models/Booking';
import PromoCode from '@/Models/PromoCode';
import connectDB from '@/lib/mongodb';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { agentId } = await params;

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Get agent's promo codes
    const agentPromoCodes = await PromoCode.find({ agentId });
    const promoCodeIds = agentPromoCodes.map(pc => pc._id);

    // Build date filter
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const bookingQuery = { 
      promoCodeId: { $in: promoCodeIds },
      ...dateFilter
    };

    // Comprehensive stats aggregation
    const stats = await Booking.aggregate([
      { $match: bookingQuery },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$discountedPrice' },
          completedBookings: {
            $sum: { $cond: [{ $in: ['$status', ['completed', 'confirmed']] }, 1, 0] }
          },
          pendingBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          avgOrderValue: { $avg: '$discountedPrice' },
          minOrderValue: { $min: '$discountedPrice' },
          maxOrderValue: { $max: '$discountedPrice' }
        }
      }
    ]);

    // Monthly trend
    const monthlyTrend = await Booking.aggregate([
      { $match: bookingQuery },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          bookings: { $sum: 1 },
          revenue: { $sum: '$discountedPrice' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const result = stats[0] || {
      totalBookings: 0,
      totalRevenue: 0,
      completedBookings: 0,
      pendingBookings: 0,
      cancelledBookings: 0,
      avgOrderValue: 0,
      minOrderValue: 0,
      maxOrderValue: 0
    };

    result.conversionRate = result.totalBookings > 0 
      ? (result.completedBookings / result.totalBookings) * 100 
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        agentId,
        period: { startDate, endDate },
        overview: result,
        monthlyTrend,
        promoCodeCount: agentPromoCodes.length,
        activePromoCodes: agentPromoCodes.filter(pc => pc.isActive).length
      }
    });
  } catch (error) {
    console.error('GET /api/agents/[agentId]/booking-stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching agent booking stats' },
      { status: 500 }
    );
  }
}