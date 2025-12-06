import { NextResponse } from 'next/server';
import PromoCode from '@/Models/PromoCode';
import Agent from '@/Models/Agent';
import connectDB from '@/lib/mongodb';

// GET - Get all promo codes
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const agentId = searchParams.get('agentId') || '';
    
    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { promoCode: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Filter by agent if provided
    if (agentId) {
      searchQuery.agentId = agentId;
    }

    const promoCodes = await PromoCode.find(searchQuery)
      .populate('agentId', 'agentName agentId email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await PromoCode.countDocuments(searchQuery);
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
    console.error('GET /api/promo-codes error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching promo codes' },
      { status: 500 }
    );
  }
}

// POST - Create new promo code
export async function POST(request) {
  try {
    await connectDB();
    
    const { 
      promoCode, 
      discountPercentage, 
      agentId, 
      maxUsage, 
      validUntil, 
      description 
    } = await request.json();

    // Validation
    if (!promoCode || !discountPercentage || !agentId ) {
      return NextResponse.json(
        { success: false, message: 'Required fields missing' },
        { status: 400 }
      );
    }

    // Check if agent exists
    const agent = await Agent.findById(agentId);
    if (!agent) {
      return NextResponse.json(
        { success: false, message: 'Agent not found' },
        { status: 404 }
      );
    }

    // Check if promo code already exists
    const existingPromoCode = await PromoCode.findOne({ 
      promoCode: promoCode.toUpperCase() 
    });
    if (existingPromoCode) {
      return NextResponse.json(
        { success: false, message: 'Promo code already exists' },
        { status: 400 }
      );
    }

    // Validate discount percentage
    if (discountPercentage < 1 || discountPercentage > 100) {
      return NextResponse.json(
        { success: false, message: 'Discount percentage must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Create promo code
    const newPromoCode = await PromoCode.create({
      promoCode: promoCode.toUpperCase(),
      discountPercentage,
      agentId,
      maxUsage: maxUsage || 1,
      description
    });

    const populatedPromoCode = await PromoCode.findById(newPromoCode._id)
      .populate('agentId', 'agentName agentId email');

    return NextResponse.json(
      { 
        success: true,
        message: 'Promo code created successfully',
        data: populatedPromoCode
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/promo-codes error:', error);
    return NextResponse.json(
      { success: false, message: 'Error creating promo code' },
      { status: 500 }
    );
  }
}