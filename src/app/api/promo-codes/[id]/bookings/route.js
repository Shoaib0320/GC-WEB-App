// src/app/api/promo-codes/[id]/bookings/route.js
import { NextResponse } from 'next/server';
import PromoCode from '@/Models/PromoCode';
import Booking from '@/Models/Booking';
import connectDB from '@/lib/mongodb';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    // Check if promo code exists
    const promoCode = await PromoCode.findById(id);
    if (!promoCode) {
      return NextResponse.json(
        { success: false, message: 'Promo code not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status') || '';
    
    const skip = (page - 1) * limit;

    // Build query for bookings using this promo code
    let bookingQuery = { promoCodeId: id };
    
    // Filter by status if provided
    if (status) {
      bookingQuery.status = status;
    }

    const bookings = await Booking.find(bookingQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments(bookingQuery);
    const totalPages = Math.ceil(total / limit);

    // Calculate analytics
    const totalRevenue = await Booking.aggregate([
      { $match: bookingQuery },
      { $group: { _id: null, total: { $sum: '$discountedPrice' } } }
    ]);

    const statusWiseCount = await Booking.aggregate([
      { $match: bookingQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        promoCode: promoCode,
        bookings: bookings,
        analytics: {
          totalBookings: total,
          totalRevenue: totalRevenue[0]?.total || 0,
          statusWiseCount: statusWiseCount,
          averageOrderValue: total > 0 ? (totalRevenue[0]?.total || 0) / total : 0
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
    console.error('GET /api/promo-codes/[id]/bookings error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching promo code bookings' },
      { status: 500 }
    );
  }
}