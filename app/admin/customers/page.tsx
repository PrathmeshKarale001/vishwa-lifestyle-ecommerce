"use client";

import { useState, useEffect } from "react";
import {
    Search,
    Users,
    Mail,
    Calendar,
    ShoppingBag,
    IndianRupee,
    Loader2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isAdmin } from "@/lib/admin";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Customer {
    id: string;
    full_name?: string;
    email?: string; // Might need to fetch from auth or if stored in profile
    created_at: string;
    orders: {
        id: string;
        total: number;
        status: string;
    }[];
}

export default function CustomersPage() {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const supabase = createClient();

    useEffect(() => {
        checkAdminAndLoad();
    }, []);

    const checkAdminAndLoad = async () => {
        const userIsAdmin = await isAdmin();
        if (!userIsAdmin) {
            router.push("/");
            return;
        }
        await loadCustomers();
    };

    const loadCustomers = async () => {
        setLoading(true);
        try {
            // Fetch profiles with orders
            // Note: This relies on a foreign key relationship between profiles and orders
            // If none exists, we might need manual aggregation
            const { data, error } = await supabase
                .from("profiles")
                .select(`
          id,
          full_name,
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

            setCustomers(data || []);
        } catch (error) {
            console.error("Error loading customers:", error);
            toast.error("Failed to load customers");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
        }).format(price);
    };

    const filteredCustomers = customers.filter(customer =>
        (customer.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (customer.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-serif font-bold">Customers</h1>
                <p className="text-foreground-muted">View registered users and their order history.</p>
            </div>

            {/* Filter */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-gold/50"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100 uppercase text-xs text-gray-500 font-medium font-mono">
                            <tr>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Join Date</th>
                                <th className="px-6 py-4">Orders</th>
                                <th className="px-6 py-4">Total Spent</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Loading customers...
                                    </td>
                                </tr>
                            ) : filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        No customers found.
                                    </td>
                                </tr>
                            ) : (
                                filteredCustomers.map((customer) => {
                                    const totalSpent = customer.orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
                                    const validOrders = customer.orders?.length || 0;

                                    return (
                                        <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-accent-gold/10 flex items-center justify-center text-accent-gold font-bold">
                                                        {(customer.full_name?.[0] || "U").toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{customer.full_name || "Unknown User"}</p>
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                            <Mail size={12} />
                                                            {customer.email || "No email"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar size={14} />
                                                    {formatDate(customer.created_at)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <ShoppingBag size={14} className="text-gray-400" />
                                                    <span className="font-medium">{validOrders}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono font-medium text-gray-900">
                                                {formatPrice(totalSpent)}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
