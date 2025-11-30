import Razorpay from 'razorpay';

// Environment variables
const keyId = process.env.RAZORPAY_KEY_ID!;
const keySecret = process.env.RAZORPAY_KEY_SECRET!;

// Check if we have valid credentials
const hasValidCredentials = keyId && keySecret && !keyId.includes('placeholder');

// Initialize Razorpay instance
let razorpay: Razorpay | null = null;

if (hasValidCredentials) {
  try {
    razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  } catch (error) {
    console.error('Failed to initialize Razorpay:', error);
  }
}

export interface CreateOrderParams {
  amount: number; // Amount in rupees
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export async function createRazorpayOrder({
  amount,
  currency = 'INR',
  receipt,
  notes = {},
}: CreateOrderParams) {
  if (!razorpay) {
    throw new Error('Razorpay not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to environment variables.');
  }

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt,
      notes,
    });

    return {
      success: true,
      order,
    };
  } catch (error: any) {
    console.error('Razorpay order creation failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to create order',
    };
  }
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!keySecret) return false;
  
  const crypto = require('crypto');
  
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
}

export async function fetchPaymentDetails(paymentId: string) {
  if (!razorpay) {
    throw new Error('Razorpay not configured');
  }

  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return { success: true, payment };
  } catch (error: any) {
    console.error('Failed to fetch payment:', error);
    return { success: false, error: error.message || 'Failed to fetch payment' };
  }
}

export async function initiateRefund(paymentId: string, amount?: number) {
  if (!razorpay) {
    throw new Error('Razorpay not configured');
  }

  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount ? Math.round(amount * 100) : undefined, // Full refund if no amount specified
    });
    return { success: true, refund };
  } catch (error: any) {
    console.error('Refund failed:', error);
    return { success: false, error: error.message || 'Refund failed' };
  }
}

// Get public key for frontend
export function getRazorpayPublicKey(): string {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
}

export default razorpay;
