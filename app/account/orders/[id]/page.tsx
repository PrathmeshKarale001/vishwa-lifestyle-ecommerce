"use client";

import { useState, useEffect, useRef } from "react";
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
  ChevronLeft,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { createClient } from "@/lib/supabase/client";
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
  payment_method?: string;
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
  const supabase = createClient();
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

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
        toast.error("Order not found");
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadInvoice = async () => {
    if (!invoiceRef.current || !order) return;

    setIsDownloading(true);
    const toastId = toast.loading("Generating Invoice...");

    try {
      const element = invoiceRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc: Document) => {
          // 1. Hide elements marked as print:hidden (e.g. Timeline, Help section)
          const hiddenElements = clonedDoc.querySelectorAll('.print\\:hidden');
          hiddenElements.forEach((el: unknown) => {
            if (el instanceof HTMLElement) el.style.display = 'none';
          });

          // 2. Show elements marked as print:block (e.g. Invoice Header)
          // We force display: block because they might be hidden by other classes like md:hidden
          const visibleElements = clonedDoc.querySelectorAll('.print\\:block');
          visibleElements.forEach((el: unknown) => {
            if (el instanceof HTMLElement) el.style.display = 'block';
          });
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Invoice-${order.order_number || order.id.slice(0, 8)}.pdf`);

      toast.success("Invoice downloaded", { id: toastId });
    } catch (error) {
      console.error("Invoice generation failed", error);
      toast.error("Failed to generate invoice", { id: toastId });
    } finally {
      setIsDownloading(false);
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
          <nav className="text-sm text-foreground-muted mb-6 print:hidden">
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

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 print:hidden">
            <div>
              <h1 className="text-3xl font-serif mb-2">
                Order #{order.order_number || order.id.slice(0, 8)}
              </h1>
              <p className="text-foreground-muted">
                Placed on {formatDate(order.created_at)}
              </p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <button
                onClick={handleDownloadInvoice}
                disabled={isDownloading}
                className="flex items-center gap-2 border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                Download Invoice
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
              >
                <Printer size={16} /> Print
              </button>
            </div>
          </div>

          {/* INVOICE CONTENT - Ref Target */}
          <div ref={invoiceRef} className="bg-white p-8 md:p-0 md:bg-transparent">

            {/* Print Header (Only visible in PDF/Print) */}
            <div className="block md:hidden print:block mb-8 text-center pb-8 border-b border-gray-200">
              <h1 className="text-3xl font-serif font-bold mb-1">VISHWA</h1>
              <p className="text-xs tracking-[0.4em] uppercase text-accent-gold">Lifestyle</p>
              <h2 className="text-xl mt-6">INVOICE</h2>
              <p className="text-sm text-gray-500">#{order.order_number || order.id}</p>
            </div>

            {/* Status Timeline */}
            <div className="bg-background-alt p-8 mb-8 rounded-sm print:hidden">
              <div className="mb-6">
                <h2 className="font-serif text-lg mb-1">Order Status</h2>
                <p className="text-sm text-foreground-muted">Current status: <span className="font-medium text-foreground capitalize">{order.status}</span></p>
              </div>


              {order.tracking_number && (
                <div className="mt-6 pt-6 border-t border-gray-200 flex items-start gap-3">
                  <Truck className="text-accent-gold mt-1" size={20} />
                  <div>
                    <p className="text-sm font-medium mb-1">Tracking Information</p>
                    <p className="text-sm text-foreground-muted">Number: {order.tracking_number}</p>
                    {order.tracking_url && (
                      <a href={order.tracking_url} target="_blank" rel="noreferrer" className="text-xs text-accent-gold hover:underline block mt-1">Track Package</a>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Order Items */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white lg:bg-background-alt lg:p-8 rounded-sm border lg:border-none border-gray-100 p-6">
                  <h2 className="font-serif text-xl mb-6 flex items-center gap-2">
                    <Package size={20} className="text-accent-gold" /> Order Items
                  </h2>
                  <div className="space-y-6">
                    {order.items && Array.isArray(order.items) && order.items.length > 0 ? (
                      order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-4 pb-6 border-b border-gray-200 last:border-0 last:pb-0">
                          {item.image && (
                            <div className="w-20 h-20 bg-white border border-gray-100 rounded-sm overflow-hidden flex-shrink-0">
                              {/* Use standard img for PDF compatibility */}
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                crossOrigin="anonymous"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-foreground truncate">{item.name}</h3>
                            <p className="text-sm text-foreground-muted mt-1">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right whitespace-nowrap">
                            <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                            <p className="text-xs text-foreground-muted mt-1">
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
                  <div className="bg-white lg:bg-background-alt lg:p-8 rounded-sm border lg:border-none border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MapPin size={20} className="text-accent-gold" />
                      <h2 className="font-serif text-xl">Shipping Address</h2>
                    </div>
                    <div className="text-sm leading-relaxed pl-8 border-l-2 border-accent-gold/20">
                      <p className="font-medium text-lg mb-1">
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
                        <p className="text-foreground-muted mt-2 flex items-center gap-2">
                          <Phone size={14} />
                          {order.shipping_address.phone}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white lg:bg-background-alt lg:p-6 rounded-sm border lg:border-none border-gray-100 p-6 sticky top-24">
                  <h2 className="font-serif text-xl mb-6">Order Summary</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-foreground-muted">Subtotal</span>
                      <span>{formatPrice(order.subtotal || order.total)}</span>
                    </div>
                    {order.discount && order.discount > 0 ? (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-{formatPrice(order.discount)}</span>
                      </div>
                    ) : null}

                    <div className="flex justify-between">
                      <span className="text-foreground-muted">Shipping</span>
                      <span>{(order.shipping === 0) ? 'Free' : formatPrice(order.shipping || 0)}</span>
                    </div>

                    {order.tax && order.tax > 0 ? (
                      <div className="flex justify-between">
                        <span className="text-foreground-muted">Tax</span>
                        <span>{formatPrice(order.tax)}</span>
                      </div>
                    ) : null}

                    <div className="pt-4 mt-2 border-t border-gray-200 flex justify-between items-end">
                      <span className="font-medium text-lg">Total</span>
                      <span className="font-bold text-xl">{formatPrice(order.total)}</span>
                    </div>
                  </div>

                  {order.payment_status && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <p className="text-xs uppercase tracking-widest text-foreground-muted mb-2">
                        Payment Status
                      </p>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${order.payment_status === "paid" ? "bg-green-500" :
                          order.payment_status === "pending" ? "bg-yellow-500" : "bg-red-500"
                          }`} />
                        <span className={`text-sm font-medium capitalize ${order.payment_status === "paid" ? "text-green-700" :
                          order.payment_status === "pending" ? "text-yellow-700" : "text-red-700"
                          }`}>
                          {order.payment_status}
                        </span>
                      </div>
                      <p className="text-xs text-foreground-muted mt-1">
                        Via {order.payment_method || 'Online'}
                      </p>
                    </div>
                  )}

                  <div className="mt-8 pt-6 border-t border-gray-200 print:hidden text-center">
                    <p className="text-xs text-foreground-muted mb-2">Need help with this order?</p>
                    <a href="mailto:support@vishwalifestyle.com" className="text-sm text-accent-gold font-medium hover:underline">Contact Support</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back Button (Outside printable area) */}
          <div className="mt-8 text-center print:hidden">
            <Link
              href="/account/orders"
              className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors"
            >
              <div className="p-2 rounded-full bg-gray-100">
                <ChevronLeft size={16} />
              </div>
              Back to Orders
            </Link>
          </div>

        </motion.div>
      </div>

      {/* Print Specific Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
            color: black;
          }
          nav, button, footer, header {
            display: none !important;
          }
          main {
            padding: 0 !important;
          }
        }
      `}</style>
    </main>
  );
}
