"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";

interface Category {
    _id: string;
    name: string;
    slug: string;
    description?: string;
}

interface CategorySidebarProps {
    categories: Category[];
}

export default function CategorySidebar({ categories }: CategorySidebarProps) {
    const searchParams = useSearchParams();
    const activeCategory = searchParams.get("category") || "all";

    const buildCategoryUrl = (slug: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (slug === "all") {
            params.delete("category");
        } else {
            params.set("category", slug);
        }
        params.delete("page"); // Reset pagination when changing category
        return `/shop?${params.toString()}`;
    };

    return (
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
                            href={buildCategoryUrl("all")}
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

                        {/* Dynamic Categories */}
                        {categories.map((category) => (
                            <Link
                                key={category._id}
                                href={buildCategoryUrl(category.slug)}
                                className={`flex items-center justify-between py-2.5 px-3 rounded-md text-sm transition-all ${activeCategory === category.slug
                                        ? "bg-accent-gold/10 text-accent-gold font-medium"
                                        : "text-foreground-muted hover:bg-gray-50 hover:text-foreground"
                                    }`}
                            >
                                <span>{category.name}</span>
                                {activeCategory === category.slug && (
                                    <ChevronRight size={16} className="text-accent-gold" />
                                )}
                            </Link>
                        ))}
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
    );
}
