"use client";

import React, { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";

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
    tag?: string;
}

interface ProductSliderProps {
    products: Product[];
    className?: string;
}

export default function ProductSlider({ products, className = "" }: ProductSliderProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true, align: "start", containScroll: "trimSnaps" },
        [Autoplay({ delay: 5000, stopOnInteraction: true })]
    );

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const getCategoryLabel = (product: any) => {
        if (product.categoryName) return product.categoryName;
        // Fallback if category is an object or string
        return typeof product.category === 'string'
            ? product.category.charAt(0).toUpperCase() + product.category.slice(1)
            : "";
    };

    return (
        <div className={`relative group ${className}`}>
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex -ml-4 py-4">
                    {products.map((product) => {
                        const tag = product.tag || (product.isBestSeller
                            ? "Best Seller"
                            : product.isNew
                                ? "New"
                                : undefined);

                        return (
                            <div
                                key={product._id}
                                className="flex-[0_0_80%] sm:flex-[0_0_50%] md:flex-[0_0_33.33%] lg:flex-[0_0_25%] pl-4 min-w-0"
                            >
                                <ProductCard
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
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Navigation Buttons */}
            <button
                onClick={scrollPrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm shadow-lg rounded-full opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-4 transition-all duration-300 z-10 hover:bg-white text-gray-800"
                aria-label="Previous slide"
            >
                <ChevronLeft size={20} />
            </button>

            <button
                onClick={scrollNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm shadow-lg rounded-full opacity-0 translate-x-4 group-hover:opacity-100 group-hover:-translate-x-4 transition-all duration-300 z-10 hover:bg-white text-gray-800"
                aria-label="Next slide"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
}
