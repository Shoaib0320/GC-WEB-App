import { NextResponse } from 'next/server';
import PromoCode from '@/Models/PromoCode';
import connectDB from '@/lib/mongodb';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { agentId } = params;
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    
    const skip = (page - 1) * limit;

    const promoCodes = await PromoCode.find({ agentId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await PromoCode.countDocuments({ agentId });
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: promoCodes,
      pagination: {
        currentPage: page,
        totalPages,
        totalPromoCodes: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('GET /api/promo-codes/agent/[agentId] error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching promo codes' },
      { status: 500 }
    );
  }
}