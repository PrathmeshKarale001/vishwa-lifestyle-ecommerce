import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { createClient } = await import('@/lib/supabase/server');
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { productId, rating, content, title } = body;

        if (!productId || !rating || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Specific validation for 1-5 rating
        if (rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
        }

        // Validate verified purchase
        // Fetch all orders for the user and check if any contains the product
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.id);

        if (ordersError) {
            console.error('Error fetching orders for review validation:', ordersError);
        }

        const hasPurchased = orders?.some((order: any) =>
            order.items?.some((item: any) =>
                item.product_id === productId ||
                item.productId === productId ||
                item.id === productId
            ) &&
            (
                order.payment_status === 'paid' ||
                order.status?.toLowerCase() === 'delivered' ||
                order.status?.toLowerCase() === 'processing' ||
                order.status?.toLowerCase() === 'confirmed'
            )
        );

        if (!hasPurchased) {
            console.log('Purchase validation failed for user:', user.id, 'productId:', productId);
            return NextResponse.json({ error: 'You must have purchased this product to leave a review.' }, { status: 403 });
        }

        let { data, error } = await supabase
            .from('reviews')
            .insert([{
                product_id: productId,
                user_id: user.id,
                user_name: user?.user_metadata?.name || user?.user_metadata?.full_name || 'Anonymous',
                rating,
                title,
                content,
                status: 'pending'
            }])
            .select();

        // If 'status' column missing, retry without it
        if (error && (
            error.message?.includes('column "status" of relation "reviews" does not exist') ||
            error.message?.includes("Could not find the 'status' column")
        )) {
            console.log('Status column missing, retrying without it...');
            const retry = await supabase
                .from('reviews')
                .insert([{
                    product_id: productId,
                    user_id: user.id,
                    user_name: user?.user_metadata?.name || user?.user_metadata?.full_name || 'Anonymous',
                    rating,
                    title,
                    content
                }])
                .select();
            data = retry.data;
            error = retry.error;
        }

        if (error) {
            console.error('DATABASE ERROR submitting review:', error);
            return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Review submitted successfully.' });

    } catch (error) {
        console.error('Review submission error:', error);
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

    let { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('status', 'approved') // Only fetching approved reviews
        .order('created_at', { ascending: false });

    // If status column missing, fetch all reviews for this product
    if (error && (
        error.message?.includes('column "status" of relation "reviews" does not exist') ||
        error.message?.includes("Could not find the 'status' column")
    )) {
        console.log('Status column missing in GET, fetching all reviews instead');
        const retry = await supabase
            .from('reviews')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: false });
        data = retry.data;
        error = retry.error;
    }

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
        const { createClient } = await import('@/lib/supabase/server');
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
        const isEmailAdmin = adminEmails.includes(user.email || '');

        let isDbAdmin = false;
        try {
            const { data: adminUser } = await supabase
                .from('admin_users')
                .select('is_active')
                .eq('user_id', user.id)
                .eq('is_active', true)
                .single();
            if (adminUser) isDbAdmin = true;
        } catch (e) {
            // Ignore if table doesn't exist
        }

        if (!isEmailAdmin && !isDbAdmin) {
            return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
        }

        const { id, status } = await request.json();

        if (!id || !status) {
            return NextResponse.json({ error: 'Review ID and status required' }, { status: 400 });
        }

        // Use service role for the actual update to ensure it bypasses any restrictive RLS
        const { createServerClient: createAdminClient } = await import('@/lib/supabase');
        const supabaseAdmin = createAdminClient();

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
        }

        const { error } = await supabaseAdmin
            .from('reviews')
            .update({ status })
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error updating review:', error);
        return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
    }
}
