import { NextResponse } from 'next/server';
import Booking from '@/Models/Booking';
import PromoCode from '@/Models/PromoCode';
import connectDB from '@/lib/mongodb';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { agentId } = params;

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

    // Calculate conversion rates
    const conversionData = await Booking.aggregate([
      { $match: bookingQuery },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          completedBookings: {
            $sum: { $cond: [{ $in: ['$status', ['completed', 'confirmed']] }, 1, 0] }
          },
          totalRevenue: { $sum: '$discountedPrice' },
          avgOrderValue: { $avg: '$discountedPrice' }
        }
      }
    ]);

    const data = conversionData[0] || {
      totalBookings: 0,
      completedBookings: 0,
      totalRevenue: 0,
      avgOrderValue: 0
    };

    const conversionRate = data.totalBookings > 0 
      ? (data.completedBookings / data.totalBookings) * 100 
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        agentId,
        conversionRate,
        totalBookings: data.totalBookings,
        completedBookings: data.completedBookings,
        totalRevenue: data.totalRevenue,
        avgOrderValue: data.avgOrderValue
      }
    });
  } catch (error) {
    console.error('GET /api/agents/[agentId]/conversion-rates error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching conversion rates' },
      { status: 500 }
    );
  }
}