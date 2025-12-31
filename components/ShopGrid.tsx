import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { getFeaturedProducts } from "@/lib/sanity";

interface Product {
  _id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  categoryName?: string;
  inventory?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  tags?: string[];
}

export default async function ShopGrid() {
  let products: any[] = []; // Using any for simplicity with dynamic data

  try {
    const data = await getFeaturedProducts();
    // Take first 4 products
    products = data.slice(0, 4);
  } catch (error) {
    console.error("Error fetching featured products:", error);
  }

  const getCategoryLabel = (product: any) => {
    if (!product.category) return "";
    return product.categoryName || product.category.charAt(0).toUpperCase() + product.category.slice(1);
  };

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-background-alt">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-12 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-foreground mb-2">
              Featured Products
            </h2>
            <p className="text-sm sm:text-base text-foreground-muted font-light">
              Bring Harmony Home.
            </p>
          </div>
          <Link
            href="/shop"
            className="hidden md:flex items-center text-sm tracking-widest uppercase hover:text-accent-gold transition-colors"
          >
            View All <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {products.map((product) => {
              const tag = product.isBestSeller
                ? "Best Seller"
                : product.isNew
                  ? "New"
                  : undefined;

              return (
                <ProductCard
                  key={product._id}
                  id={product._id}
                  slug={product.slug}
                  name={product.name}
                  price={product.price}
                  compareAtPrice={product.compareAtPrice}
                  image={product.image || "/placeholder-product.svg"}
                  tag={tag}
                  category={getCategoryLabel(product)}
                  inventory={product.inventory}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-foreground-muted">No featured products available yet.</p>
            <Link
              href="/shop"
              className="inline-flex items-center mt-4 text-sm tracking-widest uppercase hover:text-accent-gold transition-colors"
            >
              Browse All Products <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        )}

        <div className="mt-8 sm:mt-12 text-center md:hidden">
          <Link
            href="/shop"
            className="inline-flex items-center text-sm tracking-widest uppercase hover:text-accent-gold transition-colors"
          >
            View All <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}
