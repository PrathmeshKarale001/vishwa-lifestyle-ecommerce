"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Star, Minus, Plus, ShoppingBag, Heart, Share2, Truck, Shield, RotateCcw, AlertCircle, Copy, Check } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import toast from "react-hot-toast";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ImageZoom from "@/components/ImageZoom";
import { ProductCardSkeleton } from "@/components/Skeleton";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getProductBySlug, getProducts } from "@/lib/sanity";
import { generateProductSchema, generateBreadcrumbSchema } from "@/lib/seo";
import { supabase } from "@/lib/supabase";
import { getProductRecommendations } from "@/lib/recommendations";
import { addToRecentlyViewed } from "@/lib/recently-viewed";
import { log } from "@/lib/logger";
import { useAppKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

interface Product {
  _id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  category?: string | null;
  description: string;
  features?: string[];
  images?: string[];
  mainImage?: string;
  image?: string; // For products from getProducts()
  rating?: number;
  reviewCount?: number;
  inventory?: number;
  ritualSignificance?: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  sku?: string;
}

interface Review {
  id: string;
  user_name: string;
  rating: number;
  content: string;
  created_at: string;
  is_verified: boolean;
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  // Enable keyboard shortcuts
  useAppKeyboardShortcuts();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [copied, setCopied] = useState(false);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductBySlug(slug);
        if (!data) {
          router.push("/shop");
          return;
        }
        setProduct(data);
        setSelectedImage(0);
        
        // Track recently viewed
        if (data) {
          addToRecentlyViewed({
            id: data._id,
            slug: data.slug,
            name: data.name,
            image: data.images?.[0] || data.mainImage || "",
            price: data.price,
          });
        }
        
        // Fetch product recommendations using smart algorithm
        try {
          const recommendations = await getProductRecommendations(data, 4);
          // Map recommendations to match Product interface
          const mappedRecommendations = recommendations.map((rec: any) => ({
            _id: rec._id,
            slug: rec.slug,
            name: rec.name,
            price: rec.price,
            compareAtPrice: rec.compareAtPrice,
            category: rec.category || null,
            description: rec.description || "",
            image: rec.image || "",
            inventory: rec.inventory,
            isNew: rec.isNew,
            isBestSeller: rec.isBestSeller,
          }));
          setRelatedProducts(mappedRecommendations);
        } catch (error) {
          log.error("Error fetching recommendations", error);
          // Fallback to category-based
          const allProducts = await getProducts();
          const related = allProducts
            .filter((p: any) => {
              const productCategory = typeof p.category === 'string' ? p.category : '';
              const dataCategory = typeof data.category === 'string' ? data.category : '';
              return productCategory === dataCategory && p.slug !== slug;
            })
            .slice(0, 4);
          setRelatedProducts(related);
        }
      } catch {
        router.push("/shop");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug, router]);

  // Fetch reviews from Supabase
  useEffect(() => {
    const fetchReviews = async () => {
      if (!product || !supabase) {
        setReviewsLoading(false);
        return;
      }

      try {
        const { data } = await supabase
          .from("reviews")
          .select("*")
          .eq("product_id", product._id)
          .order("created_at", { ascending: false })
          .limit(6);

        if (data) {
          setReviews(data);
        }
      } catch {
        // Fallback to empty reviews
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    if (product) {
      fetchReviews();
    }
  }, [product]);

  const addItem = useCartStore((state) => state.addItem);
  const { isInWishlist, toggleItem } = useWishlistStore();
  const isWishlisted = product ? isInWishlist(product._id) : false;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    
    if (product.inventory !== undefined && product.inventory <= 0) {
      toast.error("This product is out of stock");
      return;
    }
    
    const productImage = product.images?.[0] || product.mainImage || "";
    addItem({
      id: `${product._id}-${Date.now()}`,
      productId: product._id,
      name: product.name,
      price: product.price,
      image: productImage,
      slug: slug,
      maxQuantity: product.inventory || 10,
      quantity,
    });
    toast.success(`${product.name} added to cart`);
  }, [product, quantity, slug, addItem]);

  const handleToggleWishlist = useCallback(() => {
    if (!product) return;
    
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
          title: product?.name,
          text: product?.description,
          url: url,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
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
    const labels: Record<string, string> = {
      ritual: "Ritual Essentials",
      lifestyle: "Lifestyle & Sacred Home",
      apparel: "Vishwa Apparel",
      combos: "Combos & Gifts",
    };
    return labels[cat] || cat;
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

  // Loading skeleton
  if (loading) {
    return (
      <main className="min-h-screen bg-white pt-24">
        <div className="container mx-auto px-6 mb-8">
          <div className="h-4 w-64 bg-gray-200 animate-pulse rounded" />
        </div>
        <section className="container mx-auto px-6 mb-24">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="w-full lg:w-1/2">
              <div className="aspect-square bg-gray-200 animate-pulse mb-4" />
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-gray-200 animate-pulse" />
                ))}
              </div>
            </div>
            <div className="w-full lg:w-1/2 space-y-4">
              <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
              <div className="h-10 w-3/4 bg-gray-200 animate-pulse rounded" />
              <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
              <div className="h-24 w-full bg-gray-200 animate-pulse rounded" />
              <div className="h-12 w-full bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  if (!product) {
    return null;
  }

  // Get product images, with fallback to placeholder
  const productImages = product.images?.filter(Boolean) || 
                       (product.mainImage ? [product.mainImage] : []) || 
                       [];
  
  // Ensure we always have at least one image for display
  const displayImages = productImages.length > 0 
    ? productImages 
    : ["https://images.unsplash.com/photo-1602825266970-721285fc6e43?q=80&w=1200&auto=format&fit=crop"];
  const isOutOfStock = product.inventory !== undefined && product.inventory <= 0;
  const isLowStock = product.inventory !== undefined && product.inventory > 0 && product.inventory <= 5;
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : product.rating || 0;

  // Generate JSON-LD structured data
  const productSchema = generateProductSchema({
    name: product.name,
    description: product.description,
    image: productImages[0] || "",
    price: product.price,
    currency: "INR",
    availability: isOutOfStock ? "OutOfStock" : "InStock",
    sku: product.sku || product._id,
    rating: averageRating,
    reviewCount: reviews.length || product.reviewCount || 0,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Shop", url: "/shop" },
    { name: product.name, url: `/product/${slug}` },
  ]);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="min-h-screen bg-white pt-24">
        {/* Breadcrumb */}
        <div className="container mx-auto px-6 mb-8">
          <Breadcrumbs
            items={[
              { label: "Shop", href: "/shop" },
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
            />

            {/* Product Info */}
            <div className="w-full lg:w-1/2 lg:pl-8">
              {/* Category */}
              <span className="text-accent-gold text-xs tracking-[0.2em] uppercase font-medium mb-2 block">
                {product.category}
              </span>

              {/* Product Name */}
              <h1 className="text-4xl md:text-5xl font-serif mb-4 text-foreground">
                {product.name}
              </h1>

              {/* Price & Rating */}
              <div className="flex items-center flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-light">{formatPrice(product.price)}</span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-lg text-foreground-muted line-through">
                      {formatPrice(product.compareAtPrice)}
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
                    ({reviews.length || product.reviewCount || 0} Reviews)
                  </span>
                </div>
              </div>

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
                  <span className="text-sm font-medium">Only {product.inventory} left in stock - order soon!</span>
                </div>
              )}

              {/* Description */}
              <p className="text-foreground-muted leading-relaxed font-light mb-8">
                {product.description}
              </p>

              {/* Quantity & Add to Cart */}
              <div className="flex flex-col space-y-4 mb-8">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center border border-gray-200" role="group" aria-label="Quantity selector">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-gray-50 transition-colors"
                      aria-label="Decrease quantity"
                      disabled={isOutOfStock}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center text-sm" aria-label={`Quantity: ${quantity}`}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.inventory || 10, quantity + 1))}
                      className="p-3 hover:bg-gray-50 transition-colors"
                      aria-label="Increase quantity"
                      disabled={isOutOfStock || quantity >= (product.inventory || 10)}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`flex-1 py-4 px-6 uppercase tracking-widest text-sm transition-colors duration-300 flex items-center justify-center gap-2 ${
                      isOutOfStock
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-foreground text-white hover:bg-accent-gold"
                    }`}
                  >
                    <ShoppingBag size={18} /> {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                  </button>
                </div>
                <div className="flex space-x-4 text-sm text-foreground-muted">
                  <button
                    onClick={handleToggleWishlist}
                    className={`flex items-center gap-2 hover:text-foreground transition-colors ${
                      isWishlisted ? "text-red-500" : ""
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

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div className="mb-8">
                  <h2 className="font-serif text-lg mb-4">What's Included</h2>
                  <ul className="list-disc list-inside text-sm text-foreground-muted space-y-2 font-light">
                    {product.features.map((feature: string, idx: number) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Ritual Significance */}
              {product.ritualSignificance && (
                <div className="bg-background-alt p-6 rounded">
                  <h2 className="font-serif text-lg mb-3">Ritual Significance</h2>
                  <p className="text-sm text-foreground-muted font-light leading-relaxed">
                    {product.ritualSignificance}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="py-20 bg-background-alt">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-serif mb-12 text-center">Customer Reviews</h2>
            
            {reviewsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white p-8 animate-pulse">
                    <div className="flex justify-center gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((j) => (
                        <div key={j} className="w-4 h-4 bg-gray-200 rounded" />
                      ))}
                    </div>
                    <div className="h-20 bg-gray-200 rounded mb-4" />
                    <div className="h-4 w-24 bg-gray-200 rounded mx-auto" />
                  </div>
                ))}
              </div>
            ) : reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {reviews.map((review) => (
                  <article key={review.id} className="bg-white p-8">
                    <div className="flex justify-center text-accent-gold mb-4" aria-label={`Rating: ${review.rating} out of 5`}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          fill={i < review.rating ? "currentColor" : "none"}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <blockquote className="text-foreground font-serif italic mb-4">
                      "{review.content}"
                    </blockquote>
                    <footer className="text-center">
                      <cite className="text-sm font-medium not-italic">{review.user_name}</cite>
                      {review.is_verified && (
                        <span className="text-xs text-accent-gold ml-2">✓ Verified</span>
                      )}
                      <p className="text-xs text-foreground-muted mt-1">{formatDate(review.created_at)}</p>
                    </footer>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-foreground-muted mb-4">No reviews yet. Be the first to review this product!</p>
              </div>
            )}
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="py-20 container mx-auto px-6">
            <h2 className="text-3xl font-serif mb-12 text-center">You May Also Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                    image={relatedProduct.image || "/placeholder-product.jpg"}
                    category={getCategoryLabel(relatedProduct.category || "")}
                    tag={tag}
                    inventory={relatedProduct.inventory}
                  />
                );
              })}
            </div>
          </section>
        )}

        <Footer />
      </main>
    </>
  );
}
