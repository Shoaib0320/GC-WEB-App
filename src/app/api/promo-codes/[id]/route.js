// src/app/api/promo-codes/[id]/route.js
import { NextResponse } from 'next/server';
import PromoCode from '@/Models/PromoCode';
import connectDB from '@/lib/mongodb';

// GET - Get promo code by ID
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const promoCode = await PromoCode.findById(id)
      .populate('agentId', 'agentName agentId email');

    if (!promoCode) {
      return NextResponse.json(
        { success: false, message: 'Promo code not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: promoCode
    });
  } catch (error) {
    console.error('GET /api/promo-codes/[id] error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching promo code' },
      { status: 500 }
    );
  }
}

// PUT - Update promo code
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const updateData = await request.json();

    // Check if promo code exists
    const promoCode = await PromoCode.findById(id);
    if (!promoCode) {
      return NextResponse.json(
        { success: false, message: 'Promo code not found' },
        { status: 404 }
      );
    }

    // If updating promoCode, check for duplicates
    if (updateData.promoCode && updateData.promoCode !== promoCode.promoCode) {
      const existingPromoCode = await PromoCode.findOne({ 
        promoCode: updateData.promoCode.toUpperCase(),
        _id: { $ne: id }
      });
      if (existingPromoCode) {
        return NextResponse.json(
          { success: false, message: 'Promo code already exists' },
          { status: 400 }
        );
      }
      updateData.promoCode = updateData.promoCode.toUpperCase();
    }

    // Update promo code
    const updatedPromoCode = await PromoCode.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('agentId', 'agentName agentId email');

    return NextResponse.json({
      success: true,
      message: 'Promo code updated successfully',
      data: updatedPromoCode
    });
  } catch (error) {
    console.error('PUT /api/promo-codes/[id] error:', error);
    return NextResponse.json(
      { success: false, message: 'Error updating promo code' },
      { status: 500 }
    );
  }
}

// DELETE - Delete promo code
export async function DELETE(request, { params }) {
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

    // Delete promo code
    await PromoCode.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Promo code deleted successfully'
    });
  } catch (error) {
    console.error('DELETE /api/promo-codes/[id] error:', error);
    return NextResponse.json(
      { success: false, message: 'Error deleting promo code' },
      { status: 500 }
    );
  }
}