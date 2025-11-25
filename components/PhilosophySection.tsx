"use client";

import { motion } from "framer-motion";

export default function PhilosophySection() {
    return (
        <section className="py-24 bg-white text-center">
            <div className="container mx-auto px-6 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="text-accent-gold text-sm tracking-[0.2em] uppercase font-medium mb-6 block">
                        Our Essence
                    </span>
                    <h2 className="text-3xl md:text-5xl font-serif mb-8 leading-tight text-foreground">
                        The Philosophy Behind Vedic Lifestyle
                    </h2>
                    <div className="w-24 h-1 bg-accent-gold mx-auto mb-10 opacity-50" />

                    <p className="text-foreground-muted text-lg md:text-xl leading-relaxed mb-8 font-light">
                        In Vedic culture, objects weren’t just material - they carried energy, purity, and intention.
                        A jar wasn’t just storage, it was sanctity. A candle wasn’t decor, it was light for the soul.
                        A kurta wasn’t clothing, it was a second skin of purity.
                    </p>

                    <p className="text-foreground font-serif text-xl md:text-2xl italic">
                        Vishwa’s lifestyle collection brings this philosophy to your modern home.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
