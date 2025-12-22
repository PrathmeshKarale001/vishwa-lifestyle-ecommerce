"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight, ChevronDown } from "lucide-react";
import { SHOP_CATEGORIES } from "@/lib/shop-categories";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Category {
    _id: string;
    name: string;
    slug: string;
    description?: string;
}

interface CategorySidebarProps {
    categories: Category[]; // Keeping for backward compatibility if needed, but primarily using SHOP_CATEGORIES
}

export default function CategorySidebar({ categories }: CategorySidebarProps) {
    const searchParams = useSearchParams();
    const activeCategory = searchParams.get("category") || "all";
    const activeSubCategory = searchParams.get("sub");

    // State for expanded categories in sidebar
    const [expandedCategories, setExpandedCategories] = useState<string[]>(
        SHOP_CATEGORIES.map(c => c.slug) // Default all expanded or maybe just the active one?
    );

    const toggleCategory = (slug: string) => {
        setExpandedCategories(prev =>
            prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
        );
    };

    const buildUrl = (category: string, sub?: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (category === "all") {
            params.delete("category");
            params.delete("sub");
        } else {
            params.set("category", category);
            if (sub) {
                params.set("sub", sub);
            } else {
                params.delete("sub");
            }
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
                {SHOP_CATEGORIES.map((category) => (
                    <Link
                        key={category.slug}
                        href={buildUrl(category.slug)}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-xs uppercase tracking-wider transition-all border ${activeCategory === category.slug && !activeSubCategory
                            ? "bg-accent-gold border-accent-gold text-white"
                            : "bg-white border-gray-100 text-foreground-muted hover:border-accent-gold/50"
                            }`}
                    >
                        {category.title}
                    </Link>
                ))}
            </div>

            <aside className="hidden lg:block w-64 shrink-0">
                <div className="sticky top-32 space-y-6">
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
                            {SHOP_CATEGORIES.map((category) => {
                                const isExpanded = expandedCategories.includes(category.slug);
                                const isActive = activeCategory === category.slug;

                                return (
                                    <div key={category.slug} className="space-y-1">
                                        <div
                                            className={`flex items-center justify-between py-2.5 px-3 rounded-md text-sm transition-all cursor-pointer ${isActive && !activeSubCategory
                                                ? "bg-accent-gold/10 text-accent-gold font-medium"
                                                : "text-foreground-muted hover:bg-gray-50 hover:text-foreground"
                                                }`}
                                        >
                                            <Link href={buildUrl(category.slug)} className="flex-1">
                                                {category.title}
                                            </Link>
                                            <button
                                                onClick={(e) => { e.preventDefault(); toggleCategory(category.slug); }}
                                                className="p-1 hover:bg-black/5 rounded"
                                            >
                                                <ChevronDown size={14} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                            </button>
                                        </div>

                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="pl-4 border-l-2 border-gray-100 ml-3 space-y-1 py-1">
                                                        {category.items.map((sub) => (
                                                            <Link
                                                                key={sub.slug}
                                                                href={buildUrl(category.slug, sub.slug)}
                                                                className={`block py-1.5 px-2 text-xs rounded transition-colors ${activeSubCategory === sub.slug && isActive
                                                                    ? "text-accent-gold font-medium bg-accent-gold/5"
                                                                    : "text-gray-500 hover:text-foreground"
                                                                    }`}
                                                            >
                                                                {sub.name}
                                                            </Link>
                                                        ))}
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

