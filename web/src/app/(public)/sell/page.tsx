import type { Metadata } from "next";

import { SellForm } from "@/components/sell/SellForm";
import { DEFAULT_OG_IMAGE } from "@/components/seo/JsonLd";

const SELL_DESCRIPTION =
  "Sell your micro-SaaS, web app, or codebase on MDN STACKMART. Submit your project for review — no account needed. Our team vets every submission and follows up by email.";

export const metadata: Metadata = {
  title: "Sell your project",
  description: SELL_DESCRIPTION,
  alternates: { canonical: "/sell" },
  openGraph: {
    type: "website",
    url: "/sell",
    title: "Sell your project on MDN STACKMART",
    description: SELL_DESCRIPTION,
    siteName: "MDN STACKMART",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sell your project on MDN STACKMART",
    description: SELL_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

/**
 * Sell `/sell` (S3.04) — public submission page. The page is a Server Component (SEO metadata);
 * the interactive form is the client `SellForm`, which POSTs to the frozen `POST /api/submissions`
 * contract. No auth: sellers submit via this form and an admin vets/publishes (STACKMART is
 * admin-curated, one-sided — CLAUDE.md).
 *
 * Layout follows "Forms & Utility reference §02": a mono eyebrow + navy heading + lead paragraph,
 * then the sectioned form card beside its sticky progress rail.
 */
export default function SellPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <header className="mb-7 sm:mb-9">
        <p className="mono mb-2 text-[11px] tracking-[0.1em] text-accent uppercase">Sell</p>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold tracking-[-0.01em] text-primary">
          Submit a listing
        </h1>
        <p className="mt-2.5 max-w-[64ch] text-base leading-[1.5] text-fg-muted">
          Submit your micro-SaaS, web app, or codebase for review. No account needed — our team vets
          every submission and follows up by email.
        </p>
      </header>

      <SellForm />
    </div>
  );
}
