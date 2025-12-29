import ProductCard from "@/components/ProductCard";
import EmptyState from "@/components/EmptyState";
import { Search } from "lucide-react";

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
    lqip?: string;
}

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGridProps {
    products: Product[];
    searchQuery?: string;
    currentPage?: number;
    totalPages?: number;
    currentParams?: Record<string, string>;
}

export default function ProductGrid({
    products,
    searchQuery,
    currentPage = 1,
    totalPages = 1,
    currentParams = {}
}: ProductGridProps) {
    if (products.length === 0) {
        return (
            <EmptyState
                icon="search"
                title={searchQuery ? `No products found for "${searchQuery}"` : "No products found"}
                description={
                    searchQuery
                        ? "Try adjusting your search terms or browse all products."
                        : "Try adjusting your filters to find what you're looking for."
                }
                action={
                    searchQuery
                        ? {
                            label: "View All Products",
                            href: "/shop",
                        }
                        : {
                            label: "Clear Filters",
                            href: "/shop",
                        }
                }
            />
        );
    }

    const getCategoryLabel = (cat: string) => {
        const labels: Record<string, string> = {
            ritual: "Other",
            lifestyle: "Other",
            apparel: "Other",
            combos: "Other",
        };
        return labels[cat] || cat;
    };

    // Helper to generate pagination URL
    const getPageUrl = (page: number) => {
        const params = new URLSearchParams();

        // Add all existing params
        Object.entries(currentParams).forEach(([key, value]) => {
            if (key !== "page" && value) {
                params.set(key, value);
            }
        });

        // Set new page
        params.set("page", page.toString());

        return `/shop?${params.toString()}`;
    };

    return (
        <div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 gap-y-6 sm:gap-y-10 md:gap-y-12 mb-12">
                {products.map((product) => {
                    const tag = product.isBestSeller
                        ? "Best Seller"
                        : product.isNew
                            ? "New"
                            : product.tags?.[0] || undefined;

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
                            category={getCategoryLabel(
                                typeof product.category === "string" ? product.category : ""
                            )}
                            inventory={product.inventory}
                            lqip={product.lqip}
                        />
                    );
                })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <nav className="flex justify-center items-center gap-2" aria-label="Pagination">
                    {currentPage <= 1 ? (
                        <span className="p-2 border border-gray-200 rounded opacity-50 cursor-not-allowed" aria-disabled="true">
                            <ChevronLeft size={20} />
                        </span>
                    ) : (
                        <Link href={getPageUrl(currentPage - 1)} className="p-2 border border-gray-200 rounded hover:bg-gray-50">
                            <ChevronLeft size={20} />
                        </Link>
                    )}

                    <span className="text-sm font-medium px-4">
                        Page {currentPage} of {totalPages}
                    </span>

                    <Link
                        href={getPageUrl(currentPage + 1)}
                        className={`p-2 border border-gray-200 rounded hover:bg-gray-50 ${currentPage >= totalPages ? "pointer-events-none opacity-50" : ""
                            }`}
                        aria-disabled={currentPage >= totalPages}
                    >
                        <ChevronRight size={20} />
                    </Link>
                </nav>
            )}
        </div>
    );
}
