"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
    Search,
    Filter,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Loader2,
    RefreshCw,
    ShoppingBag
} from "lucide-react";
import { getProducts } from "@/lib/sanity";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface InventoryItem {
    id: string; // Sanity ID
    name: string;
    sku?: string;
    image?: string;
    currentStock: number;
    lowStockThreshold: number;
    isTracked: boolean;
    status: "in_stock" | "low_stock" | "out_of_stock";
    category?: string;
    updatedAt?: string;
}

export default function InventoryPage() {
    const router = useRouter();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState<"all" | "low_stock" | "out_of_stock">("all");
    const [savingId, setSavingId] = useState<string | null>(null);

    useEffect(() => {
        checkAdminAndLoad();
    }, []);

    const checkAdminAndLoad = async () => {
        // Middleware handles protection.
        await loadInventory();
    };

    const loadInventory = async () => {
        setLoading(true);
        try {
            // 1. Fetch all products from Sanity
            const sanityProducts = await getProducts();

            // 2. Fetch inventory data from Supabase via server action
            const { getInventoryAction } = await import("@/app/actions/inventory");
            const result = await getInventoryAction();

            if (!result.success) throw new Error(result.error);
            const inventoryData = result.data || [];

            // 3. Merge data
            const mergedItems: InventoryItem[] = sanityProducts.map((product: any) => {
                const inventoryRecord = inventoryData.find((r: any) => r.product_id === product._id);

                const isTracked = inventoryRecord?.is_tracked ?? false;
                const currentStock = inventoryRecord?.quantity ?? 0;
                const lowStockThreshold = inventoryRecord?.low_stock_threshold ?? 5;

                let status: InventoryItem["status"] = "in_stock";
                if (isTracked) {
                    if (currentStock === 0) status = "out_of_stock";
                    else if (currentStock <= lowStockThreshold) status = "low_stock";
                }

                return {
                    id: product._id,
                    name: product.name,
                    sku: product.sku || "N/A",
                    image: product.image,
                    currentStock,
                    lowStockThreshold,
                    isTracked,
                    status,
                    category: product.category,
                    updatedAt: inventoryRecord?.last_updated_at
                };
            });

            setItems(mergedItems);
        } catch (error) {
            console.error("Error loading inventory:", error);
            toast.error("Failed to load inventory data");
        } finally {
            setLoading(false);
        }
    };

    const updateStock = async (id: string, newQuantity: number) => {
        setSavingId(id);
        try {
            // Optimistic local update
            setItems(prev => prev.map(item => {
                if (item.id === id) {
                    let status: InventoryItem["status"] = "in_stock";
                    if (newQuantity === 0) status = "out_of_stock";
                    else if (newQuantity <= item.lowStockThreshold) status = "low_stock";
                    return { ...item, currentStock: newQuantity, status, isTracked: true };
                }
                return item;
            }));

            // Update via server action
            const { updateInventoryAction } = await import("@/app/actions/inventory");
            const result = await updateInventoryAction(id, newQuantity);

            if (!result.success) throw new Error(result.error);
            toast.success("Stock updated");
        } catch (error) {
            console.error("Error updating stock:", error);
            toast.error("Failed to update stock");
            // Re-fetch to sync
            loadInventory();
        } finally {
            setSavingId(null);
        }
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku?.toLowerCase().includes(searchTerm.toLowerCase());

        if (filter === "all") return matchesSearch;
        return matchesSearch && item.status === filter;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-bold">Inventory Management</h1>
                    <p className="text-foreground-muted">Track and update product stock levels.</p>
                </div>
                <button
                    onClick={loadInventory}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 text-sm"
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    Sync Data
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search products by name or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-gold/50"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={20} className="text-gray-400" />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="pl-3 pr-8 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-gold/50 bg-white"
                    >
                        <option value="all">All Items</option>
                        <option value="low_stock">Low Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100 uppercase text-xs text-gray-500 font-medium font-mono">
                            <tr>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Current Stock</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-sans">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Loading inventory...
                                    </td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        No products found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 relative rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                                                    {item.image ? (
                                                        <Image
                                                            src={item.image}
                                                            alt={item.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <ShoppingBag size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 line-clamp-1">{item.name}</p>
                                                    <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {!item.isTracked && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                    <CheckCircle size={12} /> Untracked (In Stock)
                                                </span>
                                            )}
                                            {item.isTracked && item.status === "in_stock" && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                                    <CheckCircle size={12} /> In Stock
                                                </span>
                                            )}
                                            {item.isTracked && item.status === "low_stock" && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
                                                    <AlertTriangle size={12} /> Low Stock
                                                </span>
                                            )}
                                            {item.isTracked && item.status === "out_of_stock" && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
                                                    <XCircle size={12} /> Out of Stock
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 font-mono">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={item.currentStock}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value);
                                                        if (!isNaN(val)) updateStock(item.id, val);
                                                    }}
                                                    className="w-24 px-3 py-1.5 border border-gray-200 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-accent-gold/50"
                                                />
                                                {savingId === item.id && (
                                                    <span className="text-xs text-accent-gold animate-pulse">Saving...</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {/* Future: Add 'Edit Threshold' button */}
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
