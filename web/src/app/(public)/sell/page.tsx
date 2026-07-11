import type { Metadata } from "next";

import { SellForm } from "@/components/sell/SellForm";

const SELL_DESCRIPTION =
  "Sell your micro-SaaS, web app, or codebase on STACKMART. Submit your project for review — no account needed. Our team vets every submission and follows up by email.";

export const metadata: Metadata = {
  title: "Sell your project",
  description: SELL_DESCRIPTION,
  alternates: { canonical: "/sell" },
  openGraph: {
    type: "website",
    url: "/sell",
    title: "Sell your project on STACKMART",
    description: SELL_DESCRIPTION,
    siteName: "STACKMART",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sell your project on STACKMART",
    description: SELL_DESCRIPTION,
  },
};

/**
 * Sell `/sell` (S3.04) — public submission page. The page is a Server Component (SEO
 * metadata); the interactive form is the client `SellForm`, which POSTs to the frozen
 * `POST /api/submissions` contract. No auth: sellers submit via this form and an admin
 * vets/publishes (STACKMART is admin-curated, one-sided — CLAUDE.md).
 */
export default function SellPage() {
  return (
    <div className="mx-auto max-w-2xl py-4">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Sell your project</h1>
        <p className="mt-1 text-sm text-fg-muted">
          Submit your micro-SaaS, web app, or codebase for review. No account needed — our team
          vets every submission and follows up by email.
        </p>
      </header>
      <SellForm />
    </div>
  );
}
