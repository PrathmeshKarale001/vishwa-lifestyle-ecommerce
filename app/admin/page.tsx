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
  Star,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isAdmin, logAdminAction } from "@/lib/admin";
import toast from "react-hot-toast";
import { log } from "@/lib/logger";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

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
  pendingReviews: number;
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

interface ChartData {
  date: string;
  revenue: number;
  orders: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const supabase = createClient();

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
        // toast.error("Please log in to access admin panel"); 
        // Silent redirect to avoid toast spam on fast refresh
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

      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);

      // Fetch all orders with date for chart
      const { data: allOrders } = await supabase
        .from("orders")
        .select("id, total, status, created_at")
        .order("created_at", { ascending: true }); // Fetch oldest first for easy chart data

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

      // Fetch low stock items
      const { data: allInventory } = await supabase
        .from("inventory")
        .select("id, quantity, low_stock_threshold")
        .eq("is_tracked", true);

      const lowStockData = allInventory?.filter(
        (item) => item.quantity <= item.low_stock_threshold
      ) || [];

      // Fetch pending reviews
      const { data: pendingReviewsData } = await supabase
        .from("reviews")
        .select("id")
        .eq("status", "pending");

      // Calculate stats
      const totalRevenue = allOrders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
      const todayRevenue = todayOrdersData?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;

      // Calculate conversion rate
      const totalCarts = (allOrders?.length || 0) + (abandonedCartsData?.length || 0);
      const conversionRate = totalCarts > 0
        ? ((allOrders?.length || 0) / totalCarts) * 100
        : 0;

      // Process Chart Data (Last 7 Days)
      const chartMap = new Map<string, { revenue: number; orders: number }>();

      // Initialize last 7 days with 0
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        chartMap.set(dateStr, { revenue: 0, orders: 0 });
      }

      // Fill with actual data
      allOrders?.forEach(order => {
        const d = new Date(order.created_at);
        if (d >= last7Days) {
          const dateStr = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
          if (chartMap.has(dateStr)) {
            const current = chartMap.get(dateStr)!;
            chartMap.set(dateStr, {
              revenue: current.revenue + (order.total || 0),
              orders: current.orders + 1
            });
          }
        }
      });

      const processedChartData = Array.from(chartMap.entries()).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders
      }));

      setChartData(processedChartData);

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
        pendingReviews: pendingReviewsData?.length || 0,
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
      case "delivered": return "text-green-600 bg-green-50";
      case "processing": return "text-blue-600 bg-blue-50";
      case "shipped": return "text-purple-600 bg-purple-50";
      case "cancelled": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered": return <CheckCircle size={14} />;
      case "processing": return <Clock size={14} />;
      case "shipped": return <Truck size={14} />;
      case "cancelled": return <XCircle size={14} />;
      default: return <Package size={14} />;
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent-gold mx-auto mb-4" />
          <p className="text-foreground-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-serif mb-2">Access Denied</h1>
          <p className="text-foreground-muted mb-4">You don't have permission to access this page.</p>
          <Link href="/" className="text-accent-gold hover:underline">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif mb-2">Dashboard</h1>
          <p className="text-foreground-muted">Welcome back. Here's your store overview.</p>
        </div>
        <button
          onClick={() => fetchDashboardData()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-sm hover:bg-gray-50 rounded-md shadow-sm"
        >
          <RefreshCw size={16} /> Refresh Data
        </button>
      </div>

      {/* Charts Section */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <TrendingUp className="text-accent-gold" size={20} />
          Revenue Overview (Last 7 Days)
        </h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => [formatPrice(Number(value) || 0), "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#D4AF37"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* ... (Previous Stats Cards logic maintained but simplified markup if needed) ... */}
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

        {/* Pending Reviews Card (New) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-foreground-muted text-sm">Pending Reviews</span>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Star size={20} className="text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold">{stats?.pendingReviews || 0}</p>
          <p className="text-xs text-foreground-muted mt-1">
            Need moderation
          </p>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mt-8">
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

        {/* Quick Actions / Alerts */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-serif text-xl mb-4">Need Attention</h2>
            <div className="space-y-3">
              {stats && stats.lowStockItems > 0 && (
                <Link
                  href="/admin/inventory?filter=low_stock"
                  className="flex items-center gap-3 p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                >
                  <AlertTriangle size={20} className="text-red-600" />
                  <span className="text-sm font-medium text-red-900">Low Stock ({stats.lowStockItems})</span>
                </Link>
              )}
              {stats && stats.pendingReviews > 0 && (
                <Link
                  href="/admin/reviews"
                  className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200"
                >
                  <Star size={20} className="text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Pending Reviews ({stats.pendingReviews})</span>
                </Link>
              )}
              {(!stats?.lowStockItems && !stats?.pendingReviews) && (
                <p className="text-sm text-foreground-muted italic">Everything looks good!</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-serif text-xl mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600">Customers</span>
                </div>
                <span className="font-semibold">{stats?.totalCustomers || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600">Active Coupons</span>
                </div>
                <span className="font-semibold">{stats?.activeCoupons || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
