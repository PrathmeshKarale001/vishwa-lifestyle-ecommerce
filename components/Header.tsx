"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, User, ShoppingBag, Menu, X, Heart, ChevronDown } from "lucide-react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useAppKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import SearchAutocomplete from "./SearchAutocomplete";

export default function Header({ categories = [] }: { categories?: any[] }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShopHovered, setIsShopHovered] = useState(false);
  const { scrollY } = useScroll();
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const { itemCount, openCart } = useCartStore();
  const wishlistCount = useWishlistStore((state) => state.itemCount);

  // Enable keyboard shortcuts
  useAppKeyboardShortcuts();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const isSolidHeader = isScrolled || !isHomePage;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out border-b ${isSolidHeader
          ? "bg-white/80 backdrop-blur-md py-3 sm:py-4 text-black border-gray-100 shadow-sm"
          : "bg-transparent py-6 sm:py-8 text-white border-transparent"
          }`}
        onMouseLeave={() => setIsShopHovered(false)}
      >
        <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between relative">
          {/* Mobile Menu Button */}
          <button
            className={`lg:hidden transition-colors z-10 hover:text-accent-gold ${isSolidHeader ? "text-black" : "text-white"}`}
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          {/* Navigation - Left */}
          <nav
            className={`hidden lg:flex items-center space-x-8 text-sm tracking-[0.15em] uppercase font-medium transition-colors duration-300 ${isSolidHeader ? "text-black" : "text-white"
              }`}
          >
            <div
              className="relative group"
              onMouseEnter={() => setIsShopHovered(true)}
            >
              <Link href="/shop" className="hover:text-accent-gold transition-colors flex items-center gap-1 py-4">
                <span>Shop</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isShopHovered ? 'rotate-180' : ''}`} />
                <span className="absolute bottom-3 left-0 w-0 h-0.5 bg-accent-gold transition-all duration-300 group-hover:w-full"></span>
              </Link>

              {/* Mega Menu Dropdown */}
              <AnimatePresence>
                {isShopHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 w-[1000px] -ml-4 bg-white shadow-xl rounded-lg p-8 grid grid-cols-4 gap-8 text-left z-50 border border-gray-100"
                    onMouseEnter={() => setIsShopHovered(true)}
                    onMouseLeave={() => setIsShopHovered(false)}
                  >
                    {categories.map((category: any) => (
                      <div key={category.slug} className="space-y-4">
                        <Link
                          href={`/shop?category=${category.slug}`}
                          className="block text-base font-serif font-bold text-black border-b border-gray-100 pb-2 hover:text-accent-gold transition-colors"
                        >
                          {category.name}
                        </Link>
                        <ul className="space-y-2">
                          {category.subCategories?.map((sub: string) => (
                            <li key={sub}>
                              <Link
                                href={`/shop?category=${category.slug}&sub=${sub}`}
                                className="text-xs text-gray-500 hover:text-accent-gold transition-colors tracking-wide capitalize"
                              >
                                {sub}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/story" className="hover:text-accent-gold transition-colors relative group">
              <span>Our Story</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-gold transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/philosophy" className="hover:text-accent-gold transition-colors relative group">
              <span>Philosophy</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-gold transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/contact" className="hover:text-accent-gold transition-colors relative group">
              <span>Contact</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-gold transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>

          {/* Logo - Center */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-0">
            <Link href="/" className="flex items-center justify-center group">
              <Image
                src="/vishwalogo-v2.png"
                alt="Vishwa Lifestyle"
                width={120}
                height={40}
                className={`transition-all duration-500 ease-out transform ${isSolidHeader
                  ? "h-8 sm:h-10 w-auto"
                  : "h-10 sm:h-12 w-auto group-hover:scale-105"
                  }`}
                priority
              />
            </Link>
          </div>

          {/* Actions - Right */}
          <div
            className={`flex items-center space-x-3 sm:space-x-5 transition-colors duration-300 z-10 ${isSolidHeader ? "text-black" : "text-white"
              }`}
          >
            <button className="hover:text-accent-gold transition-colors hidden lg:flex items-center text-xs tracking-widest font-medium">
              INR
            </button>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="hover:text-accent-gold transition-colors"
              aria-label="Search"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>

            <Link
              href="/account/wishlist"
              className="hover:text-accent-gold transition-colors relative hidden md:block"
              aria-label="Wishlist"
            >
              <Heart size={20} strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] bg-accent-gold text-white w-4 h-4 flex items-center justify-center rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link href="/account" className="hover:text-accent-gold transition-colors" aria-label="Account">
              <User size={20} strokeWidth={1.5} />
            </Link>

            <button
              onClick={openCart}
              className="hover:text-accent-gold transition-colors relative"
              aria-label="Cart"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] bg-accent-gold text-white w-4 h-4 flex items-center justify-center rounded-full">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Search Autocomplete */}
      <SearchAutocomplete
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={(product) => {
          setIsSearchOpen(false);
          window.location.href = `/product/${product.slug}`;
        }}
      />

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "-100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-white text-foreground flex flex-col overflow-y-auto"
          >
            <div className="p-6 flex justify-between items-center border-b border-gray-100">
              <span className="font-serif text-xl font-bold">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
                <X size={24} />
              </button>
            </div>
            <nav className="flex-1 flex flex-col p-8 space-y-6 text-2xl font-serif">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-accent-gold transition-colors"
              >
                Home
              </Link>

              <div className="space-y-4">
                <Link
                  href="/shop"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:text-accent-gold transition-colors block"
                >
                  Shop
                </Link>
                {/* Mobile Submenu */}
                <div className="pl-4 space-y-4 border-l-2 border-gray-100/50">
                  {categories.map((cat: any) => (
                    <div key={cat.slug} className="space-y-2">
                      <Link
                        href={`/shop?category=${cat.slug}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-base font-medium text-gray-800"
                      >
                        {cat.name}
                      </Link>
                      <div className="pl-2 space-y-1">
                        {cat.subCategories?.map((sub: string) => (
                          <Link
                            key={sub}
                            href={`/shop?category=${cat.slug}&sub=${sub}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block text-sm text-gray-500 font-sans"
                          >
                            - {sub}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/story"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-accent-gold transition-colors"
              >
                Our Story
              </Link>
              <Link
                href="/philosophy"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-accent-gold transition-colors"
              >
                Philosophy
              </Link>
              <Link
                href="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-accent-gold transition-colors"
              >
                Contact
              </Link>
              <div className="pt-8 border-t border-gray-100 space-y-4">
                <Link
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-sans uppercase tracking-widest flex items-center gap-3"
                >
                  <User size={20} /> My Account
                </Link>
                <Link
                  href="/account/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-sans uppercase tracking-widest flex items-center gap-3"
                >
                  <Heart size={20} /> Wishlist ({wishlistCount})
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
