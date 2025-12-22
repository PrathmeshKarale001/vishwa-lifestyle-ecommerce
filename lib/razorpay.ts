import Razorpay from 'razorpay';
import { log } from './logger';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

interface RazorpayOrderOptions {
    amount: number;
    currency?: string;
    receipt: string;
    notes?: Record<string, string>;
}

export async function createRazorpayOrder(options: RazorpayOrderOptions) {
    try {
        const order = await razorpay.orders.create({
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
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '');

    hmac.update(`${orderId}|${paymentId}`);
    const generatedSignature = hmac.digest('hex');

    return generatedSignature === signature;
}
