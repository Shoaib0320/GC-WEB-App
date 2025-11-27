// // src/app/api/promo-codes/analytics/overview/route.js
// import { NextResponse } from 'next/server';
// import PromoCode from '@/Models/PromoCode';
// import Booking from '@/Models/Booking';
// import connectDB from '@/lib/mongodb';
// import Agent from '@/Models/Agent';

// export async function GET(request) {
//   try {
//     await connectDB();

//     const { searchParams } = new URL(request.url);
//     const agentId = searchParams.get('agentId');
//     const timeFrame = searchParams.get('timeFrame') || 'all';
//     const startDate = searchParams.get('startDate');
//     const endDate = searchParams.get('endDate');
//     const month = searchParams.get('month');
//     const year = searchParams.get('year');

//     // Build time filter
//     let timeFilter = {};
    
//     if (startDate && endDate) {
//       // Custom date range
//       timeFilter.createdAt = { 
//         $gte: new Date(startDate),
//         $lte: new Date(endDate)
//       };
//     } else if (month && year) {
//       // Specific month
//       const start = new Date(year, month - 1, 1);
//       const end = new Date(year, month, 0);
//       timeFilter.createdAt = {
//         $gte: start,
//         $lte: end
//       };
//     } else {
//       // Predefined time frames
//       const now = new Date();
//       switch (timeFrame) {
//         case 'today':
//           timeFilter.createdAt = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
//           break;
//         case 'week':
//           const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
//           timeFilter.createdAt = { $gte: weekAgo };
//           break;
//         case 'month':
//           const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
//           timeFilter.createdAt = { $gte: monthAgo };
//           break;
//         case 'custom':
//           // Already handled above with startDate and endDate
//           break;
//       }
//     }

//     // Rest of your existing code remains same...
//     let promoCodeQuery = {};
//     if (agentId) {
//       promoCodeQuery.agentId = agentId;
//     }

//     const promoCodes = await PromoCode.find(promoCodeQuery)
//       .populate('agentId', 'agentName agentId email');

//     const analytics = await Promise.all(
//       promoCodes.map(async (promoCode) => {
//         const bookingQuery = { 
//           promoCodeId: promoCode._id,
//           ...timeFilter
//         };

//         const bookings = await Booking.find(bookingQuery);
//         const totalRevenue = bookings.reduce((sum, booking) => sum + booking.discountedPrice, 0);
        
//         const statusCounts = bookings.reduce((acc, booking) => {
//           acc[booking.status] = (acc[booking.status] || 0) + 1;
//           return acc;
//         }, {});

//         return {
//           promoCode: promoCode.promoCode,
//           promoCodeId: promoCode._id,
//           agent: promoCode.agentId,
//           discountPercentage: promoCode.discountPercentage,
//           totalBookings: bookings.length,
//           totalRevenue: totalRevenue,
//           usedCount: promoCode.usedCount,
//           maxUsage: promoCode.maxUsage,
//           isActive: promoCode.isActive,
//           statusCounts: statusCounts,
//           utilizationRate: promoCode.maxUsage ? (promoCode.usedCount / promoCode.maxUsage) * 100 : 0,
//           lastUsed: bookings.length > 0 ? 
//             new Date(Math.max(...bookings.map(b => new Date(b.createdAt)))) : 
//             null
//         };
//       })
//     );

//     const totalStats = {
//       totalPromoCodes: promoCodes.length,
//       activePromoCodes: analytics.filter(a => a.isActive).length,
//       totalBookings: analytics.reduce((sum, a) => sum + a.totalBookings, 0),
//       totalRevenue: analytics.reduce((sum, a) => sum + a.totalRevenue, 0),
//       totalUsedCount: analytics.reduce((sum, a) => sum + a.usedCount, 0)
//     };

//     return NextResponse.json({
//       success: true,
//       data: {
//         timeFrame,
//         agentId,
//         totalStats,
//         promoCodes: analytics,
//         topPerformers: {
//           byRevenue: analytics.sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 10),
//           byUsage: analytics.sort((a, b) => b.usedCount - a.usedCount).slice(0, 10),
//           byBookings: analytics.sort((a, b) => b.totalBookings - a.totalBookings).slice(0, 10)
//         }
//       }
//     });
//   } catch (error) {
//     console.error('GET /api/promo-codes/analytics/overview error:', error);
//     return NextResponse.json(
//       { success: false, message: 'Error fetching promo codes analytics' },
//       { status: 500 }
//     );
//   }
// }
// src/app/api/promo-codes/analytics/overview/route.js
import { NextResponse } from 'next/server';
import PromoCode from '@/Models/PromoCode';
import Booking from '@/Models/Booking';
import connectDB from '@/lib/mongodb';
import Agent from '@/Models/Agent';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const timeFrame = searchParams.get('timeFrame') || 'all';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    // Build time filter
    let timeFilter = {};
    
    if (startDate && endDate) {
      // Custom date range
      timeFilter.createdAt = { 
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (month && year) {
      // Specific month
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      timeFilter.createdAt = {
        $gte: start,
        $lte: end
      };
    } else {
      // Predefined time frames
      const now = new Date();
      switch (timeFrame) {
        case 'today':
          timeFilter.createdAt = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          timeFilter.createdAt = { $gte: weekAgo };
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          timeFilter.createdAt = { $gte: monthAgo };
          break;
        case 'custom':
          // Already handled above with startDate and endDate
          break;
      }
    }

    let promoCodeQuery = {};
    if (agentId) {
      promoCodeQuery.agentId = agentId;
    }

    const promoCodes = await PromoCode.find(promoCodeQuery)
      .populate('agentId', 'agentName agentId email');

    const analytics = await Promise.all(
      promoCodes.map(async (promoCode) => {
        const bookingQuery = { 
          promoCodeId: promoCode._id,
          ...timeFilter
        };

        const bookings = await Booking.find(bookingQuery);
        const totalRevenue = bookings.reduce((sum, booking) => sum + booking.discountedPrice, 0);
        
        const statusCounts = bookings.reduce((acc, booking) => {
          acc[booking.status] = (acc[booking.status] || 0) + 1;
          return acc;
        }, {});

        return {
          promoCode: promoCode.promoCode,
          promoCodeId: promoCode._id,
          agent: promoCode.agentId,
          discountPercentage: promoCode.discountPercent,
          totalBookings: bookings.length,
          totalRevenue: totalRevenue,
          usedCount: promoCode.usedCount,
          maxUsage: promoCode.maxUses,
          isActive: promoCode.isActive,
          statusCounts: statusCounts,
          utilizationRate: promoCode.maxUsage ? (promoCode.usedCount / promoCode.maxUsage) * 100 : 0,
          lastUsed: bookings.length > 0 ? 
            new Date(Math.max(...bookings.map(b => new Date(b.createdAt)))) : 
            null
        };
      })
    );

    // Filter out promoCodes with no bookings for top performers
    const promoCodesWithBookings = analytics.filter(a => a.totalBookings > 0);

    // Top performers logic - only include those with actual bookings
    const topPerformers = {
      byRevenue: promoCodesWithBookings
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 10),
      
      byUsage: promoCodesWithBookings
        .sort((a, b) => b.usedCount - a.usedCount)
        .slice(0, 10),
      
      byBookings: promoCodesWithBookings
        .sort((a, b) => b.totalBookings - a.totalBookings)
        .slice(0, 10)
    };

    const totalStats = {
      totalPromoCodes: promoCodes.length,
      activePromoCodes: analytics.filter(a => a.isActive).length,
      totalBookings: analytics.reduce((sum, a) => sum + a.totalBookings, 0),
      totalRevenue: analytics.reduce((sum, a) => sum + a.totalRevenue, 0),
      totalUsedCount: analytics.reduce((sum, a) => sum + a.usedCount, 0),
      // New stat: promoCodes with actual bookings
      promoCodesWithBookings: promoCodesWithBookings.length
    };

    return NextResponse.json({
      success: true,
      data: {
        timeFrame,
        agentId,
        totalStats,
        promoCodes: analytics,
        topPerformers
      }
    });
  } catch (error) {
    console.error('GET /api/promo-codes/analytics/overview error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching promo codes analytics' },
      { status: 500 }
    );
  }
}