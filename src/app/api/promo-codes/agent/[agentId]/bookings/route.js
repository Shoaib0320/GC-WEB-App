// src/app/api/agents/[agentId]/bookings/route.js
import { NextResponse } from 'next/server';
import Booking from '@/Models/Booking';
import PromoCode from '@/Models/PromoCode';
import connectDB from '@/lib/mongodb';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { agentId } = params;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    const skip = (page - 1) * limit;

    // Get all promo codes for this agent
    const agentPromoCodes = await PromoCode.find({ agentId });
    const promoCodeIds = agentPromoCodes.map(pc => pc._id);

    // Build query
    let bookingQuery = { promoCodeId: { $in: promoCodeIds } };
    
    if (status) {
      bookingQuery.status = status;
    }

    if (startDate && endDate) {
      bookingQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const bookings = await Booking.find(bookingQuery)
      .populate('promoCodeId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments(bookingQuery);
    const totalPages = Math.ceil(total / limit);

    // Calculate agent-specific stats
    const revenueStats = await Booking.aggregate([
      { $match: bookingQuery },
      { 
        $group: { 
          _id: null, 
          totalRevenue: { $sum: '$discountedPrice' },
          totalBookings: { $sum: 1 },
          avgOrderValue: { $avg: '$discountedPrice' }
        } 
      }
    ]);

    const statusStats = await Booking.aggregate([
      { $match: bookingQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        agentId,
        bookings,
        analytics: {
          totalBookings: total,
          totalRevenue: revenueStats[0]?.totalRevenue || 0,
          avgOrderValue: revenueStats[0]?.avgOrderValue || 0,
          statusStats: statusStats
        },
        pagination: {
          currentPage: page,
          totalPages,
          totalBookings: total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('GET /api/agents/[agentId]/bookings error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching agent bookings' },
      { status: 500 }
    );
  }
}