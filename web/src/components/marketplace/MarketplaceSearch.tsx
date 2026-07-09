"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

/**
 * Search box driving `?search=` (FULLTEXT title+tagline, 12_API_Specification.md). Debounced so
 * we don't rewrite the URL on every keystroke; stays in sync when the URL changes externally
 * (back/forward or "clear filters"). `onSearch` must be stable (useCallback in the parent).
 */
export function MarketplaceSearch({
  value,
  onSearch,
}: {
  value: string;
  onSearch: (value: string) => void;
}) {
  const [text, setText] = useState(value);
  const lastEmitted = useRef(value);

  // Sync local text when the URL value changes from the outside (not from our own debounce).
  useEffect(() => {
    if (value !== lastEmitted.current) {
      lastEmitted.current = value;
      setText(value);
    }
  }, [value]);

  // Debounce writes to the URL.
  useEffect(() => {
    const id = setTimeout(() => {
      if (text !== lastEmitted.current) {
        lastEmitted.current = text;
        onSearch(text.trim());
      }
    }, 350);
    return () => clearTimeout(id);
  }, [text, onSearch]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-fg-muted"
      />
      <Input
        type="search"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Search products…"
        aria-label="Search products"
        className="h-8 bg-canvas-subtle pl-8"
      />
    </div>
  );
}
