"use client";

import { useState, useEffect } from "react";
import {
    Tag,
    Plus,
    Trash2,
    CheckCircle,
    XCircle,
    Loader2,
    Calendar,
    Percent,
    IndianRupee,
    RefreshCw,
    Edit,
    AlertTriangle
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isAdmin } from "@/lib/admin";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getCategories } from "@/lib/sanity";
import { createCouponAction, deleteCouponAction, toggleCouponStatusAction, updateCouponAction } from "@/app/actions/coupons";

interface Coupon {
    id: string;
    code: string;
    name: string;
    type: "percentage" | "fixed";
    value: number;
    min_order_amount?: number;
    valid_until?: string;
    usage_limit?: number;
    used_count: number;
    is_active: boolean;
    created_at: string;
    applicable_to: "all" | "products" | "categories";
    applicable_ids?: string[];
}

interface Category {
    slug: string;
    name: string;
}

export default function CouponsPage() {
    const router = useRouter();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const supabase = createClient();

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        type: "percentage",
        value: 0,
        min_order_value: 0,
        valid_until: "",
        usage_limit: 100,
        applicable_to: "all" as "all" | "products" | "categories",
        applicable_ids: [] as string[]
    });

    useEffect(() => {
        checkAdminAndLoad();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const cats = await getCategories();
            setCategories(cats);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const checkAdminAndLoad = async () => {
        const userIsAdmin = await isAdmin();
        if (!userIsAdmin) {
            router.push("/");
            return;
        }
        await loadCoupons();
    };

    const loadCoupons = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("coupons")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setCoupons(data || []);
        } catch (error) {
            console.error("Error loading coupons:", error);
            toast.error("Failed to load coupons");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            code: "",
            type: "percentage",
            value: 0,
            min_order_value: 0,
            valid_until: "",
            usage_limit: 100,
            applicable_to: "all",
            applicable_ids: []
        });
        setEditingCoupon(null);
        setIsCreating(false);
    };

    const handleEdit = (coupon: Coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            name: coupon.name || "",
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            min_order_value: coupon.min_order_amount || 0,
            valid_until: coupon.valid_until ? new Date(coupon.valid_until).toISOString().split('T')[0] : "",
            usage_limit: coupon.usage_limit || 100,
            applicable_to: coupon.applicable_to || "all",
            applicable_ids: coupon.applicable_ids || []
        });
        setIsCreating(true);
    };

    const handleDelete = async (id: string, code: string) => {
        if (!window.confirm(`Are you sure you want to delete coupon "${code}"? This cannot be undone.`)) return;

        try {
            const res = await deleteCouponAction(id);
            if (!res.success) throw new Error(res.error);

            toast.success("Coupon deleted successfully");
            setCoupons(prev => prev.filter(c => c.id !== id));
        } catch (error: any) {
            toast.error(error.message || "Failed to delete coupon");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.code || formData.value <= 0 || !formData.name) {
            toast.error("Please fill in all required fields (Name, Code, Value)");
            return;
        }

        const couponData: any = {
            name: formData.name,
            code: formData.code.toUpperCase().replace(/\s/g, ''),
            type: formData.type,
            value: formData.value,
            min_order_amount: formData.min_order_value || 0,
            valid_until: formData.valid_until || null,
            usage_limit: formData.usage_limit || null,
            applicable_to: formData.applicable_to,
            applicable_ids: formData.applicable_to === 'all' ? [] : formData.applicable_ids,
            is_active: true,
            valid_from: new Date().toISOString(),
            user_limit: 1, // Default user limit
            usage_count: 0
        };

        try {
            if (editingCoupon) {
                // Remove readonly fields for update if strictly typed (though Partial handles it)
                const res = await updateCouponAction(editingCoupon.id, couponData);
                if (!res.success) throw new Error(res.error);
                toast.success("Coupon updated successfully");
            } else {
                const res = await createCouponAction(couponData);
                if (!res.success) throw new Error(res.error);
                toast.success("Coupon created successfully");
            }

            resetForm();
            loadCoupons();
        } catch (error: any) {
            toast.error(error.message || `Failed to ${editingCoupon ? 'update' : 'create'} coupon`);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            // Optimistic update
            setCoupons(prev => prev.map(c =>
                c.id === id ? { ...c, is_active: !currentStatus } : c
            ));

            const res = await toggleCouponStatusAction(id, !currentStatus);
            if (!res.success) {
                // Revert if failed
                setCoupons(prev => prev.map(c =>
                    c.id === id ? { ...c, is_active: currentStatus } : c
                ));
                throw new Error(res.error);
            }

            toast.success(`Coupon ${!currentStatus ? 'activated' : 'deactivated'}`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "No Expiry";
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-bold">Coupons</h1>
                    <p className="text-foreground-muted">Manage discount codes and promotions.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsCreating(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 text-sm font-medium shadow-sm transition-colors"
                >
                    <Plus size={16} />
                    Create Coupon
                </button>
            </div>

            {isCreating && (
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 mb-6 animate-in slide-in-from-top-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</h3>
                        <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                            <XCircle size={20} />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Coupon Name</label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 border rounded-md"
                                placeholder="Summer Sale"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Code</label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 border rounded-md uppercase"
                                placeholder="SUMMER25"
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s/g, '') })}
                                disabled={!!editingCoupon} // Code shouldn't change
                            />
                            {editingCoupon && <p className="text-xs text-gray-500 mt-1">Code cannot be changed.</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Discount Type</label>
                            <select
                                className="w-full px-3 py-2 border rounded-md"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (₹)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Value</label>
                            <input
                                type="number"
                                required
                                className="w-full px-3 py-2 border rounded-md"
                                min="1"
                                value={formData.value || ''}
                                onChange={e => setFormData({ ...formData, value: e.target.value ? parseInt(e.target.value) : 0 })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Min Order Value</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 border rounded-md"
                                min="0"
                                value={formData.min_order_value || ''}
                                onChange={e => setFormData({ ...formData, min_order_value: e.target.value ? parseInt(e.target.value) : 0 })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Valid Until</label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 border rounded-md"
                                value={formData.valid_until}
                                onChange={e => setFormData({ ...formData, valid_until: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Usage Limit</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 border rounded-md"
                                value={formData.usage_limit || ''}
                                onChange={e => setFormData({ ...formData, usage_limit: e.target.value ? parseInt(e.target.value) : 0 })}
                            />
                        </div>

                        {/* Applicable To Logic */}
                        <div className="md:col-span-2 border-t pt-4 mt-2">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Restrictions</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Applicable To</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-md"
                                        value={formData.applicable_to}
                                        onChange={e => setFormData({ ...formData, applicable_to: e.target.value as any, applicable_ids: [] })}
                                    >
                                        <option value="all">All Products</option>
                                        <option value="categories">Specific Categories</option>
                                    </select>
                                </div>

                                {formData.applicable_to === 'categories' && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Select Categories</label>
                                        <div className="p-3 border rounded-md max-h-40 overflow-y-auto bg-gray-50">
                                            {categories.length === 0 && <p className="text-xs text-gray-500">Loading categories...</p>}
                                            {categories.map(cat => (
                                                <div key={cat.slug} className="flex items-center gap-2 mb-1">
                                                    <input
                                                        type="checkbox"
                                                        id={`cat-${cat.slug}`}
                                                        checked={formData.applicable_ids.includes(cat.slug)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setFormData(prev => ({ ...prev, applicable_ids: [...prev.applicable_ids, cat.slug] }));
                                                            } else {
                                                                setFormData(prev => ({ ...prev, applicable_ids: prev.applicable_ids.filter(id => id !== cat.slug) }));
                                                            }
                                                        }}
                                                        className="rounded border-gray-300 text-black focus:ring-black"
                                                    />
                                                    <label htmlFor={`cat-${cat.slug}`} className="text-sm">{cat.name}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>


                        <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                            >
                                {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100 uppercase text-xs text-gray-500 font-medium font-mono">
                            <tr>
                                <th className="px-6 py-4">Code</th>
                                <th className="px-6 py-4">Discount</th>
                                <th className="px-6 py-4">Scope</th>
                                <th className="px-6 py-4">Usage</th>
                                <th className="px-6 py-4">Valid Until</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Loading coupons...
                                    </td>
                                </tr>
                            ) : coupons.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No active coupons found. Create one to get started.
                                    </td>
                                </tr>
                            ) : (
                                coupons.map((coupon) => (
                                    <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-mono font-bold text-lg text-accent-gold">{coupon.code}</div>
                                            {coupon.name && <div className="text-sm text-gray-500 font-medium">{coupon.name}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 font-medium">
                                                {coupon.type === "percentage" ? (
                                                    <><Percent size={14} /> {coupon.value}% OFF</>
                                                ) : (
                                                    <><IndianRupee size={14} /> {coupon.value} OFF</>
                                                )}
                                            </div>
                                            {coupon.min_order_amount ? (
                                                <div className="text-xs text-gray-500 mt-0.5">Min: ₹{coupon.min_order_amount}</div>
                                            ) : null}
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            {coupon.applicable_to === 'all' ? (
                                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">All Store</span>
                                            ) : coupon.applicable_to === 'categories' ? (
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-medium text-gray-700">Categories:</span>
                                                    <div className="flex flex-wrap gap-1">
                                                        {coupon.applicable_ids?.map(id => (
                                                            <span key={id} className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">
                                                                {id}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span>Specific Products</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{coupon.used_count} used</span>
                                                {coupon.usage_limit && (
                                                    <span className="text-xs text-gray-500">of {coupon.usage_limit} limit</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={14} />
                                                {formatDate(coupon.valid_until)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => toggleStatus(coupon.id, coupon.is_active)}
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${coupon.is_active
                                                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                    }`}
                                            >
                                                {coupon.is_active ? (
                                                    <><CheckCircle size={12} /> Active</>
                                                ) : (
                                                    <><XCircle size={12} /> Inactive</>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(coupon)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="Edit Coupon"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(coupon.id, coupon.code)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete Coupon"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
