
// src/app/api/promo-codes/validate/route.js
import { NextResponse } from 'next/server';
import PromoCode from '@/Models/PromoCode';
import connectDB from '@/lib/mongodb';
import Agent from '@/Models/Agent';


export async function POST(request) {
  try {
    await connectDB();
    
    const { promoCode } = await request.json();

    if (!promoCode) {
      return NextResponse.json(
        { success: false, message: 'Promo code is required' },
        { status: 400 }
      );
    }

    // Find promo code without agentId check
    const promo = await PromoCode.findOne({
      promoCode: promoCode.toUpperCase()
    }).populate('agentId', 'agentName agentId');

    if (!promo) {
      return NextResponse.json(
        { 
          success: false, 
          valid: false,
          message: 'Invalid promo code' 
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

    // Check if promo code has expired (only if validUntil exists)
    if (promo.validUntil && new Date() > new Date(promo.validUntil)) {
      return NextResponse.json({
        success: false,
        valid: false,
        message: 'Promo code has expired'
      });
    }

    // Check if usage limit exceeded (only if maxUsage exists)
    if (promo.maxUsage && promo.usedCount >= promo.maxUsage) {
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