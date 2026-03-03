"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { SearchInput } from "@/components/search-input";
import { SearchThread } from "@/components/search-thread";

export function SearchPage() {
  const [query, setQuery] = useState<string | null>(null);
  const isSearching = query !== null;

  function handleSubmit(q: string) {
    setQuery(q);
  }

  function handleReset() {
    setQuery(null);
  }

  return (
    <div className="relative min-h-screen">
      <AnimatePresence mode="wait">
        {!isSearching ? (
          /* Landing state */
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center justify-center min-h-screen px-4"
          >
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05, duration: 0.3 }}
              className="text-center mb-8"
            >
              <h1
                className="text-5xl font-bold mb-3"
                style={{ color: "var(--color-accent)", fontFamily: "inherit" }}
              >
                tav
              </h1>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                Search at the speed of thought
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="w-full"
              style={{ maxWidth: "min(50vw, 100% - 32px)", minWidth: "320px" }}
            >
              <SearchInput onSubmit={handleSubmit} autoFocus />
            </motion.div>
          </motion.div>
        ) : (
          /* Search state */
          <motion.div
            key="search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="min-h-screen"
          >
            {/* Logo top-left */}
            <div
              className="fixed top-0 left-0 right-0 z-40 px-4 py-3 flex items-center"
              style={{ background: "linear-gradient(var(--color-bg), transparent)" }}
            >
              <button
                type="button"
                onClick={handleReset}
                className="text-xl font-bold hover:opacity-75 transition-opacity"
                style={{ color: "var(--color-accent)", fontFamily: "inherit" }}
              >
                tav
              </button>
            </div>

            <SearchThread initialQuery={query} onReset={handleReset} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
