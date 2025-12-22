import { NextRequest, NextResponse } from 'next/server';
// import { createRazorpayOrder } from '@/lib/razorpay'; // Disabled for migration
import { createOrder, generateOrderNumber } from '@/lib/supabase';
import { rateLimit, getClientIP } from '@/lib/rate-limit';
import { sanitizeEmail, sanitizeText, sanitizePhone } from '@/lib/sanitize';
import { log } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Rate limiting - 5 requests per minute for checkout
  const ip = getClientIP(request);
  const limit = rateLimit(`checkout:${ip}`, { windowMs: 60000, maxRequests: 5 });

  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again in a moment.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': String(limit.remaining),
          'Retry-After': String(Math.ceil((limit.resetTime - Date.now()) / 1000)),
        },
      }
    );
  }

  try {
    const body = await request.json();
    let {
      items,
      subtotal,
      discount,
      shipping,
      tax,
      total,
      shippingAddress,
      email,
      phone,
      promoCode,
      userId, // Optional - if user is logged in
    } = body;

    // Sanitize inputs
    email = sanitizeEmail(email);
    if (phone) phone = sanitizePhone(phone);
    if (shippingAddress?.name) shippingAddress.name = sanitizeText(shippingAddress.name);
    if (shippingAddress?.line1) shippingAddress.line1 = sanitizeText(shippingAddress.line1);
    if (shippingAddress?.line2) shippingAddress.line2 = sanitizeText(shippingAddress.line2);
    if (shippingAddress?.city) shippingAddress.city = sanitizeText(shippingAddress.city);
    if (shippingAddress?.state) shippingAddress.state = sanitizeText(shippingAddress.state);

    // Validate request - Security: Input validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Validate shipping address structure
    if (!shippingAddress ||
      !shippingAddress.name ||
      !shippingAddress.line1 ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.postal_code) {
      return NextResponse.json(
        { success: false, error: 'Missing required shipping address fields' },
        { status: 400 }
      );
    }

    // Validate numeric values
    if (typeof subtotal !== 'number' || subtotal < 0 ||
      typeof total !== 'number' || total < 0 ||
      typeof shipping !== 'number' || shipping < 0 ||
      typeof tax !== 'number' || tax < 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount values' },
        { status: 400 }
      );
    }

    // Validate items structure
    for (const item of items) {
      if (!item.productId || !item.name || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
        return NextResponse.json(
          { success: false, error: 'Invalid item structure' },
          { status: 400 }
        );
      }
      if (item.price < 0 || item.quantity < 1 || item.quantity > 100) {
        return NextResponse.json(
          { success: false, error: 'Invalid item price or quantity' },
          { status: 400 }
        );
      }
    }

    // Sanitize phone number (basic validation)
    if (phone && typeof phone !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create Razorpay order
    const { createRazorpayOrder } = await import('@/lib/razorpay');
    const razorpayResult = await createRazorpayOrder({
      amount: total,
      receipt: orderNumber,
      notes: {
        email,
        orderNumber,
        promoCode: promoCode || '',
      },
    });

    if (!razorpayResult.success || !razorpayResult.order) {
      return NextResponse.json(
        { success: false, error: razorpayResult.error || 'Failed to create payment order' },
        { status: 500 }
      );
    }

    const razorpayOrderId = razorpayResult.order.id;

    // Create order in database (pending status)
    try {
      await createOrder({
        order_number: orderNumber,
        user_id: userId || undefined,
        email,
        phone,
        items,
        subtotal,
        discount,
        shipping,
        tax,
        total,
        shipping_address: shippingAddress,
        promo_code: promoCode,
        razorpay_order_id: razorpayOrderId,
        status: 'pending',
        payment_status: 'unpaid',
      });
    } catch (dbError: any) {
      log.error('Database error creating order', dbError, { orderNumber, email });
    }

    return NextResponse.json({
      success: true,
      orderNumber,
      amount: total,
      currency: 'INR',
      razorpayOrderId,
    });
  } catch (error: any) {
    log.error('Checkout error', error);
    return NextResponse.json(
      { success: false, error: 'Unable to process checkout. Please try again or contact support.' },
      { status: 500 }
    );
  }
}

