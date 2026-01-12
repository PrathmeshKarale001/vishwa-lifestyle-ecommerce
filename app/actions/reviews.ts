'use server';

import { createServerClient } from "@/lib/supabase";

export async function getReviewsAction() {
    const supabase = createServerClient();
    if (!supabase) return { success: false, error: "Supabase not configured" };

    try {
        const { data, error } = await supabase
            .from("reviews")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;
        return { success: true, data };
    } catch (error: any) {
        console.error("getReviewsAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function updateReviewStatusAction(id: string, status: string) {
    const supabase = createServerClient();
    if (!supabase) return { success: false, error: "Supabase not configured" };

    try {
        const { error } = await supabase
            .from("reviews")
            .update({ status })
            .eq("id", id);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error("updateReviewStatusAction Error:", error);
        return { success: false, error: error.message };
    }
}
