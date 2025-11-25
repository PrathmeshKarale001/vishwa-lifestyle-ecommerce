"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function StorySection() {
    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    {/* Image Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="w-full lg:w-1/2"
                    >
                        <div className="relative aspect-[4/3] overflow-hidden">
                            {/* Using a div with background image for now to avoid Next.js Image config issues with external domains if not configured, 
                  but standard img tag is safer for this demo. */}
                            <img
                                src="https://images.unsplash.com/photo-1606293926075-69a00dbfde81?q=80&w=1200&auto=format&fit=crop"
                                alt="Vedic Living"
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
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
                        <span className="text-accent-gold text-sm tracking-[0.2em] uppercase font-medium mb-4 block">
                            Our Philosophy
                        </span>
                        <h2 className="text-4xl md:text-5xl font-serif mb-8 leading-tight text-foreground">
                            Not Just Products. <br />
                            <span className="italic text-accent-sage">A Way of Living.</span>
                        </h2>
                        <p className="text-foreground-muted text-lg leading-relaxed mb-8 font-light">
                            In Vedic India, everything inside the home carried intention - from the clothes one wore, to the lamp one lit, to the jar that stored grains.
                        </p>
                        <p className="text-foreground-muted text-lg leading-relaxed font-light">
                            Vishwa revives this sacred philosophy for today’s world - through products that add meaning, purity, and serenity to everyday life.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
