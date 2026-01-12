'use server';

import { createServerClient } from "@/lib/supabase";

export async function getOrdersAction() {
    const supabase = createServerClient();
    if (!supabase) return { success: false, error: "Supabase not configured" };

    try {
        const { data, error } = await supabase
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;
        return { success: true, data };
    } catch (error: any) {
        console.error("getOrdersAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getOrderDetailAction(orderId: string) {
    const supabase = createServerClient();
    if (!supabase) return { success: false, error: "Supabase not configured" };

    try {
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .single();

        if (orderError) throw orderError;

        let userProfile = null;
        if (order.user_id) {
            const { data: profile } = await supabase
                .from("profiles")
                .select("email, name")
                .eq("id", order.user_id)
                .single();
            userProfile = profile;
        }

        return { success: true, data: { order, userProfile } };
    } catch (error: any) {
        console.error("getOrderDetailAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function updateOrderStatusAction(orderId: string, status: string) {
    const supabase = createServerClient();
    if (!supabase) return { success: false, error: "Supabase not configured" };

    try {
        const { error } = await supabase
            .from("orders")
            .update({ status, updated_at: new Date().toISOString() })
            .eq("id", orderId);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error("updateOrderStatusAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function updateOrderTrackingAction(orderId: string, trackingNumber: string) {
    const supabase = createServerClient();
    if (!supabase) return { success: false, error: "Supabase not configured" };

    try {
        const { error } = await supabase
            .from("orders")
            .update({
                tracking_number: trackingNumber,
                status: "shipped",
                updated_at: new Date().toISOString()
            })
            .eq("id", orderId);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error("updateOrderTrackingAction Error:", error);
        return { success: false, error: error.message };
    }
}
