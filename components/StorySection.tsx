"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function StorySection() {
    return (
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-16">
                    {/* Image Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="w-full lg:w-1/2"
                    >
                        <div className="relative aspect-[4/3] overflow-hidden">
                            <Image
                                src="/products/philosophy/1.jpg"
                                alt="Vedic Living"
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover object-bottom hover:scale-105 transition-transform duration-1000"
                            />
                        </div>
                    </motion.div>

                    {/* Text Side */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="w-full lg:w-1/2 text-center lg:text-left"
                    >
                        <span className="text-accent-gold text-xs sm:text-sm tracking-[0.15em] sm:tracking-[0.2em] uppercase font-medium mb-3 sm:mb-4 block">
                            Our Philosophy
                        </span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif mb-6 sm:mb-8 leading-tight text-foreground">
                            Not Just Products. <br className="hidden sm:block" />
                            <span className="italic text-accent-sage">A Way of Living.</span>
                        </h2>
                        <p className="text-sm sm:text-base md:text-lg text-foreground-muted leading-relaxed mb-6 sm:mb-8 font-light">
                            In Vedic India, everything inside the home carried intention - from the clothes one wore, to the lamp one lit, to the jar that stored grains.
                        </p>
                        <p className="text-sm sm:text-base md:text-lg text-foreground-muted leading-relaxed font-light">
                            Vishwa revives this sacred philosophy for today's world - through products that add meaning, purity, and serenity to everyday life.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
