import Razorpay from 'razorpay';
import { log } from './logger';

let razorpayInstance: Razorpay | null = null;

function getRazorpay() {
    if (typeof window !== 'undefined') {
        throw new Error('Razorpay server-side SDK cannot be used on the client side.');
    }

    if (!razorpayInstance) {
        const key_id = process.env.RAZORPAY_KEY_ID;
        const key_secret = process.env.RAZORPAY_KEY_SECRET;

        if (!key_id || !key_secret) {
            throw new Error('RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing from environment variables.');
        }

        razorpayInstance = new Razorpay({
            key_id,
            key_secret,
        });
    }
    return razorpayInstance;
}

interface RazorpayOrderOptions {
    amount: number;
    currency?: string;
    receipt: string;
    notes?: Record<string, string>;
}

export async function createRazorpayOrder(options: RazorpayOrderOptions) {
    try {
        const client = getRazorpay();
        const order = await client.orders.create({
            amount: Math.round(options.amount * 100), // Amount in paise
            currency: options.currency || 'INR',
            receipt: options.receipt,
            notes: options.notes,
        });

        log.info('Razorpay order created', { orderId: order.id, receipt: options.receipt });

        return { success: true, order };
    } catch (error: any) {
        log.error('Razorpay order creation failed', error);
        return { success: false, error: error.message || 'Failed to create payment order' };
    }
}

export function verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
) {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
        log.error('RAZORPAY_KEY_SECRET is missing during signature verification');
        return false;
    }
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secret);

    hmac.update(`${orderId}|${paymentId}`);
    const generatedSignature = hmac.digest('hex');

    return generatedSignature === signature;
}
