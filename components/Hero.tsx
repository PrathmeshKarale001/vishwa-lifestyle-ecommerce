"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const slides = [
    {
        id: 1,
        image: "/products/hero-swipe/6.png",
        title: "Har Ghar Agnihotra",
        subtitle: "The Ritual of Peace",
        cta: "Shop Rituals",
        link: "/shop",
    },
    {
        id: 2,
        image: "/products/hero-swipe/3.jpg",
        title: "Vishwa Living",
        subtitle: "Pure. Sacred. Inspired.",
        cta: "Explore Lifestyle",
        link: "/shop",
    },
    {
        id: 3,
        image: "/products/hero-swipe/2.jpeg",
        title: "Experience the Vedic Way",
        subtitle: "From Rituals to Everyday Living",
        cta: "Discover More",
        link: "/shop",
    },
];

export default function Hero({ heroProductImage }: { heroProductImage?: string }) {
    const [currentSlide, setCurrentSlide] = useState(0);

    const activeSlides = slides.map(slide => {
        if (slide.id === 2 && heroProductImage) {
            return { ...slide, image: heroProductImage };
        }
        return slide;
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
        }, 8000); // Increased duration for Ken Burns effect
        return () => clearInterval(timer);
    }, [activeSlides.length]);

    return (
        <section className="relative h-screen w-full overflow-hidden bg-black">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="absolute inset-0"
                >
                    <motion.div
                        className="absolute inset-0"
                        initial={{ scale: 1 }}
                        animate={{ scale: 1.1 }}
                        transition={{ duration: 10, ease: "linear" }} // Ken Burns Effect
                    >
                        <Image
                            src={activeSlides[currentSlide].image}
                            alt={activeSlides[currentSlide].title}
                            fill
                            priority={currentSlide === 0}
                            sizes="100vw"
                            className="object-cover object-center"
                            quality={90}
                        />
                    </motion.div>
                    <div className="absolute inset-0 bg-black/40" /> {/* Slightly darker overlay for better text contrast */}
                </motion.div>
            </AnimatePresence>

            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4 sm:px-6">
                <div className="max-w-4xl mx-auto overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`text-${currentSlide}`}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={{
                                hidden: {},
                                visible: {
                                    transition: {
                                        staggerChildren: 0.2
                                    }
                                },
                                exit: {}
                            }}
                        >
                            <motion.div
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
                                    exit: { opacity: 0, y: -20, transition: { duration: 0.5 } }
                                }}
                            >
                                <span className="block text-xs sm:text-sm md:text-base tracking-[0.3em] uppercase mb-4 opacity-90 font-light">
                                    {activeSlides[currentSlide].subtitle}
                                </span>
                            </motion.div>

                            <motion.div
                                variants={{
                                    hidden: { opacity: 0, y: 30 },
                                    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
                                    exit: { opacity: 0, y: -30, transition: { duration: 0.5 } }
                                }}
                            >
                                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif mb-8 tracking-wide leading-tight text-shadow-lg">
                                    {activeSlides[currentSlide].title}
                                </h2>
                            </motion.div>

                            <motion.div
                                variants={{
                                    hidden: { opacity: 0, scale: 0.9 },
                                    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
                                    exit: { opacity: 0, transition: { duration: 0.3 } }
                                }}
                            >
                                <Link
                                    href={activeSlides[currentSlide].link}
                                    className="group relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-medium tracking-[0.2em] text-white transition duration-300 ease-out border border-white rounded-none hover:text-black focus-visible:text-black focus-visible:outline-none uppercase text-sm"
                                >
                                    <span className="absolute inset-0 w-full h-full bg-white -translate-x-full group-hover:translate-x-0 group-focus-visible:translate-x-0 ease-out duration-300 transition-transform"></span>
                                    <span className="relative">{activeSlides[currentSlide].cta}</span>
                                </Link>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Slide Indicators */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
                {activeSlides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-1 cursor-pointer transition-all duration-500 ease-in-out ${index === currentSlide ? "bg-white w-12 opacity-100" : "bg-white/40 w-8 hover:w-10 hover:bg-white/60"
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}

