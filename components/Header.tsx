"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { scrollY } = useScroll();
    const pathname = usePathname();
    const isHomePage = pathname === "/";
    console.log("Header Debug:", { pathname, isHomePage, isScrolled });

    useMotionValueEvent(scrollY, "change", (latest) => {
        if (latest > 50) {
            setIsScrolled(true);
        } else {
            setIsScrolled(false);
        }
    });

    // Force solid header on non-home pages or when scrolled
    const isSolidHeader = isScrolled || !isHomePage;

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${isSolidHeader
                    ? "bg-white py-5 shadow-sm text-black border-b border-gray-100"
                    : "bg-transparent py-8 text-white"
                    }`}
            >
                <div className="container mx-auto px-6 flex items-center justify-between">
                    {/* Mobile Menu Button */}
                    <button
                        className={`lg:hidden transition-colors ${isSolidHeader ? "text-black" : "text-white"}`}
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu size={24} />
                    </button>

                    {/* Navigation - Left */}
                    <nav className={`hidden lg:flex items-center space-x-8 text-sm tracking-[0.15em] uppercase font-medium transition-colors duration-300 ${isSolidHeader ? "text-black" : "text-white"}`}>
                        <Link href="/shop" className="hover:text-accent-gold transition-colors">
                            Shop
                        </Link>
                        <Link href="/ingredient" className="hover:text-accent-gold transition-colors">
                            Ingredients
                        </Link>
                        <Link href="/stories" className="hover:text-accent-gold transition-colors">
                            Our Story
                        </Link>
                    </nav>

                    {/* Logo - Center */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        <Link href="/">
                            <h1 className={`font-serif font-bold transition-all duration-500 ${isSolidHeader ? "text-3xl text-black" : "text-4xl text-white"}`}>
                                VISHWA
                            </h1>
                            <span className={`text-[0.65rem] tracking-[0.4em] uppercase block mt-1 transition-colors duration-500 ${isSolidHeader ? "text-accent-gold" : "text-white/90"}`}>
                                Lifestyle
                            </span>
                        </Link>
                    </div>

                    {/* Actions - Right */}
                    <div className={`flex items-center space-x-6 transition-colors duration-300 ${isSolidHeader ? "text-black" : "text-white"}`}>
                        <button className="hover:text-accent-gold transition-colors">
                            <span className="hidden lg:inline text-xs tracking-widest mr-2">IN (₹)</span>
                        </button>
                        <button className="hover:text-accent-gold transition-colors">
                            <Search size={20} strokeWidth={1.5} />
                        </button>
                        <button className="hover:text-accent-gold transition-colors">
                            <User size={20} strokeWidth={1.5} />
                        </button>
                        <button className="hover:text-accent-gold transition-colors relative">
                            <ShoppingBag size={20} strokeWidth={1.5} />
                            <span className="absolute -top-1 -right-1 text-[10px] bg-accent-gold text-white w-4 h-4 flex items-center justify-center rounded-full">
                                0
                            </span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: "-100%" }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: "-100%" }}
                        transition={{ type: "tween", duration: 0.3 }}
                        className="fixed inset-0 z-[60] bg-white text-foreground flex flex-col"
                    >
                        <div className="p-6 flex justify-between items-center border-b border-gray-100">
                            <span className="font-serif text-xl font-bold">Menu</span>
                            <button onClick={() => setIsMobileMenuOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <nav className="flex-1 flex flex-col p-8 space-y-6 text-2xl font-serif">
                            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-accent-gold transition-colors">Home</Link>
                            <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-accent-gold transition-colors">Shop</Link>
                            <Link href="/ingredients" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-accent-gold transition-colors">Ingredients</Link>
                            <Link href="/story" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-accent-gold transition-colors">Our Story</Link>
                            <Link href="/account" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-sans uppercase tracking-widest mt-8 pt-8 border-t border-gray-100">My Account</Link>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
