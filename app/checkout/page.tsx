"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Truck,
  CheckCircle,
  Lock,
  ShoppingBag,
  Tag,
  XCircle,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import toast from "react-hot-toast";
import { log } from "@/lib/logger";

const shippingSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(5, "Address is required"),
  apartment: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(6, "Please enter a valid PIN code"),
  saveInfo: z.boolean().optional(),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

const steps = [
  { id: "information", label: "Information", icon: ShoppingBag },
  { id: "shipping", label: "Shipping", icon: Truck },
  { id: "payment", label: "Payment", icon: CreditCard },
];

const shippingMethods = [
  {
    id: "standard",
    name: "Standard Shipping",
    description: "5-7 business days",
    price: 0, // Fallback price if under threshold
  },
];

// Free shipping threshold
const FREE_SHIPPING_THRESHOLD = 499;

export default function CheckoutPage() {
  const router = useRouter();
  /* ... */
  const { items, subtotal, discount, tax, total, clearCart, promoCode, applyPromoCode, removePromoCode } = useCartStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Promo code state
  const [promoInput, setPromoInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    try {
      const result = await applyPromoCode(promoInput);
      if (result.success) {
        toast.success("Coupon applied successfully!");
        setPromoInput("");
      } else {
        toast.error(result.message || "Invalid coupon code");
      }
    } catch (error) {
      toast.error("Failed to apply coupon");
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    removePromoCode();
    toast.success("Coupon removed");
  };

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // Optional: Pre-fill email/name if available and not already filled
      }
    };
    fetchUser();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      saveInfo: true,
    },
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && currentStep === 0) {
      router.push("/shop");
    }
  }, [items, router, currentStep]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const selectedShipping = shippingMethods.find((m) => m.id === shippingMethod);
  // Free shipping for orders over ₹1000
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : (selectedShipping?.price ?? 99);
  const finalTotal = subtotal - discount + shippingCost + tax;


  const onShippingSubmit = (data: ShippingFormData) => {
    setShippingData(data);
    setCurrentStep(1);
  };

  const handleShippingMethodSubmit = () => {
    setCurrentStep(2);
  };

  const handlePayment = async () => {
    if (!shippingData) return;

    setIsProcessing(true);

    try {
      // Step 1: Initialize transaction on server
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            slug: item.slug,
            size: item.size,
            sku: item.variantSku || item.productId, // Use variantSku if available
          })),
          subtotal,
          discount,
          shipping: shippingCost,
          tax,
          total: finalTotal,
          shippingAddress: {
            name: `${shippingData.firstName} ${shippingData.lastName}`,
            phone: shippingData.phone,
            line1: shippingData.address,
            line2: shippingData.apartment,
            city: shippingData.city,
            state: shippingData.state,
            postal_code: shippingData.postalCode,
            country: "India",
          },
          email: shippingData.email,
          phone: shippingData.phone,
          promoCode,
          userId: userId || undefined,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        const errorMsg = data.details
          ? `${data.error} Details: ${data.details}`
          : data.error || "Failed to initiate payment";
        throw new Error(errorMsg);
      }


      setOrderNumber(data.orderNumber);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(finalTotal * 100),
        currency: "INR",
        name: "Vishwa Lifestyle",
        description: `Order #${data.orderNumber}`,
        image: "/logo.png",
        order_id: data.razorpayOrderId,
        handler: async function (response: any) {
          try {
            const verifyResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                orderNumber: data.orderNumber,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              clearCart();
              router.push(`/checkout/success?orderNumber=${data.orderNumber}`);
            } else {
              throw new Error(verifyData.error || "Payment verification failed");
            }
          } catch (error: any) {
            log.error("Payment verification error", error);
            toast.error(error.message || "Payment verification failed");
            setIsProcessing(false);
          }
        },
        prefill: {
          name: `${shippingData.firstName} ${shippingData.lastName}`,
          email: shippingData.email,
          contact: shippingData.phone,
        },
        theme: {
          color: "#D4AF37",
        },
      };

      if (!(window as any).Razorpay) {
        throw new Error("Razorpay SDK not loaded. Please verify your internet connection.");
      }

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error(response.error.description);
        setIsProcessing(false);
      });
      rzp.open();

      // Note: User will be redirected, so we don't need to clear processing state immediately
      // It will be cleared if they hit back button or returns to this page
    } catch (error: any) {
      log.error("Checkout error", error);
      toast.error(error.message || "Unable to process payment. Please try again.");
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && currentStep !== 2) {
    return null;
  }

  return (
    <main className="min-h-screen bg-white pt-24 pb-16">
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-serif font-bold">VISHWA</h1>
            <span className="text-xs tracking-[0.4em] uppercase text-accent-gold">
              Lifestyle
            </span>
          </Link>
        </div>

        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-center">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center gap-2 ${idx <= currentStep ? "text-foreground" : "text-foreground-muted"
                    }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${idx < currentStep
                      ? "bg-accent-gold text-white"
                      : idx === currentStep
                        ? "bg-foreground text-white"
                        : "bg-gray-200"
                      }`}
                  >
                    {idx < currentStep ? (
                      <CheckCircle size={16} />
                    ) : (
                      <step.icon size={16} />
                    )}
                  </div>
                  <span className="text-sm hidden md:inline">{step.label}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`w-12 md:w-24 h-0.5 mx-2 ${idx < currentStep ? "bg-accent-gold" : "bg-gray-200"
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Left Column - Forms */}
          <div>
            <AnimatePresence mode="wait">
              {/* Step 1: Information */}
              {currentStep === 0 && (
                <motion.div
                  key="information"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <h2 className="text-2xl font-serif mb-6">Contact Information</h2>
                  <form onSubmit={handleSubmit(onShippingSubmit)} className="space-y-6">
                    {/* Email */}
                    <div>
                      <label className="block text-sm mb-2">Email</label>
                      <input
                        type="email"
                        {...register("email")}
                        className={`w-full border px-4 py-3 focus:outline-none focus:border-accent-gold ${errors.email ? "border-red-500" : "border-gray-200"
                          }`}
                        placeholder="your@email.com"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm mb-2">Phone</label>
                      <input
                        type="tel"
                        {...register("phone")}
                        className={`w-full border px-4 py-3 focus:outline-none focus:border-accent-gold ${errors.phone ? "border-red-500" : "border-gray-200"
                          }`}
                        placeholder="+91 98765 43210"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                      )}
                    </div>

                    <h3 className="text-xl font-serif pt-6">Shipping Address</h3>

                    {/* Name Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-2">First Name</label>
                        <input
                          type="text"
                          {...register("firstName")}
                          className={`w-full border px-4 py-3 focus:outline-none focus:border-accent-gold ${errors.firstName ? "border-red-500" : "border-gray-200"
                            }`}
                        />
                        {errors.firstName && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.firstName.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm mb-2">Last Name</label>
                        <input
                          type="text"
                          {...register("lastName")}
                          className={`w-full border px-4 py-3 focus:outline-none focus:border-accent-gold ${errors.lastName ? "border-red-500" : "border-gray-200"
                            }`}
                        />
                        {errors.lastName && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm mb-2">Address</label>
                      <input
                        type="text"
                        {...register("address")}
                        className={`w-full border px-4 py-3 focus:outline-none focus:border-accent-gold ${errors.address ? "border-red-500" : "border-gray-200"
                          }`}
                        placeholder="House no., Building, Street"
                      />
                      {errors.address && (
                        <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
                      )}
                    </div>

                    {/* Apartment */}
                    <div>
                      <label className="block text-sm mb-2">
                        Apartment, suite, etc. (optional)
                      </label>
                      <input
                        type="text"
                        {...register("apartment")}
                        className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-accent-gold"
                      />
                    </div>

                    {/* City, State, PIN */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm mb-2">City</label>
                        <input
                          type="text"
                          {...register("city")}
                          className={`w-full border px-4 py-3 focus:outline-none focus:border-accent-gold ${errors.city ? "border-red-500" : "border-gray-200"
                            }`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-2">State</label>
                        <input
                          type="text"
                          {...register("state")}
                          className={`w-full border px-4 py-3 focus:outline-none focus:border-accent-gold ${errors.state ? "border-red-500" : "border-gray-200"
                            }`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-2">PIN Code</label>
                        <input
                          type="text"
                          {...register("postalCode")}
                          className={`w-full border px-4 py-3 focus:outline-none focus:border-accent-gold ${errors.postalCode ? "border-red-500" : "border-gray-200"
                            }`}
                        />
                      </div>
                    </div>

                    {/* Save Info */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("saveInfo")}
                        className="accent-accent-gold"
                      />
                      <span className="text-sm">Save this information for next time</span>
                    </label>

                    {/* Submit */}
                    <button
                      type="submit"
                      className="w-full bg-foreground text-white py-4 uppercase tracking-widest text-sm hover:bg-accent-gold transition-colors flex items-center justify-center gap-2"
                    >
                      Continue to Shipping <ChevronRight size={16} />
                    </button>

                    <Link
                      href="/shop"
                      className="flex items-center justify-center gap-2 text-sm text-foreground-muted hover:text-foreground"
                    >
                      <ChevronLeft size={16} /> Return to Shop
                    </Link>
                  </form>
                </motion.div>
              )}

              {/* Step 2: Shipping Method */}
              {currentStep === 1 && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <h2 className="text-2xl font-serif mb-6">Shipping Method</h2>

                  {/* Contact Summary */}
                  <div className="bg-background-alt p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-foreground-muted">Contact</span>
                      <button
                        onClick={() => setCurrentStep(0)}
                        className="text-xs text-accent-gold"
                      >
                        Change
                      </button>
                    </div>
                    <p className="text-sm">{shippingData?.email}</p>
                    <p className="text-sm mt-2">
                      {shippingData?.firstName} {shippingData?.lastName}
                    </p>
                    <p className="text-sm">
                      {shippingData?.address}, {shippingData?.city}, {shippingData?.state} -{" "}
                      {shippingData?.postalCode}
                    </p>
                  </div>

                  {/* Shipping Options */}
                  <div className="space-y-4">
                    {shippingMethods.map((method) => {
                      const isDisabled = false; // Always enabled for now as all are free
                      return (
                        <label
                          key={method.id}
                          className={`flex items-center justify-between p-4 border cursor-pointer transition-colors ${shippingMethod === method.id
                            ? "border-accent-gold bg-accent-gold/5"
                            : "border-gray-200 hover:border-gray-300"
                            } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="shipping"
                              value={method.id}
                              checked={shippingMethod === method.id}
                              onChange={() => !isDisabled && setShippingMethod(method.id)}
                              disabled={isDisabled}
                              className="accent-accent-gold"
                            />
                            <div>
                              <p className="font-medium text-sm">{method.name}</p>
                              <p className="text-xs text-foreground-muted">
                                {method.description}
                              </p>
                            </div>
                          </div>
                          <span className="font-medium">
                            {method.price === 0 ? "Free" : formatPrice(method.price)}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  {/* Buttons */}
                  <div className="mt-8 space-y-4">
                    <button
                      onClick={handleShippingMethodSubmit}
                      className="w-full bg-foreground text-white py-4 uppercase tracking-widest text-sm hover:bg-accent-gold transition-colors flex items-center justify-center gap-2"
                    >
                      Continue to Payment <ChevronRight size={16} />
                    </button>
                    <button
                      onClick={() => setCurrentStep(0)}
                      className="flex items-center justify-center gap-2 text-sm text-foreground-muted hover:text-foreground w-full"
                    >
                      <ChevronLeft size={16} /> Return to Information
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 2 && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <h2 className="text-2xl font-serif mb-6">Payment</h2>

                  {/* Order Summary */}
                  <div className="bg-background-alt p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-foreground-muted">Shipping to</span>
                      <button
                        onClick={() => setCurrentStep(0)}
                        className="text-xs text-accent-gold"
                      >
                        Change
                      </button>
                    </div>
                    <p className="text-sm">
                      {shippingData?.firstName} {shippingData?.lastName}
                    </p>
                    <p className="text-sm">
                      {shippingData?.address}, {shippingData?.city}
                    </p>
                    <p className="text-sm">
                      {shippingData?.state} - {shippingData?.postalCode}
                    </p>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm">
                        <span className="text-foreground-muted">Shipping: </span>
                        {selectedShipping?.name}
                      </p>
                    </div>
                  </div>

                  {/* Payment Options */}
                  <div className="bg-background-alt p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Lock size={16} className="text-accent-gold" />
                      <span className="text-sm font-medium">Secure Online Payment</span>
                    </div>
                    <p className="text-sm text-foreground-muted mb-4">
                      All transactions are secure and encrypted. Your payment information is
                      never stored on our servers.
                    </p>
                    <div className="flex items-center gap-4 text-foreground-muted">
                      <CreditCard size={24} />
                      <span className="text-xs">UPI • Cards • Net Banking • Wallets</span>
                    </div>
                  </div>

                  {/* Pay Button */}
                  <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full bg-accent-gold text-white py-4 uppercase tracking-widest text-sm hover:bg-foreground transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <span className="animate-spin">⏳</span> Processing...
                      </>
                    ) : (
                      <>
                        <Lock size={16} /> Pay {formatPrice(finalTotal)}
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center justify-center gap-2 text-sm text-foreground-muted hover:text-foreground w-full mt-4"
                  >
                    <ChevronLeft size={16} /> Return to Shipping
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column - Order Summary */}
          <div className="bg-background-alt p-6 lg:p-8 h-fit lg:sticky lg:top-32">
            <h2 className="text-xl font-serif mb-6">Order Summary</h2>

            {/* Items */}
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-16 h-16 bg-white flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-foreground text-white text-xs rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    {item.size && (
                      <p className="text-[10px] text-accent-gold uppercase tracking-widest font-medium">
                        Size: {item.size}
                      </p>
                    )}
                    <p className="text-xs text-foreground-muted">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Promo Code Section */}
            <div className="py-6 border-t border-gray-200">
              {promoCode ? (
                <div className="flex items-center justify-between bg-green-50 px-4 py-3 rounded-md border border-green-100">
                  <div className="flex items-center gap-2 text-green-700">
                    <Tag size={16} />
                    <span className="font-medium text-sm">Code: {promoCode}</span>
                  </div>
                  <button
                    onClick={handleRemovePromo}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove Coupon"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Promo Code"
                    className="flex-1 bg-white border border-gray-200 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-accent-gold uppercase"
                  />
                  <button
                    onClick={handleApplyPromo}
                    disabled={promoLoading || !promoInput.trim()}
                    className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {promoLoading ? "..." : "Apply"}
                  </button>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({promoCode})</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Shipping</span>
                <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">GST (18%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between font-medium text-lg pt-3 border-t border-gray-200">
                <span>Total</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

