import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  Banknote,
  Check,
  CreditCard,
  Download,
  FileArchive,
  KeyRound,
  Search,
  ShieldCheck,
  TrendingUp,
  Upload,
} from "lucide-react";

import { GuidelinesFaq } from "@/components/guidelines/GuidelinesFaq";
import { GuidelinesSwitch } from "@/components/guidelines/GuidelinesSwitch";
import { MobilePageHeader } from "@/components/layout/MobilePageHeader";
import { DEFAULT_OG_IMAGE } from "@/components/seo/JsonLd";

const GUIDELINES_DESCRIPTION =
  "How MDN STACKMART works — how buyers browse vetted listings, buy securely, and receive a license key plus the deliverable ZIP, and how sellers submit, get reviewed, go live, and get paid on a flat 20% commission. Plus a full buyer and seller FAQ.";

export const metadata: Metadata = {
  title: "Guidelines",
  description: GUIDELINES_DESCRIPTION,
  alternates: { canonical: "/guidelines" },
  openGraph: {
    type: "website",
    url: "/guidelines",
    title: "Guidelines — how MDN STACKMART works",
    description: GUIDELINES_DESCRIPTION,
    siteName: "MDN STACKMART",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Guidelines — how MDN STACKMART works",
    description: GUIDELINES_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

/**
 * Guidelines `/guidelines` — the public "how this platform works" page, linked from the header nav
 * (it replaced "About") and from the footer's Resources column.
 *
 * PUBLIC and un-gated: buyers and sellers read the same page, so both halves are always visible —
 * there is no auth check and no seller-only branch (sellers have no accounts; CLAUDE.md).
 *
 * A Server Component with static metadata — nothing here is fetched or personalised, so the whole
 * page prerenders. It is full-bleed (no `Container` layout) and composes the landing design's
 * section language: mono eyebrow → navy headline → lavender/navy gradient-mesh bands, with the
 * `.how-*` coding backdrop reused behind the FAQ. Every colour comes from a token; no new CSS.
 */
const BUYER_STEPS = [
  {
    icon: Search,
    step: "01",
    title: "Browse vetted listings",
    body: "Every listing is reviewed by our team before it is published — nothing self-publishes. Open the live demo and the repository, and read the metrics and tech stack we checked.",
  },
  {
    icon: CreditCard,
    step: "02",
    title: "Buy securely",
    body: "One product, one order — there is no cart. Buy Now takes you straight through a secure checkout for that single listing.",
  },
  {
    icon: KeyRound,
    step: "03",
    title: "Receive your license key",
    body: "The moment payment is confirmed, your license key is issued and emailed to you. It is the proof that your copy is a paid, legitimate one.",
  },
  {
    icon: Download,
    step: "04",
    title: "Download the deliverable",
    body: "Your full source-code ZIP is waiting in Purchases. Downloads are generated for your account at request time — never a public link.",
  },
  {
    icon: TrendingUp,
    step: "05",
    title: "Own & grow",
    body: "The product is yours to run, modify, and scale. Ship the roadmap the previous founder never got to.",
  },
];

const SELLER_STEPS = [
  {
    icon: Upload,
    step: "01",
    title: "Submit your project",
    body: "Through the form at /sell — no account needed. Attach the deliverable code ZIP, product images, and a README that explains how we can verify your claims, plus your tech stack, business metrics, category, description, and your payout details.",
  },
  {
    icon: BadgeCheck,
    step: "02",
    title: "We review & verify",
    body: "An admin reads the code, follows your README to reproduce what you claimed, opens the demo, and sanity-checks the metrics. We approve, come back with questions, or decline.",
  },
  {
    icon: FileArchive,
    step: "03",
    title: "You go live",
    body: "Approved projects are published as listings by our team. There is no listing fee and no charge for being reviewed — the commission on a sale is the only cut we take.",
  },
  {
    icon: CreditCard,
    step: "04",
    title: "It sells",
    body: "A buyer completes checkout for your listing. Their payment is confirmed, and they immediately receive the deliverable ZIP and a license key.",
  },
  {
    icon: Banknote,
    step: "05",
    title: "You get paid",
    body: "MDN STACKMART takes a flat 20% commission and transfers the remaining 80% to the payout details you supplied — then emails you proof of the transfer for your records.",
  },
];

/** The single, flat commission — one rate for every seller. No plans, no tiers. */
const COMMISSION_POINTS = [
  "The same flat 20% for every seller — no plans, no tiers, no upsell",
  "No listing fee and no review fee, whether or not you are approved",
  "Paid out after the sale clears, to the details you supplied at submission",
  "Proof of transfer emailed to you for your records",
];

/** The mono code whisper behind the FAQ band — decorative only, static (no hydration risk). */
const FAQ_SNIPPET = [
  "$ stackmart verify --submission ./project.zip",
  "",
  "  ✓ readme .................. reproducible",
  "  ✓ metrics ................. checked",
  "  ✓ demo .................... reachable",
  "  ✓ status .................. approved",
];

type Step = { icon: typeof Search; step: string; title: string; body: string };

/**
 * One step card. `h-full` + a flex column so every card in a row is exactly the same height
 * regardless of how long its copy is, and the hover lift matches the landing's card quality
 * (border firms to navy + a soft navy shadow — no transform, so nothing shifts).
 */
function StepCard({ icon: Icon, step, title, body }: Step) {
  return (
    <div className="category-tile flex h-full flex-col rounded-[10px] border border-border bg-canvas p-4 md:p-[26px]">
      <div className="flex items-center justify-between">
        <div className="flex size-10 items-center justify-center rounded-lg bg-tag-bg md:size-[46px]">
          <Icon className="size-[19px] text-accent md:size-[21px]" strokeWidth={2} aria-hidden />
        </div>
        <span className="mono text-[19px] font-semibold text-accent md:text-[22px]">{step}</span>
      </div>
      <h3 className="mt-3.5 text-[1.05rem] font-semibold text-primary md:mt-5 md:text-[1.18rem]">
        {title}
      </h3>
      <p className="mt-1.5 text-[14px] leading-[1.5] text-fg-muted md:mt-2 md:text-[15px] md:leading-[1.55]">
        {body}
      </p>
    </div>
  );
}

/**
 * The step grid.
 *
 * An `auto-fit` grid left ragged, half-empty trailing rows (5 steps never divide evenly into
 * 3 or 4 columns). This lays the 5 steps out on a 6-column track so BOTH rows are completely
 * full and the block reads as deliberate: 3 cards of `col-span-2`, then 2 cards of `col-span-3`.
 * At `sm` it drops to two columns with the odd trailing card spanning the full width, so there is
 * never a lone card next to a gap.
 */
function StepGrid({ steps }: { steps: Step[] }) {
  const total = steps.length;

  return (
    <div className="mt-6 grid grid-cols-1 items-stretch gap-3.5 sm:grid-cols-2 md:mt-12 md:gap-5 lg:grid-cols-6">
      {steps.map((step, index) => {
        const lgSpan =
          total === 5 ? (index < 3 ? "lg:col-span-2" : "lg:col-span-3") : "lg:col-span-2";
        const smSpan = total % 2 === 1 && index === total - 1 ? "sm:col-span-2" : "";

        return (
          <div key={step.step} className={`${lgSpan} ${smSpan}`}>
            <StepCard {...step} />
          </div>
        );
      })}
    </div>
  );
}

export default function GuidelinesPage() {
  return (
    <>
      {/* MOBILE (<md): the shared branded navy header band, with the commission chip kept. */}
      <MobilePageHeader
        command="mdn docs --guidelines"
        title="How MDN STACKMART works"
        subhead="How buying and selling vetted micro-SaaS works here — for both buyers and sellers."
        extra={
          <span className="mono inline-flex items-center gap-2 rounded-md border border-tag-bg/25 bg-tag-bg/10 px-3 py-1.5 text-[12px] text-tag-bg">
            <span className="anim-pulse-dot size-1.5 rounded-full bg-tag-bg" aria-hidden />
            flat 20% commission · no listing fee
          </span>
        }
      />

      {/* ── Header — the branded dark navy band (same treatment as the landing's dark sections:
             `.mesh-sell` navy + royal-blue gradient mesh, with the `.grid-motif-sell` striped
             coding grid on top). Only the header is dark; every section below stays light.
             DESKTOP ONLY (md+) — mobile uses the shared MobilePageHeader band above. ── */}
      <section className="mesh-sell relative hidden overflow-hidden md:block">
        <div className="grid-motif-sell absolute inset-0" aria-hidden />

        <div className="relative container-page py-10 md:py-[clamp(64px,8vw,104px)]">
          <div className="max-w-[760px]">
            <p className="mono text-[12px] font-semibold tracking-[0.12em] text-tag-bg uppercase">
              Guidelines
            </p>

            <h1 className="mt-3 text-[1.9rem] leading-[1.1] font-bold tracking-[-0.03em] text-canvas md:mt-3.5 md:text-[clamp(2.2rem,4.4vw,3.4rem)] md:leading-[1.06]">
              How MDN STACKMART <span className="text-tag-bg">actually works.</span>
            </h1>

            {/* Mobile-only tight intro — says what MDN STACKMART is in two sentences. */}
            <p className="mt-4 text-[15px] leading-[1.55] text-canvas/75 md:hidden">
              A curated marketplace for buying and selling profitable micro-SaaS. Every listing is
              vetted by our team, and every sale delivers the full source code plus a license key.
            </p>

            {/* Full intro — desktop only (unchanged copy). */}
            <p className="mt-6 hidden max-w-[640px] text-[clamp(1.05rem,1.5vw,1.2rem)] leading-[1.6] text-canvas/75 md:block">
              MDN STACKMART is a curated marketplace for buying and selling profitable micro-SaaS —
              ready-made products, web apps, and codebases. Every listing is vetted by our team
              before it goes live, and every sale delivers the real thing: the full source code plus
              a license key. This page is the whole process, end to end, for both sides of it.
            </p>

            <div className="mono mt-6 inline-flex items-center gap-2.5 rounded-md border border-tag-bg/25 bg-tag-bg/10 px-3.5 py-2 text-[12.5px] text-tag-bg md:mt-7">
              <span className="anim-pulse-dot size-1.5 rounded-full bg-tag-bg" aria-hidden />
              flat 20% commission · no listing fee
            </div>

            {/* Desktop anchor buttons — on mobile the sticky segmented control below replaces these. */}
            <div className="mt-9 hidden flex-wrap gap-3 md:flex">
              <Link
                href="#for-buyers"
                className="shadow-cta-light rounded-md border border-canvas bg-canvas px-[22px] py-3 text-[15px] font-semibold text-primary-emphasis transition-[background-color,box-shadow] duration-200 hover:bg-tag-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tag-bg"
              >
                For buyers
              </Link>
              <Link
                href="#for-sellers"
                className="rounded-md border border-canvas/35 bg-transparent px-[22px] py-3 text-[15px] font-semibold text-canvas transition-[border-color,background-color] duration-200 hover:border-canvas hover:bg-canvas/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tag-bg"
              >
                For sellers
              </Link>
              <Link
                href="#faq"
                className="rounded-md border border-canvas/35 bg-transparent px-[22px] py-3 text-[15px] font-semibold text-canvas transition-[border-color,background-color] duration-200 hover:border-canvas hover:bg-canvas/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tag-bg"
              >
                Read the FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The three switchable sections. On mobile GuidelinesSwitch shows one at a time behind a
          sticky segmented control; at md+ its wrappers dissolve and all three stack, unchanged. */}
      <GuidelinesSwitch
        buyers={
          <section id="for-buyers" className="scroll-mt-20 border-b border-border bg-canvas">
        <div className="container-page py-12 md:py-[clamp(64px,8vw,104px)]">
          <div className="max-w-[660px]">
            <div className="text-[13px] font-semibold tracking-[0.08em] text-accent uppercase">
              For buyers
            </div>
            <h2 className="mt-2.5 text-[1.5rem] font-bold tracking-[-0.025em] text-primary md:text-[clamp(1.9rem,3.2vw,2.7rem)]">
              Buy a business, not a bundle of files
            </h2>
            <p className="mt-3 text-[15px] leading-[1.55] text-fg-muted md:mt-4 md:text-[17px] md:leading-[1.6]">
              Five steps from browsing to owning. No cart, no negotiation, no waiting on a handover
              that never comes — payment confirmed means delivered.
            </p>
          </div>

          <StepGrid steps={BUYER_STEPS} />

          {/* License & verification explainer */}
          <div className="panel-navy relative mt-8 overflow-hidden rounded-[14px] p-6 md:p-[clamp(28px,4vw,44px)]">
            <div className="motif-grid absolute inset-0" aria-hidden />

            <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-14">
              <div>
                <span className="inline-flex items-center gap-2 rounded-md bg-tag-bg/15 px-3 py-1.5 text-[13px] font-semibold text-tag-bg">
                  <ShieldCheck className="size-4" strokeWidth={2.4} aria-hidden />
                  What &ldquo;vetted&rdquo; means
                </span>
                <p className="mt-5 text-[15px] leading-[1.65] text-canvas/75">
                  Nothing on MDN STACKMART self-publishes. Before a listing appears, an admin reads
                  the seller&rsquo;s code, follows the README they wrote to reproduce what they
                  claimed, opens the demo, and sanity-checks the metrics and category. A claim we
                  cannot verify does not get published. That is the entire point of a curated
                  marketplace — the filtering happens before you ever see the listing.
                </p>
              </div>

              <div>
                <span className="inline-flex items-center gap-2 rounded-md bg-tag-bg/15 px-3 py-1.5 text-[13px] font-semibold text-tag-bg">
                  <KeyRound className="size-4" strokeWidth={2.4} aria-hidden />
                  What your license key is
                </span>
                <p className="mt-5 text-[15px] leading-[1.65] text-canvas/75">
                  It is issued the moment your payment is confirmed, emailed to you, and shown with
                  the order in Purchases. It proves your copy of the deliverable is a paid one and
                  ties that download to your account — which is why the ZIP is served privately to
                  you rather than from a public link that could be shared.
                </p>
                <div className="mono mt-6 inline-flex items-center gap-3 rounded-md border border-canvas/15 bg-canvas/7 px-4 py-2.5 text-[15px] tracking-[0.08em] text-tag-bg">
                  <span className="anim-pulse-dot size-1.5 rounded-full bg-tag-bg" aria-hidden />
                  XXXX-XXXX-XXXX-XXXX
                </div>
              </div>
            </div>
          </div>
        </div>
          </section>
        }
        sellers={
          <section id="for-sellers" className="mesh-stats scroll-mt-20 border-b border-border">
        <div className="container-page py-12 md:py-[clamp(64px,8vw,104px)]">
          <div className="max-w-[680px]">
            <div className="text-[13px] font-semibold tracking-[0.08em] text-accent uppercase">
              For sellers
            </div>
            <h2 className="mt-2.5 text-[1.5rem] font-bold tracking-[-0.025em] text-primary md:text-[clamp(1.9rem,3.2vw,2.7rem)]">
              Submit once. We handle the rest.
            </h2>
            <p className="mt-3 text-[15px] leading-[1.55] text-fg-muted md:mt-4 md:text-[17px] md:leading-[1.6]">
              You don&rsquo;t need an account to sell here. Submit through the form and our team
              takes it from review to listing to payout — everything after your submission happens
              by email.
            </p>
          </div>

          <StepGrid steps={SELLER_STEPS} />

          {/* Commission — one flat rate for everyone */}
          <div className="mt-8 overflow-hidden rounded-[14px] border border-border bg-canvas md:mt-14">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
              {/* The rate */}
              <div className="border-b border-border p-6 md:p-[clamp(28px,3.5vw,40px)] lg:border-r lg:border-b-0">
                <div className="text-[13px] font-semibold tracking-[0.08em] text-accent uppercase">
                  Commission
                </div>
                <h3 className="mt-2.5 text-[1.5rem] font-bold tracking-[-0.02em] text-primary">
                  One flat rate. That&rsquo;s the whole pricing page.
                </h3>

                <div className="mt-7 flex items-baseline gap-3">
                  <span className="mono text-[clamp(3rem,6vw,4rem)] leading-none font-bold tracking-[-0.03em] text-accent">
                    20%
                  </span>
                  <span className="text-[15px] text-fg-muted">commission per sale</span>
                </div>

                {/* 80 / 20 split */}
                <div
                  className="mt-8 flex h-2.5 overflow-hidden rounded-full bg-canvas-subtle"
                  aria-hidden
                >
                  <span className="h-full w-[80%] bg-primary" />
                  <span className="h-full w-[20%] bg-accent" />
                </div>
                <div className="mono mt-3 flex items-center justify-between text-[12.5px]">
                  <span className="flex items-center gap-2 text-primary">
                    <span className="size-2 rounded-full bg-primary" aria-hidden />
                    80% to you
                  </span>
                  <span className="flex items-center gap-2 text-accent">
                    <span className="size-2 rounded-full bg-accent" aria-hidden />
                    20% platform
                  </span>
                </div>
              </div>

              {/* What that includes */}
              <div className="bg-canvas-subtle p-6 md:p-[clamp(28px,3.5vw,40px)]">
                <ul className="flex flex-col gap-4">
                  {COMMISSION_POINTS.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-[15px] leading-[1.55] text-fg">
                      <span
                        className="mt-0.5 flex size-[18px] flex-none items-center justify-center rounded-full bg-tag-bg"
                        aria-hidden
                      >
                        <Check className="size-3 text-accent" strokeWidth={3} />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>

                <p className="mt-7 border-t border-border pt-6 text-[14px] leading-[1.6] text-fg-muted">
                  On a $10,000 sale: MDN STACKMART keeps{" "}
                  <span className="mono text-primary">$2,000</span> and transfers{" "}
                  <span className="mono text-primary">$8,000</span> to you, with proof of the
                  transfer emailed to you.
                </p>
              </div>
            </div>
          </div>
        </div>
          </section>
        }
        faq={
          <section
            id="faq"
            className="how-base relative scroll-mt-20 overflow-hidden border-b border-border"
          >
        {/* Decorative coding backdrop — reuses the landing's `.how-*` layers. */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="how-grid absolute inset-0" />
          <span className="how-glyph mono absolute -top-16 right-[2%] text-[16rem] leading-none font-bold select-none">
            {"?"}
          </span>
          <pre className="how-code mono absolute bottom-10 left-[2%] hidden text-[13px] leading-[1.9] whitespace-pre select-none xl:block">
            {FAQ_SNIPPET.join("\n")}
          </pre>
        </div>

        <div className="relative container-page py-12 md:py-[clamp(64px,8vw,104px)]">
          <div className="mx-auto mb-8 max-w-[660px] text-center md:mb-12">
            <div className="text-[13px] font-semibold tracking-[0.08em] text-accent uppercase">
              FAQ
            </div>
            <h2 className="mt-2.5 text-[1.5rem] font-bold tracking-[-0.025em] text-primary md:text-[clamp(1.9rem,3.2vw,2.7rem)]">
              Questions, answered straight
            </h2>
            <p className="mt-3 text-[15px] leading-[1.55] text-fg-muted md:mt-4 md:text-[17px] md:leading-[1.6]">
              The things buyers and sellers actually ask us before they commit.
            </p>
          </div>

          <GuidelinesFaq />
        </div>
          </section>
        }
      />

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <section className="mesh-sell relative overflow-hidden">
        <div className="grid-motif-sell absolute inset-0" aria-hidden />

        <div className="relative container-page py-[clamp(64px,8vw,110px)] text-center">
          <h2 className="mx-auto max-w-[680px] text-[clamp(2rem,3.8vw,3rem)] leading-[1.1] font-bold tracking-[-0.03em] text-canvas">
            Ready to <span className="text-tag-bg">buy or sell?</span>
          </h2>
          <p className="mx-auto mt-5 max-w-[560px] text-[17px] leading-[1.6] text-canvas/75">
            Browse what our team has already vetted, or put your own micro-SaaS in front of buyers
            who are here to acquire.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3.5">
            <Link
              href="/marketplace"
              className="shadow-cta-light rounded-md border border-canvas bg-canvas px-[30px] py-4 text-base font-semibold text-primary-emphasis transition-[background-color,box-shadow] duration-200 hover:bg-tag-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tag-bg"
            >
              Browse listings
            </Link>
            <Link
              href="/sell"
              className="rounded-md border border-canvas/35 bg-transparent px-[30px] py-4 text-base font-semibold text-canvas transition-[border-color,background-color] duration-200 hover:border-canvas hover:bg-canvas/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tag-bg"
            >
              List your SaaS
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
