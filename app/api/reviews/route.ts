import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getOrdersByUser, addReview } from '@/lib/supabase';
import { log } from '@/lib/logger';

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { productId, rating, content, title } = body;

        if (!productId || !rating || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // specific validation for 1-5 rating
        if (rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
        }

        // Validate verified purchase
        // We fetch all orders for the user and check if any contains the product
        const orders = await getOrdersByUser(user.id);
        const hasPurchased = orders?.some((order: any) =>
            // Check if items array contains the product. Assuming items have product_id or id matching Sanity ID
            // Commonly items are stored as { product_id: "...", ... }
            order.items?.some((item: any) => item.product_id === productId || item.id === productId) &&
            (order.payment_status === 'paid' || order.status === 'delivered')
        );

        if (!hasPurchased) {
            return NextResponse.json({ error: 'You verify that you have purchased this product to leave a review.' }, { status: 403 });
        }

        const { data, error } = await addReview({
            product_id: productId,
            user_id: user.id,
            user_name: user.user_metadata?.name || 'Anonymous',
            rating,
            title,
            content,
            // status: 'pending' // Let Supabase default handle this or trigger
        });

        if (error) {
            log.error('Error submitting review', error);
            return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Review submitted successfully pending approval.' });

    } catch (error) {
        log.error('Review submission error', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
        return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    // Use admin/service role to fetch reviews to ensure we only get valid data, 
    // or rely on RLS. Ideally we filter by status='approved'.
    // We'll use the lib function but we might need to filter manually if the lib function returns all.
    // The lib function is: export async function getProductReviews(productId: string) ...

    // Since we don't have direct access to 'status' column in the lib function, we'll try to fetch
    // and see. If the table has a status column, we should filter.
    // For now, let's assume we can fetch all and filter in memory if needed, or query specifically.

    // Actually, better to use supabase directly here if possible to filter by status.
    // But let's stick to the lib pattern if we can.
    // The lib function `getProductReviews` does `select('*')`.
    // We better update the lib or use a direct query here.
    // Let's use direct query to be safe and specific.

    const { createServerClient } = await import('@/lib/supabase');
    const supabase = createServerClient();

    if (!supabase) {
        return NextResponse.json({ reviews: [] });
    }

    const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('status', 'approved') // Only fetching approved reviews
        .order('created_at', { ascending: false });

    if (error) {
        // If column doesn't exist, it might error. We assume schema update handles it.
        // If error, return empty
        console.error("Error fetching reviews", error);
        return NextResponse.json({ reviews: [] });
    }



    return NextResponse.json({ reviews: data });
}

export async function PUT(request: NextRequest) {
    try {
        const { isAdmin } = await import('@/lib/admin');
        const isUserAdmin = await isAdmin();

        if (!isUserAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, status } = await request.json();

        if (!id || !status) {
            return NextResponse.json({ error: 'Review ID and status required' }, { status: 400 });
        }

        const { createServerClient } = await import('@/lib/supabase');
        const supabase = createServerClient();

        if (!supabase) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
        }

        const { error } = await supabase
            .from('reviews')
            .update({ status })
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error updating review', error);
        return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
    }
}
