'use server';

import { createServerClient } from "@/lib/supabase";

export async function getInventoryAction() {
    const supabase = createServerClient();
    if (!supabase) return { success: false, error: "Supabase not configured" };

    try {
        const { data, error } = await supabase
            .from("inventory")
            .select("*")
            .order("product_name", { ascending: true });

        if (error) throw error;
        return { success: true, data };
    } catch (error: any) {
        console.error("getInventoryAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function updateInventoryAction(productId: string, quantity: number) {
    const supabase = createServerClient();
    if (!supabase) return { success: false, error: "Supabase not configured" };

    try {
        const { error } = await supabase
            .from("inventory")
            .update({ quantity, last_updated_at: new Date().toISOString() })
            .eq("product_id", productId);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error("updateInventoryAction Error:", error);
        return { success: false, error: error.message };
    }
}
