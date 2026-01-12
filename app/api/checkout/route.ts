import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrder } from '@/lib/razorpay';
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
      shippingAddress,
      email,
      phone,
      promoCode,
      userId,
    } = body;

    // Sanitize inputs
    email = sanitizeEmail(email);
    if (phone) phone = sanitizePhone(phone);
    if (shippingAddress?.name) shippingAddress.name = sanitizeText(shippingAddress.name);
    if (shippingAddress?.line1) shippingAddress.line1 = sanitizeText(shippingAddress.line1);
    if (shippingAddress?.line2) shippingAddress.line2 = sanitizeText(shippingAddress.line2);
    if (shippingAddress?.city) shippingAddress.city = sanitizeText(shippingAddress.city);
    if (shippingAddress?.state) shippingAddress.state = sanitizeText(shippingAddress.state);
    if (promoCode) promoCode = sanitizeText(promoCode.toUpperCase().trim());

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Cart is empty' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email address' }, { status: 400 });
    }

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.line1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.postal_code) {
      return NextResponse.json({ success: false, error: 'Missing required shipping address fields' }, { status: 400 });
    }

    // --- CRITICAL SECURITY: Recalculate Totals Server-Side ---

    // 1. Fetch trusted product data from Sanity
    const { getProductsByIds } = await import('@/lib/sanity');
    const productIds = items.map((item: any) => item.productId);
    const trustedProducts = await getProductsByIds(productIds);

    let calculatedSubtotal = 0;
    const validatedItems = [];

    // 2. Iterate items and calculate price
    for (const item of items) {
      const product = trustedProducts.find((p: any) => p._id === item.productId);

      if (!product) {
        log.warn(`Checkout: Product verified failed`, { productId: item.productId });
        return NextResponse.json({ success: false, error: `Product not available: ${item.name}` }, { status: 400 });
      }

      let unitPrice = product.price || 0;

      // Handle Variant Pricing
      if (item.size && product.variants) {
        const variant = product.variants.find((v: any) => v.size === item.size);
        if (variant && typeof variant.price === 'number') {
          unitPrice = variant.price;
        }
      }

      if (typeof item.quantity !== 'number' || item.quantity < 1) {
        return NextResponse.json({ success: false, error: 'Invalid quantity' }, { status: 400 });
      }

      calculatedSubtotal += unitPrice * item.quantity;

      // Store validated item for DB (using trusted price)
      validatedItems.push({
        ...item,
        price: unitPrice, // Overwrite with trusted price
        name: product.name // Overwrite with trusted name
      });
    }

    // 3. Handle Discount / Promo Code
    let calculatedDiscount = 0;
    if (promoCode) {
      const { validateCoupon } = await import('@/lib/coupons');
      const couponResult = await validateCoupon(promoCode, calculatedSubtotal, userId, validatedItems);

      if (couponResult.valid) {
        calculatedDiscount = couponResult.discount ?? 0;
      } else {
        // If user sent a code but it's invalid, should we fail?
        // Yes, to prevent confusion.
        return NextResponse.json({ success: false, error: `Invalid promo code: ${couponResult.error}` }, { status: 400 });
      }
    }

    // 4. Calculate Final Totals
    const shipping = 0; // Free shipping policy
    const taxableAmount = Math.max(0, calculatedSubtotal - calculatedDiscount);
    const tax = Math.round(taxableAmount * 0.18); // 18% GST standard
    const total = Math.round(taxableAmount + shipping + tax);

    // --- End Security Check ---

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create Razorpay order
    const razorpayResult = await createRazorpayOrder({
      amount: total, // Trusted total
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

    // Create order in database
    try {
      const { createServerClient } = await import('@/lib/supabase');
      const supabaseAdmin = createServerClient();

      if (!supabaseAdmin) {
        throw new Error('Failed to initialize admin client');
      }

      const { error: dbError } = await supabaseAdmin
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: userId || undefined,
          email,
          phone,
          items: validatedItems, // Trusted items
          subtotal: calculatedSubtotal,
          discount: calculatedDiscount,
          shipping,
          tax,
          total,
          shipping_address: shippingAddress,
          promo_code: promoCode,
          razorpay_order_id: razorpayOrderId,
          status: 'pending',
          payment_status: 'pending',
        });

      if (dbError) throw dbError;

    } catch (dbError: any) {
      console.error('Checkout DB Error:', dbError);
      log.error('Database error creating order', dbError, { orderNumber, email });
      return NextResponse.json(
        {
          success: false,
          error: 'System error: Could not create order record.',
          details: dbError.message
        },
        { status: 500 }
      );
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

