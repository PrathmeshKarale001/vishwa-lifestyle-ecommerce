import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentSignature } from '@/lib/razorpay';
import { updateOrderByRazorpayId, getOrderByNumber } from '@/lib/supabase';
import { log } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderNumber,
    } = body;

    // Verify the payment signature
    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Update order status
    try {
      await updateOrderByRazorpayId(razorpay_order_id, {
        status: 'confirmed',
        payment_status: 'paid',
        payment_id: razorpay_payment_id,
      });
    } catch (dbError) {
      log.error('Failed to update order after payment verification', dbError, { razorpay_order_id });
      // Payment is verified, so we should still return success
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      orderNumber,
    });
  } catch (error: any) {
    log.error('Payment verification error', error);
    return NextResponse.json(
      { success: false, error: 'Unable to verify payment. Please contact support if payment was deducted.' },
      { status: 500 }
    );
  }
}

