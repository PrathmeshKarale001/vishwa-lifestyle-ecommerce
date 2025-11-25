"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Minus, Plus, ShoppingBag, Heart, Share2 } from "lucide-react";

export default function ProductPage() {
    const [quantity, setQuantity] = useState(1);

    return (
        <main className="min-h-screen bg-white pt-24">
            {/* Hero Section */}
            <section className="container mx-auto px-6 mb-24">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Product Images */}
                    <div className="w-full lg:w-1/2 grid grid-cols-2 gap-4">
                        <div className="col-span-2 aspect-[4/3] bg-background-alt overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1602825266970-721285fc6e43?q=80&w=1200&auto=format&fit=crop"
                                alt="Sacred Candle"
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                        <div className="aspect-square bg-background-alt overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800&auto=format&fit=crop"
                                alt="Detail 1"
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                        <div className="aspect-square bg-background-alt overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?q=80&w=800&auto=format&fit=crop"
                                alt="Detail 2"
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="w-full lg:w-1/2 lg:pl-12 flex flex-col justify-center">
                        <div className="mb-6">
                            <span className="text-accent-gold text-xs tracking-[0.2em] uppercase font-medium mb-2 block">
                                Lifestyle & Sacred Home
                            </span>
                            <h1 className="text-4xl md:text-5xl font-serif mb-4 text-foreground">
                                Sacred Soy Wax Candle
                            </h1>
                            <div className="flex items-center space-x-4 mb-6">
                                <span className="text-2xl font-light">₹850</span>
                                <div className="flex items-center text-accent-gold text-sm">
                                    <Star size={14} fill="currentColor" />
                                    <Star size={14} fill="currentColor" />
                                    <Star size={14} fill="currentColor" />
                                    <Star size={14} fill="currentColor" />
                                    <Star size={14} fill="currentColor" />
                                    <span className="text-foreground-muted ml-2">(24 Reviews)</span>
                                </div>
                            </div>
                            <p className="text-foreground-muted leading-relaxed font-light mb-8">
                                Crafted with intention. Designed to bring harmony into your daily life.
                                Infused with the purity of Agnihotra atmosphere, this candle is more than light—it is a presence.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col space-y-6 mb-12">
                            <div className="flex items-center space-x-6">
                                <div className="flex items-center border border-gray-200">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="p-3 hover:bg-gray-50 transition-colors"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="w-12 text-center text-sm">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="p-3 hover:bg-gray-50 transition-colors"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <button className="flex-1 bg-foreground text-white py-3 px-6 uppercase tracking-widest text-sm hover:bg-accent-gold transition-colors duration-300 flex items-center justify-center gap-2">
                                    <ShoppingBag size={18} /> Add to Cart
                                </button>
                            </div>
                            <div className="flex space-x-4 text-sm text-foreground-muted">
                                <button className="flex items-center gap-2 hover:text-foreground transition-colors">
                                    <Heart size={16} /> Add to Wishlist
                                </button>
                                <button className="flex items-center gap-2 hover:text-foreground transition-colors">
                                    <Share2 size={16} /> Share
                                </button>
                            </div>
                        </div>

                        {/* Features Accordion/List */}
                        <div className="border-t border-gray-100 pt-8 space-y-6">
                            <div>
                                <h3 className="font-serif text-lg mb-2">Features</h3>
                                <ul className="list-disc list-inside text-sm text-foreground-muted space-y-1 font-light">
                                    <li>Eco-friendly Soy Wax</li>
                                    <li>Handcrafted in India</li>
                                    <li>Infused with Natural Essential Oils</li>
                                    <li>Non-toxic Lead-free Wick</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-serif text-lg mb-2">Ritual Significance</h3>
                                <p className="text-sm text-foreground-muted font-light">
                                    Light this candle during your evening meditation or Agnihotra practice to amplify the peaceful vibrations in your home.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Usage Section */}
            <section className="py-20 bg-background-alt">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="w-full md:w-1/2">
                            <h2 className="text-3xl font-serif mb-6">How to Use</h2>
                            <p className="text-foreground-muted leading-relaxed font-light mb-6">
                                Place the candle on a stable, heat-resistant surface. Keep away from drafts.
                                For the best experience, trim the wick to 1/4 inch before every burn.
                                Pair it with our Sambrani Cups for a complete purification ritual.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-4 text-center">
                                    <span className="block font-serif text-xl mb-1">Meditation</span>
                                    <span className="text-xs uppercase tracking-widest text-foreground-muted">Enhance Focus</span>
                                </div>
                                <div className="bg-white p-4 text-center">
                                    <span className="block font-serif text-xl mb-1">Evening</span>
                                    <span className="text-xs uppercase tracking-widest text-foreground-muted">Wind Down</span>
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 aspect-video bg-gray-200 overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1602192509153-0d77c916b585?q=80&w=1200&auto=format&fit=crop"
                                alt="Candle Usage"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Reviews Preview */}
            <section className="py-20 container mx-auto px-6 text-center">
                <h2 className="text-3xl font-serif mb-12">Stories from Our Community</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-8 bg-background-alt">
                            <div className="flex justify-center text-accent-gold mb-4">
                                <Star size={16} fill="currentColor" />
                                <Star size={16} fill="currentColor" />
                                <Star size={16} fill="currentColor" />
                                <Star size={16} fill="currentColor" />
                                <Star size={16} fill="currentColor" />
                            </div>
                            <p className="text-foreground font-serif italic mb-6">
                                "Transformed my home atmosphere. The scent is so pure and grounding. I light it every evening."
                            </p>
                            <span className="text-xs uppercase tracking-widest text-foreground-muted">- Priya S.</span>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
