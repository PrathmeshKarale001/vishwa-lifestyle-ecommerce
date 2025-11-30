"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Package,
  Users,
  ShoppingBag,
  TrendingUp,
  IndianRupee,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ArrowRight,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShoppingCart,
  Tag,
  AlertTriangle,
  Percent,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isAdmin, getAdminUser, logAdminAction } from "@/lib/admin";
import toast from "react-hot-toast";
import { log } from "@/lib/logger";

interface DashboardStats {
  totalOrders: number;
  todayOrders: number;
  todayRevenue: number;
  totalRevenue: number;
  pendingOrders: number;
  totalCustomers: number;
  newCustomersToday: number;
  abandonedCarts: number;
  recoveredCarts: number;
  activeCoupons: number;
  lowStockItems: number;
  conversionRate: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  total: number;
  shipping_address: {
    name: string;
    city: string;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    checkAdminAndFetchData();
  }, []);

  const checkAdminAndFetchData = async () => {
    if (!supabase) {
      setLoading(false);
      toast.error("Supabase not configured");
      router.push("/");
      return;
    }

    try {
      // First check: Is user logged in?
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast.error("Please log in to access admin panel");
        router.push("/auth/login?redirect=" + encodeURIComponent("/admin"));
        return;
      }

      // Second check: Is user an admin?
      const userIsAdmin = await isAdmin();
      
      if (!userIsAdmin) {
        toast.error("Access denied. Admin privileges required.");
        router.push("/");
        return;
      }

      // User is authorized - log access and fetch data
      await logAdminAction('view_dashboard', 'admin', undefined, {
        page: 'dashboard',
      });

      setIsAuthorized(true);
      await fetchDashboardData();
      } catch (error) {
        log.error("Admin access verification error", error);
        toast.error("Unable to verify access. Please try again.");
        router.push("/");
      } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    if (!supabase) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch orders stats
      const { data: allOrders } = await supabase
        .from("orders")
        .select("id, total, status, created_at");

      const { data: todayOrdersData } = await supabase
        .from("orders")
        .select("id, total")
        .gte("created_at", today.toISOString());

      const { data: pendingOrdersData } = await supabase
        .from("orders")
        .select("id")
        .eq("status", "processing");

      // Fetch customers stats
      const { data: allCustomers } = await supabase
        .from("profiles")
        .select("id, created_at");

      const { data: todayCustomers } = await supabase
        .from("profiles")
        .select("id")
        .gte("created_at", today.toISOString());

      // Fetch recent orders
      const { data: recent } = await supabase
        .from("orders")
        .select("id, order_number, created_at, status, total, shipping_address")
        .order("created_at", { ascending: false })
        .limit(10);

      // Fetch abandoned carts
      const { data: abandonedCartsData } = await supabase
        .from("abandoned_carts")
        .select("id, status")
        .eq("status", "abandoned");

      const { data: recoveredCartsData } = await supabase
        .from("abandoned_carts")
        .select("id")
        .eq("status", "recovered");

      // Fetch active coupons
      const { data: activeCouponsData } = await supabase
        .from("coupons")
        .select("id")
        .eq("is_active", true)
        .or("valid_until.is.null,valid_until.gt." + new Date().toISOString());

      // Fetch low stock items (using RPC or filter manually)
      const { data: allInventory } = await supabase
        .from("inventory")
        .select("id, quantity, low_stock_threshold")
        .eq("is_tracked", true);
      
      const lowStockData = allInventory?.filter(
        (item) => item.quantity <= item.low_stock_threshold
      ) || [];

      // Calculate stats
      const totalRevenue = allOrders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
      const todayRevenue = todayOrdersData?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;

      // Calculate conversion rate (orders / (orders + abandoned carts))
      const totalCarts = (allOrders?.length || 0) + (abandonedCartsData?.length || 0);
      const conversionRate = totalCarts > 0 
        ? ((allOrders?.length || 0) / totalCarts) * 100 
        : 0;

      setStats({
        totalOrders: allOrders?.length || 0,
        todayOrders: todayOrdersData?.length || 0,
        todayRevenue,
        totalRevenue,
        pendingOrders: pendingOrdersData?.length || 0,
        totalCustomers: allCustomers?.length || 0,
        newCustomersToday: todayCustomers?.length || 0,
        abandonedCarts: abandonedCartsData?.length || 0,
        recoveredCarts: recoveredCartsData?.length || 0,
        activeCoupons: activeCouponsData?.length || 0,
        lowStockItems: lowStockData?.length || 0,
        conversionRate: Math.round(conversionRate * 10) / 10,
      });

      setRecentOrders(recent || []);
    } catch (error) {
      log.error("Error fetching dashboard data", error);
      toast.error("Unable to load dashboard data. Please refresh.");
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
      hour: "2-digit",
      minute: "2-digit",
    });
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

  if (!supabase) {
    return (
      <main className="min-h-screen bg-gray-50 pt-24">
        <div className="container mx-auto px-6 py-12 text-center">
          <h1 className="text-2xl font-serif mb-4">Admin Dashboard</h1>
          <p className="text-foreground-muted">Supabase not configured. Please set up environment variables.</p>
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
            <h1 className="text-3xl font-serif mb-2">Admin Dashboard</h1>
            <p className="text-foreground-muted">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={() => fetchDashboardData()}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-sm hover:bg-gray-50"
            >
              <RefreshCw size={16} /> Refresh
            </button>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-sm hover:bg-gray-50"
            >
              Supabase <ExternalLink size={14} />
            </a>
            <Link
              href="/studio"
              className="flex items-center gap-2 px-4 py-2 bg-foreground text-white text-sm hover:bg-accent-gold"
            >
              Manage Products <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-foreground-muted text-sm">Today's Revenue</span>
              <div className="p-2 bg-green-50 rounded-lg">
                <IndianRupee size={20} className="text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold">{formatPrice(stats?.todayRevenue || 0)}</p>
            <p className="text-xs text-foreground-muted mt-1">
              {stats?.todayOrders || 0} orders today
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-foreground-muted text-sm">Total Revenue</span>
              <div className="p-2 bg-blue-50 rounded-lg">
                <TrendingUp size={20} className="text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold">{formatPrice(stats?.totalRevenue || 0)}</p>
            <p className="text-xs text-foreground-muted mt-1">
              {stats?.totalOrders || 0} total orders
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-foreground-muted text-sm">Pending Orders</span>
              <div className="p-2 bg-orange-50 rounded-lg">
                <Package size={20} className="text-orange-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold">{stats?.pendingOrders || 0}</p>
            <p className="text-xs text-foreground-muted mt-1">
              Awaiting shipment
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-foreground-muted text-sm">Customers</span>
              <div className="p-2 bg-purple-50 rounded-lg">
                <Users size={20} className="text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold">{stats?.totalCustomers || 0}</p>
            <p className="text-xs text-foreground-muted mt-1">
              +{stats?.newCustomersToday || 0} today
            </p>
          </motion.div>
        </div>

        {/* Additional Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-foreground-muted text-sm">Abandoned Carts</span>
              <div className="p-2 bg-red-50 rounded-lg">
                <ShoppingCart size={20} className="text-red-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold">{stats?.abandonedCarts || 0}</p>
            <p className="text-xs text-foreground-muted mt-1">
              {stats?.recoveredCarts || 0} recovered
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-foreground-muted text-sm">Active Coupons</span>
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Tag size={20} className="text-yellow-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold">{stats?.activeCoupons || 0}</p>
            <p className="text-xs text-foreground-muted mt-1">
              Discount codes available
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-foreground-muted text-sm">Low Stock</span>
              <div className="p-2 bg-orange-50 rounded-lg">
                <AlertTriangle size={20} className="text-orange-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold">{stats?.lowStockItems || 0}</p>
            <p className="text-xs text-foreground-muted mt-1">
              Items need restocking
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-foreground-muted text-sm">Conversion Rate</span>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Percent size={20} className="text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold">{stats?.conversionRate || 0}%</p>
            <p className="text-xs text-foreground-muted mt-1">
              Cart to order ratio
            </p>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-serif text-xl">Recent Orders</h2>
              <Link
                href="/admin/orders"
                className="text-sm text-accent-gold hover:underline flex items-center gap-1"
              >
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentOrders.length === 0 ? (
                <div className="p-12 text-center">
                  <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-foreground-muted">No orders yet</p>
                </div>
              ) : (
                recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {order.order_number || `#${order.id.slice(0, 8)}`}
                        </p>
                        <p className="text-xs text-foreground-muted">
                          {order.shipping_address?.name} • {order.shipping_address?.city}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(order.total)}</p>
                      <p className="text-xs text-foreground-muted">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-serif text-xl mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  href="/admin/orders"
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Package size={20} className="text-foreground-muted" />
                  <span className="text-sm">Manage Orders</span>
                </Link>
                <Link
                  href="/studio"
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ShoppingBag size={20} className="text-foreground-muted" />
                  <span className="text-sm">Add/Edit Products</span>
                </Link>
                {stats && stats.abandonedCarts > 0 && (
                  <Link
                    href="/admin/orders?filter=abandoned"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ShoppingCart size={20} className="text-foreground-muted" />
                    <span className="text-sm">Abandoned Carts ({stats.abandonedCarts})</span>
                  </Link>
                )}
                {stats && stats.lowStockItems > 0 && (
                  <Link
                    href="/admin/inventory?filter=low_stock"
                    className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors border border-orange-200"
                  >
                    <AlertTriangle size={20} className="text-orange-600" />
                    <span className="text-sm">Low Stock ({stats.lowStockItems})</span>
                  </Link>
                )}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Users size={20} className="text-foreground-muted" />
                  <span className="text-sm">View Customers</span>
                  <ExternalLink size={14} className="ml-auto text-foreground-muted" />
                </a>
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-gradient-to-br from-accent-gold/10 to-accent-gold/5 rounded-lg p-6 border border-accent-gold/20">
              <h3 className="font-serif text-lg mb-2">Need Help?</h3>
              <p className="text-sm text-foreground-muted mb-4">
                Check the admin guide for detailed instructions on managing your store.
              </p>
              <Link
                href="/CHECKOUT_AND_ADMIN_GUIDE.md"
                className="text-sm text-accent-gold hover:underline flex items-center gap-1"
              >
                View Guide <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

