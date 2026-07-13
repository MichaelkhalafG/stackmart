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
  Sparkles,
  TrendingUp,
  Upload,
} from "lucide-react";

import { GuidelinesFaq } from "@/components/guidelines/GuidelinesFaq";
import { DEFAULT_OG_IMAGE } from "@/components/seo/JsonLd";

const GUIDELINES_DESCRIPTION =
  "How MDN STACKMART works — how buyers browse vetted listings, buy securely, and receive a license key plus the deliverable ZIP, and how sellers submit, choose a plan, get reviewed, and get paid. Plus a full buyer and seller FAQ.";

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
    body: "Through the form at /sell — no account needed. Attach your code ZIP and product images, and include a README that explains how we can verify your claims, plus your tech stack, metrics, category, and description.",
  },
  {
    icon: Sparkles,
    step: "02",
    title: "Choose your plan",
    body: "Basic or Premium. The difference is commission versus reach — Premium costs 10 points more and puts your listing in the home Featured section with a Recommended mark.",
  },
  {
    icon: Banknote,
    step: "03",
    title: "Give us your payout details",
    body: "How you want to be paid, supplied with your submission. This is where your money lands once the product sells.",
  },
  {
    icon: BadgeCheck,
    step: "04",
    title: "We review & approve",
    body: "An admin reads the code, follows your README to verify what you claimed, checks the demo, and sanity-checks the metrics. We approve, come back with questions, or decline.",
  },
  {
    icon: FileArchive,
    step: "05",
    title: "You go live",
    body: "Approved projects are published as listings by our team. There is no listing fee — the commission on a sale is the only cut we take.",
  },
  {
    icon: ShieldCheck,
    step: "06",
    title: "You get paid",
    body: "After the sale clears, we transfer your payout — the sale price minus your plan's commission — to your payout details, and email you proof of the transfer.",
  },
];

const PLANS = [
  {
    name: "Basic",
    rate: "20%",
    rateNote: "commission per sale",
    take: "You keep 80%",
    featured: false,
    perks: [
      "Listed in the marketplace",
      "Full admin vetting & verification",
      "No listing fee, no review fee",
      "Payout on sale + proof of transfer",
    ],
  },
  {
    name: "Premium",
    rate: "30%",
    rateNote: "commission per sale",
    take: "You keep 70%",
    featured: true,
    perks: [
      "Everything in Basic",
      "Shown in the home page Featured section",
      "Marked as Recommended on your listing",
      "Priority placement in front of every visitor",
    ],
  },
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

function StepCard({
  icon: Icon,
  step,
  title,
  body,
}: {
  icon: typeof Search;
  step: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[10px] border border-border bg-canvas p-[26px]">
      <div className="flex items-center justify-between">
        <div className="flex size-[46px] items-center justify-center rounded-lg bg-tag-bg">
          <Icon className="size-[21px] text-accent" strokeWidth={2} aria-hidden />
        </div>
        <span className="mono text-[22px] font-semibold text-accent">{step}</span>
      </div>
      <h3 className="mt-5 text-[1.18rem] font-semibold text-primary">{title}</h3>
      <p className="mt-2 text-[15px] leading-[1.55] text-fg-muted">{body}</p>
    </div>
  );
}

export default function GuidelinesPage() {
  return (
    <>
      {/* ── Intro ─────────────────────────────────────────────────────────────── */}
      <section className="mesh-hero relative overflow-hidden border-b border-border">
        <div className="container-page py-[clamp(56px,7vw,96px)]">
          <div className="max-w-[760px]">
            <p className="mono text-[12px] font-semibold tracking-[0.12em] text-accent uppercase">
              Guidelines
            </p>

            <h1 className="mt-3.5 text-[clamp(2.2rem,4.4vw,3.4rem)] leading-[1.06] font-bold tracking-[-0.03em] text-primary">
              How MDN STACKMART{" "}
              <span className="text-gradient-accent">actually works.</span>
            </h1>

            <p className="mt-6 max-w-[640px] text-[clamp(1.05rem,1.5vw,1.2rem)] leading-[1.6] text-fg-muted">
              MDN STACKMART is a curated marketplace for buying and selling profitable micro-SaaS —
              ready-made products, web apps, and codebases. Every listing is vetted by our team
              before it goes live, and every sale delivers the real thing: the full source code plus
              a license key. This page is the whole process, end to end, for both sides of it.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="#for-buyers"
                className="shadow-cta-hover rounded-md border border-primary bg-primary px-[22px] py-3 text-[15px] font-semibold text-primary-foreground transition-[background-color,box-shadow] duration-200 hover:bg-primary-emphasis focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                For buyers
              </Link>
              <Link
                href="#for-sellers"
                className="rounded-md border border-border bg-canvas px-[22px] py-3 text-[15px] font-semibold text-primary transition-colors duration-200 hover:border-primary hover:bg-canvas-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                For sellers
              </Link>
              <Link
                href="#faq"
                className="rounded-md border border-border bg-canvas px-[22px] py-3 text-[15px] font-semibold text-primary transition-colors duration-200 hover:border-primary hover:bg-canvas-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Read the FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── For buyers ────────────────────────────────────────────────────────── */}
      <section id="for-buyers" className="scroll-mt-20 border-b border-border bg-canvas">
        <div className="container-page py-[clamp(64px,8vw,104px)]">
          <div className="max-w-[660px]">
            <div className="text-[13px] font-semibold tracking-[0.08em] text-accent uppercase">
              For buyers
            </div>
            <h2 className="mt-2.5 text-[clamp(1.9rem,3.2vw,2.7rem)] font-bold tracking-[-0.025em] text-primary">
              Buy a business, not a bundle of files
            </h2>
            <p className="mt-4 text-[17px] leading-[1.6] text-fg-muted">
              Five steps from browsing to owning. No cart, no negotiation, no waiting on a handover
              that never comes — payment confirmed means delivered.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-[repeat(auto-fit,minmax(258px,1fr))] gap-5">
            {BUYER_STEPS.map((step) => (
              <StepCard key={step.step} {...step} />
            ))}
          </div>

          {/* License & verification explainer */}
          <div className="panel-navy relative mt-8 overflow-hidden rounded-[14px] p-[clamp(28px,4vw,44px)]">
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

      {/* ── For sellers ───────────────────────────────────────────────────────── */}
      <section id="for-sellers" className="mesh-stats scroll-mt-20 border-b border-border">
        <div className="container-page py-[clamp(64px,8vw,104px)]">
          <div className="max-w-[680px]">
            <div className="text-[13px] font-semibold tracking-[0.08em] text-accent uppercase">
              For sellers
            </div>
            <h2 className="mt-2.5 text-[clamp(1.9rem,3.2vw,2.7rem)] font-bold tracking-[-0.025em] text-primary">
              Submit once. We handle the rest.
            </h2>
            <p className="mt-4 text-[17px] leading-[1.6] text-fg-muted">
              You don&rsquo;t need an account to sell here. Submit through the form, pick a plan, and
              our team takes it from review to listing to payout — everything after your submission
              happens by email.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-[repeat(auto-fit,minmax(258px,1fr))] gap-5">
            {SELLER_STEPS.map((step) => (
              <StepCard key={step.step} {...step} />
            ))}
          </div>

          {/* Plans */}
          <div className="mt-14">
            <h3 className="text-[1.5rem] font-bold tracking-[-0.02em] text-primary">
              Choose your plan
            </h3>
            <p className="mt-2 max-w-[62ch] text-[15px] leading-[1.6] text-fg-muted">
              Both plans get the same vetting and the same payout mechanics. The only trade is
              commission against visibility.
            </p>

            <div className="mt-7 grid gap-5 lg:grid-cols-2">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={
                    plan.featured
                      ? "shadow-float-md relative overflow-hidden rounded-[14px] border-2 border-primary bg-canvas p-[clamp(26px,3vw,34px)]"
                      : "relative overflow-hidden rounded-[14px] border border-border bg-canvas p-[clamp(26px,3vw,34px)]"
                  }
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[1.35rem] font-bold text-primary">{plan.name}</span>
                    {plan.featured ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1 text-[11px] font-bold text-accent-foreground uppercase">
                        <Sparkles className="size-3" strokeWidth={2.6} aria-hidden />
                        Featured + Recommended
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-6 flex items-baseline gap-2.5">
                    <span className="mono text-[clamp(2.6rem,5vw,3.4rem)] leading-none font-bold tracking-[-0.03em] text-accent">
                      {plan.rate}
                    </span>
                    <span className="text-[15px] text-fg-muted">{plan.rateNote}</span>
                  </div>
                  <p className="mono mt-3 text-[14px] font-semibold text-primary">{plan.take}</p>

                  <ul className="mt-7 flex flex-col gap-3 border-t border-border pt-6">
                    {plan.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2.5 text-[15px] text-fg">
                        <Check
                          className="mt-0.5 size-[17px] flex-none text-accent"
                          strokeWidth={2.8}
                          aria-hidden
                        />
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <p className="mt-6 text-[14px] leading-[1.6] text-fg-muted">
              After a sale, MDN STACKMART transfers your payout — the sale price minus your
              plan&rsquo;s commission — to the payout details you supplied, and emails you proof of
              the transfer.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────────── */}
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

        <div className="relative container-page py-[clamp(64px,8vw,104px)]">
          <div className="mx-auto mb-12 max-w-[660px] text-center">
            <div className="text-[13px] font-semibold tracking-[0.08em] text-accent uppercase">
              FAQ
            </div>
            <h2 className="mt-2.5 text-[clamp(1.9rem,3.2vw,2.7rem)] font-bold tracking-[-0.025em] text-primary">
              Questions, answered straight
            </h2>
            <p className="mt-4 text-[17px] leading-[1.6] text-fg-muted">
              The things buyers and sellers actually ask us before they commit.
            </p>
          </div>

          <GuidelinesFaq />
        </div>
      </section>

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
