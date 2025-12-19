"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2, Tag } from "lucide-react";
import { useCartStore } from "@/store/cart";
import toast from "react-hot-toast";
import EmptyState from "./EmptyState";

export default function CartDrawer() {
  const {
    isCartOpen,
    closeCart,
    items,
    subtotal,
    discount,
    shipping,
    tax,
    total,
    itemCount,
    promoCode,
    updateQuantity,
    removeItem,
    applyPromoCode,
    removePromoCode,
  } = useCartStore();

  const [promoInput, setPromoInput] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;

    setIsApplyingPromo(true);
    const success = await applyPromoCode(promoInput);
    setIsApplyingPromo(false);

    if (success) {
      toast.success(`Promo code "${promoInput.toUpperCase()}" applied!`);
      setPromoInput("");
    } else {
      toast.error("Invalid promo code or minimum order not met");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 z-[70] backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[80] shadow-2xl flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} aria-hidden="true" />
                <h2 className="text-lg font-serif">Your Cart</h2>
                <span className="text-sm text-foreground-muted">({itemCount} items)</span>
              </div>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <EmptyState
                  icon={ShoppingBag}
                  title="Your cart is empty"
                  description="Discover our collection of sacred essentials and lifestyle products. Add items to your cart to get started."
                  action={{
                    label: "Start Shopping",
                    href: "/shop",
                  }}
                  secondaryAction={{
                    label: "Continue Shopping",
                    onClick: closeCart,
                  }}
                />
              ) : (
                <ul className="space-y-6" role="list">
                  {items.map((item) => (
                    <motion.li
                      key={item.productId}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex gap-4"
                    >
                      {/* Product Image */}
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={closeCart}
                        className="relative w-24 h-24 bg-background-alt flex-shrink-0 overflow-hidden"
                      >
                        <Image
                          src={item.image || "/placeholder-product.svg"}
                          alt={item.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                          loading="lazy"
                        />
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 flex flex-col">
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={closeCart}
                          className="font-serif text-sm hover:text-accent-gold transition-colors"
                        >
                          {item.name}
                        </Link>
                        <span className="text-sm text-foreground-muted mt-1">
                          {formatPrice(item.price)}
                        </span>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center border border-gray-200" role="group" aria-label="Quantity controls">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="p-2 hover:bg-gray-50 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-sm" aria-label={`Quantity: ${item.quantity}`}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              disabled={item.quantity >= item.maxQuantity}
                              className="p-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <button
                            onClick={() => {
                              removeItem(item.productId);
                              toast.success("Item removed from cart");
                            }}
                            className="p-2 text-foreground-muted hover:text-red-500 transition-colors"
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer with Totals & Checkout */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 p-6 bg-white">
                {/* Promo Code */}
                <div className="mb-4">
                  {promoCode ? (
                    <div className="flex items-center justify-between bg-green-50 p-3 rounded">
                      <div className="flex items-center gap-2 text-green-700">
                        <Tag size={16} aria-hidden="true" />
                        <span className="text-sm font-medium">{promoCode}</span>
                        <span className="text-sm">(-{formatPrice(discount)})</span>
                      </div>
                      <button
                        onClick={() => {
                          removePromoCode();
                          toast.success("Promo code removed");
                        }}
                        className="text-green-700 hover:text-green-900"
                        aria-label="Remove promo code"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <label htmlFor="promo-input" className="sr-only">Promo code</label>
                      <input
                        id="promo-input"
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="Promo code"
                        className="flex-1 border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-accent-gold"
                      />
                      <button
                        onClick={handleApplyPromo}
                        disabled={isApplyingPromo || !promoInput.trim()}
                        className="px-4 py-2 bg-foreground text-white text-sm uppercase tracking-wider hover:bg-accent-gold transition-colors disabled:opacity-50"
                      >
                        {isApplyingPromo ? "..." : "Apply"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Totals */}
                <dl className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <dt className="text-foreground-muted">Subtotal</dt>
                    <dd>{formatPrice(subtotal)}</dd>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <dt>Discount</dt>
                      <dd>-{formatPrice(discount)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-foreground-muted">Shipping</dt>
                    <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-foreground-muted">GST (18%)</dt>
                    <dd>{formatPrice(tax)}</dd>
                  </div>
                  <div className="flex justify-between font-medium text-base pt-2 border-t border-gray-100">
                    <dt>Total</dt>
                    <dd>{formatPrice(total)}</dd>
                  </div>
                </dl>

                {/* Free Shipping Notice - Removed as shipping is now free for all */}
                {/* {subtotal < 999 && (
                  <p className="text-xs text-center text-foreground-muted mb-4">
                    Add {formatPrice(999 - subtotal)} more for free shipping!
                  </p>
                )} */}

                {/* Checkout Button */}
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="block w-full bg-foreground text-white py-4 text-center text-sm uppercase tracking-widest hover:bg-accent-gold transition-colors"
                >
                  Proceed to Checkout
                </Link>

                {/* Continue Shopping */}
                <button
                  onClick={closeCart}
                  className="w-full mt-3 py-3 text-center text-sm uppercase tracking-widest text-foreground-muted hover:text-foreground transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
