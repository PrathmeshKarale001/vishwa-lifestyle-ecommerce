
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabase = createServerClient();

    if (!supabase) {
        return NextResponse.json({ coupons: [] });
    }

    try {
        const { data: coupons, error } = await supabase
            .from('coupons')
            .select('code, discount_type, discount_value, min_order_amount, description, valid_until')
            .eq('is_active', true)
            .or(`valid_until.is.null,valid_until.gt.${new Date().toISOString()}`)
            .order('discount_value', { ascending: false });

        if (error) {
            console.error('Error fetching public coupons', error);
            return NextResponse.json({ coupons: [] });
        }

        return NextResponse.json({ coupons: coupons || [] });
    } catch (error) {
        console.error('Error in public coupons API', error);
        return NextResponse.json({ coupons: [] });
    }
}
