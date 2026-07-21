import type { ReactNode } from "react";
import Link from "next/link";

import { SHOW_SELL } from "@/lib/config";
import { MobilePageHeader } from "@/components/layout/MobilePageHeader";

/**
 * The shared shell for the two long-form legal documents (`/terms`, `/privacy`).
 *
 * Both pages are Server Components with static content, so this is a pure presentational shell —
 * no state, no client JS. It reuses the landing/guidelines design language exactly:
 *
 *   • a dark branded header band (`.mesh-sell` navy + royal-blue mesh, `.grid-motif-sell` grid on
 *     top) with a mono eyebrow, a white headline + lavender accent phrase, a lead, and a mono
 *     "last updated" chip. ONLY the header is dark — the document body below is the light canvas.
 *   • a two-column body: a sticky table of contents and the numbered sections, each capped at a
 *     ~72ch reading measure.
 *
 * The sections array is the single source of truth: it drives BOTH the table of contents and the
 * rendered document (numbering comes from the array index, so sections can never drift out of sync
 * with their numbers). Every colour is a token; no new CSS.
 */

/** ────────────────────────────────────────────────────────────────────────────
 *  PLACEHOLDERS — a human must confirm these before launch.
 *
 *  `LEGAL_CONTACT_EMAIL` is the single support/legal contact route printed in both documents.
 *  `LEGAL_JURISDICTION_NOTE` is rendered verbatim in the Terms' "Governing law" section, and is
 *  deliberately written as an explicit, visible placeholder rather than a fabricated jurisdiction:
 *  the operating entity and governing law are a business decision, not something to invent here.
 *  ──────────────────────────────────────────────────────────────────────────── */
export const LEGAL_CONTACT_EMAIL = "support@mdnstackmart.com";
export const LEGAL_JURISDICTION_NOTE =
  "The operating legal entity and the governing law / jurisdiction for these terms are still being confirmed and will be published here before launch. Until then, nothing in this section should be read as a choice of law.";

/** One section of a legal document: an anchor id, a heading, and its body content. */
export type LegalSectionContent = {
  id: string;
  title: string;
  body: ReactNode;
};

/** Two-digit section number, e.g. 1 → "01". */
function sectionNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}

/**
 * A bulleted list inside a legal section. Explicit lavender dots (rather than list markers) so the
 * bullets match the brand and stay aligned with the 72ch measure.
 */
export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex max-w-[72ch] flex-col gap-2.5">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-3 text-[15.5px] leading-[1.7] text-fg-muted">
          <span
            className="mt-[0.62em] size-1.5 flex-none rounded-full bg-accent"
            aria-hidden
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * An emphasised aside inside a section — used for the rules a reader must not miss (sales are
 * final, payout details are admin-only, the jurisdiction placeholder). A subtle canvas panel with
 * a royal-blue rule, never a colour-coded "alert": these are terms, not errors.
 */
export function LegalCallout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="max-w-[72ch] rounded-md border border-border border-l-[3px] border-l-accent bg-canvas-subtle p-5">
      <div className="mono text-[12px] font-semibold tracking-[0.1em] text-accent uppercase">
        {title}
      </div>
      <div className="mt-2.5 text-[15px] leading-[1.65] text-fg">{children}</div>
    </div>
  );
}

/**
 * The document body's prose wrapper. Child selectors keep the page copy plain JSX (`<p>`,
 * `<strong>`, `<a>`) while still getting the shared measure, rhythm and token colours.
 */
function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 text-[15.5px] leading-[1.7] text-fg-muted [&>p]:max-w-[72ch] [&_a]:font-medium [&_a]:text-accent [&_a:hover]:underline [&_strong]:font-semibold [&_strong]:text-primary">
      {children}
    </div>
  );
}

type LegalShellProps = {
  /** Mono eyebrow above the headline, e.g. "Legal". */
  eyebrow: string;
  /** The terminal command for the shared mobile header band, e.g. `mdn legal --terms`. */
  command: string;
  /** The headline, split so the trailing phrase can take the lavender accent on the navy band. */
  title: string;
  titleAccent: string;
  /** The lead paragraph under the headline (white-on-navy, so kept short and plain). */
  lead: string;
  /** Human-readable date, e.g. "14 July 2026". */
  updated: string;
  /** The document itself — drives the table of contents AND the numbered sections. */
  sections: LegalSectionContent[];
  /** The sibling legal document, cross-linked from the closing band. */
  sibling: { href: string; label: string; description: string };
};

export function LegalShell({
  eyebrow,
  command,
  title,
  titleAccent,
  lead,
  updated,
  sections,
  sibling,
}: LegalShellProps) {
  return (
    <>
      {/* MOBILE (<md): the shared branded navy header band, with the "last updated" chip kept. */}
      <MobilePageHeader
        command={command}
        title={`${title} ${titleAccent}`}
        subhead={lead}
        extra={
          <span className="mono inline-flex items-center gap-2 rounded-md border border-tag-bg/25 bg-tag-bg/10 px-3 py-1.5 text-[12px] text-tag-bg">
            <span className="anim-pulse-dot size-1.5 rounded-full bg-tag-bg" aria-hidden />
            last updated · {updated}
          </span>
        }
      />

      {/* ── Header — the branded dark navy band (same treatment as /guidelines and the landing's
             dark sections). Royal blue is never used for text here: on navy it fails contrast, so
             the accent phrase and the chip are lavender. DESKTOP ONLY (md+) — mobile uses the shared
             MobilePageHeader band above. ── */}
      <section className="mesh-sell relative hidden overflow-hidden md:block">
        <div className="grid-motif-sell absolute inset-0" aria-hidden />

        <div className="relative container-page py-[clamp(56px,7vw,92px)]">
          <div className="max-w-[760px]">
            <p className="mono text-[12px] font-semibold tracking-[0.12em] text-tag-bg uppercase">
              {eyebrow}
            </p>

            <h1 className="mt-3.5 text-[clamp(2.1rem,4.2vw,3.2rem)] leading-[1.07] font-bold tracking-[-0.03em] text-canvas">
              {title} <span className="text-tag-bg">{titleAccent}</span>
            </h1>

            <p className="mt-6 max-w-[640px] text-[clamp(1.02rem,1.4vw,1.15rem)] leading-[1.6] text-canvas/75">
              {lead}
            </p>

            <div className="mono mt-7 inline-flex items-center gap-2.5 rounded-md border border-tag-bg/25 bg-tag-bg/10 px-3.5 py-2 text-[12.5px] text-tag-bg">
              <span className="anim-pulse-dot size-1.5 rounded-full bg-tag-bg" aria-hidden />
              last updated · {updated}
            </div>
          </div>
        </div>
      </section>

      {/* ── Document body — light canvas: sticky contents + the numbered sections. ── */}
      <section className="border-b border-border bg-canvas">
        <div className="container-page py-[clamp(48px,6vw,80px)]">
          <div className="grid gap-10 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-16">
            {/* Contents — sticky on desktop, a plain card above the document on mobile. */}
            <nav
              aria-label="Contents"
              className="h-max rounded-md border border-border bg-canvas-subtle p-5 lg:sticky lg:top-24 lg:border-0 lg:bg-transparent lg:p-0"
            >
              <div className="mono text-[12px] font-semibold tracking-[0.1em] text-primary uppercase">
                Contents
              </div>
              <ol className="mt-4 flex flex-col gap-2.5">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="flex gap-2.5 text-[13.5px] leading-[1.45] text-fg-muted transition-colors hover:text-accent"
                    >
                      <span className="mono flex-none text-accent">{sectionNumber(index)}</span>
                      <span>{section.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            {/* The document. */}
            <div className="flex flex-col gap-12">
              {sections.map((section, index) => (
                <section key={section.id} id={section.id} className="scroll-mt-24">
                  <div className="mono text-[13px] font-semibold tracking-[0.1em] text-accent">
                    {sectionNumber(index)}
                  </div>
                  <h2 className="mt-2 text-[clamp(1.35rem,2.2vw,1.7rem)] font-bold tracking-[-0.02em] text-primary">
                    {section.title}
                  </h2>
                  <div className="mt-4">
                    <Prose>{section.body}</Prose>
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Closing band — contact + the sibling document. ── */}
      <section className="mesh-stats border-b border-border">
        <div className="container-page py-[clamp(44px,5vw,68px)]">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-md border border-border bg-canvas p-7">
              <h2 className="text-[1.15rem] font-semibold text-primary">Questions about this?</h2>
              <p className="mt-2.5 text-[15px] leading-[1.6] text-fg-muted">
                Write to us and a human on the team will answer — the same address handles delivery
                problems{SHOW_SELL ? ", seller submissions," : ""} and data requests.
              </p>
              <a
                href={`mailto:${LEGAL_CONTACT_EMAIL}`}
                className="mono mt-5 inline-flex items-center gap-2 rounded-md border border-border bg-canvas-subtle px-4 py-2.5 text-[14px] font-medium text-primary transition-colors hover:border-accent hover:text-accent"
              >
                {LEGAL_CONTACT_EMAIL}
              </a>
            </div>

            <div className="rounded-md border border-border bg-canvas p-7">
              <h2 className="text-[1.15rem] font-semibold text-primary">{sibling.label}</h2>
              <p className="mt-2.5 text-[15px] leading-[1.6] text-fg-muted">{sibling.description}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={sibling.href}
                  className="rounded-md border border-primary bg-primary px-4 py-2.5 text-[14px] font-semibold text-canvas transition-colors hover:bg-primary-emphasis"
                >
                  Read the {sibling.label.toLowerCase()}
                </Link>
                <Link
                  href="/guidelines"
                  className="rounded-md border border-border bg-canvas px-4 py-2.5 text-[14px] font-semibold text-primary transition-colors hover:border-accent hover:text-accent"
                >
                  How the platform works
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
