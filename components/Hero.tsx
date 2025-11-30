"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const slides = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1560780551-0756d8562e04",
        title: "Har Ghar Agnihotra",
        subtitle: "The Ritual of Peace",
        cta: "Shop Rituals",
        link: "/shop",
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=1920&auto=format&fit=crop",
        title: "Vishwa Living",
        subtitle: "Pure. Sacred. Inspired.",
        cta: "Explore Lifestyle",
        link: "/shop",
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=1920&auto=format&fit=crop",
        title: "Experience the Vedic Way",
        subtitle: "From Rituals to Everyday Living",
        cta: "Discover More",
        link: "/shop",
    },
];

export default function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative h-screen w-full overflow-hidden bg-black">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute inset-0"
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
                    />
                    <div className="absolute inset-0 bg-black/30" /> {/* Overlay */}
                </motion.div>
            </AnimatePresence>

            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4 sm:px-6">
                <motion.div
                    key={`text-${currentSlide}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="max-w-4xl mx-auto"
                >
                    <span className="block text-xs sm:text-sm md:text-base tracking-[0.2em] sm:tracking-[0.3em] uppercase mb-3 sm:mb-4 opacity-90">
                        {slides[currentSlide].subtitle}
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-serif mb-6 sm:mb-8 tracking-wide leading-tight">
                        {slides[currentSlide].title}
                    </h2>
                    <Link
                        href={slides[currentSlide].link}
                        className="inline-block border border-white px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm tracking-[0.15em] sm:tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-colors duration-300"
                    >
                        {slides[currentSlide].cta}
                    </Link>
                </motion.div>
            </div>

            {/* Slide Indicators */}
            <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex space-x-2 sm:space-x-3 z-20">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${index === currentSlide ? "bg-white w-6 sm:w-8" : "bg-white/50 w-1.5 sm:w-2"
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}
