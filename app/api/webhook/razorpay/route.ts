import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentSignature } from '@/lib/razorpay';
import { updateOrderByRazorpayId, supabase } from '@/lib/supabase';
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from '@/lib/email';
import crypto from 'crypto';
import { log } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    if (webhookSecret) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

      if (signature !== expectedSignature) {
        log.error('Invalid webhook signature', undefined, { signature: signature.substring(0, 10) + '...' });
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const event = JSON.parse(body);
    const eventType = event.event;
    const payload = event.payload;

    log.info('Razorpay webhook event received', undefined, { eventType });

    switch (eventType) {
      case 'payment.captured': {
        const payment = payload.payment.entity;
        const razorpayOrderId = payment.order_id;
        const paymentId = payment.id;

        // Update order status in database
        try {
          await updateOrderByRazorpayId(razorpayOrderId, {
            status: 'confirmed',
            payment_status: 'paid',
            payment_id: paymentId,
          });
          log.info(`Order marked as paid`, undefined, { razorpayOrderId, paymentId });

          // Fetch order details for email
          if (supabase) {
            const { data: order } = await supabase
              .from('orders')
              .select('*')
              .eq('razorpay_order_id', razorpayOrderId)
              .single();

            if (order) {
              // Send confirmation email to customer (non-blocking)
              sendOrderConfirmationEmail({
                order_number: order.order_number,
                customer_email: order.email || order.shipping_address?.email || '',
                customer_name: order.shipping_address?.name || 'Customer',
                items: order.items || [],
                shipping_address: order.shipping_address || {},
                subtotal: order.subtotal || 0,
                shipping: order.shipping || 0,
                tax: order.tax || 0,
                discount: order.discount || 0,
                total: order.total || 0,
                payment_method: order.payment_method || 'Razorpay',
                tracking_number: order.tracking_number,
              }).catch(err => {
                log.error('Failed to send order confirmation email', err, { razorpayOrderId });
              });

              // Send notification to admin (non-blocking)
              sendOrderNotificationToAdmin({
                order_number: order.order_number,
                customer_name: order.shipping_address?.name || 'Customer',
                customer_email: order.email || order.shipping_address?.email || '',
                items: order.items || [],
                total: order.total || 0,
                shipping_address: order.shipping_address || {},
              }).catch(err => {
                log.error('Failed to send order notification to admin', err, { razorpayOrderId });
              });
            }
          }
        } catch (error) {
          log.error('Failed to update order in webhook', error, { razorpayOrderId });
        }

        break;
      }

      case 'payment.failed': {
        const payment = payload.payment.entity;
        const orderId = payment.order_id;

        try {
          await updateOrderByRazorpayId(orderId, {
            status: 'cancelled',
            payment_status: 'failed',
          });
          log.info(`Order marked as failed`, undefined, { orderId });
        } catch (error) {
          log.error('Failed to update order status to failed', error, { orderId });
        }

        break;
      }

      case 'refund.created': {
        const refund = payload.refund.entity;
        const paymentId = refund.payment_id;

        // Note: Need to find order by payment_id and update
        log.info(`Refund created`, undefined, { paymentId, refundId: refund.id });

        break;
      }

      case 'order.paid': {
        const order = payload.order.entity;
        const razorpayOrderId = order.id;

        try {
          await updateOrderByRazorpayId(razorpayOrderId, {
            status: 'confirmed',
            payment_status: 'paid',
          });

          // Fetch order details for email
          if (supabase) {
            const { data: orderData } = await supabase
              .from('orders')
              .select('*')
              .eq('razorpay_order_id', razorpayOrderId)
              .single();

            if (orderData) {
              // Send confirmation email to customer (non-blocking)
              sendOrderConfirmationEmail({
                order_number: orderData.order_number,
                customer_email: orderData.email || orderData.shipping_address?.email || '',
                customer_name: orderData.shipping_address?.name || 'Customer',
                items: orderData.items || [],
                shipping_address: orderData.shipping_address || {},
                subtotal: orderData.subtotal || 0,
                shipping: orderData.shipping || 0,
                tax: orderData.tax || 0,
                discount: orderData.discount || 0,
                total: orderData.total || 0,
                payment_method: orderData.payment_method || 'Razorpay',
                tracking_number: orderData.tracking_number,
              }).catch(err => {
                log.error('Failed to send order confirmation email', err, { razorpayOrderId });
              });

              // Send notification to admin (non-blocking)
              sendOrderNotificationToAdmin({
                order_number: orderData.order_number,
                customer_name: orderData.shipping_address?.name || 'Customer',
                customer_email: orderData.email || orderData.shipping_address?.email || '',
                items: orderData.items || [],
                total: orderData.total || 0,
                shipping_address: orderData.shipping_address || {},
              }).catch(err => {
                log.error('Failed to send order notification to admin', err, { razorpayOrderId });
              });
            }
          }
        } catch (error) {
          log.error('Failed to update order in order.paid webhook', error, { razorpayOrderId });
        }

        break;
      }

      default:
        log.warn('Unhandled webhook event', undefined, { eventType });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    log.error('Webhook processing error', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

// Razorpay webhooks use POST only
export async function GET() {
  return NextResponse.json({ message: 'Razorpay webhook endpoint' });
}
