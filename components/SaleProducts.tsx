import { getSaleProducts } from "@/lib/sanity";
import ProductSlider from "./ProductSlider";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function SaleProducts() {
    let products: any[] = [];

    try {
        products = await getSaleProducts();
    } catch (error) {
        console.error("Error fetching sale products:", error);
    }

    if (!products || products.length === 0) {
        return null;
    }

    return (
        <section className="py-12 sm:py-16 md:py-24 bg-white relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-accent-gold/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 relative z-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-12 gap-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-foreground mb-2">
                            Sale Products
                        </h2>
                        <p className="text-sm sm:text-base text-foreground-muted font-light">
                            Limited time offers for your sanctuary.
                        </p>
                    </div>
                    <Link
                        href="/shop?sort=price-asc"
                        className="hidden md:flex items-center text-sm tracking-widest uppercase hover:text-accent-gold transition-colors"
                    >
                        View All Offers <ArrowRight size={16} className="ml-2" />
                    </Link>
                </div>

                <ProductSlider products={products} />

                <div className="mt-8 sm:mt-12 text-center md:hidden">
                    <Link
                        href="/shop?sort=price-asc"
                        className="inline-flex items-center text-sm tracking-widest uppercase hover:text-accent-gold transition-colors"
                    >
                        View All Offers <ArrowRight size={16} className="ml-2" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
