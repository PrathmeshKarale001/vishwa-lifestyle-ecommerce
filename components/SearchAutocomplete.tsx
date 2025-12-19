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

  const popularSearches = ["Agnihotra Kit", "Ghee", "Incense", "Copper Pyramid"];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-start justify-center pt-20 sm:pt-32"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header / Input Area */}
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-white relative z-10">
            <div className="flex items-center gap-4">
              <Search className="text-accent-gold w-6 h-6" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search for products..."
                className="flex-1 text-lg sm:text-xl font-medium placeholder:text-gray-300 focus:outline-none bg-transparent"
                autoFocus
              />
              {loading ? (
                <Loader2 className="animate-spin text-gray-400 w-5 h-5" />
              ) : (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="text-gray-500 w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Results Area */}
          <div className="bg-gray-50/50 min-h-[300px] max-h-[60vh] overflow-y-auto p-4 sm:p-6">
            {query.length < 2 ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                    Popular Searches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm hover:border-accent-gold hover:text-accent-gold transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : results.length > 0 ? (
              <ul className="space-y-2">
                {results.map((product, index) => (
                  <li key={product._id}>
                    <Link
                      href={`/product/${product.slug}`}
                      onClick={onClose}
                      className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${selectedIndex === index
                        ? "bg-white shadow-md ring-1 ring-accent-gold"
                        : "hover:bg-white hover:shadow-sm"
                        }`}
                    >
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Search size={20} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {product.name}
                        </h3>
                        <p className="text-sm text-accent-gold">
                          {product.category || "Product"}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-gray-900">
                          ₹{(product.price ?? 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
                {results.length >= 6 && (
                  <li className="pt-2">
                    <Link
                      href={`/shop?search=${encodeURIComponent(query)}`}
                      onClick={onClose}
                      className="block w-full py-3 text-center bg-accent-gold/10 text-accent-gold font-medium rounded-lg hover:bg-accent-gold/20 transition-colors"
                    >
                      View all results for "{query}"
                    </Link>
                  </li>
                )}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="text-gray-400 w-8 h-8" />
                </div>
                <p className="text-gray-900 font-medium mb-1">No products found</p>
                <p className="text-gray-500 text-sm">
                  We couldn't find anything matching "{query}"
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

