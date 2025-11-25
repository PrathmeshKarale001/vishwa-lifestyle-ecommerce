"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const collections = [
    {
        id: 1,
        title: "Sacred Home Collection",
        description: "Elevate your space with divine energy.",
        image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop",
        link: "/shop/sacred-home",
    },
    {
        id: 2,
        title: "Vishwa Living",
        description: "Candles, Decor, and Fragrances for the soul.",
        image: "https://images.unsplash.com/photo-1605774337664-7a846e9cdf17",
        link: "/shop/living",
    },
    {
        id: 3,
        title: "Healing Apparel",
        description: "Bhasma-washed clothing for pure living.",
        image: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=800&auto=format&fit=crop",
        link: "/shop/apparel",
    },
    {
        id: 4,
        title: "Clay Heritage",
        description: "Handcrafted jars rooted in tradition.",
        image: "https://images.unsplash.com/photo-1682695798256-28a674122872",
        link: "/shop/clay",
    },
];

export default function LifestyleCollections() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-serif mb-4">Curated Collections</h2>
                    <p className="text-foreground-muted font-light">Discover products aligned with your journey.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {collections.map((collection, index) => (
                        <motion.div
                            key={collection.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="relative group overflow-hidden aspect-[16/9]"
                        >
                            <Link href={collection.link} className="block w-full h-full">
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                                    style={{ backgroundImage: `url(${collection.image})` }}
                                />
                                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />

                                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6">
                                    <h3 className="text-2xl md:text-3xl font-serif mb-2 tracking-wide">{collection.title}</h3>
                                    <p className="text-sm md:text-base font-light opacity-90 mb-6">{collection.description}</p>
                                    <span className="border border-white px-6 py-2 text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors duration-300">
                                        Explore
                                    </span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
