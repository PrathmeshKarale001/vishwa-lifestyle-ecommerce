"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist";
import { useCartStore } from "@/store/cart";
import Footer from "@/components/Footer";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const addToCart = useCartStore((state) => state.addItem);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = (item: typeof items[0]) => {
    addToCart({
      id: `${item.productId}-${Date.now()}`,
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      slug: item.slug,
      maxQuantity: 10,
    });
    removeItem(item.productId);
    toast.success(`${item.name} moved to cart`);
  };

  const handleRemove = (productId: string, name: string) => {
    removeItem(productId);
    toast.success(`${name} removed from wishlist`);
  };

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
            <span className="text-foreground">Wishlist</span>
          </nav>

          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-serif">My Wishlist</h1>
            {items.length > 0 && (
              <button
                onClick={() => {
                  clearWishlist();
                  toast.success("Wishlist cleared");
                }}
                className="text-sm text-foreground-muted hover:text-red-500 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <motion.div
                  key={item.productId}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-background-alt mb-4">
                    <Link href={`/product/${item.slug}`}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemove(item.productId, item.name)}
                      className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full text-foreground-muted hover:text-red-500 transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 size={16} />
                    </button>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="absolute bottom-0 left-0 right-0 bg-white text-black py-3 text-xs uppercase tracking-widest translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2 hover:bg-foreground hover:text-white"
                    >
                      <ShoppingBag size={14} /> Add to Cart
                    </button>
                  </div>

                  <div className="text-center">
                    <Link
                      href={`/product/${item.slug}`}
                      className="font-serif text-lg hover:text-accent-gold transition-colors"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-foreground-muted mt-1">
                      {formatPrice(item.price)}
                    </p>
                    <p className="text-xs text-foreground-muted mt-2">
                      Added {new Date(item.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-background-alt">
              <Heart size={64} className="mx-auto text-gray-300 mb-4" />
              <h2 className="font-serif text-xl mb-2">Your wishlist is empty</h2>
              <p className="text-foreground-muted mb-6">
                Save items you love to your wishlist
              </p>
              <Link
                href="/shop"
                className="inline-block bg-foreground text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-accent-gold transition-colors"
              >
                Browse Products
              </Link>
            </div>
          )}
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}

