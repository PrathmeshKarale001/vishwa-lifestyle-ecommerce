"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Minus, Plus, ShoppingBag, Heart, Share2, Truck, Shield, RotateCcw, AlertCircle, Copy, Check, Ruler, ChevronRight, MessageSquare, Tag } from "lucide-react";
import { PortableText } from "@portabletext/react";
import SizeChartModal from "./SizeChartModal";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import ReviewsSection from "./ReviewsSection";
import toast from "react-hot-toast";
import ImageZoom from "@/components/ImageZoom";
import ProductCard from "@/components/ProductCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import { supabase } from "@/lib/supabase";
import { log } from "@/lib/logger";
import { useAppKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

interface ProductVariant {
    size: string;
    sku: string;
    price: number;
    compareAtPrice?: number;
    inventory: number;
}

interface Product {
    _id: string;
    slug: string;
    name: string;
    price: number;
    compareAtPrice?: number;
    category?: string | null;
    categoryName?: string;
    description: string;
    features?: string[];
    images?: string[];
    imageLqips?: string[];
    mainImage?: string;
    mainImageLqip?: string;
    image?: string;
    lqip?: string;
    rating?: number;
    reviewCount?: number;
    inventory?: number;
    unitType?: string;
    packaging?: string;
    isNew?: boolean;
    isBestSeller?: boolean;
    sku?: string;
    variants?: ProductVariant[];
    metaTitle?: string;
    metaDescription?: string;
    dimensions?: string;
    weight?: string;
    shelfLife?: string;
    additionalDetails?: {
        title: string;
        content: any[];
    }[];
    sizeChart?: {
        title: string;
        type: string;
        gender: string;
        headers: string[];
        rows: { cells: string[] }[];
        image?: string;
    };
}

interface Review {
    id: string;
    user_name: string;
    rating: number;
    content: string;
    created_at: string;
    is_verified: boolean;
}

interface ProductPageContentProps {
    product: Product;
    relatedProducts: Product[];
    slug: string;
}

export default function ProductPageContent({ product, relatedProducts, slug }: ProductPageContentProps) {
    // Enable keyboard shortcuts
    useAppKeyboardShortcuts();

    const searchParams = useSearchParams();
    const writeReviewInitial = searchParams.get("writeReview") === "true";

    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [copied, setCopied] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
        product.variants && product.variants.length > 0 ? product.variants[0] : null
    );
    const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
    const [activeCoupons, setActiveCoupons] = useState<any[]>([]);

    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const res = await fetch('/api/coupons/public');
                const data = await res.json();
                if (data.coupons) setActiveCoupons(data.coupons);
            } catch (e) {
                console.error("Failed to fetch coupons", e);
            }
        };
        fetchCoupons();
    }, []);

    const addItem = useCartStore((state) => state.addItem);
    const { isInWishlist, toggleItem } = useWishlistStore();
    const isWishlisted = isInWishlist(product._id);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
        }).format(price);
    };

    const handleAddToCart = useCallback(() => {
        const currentInventory = selectedVariant ? selectedVariant.inventory : product.inventory;
        const currentPrice = selectedVariant ? selectedVariant.price : product.price;
        const currentSku = selectedVariant ? selectedVariant.sku : product.sku;

        const inventoryValue = currentInventory ?? 10;
        if (inventoryValue <= 0) {
            toast.error("This product is out of stock");
            return;
        }

        const productImage = product.images?.[0] || product.mainImage || "";
        addItem({
            id: selectedVariant ? `${product._id}-${selectedVariant.sku}` : `${product._id}-${Date.now()}`,
            productId: product._id,
            name: product.name,
            price: currentPrice,
            image: productImage,
            slug: slug,
            maxQuantity: currentInventory || 10,
            quantity,
            size: selectedVariant?.size,
            variantSku: currentSku,
            category: product.category || undefined,
        });
        toast.success(`${product.name}${selectedVariant ? ` (${selectedVariant.size})` : ''} added to cart`);
    }, [product, quantity, slug, addItem, selectedVariant]);

    const handleToggleWishlist = useCallback(() => {
        const productImage = product.images?.[0] || product.mainImage || "";
        toggleItem({
            id: `wishlist-${product._id}`,
            productId: product._id,
            name: product.name,
            price: product.price,
            image: productImage,
            slug: slug,
        });
        toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
    }, [product, slug, isWishlisted, toggleItem]);

    const handleShare = async () => {
        const url = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.name,
                    text: product.description,
                    url: url,
                });
            } catch {
                // User cancelled or share failed
            }
        } else {
            try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                toast.success("Link copied to clipboard!");
                setTimeout(() => setCopied(false), 2000);
            } catch {
                toast.error("Failed to copy link");
            }
        }
    };

    const getCategoryLabel = (cat: string | null | undefined) => {
        if (!cat) return "";
        return product.categoryName || cat.charAt(0).toUpperCase() + cat.slice(1);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""} ago`;
        return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? "s" : ""} ago`;
    };

    const productImages = product.images?.filter(Boolean) || (product.mainImage ? [product.mainImage] : []) || [];
    const displayImages = productImages.length > 0
        ? productImages
        : ["https://images.unsplash.com/photo-1602825266970-721285fc6e43?q=80&w=1200&auto=format&fit=crop"];

    const currentInventory = selectedVariant ? selectedVariant.inventory : product.inventory;
    const currentPrice = selectedVariant ? selectedVariant.price : product.price;
    const currentCompareAtPrice = selectedVariant ? selectedVariant.compareAtPrice : product.compareAtPrice;
    const currentSku = selectedVariant ? selectedVariant.sku : product.sku;

    const effectiveInventory = currentInventory ?? 10;
    const isOutOfStock = effectiveInventory <= 0;
    const isLowStock = effectiveInventory > 0 && effectiveInventory <= 5;
    const averageRating = product.rating || 0;

    const portableTextComponents = {
        list: {
            bullet: ({ children }: any) => (
                <ul className="space-y-1.5 list-none">
                    {children}
                </ul>
            ),
        },
        listItem: {
            bullet: ({ children }: any) => (
                <li className="flex items-start gap-2">
                    <span className="text-accent-gold mt-1 text-[10px]">•</span>
                    <span>{children}</span>
                </li>
            ),
        },
        block: {
            normal: ({ children }: any) => (
                <p className="text-sm text-foreground-muted font-light leading-relaxed mb-3 last:mb-0">
                    {children}
                </p>
            ),
        },
        marks: {
            strong: ({ children }: any) => <strong className="font-semibold text-foreground">{children}</strong>,
            em: ({ children }: any) => <em className="italic">{children}</em>,
        }
    };

    return (
        <main className="min-h-screen bg-white pt-24">
            {/* Breadcrumb */}
            <div className="container mx-auto px-6 mb-8">
                <Breadcrumbs
                    items={[
                        { label: "Shop", href: "/shop" },
                        ...(product.category ? [{ label: product.categoryName || "Category", href: `/shop?category=${product.category}` }] : []),
                        { label: product.name },
                    ]}
                />
            </div>

            {/* Product Section */}
            <section className="container mx-auto px-6 mb-24">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Product Images with Zoom */}
                    <ImageZoom
                        images={displayImages}
                        alt={product.name}
                        selectedIndex={selectedImage}
                        onIndexChange={setSelectedImage}
                        lqips={product.imageLqips}
                    />

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="w-full lg:w-1/2 lg:pl-8"
                    >
                        {/* Category & SKU */}
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-accent-gold text-[10px] sm:text-xs tracking-[0.2em] uppercase font-medium">
                                {product.category}
                            </span>
                            {currentSku && (
                                <span className="text-[10px] sm:text-xs text-foreground-muted bg-gray-100 px-2 py-0.5 rounded">
                                    SKU: {currentSku}
                                </span>
                            )}
                        </div>

                        {/* Product Name */}
                        <h1 className="text-4xl md:text-5xl font-serif mb-4 text-foreground">
                            {product.name}
                        </h1>

                        {/* Price & Rating */}
                        <div className="flex items-center flex-wrap gap-4 mb-6">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-light">{formatPrice(currentPrice)}</span>
                                {currentCompareAtPrice && currentCompareAtPrice > currentPrice && (
                                    <span className="text-lg text-foreground-muted line-through">
                                        {formatPrice(currentCompareAtPrice)}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center text-accent-gold text-sm" aria-label={`Rating: ${averageRating.toFixed(1)} out of 5`}>
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={14}
                                        fill={i < Math.floor(averageRating) ? "currentColor" : "none"}
                                        aria-hidden="true"
                                    />
                                ))}
                                <span className="text-foreground-muted ml-2">
                                    ({product.reviewCount || 0} Reviews)
                                </span>
                            </div>
                        </div>

                        {/* Available Offers */}
                        {activeCoupons.length > 0 && (
                            <div className="mb-6 p-4 bg-accent-gold/5 border border-accent-gold/20 rounded-lg">
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-accent-gold mb-3">
                                    <Tag size={16} /> Available Offers
                                </h3>
                                <div className="space-y-2">
                                    {activeCoupons.map((coupon, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-sm bg-white p-2 rounded border border-dashed border-gray-300">
                                            <div>
                                                <span className="font-bold text-gray-800">{coupon.code}</span>
                                                <span className="mx-2 text-gray-400">|</span>
                                                <span className="text-gray-600">
                                                    {coupon.discount_type === 'percentage'
                                                        ? `${coupon.discount_value}% OFF`
                                                        : `₹${coupon.discount_value} OFF`}
                                                    {coupon.min_order_amount > 0 && ` on orders above ₹${coupon.min_order_amount}`}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(coupon.code);
                                                    toast.success("Coupon code copied!");
                                                }}
                                                className="text-xs text-accent-gold hover:underline font-medium uppercase tracking-wide ml-4"
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Stock Status */}
                        {isOutOfStock && (
                            <div className="flex items-center gap-2 text-red-500 mb-4 p-3 bg-red-50 rounded">
                                <AlertCircle size={18} />
                                <span className="text-sm font-medium">Out of Stock</span>
                            </div>
                        )}
                        {isLowStock && (
                            <div className="flex items-center gap-2 text-orange-500 mb-4 p-3 bg-orange-50 rounded">
                                <AlertCircle size={18} />
                                <span className="text-sm font-medium">Only {currentInventory} left in stock - order soon!</span>
                            </div>
                        )}

                        {/* Size Selector */}
                        {product.variants && product.variants.length > 0 && (
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs uppercase tracking-widest text-foreground-muted">Select Size</h3>
                                    {product.sizeChart && (
                                        <button
                                            onClick={() => setIsSizeModalOpen(true)}
                                            className="text-[10px] uppercase tracking-widest text-accent-gold hover:text-accent-gold/80 transition-colors flex items-center gap-1.5 font-medium"
                                        >
                                            <Ruler size={12} />
                                            View Size Guide
                                            <ChevronRight size={10} />
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {product.variants.map((v: ProductVariant) => (
                                        <button
                                            key={v.sku}
                                            onClick={() => setSelectedVariant(v)}
                                            className={`min-w-[48px] h-12 px-4 border text-sm transition-all duration-300 ${selectedVariant?.sku === v.sku
                                                ? "border-foreground bg-foreground text-white"
                                                : "border-gray-200 text-foreground hover:border-foreground"
                                                }`}
                                        >
                                            {v.size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <p className="text-foreground-muted leading-relaxed font-light mb-8 whitespace-pre-wrap">
                            {product.description}
                        </p>

                        <div className="flex flex-col space-y-4 mb-8">
                            <div className="flex items-center gap-3 sm:gap-6">
                                <div className="flex items-center border border-gray-200" role="group" aria-label="Quantity selector">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="p-2 sm:p-3 hover:bg-gray-50 transition-colors"
                                        aria-label="Decrease quantity"
                                        disabled={isOutOfStock}
                                    >
                                        <Minus size={14} className="sm:w-4 sm:h-4" />
                                    </button>
                                    <span className="w-8 sm:w-12 text-center text-xs sm:text-sm" aria-label={`Quantity: ${quantity}`}>
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(Math.min(currentInventory || 10, quantity + 1))}
                                        className="p-2 sm:p-3 hover:bg-gray-50 transition-colors"
                                        aria-label="Increase quantity"
                                        disabled={isOutOfStock || quantity >= (currentInventory || 10)}
                                    >
                                        <Plus size={14} className="sm:w-4 sm:h-4" />
                                    </button>
                                </div>
                                <button
                                    onClick={handleAddToCart}
                                    disabled={isOutOfStock}
                                    className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 uppercase tracking-[0.1em] sm:tracking-widest text-[10px] sm:text-sm transition-colors duration-300 flex items-center justify-center gap-2 ${isOutOfStock
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-foreground text-white hover:bg-accent-gold"
                                        }`}
                                >
                                    <ShoppingBag size={16} className="sm:w-5 sm:h-5" /> {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                                </button>
                            </div>

                            <div className="flex space-x-4 text-sm text-foreground-muted">
                                <button
                                    onClick={handleToggleWishlist}
                                    className={`flex items-center gap-2 hover:text-foreground transition-colors ${isWishlisted ? "text-red-500" : ""
                                        }`}
                                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                >
                                    <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
                                    {isWishlisted ? "In Wishlist" : "Add to Wishlist"}
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                                    aria-label="Share product"
                                >
                                    {copied ? <Check size={16} /> : <Share2 size={16} />}
                                    {copied ? "Copied!" : "Share"}
                                </button>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-gray-100 mb-8">
                            <div className="text-center">
                                <Truck size={20} className="mx-auto mb-2 text-accent-gold" aria-hidden="true" />
                                <span className="text-xs uppercase tracking-widest text-foreground-muted">
                                    Free Shipping
                                </span>
                            </div>
                            <div className="text-center">
                                <Shield size={20} className="mx-auto mb-2 text-accent-gold" aria-hidden="true" />
                                <span className="text-xs uppercase tracking-widest text-foreground-muted">
                                    Secure Payment
                                </span>
                            </div>
                            <div className="text-center">
                                <RotateCcw size={20} className="mx-auto mb-2 text-accent-gold" aria-hidden="true" />
                                <span className="text-xs uppercase tracking-widest text-foreground-muted">
                                    Easy Returns
                                </span>
                            </div>
                        </div>

                        {/* Technical Specifications */}
                        {(product.dimensions || product.weight || product.shelfLife || product.packaging) && (
                            <div className="mb-8 border-t border-gray-100 pt-8">
                                <h2 className="font-serif text-lg mb-4">Product Specifications</h2>
                                <div className="grid grid-cols-2 gap-y-4 text-sm">
                                    {product.dimensions && (
                                        <>
                                            <span className="text-foreground-muted">Dimensions</span>
                                            <span className="text-foreground font-medium">{product.dimensions}</span>
                                        </>
                                    )}
                                    {product.weight && (
                                        <>
                                            <span className="text-foreground-muted">Weight</span>
                                            <span className="text-foreground font-medium">{product.weight}</span>
                                        </>
                                    )}
                                    {product.shelfLife && (
                                        <>
                                            <span className="text-foreground-muted">Shelf Life</span>
                                            <span className="text-foreground font-medium">{product.shelfLife}</span>
                                        </>
                                    )}
                                    {product.unitType && (
                                        <>
                                            <span className="text-foreground-muted">Unit Type</span>
                                            <span className="text-foreground font-medium">{product.unitType}</span>
                                        </>
                                    )}
                                    {product.packaging && (
                                        <>
                                            <span className="text-foreground-muted">Packaging</span>
                                            <span className="text-foreground font-medium">{product.packaging}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Features */}
                        {product.features && product.features.length > 0 && (
                            <div className="mb-8">
                                <h2 className="font-serif text-lg mb-4 text-foreground/90">What's Included</h2>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-foreground-muted font-light">
                                    {product.features.map((feature: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-accent-gold mt-1">•</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </motion.div>
                </div>
                {/* Additional Description - Grid of 4 */}
                {product.additionalDetails && product.additionalDetails.length > 0 && (
                    <div className="mt-20 border-t border-gray-100 pt-16 mb-20">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                            {product.additionalDetails.map((detail, index) => (
                                <div key={index} className="space-y-5">
                                    <h3 className="font-serif text-lg md:text-xl text-foreground relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-px after:bg-accent-gold uppercase tracking-wider">
                                        {detail.title}
                                    </h3>
                                    <div className="prose prose-sm max-w-none prose-vishwa">
                                        {Array.isArray(detail.content) ? (
                                            <PortableText value={detail.content} components={portableTextComponents} />
                                        ) : (
                                            <p className="text-sm text-foreground-muted font-light leading-relaxed">
                                                {detail.content}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {/* Reviews Section */}
            <section className="py-20 bg-background-alt" id="reviews">
                <div className="container mx-auto px-6 max-w-5xl">
                    <ReviewsSection
                        productId={product._id}
                        initialShowForm={writeReviewInitial}
                    />
                </div>
            </section>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <section className="py-20 container mx-auto px-6">
                    <h2 className="text-3xl font-serif mb-12 text-center">You May Also Like</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                        {relatedProducts.map((relatedProduct: Product) => {
                            const tag = relatedProduct.isBestSeller ? "Best Seller" :
                                relatedProduct.isNew ? "New" : undefined;

                            return (
                                <ProductCard
                                    key={relatedProduct._id}
                                    id={relatedProduct._id}
                                    slug={relatedProduct.slug}
                                    name={relatedProduct.name}
                                    price={relatedProduct.price}
                                    compareAtPrice={relatedProduct.compareAtPrice}
                                    image={relatedProduct.image || "/placeholder-product.svg"}
                                    category={getCategoryLabel(relatedProduct.category || "")}
                                    categorySlug={relatedProduct.category || undefined}
                                    tag={tag}
                                    inventory={relatedProduct.inventory}
                                    lqip={relatedProduct.lqip}
                                />
                            );
                        })}
                    </div>
                </section>
            )}
            {/* Size Chart Modal */}
            {product.sizeChart && (
                <SizeChartModal
                    isOpen={isSizeModalOpen}
                    onClose={() => setIsSizeModalOpen(false)}
                    sizeChart={product.sizeChart}
                />
            )}
        </main>
    );
}
