'use server';

import { createServerClient } from "@/lib/supabase";

export async function getCustomersAction() {
    const supabase = createServerClient();
    if (!supabase) return { success: false, error: "Supabase not configured" };

    try {
        const { data, error } = await supabase
            .from("profiles")
            .select(`
                id,
                full_name:name,
                created_at,
                email,
                orders (
                    id,
                    total,
                    status
                )
            `)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return { success: true, data };
    } catch (error: any) {
        console.error("getCustomersAction Error:", error);
        return { success: false, error: error.message };
    }
}
