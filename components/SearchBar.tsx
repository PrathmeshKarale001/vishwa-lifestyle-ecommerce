"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Search, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  _id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  categoryName: string;
}

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

function SearchBarContent({
  className = "",
  placeholder = "Search for products...",
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQuery(searchParams.get("search") || "");
  }, [searchParams]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions with debounce
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery.trim())}`,
      );
      const data = await res.json();
      setSuggestions(data.products || []);
      setShowDropdown(true);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Debounce the API call
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    const params = new URLSearchParams(searchParams.toString());

    if (query.trim()) {
      params.set("search", query.trim());
    } else {
      params.delete("search");
    }

    // Reset pagination when searching
    params.delete("page");

    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  const handleSuggestionClick = (slug: string) => {
    setShowDropdown(false);
    router.push(`/product/${slug}`);
  };

  const clearSearch = () => {
    setQuery("");
    setSuggestions([]);
    setShowDropdown(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("page");
    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-xl mx-auto ${className}`}
    >
      <form onSubmit={handleSearch} className="relative group">
        <div className="relative flex items-center">
          <motion.div
            animate={{
              boxShadow: isFocused
                ? "0 0 0 2px rgba(212, 175, 55, 0.3)"
                : "none",
            }}
            className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md border border-white/20 transition-colors duration-300"
          />

          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              setIsFocused(true);
              if (suggestions.length > 0) setShowDropdown(true);
            }}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="w-full bg-transparent text-white placeholder:text-white/70 rounded-full py-3.5 pl-12 pr-12 focus:outline-none relative z-10 transition-all duration-300"
            data-testid="search-input"
            autoComplete="off"
          />

          <Search
            className={`absolute left-4 z-10 transition-colors duration-300 ${
              isFocused ? "text-accent-gold" : "text-white/70"
            }`}
            size={20}
          />

          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute right-10 z-10"
              >
                <Loader2 size={16} className="animate-spin text-accent-gold" />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                type="button"
                onClick={clearSearch}
                className="absolute right-3 z-20 p-1.5 hover:bg-white/20 rounded-full text-white transition-colors"
                aria-label="Clear search"
              >
                <X size={16} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showDropdown && (suggestions.length > 0 || isLoading) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-[400px] overflow-y-auto"
          >
            {suggestions.length > 0 ? (
              <>
                <div className="px-4 py-2 border-b border-gray-100">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
                    Suggestions
                  </span>
                </div>
                {suggestions.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => handleSuggestionClick(product.slug)}
                    className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    {product.image && (
                      <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.categoryName}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
                      {formatPrice(product.price)}
                    </span>
                  </button>
                ))}
                <button
                  onClick={handleSearch as any}
                  className="w-full px-4 py-3 text-sm text-accent-gold font-medium hover:bg-accent-gold/5 border-t border-gray-100 transition-colors text-center"
                >
                  View all results for &quot;{query}&quot;
                </button>
              </>
            ) : isLoading ? (
              <div className="px-4 py-6 text-center">
                <Loader2
                  size={20}
                  className="animate-spin text-accent-gold mx-auto mb-2"
                />
                <p className="text-xs text-gray-400">Searching...</p>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SearchBar(props: SearchBarProps) {
  return (
    <Suspense
      fallback={<div className="h-12 bg-white/10 rounded-full animate-pulse" />}
    >
      <SearchBarContent {...props} />
    </Suspense>
  );
}
