
import { NextRequest, NextResponse } from 'next/server';
import { log } from '@/lib/logger';

export async function POST(request: NextRequest) {
    try {
        const data: Record<string, any> = {};
        const contentType = request.headers.get('content-type') || '';

        log.info('Tecogis Callback Content-Type', { contentType });

        // Method 1: Try reading as FormData (standard)
        if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
            try {
                const formData = await request.formData();
                formData.forEach((value, key) => {
                    data[key] = value;
                });
            } catch (e) {
                log.warn('Failed to parse formData despite header, trying text fallback');
            }
        }

        // Method 2: If no data yet, try JSON
        if (Object.keys(data).length === 0 && contentType.includes('application/json')) {
            try {
                const json = await request.json();
                Object.assign(data, json);
            } catch (e) {
                log.warn('Failed to parse JSON body');
            }
        }

        // Method 3: Fallback - read as text and parse if it looks like a query string
        if (Object.keys(data).length === 0) {
            try {
                const text = await request.text();
                // Check if body is not empty before parsing
                if (text && text.trim().length > 0) {
                    // Try parsing as URLSearchParams first (key=value&key2=value2)
                    try {
                        const params = new URLSearchParams(text);
                        params.forEach((value, key) => {
                            data[key] = value;
                        });
                    } catch (e) {
                        // ignore
                    }

                    // If parsing failed or result empty, store raw body
                    if (Object.keys(data).length === 0) {
                        data['rawBody'] = text;
                    }
                }
            } catch (e) {
                log.warn('Failed to read request body as text');
            }
        }

        // Method 4: Merge URL Search Params (GET fallback or query params on POST)
        request.nextUrl.searchParams.forEach((value, key) => {
            data[key] = value;
        });

        log.info('Tecogis Payment Callback Processed Data', data);

        // Success Recovery: If we found received ANY data, we consider it a success path
        if (Object.keys(data).length > 0) {
            const orderId = data.PG_ClientRefID || data.clientRefId || data.RefNo || data.refNo || data.order_id;
            const trackingId = data.PG_TransactionID || data.transactionId || data.trackingId;

            if (orderId) {
                try {
                    const { updateOrderPaymentStatus } = await import('@/lib/supabase');
                    await updateOrderPaymentStatus(orderId, 'paid', {
                        payment_id: trackingId,
                        payment_method: 'tecogis',
                        payment_gateway_response: data
                    });
                    log.info(`Updated order status for ${orderId}`);
                } catch (e) {
                    log.error(`Failed to update order status for ${orderId}`, e);
                }
            }

            // Redirect to success if we have ANY data
            return NextResponse.redirect(new URL(`/checkout/success?status=received${orderId ? `&order=${orderId}` : ''}`, request.url));
        }

        throw new Error('No data received in callback');

    } catch (error: any) {
        log.error('Error processing Tecogis callback', {
            message: error.message,
            stack: error.stack,
            url: request.url
        });

        // Final recovery attempt from URL in catch block
        const url = new URL(request.url);
        const refNo = url.searchParams.get('RefNo') || url.searchParams.get('refNo') || url.searchParams.get('PG_ClientRefID');

        if (refNo) {
            try {
                const { updateOrderPaymentStatus } = await import('@/lib/supabase');
                await updateOrderPaymentStatus(refNo, 'paid', {
                    payment_id: url.searchParams.get('PG_TransactionID') || undefined,
                    payment_method: 'tecogis',
                    payment_gateway_response: { recovered_from_url: true }
                });
            } catch (e) {
                // ignore
            }
            return NextResponse.redirect(new URL(`/checkout/success?status=success_recovered_catch&order=${refNo}`, request.url));
        }

        return NextResponse.redirect(new URL(`/checkout/failure?error=callback_error&message=${encodeURIComponent(error.message)}`, request.url));
    }
}

export async function GET(request: NextRequest) {
    // Handle GET callback if applicable
    return POST(request);
}
