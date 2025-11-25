"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Filter, ChevronDown } from "lucide-react";
import LifestyleCollections from "@/components/LifestyleCollections";
import LifestyleCombos from "@/components/LifestyleCombos";

// Mock Data based on User Request
const categories = [
    { id: "all", name: "All Products" },
    { id: "ritual", name: "Ritual Essentials" },
    { id: "lifestyle", name: "Lifestyle & Sacred Home" },
    { id: "apparel", name: "Vishwa Apparel" },
    { id: "combos", name: "Combos & Gifts" },
];

const products = [
    // Ritual Essentials
    {
        id: 1,
        name: "Agnihotra Kit",
        category: "ritual",
        price: "₹2,100",
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop",
        tag: "Best Seller"
    },
    {
        id: 2,
        name: "Cow Dung Cakes",
        category: "ritual",
        price: "₹250",
        image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800&auto=format&fit=crop",
    },
    {
        id: 3,
        name: "Copper Pyramid",
        category: "ritual",
        price: "₹1,200",
        image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800&auto=format&fit=crop",
    },
    // Lifestyle
    {
        id: 4,
        name: "Sacred Soy Wax Candle",
        category: "lifestyle",
        price: "₹850",
        image: "https://images.unsplash.com/photo-1608508644127-5362d41a37c6?q=80&w=800&auto=format&fit=crop",
        tag: "New"
    },
    {
        id: 5,
        name: "Clay Storage Jar",
        category: "lifestyle",
        price: "₹650",
        image: "https://images.unsplash.com/photo-1581783342308-f792ca11df53?q=80&w=800&auto=format&fit=crop",
    },
    {
        id: 6,
        name: "Brass Lamp",
        category: "lifestyle",
        price: "₹1,500",
        image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop",
    },
    // Apparel
    {
        id: 7,
        name: "Agnihotra-washed Kurta",
        category: "apparel",
        price: "₹2,500",
        image: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=800&auto=format&fit=crop",
        tag: "Exclusive"
    },
    {
        id: 8,
        name: "Sacred Stole",
        category: "apparel",
        price: "₹1,200",
        image: "https://images.unsplash.com/photo-1520986606214-8b456906c813?q=80&w=800&auto=format&fit=crop",
    },
];

export default function ShopPage() {
    const [activeCategory, setActiveCategory] = useState("all");

    const filteredProducts = activeCategory === "all"
        ? products
        : products.filter(p => p.category === activeCategory);

    return (
        <main className="min-h-screen bg-white pt-20">
            {/* Shop Banner */}
            <section className="relative h-[40vh] bg-background-alt flex items-center justify-center text-center px-6">
                <div className="max-w-3xl">
                    <h1 className="text-4xl md:text-5xl font-serif mb-4 text-foreground">
                        Agnihotra Essentials & <br /> Vedic Lifestyle Products
                    </h1>
                    <p className="text-foreground-muted text-lg font-light tracking-wide">
                        Everything for a home filled with purity and peace.
                    </p>
                </div>
            </section>

            {/* Category Navigation */}
            <section className="sticky top-20 z-40 bg-white/95 backdrop-blur border-b border-gray-100 py-4">
                <div className="container mx-auto px-6 overflow-x-auto">
                    <div className="flex space-x-8 min-w-max justify-center">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`text-sm uppercase tracking-widest transition-colors duration-300 ${activeCategory === cat.id
                                    ? "text-accent-gold font-medium border-b-2 border-accent-gold pb-1"
                                    : "text-foreground-muted hover:text-foreground"
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Product Grid */}
            <section className="py-16 container mx-auto px-6">
                <div className="flex justify-between items-center mb-8">
                    <span className="text-sm text-foreground-muted">{filteredProducts.length} Products</span>
                    <button className="flex items-center text-sm uppercase tracking-widest hover:text-accent-gold">
                        Filter <Filter size={16} className="ml-2" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                    {filteredProducts.map((product) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="group cursor-pointer"
                        >
                            <div className="relative aspect-[3/4] overflow-hidden bg-background-alt mb-6">
                                {product.tag && (
                                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur text-[10px] uppercase tracking-widest px-3 py-1 z-10">
                                        {product.tag}
                                    </span>
                                )}
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                />
                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />

                                {/* Quick Add - Slide Up */}
                                <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-white border-t border-gray-100 p-4 flex justify-between items-center">
                                    <span className="text-xs uppercase tracking-widest">Quick Add</span>
                                    <span className="text-xs font-serif italic">+</span>
                                </div>
                            </div>

                            <div className="text-center">
                                <h3 className="font-serif text-xl mb-2 group-hover:text-accent-gold transition-colors duration-300">
                                    {product.name}
                                </h3>
                                <p className="text-sm text-foreground-muted font-light mb-2">
                                    {product.category === 'ritual' ? 'Ritual Essentials' : 'Vishwa Lifestyle'}
                                </p>
                                <span className="text-sm font-medium">{product.price}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* New Sections */}
            <LifestyleCollections />
            <LifestyleCombos />
        </main>
    );
}
