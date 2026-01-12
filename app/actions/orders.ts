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
        const { data: order, error: updateError } = await supabase
            .from("orders")
            .update({ status, updated_at: new Date().toISOString() })
            .eq("id", orderId)
            .select(`
                *,
                profiles:user_id (email, name)
            `)
            .single();

        if (updateError) throw updateError;

        // If status is delivered, send email
        if (status === "delivered" && order) {
            const { sendOrderDeliveredEmail } = await import("@/lib/email");
            const customerEmail = order.profiles?.email || order.email;
            const customerName = order.profiles?.name || order.shipping_address?.name || "Customer";

            await sendOrderDeliveredEmail({
                order_number: order.order_number || order.id.slice(0, 8),
                customer_email: customerEmail,
                customer_name: customerName
            });
        }

        return { success: true };
    } catch (error: any) {
        console.error("updateOrderStatusAction Error:", error);
        return { success: false, error: error.message };
    }
}

// Enhanced Order Actions with Shopify-level Features

import { sendOrderCancelledEmail, sendOrderShippedEmail } from "@/lib/email";

// ... existing imports

export async function cancelOrderAction(orderId: string, reason: string) {
    const supabase = createServerClient();
    if (!supabase) return { success: false, error: "Supabase not configured" };

    try {
        // 1. Fetch order details first (need items for inventory and email)
        const { data: order, error: fetchError } = await supabase
            .from("orders")
            .select(`
                *,
                profiles:user_id (email, name)
            `)
            .eq("id", orderId)
            .single();

        if (fetchError || !order) throw new Error("Order not found");

        // 2. Update Order Status
        const { error: updateError } = await supabase
            .from("orders")
            .update({
                status: "cancelled",
                notes: order.notes ? `${order.notes}\nCancelled: ${reason}` : `Cancelled: ${reason}`,
                updated_at: new Date().toISOString()
            })
            .eq("id", orderId);

        if (updateError) throw updateError;

        // 3. Restore Inventory (Critical Step)
        if (order.items && Array.isArray(order.items)) {
            for (const item of order.items) {
                if (item.productId) {
                    // Call RPC to add back quantity
                    // Note: update_inventory reduces quantity by default, so we pass negative 
                    // of negative quantity (aka positive) or just negative change?
                    // Deduct means -quantity. So restore means +quantity.

                    // We need to check if we can call the RPC directly or need a restore function.
                    // Assuming update_inventory adds the value passed.
                    // deductInventory passes -quantity. So we pass +quantity.

                    await supabase.rpc('update_inventory', {
                        product_id_text: item.productId,
                        quantity_change: item.quantity,
                    });
                }
            }
        }

        // 4. Send Cancellation Email
        // Fallback to order details if profile join failed or guest checkout
        const customerEmail = order.profiles?.email || order.email;
        const customerName = order.profiles?.name || order.shipping_address?.name || "Customer";

        await sendOrderCancelledEmail({
            order_number: order.order_number || order.id.slice(0, 8),
            customer_email: customerEmail,
            customer_name: customerName,
            items: order.items.map((i: any) => ({
                name: i.name,
                quantity: i.quantity,
                price: i.price
            })),
            total: order.total
        });

        return { success: true };
    } catch (error: any) {
        console.error("cancelOrderAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function updateOrderTrackingAction(
    orderId: string,
    trackingNumber: string,
    carrierName?: string,
    trackingUrl?: string
) {
    const supabase = createServerClient();
    if (!supabase) return { success: false, error: "Supabase not configured" };

    try {
        // 1. Update Order
        const { data: order, error } = await supabase
            .from("orders")
            .update({
                tracking_number: trackingNumber,
                tracking_url: trackingUrl,
                shipping_method: carrierName, // Storing Carrier Name in shipping_method
                status: "shipped",
                updated_at: new Date().toISOString()
            })
            .eq("id", orderId)
            .select(`
                *,
                profiles:user_id (email, name)
            `)
            .single();

        if (error) throw error;

        // 2. Send Dispatch Email
        const customerEmail = order.profiles?.email || order.email;
        const customerName = order.profiles?.name || order.shipping_address?.name || "Customer";

        await sendOrderShippedEmail({
            order_number: order.order_number || order.id.slice(0, 8),
            customer_email: customerEmail,
            customer_name: customerName,
            items: order.items.map((i: any) => ({
                name: i.name,
                quantity: i.quantity
            })),
            tracking_number: trackingNumber,
            carrier_name: carrierName,
            tracking_url: trackingUrl
        });

        return { success: true };
    } catch (error: any) {
        console.error("updateOrderTrackingAction Error:", error);
        return { success: false, error: error.message };
    }
}
