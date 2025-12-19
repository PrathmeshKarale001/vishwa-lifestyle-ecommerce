"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchBarProps {
    className?: string;
    placeholder?: string;
}

function SearchBarContent({
    className = "",
    placeholder = "Search for products..."
}: SearchBarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get("search") || "");
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        setQuery(searchParams.get("search") || "");
    }, [searchParams]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
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

    const clearSearch = () => {
        setQuery("");
        const params = new URLSearchParams(searchParams.toString());
        params.delete("search");
        params.delete("page");
        router.push(`/shop?${params.toString()}`, { scroll: false });
    };

    return (
        <form
            onSubmit={handleSearch}
            className={`relative group max-w-xl w-full mx-auto ${className}`}
        >
            <div className="relative flex items-center">
                <motion.div
                    animate={{
                        boxShadow: isFocused ? "0 0 0 2px rgba(212, 175, 55, 0.3)" : "none",
                    }}
                    className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md border border-white/20 transition-colors duration-300"
                />

                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    className="w-full bg-transparent text-white placeholder:text-white/70 rounded-full py-3.5 pl-12 pr-12 focus:outline-none relative z-10 transition-all duration-300"
                />

                <Search
                    className={`absolute left-4 z-10 transition-colors duration-300 ${isFocused ? "text-accent-gold" : "text-white/70"
                        }`}
                    size={20}
                />

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
    );
}

export default function SearchBar(props: SearchBarProps) {
    return (
        <Suspense fallback={<div className="h-12 bg-white/10 rounded-full animate-pulse" />}>
            <SearchBarContent {...props} />
        </Suspense>
    );
}
