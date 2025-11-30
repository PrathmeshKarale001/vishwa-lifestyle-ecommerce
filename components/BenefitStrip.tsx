"use client";

import { Hand, Leaf, ShieldCheck, Sparkles, Recycle, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { CheckCircle, Sun } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/utils/animations";

const benefits = [
    { icon: Leaf, text: "Natural Materials" },
    { icon: Sun, text: "Vedic Wisdom" },
    { icon: Heart, text: "Handcrafted with Love" },
    { icon: CheckCircle, text: "Ethically Sourced" },
];

export default function BenefitStrip() {
    return (
        <section className="py-10 sm:py-12 md:py-16 bg-background-alt border-y border-gray-100">
            <div className="container mx-auto px-4 sm:px-6">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8"
                >
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={index}
                            variants={fadeInUp}
                            className="flex flex-col items-center text-center"
                        >
                            <benefit.icon size={24} strokeWidth={1} className="text-accent-gold mb-3 sm:mb-4 sm:w-8 sm:h-8" />
                            <span className="text-xs sm:text-sm uppercase tracking-widest font-medium text-foreground-muted px-2">
                                {benefit.text}
                            </span>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
