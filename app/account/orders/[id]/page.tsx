"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Loader2,
  Download,
  Printer,
} from "lucide-react";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { log } from "@/lib/logger";
import { OrderDetailSkeleton } from "@/components/AccountSkeleton";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  id: string;
  order_number?: string;
  created_at: string;
  status: string;
  payment_status?: string;
  total: number;
  subtotal?: number;
  discount?: number;
  shipping?: number;
  tax?: number;
  items: OrderItem[];
  shipping_address?: any;
  tracking_number?: string;
  tracking_url?: string;
  email?: string;
  phone?: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
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

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setOrder(data);
      } else {
        toast.error("Order not found");
        router.push("/account/orders");
      }
    } catch (error: any) {
      log.error("Error fetching order", error);
      if (error.code === "PGRST116") {
        toast.error("Orders feature not available yet");
      } else {
        toast.error("Failed to load order");
      }
      router.push("/account/orders");
    } finally {
      setLoading(false);
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
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
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
    switch (status?.toLowerCase()) {
      case "delivered":
        return <CheckCircle size={20} />;
      case "shipped":
        return <Truck size={20} />;
      case "processing":
        return <Clock size={20} />;
      default:
        return <Package size={20} />;
    }
  };

  if (loading) {
    return <OrderDetailSkeleton />;
  }

  if (!order) {
    return null;
  }

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
            <Link href="/account/orders" className="hover:text-foreground">
              Orders
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">
              Order #{order.order_number || order.id.slice(0, 8)}
            </span>
          </nav>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-serif mb-2">
                Order #{order.order_number || order.id.slice(0, 8)}
              </h1>
              <p className="text-foreground-muted">
                Placed on {formatDate(order.created_at)}
              </p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <button className="flex items-center gap-2 border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
                <Download size={16} /> Download Invoice
              </button>
              <button className="flex items-center gap-2 border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
                <Printer size={16} /> Print
              </button>
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-background-alt p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              {getStatusIcon(order.status)}
              <div>
                <h2 className="font-serif text-lg">Order Status</h2>
                <span
                  className={`inline-block text-xs px-3 py-1 rounded mt-1 ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status || "Pending"}
                </span>
              </div>
            </div>
            {order.tracking_number && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-foreground-muted mb-2">Tracking Number</p>
                <p className="font-medium">{order.tracking_number}</p>
                {order.tracking_url && (
                  <a
                    href={order.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-accent-gold hover:underline mt-2 inline-block"
                  >
                    Track Package →
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-background-alt p-6">
                <h2 className="font-serif text-xl mb-6">Order Items</h2>
                <div className="space-y-4">
                  {order.items && Array.isArray(order.items) && order.items.length > 0 ? (
                    order.items.map((item: OrderItem, idx: number) => (
                      <div key={idx} className="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-0">
                        {item.image && (
                          <div className="w-20 h-20 bg-white overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-foreground-muted">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                          <p className="text-xs text-foreground-muted">
                            {formatPrice(item.price)} each
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-foreground-muted">No items found</p>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              {order.shipping_address && (
                <div className="bg-background-alt p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin size={20} className="text-accent-gold" />
                    <h2 className="font-serif text-xl">Shipping Address</h2>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium mb-1">
                      {order.shipping_address.name || order.shipping_address.firstName}
                    </p>
                    <p className="text-foreground-muted">
                      {order.shipping_address.address || order.shipping_address.line1}
                      {order.shipping_address.apartment && `, ${order.shipping_address.apartment}`}
                      {order.shipping_address.line2 && `, ${order.shipping_address.line2}`}
                      <br />
                      {order.shipping_address.city}, {order.shipping_address.state}{" "}
                      {order.shipping_address.postalCode || order.shipping_address.postal_code}
                    </p>
                    {order.shipping_address.phone && (
                      <p className="text-foreground-muted mt-2">
                        <Phone size={14} className="inline mr-1" />
                        {order.shipping_address.phone}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-background-alt p-6 sticky top-24">
                <h2 className="font-serif text-xl mb-6">Order Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Subtotal</span>
                    <span>{formatPrice(order.subtotal || order.total)}</span>
                  </div>
                  {order.discount && order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(order.discount)}</span>
                    </div>
                  )}
                  {order.shipping && (
                    <div className="flex justify-between">
                      <span className="text-foreground-muted">Shipping</span>
                      <span>{formatPrice(order.shipping)}</span>
                    </div>
                  )}
                  {order.tax && (
                    <div className="flex justify-between">
                      <span className="text-foreground-muted">Tax</span>
                      <span>{formatPrice(order.tax)}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-200 flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>

                {order.payment_status && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-xs uppercase tracking-widest text-foreground-muted mb-2">
                      Payment Status
                    </p>
                    <p
                      className={`text-sm font-medium ${
                        order.payment_status === "paid"
                          ? "text-green-600"
                          : order.payment_status === "pending"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {order.payment_status.charAt(0).toUpperCase() +
                        order.payment_status.slice(1)}
                    </p>
                  </div>
                )}

                <div className="mt-6 space-y-3">
                  <Link
                    href="/account/orders"
                    className="block w-full border border-gray-200 py-3 text-center text-sm hover:bg-white transition-colors"
                  >
                    Back to Orders
                  </Link>
                  {order.status?.toLowerCase() === "delivered" && (
                    <button className="w-full bg-foreground text-white py-3 text-sm uppercase tracking-widest hover:bg-accent-gold transition-colors">
                      Buy Again
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}

