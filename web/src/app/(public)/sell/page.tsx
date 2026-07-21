import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SHOW_SELL } from "@/lib/config";
import { SellForm } from "@/components/sell/SellForm";
import { MobilePageHeader } from "@/components/layout/MobilePageHeader";
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
  // Buyer-only mode: the route stays in the build but renders the 404, so /sell is unreachable even
  // by direct URL. Everything below is intact — flip SHOW_SELL to restore it.
  if (!SHOW_SELL) notFound();

  return (
    <div className="container-page py-10 max-md:px-0 max-md:pt-0 max-md:pb-0 sm:py-14">
      {/* MOBILE (<md): the shared branded navy coding-motif header band. */}
      <MobilePageHeader
        command="mdn submit --listing"
        title="Submit a listing"
        subhead="Submit your project for review — we vet every one and reply by email. No account · flat 20% commission when it sells."
      />

      {/* DESKTOP (md+): the reference header, unchanged. */}
      <header className="mb-6 hidden sm:mb-9 md:block">
        <p className="mono mb-2 text-[11px] tracking-[0.1em] text-accent uppercase">Sell</p>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold tracking-[-0.01em] text-primary">
          Submit a listing
        </h1>
        <p className="mt-2.5 max-w-[64ch] text-base leading-[1.5] text-fg-muted">
          Submit your micro-SaaS, web app, or codebase for review. Attach the code, a short
          verification README and a few screenshots — the MDN STACKMART team vets every submission
          and follows up by email. No account needed. Flat 20% commission when it sells.
        </p>
      </header>

      <SellForm />
    </div>
  );
}
