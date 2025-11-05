import { NextResponse } from 'next/server';
import PromoCode from '@/Models/PromoCode';
import connectDB from '@/lib/mongodb';

export async function POST(request) {
  try {
    await connectDB();
    
    const { promoCode, agentId } = await request.json();

    if (!promoCode || !agentId) {
      return NextResponse.json(
        { success: false, message: 'Promo code and agent ID are required' },
        { status: 400 }
      );
    }

    const promo = await PromoCode.findOne({
      promoCode: promoCode.toUpperCase(),
      agentId
    }).populate('agentId', 'agentName agentId');

    if (!promo) {
      return NextResponse.json(
        { 
          success: false, 
          valid: false,
          message: 'Invalid promo code or agent' 
        },
        { status: 404 }
      );
    }

    // Check if promo code is active
    if (!promo.isActive) {
      return NextResponse.json({
        success: false,
        valid: false,
        message: 'Promo code is not active'
      });
    }

    // Check if promo code has expired
    if (new Date() > new Date(promo.validUntil)) {
      return NextResponse.json({
        success: false,
        valid: false,
        message: 'Promo code has expired'
      });
    }

    // Check if usage limit exceeded
    if (promo.usedCount >= promo.maxUsage) {
      return NextResponse.json({
        success: false,
        valid: false,
        message: 'Promo code usage limit reached'
      });
    }

    return NextResponse.json({
      success: true,
      valid: true,
      message: 'Promo code is valid',
      data: promo
    });
  } catch (error) {
    console.error('POST /api/promo-codes/validate error:', error);
    return NextResponse.json(
      { success: false, message: 'Error validating promo code' },
      { status: 500 }
    );
  }
}