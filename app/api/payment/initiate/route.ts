
import { NextRequest, NextResponse } from 'next/server';
import { generatePaymentPayload } from '@/lib/tecogis';
import { log } from '@/lib/logger';

// Default configuration from user request
const DEFAULT_CLIENT_ID = 'agnihotra';

export async function POST(request: NextRequest) {
    try {
        // TODO: Add authentication check
        // const session = await getServerSession();
        // if (!session) {
        //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }

        const body = await request.json();
        const {
            orderId,
            amount,
            firstName,
            lastName,
            address,
            city,
            state,
            pincode,
            country,
            email,
            phone
        } = body;

        if (!orderId || !amount) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const numericAmount = Number(amount);
        if (isNaN(numericAmount) || numericAmount <= 0 || numericAmount > 10000000) {
            return NextResponse.json(
                { error: 'Invalid amount' },
                { status: 400 }
            );
        }

        const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/payment/callback`;

        const payload = await generatePaymentPayload({
            clientId: DEFAULT_CLIENT_ID,
            clientRefId: orderId,
            amount: String(amount),
            returnUrl,
            payerFirstName: firstName || '',
            payerLastName: lastName || '',
            payerAddress: address || '',
            payerPincode: pincode || '',
            payerCity: city || '',
            payerState: state || '',
            payerCountry: country || 'India',
            payerEmail: email || '',
            payerContact: phone || ''
        });

        log.info(`Payment initiated for Order ${orderId}`, { amount });

        return NextResponse.json({
            success: true,
            ...payload,
            actionUrl: 'https://www.tecogis.com/tecogispay/Payment/TecogisPaymentApi'
        });

    } catch (error) {
        log.error('Error generating payment payload', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
