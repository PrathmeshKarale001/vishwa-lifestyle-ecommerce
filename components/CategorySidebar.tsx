"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Category {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    subCategories?: string[];
    categorySegments?: { subCategoryName: string; segments: string[] }[];
}

interface CategorySidebarProps {
    categories: Category[]; // Keeping for backward compatibility if needed, but primarily using SHOP_CATEGORIES
}

export default function CategorySidebar({ categories }: CategorySidebarProps) {
    const searchParams = useSearchParams();
    const activeCategory = searchParams.get("category") || "all";
    const activeSubCategory = searchParams.get("sub");
    const activeSegment = searchParams.get("segment");
    const activeSort = searchParams.get("sort") || "featured";

    // State for expanded categories in sidebar
    const [expandedCategories, setExpandedCategories] = useState<string[]>(
        activeCategory !== "all" ? [activeCategory] : []
    );

    const toggleCategory = (slug: string) => {
        setExpandedCategories(prev =>
            prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
        );
    };

    const sortOptions = [
        { label: "Featured", value: "featured" },
        { label: "Newest", value: "newest" },
        { label: "Price: Low to High", value: "price-asc" },
        { label: "Price: High to Low", value: "price-desc" },
        { label: "Best Selling", value: "bestselling" },
    ];

    const buildUrl = (category: string, sub?: string, segment?: string, sort?: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (category === "all") {
            params.delete("category");
            params.delete("sub");
            params.delete("segment");
        } else {
            params.set("category", category);
            if (sub) {
                params.set("sub", sub);
                if (segment) {
                    params.set("segment", segment);
                } else {
                    params.delete("segment");
                }
            } else {
                params.delete("sub");
                params.delete("segment");
            }
        }

        if (sort) {
            if (sort === "featured") params.delete("sort");
            else params.set("sort", sort);
        }

        params.delete("page");
        return `/shop?${params.toString()}`;
    };

    return (
        <>
            {/* Mobile Horizontal Category Selection */}
            <div className="lg:hidden w-full mb-6 overflow-x-auto no-scrollbar py-3 px-4 flex items-center gap-3 scrollbar-hide border-b border-gray-100 bg-white sticky top-16 z-30">
                <Link
                    href={buildUrl("all")}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-xs uppercase tracking-wider transition-all border ${activeCategory === "all"
                        ? "bg-accent-gold border-accent-gold text-white"
                        : "bg-white border-gray-100 text-foreground-muted hover:border-accent-gold/50"
                        }`}
                >
                    All Items
                </Link>
                {categories?.map((category) => (
                    <Link
                        key={category.slug}
                        href={buildUrl(category.slug)}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-xs uppercase tracking-wider transition-all border ${activeCategory === category.slug && !activeSubCategory
                            ? "bg-accent-gold border-accent-gold text-white"
                            : "bg-white border-gray-100 text-foreground-muted hover:border-accent-gold/50"
                            }`}
                        data-testid="mobile-category-chip"
                    >
                        {category.name}
                    </Link>
                ))}
            </div>

            <aside className="hidden lg:block w-64 shrink-0">
                <div className="sticky top-32 space-y-6">
                    {/* Sort Section */}
                    <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm">
                        <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground mb-4 pb-3 border-b border-gray-100">
                            Sort By
                        </h3>
                        <div className="space-y-2">
                            {sortOptions.map((option) => (
                                <Link
                                    key={option.value}
                                    href={buildUrl(activeCategory, activeSubCategory || undefined, activeSegment || undefined, option.value)}
                                    className={`flex items-center gap-2 text-sm transition-colors ${activeSort === option.value
                                        ? "text-accent-gold font-medium"
                                        : "text-foreground-muted hover:text-foreground"
                                        }`}
                                >
                                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${activeSort === option.value ? "border-accent-gold" : "border-gray-300"
                                        }`}>
                                        {activeSort === option.value && <div className="w-1.5 h-1.5 rounded-full bg-accent-gold" />}
                                    </div>
                                    {option.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Categories Section */}
                    <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm">
                        <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground mb-4 pb-3 border-b border-gray-100">
                            Categories
                        </h3>
                        <nav className="space-y-1">
                            {/* All Products */}
                            <Link
                                href={buildUrl("all")}
                                className={`flex items-center justify-between py-2.5 px-3 rounded-md text-sm transition-all ${activeCategory === "all"
                                    ? "bg-accent-gold/10 text-accent-gold font-medium"
                                    : "text-foreground-muted hover:bg-gray-50 hover:text-foreground"
                                    }`}
                            >
                                <span>All Products</span>
                                {activeCategory === "all" && (
                                    <ChevronRight size={16} className="text-accent-gold" />
                                )}
                            </Link>

                            {/* Dynamic Categories from Constant */}
                            {categories?.map((category) => {
                                const isExpanded = expandedCategories.includes(category.slug);
                                const isActive = activeCategory === category.slug;

                                return (
                                    <div key={category.slug} className="space-y-1">
                                        <div
                                            onClick={() => toggleCategory(category.slug)}
                                            className={`flex items-center justify-between py-2.5 px-3 rounded-md text-sm transition-all cursor-pointer group/item ${isActive && !activeSubCategory
                                                ? "bg-accent-gold/10 text-accent-gold font-medium"
                                                : "text-foreground-muted hover:bg-gray-50 hover:text-foreground"
                                                }`}
                                        >
                                            <Link
                                                href={buildUrl(category.slug)}
                                                className="flex-1"
                                                data-testid="category-link"
                                            >
                                                {category.name}
                                            </Link>
                                            <ChevronDown
                                                size={14}
                                                className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''} text-gray-400 group-hover/item:text-foreground`}
                                            />
                                        </div>

                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="pl-4 border-l-2 border-gray-100 ml-3 space-y-1 py-1">
                                                        {category.subCategories?.map((sub) => {
                                                            const isSubActive = activeSubCategory === sub;
                                                            // Find segments for this sub-category
                                                            const segments = category.categorySegments?.find(
                                                                (cs: any) => cs.subCategoryName === sub
                                                            )?.segments;

                                                            return (
                                                                <div key={sub} className="space-y-1">
                                                                    <Link
                                                                        href={buildUrl(category.slug, sub)}
                                                                        className={`block py-1.5 px-2 text-xs rounded transition-colors ${isSubActive && !activeSegment
                                                                            ? "text-accent-gold font-medium bg-accent-gold/5"
                                                                            : "text-gray-500 hover:text-foreground"
                                                                            }`}
                                                                        data-testid="subcategory-link"
                                                                    >
                                                                        {sub}
                                                                    </Link>

                                                                    {/* Segments List */}
                                                                    {isSubActive && segments && segments.length > 0 && (
                                                                        <div className="pl-3 space-y-0.5 border-l border-gray-100 ml-1">
                                                                            {segments.map((seg: string) => (
                                                                                <Link
                                                                                    key={seg}
                                                                                    href={buildUrl(category.slug, sub, seg)}
                                                                                    className={`block py-1 px-2 text-[10px] rounded transition-colors ${activeSegment === seg
                                                                                        ? "text-accent-gold font-medium"
                                                                                        : "text-gray-400 hover:text-foreground"
                                                                                        }`}
                                                                                    data-testid="segment-link"
                                                                                >
                                                                                    {seg}
                                                                                </Link>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Quick Links */}
                    <div className="bg-gradient-to-br from-accent-gold/5 to-accent-gold/10 border border-accent-gold/20 rounded-lg p-5">
                        <h4 className="text-sm font-semibold text-foreground mb-3">
                            Need Help?
                        </h4>
                        <p className="text-xs text-foreground-muted mb-4">
                            Our team is here to assist you with product selection and orders.
                        </p>
                        <Link
                            href="/contact"
                            className="inline-flex items-center text-xs font-medium text-accent-gold hover:underline"
                        >
                            Contact Us
                            <ChevronRight size={14} className="ml-1" />
                        </Link>
                    </div>
                </div>
            </aside>
        </>
    );
}

