"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Package,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Loader2,
  Download,
  RefreshCw,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { log } from "@/lib/logger";

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  total: number;
  items: any[];
  shipping_address: {
    name: string;
    phone: string;
    city: string;
    state: string;
  };
  payment_id?: string;
}

const statusOptions = [
  { value: "all", label: "All Orders" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    // Middleware handles strict auth/admin checks.
    // Client-side, we just proceed. RLS will protect data if auth is missing.
    setIsAuthorized(true);
    await fetchOrders();
    setLoading(false);
  };

  const fetchOrders = async () => {
    try {
      const { getOrdersAction } = await import("@/app/actions/orders");
      const result = await getOrdersAction();

      if (!result.success) throw new Error(result.error);
      setOrders(result.data || []);
    } catch (error) {
      log.error("Error fetching orders", error);
      toast.error("Unable to load orders. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!supabase) return;

    setUpdatingId(orderId);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (error) throw error;

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      log.error("Error updating order", error, { orderId, status: newStatus });
      toast.error("Unable to update order. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "text-green-600 bg-green-50 border-green-200";
      case "processing":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "shipped":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "cancelled":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return <CheckCircle size={14} />;
      case "processing":
        return <Clock size={14} />;
      case "shipped":
        return <Truck size={14} />;
      case "cancelled":
        return <XCircle size={14} />;
      default:
        return <Package size={14} />;
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shipping_address?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = ["Order Number", "Date", "Customer", "City", "Total", "Status"];
    const rows = filteredOrders.map((o) => [
      o.order_number || o.id.slice(0, 8),
      formatDate(o.created_at),
      o.shipping_address?.name || "N/A",
      o.shipping_address?.city || "N/A",
      o.total,
      o.status,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent-gold mx-auto mb-4" />
          <p className="text-foreground-muted">Verifying access...</p>
        </div>
      </main>
    );
  }

  if (!isAuthorized) {
    return (
      <main className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-serif mb-2">Access Denied</h1>
          <p className="text-foreground-muted mb-4">You don't have permission to access this page.</p>
          <Link href="/" className="text-accent-gold hover:underline">
            Return to Homepage
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <nav className="text-sm text-foreground-muted mb-2">
              <Link href="/admin" className="hover:text-foreground">
                Admin
              </Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">Orders</span>
            </nav>
            <h1 className="text-3xl font-serif">Order Management</h1>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={fetchOrders}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-sm hover:bg-gray-50"
            >
              <RefreshCw size={16} /> Refresh
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-foreground text-white text-sm hover:bg-accent-gold"
            >
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order number or customer name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 focus:outline-none focus:border-accent-gold"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-200 px-4 py-2 pr-10 focus:outline-none focus:border-accent-gold"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100 text-sm">
            <span className="text-foreground-muted">
              Showing {filteredOrders.length} of {orders.length} orders
            </span>
            <span className="text-foreground-muted">•</span>
            <span className="text-foreground-muted">
              Total: {formatPrice(filteredOrders.reduce((sum, o) => sum + o.total, 0))}
            </span>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-foreground-muted">
                    Order
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-foreground-muted">
                    Customer
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-foreground-muted">
                    Items
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-foreground-muted">
                    Total
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-foreground-muted">
                    Status
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-foreground-muted">
                    Date
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-foreground-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center">
                      <Package size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-foreground-muted">No orders found</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-medium text-accent-gold hover:underline"
                        >
                          {order.order_number || `#${order.id.slice(0, 8)}`}
                        </Link>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-sm">
                            {order.shipping_address?.name || "N/A"}
                          </p>
                          <p className="text-xs text-foreground-muted">
                            {order.shipping_address?.city}, {order.shipping_address?.state}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        {order.items?.length || 0} items
                      </td>
                      <td className="p-4 font-medium">
                        {formatPrice(order.total)}
                      </td>
                      <td className="p-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                          className={`text-xs px-3 py-1.5 rounded-full border cursor-pointer ${getStatusColor(
                            order.status
                          )}`}
                        >
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-4 text-sm text-foreground-muted">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-foreground-muted hover:text-foreground"
                        >
                          <ChevronRight size={20} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

