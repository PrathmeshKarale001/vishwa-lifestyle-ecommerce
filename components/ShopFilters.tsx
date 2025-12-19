"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, ChevronDown, X } from "lucide-react";

interface Category {
    _id: string;
    name: string;
    slug: string;
}

interface ShopFiltersProps {
    categories?: Category[];
}

const sortOptions = [
    { id: "featured", name: "Featured" },
    { id: "newest", name: "Newest" },
    { id: "price-asc", name: "Price: Low to High" },
    { id: "price-desc", name: "Price: High to Low" },
    { id: "bestselling", name: "Best Selling" },
];

function ShopFiltersContent({ categories = [] }: ShopFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Build category list with "All Products" at the start
    const categoryList: { id: string; name: string }[] = [
        { id: "all", name: "All Products" },
        ...categories.map(cat => ({ id: cat.slug, name: cat.name }))
    ];


    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "all");
    const [sortBy, setSortBy] = useState(searchParams.get("sort") || "featured");
    const [priceRange, setPriceRange] = useState<[number, number]>([
        Number(searchParams.get("minPrice")) || 0,
        Number(searchParams.get("maxPrice")) || 10000
    ]);
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

    // Update local state when URL params change
    useEffect(() => {
        setActiveCategory(searchParams.get("category") || "all");
        setSortBy(searchParams.get("sort") || "featured");
        setPriceRange([
            Number(searchParams.get("minPrice")) || 0,
            Number(searchParams.get("maxPrice")) || 10000
        ]);
        setSearchQuery(searchParams.get("search") || "");
    }, [searchParams]);


    const updateFilters = (updates: Record<string, string | number>) => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(updates).forEach(([key, value]) => {
            if (value === "" || value === "all" || value === 0 && key === "minPrice" || value === 10000 && key === "maxPrice") {
                params.delete(key);
            } else {
                params.set(key, String(value));
            }
        });

        // Reset page to 1 when filters change (if pagination is implemented later)
        params.delete("page");

        router.push(`/shop?${params.toString()}`, { scroll: false });
    };

    const handleCategoryChange = (categoryId: string) => {
        setActiveCategory(categoryId);
        updateFilters({ category: categoryId });
    };

    const handleSortChange = (sortId: string) => {
        setSortBy(sortId);
        updateFilters({ sort: sortId });
    };

    const handlePriceChange = (min: number, max: number) => {
        setPriceRange([min, max]);
    };

    const applyPriceFilter = () => {
        updateFilters({ minPrice: priceRange[0], maxPrice: priceRange[1] });
        setIsFilterOpen(false);
    };

    const clearSearch = () => {
        setSearchQuery("");
        updateFilters({ search: "" });
    };

    return (
        <>
            {/* Category Navigation */}
            <nav
                className="sticky top-16 sm:top-20 z-40 bg-white/95 backdrop-blur border-b border-gray-100 py-3 sm:py-4"
                aria-label="Product categories"
            >
                <div className="container mx-auto px-4 sm:px-6 overflow-x-auto scrollbar-hide">
                    <div className="flex space-x-4 sm:space-x-6 md:space-x-8 min-w-max justify-start sm:justify-center" role="tablist">
                        {categoryList.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryChange(cat.id)}
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

            <div className="container mx-auto px-4 sm:px-6 mt-8">
                {/* Search Results Header */}
                {searchQuery && (
                    <div className="mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                            <div>
                                <h2 className="text-lg sm:text-xl font-serif mb-1">
                                    Search Results for "{searchQuery}"
                                </h2>
                            </div>
                            <button
                                onClick={clearSearch}
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
                        {/* Product count will be handled by parent or separate component if needed */}
                        Filter & Sort
                    </span>
                    <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                        {/* Sort Dropdown */}
                        <div className="relative flex-1 sm:flex-none">
                            <label htmlFor="sort-select" className="sr-only">Sort products</label>
                            <select
                                id="sort-select"
                                value={sortBy}
                                onChange={(e) => handleSortChange(e.target.value)}
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
            </div>

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
                                                    handlePriceChange(Number(e.target.value), priceRange[1])
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
                                                    handlePriceChange(priceRange[0], Number(e.target.value))
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
                                        {categoryList.map((cat) => (
                                            <label
                                                key={cat.id}
                                                className="flex items-center gap-2 sm:gap-3 cursor-pointer py-1"
                                            >
                                                <input
                                                    type="radio"
                                                    name="category"
                                                    checked={activeCategory === cat.id}
                                                    onChange={() => handleCategoryChange(cat.id)}
                                                    className="accent-accent-gold w-4 h-4"
                                                />
                                                <span className="text-sm">{cat.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </fieldset>

                                {/* Apply Button */}
                                <button
                                    onClick={applyPriceFilter}
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
                                        updateFilters({ category: "all", minPrice: 0, maxPrice: 10000, sort: "featured" });
                                        setIsFilterOpen(false);
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
        </>
    );
}

export default function ShopFilters({ categories }: ShopFiltersProps) {
    return (
        <Suspense fallback={<div className="h-16 bg-gray-50 animate-pulse" />}>
            <ShopFiltersContent categories={categories} />
        </Suspense>
    );
}
