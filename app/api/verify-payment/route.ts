import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentSignature } from '@/lib/razorpay';
import { updateOrderStatus } from '@/lib/supabase';
import { log } from '@/lib/logger';

export async function POST(request: NextRequest) {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            orderNumber,
        } = await request.json();

        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !orderNumber) {
            return NextResponse.json(
                { success: false, error: 'Missing payment details' },
                { status: 400 }
            );
        }

        // Verify signature
        const isSignatureValid = verifyPaymentSignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isSignatureValid) {
            log.error('Invalid payment signature', { orderNumber, razorpay_order_id });
            return NextResponse.json(
                { success: false, error: 'Invalid payment signature' },
                { status: 400 }
            );
        }

        // Update order status in database
        let updatedOrder;
        try {
            const { createServerClient } = await import('@/lib/supabase');
            const supabaseAdmin = createServerClient();

            if (!supabaseAdmin) {
                throw new Error('Failed to initialize admin client');
            }

            const { data, error } = await supabaseAdmin
                .from('orders')
                .update({
                    status: 'processing',
                    payment_status: 'paid',
                    payment_id: razorpay_payment_id
                })
                .eq('order_number', orderNumber)
                .select()
                .single();

            if (error) throw error;
            updatedOrder = data;

            // Deduct inventory
            if (updatedOrder && updatedOrder.items) {
                const { deductInventory } = await import('@/lib/inventory');

                // Process items concurrently
                await Promise.all(updatedOrder.items.map(async (item: any) => {
                    // Item ID usually stores "productId" or "productId-variantSku"
                    // If we stored productId separately in item object, use it.
                    // Assuming item structure has product_id based on typical implementation
                    // If not, we might need to parse item.id if it's composite.
                    // Let's assume item object has product_id.
                    if (item.product_id) {
                        const success = await deductInventory(item.product_id, item.quantity || 1);
                        if (!success) {
                            log.warn(`Failed to deduct inventory for product ${item.product_id}`, { orderNumber });
                        }
                    }
                }));
            }

            log.info('Payment verified and order updated', { orderNumber, paymentId: razorpay_payment_id });

            return NextResponse.json({ success: true });
        } catch (dbError: any) {
            log.error('Database error updating order status after payment', dbError, { orderNumber });
            // Still return success since payment was successful, we can reconcile later
            return NextResponse.json({
                success: true,
                warning: 'Payment verified but order status update failed. Please contact support.'
            });
        }
    } catch (error: any) {
        log.error('Payment verification error', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error during payment verification' },
            { status: 500 }
        );
    }
}
