
// src/app/api/promo-codes/apply/route.js
import { NextResponse } from 'next/server';
import PromoCode from '@/Models/PromoCode';
import connectDB from '@/lib/mongodb';

export async function POST(request) {
  try {
    await connectDB();
    
    const { promoCode, amount } = await request.json();

    if (!promoCode || !amount) {
      return NextResponse.json(
        { success: false, message: 'Promo code and amount are required' },
        { status: 400 }
      );
    }

    // Find promo code
    const promo = await PromoCode.findOne({
      promoCode: promoCode.toUpperCase()
    }).populate('agentId', 'agentName agentId email');

    if (!promo) {
      return NextResponse.json(
        { success: false, message: 'Invalid promo code' },
        { status: 404 }
      );
    }

    // Validate promo code
    if (!promo.isActive) {
      return NextResponse.json({
        success: false,
        message: 'Promo code is not active'
      });
    }

    if (promo.validUntil && new Date() > new Date(promo.validUntil)) {
      return NextResponse.json({
        success: false,
        message: 'Promo code has expired'
      });
    }

    if (promo.maxUsage && promo.usedCount >= promo.maxUsage) {
      return NextResponse.json({
        success: false,
        message: 'Promo code usage limit reached'
      });
    }

    // Calculate discount
    const discountAmount = (amount * promo.discountPercentage) / 100;
    const finalAmount = amount - discountAmount;

    return NextResponse.json({
      success: true,
      message: 'Promo code applied successfully',
      data: {
        originalAmount: amount,
        discountPercentage: promo.discountPercentage,
        discountAmount,
        finalAmount,
        promoCode: promo.promoCode,
        promoCodeId: promo._id, // ID bhi send karo
        agentInfo: promo.agentId,
        remainingUsage: promo.maxUsage ? promo.maxUsage - promo.usedCount : null,
        promoDetails: promo // Complete promo details
      }
    });
  } catch (error) {
    console.error('POST /api/promo-codes/apply error:', error);
    return NextResponse.json(
      { success: false, message: 'Error applying promo code' },
      { status: 500 }
    );
  }
}