"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/Skeleton";
import Footer from "@/components/Footer";
import { getProducts } from "@/lib/sanity";
import EmptyState from "@/components/EmptyState";
import { Search } from "lucide-react";

const categories = [
  { id: "all", name: "All Products" },
  { id: "ritual", name: "Ritual Essentials" },
  { id: "lifestyle", name: "Lifestyle & Sacred Home" },
  { id: "apparel", name: "Vishwa Apparel" },
  { id: "combos", name: "Combos & Gifts" },
];

const sortOptions = [
  { id: "featured", name: "Featured" },
  { id: "newest", name: "Newest" },
  { id: "price-asc", name: "Price: Low to High" },
  { id: "price-desc", name: "Price: High to Low" },
  { id: "bestselling", name: "Best Selling" },
];

const PRODUCTS_PER_PAGE = 12;

interface Product {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  category?: string | null;
  price: number;
  compareAtPrice?: number;
  image: string;
  inventory?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  tags?: string[];
}

function ShopContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Read category and search from URL params
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const searchParam = searchParams.get("search");
    const pageParam = searchParams.get("page");

    if (categoryParam) {
      const categoryMap: Record<string, string> = {
        rituals: "ritual",
        ritual: "ritual",
        lifestyle: "lifestyle",
        apparel: "apparel",
        gifts: "combos",
        combos: "combos",
      };
      setActiveCategory(categoryMap[categoryParam] || categoryParam);
    }

    if (searchParam) {
      setSearchQuery(searchParam);
    }

    if (pageParam) {
      setCurrentPage(parseInt(pageParam, 10) || 1);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data || []);
      } catch {
        // Silent error - will show empty state
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, sortBy, priceRange, searchQuery]);

  const filteredProducts = useMemo(() => {
    let result = activeCategory === "all"
      ? products
      : products.filter((p) => {
        const productCategory = typeof p.category === 'string'
          ? p.category.toLowerCase()
          : '';
        return productCategory === activeCategory;
      });

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((p) => {
        const productCategory = typeof p.category === 'string' ? p.category.toLowerCase() : '';
        return (
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          productCategory.includes(query)
        );
      });
    }

    // Filter by price range
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Sort
    switch (sortBy) {
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result = [...result].reverse();
        break;
      case "bestselling":
        result = [...result].sort((a, b) => {
          if (a.isBestSeller && !b.isBestSeller) return -1;
          if (!a.isBestSeller && b.isBestSeller) return 1;
          return 0;
        });
        break;
      default:
        // Featured: best sellers first, then new, then rest
        result = [...result].sort((a, b) => {
          if (a.isBestSeller && !b.isBestSeller) return -1;
          if (!a.isBestSeller && b.isBestSeller) return 1;
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
          return 0;
        });
        break;
    }

    return result;
  }, [products, activeCategory, sortBy, priceRange, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      ritual: "Ritual Essentials",
      lifestyle: "Lifestyle & Sacred Home",
      apparel: "Vishwa Apparel",
      combos: "Combos & Gifts",
    };
    return labels[cat] || cat;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-white pt-16 sm:pt-20">
      {/* Shop Banner */}
      <section className="relative h-[30vh] sm:h-[35vh] md:h-[40vh] bg-background-alt flex items-center justify-center text-center px-4 sm:px-6">
        <div className="max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif mb-3 sm:mb-4 text-foreground leading-tight"
          >
            Agnihotra Essentials & <br className="hidden sm:block" /> Vedic Lifestyle Products
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm sm:text-base md:text-lg text-foreground-muted font-light tracking-wide px-4"
          >
            Everything for a home filled with purity and peace.
          </motion.p>
        </div>
      </section>

      {/* Category Navigation */}
      <nav
        className="sticky top-16 sm:top-20 z-40 bg-white/95 backdrop-blur border-b border-gray-100 py-3 sm:py-4"
        aria-label="Product categories"
      >
        <div className="container mx-auto px-4 sm:px-6 overflow-x-auto scrollbar-hide">
          <div className="flex space-x-4 sm:space-x-6 md:space-x-8 min-w-max justify-start sm:justify-center" role="tablist">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                role="tab"
                aria-selected={activeCategory === cat.id}
                className={`text-xs sm:text-sm uppercase tracking-widest transition-colors duration-300 whitespace-nowrap px-2 sm:px-0 ${activeCategory === cat.id
                  ? "text-accent-gold font-medium border-b-2 border-accent-gold pb-1"
                  : "text-foreground-muted hover:text-foreground"
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Product Grid */}
      <section className="py-8 sm:py-12 md:py-16 container mx-auto px-4 sm:px-6" aria-label="Products">
        {/* Search Results Header */}
        {searchQuery && (
          <div className="mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div>
                <h2 className="text-lg sm:text-xl font-serif mb-1">
                  Search Results for "{searchQuery}"
                </h2>
                <p className="text-xs sm:text-sm text-foreground-muted">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery("");
                  window.history.replaceState({}, '', '/shop');
                }}
                className="text-xs sm:text-sm text-accent-gold hover:underline"
              >
                Clear search
              </button>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
          <span className="text-xs sm:text-sm text-foreground-muted">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
            {searchQuery && ` for "${searchQuery}"`}
          </span>
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            {/* Sort Dropdown */}
            <div className="relative flex-1 sm:flex-none">
              <label htmlFor="sort-select" className="sr-only">Sort products</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-transparent border border-gray-200 px-3 sm:px-4 py-2 pr-8 text-xs sm:text-sm uppercase tracking-widest cursor-pointer focus:outline-none focus:border-accent-gold"
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm uppercase tracking-widest hover:text-accent-gold border border-gray-200 px-3 sm:px-4 py-2 whitespace-nowrap"
              aria-expanded={isFilterOpen}
              aria-controls="filter-panel"
            >
              <SlidersHorizontal size={14} className="sm:w-4 sm:h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>
        </div>

        {/* Products */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 gap-y-8 sm:gap-y-10 md:gap-y-12">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeCategory}-${sortBy}-${currentPage}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 gap-y-8 sm:gap-y-10 md:gap-y-12"
            >
              {paginatedProducts.map((product) => {
                const tag = product.isBestSeller ? "Best Seller" :
                  product.isNew ? "New" :
                    product.tags?.[0] || undefined;

                return (
                  <ProductCard
                    key={product._id}
                    id={product._id}
                    slug={product.slug}
                    name={product.name}
                    price={product.price}
                    compareAtPrice={product.compareAtPrice}
                    image={product.image}
                    tag={tag}
                    category={getCategoryLabel(typeof product.category === 'string' ? product.category : "")}
                    inventory={product.inventory}
                  />
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Empty State */}
        {!loading && filteredProducts.length === 0 && (
          <EmptyState
            icon={Search}
            title={searchQuery ? `No products found for "${searchQuery}"` : "No products in this category"}
            description={
              searchQuery
                ? "Try adjusting your search terms or browse all products."
                : "Browse other categories to find what you're looking for."
            }
            action={
              searchQuery
                ? {
                  label: "View All Products",
                  href: "/shop",
                }
                : {
                  label: "Browse All Products",
                  href: "/shop",
                }
            }
            secondaryAction={
              searchQuery
                ? {
                  label: "Clear Search",
                  onClick: () => {
                    setSearchQuery("");
                    window.history.replaceState({}, '', '/shop');
                  },
                }
                : undefined
            }
          />
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <nav className="mt-8 sm:mt-12 md:mt-16 flex justify-center items-center gap-1 sm:gap-2 overflow-x-auto pb-2" aria-label="Pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 sm:p-2 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 rounded"
              aria-label="Previous page"
            >
              <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first, last, current, and adjacent pages
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border text-xs sm:text-sm ${currentPage === page
                      ? "bg-foreground text-white border-foreground"
                      : "border-gray-200 hover:bg-gray-50"
                      }`}
                    aria-label={`Page ${page}`}
                    aria-current={currentPage === page ? "page" : undefined}
                  >
                    {page}
                  </button>
                );
              }

              // Show ellipsis
              if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <span key={page} className="px-1 sm:px-2 text-foreground-muted text-xs sm:text-sm">
                    ...
                  </span>
                );
              }

              return null;
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 sm:p-2 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 rounded"
              aria-label="Next page"
            >
              <ChevronRight size={18} className="sm:w-5 sm:h-5" />
            </button>
          </nav>
        )}
      </section>

      {/* Filter Sidebar */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/40 z-50"
              aria-hidden="true"
            />
            <motion.aside
              id="filter-panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full sm:max-w-sm bg-white z-50 shadow-xl overflow-y-auto"
              role="dialog"
              aria-label="Filter products"
            >
              <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 className="font-serif text-lg sm:text-xl">Filters</h2>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  aria-label="Close filters"
                  className="p-1"
                >
                  <X size={20} className="sm:w-6 sm:h-6" />
                </button>
              </div>
              <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
                {/* Price Range */}
                <fieldset>
                  <legend className="text-xs sm:text-sm uppercase tracking-widest mb-3 sm:mb-4">
                    Price Range
                  </legend>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="flex-1">
                      <label htmlFor="min-price" className="sr-only">Minimum price</label>
                      <input
                        id="min-price"
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) =>
                          setPriceRange([Number(e.target.value), priceRange[1]])
                        }
                        className="w-full border border-gray-200 px-3 py-2 text-sm"
                        placeholder="Min"
                      />
                    </div>
                    <span aria-hidden="true" className="text-foreground-muted">-</span>
                    <div className="flex-1">
                      <label htmlFor="max-price" className="sr-only">Maximum price</label>
                      <input
                        id="max-price"
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) =>
                          setPriceRange([priceRange[0], Number(e.target.value)])
                        }
                        className="w-full border border-gray-200 px-3 py-2 text-sm"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                </fieldset>

                {/* Categories */}
                <fieldset>
                  <legend className="text-xs sm:text-sm uppercase tracking-widest mb-3 sm:mb-4">
                    Category
                  </legend>
                  <div className="space-y-2 sm:space-y-3">
                    {categories.map((cat) => (
                      <label
                        key={cat.id}
                        className="flex items-center gap-2 sm:gap-3 cursor-pointer py-1"
                      >
                        <input
                          type="radio"
                          name="category"
                          checked={activeCategory === cat.id}
                          onChange={() => setActiveCategory(cat.id)}
                          className="accent-accent-gold w-4 h-4"
                        />
                        <span className="text-sm">{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                {/* Apply Button */}
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full bg-foreground text-white py-2.5 sm:py-3 text-xs sm:text-sm uppercase tracking-widest hover:bg-accent-gold transition-colors"
                >
                  Apply Filters
                </button>

                {/* Reset */}
                <button
                  onClick={() => {
                    setActiveCategory("all");
                    setPriceRange([0, 10000]);
                    setSortBy("featured");
                  }}
                  className="w-full py-2.5 sm:py-3 text-xs sm:text-sm uppercase tracking-widest text-foreground-muted hover:text-foreground"
                >
                  Reset All
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-white pt-16 sm:pt-20">
        <section className="relative h-[30vh] sm:h-[35vh] md:h-[40vh] bg-background-alt flex items-center justify-center">
          <div className="animate-pulse text-accent-gold">Loading...</div>
        </section>
      </main>
    }>
      <ShopContent />
    </Suspense>
  );
}
