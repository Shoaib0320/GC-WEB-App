// src/app/api/promo-codes/[id]/status/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PromoCode from '@/Models/PromoCode';
import { verifyToken } from '@/lib/jwt';

export async function PATCH(request, { params }) {
  try {
    await connectDB();

    // Authentication check
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    // Validate ID
    if (!id || id === 'undefined' || id === 'null') {
      return NextResponse.json(
        { success: false, message: 'Promo code ID is required' },
        { status: 400 }
      );
    }

    // Get request body
    const body = await request.json();
    const { isActive } = body;

    // Validate request body
    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'isActive field is required and must be a boolean' },
        { status: 400 }
      );
    }

    // Find promo code by ID
    const promoCode = await PromoCode.findById(id);
    
    if (!promoCode) {
      return NextResponse.json(
        { success: false, message: 'Promo code not found' },
        { status: 404 }
      );
    }

    // Check if promo code is expired
    const now = new Date();
    if (promoCode.validUntil && new Date(promoCode.validUntil) < now) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Cannot activate expired promo code' 
        },
        { status: 400 }
      );
    }

    // Check if promo code has reached max usage
    if (isActive && promoCode.maxUsage && promoCode.usedCount >= promoCode.maxUsage) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Cannot activate promo code that has reached maximum usage limit' 
        },
        { status: 400 }
      );
    }

    // Update status
    promoCode.isActive = isActive;
    await promoCode.save();

    // Return updated promo code
    const updatedPromoCode = await PromoCode.findById(id)
      .populate('agentId', 'agentName agentId email')
      .select('-__v');

    return NextResponse.json({
      success: true,
      message: `Promo code ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedPromoCode
    });

  } catch (error) {
    console.error('PATCH /api/promo-codes/[id]/status error:', error);
    
    // MongoDB duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'Promo code already exists' },
        { status: 400 }
      );
    }

    // MongoDB cast error (invalid ID)
    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, message: 'Invalid promo code ID' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// Optional: Add GET method to check current status
export async function GET(request, { params }) {
  try {
    await connectDB();

    // Authentication check
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const { id } = params;
    
    // Validate ID
    if (!id || id === 'undefined' || id === 'null') {
      return NextResponse.json(
        { success: false, message: 'Promo code ID is required' },
        { status: 400 }
      );
    }

    // Find promo code by ID
    const promoCode = await PromoCode.findById(id)
      .populate('agentId', 'agentName agentId email')
      .select('-__v');

    if (!promoCode) {
      return NextResponse.json(
        { success: false, message: 'Promo code not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: promoCode._id,
        promoCode: promoCode.promoCode,
        isActive: promoCode.isActive,
        usedCount: promoCode.usedCount,
        maxUsage: promoCode.maxUsage,
        validUntil: promoCode.validUntil,
        agent: promoCode.agentId
      }
    });

  } catch (error) {
    console.error('GET /api/promo-codes/[id]/status error:', error);
    
    // MongoDB cast error (invalid ID)
    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, message: 'Invalid promo code ID' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}