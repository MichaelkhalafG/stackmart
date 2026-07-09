"use client";

import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

/** Slider operates in whole dollars; the URL params `min_price`/`max_price` are in cents. */
const MAX_DOLLARS = 30000;
const STEP_DOLLARS = 500;

function toDollars(cents: string, fallback: number): number {
  if (!cents) return fallback;
  const n = Number(cents);
  return Number.isFinite(n) ? Math.round(n / 100) : fallback;
}

/**
 * PriceRange (13_Component_Map.md) — shadcn Slider + two Inputs. Writes `min_price`/`max_price`
 * (cents) on commit only (drag end / input blur), so we don't spam the URL while dragging.
 */
export function PriceRange({
  minCents,
  maxCents,
  onCommit,
}: {
  minCents: string;
  maxCents: string;
  onCommit: (minCents: number | null, maxCents: number | null) => void;
}) {
  const [range, setRange] = useState<[number, number]>([
    toDollars(minCents, 0),
    toDollars(maxCents, MAX_DOLLARS),
  ]);

  // Keep in sync when the URL changes externally (back/forward, clear filters).
  useEffect(() => {
    setRange([toDollars(minCents, 0), toDollars(maxCents, MAX_DOLLARS)]);
  }, [minCents, maxCents]);

  const commit = (next: [number, number]) => {
    const lo = Math.max(0, Math.min(next[0], next[1]));
    const hi = Math.min(MAX_DOLLARS, Math.max(next[0], next[1]));
    onCommit(lo > 0 ? lo * 100 : null, hi < MAX_DOLLARS ? hi * 100 : null);
  };

  const setBound = (index: 0 | 1, raw: string) => {
    const n = Number(raw.replace(/[^0-9]/g, ""));
    const value = Number.isFinite(n) ? n : 0;
    setRange((prev) => {
      const next: [number, number] = [...prev];
      next[index] = Math.max(0, Math.min(MAX_DOLLARS, value));
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <Slider
        min={0}
        max={MAX_DOLLARS}
        step={STEP_DOLLARS}
        value={range}
        onValueChange={(value) => setRange(value as [number, number])}
        onValueCommitted={(value) => commit(value as [number, number])}
        aria-label="Price range"
      />
      <div className="flex items-center gap-2">
        <Input
          inputMode="numeric"
          aria-label="Minimum price (USD)"
          value={range[0]}
          onChange={(event) => setBound(0, event.target.value)}
          onBlur={() => commit(range)}
          className="mono h-8"
        />
        <span className="text-fg-muted">–</span>
        <Input
          inputMode="numeric"
          aria-label="Maximum price (USD)"
          value={range[1]}
          onChange={(event) => setBound(1, event.target.value)}
          onBlur={() => commit(range)}
          className="mono h-8"
        />
      </div>
      <p className="text-xs text-fg-muted">USD · up to ${MAX_DOLLARS.toLocaleString()}</p>
    </div>
  );
}
