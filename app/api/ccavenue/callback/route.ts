import { NextRequest, NextResponse } from 'next/server';
import { decrypt, parseCCAvenueResponse } from '@/lib/ccavenue';
import { updateOrderPaymentStatus, getOrderById } from '@/lib/supabase';
import { log } from '@/lib/logger';

export async function POST(request: NextRequest) {
    try {
        // CCAvenue sends data as form-urlencoded in the body
        const formData = await request.formData();
        const encResp = formData.get('encResp') as string;

        if (!encResp) {
            log.error('CCAvenue Callback: Missing encResp');
            return NextResponse.redirect(new URL('/checkout/failure?error=missing_response', request.url));
        }

        const workingKey = process.env.CCAVENUE_WORKING_KEY;
        if (!workingKey) {
            log.error('CCAvenue Configuration Error: Missing details');
            return NextResponse.redirect(new URL('/checkout/failure?error=server_config', request.url));
        }

        // Decrypt the response
        const decryptedResp = decrypt(encResp, workingKey);
        const params = parseCCAvenueResponse(decryptedResp);

        const orderId = params.order_id;
        const trackingId = params.tracking_id;
        const bankRefNo = params.bank_ref_no;
        const orderStatus = params.order_status;
        const failureMessage = params.failure_message;
        const amount = params.amount;

        log.info(`CCAvenue Callback received for Order ${orderId}`, { status: orderStatus, trackingId });

        // Security Verification
        // 1. IP Allowlist Verification
        const allowedIps = process.env.CCAVENUE_ALLOWED_IPS?.split(',').map(ip => ip.trim());
        if (allowedIps && allowedIps.length > 0) {
            const forwardedFor = request.headers.get('x-forwarded-for');
            const requestIp = forwardedFor ? forwardedFor.split(',')[0].trim() : (request as any).ip;

            if (requestIp && !allowedIps.includes(requestIp)) {
                log.warn(`Security Alert: CCAvenue callback from unauthorized IP: ${requestIp}`);
                return NextResponse.redirect(new URL('/checkout/failure?error=security_violation', request.url));
            }
        }

        // 2. Order verification
        if (!orderId) {
            log.error('CCAvenue Callback: Missing order_id');
            return NextResponse.redirect(new URL('/checkout/failure?error=invalid_response', request.url));
        }

        const order = await getOrderById(orderId);
        if (!order) {
            log.error(`CCAvenue Callback: Order not found ${orderId}`);
            return NextResponse.redirect(new URL('/checkout/failure?error=order_not_found', request.url));
        }

        // 3. Amount Verification (if success)
        if (orderStatus === 'Success') {
            const receivedAmount = parseFloat(amount);
            const orderAmount = order.total;

            // Allow small float difference
            if (Math.abs(receivedAmount - orderAmount) > 1.0) {
                log.error(`Security Alert: Amount mismatch for order ${orderId}. Expected ${orderAmount}, got ${receivedAmount}`);
                await updateOrderPaymentStatus(orderId, 'failed', {
                    payment_id: trackingId,
                    failure_reason: 'amount_mismatch_fraud_check'
                });
                return NextResponse.redirect(new URL('/checkout/failure?error=fraud_check', request.url));
            }

            // Payment Successful
            await updateOrderPaymentStatus(orderId, 'paid', {
                payment_id: trackingId,
                payment_method: 'ccavenue',
                payment_gateway_response: params
            });

            return NextResponse.redirect(new URL(`/checkout/success?order=${orderId}`, request.url));
        } else if (orderStatus === 'Aborted') {
            // Payment Cancelled
            await updateOrderPaymentStatus(orderId, 'failed', {
                payment_id: trackingId,
                failure_reason: 'aborted'
            });
            return NextResponse.redirect(new URL('/checkout/failure?reason=cancelled', request.url));
        } else if (orderStatus === 'Failure') {
            // Payment Failed
            await updateOrderPaymentStatus(orderId, 'failed', {
                payment_id: trackingId,
                failure_reason: failureMessage
            });
            return NextResponse.redirect(new URL(`/checkout/failure?reason=failed&msg=${encodeURIComponent(failureMessage || '')}`, request.url));
        } else {
            // Invalid status
            log.warn(`Unknown CCAvenue status: ${orderStatus}`);
            return NextResponse.redirect(new URL('/checkout/failure?reason=unknown_status', request.url));
        }

    } catch (error) {
        log.error('Error processing CCAvenue callback', error);
        return NextResponse.redirect(new URL('/checkout/failure?error=processing_error', request.url));
    }
}
