"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const products = [
    {
        id: 1,
        name: "Agnihotra Kit",
        price: "₹2,100",
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop",
        tag: "Best Seller"
    },
    {
        id: 2,
        name: "Sambrani Cups",
        price: "₹450",
        image: "https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?q=80&w=800&auto=format&fit=crop",
        tag: "New"
    },
    {
        id: 3,
        name: "Copper Pyramid",
        price: "₹1,200",
        image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800&auto=format&fit=crop",
        tag: "Essential"
    },
    {
        id: 4,
        name: "Pure Cow Ghee",
        price: "₹850",
        image: "https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?q=80&w=800&auto=format&fit=crop",
        tag: "Organic"
    },
];

export default function ShopGrid() {
    return (
        <section className="py-24 bg-background-alt">
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-2">Featured Rituals</h2>
                        <p className="text-foreground-muted font-light">Bring Harmony Home.</p>
                    </div>
                    <Link href="/shop" className="hidden md:flex items-center text-sm tracking-widest uppercase hover:text-accent-gold transition-colors">
                        View All <ArrowRight size={16} className="ml-2" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="group cursor-pointer"
                        >
                            <div className="relative aspect-square overflow-hidden bg-white mb-4">
                                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[10px] uppercase tracking-widest px-2 py-1 z-10">
                                    {product.tag}
                                </span>
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

                                {/* Quick Add Button */}
                                <button className="absolute bottom-0 left-0 right-0 bg-white text-black py-3 text-xs uppercase tracking-widest translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                    Quick Add
                                </button>
                            </div>

                            <div className="text-center">
                                <h3 className="font-serif text-lg mb-1 group-hover:text-accent-gold transition-colors">{product.name}</h3>
                                <p className="text-sm text-foreground-muted">{product.price}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-12 text-center md:hidden">
                    <Link href="/shop" className="inline-flex items-center text-sm tracking-widest uppercase hover:text-accent-gold transition-colors">
                        View All <ArrowRight size={16} className="ml-2" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
