import { Suspense } from "react";
import { Metadata } from "next";
import Image from "next/image";

import ShopFilters from "@/components/ShopFilters";
import ProductGrid from "@/components/ProductGrid";
import SearchBar from "@/components/SearchBar";
import CategorySidebar from "@/components/CategorySidebar";
import { getFilteredProducts, getCategories } from "@/lib/sanity";
import { generateMetadata as generateSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = generateSeoMetadata({
  title: "Shop All Products",
  description: "Browse our collection of Agnihotra essentials, Vedic lifestyle products, and sacred home decor.",
});

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    sub?: string;
    sort?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedParams = await searchParams;
  const { category, sub, sort, search, minPrice, maxPrice, page } = resolvedParams;

  const currentPage = Number(page) || 1;
  const limit = 12;

  // Fetch products and categories in parallel
  const [{ products, total }, categories] = await Promise.all([
    getFilteredProducts({
      category,
      sub,
      sort,
      search,
      minPrice: minPrice ? Number(minPrice) : 0,
      maxPrice: maxPrice ? Number(maxPrice) : 100000,
      page: currentPage,
      limit,
    }),
    getCategories(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <main className="min-h-screen bg-white pt-16 sm:pt-20">
      {/* Shop Banner */}
      <section className="relative h-[40vh] sm:h-[50vh] flex items-center justify-center text-center px-4 sm:px-6 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000&auto=format&fit=crop"
            alt="Vedic Lifestyle Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 max-w-4xl w-full mx-auto space-y-6 sm:space-y-8">
          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-white leading-tight drop-shadow-lg">
              Agnihotra Essentials & <br className="hidden sm:block" /> Vedic Lifestyle
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 font-light tracking-wide max-w-2xl mx-auto drop-shadow-md">
              Discover products for a home filled with purity, peace, and positive energy.
            </p>
          </div>

          <SearchBar className="max-w-xl mx-auto" />
        </div>
      </section>

      {/* Filters & Toolbar - Removed as per user request to keep sidebar only */}
      {/* <ShopFilters categories={categories} /> */}


      {/* Main Content: Sidebar + Product Grid */}
      <section className="py-8 sm:py-12 md:py-16 container mx-auto px-4 sm:px-6" aria-label="Products">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Category Sidebar (Desktop only) */}
          <Suspense fallback={<div className="hidden lg:block w-64 shrink-0 animate-pulse bg-gray-100 rounded-lg h-96" />}>
            <CategorySidebar categories={categories} />
          </Suspense>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            <Suspense
              key={JSON.stringify(resolvedParams)}
              fallback={<div className="animate-pulse text-center">Loading products...</div>}
            >
              <ProductGrid
                products={products}
                searchQuery={search}
                currentPage={currentPage}
                totalPages={totalPages}
                currentParams={resolvedParams as Record<string, string>}
              />
            </Suspense>
          </div>
        </div>
      </section>


    </main>
  );
}
