'use server';

import { createCoupon, updateCoupon, deleteCoupon, Coupon } from "@/lib/coupons";
import { revalidatePath } from "next/cache";

export async function createCouponAction(data: Omit<Coupon, 'id' | 'created_at' | 'updated_at' | 'usage_count'>) {
    try {
        console.log("createCouponAction: Received data", data);
        const result = await createCoupon(data);
        if (!result) throw new Error("Failed to create coupon");
        revalidatePath('/admin/coupons');
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateCouponAction(id: string, data: Partial<Coupon>) {
    try {
        const result = await updateCoupon(id, data);
        if (!result) throw new Error("Failed to update coupon");
        revalidatePath('/admin/coupons');
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteCouponAction(id: string) {
    try {
        const success = await deleteCoupon(id);
        if (!success) throw new Error("Failed to delete coupon");
        revalidatePath('/admin/coupons');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function toggleCouponStatusAction(id: string, isActive: boolean) {
    try {
        const result = await updateCoupon(id, { is_active: isActive });
        if (!result) throw new Error("Failed to update status");
        revalidatePath('/admin/coupons');
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getCouponsAction() {
    try {
        const { getAllCoupons } = await import("@/lib/coupons");
        const result = await getAllCoupons();
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
