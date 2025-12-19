"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Package, Mail, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function CheckoutSuccessPage() {
  const [orderNumber] = useState(() => `VL${Date.now().toString().slice(-8)}`);

  return (
    <main className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-24 h-24 mx-auto mb-8 rounded-full bg-green-100 flex items-center justify-center"
          >
            <CheckCircle size={48} className="text-green-600" />
          </motion.div>

          {/* Header */}
          <h1 className="text-4xl font-serif mb-4">Thank You!</h1>
          <p className="text-lg text-foreground-muted mb-2">
            Your order has been placed successfully.
          </p>
          <p className="text-sm text-foreground-muted mb-8">
            Order Number: <span className="font-medium text-foreground">{orderNumber}</span>
          </p>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-background-alt p-6 text-left">
              <div className="flex items-center gap-3 mb-3">
                <Mail size={20} className="text-accent-gold" />
                <h3 className="font-medium">Confirmation Email</h3>
              </div>
              <p className="text-sm text-foreground-muted">
                We've sent a confirmation email with your order details and tracking
                information.
              </p>
            </div>
            <div className="bg-background-alt p-6 text-left">
              <div className="flex items-center gap-3 mb-3">
                <Package size={20} className="text-accent-gold" />
                <h3 className="font-medium">Shipping Updates</h3>
              </div>
              <p className="text-sm text-foreground-muted">
                You'll receive updates via email and SMS as your order makes its way to you.
              </p>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-background-alt p-8 mb-12 text-left">
            <h2 className="font-serif text-xl mb-4">What's Next?</h2>
            <ol className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-accent-gold text-white flex items-center justify-center flex-shrink-0 text-xs">
                  1
                </span>
                <div>
                  <p className="font-medium">Order Processing</p>
                  <p className="text-foreground-muted">
                    We're preparing your order with care. This usually takes 1-2 business days.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-accent-gold text-white flex items-center justify-center flex-shrink-0 text-xs">
                  2
                </span>
                <div>
                  <p className="font-medium">Shipped</p>
                  <p className="text-foreground-muted">
                    Once shipped, you'll receive a tracking number to follow your package.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-accent-gold text-white flex items-center justify-center flex-shrink-0 text-xs">
                  3
                </span>
                <div>
                  <p className="font-medium">Delivered</p>
                  <p className="text-foreground-muted">
                    Your sacred essentials arrive at your doorstep, ready to enhance your
                    practice.
                  </p>
                </div>
              </li>
            </ol>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="bg-foreground text-white px-8 py-4 uppercase tracking-widest text-sm hover:bg-accent-gold transition-colors flex items-center justify-center gap-2"
            >
              Continue Shopping <ArrowRight size={16} />
            </Link>
            <Link
              href="/account/orders"
              className="border border-foreground text-foreground px-8 py-4 uppercase tracking-widest text-sm hover:bg-foreground hover:text-white transition-colors"
            >
              View Order History
            </Link>
            <button
              onClick={() => window.print()}
              className="border border-accent-gold text-accent-gold px-8 py-4 uppercase tracking-widest text-sm hover:bg-accent-gold hover:text-white transition-colors"
            >
              Download Invoice
            </button>

          </div>

          {/* Support */}
          <p className="mt-12 text-sm text-foreground-muted">
            Have questions?{" "}
            <Link href="/contact" className="text-accent-gold hover:underline">
              Contact our support team
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}

