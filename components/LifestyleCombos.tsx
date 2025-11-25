"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const combos = [
    {
        id: 1,
        title: "Home Purification Kit",
        includes: "Candle + Sambrani + Copper Pyramid",
        price: "₹2,500",
        image: "https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?q=80&w=800&auto=format&fit=crop",
    },
    {
        id: 2,
        title: "Sacred Morning Set",
        includes: "Meditation Mat + Copper Water Bottle",
        price: "₹1,800",
        image: "https://images.unsplash.com/photo-1646811100572-4431a4f28ae2",
    },
    {
        id: 3,
        title: "Vedic Gift Hamper",
        includes: "Ghee + Jar + Incense",
        price: "₹3,200",
        image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop",
    },
];

export default function LifestyleCombos() {
    return (
        <section className="py-20 bg-background-alt">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <span className="text-accent-gold text-xs tracking-[0.2em] uppercase font-medium mb-2 block">
                        High Value Bundles
                    </span>
                    <h2 className="text-3xl md:text-4xl font-serif mb-4">Lifestyle Combos</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {combos.map((combo, index) => (
                        <motion.div
                            key={combo.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white p-6 text-center group hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className="aspect-square overflow-hidden mb-6 bg-gray-100">
                                <img
                                    src={combo.image}
                                    alt={combo.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>
                            <h3 className="font-serif text-xl mb-2">{combo.title}</h3>
                            <p className="text-sm text-foreground-muted mb-4">{combo.includes}</p>
                            <div className="flex items-center justify-center gap-4">
                                <span className="text-lg font-medium">{combo.price}</span>
                                <button className="text-xs uppercase tracking-widest border-b border-black pb-1 hover:text-accent-gold hover:border-accent-gold transition-colors">
                                    Add to Cart
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
