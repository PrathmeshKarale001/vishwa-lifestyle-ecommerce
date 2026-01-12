'use server';

import { createServerClient } from "@/lib/supabase";

export async function getDashboardStatsAction() {
    const supabase = createServerClient();
    if (!supabase) return { success: false, error: "Supabase not configured" };

    try {
        // Fetch orders for revenue and count
        const { data: orders, error: ordersError } = await supabase
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false });

        if (ordersError) throw ordersError;

        // Fetch customers count
        const { count: customerCount, error: customerError } = await supabase
            .from("profiles")
            .select("*", { count: 'exact', head: true });

        // Fetch reviews count
        const { count: reviewCount, error: reviewError } = await supabase
            .from("reviews")
            .select("*", { count: 'exact', head: true });

        // Fetch low stock items
        const { data: lowStockItems, error: inventoryError } = await supabase
            .from("inventory")
            .select("*")
            .eq("is_tracked", true)
            .lte("quantity", 5); // Default threshold

        return {
            success: true,
            data: {
                orders: orders || [],
                customerCount: customerCount || 0,
                reviewCount: reviewCount || 0,
                lowStockCount: lowStockItems?.length || 0
            }
        };
    } catch (error: any) {
        console.error("getDashboardStatsAction Error:", error);
        return { success: false, error: error.message };
    }
}
