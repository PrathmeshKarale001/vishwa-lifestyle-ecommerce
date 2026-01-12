"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Package,
  ArrowLeft,
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Copy,
  Printer,
  Edit,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { log } from "@/lib/logger";

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  status: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  shipping_address: {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
  };
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  payment_method: string;
  payment_id?: string;
  tracking_number?: string;
  tracking_url?: string;
  shipping_method?: string; // Used for Courier Name
  promo_code?: string;
}

interface UserProfile {
  email: string;
  name: string;
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [showTrackingInput, setShowTrackingInput] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, [orderId]);

  const checkAdminAccess = async () => {
    // Middleware handles strict auth/admin checks.
    // Client-side, we just proceed.
    setIsAuthorized(true);
    await fetchOrderDetails();
    setLoading(false);
  };

  const fetchOrderDetails = async () => {
    if (!orderId) return;

    try {
      const { getOrderDetailAction } = await import("@/app/actions/orders");
      const result = await getOrderDetailAction(orderId);

      if (!result.success || !result.data) throw new Error(result.error || "Failed to load order data");

      setOrder(result.data.order);
      setTrackingNumber(result.data.order.tracking_number || "");
      setUser(result.data.userProfile);
    } catch (error) {
      log.error("Error fetching order details", error, { orderId });
      toast.error("Unable to load order details. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [carrierName, setCarrierName] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");

  const updateOrderStatus = async (newStatus: string) => {
    if (!order) return;

    // For cancellation, use the specific flow
    if (newStatus === "cancelled") {
      setCancelModalOpen(true);
      return;
    }

    setUpdating(true);
    try {
      const { updateOrderStatusAction } = await import("@/app/actions/orders");
      const result = await updateOrderStatusAction(order.id, newStatus);

      if (!result.success) throw new Error(result.error);

      setOrder({ ...order, status: newStatus });
      toast.success(`Order status updated to ${newStatus}!`);
    } catch (error) {
      log.error("Error updating order status", error, { orderId: order.id, newStatus });
      toast.error("Unable to update order status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    setUpdating(true);
    try {
      const { cancelOrderAction } = await import("@/app/actions/orders");
      const result = await cancelOrderAction(order.id, cancelReason || "No reason provided");

      if (!result.success) throw new Error(result.error);

      setOrder({ ...order, status: "cancelled" });
      setCancelModalOpen(false);
      toast.success("Order cancelled and inventory restored.");
    } catch (error) {
      log.error("Error cancelling order", error, { orderId: order.id });
      toast.error("Failed to cancel order.");
    } finally {
      setUpdating(false);
    }
  };

  const updateTrackingNumber = async () => {
    if (!order) return;

    setUpdating(true);
    try {
      const { updateOrderTrackingAction } = await import("@/app/actions/orders");
      const result = await updateOrderTrackingAction(order.id, trackingNumber, carrierName, trackingUrl);

      if (!result.success) throw new Error(result.error);

      setOrder({
        ...order,
        tracking_number: trackingNumber,
        status: "shipped",
        // Update local state assumptions
        shipping_method: carrierName
      });
      setShowTrackingInput(false);
      toast.success("Order dispatched and email sent!");
    } catch (error) {
      log.error("Error updating tracking number", error, { orderId: order.id });
      toast.error("Unable to update tracking number. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
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
      month: "long",
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
        return <CheckCircle size={20} />;
      case "processing":
        return <Clock size={20} />;
      case "shipped":
        return <Truck size={20} />;
      case "cancelled":
        return <XCircle size={20} />;
      default:
        return <Package size={20} />;
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

  if (!order) {
    return (
      <main className="min-h-screen bg-gray-50 pt-24">
        <div className="container mx-auto px-6 py-12 text-center">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-serif mb-4">Order Not Found</h1>
          <Link href="/admin/orders" className="text-accent-gold hover:underline">
            Back to Orders
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
            <Link
              href="/admin/orders"
              className="flex items-center gap-2 text-foreground-muted hover:text-foreground mb-2"
            >
              <ArrowLeft size={16} /> Back to Orders
            </Link>
            <h1 className="text-3xl font-serif">
              Order {order.order_number || `#${order.id.slice(0, 8)}`}
            </h1>
            <p className="text-foreground-muted mt-1">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-sm hover:bg-gray-50"
            >
              <Printer size={16} /> Print
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-xl">Order Status</h2>
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(
                    order.status
                  )}`}
                >
                  {getStatusIcon(order.status)}
                  <span className="font-medium capitalize">{order.status}</span>
                </div>
              </div>

              {/* Status Actions */}
              <div className="flex flex-wrap gap-2">
                {["processing", "shipped", "delivered", "cancelled"].map((status) => (
                  <button
                    key={status}
                    onClick={() => updateOrderStatus(status)}
                    disabled={updating || order.status === status}
                    className={`px-4 py-2 text-sm border capitalize transition-colors ${order.status === status
                      ? "bg-foreground text-white border-foreground"
                      : "bg-white border-gray-200 hover:border-foreground"
                      }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Cancel Button */}
              {order.status !== "cancelled" && order.status !== "delivered" && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setCancelModalOpen(true)}
                    className="w-full py-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded text-sm font-medium transition-colors"
                  >
                    Cancel Order
                  </button>
                </div>
              )}

              {/* Tracking Number */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Tracking Number</h3>
                  {!showTrackingInput && (
                    <button
                      onClick={() => setShowTrackingInput(true)}
                      className="text-sm text-accent-gold hover:underline flex items-center gap-1"
                    >
                      <Edit size={14} /> {order.tracking_number ? "Edit" : "Add"}
                    </button>
                  )}
                </div>
                {showTrackingInput ? (
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="Tracking Number *"
                        className="border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-accent-gold rounded"
                      />
                      <input
                        type="text"
                        value={carrierName}
                        onChange={(e) => setCarrierName(e.target.value)}
                        placeholder="Courier Name (e.g. Bluedart)"
                        className="border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-accent-gold rounded"
                      />
                    </div>
                    <input
                      type="text"
                      value={trackingUrl}
                      onChange={(e) => setTrackingUrl(e.target.value)}
                      placeholder="Tracking Link (Optional)"
                      className="border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-accent-gold rounded"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          setShowTrackingInput(false);
                          setTrackingNumber(order.tracking_number || "");
                        }}
                        className="px-4 py-2 border border-gray-200 text-sm hover:bg-gray-50 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={updateTrackingNumber}
                        disabled={updating || !trackingNumber}
                        className="px-4 py-2 bg-foreground text-white text-sm hover:bg-accent-gold rounded disabled:opacity-50"
                      >
                        {updating ? "Dispatching..." : "Mark Dispatched"}
                      </button>
                    </div>
                  </div>
                ) : order.tracking_number ? (
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 px-3 py-1 text-sm">
                      {order.tracking_number}
                    </code>
                    <button
                      onClick={() => copyToClipboard(order.tracking_number!, "Tracking number")}
                      className="p-1 text-foreground-muted hover:text-foreground"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                ) : (
                  <p className="text-foreground-muted text-sm">No tracking number added yet</p>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-serif text-xl mb-6">Order Items</h2>
              <div className="space-y-4">
                {order.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                  >
                    <div className="relative w-20 h-20 bg-gray-100 flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={24} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-foreground-muted">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted">Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount {order.promo_code && `(${order.promo_code})`}</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted">Shipping</span>
                  <span>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted">Tax (GST)</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-serif text-xl mb-4">Customer</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User size={18} className="text-foreground-muted" />
                  <span>{user?.name || order.shipping_address?.name || "N/A"}</span>
                </div>
                {user?.email && (
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-foreground-muted" />
                    <a
                      href={`mailto:${user.email}`}
                      className="text-accent-gold hover:underline"
                    >
                      {user.email}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-foreground-muted" />
                  <a
                    href={`tel:${order.shipping_address?.phone}`}
                    className="text-accent-gold hover:underline"
                  >
                    {order.shipping_address?.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-serif text-xl mb-4">Shipping Address</h2>
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-foreground-muted flex-shrink-0 mt-1" />
                <div className="text-sm">
                  <p className="font-medium">{order.shipping_address?.name}</p>
                  <p className="text-foreground-muted">
                    {order.shipping_address?.line1}
                    {order.shipping_address?.line2 && (
                      <>, {order.shipping_address.line2}</>
                    )}
                  </p>
                  <p className="text-foreground-muted">
                    {order.shipping_address?.city}, {order.shipping_address?.state}{" "}
                    {order.shipping_address?.postal_code}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-serif text-xl mb-4">Payment</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CreditCard size={18} className="text-foreground-muted" />
                  <span className="capitalize">{order.payment_method || "Payment Gateway"}</span>
                </div>
                {order.payment_id && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground-muted">Payment ID:</span>
                    <code className="bg-gray-100 px-2 py-0.5 text-xs">
                      {order.payment_id}
                    </code>
                    <button
                      onClick={() => copyToClipboard(order.payment_id!, "Payment ID")}
                      className="text-foreground-muted hover:text-foreground"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-serif text-xl mb-4">Timeline</h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-accent-gold rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium">Order Placed</p>
                    <p className="text-xs text-foreground-muted">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                </div>
                {order.updated_at !== order.created_at && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-accent-gold rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-xs text-foreground-muted">
                        {formatDate(order.updated_at)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Cancel Order Modal */}
      {cancelModalOpen && order && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-serif text-red-600">Cancel Order</h2>
              <button onClick={() => setCancelModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-foreground-muted">
                Are you sure you want to cancel order <strong>{order.order_number}</strong>?
                This action cannot be undone. Inventory will be restored automatically.
              </p>

              <div>
                <label className="text-sm font-medium mb-1 block">Reason for Cancellation</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full border border-gray-200 rounded p-2 text-sm focus:outline-none focus:border-red-300"
                  rows={3}
                  placeholder="e.g. Customer request, Out of stock, Fraudulent..."
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setCancelModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded text-sm hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={updating}
                  className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {updating && <Loader2 size={14} className="animate-spin" />}
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}
