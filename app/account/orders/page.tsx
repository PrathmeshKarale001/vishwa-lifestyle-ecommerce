"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Package, ChevronRight, Search, Loader2 } from "lucide-react";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { log } from "@/lib/logger";
import EmptyState from "@/components/EmptyState";
import { ShoppingBag } from "lucide-react";
import { OrdersPageSkeleton } from "@/components/AccountSkeleton";

const statusFilters = ["All", "Processing", "Shipped", "Delivered", "Cancelled"];

interface Order {
  id: string;
  order_number?: string;
  created_at: string;
  status: string;
  total: number;
  items: any[];
  tracking_number?: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const fetchOrders = async () => {
      if (!supabase) {
        toast.error("Supabase not configured");
        setLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push("/auth/login");
          return;
        }

        const { data: ordersData, error } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (ordersData) {
          setOrders(ordersData);
        }
      } catch (error: any) {
        log.error("Error fetching orders", error);
        if (error.code !== "PGRST116") { // Table doesn't exist error
          toast.error("Unable to load orders. Please refresh the page.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "text-green-600 bg-green-50";
      case "processing":
        return "text-blue-600 bg-blue-50";
      case "shipped":
        return "text-purple-600 bg-purple-50";
      case "cancelled":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredOrders = orders.filter((order) => {
    const orderId = order.order_number || order.id;
    const matchesSearch = orderId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <main className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Breadcrumb */}
          <nav className="text-sm text-foreground-muted mb-6">
            <Link href="/account" className="hover:text-foreground">
              Account
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Orders</span>
          </nav>

          <h1 className="text-3xl font-serif mb-8">My Orders</h1>

          {loading ? (
            <OrdersPageSkeleton />
          ) : (
            <>
              {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order number..."
                className="w-full border border-gray-200 pl-12 pr-4 py-3 focus:outline-none focus:border-accent-gold"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {statusFilters.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 text-sm whitespace-nowrap transition-colors ${
                    statusFilter === status
                      ? "bg-foreground text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length > 0 ? (
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-background-alt p-6"
                >
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 pb-4 border-b border-gray-200">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-serif text-lg">
                          Order #{order.order_number || order.id.slice(0, 8)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                          {order.status || "Pending"}
                        </span>
                      </div>
                      <span className="text-sm text-foreground-muted">{formatDate(order.created_at)}</span>
                    </div>
                    <div className="text-right mt-4 md:mt-0">
                      <span className="font-medium">{formatPrice(order.total)}</span>
                      {order.tracking_number && (
                        <p className="text-xs text-foreground-muted mt-1">
                          Tracking: {order.tracking_number}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  {order.items && Array.isArray(order.items) && order.items.length > 0 ? (
                    <div className="space-y-4">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-4">
                          {item.image && (
                            <div className="w-16 h-16 bg-white overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.name || "Product"}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.name || "Product"}</p>
                            <p className="text-xs text-foreground-muted">
                              Qty: {item.quantity || 1} × {formatPrice(item.price || 0)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-foreground-muted">No items found</p>
                  )}

                  {/* Order Actions */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="text-sm text-accent-gold hover:underline flex items-center gap-1"
                    >
                      View Details <ChevronRight size={14} />
                    </Link>
                    {order.status === "Delivered" && (
                      <button className="text-sm border border-gray-200 px-4 py-2 hover:bg-white transition-colors">
                        Buy Again
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={ShoppingBag}
              title={searchQuery || statusFilter !== "All" ? "No orders found" : "No orders yet"}
              description={
                searchQuery || statusFilter !== "All"
                  ? "Try adjusting your search or filters to find your orders."
                  : "Start shopping to see your orders here. Browse our collection of ritual essentials and lifestyle products."
              }
              action={
                searchQuery || statusFilter !== "All"
                  ? undefined
                  : {
                      label: "Start Shopping",
                      href: "/shop",
                    }
              }
            />
          )}
            </>
          )}
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}

