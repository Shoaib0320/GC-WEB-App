// src/app/api/agents/[agentId]/promo-codes/analytics/route.js
import { NextResponse } from 'next/server';
import PromoCode from '@/Models/PromoCode';
import Booking from '@/Models/Booking';
import connectDB from '@/lib/mongodb';

export async function GET(request, { params }) {
  try {
    await connectDB();
        
    const { agentId } = await params;

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build date filter
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get all promo codes for this agent
    const promoCodes = await PromoCode.find({ agentId });

    // Get analytics for each promo code
    const promoCodeAnalytics = await Promise.all(
      promoCodes.map(async (promoCode) => {
        const bookingQuery = { 
          promoCodeId: promoCode._id,
          ...dateFilter
        };

        const bookings = await Booking.find(bookingQuery);
        const totalRevenue = bookings.reduce((sum, booking) => sum + booking.discountedPrice, 0);
        const successfulBookings = bookings.filter(b => b.status === 'completed' || b.status === 'confirmed');

        return {
          promoCode: promoCode.promoCode,
          promoCodeId: promoCode._id,
          discountPercentage: promoCode.discountPercentage,
          totalBookings: bookings.length,
          successfulBookings: successfulBookings.length,
          totalRevenue: totalRevenue,
          usedCount: promoCode.usedCount,
          maxUsage: promoCode.maxUsage,
          utilizationRate: promoCode.maxUsage ? (promoCode.usedCount / promoCode.maxUsage) * 100 : 0,
          conversionRate: bookings.length > 0 ? (successfulBookings.length / bookings.length) * 100 : 0
        };
      })
    );

    // Overall agent analytics
    const totalAgentRevenue = promoCodeAnalytics.reduce((sum, analytics) => sum + analytics.totalRevenue, 0);
    const totalAgentBookings = promoCodeAnalytics.reduce((sum, analytics) => sum + analytics.totalBookings, 0);

    return NextResponse.json({
      success: true,
      data: {
        agentId: agentId,
        period: {
          startDate,
          endDate,
          isCustomPeriod: !!(startDate && endDate)
        },
        overview: {
          totalPromoCodes: promoCodes.length,
          totalBookings: totalAgentBookings,
          totalRevenue: totalAgentRevenue,
          activePromoCodes: promoCodes.filter(pc => pc.isActive).length
        },
        promoCodeAnalytics: promoCodeAnalytics,
        topPerformingPromoCodes: promoCodeAnalytics
          .sort((a, b) => b.totalRevenue - a.totalRevenue)
          .slice(0, 5)
      }
    });
  } catch (error) {
    console.error('GET /api/agents/[agentId]/promo-codes/analytics error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching agent analytics' },
      { status: 500 }
    );
  }
}