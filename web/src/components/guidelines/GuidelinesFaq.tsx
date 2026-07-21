"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SHOW_SELL } from "@/lib/config";

/**
 * The Guidelines FAQ — the shadcn `Accordion` (Base UI) used AS-IS, exactly like the listing-page
 * `FaqAccordion` (rule 22: no new components when shadcn already has one, no new packages).
 *
 * Grouped into a buyer set and a seller set so a reader can scan to their half. The accordion is
 * keyboard-accessible and ARIA-correct out of the box (Base UI renders the header/trigger/panel
 * with the right roles + `aria-expanded`), so nothing extra is wired here.
 *
 * Copy is written against how the platform ACTUALLY works (CLAUDE.md): admin-curated listings, one
 * product per order (no cart), ZIP + license key on confirmed payment, sellers submit via /sell with
 * no account. No payment gateway is named anywhere — that is a pending business decision and naming
 * one outside `app/Payments/` is a rule violation.
 *
 * BUYER-ONLY MODE (SHOW_SELL=false): the seller set is dropped entirely, and the buyer answers that
 * refer to "the seller" fall back to `aBuyerOnly` — same facts, worded without the other side.
 */
type Faq = { q: string; a: string; aBuyerOnly?: string };

const answerOf = (entry: Faq) => (!SHOW_SELL && entry.aBuyerOnly ? entry.aBuyerOnly : entry.a);

const BUYER_FAQ: Faq[] = [
  {
    q: "Is every listing really vetted?",
    a: "Yes. MDN STACKMART is admin-curated — nothing self-publishes. Our team reviews each submission against the code, the README the seller provides, the live demo, and the stated metrics before a listing goes live. If we cannot verify a claim, it does not get published.",
    aBuyerOnly:
      "Yes. MDN STACKMART is admin-curated — nothing self-publishes. Our team reviews every product against the code, the accompanying README, the live demo, and the stated metrics before a listing goes live. If we cannot verify a claim, it does not get published.",
  },
  {
    q: "What exactly do I receive when I buy?",
    a: "Two things, immediately on confirmed payment: a license key and the deliverable ZIP containing the product's source code and whatever the seller packaged with it (setup instructions, assets, configuration). Both are emailed to you and both stay available from your Purchases page.",
    aBuyerOnly:
      "Two things, immediately on confirmed payment: a license key and the deliverable ZIP containing the product's source code and everything packaged with it (setup instructions, assets, configuration). Both are emailed to you and both stay available from your Purchases page.",
  },
  {
    q: "How do I download my purchase?",
    a: "Open your account and go to Purchases. Every paid order there has a secure download for its ZIP. The link is tied to your account — it is generated for you at download time rather than being a public URL, so it cannot be shared or hotlinked.",
  },
  {
    q: "Can I buy more than one product at a time?",
    a: "No, and that is deliberate. There is no cart on MDN STACKMART — one product, one order. Buying a software business is a considered decision, so each purchase gets its own checkout and its own license key. To buy two products, simply complete two orders.",
  },
  {
    q: "What does the license key actually mean?",
    a: "It is the proof that your copy of the deliverable is a legitimate, paid one, and it is what ties that download to your account and order. Keep it — it identifies your purchase if you ever contact us about the product.",
  },
  {
    q: "What rights do I get over the code?",
    a: "You acquire the product to own, run, modify, and grow as your own. The listing page states the scope of what transfers with each sale — source code, and any assets or accounts the seller has explicitly included. Anything not listed does not transfer, so read the listing before you buy.",
    aBuyerOnly:
      "You acquire the product to own, run, modify, and grow as your own. The listing page states the scope of what transfers with each purchase — source code, and any assets or accounts explicitly included with it. Anything not listed does not transfer, so read the listing before you buy.",
  },
  {
    q: "Do you offer refunds?",
    a: "Because the deliverable is source code and it is delivered digitally and in full the moment payment is confirmed, sales are final by default — once you have the code, it cannot be un-received. The exception is genuine failure of delivery: if a download is broken, the ZIP does not match the listing, or the product is materially not what was published, contact us and we will investigate and make it right.",
  },
  {
    q: "How can I evaluate a product before I commit?",
    a: "Every listing shows the metrics and tech stack the seller supplied and that we reviewed, and links out to a live demo and the repository where the seller has provided them. Open both. They are plain external links to the seller's own hosting — we neither embed the demo nor pull anything from a Git provider.",
    aBuyerOnly:
      "Every listing shows the metrics and tech stack our team reviewed, and links out to a live demo and the repository wherever those exist. Open both. They are plain external links to the product's own hosting — we neither embed the demo nor pull anything from a Git provider.",
  },
];

const SELLER_FAQ: Faq[] = [
  {
    q: "Do I need an account to sell?",
    a: "No. Sellers do not have accounts on MDN STACKMART. You submit your project through the form at /sell and everything after that happens by email — our team reviews the submission, tells you the outcome, and follows up through to payout.",
  },
  {
    q: "What do I need to submit?",
    a: "The deliverable code ZIP, images of the product, and a README that explains how we can verify what you are claiming (how to run it, how to reach the metrics, what to look at). Alongside that: your tech stack, your business metrics, a category, a description, and your payout details. The more verifiable your README makes your claims, the faster review goes.",
  },
  {
    q: "What commission does MDN STACKMART take?",
    a: "A flat 20% of the sale price — the same rate for every seller. There are no plans, no tiers, and no premium upgrade to buy: everyone gets the same vetting, the same listing, and the same 20%. On a $10,000 sale we keep $2,000 and you receive $8,000.",
  },
  {
    q: "How and when do I get paid?",
    a: "You give us your payout details as part of your submission. After your product sells and the payment clears, MDN STACKMART takes its flat 20% commission and transfers the remaining 80% to those details, then emails you proof of the transfer for your records.",
  },
  {
    q: "Are there any other fees?",
    a: "No. The 20% commission on a completed sale is the only cut we take. There is no listing fee and no charge for being reviewed — whether we approve your submission or not, submitting costs you nothing.",
  },
  {
    q: "What happens during review?",
    a: "An admin works through your submission: reading the code, following your README to verify your claims, checking the demo, and sanity-checking the metrics and the category. We approve, come back to you with questions, or decline. Approved submissions are published as listings by our team — approval and publishing are one curated step, not an automatic one.",
  },
  {
    q: "Why was my submission rejected?",
    a: "Almost always because we could not verify it. Unreproducible metrics, a README that does not let us actually run or check the product, code that does not match what is described, or a product that simply is not a fit for the categories we curate. You are welcome to fix the gap and resubmit — a rejection is not permanent.",
  },
  {
    q: "Can I list the same product somewhere else at the same time?",
    a: "You can, but tell us. If a product sells elsewhere while it is live here, contact us immediately so we can pull the listing — a buyer completing a purchase on MDN STACKMART for a product that is no longer available is the one outcome we will not accept.",
  },
  {
    q: "What happens to my listing after it sells?",
    a: "It comes down. Each listing is a single product sold once to a single buyer — there is no cart and no re-sale of the same listing. Once the order is paid and the buyer has been delivered the ZIP and license key, we settle your payout and the listing is closed out.",
  },
];

function FaqGroup({ id, title, items }: { id: string; title?: string; items: Faq[] }) {
  return (
    <div>
      {/* No group label in buyer-only mode — there is only one set, so "For buyers" is noise. */}
      {title ? (
        <h3 className="mono mb-3 text-[12px] font-semibold tracking-[0.1em] text-accent uppercase">
          {title}
        </h3>
      ) : null}
      <Accordion className="rounded-[10px] border border-border bg-canvas px-5">
        {items.map((entry, index) => (
          <AccordionItem key={entry.q} value={`${id}-${index}`}>
            <AccordionTrigger className="py-4 text-[15px] font-semibold text-primary hover:no-underline">
              {entry.q}
            </AccordionTrigger>
            <AccordionContent>
              <p className="pr-6 pb-1 text-[15px] leading-[1.6] text-fg-muted">
                {answerOf(entry)}
              </p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export function GuidelinesFaq() {
  // Buyer-only mode: one set, one column, centred on the same measure the rest of the band uses.
  if (!SHOW_SELL) {
    return (
      <div className="mx-auto max-w-[760px]">
        <FaqGroup id="buyers" items={BUYER_FAQ} />
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:gap-8 lg:grid-cols-2 lg:gap-7">
      <FaqGroup id="buyers" title="For buyers" items={BUYER_FAQ} />
      <FaqGroup id="sellers" title="For sellers" items={SELLER_FAQ} />
    </div>
  );
}
