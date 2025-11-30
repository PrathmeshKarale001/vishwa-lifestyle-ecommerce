"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import toast from "react-hot-toast";
import { getBlurPlaceholder } from "@/lib/image-utils";
import { useState } from "react";
import ProductQuickView from "./ProductQuickView";

interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  category?: string;
  tag?: string;
  inventory?: number;
}

export default function ProductCard({
  id,
  slug,
  name,
  price,
  compareAtPrice,
  image,
  category,
  tag,
  inventory = 10,
}: ProductCardProps) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const { isInWishlist, toggleItem } = useWishlistStore();

  const isWishlisted = isInWishlist(id);
  const isOutOfStock = inventory <= 0;
  const isLowStock = inventory > 0 && inventory <= 5;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error("This product is out of stock");
      return;
    }

    addItem({
      id: `${id}-${Date.now()}`,
      productId: id,
      name,
      price,
      image,
      slug,
      maxQuantity: inventory,
    });

    toast.success(`${name} added to cart`);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    toggleItem({
      id: `wishlist-${id}`,
      productId: id,
      name,
      price,
      image,
      slug,
    });

    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative"
    >
      <Link href={`/product/${slug}`} aria-label={`View ${name}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-background-alt mb-4">
          {/* Tag */}
          {tag && (
            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[10px] uppercase tracking-widest px-2 py-1 z-10">
              {tag}
            </span>
          )}

          {/* Stock Status Badge */}
          {isOutOfStock && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] uppercase tracking-widest px-2 py-1 z-10">
              Out of Stock
            </span>
          )}
          {isLowStock && !isOutOfStock && (
            <span className="absolute bottom-3 left-3 bg-orange-500 text-white text-[10px] uppercase tracking-widest px-2 py-1 z-10">
              Only {inventory} left
            </span>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur rounded-full transition-all duration-300 ${
              isWishlisted
                ? "text-red-500"
                : "text-foreground-muted hover:text-red-500"
            }`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
          </button>

          {/* Product Image */}
          <div className="relative w-full h-full">
            <Image
              src={image && image.trim() ? image : "/placeholder-product.jpg"}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className={`object-cover transition-transform duration-700 group-hover:scale-105 ${
                isOutOfStock ? "opacity-50" : ""
              }`}
              loading="lazy"
              placeholder="blur"
              blurDataURL={image && image.trim() ? getBlurPlaceholder(image) : getBlurPlaceholder("/placeholder-product.jpg")}
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                const target = e.target as HTMLImageElement;
                if (target.src !== "/placeholder-product.jpg") {
                  target.src = "/placeholder-product.jpg";
                }
              }}
            />
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

          {/* Quick Actions */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex gap-2 p-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsQuickViewOpen(true);
              }}
              className="flex-1 bg-white text-black py-2 text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors"
              aria-label={`Quick view ${name}`}
            >
              Quick View
            </button>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 py-2 text-xs uppercase tracking-widest flex items-center justify-center gap-1 ${
                isOutOfStock
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-foreground text-white hover:bg-accent-gold"
              }`}
              aria-label={isOutOfStock ? "Out of stock" : `Add ${name} to cart`}
            >
              <ShoppingBag size={14} /> {isOutOfStock ? "Out" : "Add"}
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="text-center">
          <h3 className="font-serif text-lg mb-1 group-hover:text-accent-gold transition-colors">
            {name}
          </h3>
          {category && (
            <p className="text-xs text-foreground-muted uppercase tracking-widest mb-2">
              {category}
            </p>
          )}
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm font-medium">{formatPrice(price)}</span>
            {compareAtPrice && compareAtPrice > price && (
              <span className="text-sm text-foreground-muted line-through">
                {formatPrice(compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Quick View Modal */}
      <ProductQuickView
        productSlug={slug}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </motion.article>
  );
}
