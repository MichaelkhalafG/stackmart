import type { Metadata } from "next";
import Link from "next/link";

import { SHOW_SELL } from "@/lib/config";
import {
  LEGAL_CONTACT_EMAIL,
  LegalCallout,
  LegalList,
  LegalShell,
  type LegalSectionContent,
} from "@/components/legal/LegalShell";
import { DEFAULT_OG_IMAGE } from "@/components/seo/JsonLd";

const PRIVACY_DESCRIPTION = SHOW_SELL
  ? "How MDN STACKMART handles your data — what we collect from buyers and sellers, why, how payout details and uploaded files are protected, the emails we send, and your rights over any of it. We do not sell personal data."
  : "How MDN STACKMART handles your data — what we collect when you buy, why, how your account and order records are protected, the emails we send, and your rights over any of it. We do not sell personal data.";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: PRIVACY_DESCRIPTION,
  alternates: { canonical: "/privacy" },
  openGraph: {
    type: "website",
    url: "/privacy",
    title: "Privacy Policy — MDN STACKMART",
    description: PRIVACY_DESCRIPTION,
    siteName: "MDN STACKMART",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy — MDN STACKMART",
    description: PRIVACY_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

/** Shown in the header chip. Bump this whenever the document below actually changes. */
const LAST_UPDATED = "14 July 2026";

/**
 * `/privacy` — Privacy Policy.
 *
 * A Server Component with static content and static metadata, so the whole page prerenders. The
 * copy describes what the system ACTUALLY stores and how (hashed passwords, orders with license
 * keys and download counts, seller submissions with payout details that are admin-only and
 * encrypted at rest, deliverable ZIP + verification README on a private disk, product images public
 * by design, an auth token in the browser to keep you signed in) — it is not boilerplate. Layout is
 * shared with /terms via `<LegalShell>`.
 *
 * BUYER-ONLY MODE (SHOW_SELL=false): the two submission-side sections (payout details, uploaded
 * files) drop out of the array — and so out of the table of contents, which renumbers itself — and
 * the mixed sections render a buyer-only variant. The "we do not sell your data" section stays: it
 * is about data brokerage, not about the marketplace's selling side. Nothing is deleted.
 *
 * NOTE: the payment gateway is a pending business decision (CLAUDE.md), so this document refers to
 * "our payment provider" and never names one.
 */
const SECTIONS: LegalSectionContent[] = [
  {
    id: "scope",
    title: "What this policy covers",
    body: (
      <>
        {SHOW_SELL ? (
          <p>
            This explains what MDN STACKMART does with personal data — yours as a buyer, and yours as
            a seller. It covers the whole site: browsing, buying, downloading, and submitting a
            project through the <Link href="/sell">seller form</Link>.
          </p>
        ) : (
          <p>
            This explains what MDN STACKMART does with your personal data. It covers the whole site:
            browsing, buying, and downloading what you bought.
          </p>
        )}
        <p>
          The short version: we collect what we need to{" "}
          {SHOW_SELL
            ? "deliver purchases, verify listings, pay sellers, and support both sides"
            : "deliver your purchases, verify listings, and support you"}
          . We do not collect data to profile you, and{" "}
          <strong>we do not sell personal data to anyone</strong>.
        </p>
      </>
    ),
  },
  {
    id: "what-we-collect",
    title: "What we collect",
    body: (
      <>
        <p>
          <strong>Account data{SHOW_SELL ? " (buyers)" : ""}.</strong> Your name, your email address,
          and a password. The
          password is <strong>hashed</strong> — it is never stored in plain text, and nobody at MDN
          STACKMART can read it. If you forget it, we can only help you set a new one.
        </p>
        <p>
          <strong>Order data.</strong> Which product you bought, what you paid, when, the status of
          the payment, the license key issued to you, and how many times the deliverable has been
          downloaded. The download count exists so that we (and you) can see when a key is being used
          in a way that does not look like you.
        </p>
        <p>
          <strong>Payment data.</strong> Your card details go to our payment provider, not to us. We
          store the outcome — paid or not, the amount, and a reference — never your card number.
        </p>
        {SHOW_SELL ? (
          <p>
            <strong>Seller submissions.</strong> Your contact details, everything you tell us about
            the project (description, category, tech stack, metrics, demo and repository links), the
            files you upload, and <strong>your payout details</strong>.
          </p>
        ) : null}
      </>
    ),
  },
  // ── Submission-side sections. Present only when the marketplace accepts submissions
  //    (SHOW_SELL); in buyer-only mode they drop out and the document renumbers itself. ──
  ...(!SHOW_SELL ? [] : [
  {
    id: "payout-details",
    title: "Payout details are treated as sensitive",
    body: (
      <>
        <p>
          Payout details are the most sensitive thing a seller gives us, and they are handled
          accordingly.
        </p>
        <LegalList
          items={[
            <>
              They are <strong>admin-only</strong>. Only our review and payout team can see them.
            </>,
            <>
              They are <strong>never shown on a listing</strong>. A published listing carries the
              product, not the person behind it.
            </>,
            <>
              They are <strong>never returned by any public API</strong>. There is no request a buyer
              or a visitor can make that will hand back a seller&rsquo;s payout information.
            </>,
            <>
              The payout identifier itself is <strong>encrypted at rest</strong> in our database.
            </>,
          ]}
        />
        <p>
          We use them for exactly one thing: sending you the 80% you are owed when your product
          sells.
        </p>
      </>
    ),
  },
  {
    id: "uploads",
    title: "The files you upload",
    body: (
      <>
        <p>
          A submission carries three kinds of file, and they are not treated the same way.
        </p>
        <LegalCallout title="Private, always">
          The <strong>deliverable ZIP</strong> and the <strong>verification README</strong> are
          stored on a <strong>private disk</strong>. They are never publicly served and never sit
          behind a shareable URL. Our reviewers read them, and the ZIP is released only to a buyer
          who has signed in, owns a paid order for that product, and presents the matching license
          key.
        </LegalCallout>
        <p>
          <strong>Product images are public</strong> — that is their entire purpose. They appear on
          the listing for everyone to see. Do not upload anything into the image slots that you would
          not want on a public page: no screenshots with real customer data, credentials, or
          anything private in the frame.
        </p>
      </>
    ),
  },
  ]),
  {
    id: "why",
    title: "Why we process it",
    body: (
      <>
        <p>Each thing we hold maps to something we have to do:</p>
        <LegalList
          items={[
            <>
              <strong>To deliver your purchase</strong> — issue the license key, gate the download to
              you, and email you both.
            </>,
            <>
              <strong>To verify listings</strong> — read the code, follow the README, check the
              metrics, so that what we publish is true.
            </>,
            ...(SHOW_SELL
              ? [
                  <>
                    <strong>To pay sellers</strong> — transfer the 80% and send proof of it.
                  </>,
                  <>
                    <strong>To support both sides</strong> — answer questions, investigate a broken
                    delivery, resolve a dispute.
                  </>,
                ]
              : [
                  <>
                    <strong>To support you</strong> — answer questions, investigate a broken
                    delivery, resolve a dispute.
                  </>,
                ]),
            <>
              <strong>To keep the marketplace safe and lawful</strong> — detect abuse of license keys
              or downloads, and meet our accounting and tax obligations.
            </>,
          ]}
        />
        <p>
          That is the list. We do not build advertising profiles, and we do not run behavioural
          tracking on you.
        </p>
      </>
    ),
  },
  {
    id: "no-selling",
    title: "We do not sell your data",
    body: (
      <>
        <p>
          We do not sell, rent, or trade personal data. We share it only with the parties that make
          the service work, and only as far as they need it:
        </p>
        <LegalList
          items={[
            "our payment provider, to take the payment and confirm it",
            "our email provider, to deliver the transactional emails below",
            "our hosting and storage providers, which run the site and hold the files",
            "professional advisers or authorities, where the law actually requires it",
          ]}
        />
        {SHOW_SELL ? (
          <p>
            A buyer never receives a seller&rsquo;s personal contact details from us, and a seller
            never receives a buyer&rsquo;s. Where an introduction is genuinely needed — a handover
            question, for instance — we ask both sides first.
          </p>
        ) : (
          <p>
            Your contact details are never handed to anyone else on the marketplace. Where an
            introduction is genuinely needed — a handover question, for instance — we ask you first.
          </p>
        )}
      </>
    ),
  },
  {
    id: "emails",
    title: "The emails we send",
    body: (
      <>
        <p>Everything we send is transactional — it is triggered by something you did:</p>
        <LegalList
          items={[
            <>
              <strong>Purchase delivered</strong> — your license key and the link to download your
              deliverable, sent the moment your payment is confirmed.
            </>,
            ...(SHOW_SELL
              ? [
                  <>
                    <strong>Submission received</strong> — confirmation that your project reached us
                    and is queued for review, plus anything the reviewer needs to ask you.
                  </>,
                  <>
                    <strong>Payout confirmed</strong> — proof that your 80% has been transferred, for
                    your records.
                  </>,
                ]
              : []),
          ]}
        />
        <p>
          We do not add you to a marketing list because you bought
          {SHOW_SELL ? " or submitted " : " "}something. If we ever start a newsletter, it will be
          something you opt into.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and local storage",
    body: (
      <>
        <p>
          When you sign in, we store an <strong>authentication token in your browser</strong> so that
          you stay signed in as you move between pages. That is what keeps Purchases and downloads
          working without asking for your password on every click. Signing out removes it.
        </p>
        <p>
          We do not run advertising cookies or third-party trackers on this site. Our hosting and
          payment providers may set the strictly technical cookies they need to function.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: (
      <>
        <LegalList
          items={[
            "Account data: while your account exists.",
            SHOW_SELL
              ? "Orders, license keys, and payout records: kept after the sale — they are the record that a licence is valid, and we have accounting obligations that outlast the transaction."
              : "Orders and license keys: kept after the sale — they are the record that a licence is valid, and we have accounting obligations that outlast the transaction.",
            ...(SHOW_SELL
              ? [
                  "Declined or withdrawn submissions, and the files attached to them: kept only while there is a reason to (an appeal, a re-submission, a dispute), then deleted.",
                ]
              : []),
            "Deliverable ZIPs for live and sold listings: kept for as long as buyers are entitled to download what they paid for.",
          ]}
        />
      </>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights over your data",
    body: (
      <>
        <p>You can ask us to:</p>
        <LegalList
          items={[
            "show you what we hold about you",
            SHOW_SELL
              ? "correct anything that is wrong — including your payout details"
              : "correct anything that is wrong",
            "delete your data",
          ]}
        />
        <p>
          Email <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a> and a human will
          handle it. We will confirm it is really you before we act.
        </p>
        <p>
          One honest caveat on deletion: we can remove your account and your personal details, but we
          cannot erase the record that a paid order and a license key exist. That record is what
          makes a buyer&rsquo;s licence provable and what our books are built on. We keep it minimal
          and we keep it out of sight.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "How we protect it",
    body: (
      <>
        <LegalList
          items={[
            "Passwords are hashed, never stored in plain text.",
            ...(SHOW_SELL
              ? ["Payout identifiers are encrypted at rest and visible only to admins."]
              : []),
            SHOW_SELL
              ? "Deliverable ZIPs and verification READMEs live on a private disk with no public URL."
              : "Deliverable ZIPs live on a private disk with no public URL.",
            "Every download is gated: signed in, order is yours, order is paid, license key matches.",
            "Traffic to the site is served over HTTPS.",
            SHOW_SELL
              ? "Access to the admin tools is limited to the people who need it to review listings and run payouts."
              : "Access to the admin tools is limited to the people who need it to review and publish listings.",
          ]}
        />
        <p>
          No system is perfect. If a breach ever affects your data, we will tell you what happened,
          what it touched, and what to do — promptly and without spin.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <>
        <p>
          If what we collect or how we handle it changes, we update this page and change the
          &ldquo;last updated&rdquo; date at the top. Material changes will be stated plainly rather
          than buried.
        </p>
        <p>
          Questions about any of this — or a request about your data — go to{" "}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>. The rules of the
          marketplace itself are in the <Link href="/terms">terms &amp; conditions</Link>.
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalShell
      eyebrow="Legal"
      command="mdn legal --privacy"
      title="Privacy"
      titleAccent="policy."
      lead={
        SHOW_SELL
          ? "What we collect, why we collect it, and how the sensitive parts — your payout details and the files you upload — are actually protected. We do not sell personal data."
          : "What we collect, why we collect it, and how the sensitive parts — your account, your orders and your downloads — are actually protected. We do not sell personal data."
      }
      updated={LAST_UPDATED}
      sections={SECTIONS}
      sibling={{
        href: "/terms",
        label: "Terms & conditions",
        description: SHOW_SELL
          ? "How buying works, what your license covers, why sales are final once the code is delivered, and the flat 20% commission sellers pay."
          : "How buying works, what your license covers, and why sales are final once the code is delivered.",
      }}
    />
  );
}
