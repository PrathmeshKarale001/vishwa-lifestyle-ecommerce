"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Search, User, ShoppingBag, Menu, X, Heart, ChevronDown, ArrowRight, Plus, Minus } from "lucide-react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useAppKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import SearchAutocomplete from "./SearchAutocomplete";

interface HeaderProps {
  categories?: any[];
  settings?: any;
}

export default function Header({ categories = [], settings }: HeaderProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShopHovered, setIsShopHovered] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].slug);
    }
  }, [categories, activeCategory]);

  const activeCategoryData = categories.find(c => c.slug === activeCategory) || categories[0];

  const announcement = settings?.announcementBar || { show: false, text: "", link: "", backgroundColor: "#D4AF37", textColor: "#FFFFFF" };
  const logoSrc = settings?.logo || "/vishwalogo-v2.png";
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
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Announcement Bar - Now always sticky with header */}
      <AnimatePresence>
        {announcement.show && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              backgroundColor: announcement.backgroundColor || "#D4AF37",
              color: announcement.textColor || "#FFFFFF"
            }}
            className="text-[10px] sm:text-xs py-2 px-4 text-center tracking-widest uppercase font-medium relative z-[60]"
          >
            {announcement.link ? (
              <Link href={announcement.link} className="hover:underline">
                {announcement.text}
              </Link>
            ) : (
              <span>{announcement.text}</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <header
        className={`transition-all duration-500 ease-in-out border-b ${isSolidHeader
          ? "bg-white/90 backdrop-blur-md py-3 sm:py-4 text-black border-gray-100 shadow-sm"
          : "bg-transparent py-6 sm:py-8 text-white border-transparent"
          }`}
        onMouseLeave={() => setIsShopHovered(false)}
      >
        <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between relative">
          {/* Mobile Menu Button */}
          <button
            className={`lg:hidden transition-colors z-10 hover:text-accent-gold ${isSolidHeader ? "text-black" : "text-white"}`}
            onClick={() => setIsMenuOpen(true)}
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
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="absolute top-full left-1/2 -translate-x-1/2 w-[1100px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl overflow-hidden z-50 border border-gray-100 flex h-[550px]"
                    onMouseEnter={() => setIsShopHovered(true)}
                    onMouseLeave={() => setIsShopHovered(false)}
                  >
                    {/* Left Sidebar: First Only Categories */}
                    <div className="w-[300px] bg-gray-50/50 border-r border-gray-100 p-6 flex flex-col justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-6 pl-4 font-sans">
                          Categories
                        </p>
                        {categories.map((category: any) => (
                          <button
                            key={category.slug}
                            onMouseEnter={() => setActiveCategory(category.slug)}
                            onClick={() => router.push(`/shop?category=${category.slug}`)}
                            className={`w-full text-left px-4 py-4 rounded-xl transition-all duration-300 flex items-center justify-between group/cat ${activeCategory === category.slug
                              ? "bg-white shadow-sm ring-1 ring-gray-100 text-accent-gold"
                              : "text-gray-600 hover:bg-white hover:text-black"
                              }`}
                          >
                            <span className="text-sm font-serif font-bold tracking-wider">
                              {category.name}
                            </span>
                            <ArrowRight
                              size={14}
                              className={`transition-all duration-300 ${activeCategory === category.slug
                                ? "opacity-100 translate-x-0"
                                : "opacity-0 -translate-x-2 group-hover/cat:opacity-100 group-hover/cat:translate-x-0"
                                }`}
                            />
                          </button>
                        ))}
                      </div>

                      <Link
                        href="/shop"
                        className="mt-4 flex items-center justify-center gap-2 py-4 px-6 bg-accent-gold text-white rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-black transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        Explore All Products
                      </Link>
                    </div>

                    {/* Right Area: Dynamic Content (Subcategories & Segments) */}
                    <div className="flex-1 p-10 bg-white overflow-y-auto custom-scrollbar">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeCategoryData?.slug}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                          className="h-full"
                        >
                          <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                            <div>
                              <h3 className="text-3xl font-serif font-bold text-black mb-1">
                                {activeCategoryData?.name}
                              </h3>
                              <p className="text-sm text-gray-500 font-sans tracking-wide">
                                Explore our curated {activeCategoryData?.name} collection.
                              </p>
                            </div>
                            <Link
                              href={`/shop?category=${activeCategoryData?.slug}`}
                              className="text-xs uppercase tracking-[0.15em] font-bold text-accent-gold hover:text-black transition-colors flex items-center gap-2 group"
                            >
                              View All {activeCategoryData?.name}
                              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </div>

                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
                            {activeCategoryData?.subCategories?.map((sub: string) => {
                              const segments = activeCategoryData.categorySegments?.find(
                                (cs: any) => cs.subCategoryName === sub
                              )?.segments;

                              return (
                                <div key={sub} className="space-y-6">
                                  <Link
                                    href={`/shop?category=${activeCategoryData.slug}&sub=${sub}`}
                                    className="block relative group/sub"
                                  >
                                    <h4 className="text-sm font-bold text-black uppercase tracking-widest inline-block relative">
                                      {sub}
                                      <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-accent-gold transition-all duration-300 group-hover/sub:w-full"></span>
                                    </h4>
                                  </Link>

                                  <ul className="space-y-3 pl-1">
                                    {segments && segments.length > 0 ? (
                                      segments.map((seg: string) => (
                                        <li key={seg}>
                                          <Link
                                            href={`/shop?category=${activeCategoryData.slug}&sub=${sub}&segment=${seg}`}
                                            className="text-[12px] text-gray-500 hover:text-accent-gold hover:translate-x-1 transition-all duration-200 block font-sans"
                                          >
                                            {seg}
                                          </Link>
                                        </li>
                                      ))
                                    ) : (
                                      <li>
                                        <Link
                                          href={`/shop?category=${activeCategoryData.slug}&sub=${sub}`}
                                          className="text-[12px] text-gray-400 italic hover:text-accent-gold transition-colors block font-sans"
                                        >
                                          Browse Selection
                                        </Link>
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
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
                src={logoSrc}
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

      {/* Search Autocomplete Overlay */}
      <SearchAutocomplete
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={(product) => {
          setIsSearchOpen(false);
          // Handle navigation to product
        }}
      />

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "-100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-white text-foreground flex flex-col overflow-y-auto"
          >
            <div className="p-6 flex justify-between items-center border-b border-gray-100">
              <span className="font-serif text-xl font-bold">Menu</span>
              <button onClick={() => setIsMenuOpen(false)} aria-label="Close menu">
                <X size={24} />
              </button>
            </div>
            <nav className="flex-1 flex flex-col p-8 space-y-6 text-2xl font-serif">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="hover:text-accent-gold transition-colors"
              >
                Home
              </Link>

              <div className="space-y-4">
                <Link
                  href="/shop"
                  onClick={() => setIsMenuOpen(false)}
                  className="hover:text-accent-gold transition-colors block"
                >
                  Shop
                </Link>
                {/* Mobile Submenu with Accordions */}
                <div className="pl-2 space-y-4">
                  {categories.map((cat: any) => (
                    <CategoryAccordion key={cat.slug} category={cat} onNavigate={() => setIsMenuOpen(false)} />
                  ))}
                </div>
              </div>

              <Link
                href="/story"
                onClick={() => setIsMenuOpen(false)}
                className="hover:text-accent-gold transition-colors"
              >
                Our Story
              </Link>
              <Link
                href="/philosophy"
                onClick={() => setIsMenuOpen(false)}
                className="hover:text-accent-gold transition-colors"
              >
                Philosophy
              </Link>
              <Link
                href="/contact"
                onClick={() => setIsMenuOpen(false)}
                className="hover:text-accent-gold transition-colors"
              >
                Contact
              </Link>
              <div className="pt-8 border-t border-gray-100 space-y-4">
                <Link
                  href="/account"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-base font-sans uppercase tracking-widest flex items-center gap-3"
                >
                  <User size={20} /> My Account
                </Link>
                <Link
                  href="/account/wishlist"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-base font-sans uppercase tracking-widest flex items-center gap-3"
                >
                  <Heart size={20} /> Wishlist ({wishlistCount})
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CategoryAccordion({ category, onNavigate }: { category: any, onNavigate: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-4 py-2 border-b border-gray-50 last:border-0">
      <div className="flex items-center justify-between group">
        <Link
          href={`/shop?category=${category.slug}`}
          onClick={onNavigate}
          className="text-lg font-serif font-bold text-gray-900 group-hover:text-accent-gold transition-colors"
        >
          {category.name}
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-400 hover:text-accent-gold transition-colors"
        >
          {isOpen ? <Minus size={18} /> : <Plus size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pl-4 space-y-4 border-l-2 border-gray-100/50"
          >
            {category.subCategories?.map((sub: string) => (
              <SubCategoryAccordion
                key={sub}
                sub={sub}
                categorySlug={category.slug}
                segments={category.categorySegments?.find((cs: any) => cs.subCategoryName === sub)?.segments}
                onNavigate={onNavigate}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SubCategoryAccordion({ sub, categorySlug, segments, onNavigate }: { sub: string, categorySlug: string, segments?: string[], onNavigate: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasSegments = segments && segments.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between group">
        <Link
          href={`/shop?category=${categorySlug}&sub=${sub}`}
          onClick={onNavigate}
          className="text-sm font-bold text-gray-700 uppercase tracking-widest group-hover:text-accent-gold transition-colors"
        >
          {sub}
        </Link>
        {hasSegments && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-gray-400 hover:text-accent-gold transition-colors"
          >
            <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && hasSegments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pl-4 space-y-2"
          >
            {segments.map((seg: string) => (
              <Link
                key={seg}
                href={`/shop?category=${categorySlug}&sub=${sub}&segment=${seg}`}
                onClick={onNavigate}
                className="block text-sm text-gray-500 hover:text-accent-gold transition-colors py-1"
              >
                {seg}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
