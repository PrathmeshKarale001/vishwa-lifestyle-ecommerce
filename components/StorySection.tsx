"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function StorySection({ data }: { data?: any }) {
    const heading = data?.heading || "From a Sacred Fire \nto a Global Movement";
    const content = data?.content || "Initiated in 1978, Vishwa began as a mission to make authentic Agnihotra materials available worldwide. \n\nBlessed by Param Sadguru Shree Gajanan Maharaj, we facilitate the transition to a high-energy Agnihotra lifestyle - rooted in human transformation and planetary healing.";
    const image = data?.image || "/hero-images/VISHWA WORLD.png";

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
                                src={image}
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
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif mb-6 sm:mb-8 leading-tight text-foreground whitespace-pre-line">
                            {heading}
                        </h2>
                        <p className="text-sm sm:text-base md:text-lg text-foreground-muted leading-relaxed font-light whitespace-pre-line">
                            {content}
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
