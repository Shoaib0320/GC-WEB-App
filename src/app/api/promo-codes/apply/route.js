import { NextResponse } from 'next/server';
import PromoCode from '@/Models/PromoCode';
import connectDB from '@/lib/mongodb';

export async function POST(request) {
  try {
    await connectDB();
    
    const { promoCode, agentId, amount } = await request.json();

    if (!promoCode || !agentId || !amount) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    const promo = await PromoCode.findOne({
      promoCode: promoCode.toUpperCase(),
      agentId
    });

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

    if (new Date() > new Date(promo.validUntil)) {
      return NextResponse.json({
        success: false,
        message: 'Promo code has expired'
      });
    }

    if (promo.usedCount >= promo.maxUsage) {
      return NextResponse.json({
        success: false,
        message: 'Promo code usage limit reached'
      });
    }

    // Calculate discount
    const discountAmount = (amount * promo.discountPercentage) / 100;
    const finalAmount = amount - discountAmount;

    // Increment usage count
    promo.usedCount += 1;
    await promo.save();

    return NextResponse.json({
      success: true,
      message: 'Promo code applied successfully',
      data: {
        originalAmount: amount,
        discountPercentage: promo.discountPercentage,
        discountAmount,
        finalAmount,
        promoCode: promo.promoCode,
        remainingUsage: promo.maxUsage - promo.usedCount
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