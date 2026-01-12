"use client";

import { motion } from "framer-motion";

export default function PhilosophySection({ data }: { data?: any }) {
    const essence = data?.essence || "What We Stand For";
    const heading = data?.heading || "Vedic Living for the New Age";
    const body = data?.body || "Vishwa exists to support a complete Agnihotra-aligned lifestyle—not just ritual, but how ones lives, eats, dresses, builds, farms, and thinks. We create and curate essentials aligned with rhythm, purity, and intention.";
    const quote = data?.quote || "Bringing earth-friendly, sustainable, and nature-conscious living to your modern home.";

    return (
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white text-center">
            <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="text-accent-gold text-xs sm:text-sm tracking-[0.15em] sm:tracking-[0.2em] uppercase font-medium mb-4 sm:mb-6 block">
                        {essence}
                    </span>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif mb-6 sm:mb-8 leading-tight text-foreground px-4">
                        {heading}
                    </h2>
                    <div className="w-16 sm:w-24 h-0.5 sm:h-1 bg-accent-gold mx-auto mb-8 sm:mb-10 opacity-50" />

                    <p className="text-sm sm:text-base md:text-lg lg:text-xl text-foreground-muted leading-relaxed mb-6 sm:mb-8 font-light px-4 whitespace-pre-line">
                        {body}
                    </p>

                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-foreground font-serif italic px-4">
                        {quote}
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
