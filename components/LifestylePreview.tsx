"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/utils/animations";

const categories = [
    {
        id: 1,
        title: "Vishwa Kurta",
        image: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=800&auto=format&fit=crop",
        link: "/shop/apparel",
        gridArea: "col-span-1 row-span-2",
    },
    {
        id: 2,
        title: "Sacred Candles",
        image: "https://images.unsplash.com/photo-1702913288156-f55d0f64f7b7",
        link: "/shop/candles",
        gridArea: "col-span-1 row-span-1",
    },
    {
        id: 3,
        title: "Handcrafted Jars",
        image: "https://images.unsplash.com/photo-1633090807330-e23fa7a1ba4f",
        link: "/shop/decor",
        gridArea: "col-span-1 row-span-1",
    },
    {
        id: 4,
        title: "Meditation Mats",
        image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f",
        link: "/shop/mats",
        gridArea: "col-span-1 row-span-1",
    },
    {
        id: 5,
        title: "Purification",
        image: "https://images.unsplash.com/photo-1758626412221-47f0a0994eab",
        link: "/shop/rituals",
        gridArea: "col-span-1 row-span-1",
    },
];

export default function LifestylePreview() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 gap-4 h-[120vh] md:h-[80vh]"
                >
                    {categories.map((cat) => (
                        <motion.div
                            key={cat.id}
                            variants={fadeInUp}
                            className={`relative group overflow-hidden ${cat.gridArea}`}
                        >
                            <Link href={cat.link} className="block w-full h-full">
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                                    style={{ backgroundImage: `url(${cat.image})` }}
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />

                                <div className="absolute bottom-8 left-8 text-white">
                                    <h3 className="text-2xl font-serif mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                        {cat.title}
                                    </h3>
                                    <span className="text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                        Shop Now
                                    </span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
