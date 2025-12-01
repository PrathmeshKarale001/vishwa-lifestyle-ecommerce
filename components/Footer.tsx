"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Instagram, Facebook, Twitter } from "lucide-react";
import { fadeInUp } from "@/utils/animations";

export default function Footer() {
    return (
        <footer className="bg-background text-foreground pt-12 sm:pt-16 md:pt-20 pb-10 sm:pb-12 md:pb-16 border-t border-gray-100">
            <div className="container mx-auto px-4 sm:px-6">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-12 sm:mb-14 md:mb-16"
                >
                    {/* Brand */}
                    <div className="sm:col-span-2 md:col-span-1">
                        <Link href="/" className="inline-block mb-3 sm:mb-4">
                            <Image
                                src="/vishwalogo-v2.png"
                                alt="Vishwa Lifestyle"
                                width={120}
                                height={40}
                                className="h-8 sm:h-10 w-auto"
                            />
                        </Link>
                        <p className="text-foreground-muted text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
                            A Modern Vedic Lifestyle Brand. Bringing the purity of ancient rituals into your everyday living.
                        </p>
                        <div className="flex space-x-3 sm:space-x-4">
                            <a href="#" className="text-foreground-muted hover:text-accent-gold transition-colors" aria-label="Instagram">
                                <Instagram size={18} className="sm:w-5 sm:h-5" />
                            </a>
                            <a href="#" className="text-foreground-muted hover:text-accent-gold transition-colors" aria-label="Facebook">
                                <Facebook size={18} className="sm:w-5 sm:h-5" />
                            </a>
                            <a href="#" className="text-foreground-muted hover:text-accent-gold transition-colors" aria-label="Twitter">
                                <Twitter size={18} className="sm:w-5 sm:h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="text-xs sm:text-sm uppercase tracking-widest font-medium mb-4 sm:mb-6">Shop</h3>
                        <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-foreground-muted">
                            <li><Link href="/shop/rituals" className="hover:text-accent-gold transition-colors">Rituals</Link></li>
                            <li><Link href="/shop/lifestyle" className="hover:text-accent-gold transition-colors">Lifestyle</Link></li>
                            <li><Link href="/shop/apparel" className="hover:text-accent-gold transition-colors">Apparel</Link></li>
                            <li><Link href="/shop/gifts" className="hover:text-accent-gold transition-colors">Gifts</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xs sm:text-sm uppercase tracking-widest font-medium mb-4 sm:mb-6">About</h3>
                        <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-foreground-muted">
                            <li><Link href="/story" className="hover:text-accent-gold transition-colors">Our Story</Link></li>
                            <li><Link href="/philosophy" className="hover:text-accent-gold transition-colors">Philosophy</Link></li>
                            <li><Link href="/ingredients" className="hover:text-accent-gold transition-colors">Ingredients</Link></li>
                            <li><Link href="/contact" className="hover:text-accent-gold transition-colors">Contact Us</Link></li>
                            <li><Link href="/faq" className="hover:text-accent-gold transition-colors">FAQ</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-xs sm:text-sm uppercase tracking-widest font-medium mb-4 sm:mb-6">Newsletter</h3>
                        <p className="text-foreground-muted text-xs sm:text-sm mb-3 sm:mb-4">
                            Subscribe to receive updates, access to exclusive deals, and more.
                        </p>
                        <form className="flex flex-col space-y-2 sm:space-y-3">
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                className="border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm focus:outline-none focus:border-accent-gold bg-transparent"
                            />
                            <button className="bg-foreground text-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm uppercase tracking-widest hover:bg-accent-gold transition-colors">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </motion.div>

                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-foreground-muted">
                    <p>&copy; {new Date().getFullYear()} Vishwa Lifestyle. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
