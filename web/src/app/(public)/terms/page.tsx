import type { Metadata } from "next";
import Link from "next/link";

import {
  LEGAL_CONTACT_EMAIL,
  LEGAL_JURISDICTION_NOTE,
  LegalCallout,
  LegalList,
  LegalShell,
  type LegalSectionContent,
} from "@/components/legal/LegalShell";
import { DEFAULT_OG_IMAGE } from "@/components/seo/JsonLd";

const TERMS_DESCRIPTION =
  "The terms of using MDN STACKMART — how buying works (one product per order, license key plus the full source-code ZIP on payment), what the license covers, why sales are final after delivery, how sellers submit and get reviewed, and the flat 20% commission.";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: TERMS_DESCRIPTION,
  alternates: { canonical: "/terms" },
  openGraph: {
    type: "website",
    url: "/terms",
    title: "Terms & Conditions — MDN STACKMART",
    description: TERMS_DESCRIPTION,
    siteName: "MDN STACKMART",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms & Conditions — MDN STACKMART",
    description: TERMS_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

/** Shown in the header chip. Bump this whenever the document below actually changes. */
const LAST_UPDATED = "14 July 2026";

/**
 * `/terms` — Terms & Conditions.
 *
 * A Server Component with static content and static metadata, so the whole page prerenders. The
 * copy describes how the platform ACTUALLY works (admin-curated listings, one product per order,
 * license key + source ZIP on confirmed payment, no refunds after delivery, flat 20% commission,
 * sellers submit without an account) — it is not boilerplate. The layout comes from `<LegalShell>`,
 * shared with /privacy.
 *
 * NOTE: the payment gateway is a pending business decision (CLAUDE.md), so this document refers to
 * "our payment provider" and never names one.
 */
const SECTIONS: LegalSectionContent[] = [
  {
    id: "what-this-is",
    title: "What MDN STACKMART is",
    body: (
      <>
        <p>
          MDN STACKMART is a <strong>curated marketplace</strong> for ready-made micro-SaaS
          products, web apps, and codebases. Sellers submit their projects to us; our team reviews
          each one; and only the projects we approve are published as listings. Nothing
          self-publishes, and no listing appears because someone paid to put it there.
        </p>
        <p>
          These terms apply to everyone who uses the site — whether you are buying a product,
          submitting one, or just browsing. By using MDN STACKMART you agree to them. If you do not
          agree, please do not use the site.
        </p>
        <p>
          We are the marketplace, not the author of the products we list. We vet what we publish and
          we stand behind delivering exactly what a listing describes, but the code itself was
          written by the seller.
        </p>
      </>
    ),
  },
  {
    id: "your-account",
    title: "Your account",
    body: (
      <>
        <p>
          You need an account to buy. Give us accurate details, keep your password to yourself, and
          tell us if you think someone else has got into your account. Anything done from your
          account is treated as done by you.
        </p>
        <p>
          Sellers do <strong>not</strong> need an account. Projects are submitted through the{" "}
          <Link href="/sell">seller form</Link>, and everything after that — questions, the review
          outcome, payout — happens by email.
        </p>
      </>
    ),
  },
  {
    id: "buying",
    title: "Buying a product",
    body: (
      <>
        <p>
          There is no cart. Each order is for <strong>one product</strong>: you press Buy Now on a
          listing, you pay the price shown on that listing, and that is the order. Prices are shown
          before you pay and are what you are charged; any taxes or fees your payment method applies
          are between you and that provider.
        </p>
        <p>
          Payment is handled by our payment provider — we never see or store your full card details.
          The moment your payment is confirmed, two things happen immediately and automatically:
        </p>
        <LegalList
          items={[
            <>
              a <strong>license key</strong> is issued to your account and emailed to you, and
            </>,
            <>
              the <strong>full source-code ZIP</strong> for that product becomes available to
              download from your Purchases.
            </>,
          ]}
        />
        <p>
          An order that has not been confirmed as paid delivers nothing. An order that has been
          confirmed as paid delivers everything, at once.
        </p>
      </>
    ),
  },
  {
    id: "what-you-get",
    title: "What you get: the license",
    body: (
      <>
        <p>
          When you buy, you acquire a <strong>licensed copy of that product&rsquo;s source code</strong>{" "}
          — yours to own, run, modify, deploy, and commercialise, for as long as you like. You do not
          need our permission to change it, rebrand it, or sell what you build with it.
        </p>
        <p>
          The listing is the definition of what transfers. It states the scope: the source code, plus
          any assets, domains, or accounts the seller has explicitly included. <strong>
            Anything not stated on the listing does not transfer.
          </strong>{" "}
          If a listing does not mention a domain, a customer list, a hosting account, or a trademark,
          those are not part of the sale — read the listing before you buy, and ask us if anything is
          unclear.
        </p>
        <p>
          What you may not do is resell or redistribute the product as a competing copy of the
          listing itself — that is, you cannot take the ZIP you received and sell the same package on
          as-is. Build on it, run it, charge for it: yes. Repackage and resell the deliverable
          verbatim: no.
        </p>
      </>
    ),
  },
  {
    id: "license-key",
    title: "Your license key",
    body: (
      <>
        <p>
          Your license key is the proof that your copy is a paid, legitimate one. It is issued when
          payment is confirmed, emailed to you, and shown with the order in your Purchases.
        </p>
        <p>
          The key is <strong>personal to your account and required for every download</strong>.
          Downloads are gated on all of it: you must be signed in, the order must be yours, the order
          must be paid, and the key must match. There is no public download link, ever — the ZIP is
          served to you at request time.
        </p>
        <LegalCallout title="Do not share your key">
          Sharing, publishing, or reselling your license key is a breach of these terms. A key that
          is being used to hand the deliverable to people who did not buy it can be revoked, and the
          account it belongs to suspended.
        </LegalCallout>
      </>
    ),
  },
  {
    id: "refunds",
    title: "Refunds: sales are final after delivery",
    body: (
      <>
        <p>
          Because the entire source code is delivered in full the instant your payment is confirmed,{" "}
          <strong>sales are final</strong>. There is no cooling-off window after delivery, for a
          simple reason: code cannot be un-received. Once you have the ZIP, you have the product.
        </p>
        <p>
          Please treat the demo, the repository link, the metrics, and the listing description as
          your due diligence — they are there so that you can decide <em>before</em> you pay. If
          anything is unclear, ask us first.
        </p>
        <LegalCallout title="The one exception: delivery failure">
          If we did not actually deliver what the listing published, that is on us. That means: the
          download does not work, the ZIP is broken or does not match the listing, or the product is
          materially not what was published. Contact us at{" "}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a> with your order and
          what went wrong. We will investigate and make it right — a working delivery, a corrected
          deliverable, or a refund where that is the fair outcome. &ldquo;I changed my mind&rdquo; is
          not delivery failure; &ldquo;the ZIP is empty&rdquo; is.
        </LegalCallout>
      </>
    ),
  },
  {
    id: "selling",
    title: "Selling on MDN STACKMART",
    body: (
      <>
        <p>
          Anyone can submit a project through the <Link href="/sell">seller form</Link>. No account,
          no listing fee, no charge for being reviewed. To submit, you supply:
        </p>
        <LegalList
          items={[
            "the deliverable ZIP — the full source code a buyer would receive",
            "product images for the listing",
            "a verification README that tells our reviewer how to reproduce what you are claiming",
            "your tech stack, business metrics, category, and the product description",
            "your payout details, so we can pay you if it sells",
          ]}
        />
        <p>
          Submitting does not create a listing. It creates a submission that a human on our team then
          reviews.
        </p>
      </>
    ),
  },
  {
    id: "seller-promises",
    title: "What sellers promise us",
    body: (
      <>
        <p>By submitting a project, you warrant that:</p>
        <LegalList
          items={[
            <>
              <strong>You own it, or have the right to sell it.</strong> The code is yours to
              transfer — it is not someone else&rsquo;s work, not your employer&rsquo;s, and not
              licensed to you under terms that forbid this. Any third-party code inside it is
              licensed in a way that permits the sale, and you have said so.
            </>,
            <>
              <strong>Your metrics are true and verifiable.</strong> Revenue, users, traffic, growth
              — whatever you claim, you can show us the evidence for it, and your README explains how
              we can check.
            </>,
            <>
              <strong>It is not being sold elsewhere while it is listed with us.</strong> If it sells
              somewhere else, or you take it off the market, <strong>tell us immediately</strong> so
              we can pull the listing before a buyer pays for something you can no longer deliver.
            </>,
            <>
              <strong>It is safe.</strong> No malware, no backdoors, no data-harvesting, no hidden
              phone-home.
            </>,
          ]}
        />
        <p>
          If a listing turns out to breach any of these, we will remove it. If a buyer has already
          paid, we will make the buyer whole and recover the amount from you.
        </p>
      </>
    ),
  },
  {
    id: "review",
    title: "How review works, and what can come of it",
    body: (
      <>
        <p>
          An admin reads your code, follows your README to reproduce what you claimed, opens the
          demo, and sanity-checks your metrics and category. There are three outcomes:
        </p>
        <LegalList
          items={[
            <>
              <strong>Approved</strong> — we publish the listing. We may edit the copy, images, or
              category for clarity and house style; we will not change your price or your claims
              without asking you.
            </>,
            <>
              <strong>Questions</strong> — we come back to you for evidence or a fix, and the
              submission stays open.
            </>,
            <>
              <strong>Declined</strong> — we are not publishing it as submitted, and we will tell you
              why.
            </>,
          ]}
        />
        <p>
          A decline is not permanent. Fix what we flagged and submit again. We can also unpublish a
          live listing at any time if something we relied on turns out not to hold.
        </p>
      </>
    ),
  },
  {
    id: "commission",
    title: "Commission and payouts",
    body: (
      <>
        <p>
          We take a <strong>flat 20% commission</strong> on the sale price. That is the same rate for
          every seller and every product.
        </p>
        <LegalList
          items={[
            "There are no plans and no premium tier. There is nothing to upgrade to, and no way to pay for better placement.",
            "There is no listing fee and no review fee — whether we approve you or not.",
            "The commission is the only cut we take, and it is only taken when your product actually sells.",
          ]}
        />
        <p>
          You receive the remaining <strong>80%</strong> of the sale price. After the sale clears we
          transfer it to the payout details you gave us at submission, and email you proof of the
          transfer for your records. Keeping those payout details correct is your responsibility; we
          cannot recover money sent to details you gave us wrongly.
        </p>
        <p>
          On a $10,000 sale: we keep $2,000 and transfer $8,000 to you.
        </p>
      </>
    ),
  },
  {
    id: "prohibited",
    title: "What you must not do",
    body: (
      <>
        <p>On either side of the marketplace, the following will get you removed:</p>
        <LegalList
          items={[
            "Submitting malware, backdoors, credential harvesters, or anything designed to harm the people who run it.",
            "Selling code you do not have the right to sell, or code that infringes someone else's copyright, trademark, or licence.",
            "Misrepresenting metrics, revenue, users, or the state of a product — including quietly leaving out that it is broken or already sold.",
            "Sharing, publishing, or reselling a license key, or trying to download a product you did not buy.",
            "Attacking, scraping, overloading, or attempting to bypass the access controls on this site — including the download gating.",
            "Impersonating another person or business, or using the marketplace to launder or defraud.",
          ]}
        />
      </>
    ),
  },
  {
    id: "the-site-itself",
    title: "The site itself",
    body: (
      <>
        <p>
          The MDN STACKMART name, brand, design, and the code that runs this marketplace belong to
          us. Buying a product on the marketplace gives you rights over <em>that product</em> — it
          gives you no rights over the marketplace.
        </p>
        <p>
          We do our best to keep the site up, the listings honest, and the downloads working, but we
          do not promise the site will never be unavailable. Where something goes wrong on our side,
          the remedy is the one described in <a href="#refunds">Refunds</a>: we fix the delivery, or
          we make it right.
        </p>
      </>
    ),
  },
  {
    id: "suspension",
    title: "Suspension and termination",
    body: (
      <>
        <p>
          We can suspend or close an account, revoke a license key, unpublish a listing, or refuse a
          submission if these terms are being broken, if we are being defrauded, or if we are
          required to. Where we reasonably can, we will tell you why and give you the chance to put
          it right.
        </p>
        <p>
          If your account is closed, products you legitimately bought stay bought — the license you
          paid for does not evaporate — but access to the site and to further downloads may not
          survive it.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: (
      <>
        <p>
          The marketplace will change, and so will this document. When it does, we update the
          &ldquo;last updated&rdquo; date at the top of this page. If a change materially affects
          people who have already bought or already submitted, we will say so plainly rather than
          slip it in.
        </p>
        <p>
          Changes are not retroactive: an order you have already completed is governed by the terms
          that were in force when you completed it.
        </p>
      </>
    ),
  },
  {
    id: "governing-law",
    title: "Governing law and contact",
    body: (
      <>
        <LegalCallout title="Placeholder — to be confirmed">
          {LEGAL_JURISDICTION_NOTE}
        </LegalCallout>
        <p>
          For anything in this document — a delivery problem, a submission, a licence question, or a
          complaint — write to{" "}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>. How the platform works
          in practice is set out on the <Link href="/guidelines">guidelines page</Link>, and how we
          handle your data is set out in the <Link href="/privacy">privacy policy</Link>.
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalShell
      eyebrow="Legal"
      command="mdn legal --terms"
      title="Terms &"
      titleAccent="conditions."
      lead="The rules of the marketplace, in plain English: what you get when you buy, what you promise when you sell, and what we do in between. No padding, no small print you are meant to miss."
      updated={LAST_UPDATED}
      sections={SECTIONS}
      sibling={{
        href: "/privacy",
        label: "Privacy policy",
        description:
          "What we collect, why we collect it, how payout details and uploaded files are protected, and the rights you have over your data.",
      }}
    />
  );
}
