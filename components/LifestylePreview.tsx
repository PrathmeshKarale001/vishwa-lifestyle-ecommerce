"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/utils/animations";
import Image from "next/image";

const categories = [
    {
        id: 1,
        title: "Vishwa Kurta",
        image: "/products/home-productgrid/Kurta.png",
        link: "/shop/apparel",
        gridArea: "col-span-1 row-span-2",
        imgAlt: "Vishwa Kurta",
    },
    {
        id: 2,
        title: "Sacred Candles",
        image: "/products/home-productgrid/Candle.jpeg",
        link: "/shop/candles",
        gridArea: "col-span-1 row-span-1",
        imgAlt: "Sacred Candles",
    },
    {
        id: 3,
        title: "Artifacts & Decor",
        image: "/products/home-productgrid/artifacts.jpeg",
        link: "/shop/decor",
        gridArea: "col-span-1 row-span-1",
        imgAlt: "Artifacts & Decor",
    },
    {
        id: 4,
        title: "Bags",
        image: "/products/home-productgrid/Bags.jpeg",
        link: "/shop/mats",
        gridArea: "col-span-1 row-span-1",
        imgAlt: "Bags",
    },
    {
        id: 5,
        title: "Juti",
        image: "/products/home-productgrid/juti.png",
        link: "/shop/rituals",
        gridArea: "col-span-1 row-span-1",
        imgAlt: "Juti",
    },
];

export default function LifestylePreview() {
    return (
        <section className="py-12 sm:py-16 md:py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 grid-rows-auto md:grid-rows-2 gap-3 sm:gap-4 h-auto md:h-[80vh]"
                >
                    {categories.map((cat, index) => {
                        // First item spans full width on mobile, 2 rows on desktop
                        const isFirstItem = index === 0;
                        return (
                            <motion.div
                                key={cat.id}
                                variants={fadeInUp}
                                className={`relative group overflow-hidden ${isFirstItem
                                    ? "sm:col-span-2 md:col-span-1 md:row-span-2 h-64 sm:h-80 md:h-full"
                                    : "h-48 sm:h-64 md:h-auto"
                                    }`}
                            >
                                <Link href={cat.link} className="block w-full h-full">
                                    <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-110">
                                        <Image
                                            src={cat.image}
                                            alt={cat.imgAlt}
                                            fill
                                            sizes={isFirstItem ? "(max-width: 768px) 100vw, 33vw" : "(max-width: 768px) 50vw, 16vw"}
                                            className="object-cover object-center"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />

                                    <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-4 sm:left-6 md:left-8 text-white">
                                        <h3 className="text-xl sm:text-2xl md:text-2xl font-serif mb-1 sm:mb-2 translate-y-2 sm:translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                            {cat.title}
                                        </h3>
                                        <span className="text-[10px] sm:text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                            Shop Now
                                        </span>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
