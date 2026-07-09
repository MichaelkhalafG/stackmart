import { formatPrice } from "@/components/product/MarketplaceCard";

import type { ProductMetrics } from "./types";

/** Metrics values are display numbers (dollars for mrr/profit, per the seed); mono, GitHub-style. */
function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

/**
 * MetricsGrid (13_Component_Map.md) — Box grid over metrics{mrr,users,founded,profit} with mono
 * values. Renders only the metrics that are present. Server-safe (no hooks).
 */
export function MetricsGrid({
  metrics,
  currency,
}: {
  metrics: ProductMetrics | null;
  currency: string;
}) {
  if (!metrics) return null;

  const cells: Array<{ label: string; value: string }> = [];
  if (metrics.mrr != null) cells.push({ label: "MRR", value: formatPrice(metrics.mrr * 100, currency) });
  if (metrics.profit != null)
    cells.push({ label: "Profit / mo", value: formatPrice(metrics.profit * 100, currency) });
  if (metrics.users != null) cells.push({ label: "Users", value: formatCount(metrics.users) });
  if (metrics.founded != null) cells.push({ label: "Founded", value: String(metrics.founded) });

  if (cells.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cells.map((cell) => (
        <div key={cell.label} className="rounded-md border border-border bg-canvas p-3">
          <div className="text-xs text-fg-muted">{cell.label}</div>
          <div className="mono mt-1 text-base font-semibold text-fg">{cell.value}</div>
        </div>
      ))}
    </div>
  );
}
