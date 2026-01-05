"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Heart, Minus, Plus, Star } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import toast from "react-hot-toast";
import { getBlurPlaceholder } from "@/lib/image-utils";
import { getProductBySlug } from "@/lib/sanity";
import { createPortal } from "react-dom";

interface ProductQuickViewProps {
  productSlug: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Product {
  _id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  category: string;
  images?: string[];
  imageLqips?: string[];
  mainImage?: string;
  mainImageLqip?: string;
  lqip?: string;
  inventory?: number;
  rating?: number;
  reviewCount?: number;
}

export default function ProductQuickView({
  productSlug,
  isOpen,
  onClose,
}: ProductQuickViewProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [mounted, setMounted] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const { isInWishlist, toggleItem } = useWishlistStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && productSlug) {
      setLoading(true);
      getProductBySlug(productSlug)
        .then((data) => {
          if (data) {
            setProduct(data);
            setSelectedImage(0);
            setQuantity(1);
          }
        })
        .catch((error) => {
          console.error("Error fetching product:", error);
          toast.error("Failed to load product");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, productSlug]);

  const handleAddToCart = () => {
    if (!product) return;

    const effectiveInventory = product.inventory ?? 10;
    const isOutOfStock = effectiveInventory <= 0;
    if (isOutOfStock) {
      toast.error("This product is out of stock");
      return;
    }

    addItem({
      id: `${product._id}-${Date.now()}`,
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || product.mainImage || "",
      slug: product.slug,
      maxQuantity: product.inventory ?? 10,
    });

    toast.success(`${product.name} added to cart`);
    onClose();
  };

  const handleToggleWishlist = () => {
    if (!product) return;

    toggleItem({
      id: `wishlist-${product._id}`,
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || product.mainImage || "",
      slug: product.slug,
    });

    toast.success(isInWishlist(product._id) ? "Removed from wishlist" : "Added to wishlist");
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!isOpen || !mounted) return null;

  const productImages = product?.images?.filter(Boolean) ||
    (product?.mainImage ? [product.mainImage] : []) ||
    [];
  const displayImages = productImages.length > 0
    ? productImages
    : ["https://images.unsplash.com/photo-1602825266970-721285fc6e43?q=80&w=1200&auto=format&fit=crop"];
  const currentImage = displayImages[selectedImage] || displayImages[0];
  const effectiveInventory = product?.inventory ?? 10;
  const isOutOfStock = effectiveInventory <= 0;
  const isWishlisted = product ? isInWishlist(product._id) : false;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-serif">Quick View</h2>
            <button
              onClick={onClose}
              className="text-foreground-muted hover:text-foreground transition-colors"
              aria-label="Close quick view"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold mx-auto"></div>
                <p className="mt-4 text-foreground-muted">Loading product...</p>
              </div>
            ) : product ? (
              <div className="grid md:grid-cols-2 gap-8 p-6">
                {/* Images */}
                <div>
                  <div className="relative aspect-square bg-background-alt rounded-lg overflow-hidden mb-4">
                    <Image
                      src={currentImage}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                      priority
                      placeholder="blur"
                      blurDataURL={product.imageLqips?.[selectedImage] || product.lqip || product.mainImageLqip || getBlurPlaceholder(currentImage)}
                    />
                  </div>
                  {displayImages.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {displayImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(idx)}
                          className={`aspect-square rounded overflow-hidden border-2 transition-colors ${selectedImage === idx
                            ? "border-accent-gold"
                            : "border-transparent hover:border-gray-300"
                            }`}
                        >
                          <div className="relative w-full h-full">
                            <Image
                              src={img}
                              alt={`${product.name} ${idx + 1}`}
                              fill
                              sizes="100px"
                              className="object-cover"
                              placeholder="blur"
                              blurDataURL={product.imageLqips?.[idx] || getBlurPlaceholder(img)}
                            />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex flex-col">
                  <div className="mb-4">
                    <span className="text-accent-gold text-xs tracking-[0.2em] uppercase font-medium mb-2 block">
                      {product.category}
                    </span>
                    <h3 className="text-3xl font-serif mb-4">{product.name}</h3>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-2xl font-light">{formatPrice(product.price)}</span>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="text-lg text-foreground-muted line-through">
                          {formatPrice(product.compareAtPrice)}
                        </span>
                      )}
                      {product.rating && (
                        <div className="flex items-center gap-1">
                          <Star size={16} className="fill-accent-gold text-accent-gold" />
                          <span className="text-sm text-foreground-muted">
                            {product.rating.toFixed(1)} ({product.reviewCount || 0})
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-foreground-muted leading-relaxed mb-6 whitespace-pre-wrap">
                      {product.description}
                    </p>
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-sm font-medium">Quantity:</span>
                    <div className="flex items-center border border-gray-200">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 hover:bg-gray-100 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                      <button
                        onClick={() => {
                          const max = product.inventory ?? 10;
                          setQuantity(Math.min(max, quantity + 1));
                        }}
                        className="p-2 hover:bg-gray-100 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    {product.inventory !== undefined && product.inventory !== null && (
                      <span className="text-sm text-foreground-muted">
                        {isOutOfStock ? "Out of Stock" : `${product.inventory} available`}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddToCart}
                      disabled={isOutOfStock}
                      className={`flex-1 flex items-center justify-center gap-2 bg-foreground text-white py-3 px-6 uppercase tracking-widest text-sm hover:bg-accent-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <ShoppingBag size={16} />
                      {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                    </button>
                    <button
                      onClick={handleToggleWishlist}
                      className={`p-3 border-2 transition-colors ${isWishlisted
                        ? "border-red-500 text-red-500"
                        : "border-gray-200 text-foreground-muted hover:border-red-500 hover:text-red-500"
                        }`}
                      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                    </button>
                  </div>

                  {/* View Full Details Link */}
                  <Link
                    href={`/product/${product.slug}`}
                    onClick={onClose}
                    className="mt-4 text-center text-accent-gold hover:underline text-sm"
                  >
                    View full product details →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <p className="text-foreground-muted">Product not found</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
