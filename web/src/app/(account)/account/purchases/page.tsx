"use client";

import { PurchasesTable } from "@/components/orders/PurchasesTable";
import { MobilePageHeader } from "@/components/layout/MobilePageHeader";

/**
 * Purchases (S4.06) — the buyer's real orders (status, license key + copy, download). Replaces the
 * S3.05 Blankslate placeholder. Renders inside the S3.03 `(account)` guard; `PurchasesTable`
 * fetches the frozen `GET /api/orders` shape (the orders-read API, live after day-4).
 */
export default function PurchasesPage() {
  return (
    <div className="py-2 max-md:pt-0">
      {/* MOBILE (<md): the shared branded navy header band. */}
      <MobilePageHeader
        command="mdn orders --list"
        title="Your purchases"
        subhead="Your bought products, license keys, and downloads."
      />

      {/* DESKTOP (md+): the existing header, unchanged. */}
      <header className="mb-6 hidden md:block">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Your purchases</h1>
        <p className="text-sm text-fg-muted">Your bought products, license keys, and downloads.</p>
      </header>

      <div className="max-md:mt-6">
        <PurchasesTable />
      </div>
    </div>
  );
}
