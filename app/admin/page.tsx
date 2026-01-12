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
  Loader2,
  RefreshCw,
  Tag,
  AlertTriangle,
  Star,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
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
  totalRevenue: number;
  pendingOrders: number;
  totalCustomers: number;
  activeCoupons: number;
  lowStockItems: number;
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
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login?redirect=" + encodeURIComponent("/admin"));
        return;
      }

      setIsAuthorized(true);
      await fetchDashboardData();
    } catch (error) {
      log.error("Admin access verification error", error);
      toast.error("Unable to verify access.");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const { getDashboardStatsAction } = await import("@/app/actions/dashboard");
      const result = await getDashboardStatsAction();

      if (!result.success || !result.data) throw new Error(result.error);

      const allOrders = result.data.orders;

      // Calculate total revenue
      const totalRevenue = allOrders
        .filter((o: any) => o.status !== "cancelled")
        .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

      const pendingOrders = allOrders.filter((o: any) => o.status === "processing").length;

      setStats({
        totalOrders: allOrders.length,
        totalRevenue,
        pendingOrders,
        totalCustomers: result.data.customerCount,
        activeCoupons: 0, // Fallback if not in action
        lowStockItems: result.data.lowStockCount,
        pendingReviews: result.data.reviewCount,
      });

      setRecentOrders(allOrders.slice(0, 10));

      // Prepare chart data (Last 7 days)
      const chartMap = new Map<string, { revenue: number; orders: number }>();
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        chartMap.set(dateStr, { revenue: 0, orders: 0 });
      }

      allOrders.forEach((order: any) => {
        const d = new Date(order.created_at);
        const dateStr = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        if (chartMap.has(dateStr)) {
          const current = chartMap.get(dateStr)!;
          chartMap.set(dateStr, {
            revenue: current.revenue + (order.total || 0),
            orders: current.orders + 1
          });
        }
      });

      setChartData(Array.from(chartMap.entries()).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders
      })));

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
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
    switch (status?.toLowerCase()) {
      case "delivered": return "text-green-600 bg-green-50";
      case "processing": return "text-blue-600 bg-blue-50";
      case "shipped": return "text-purple-600 bg-purple-50";
      case "cancelled": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
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
          <p className="text-foreground-muted">You don't have permission to access this page.</p>
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-foreground-muted text-sm">Total Revenue</span>
            <div className="p-2 bg-green-50 rounded-lg"><IndianRupee size={20} className="text-green-600" /></div>
          </div>
          <p className="text-2xl font-semibold">{formatPrice(stats?.totalRevenue || 0)}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-foreground-muted text-sm">Orders</span>
            <div className="p-2 bg-blue-50 rounded-lg"><ShoppingBag size={20} className="text-blue-600" /></div>
          </div>
          <p className="text-2xl font-semibold">{stats?.totalOrders || 0}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-foreground-muted text-sm">Customers</span>
            <div className="p-2 bg-orange-50 rounded-lg"><Users size={20} className="text-orange-600" /></div>
          </div>
          <p className="text-2xl font-semibold">{stats?.totalCustomers || 0}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-foreground-muted text-sm">Pending Orders</span>
            <div className="p-2 bg-blue-50 rounded-lg"><Clock size={20} className="text-blue-600" /></div>
          </div>
          <p className="text-2xl font-semibold">{stats?.pendingOrders || 0}</p>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Charts */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <TrendingUp className="text-accent-gold" size={20} />
              Revenue Overview (Last 7 Days)
            </h2>
            <div className="h-[300px] w-full font-mono">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip formatter={(val: any) => [formatPrice(val), "Revenue"]} />
                  <Area type="monotone" dataKey="revenue" stroke="#D4AF37" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-serif text-xl">Recent Orders</h2>
              <Link href="/admin/orders" className="text-sm text-accent-gold hover:underline flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentOrders.length === 0 ? (
                <div className="p-12 text-center text-gray-400">No orders yet</div>
              ) : (
                recentOrders.map((order) => (
                  <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${getStatusColor(order.status)}`}>{getStatusIcon(order.status)}</div>
                      <div>
                        <p className="font-medium text-sm">{order.order_number || `#${order.id.slice(0, 8)}`}</p>
                        <p className="text-xs text-foreground-muted">{order.shipping_address?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(order.total)}</p>
                      <p className="text-xs text-foreground-muted">{formatDate(order.created_at)}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h2 className="font-serif text-xl mb-4 text-accent-gold">Need Attention</h2>
            <div className="space-y-3">
              {stats && stats.lowStockItems > 0 && (
                <Link href="/admin/inventory" className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <AlertTriangle size={20} className="text-red-600" />
                  <span className="text-sm font-medium">Low Stock ({stats.lowStockItems})</span>
                </Link>
              )}
              {stats && stats.pendingReviews > 0 && (
                <Link href="/admin/reviews" className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <Star size={20} className="text-purple-600" />
                  <span className="text-sm font-medium">Pending Reviews ({stats.pendingReviews})</span>
                </Link>
              )}
              {stats && stats.lowStockItems === 0 && stats.pendingReviews === 0 && (
                <p className="text-sm text-gray-500 italic text-center py-4">All systems clear!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
