"use client";

import { PurchasesTable } from "@/components/orders/PurchasesTable";

/**
 * Purchases (S4.06) — the buyer's real orders (status, license key + copy, download). Replaces the
 * S3.05 Blankslate placeholder. Renders inside the S3.03 `(account)` guard; `PurchasesTable`
 * fetches the frozen `GET /api/orders` shape (the orders-read API, live after day-4).
 */
export default function PurchasesPage() {
  return (
    <div className="py-2">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Your purchases</h1>
        <p className="text-sm text-fg-muted">Your bought products, license keys, and downloads.</p>
      </header>

      <PurchasesTable />
    </div>
  );
}
