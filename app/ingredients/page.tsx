"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Leaf, Droplet, Flame, Sun } from "lucide-react";


const ingredients = [
    {
        id: 1,
        name: "Pure Cow Ghee",
        sanskrit: "Go Ghrita",
        image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=1200&auto=format&fit=crop",
        description: "Sacred clarified butter from indigenous Indian cows, essential for Agnihotra rituals. Rich in Omega-3 fatty acids and considered the purest offering to fire.",
        benefits: ["Purifies atmosphere", "Antimicrobial properties", "Enhances meditation"],
        icon: Droplet,
    },
    {
        id: 2,
        name: "Organic Rice",
        sanskrit: "Dhanya",
        image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=1200&auto=format&fit=crop",
        description: "Unpolished, hand-selected brown rice grains used as the primary offering in Agnihotra. Symbolizes sustenance and the cycle of life.",
        benefits: ["Represents nourishment", "Organic & chemical-free", "Blessed through Vedic mantras"],
        icon: Leaf,
    },
    {
        id: 3,
        name: "Cow Dung Cakes",
        sanskrit: "Gobar Upla",
        image: "https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?q=80&w=1200&auto=format&fit=crop",
        description: "Sun-dried dung cakes from grass-fed indigenous cows. The foundation of Agnihotra fire, these sacred cakes produce specific smoke frequencies for atmospheric healing.",
        benefits: ["Purifies air", "Natural & sustainable", "Creates healing vibrations"],
        icon: Sun,
    },
    {
        id: 4,
        name: "Copper Pyramid",
        sanskrit: "Tamra Yantra",
        image: "https://images.unsplash.com/photo-1610461888750-10bfc601b874?q=80&w=1200&auto=format&fit=crop",
        description: "Handcrafted copper vessel with precise Vedic measurements. Copper conducts energy and amplifies the healing effects of Agnihotra.",
        benefits: ["Amplifies energy", "99.7% pure copper", "Traditional dimensions"],
        icon: Flame,
    },
    {
        id: 5,
        name: "Sacred Herbs",
        sanskrit: "Aushadhi",
        image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=1200&auto=format&fit=crop",
        description: "Wildcrafted Himalayan herbs including sage, tulsi, and sandalwood. Used in our candles and incense for their purifying and calming properties.",
        benefits: ["Stress relief", "Air purification", "Spiritual elevation"],
        icon: Leaf,
    },
    {
        id: 6,
        name: "Beeswax & Soy",
        sanskrit: "Madhu Mombatti",
        image: "https://images.unsplash.com/photo-1602874801006-96a7e7d609da?q=80&w=1200&auto=format&fit=crop",
        description: "Pure, ethically-sourced beeswax blended with organic soy for our sacred candles. Burns cleanly and releases negative ions that purify indoor air.",
        benefits: ["Non-toxic", "Long burning", "Natural fragrance"],
        icon: Flame,
    },
];

const principles = [
    {
        title: "Purity",
        description: "Every ingredient is sourced with intention, ensuring chemical-free, organic origins.",
    },
    {
        title: "Tradition",
        description: "We follow ancient Vedic guidelines passed down through generations of practitioners.",
    },
    {
        title: "Sustainability",
        description: "Our ingredients honor the earth, supporting local farmers and ethical practices.",
    },
    {
        title: "Energy",
        description: "Each element is chosen for its vibrational frequency and healing properties.",
    },
];

export default function IngredientsPage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center bg-black text-white overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-40"
                    style={{
                        backgroundImage:
                            "url(https://images.unsplash.com/photo-1629906374651-521e2e5605e4?q=80&w=2000&auto=format&fit=crop)",
                    }}
                />
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="relative z-10 text-center px-6"
                >
                    <span className="text-accent-gold text-sm tracking-[0.3em] uppercase mb-4 block">
                        Sacred Materials
                    </span>
                    <h1 className="text-5xl md:text-7xl font-serif mb-6">
                        Pure Ingredients
                    </h1>
                    <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-light">
                        Every element chosen with intention, sourced from nature, blessed by tradition
                    </p>
                </motion.div>
            </section>

            {/* Principles Section */}
            <section className="py-20 bg-background-alt">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-serif mb-6">Our Sourcing Philosophy</h2>
                        <p className="text-foreground-muted text-lg max-w-3xl mx-auto">
                            In Vedic wisdom, the quality of materials directly affects the outcome of rituals and daily life.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {principles.map((principle, index) => (
                            <motion.div
                                key={principle.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center"
                            >
                                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border-2 border-accent-gold rounded-full">
                                    <span className="text-2xl font-serif text-accent-gold">{index + 1}</span>
                                </div>
                                <h3 className="text-xl font-serif mb-3">{principle.title}</h3>
                                <p className="text-foreground-muted leading-relaxed">{principle.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Ingredients Grid */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="text-accent-gold text-sm tracking-[0.2em] uppercase mb-4 block">
                            Sacred Elements
                        </span>
                        <h2 className="text-4xl md:text-5xl font-serif mb-6">What We Use</h2>
                    </motion.div>

                    <div className="space-y-20">
                        {ingredients.map((ingredient, index) => (
                            <motion.div
                                key={ingredient.id}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.6 }}
                                className={`flex flex-col ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                                    } items-center gap-12`}
                            >
                                {/* Image */}
                                <div className="w-full lg:w-1/2">
                                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-xl">
                                        <img
                                            src={ingredient.image}
                                            alt={ingredient.name}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                                        />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="w-full lg:w-1/2">
                                    <div className="flex items-center gap-3 mb-4">
                                        <ingredient.icon className="text-accent-gold" size={28} />
                                        <span className="text-accent-gold text-sm tracking-widest uppercase">
                                            {ingredient.sanskrit}
                                        </span>
                                    </div>
                                    <h3 className="text-3xl md:text-4xl font-serif mb-4">{ingredient.name}</h3>
                                    <p className="text-foreground-muted text-lg leading-relaxed mb-6">
                                        {ingredient.description}
                                    </p>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium uppercase tracking-wider text-foreground">
                                            Benefits:
                                        </p>
                                        <ul className="space-y-2">
                                            {ingredient.benefits.map((benefit, i) => (
                                                <li key={i} className="flex items-center gap-2 text-foreground-muted">
                                                    <span className="w-1.5 h-1.5 bg-accent-gold rounded-full" />
                                                    {benefit}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-accent-sage text-white">
                <div className="container mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-serif mb-6">
                            Experience Pure, Intentional Living
                        </h2>
                        <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                            Discover products crafted with these sacred ingredients
                        </p>
                        <a
                            href="/shop"
                            className="inline-block bg-white text-accent-sage px-10 py-4 text-sm tracking-[0.2em] uppercase font-medium hover:bg-accent-gold hover:text-white transition-colors duration-300"
                        >
                            Shop Now
                        </a>
                    </motion.div>
                </div>
            </section>


        </main>
    );
}

