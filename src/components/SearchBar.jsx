"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Loader2 } from "lucide-react";

/**
 * 🔍 BookingSearchBar Component
 * A reusable, animated, and debounced search bar for bookings or general use.
 */
export default function BookingSearchBar({
  onSearch,
  placeholder = "Search bookings by name, email, or ID...",
  debounce = 400,
  showButton = true,
}) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // 🧠 Debounced search logic
  useEffect(() => {
    if (query === "") {
      onSearch?.("");
      setLoading(false);
      return;
    }

    setLoading(true);
    const handler = setTimeout(() => {
      onSearch?.(query.trim());
      setLoading(false);
    }, debounce);

    return () => clearTimeout(handler);
  }, [query, debounce, onSearch]);

  // 🎹 Keyboard shortcut: Press "/" to focus search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const clearSearch = () => {
    setQuery("");
    onSearch?.("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 14 }}
      className="sticky top-16 left-0 lg:left-60 right-0 bg-white z-10 flex items-center gap-0 flex-wrap px-6 shadow-sm py-4"
    >
      {/* 🔹 Search Input */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-9 pr-10 rounded-xl shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 transition-all"
        />

        {/* 🔸 Clear Button or Loading Spinner */}
        {loading ? (
          <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-gray-400" />
        ) : (
          query && (
            <X
              onClick={clearSearch}
              className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600 transition"
            />
          )
        )}
      </div>

      {/* 🔹 Search Button (Optional) */}
      {showButton && (
        <Button
          variant="outline"
          className="flex items-center gap-2 rounded-xl"
          onClick={() => onSearch?.(query.trim())}
          disabled={loading}
        >
          <Search size={16} /> {loading ? "Searching..." : "Search"}
        </Button>
      )}
    </motion.div>
  );
}
