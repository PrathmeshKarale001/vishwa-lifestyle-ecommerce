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
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group relative"
    >
      <Link href={`/product/${slug}`} aria-label={`View ${name}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-background-alt mb-4 group-hover:shadow-lg transition-shadow duration-500">
          {/* Tag */}
          {tag && (
            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[10px] uppercase tracking-widest px-3 py-1.5 z-10 shadow-sm">
              {tag}
            </span>
          )}

          {/* Stock Status Badge */}
          {isOutOfStock && (
            <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] uppercase tracking-widest px-3 py-1.5 z-10 shadow-sm">
              Out of Stock
            </span>
          )}
          {isLowStock && !isOutOfStock && (
            <span className="absolute bottom-3 left-3 bg-orange-500 text-white text-[10px] uppercase tracking-widest px-3 py-1.5 z-10 shadow-sm">
              Only {inventory} left
            </span>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-3 right-3 z-20 p-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm transition-all duration-300 hover:scale-110 active:scale-95 ${isWishlisted
              ? "text-red-500"
              : "text-foreground-muted hover:text-red-500"
              }`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} strokeWidth={1.5} />
          </button>

          {/* Product Image */}
          <div className="relative w-full h-full overflow-hidden">
            <Image
              src={image && image.trim() ? image : "/placeholder-product.svg"}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className={`object-cover transition-transform duration-1000 ease-out group-hover:scale-110 ${isOutOfStock ? "opacity-50 grayscale" : ""
                }`}
              loading="lazy"
              placeholder="blur"
              blurDataURL={image && image.trim() ? getBlurPlaceholder(image) : getBlurPlaceholder("/placeholder-product.svg")}
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                const target = e.target as HTMLImageElement;
                if (target.src !== "/placeholder-product.svg") {
                  target.src = "/placeholder-product.svg";
                }
              }}
            />
          </div>

          {/* Hover Overlay - subtle dark gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Quick Actions */}
          <div className="absolute bottom-4 left-4 right-4 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out flex gap-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsQuickViewOpen(true);
              }}
              className="flex-1 bg-white text-black py-2.5 text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors duration-300 shadow-lg"
              aria-label={`Quick view ${name}`}
            >
              Quick View
            </button>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 py-2.5 text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${isOutOfStock
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-black text-white hover:bg-accent-gold"
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
