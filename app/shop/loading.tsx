import { ProductCardSkeleton } from "@/components/Skeleton";

export default function ShopLoading() {
    return (
        <main className="min-h-screen bg-white pt-16 sm:pt-20">
            {/* Shop Banner Skeleton */}
            <section className="relative h-[30vh] sm:h-[35vh] md:h-[40vh] bg-background-alt flex items-center justify-center">
                <div className="animate-pulse text-accent-gold">Loading...</div>
            </section>

            {/* Category Nav Skeleton */}
            <div className="sticky top-16 sm:top-20 z-40 bg-white/95 backdrop-blur border-b border-gray-100 py-3 sm:py-4">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="flex space-x-4 sm:space-x-6 md:space-x-8 overflow-x-auto">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-6 w-24 bg-gray-100 rounded animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>

            <section className="py-8 sm:py-12 md:py-16 container mx-auto px-4 sm:px-6">
                {/* Toolbar Skeleton */}
                <div className="flex justify-between items-center mb-6 sm:mb-8">
                    <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                    <div className="flex gap-4">
                        <div className="h-10 w-32 bg-gray-100 rounded animate-pulse" />
                        <div className="h-10 w-24 bg-gray-100 rounded animate-pulse" />
                    </div>
                </div>

                {/* Product Grid Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 gap-y-8 sm:gap-y-10 md:gap-y-12">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <ProductCardSkeleton key={i} />
                    ))}
                </div>
            </section>
        </main>
    );
}
