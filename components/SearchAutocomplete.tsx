"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { searchProducts } from "@/lib/sanity";
import { trackSearch } from "@/lib/analytics";

interface SearchResult {
  _id: string;
  name: string;
  slug: string;
  price: number;
  image?: string;
  category?: string;
}

interface SearchAutocompleteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (product: SearchResult) => void;
}

export default function SearchAutocomplete({
  isOpen,
  onClose,
  onSelect,
}: SearchAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Search products with debounce
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const products = await searchProducts(query);
        setResults(products.slice(0, 6)); // Limit to 6 results
        setSelectedIndex(-1);
        
        // Track search
        trackSearch(query, products.length);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < results.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      const selected = results[selectedIndex];
      if (selected && onSelect) {
        onSelect(selected);
      } else if (selected) {
        window.location.href = `/product/${selected.slug}`;
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center pt-24"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full max-w-2xl mx-4 bg-white rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif">Search Products</h2>
              <button
                onClick={onClose}
                className="text-foreground-muted hover:text-foreground transition-colors"
                aria-label="Close search"
              >
                <X size={24} />
              </button>
            </div>

            <div className="relative">
              <div className="relative">
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted"
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search products..."
                  className="w-full pl-12 pr-12 py-4 text-lg border-b-2 border-gray-200 focus:outline-none focus:border-accent-gold transition-colors"
                  autoFocus
                />
                {loading && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Loader2 size={20} className="animate-spin text-foreground-muted" />
                  </div>
                )}
                {!loading && query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>

              {/* Search Results */}
              {query.length >= 2 && (
                <div
                  ref={resultsRef}
                  className="mt-4 max-h-96 overflow-y-auto"
                  role="listbox"
                >
                  {loading ? (
                    <div className="py-8 text-center text-foreground-muted">
                      <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                      <p>Searching...</p>
                    </div>
                  ) : results.length > 0 ? (
                    <ul className="space-y-2">
                      {results.map((product, index) => (
                        <li key={product._id}>
                          <Link
                            href={`/product/${product.slug}`}
                            onClick={onClose}
                            className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                              selectedIndex === index
                                ? "bg-accent-gold/10 border-2 border-accent-gold"
                                : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                            }`}
                          >
                            {product.image && (
                              <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  fill
                                  sizes="64px"
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-foreground truncate">
                                {product.name}
                              </h3>
                              {product.category && (
                                <p className="text-sm text-foreground-muted">
                                  {product.category}
                                </p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-medium">
                                ₹{product.price.toLocaleString("en-IN")}
                              </p>
                            </div>
                          </Link>
                        </li>
                      ))}
                      {results.length >= 6 && (
                        <li>
                          <Link
                            href={`/shop?search=${encodeURIComponent(query)}`}
                            onClick={onClose}
                            className="block text-center py-3 text-accent-gold hover:underline font-medium"
                          >
                            View all results for "{query}"
                          </Link>
                        </li>
                      )}
                    </ul>
                  ) : (
                    <div className="py-8 text-center text-foreground-muted">
                      <p>No products found for "{query}"</p>
                      <Link
                        href="/shop"
                        onClick={onClose}
                        className="text-accent-gold hover:underline mt-2 inline-block"
                      >
                        Browse all products
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Search Tips */}
              {query.length < 2 && (
                <div className="mt-6 text-sm text-foreground-muted">
                  <p className="mb-2">Search tips:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Type at least 2 characters to search</li>
                    <li>Use arrow keys to navigate results</li>
                    <li>Press Enter to select</li>
                    <li>Press Esc to close</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

