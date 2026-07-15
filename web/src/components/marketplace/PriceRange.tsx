"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

/**
 * Slider operates in whole dollars; the URL params `min_price`/`max_price` are in cents.
 *
 * The ceiling covers the real catalogue: listings now run up to ~$1.43M (asking ≈ 24–36× MRR), so
 * the old $30,000 cap made every product above it unreachable AND excluded by any max selection —
 * the price filter was effectively broken. $1.5M gives headroom; the two number inputs stay precise
 * for fine control at the low end where a coarse slider step would not.
 */
const MAX_DOLLARS = 1_500_000;
const STEP_DOLLARS = 5_000;

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

  // Reset the local range when the URL params change externally (back/forward, clear filters) by
  // adjusting state DURING render — React's recommended alternative to a setState-in-effect sync
  // (https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes).
  // We track the last props we synced from; when they differ, we update once (no cascading effect).
  const [syncedMin, setSyncedMin] = useState(minCents);
  const [syncedMax, setSyncedMax] = useState(maxCents);
  if (minCents !== syncedMin || maxCents !== syncedMax) {
    setSyncedMin(minCents);
    setSyncedMax(maxCents);
    setRange([toDollars(minCents, 0), toDollars(maxCents, MAX_DOLLARS)]);
  }

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
