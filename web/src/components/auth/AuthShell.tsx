import type { ReactNode } from "react";

import { Logo } from "@/components/layout/Logo";

/**
 * The shared auth shell (Forms & Utility reference §01 "Auth pages") — /login, /register,
 * /forgot-password and /reset-password all render inside it.
 *
 * FULL-VIEWPORT SPLIT. These are standalone screens: the `(auth)` layout renders no navbar, no
 * footer, no padding and no background, so this shell spans the whole viewport edge to edge
 * (`min-h-dvh`, `lg:grid-cols-2`). There is no max-width, no outer card, no rounded corners and no
 * margin — the previous "card floating in whitespace" is gone; the two panels ARE the page.
 *
 *   LEFT  — the form panel. Branded rather than a blank white void: a soft lavender/royal gradient
 *           mesh (`.auth-base`), a faint navy dot grid (`.auth-grid`) and a royal-blue accent along
 *           the panel's top edge. There is NO inner card — the form sits directly on the panel and
 *           the column fills the full height: lockup at the top, heading + form centred in the
 *           middle, the switch link and a mono detail pinned at the base. The dot grid's radial mask
 *           clears the centre, and every input is itself an opaque `bg-canvas` control, so labels,
 *           values and inline errors stay crisp (AA).
 *   RIGHT — the branded navy coding panel (`.panel-navy` + `.motif-grid`): lavender pill badge,
 *           value prop, and the mono "// how stackmart ships" terminal with a blinking cursor.
 *
 * Both panels stretch to the full viewport height. Below `lg` the split collapses to one column:
 * the form comes FIRST (it is what the user came for) and the navy panel follows beneath it.
 *
 * The logo lockup at the top of the form links back to `/` — the only navigation these screens need
 * now that the navbar is gone. Server-safe (no hooks); the interactive form is passed as children.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-dvh flex-1 grid-cols-1 lg:grid-cols-2">
      {/* ── Form panel ─────────────────────────────────────────────────────── */}
      {/* No inner card: the form sits DIRECTLY on the branded panel and the column is laid out
          top → middle → bottom (logo up top, form vertically centred, footer pinned at the base),
          so it fills the half rather than floating as a small box in the middle of it. */}
      <div className="auth-base relative flex flex-col overflow-hidden px-6 py-10 sm:px-10 lg:px-[clamp(48px,6vw,96px)] lg:py-14">
        <div className="auth-grid pointer-events-none absolute inset-0" aria-hidden />

        {/* Royal-blue brand accent along the top edge of the panel. */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,var(--accent),var(--tag-bg))]"
        />

        <div className="relative mx-auto flex w-full max-w-[480px] flex-1 flex-col">
          {/* Top — the lockup, with a quiet mono status detail opposite it */}
          <div className="flex items-center justify-between gap-4">
            <Logo />
            <span className="mono hidden items-center gap-1.5 text-[11px] text-fg-muted sm:inline-flex">
              <span className="anim-pulse-dot size-1.5 rounded-full bg-accent" aria-hidden />
              secure
            </span>
          </div>

          {/* Middle — heading + form, vertically centred in the remaining space */}
          <div className="flex flex-1 flex-col justify-center py-10">
            <span className="block h-[3px] w-10 rounded-full bg-accent" aria-hidden />

            <h1 className="mt-6 text-[clamp(1.9rem,2.8vw,2.5rem)] leading-tight font-bold tracking-[-0.02em] text-primary">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-2.5 text-[15px] leading-[1.55] text-fg-muted">{subtitle}</p>
            ) : null}

            <div className="mt-9">{children}</div>
          </div>

          {/* Bottom — the switch link, plus a mono footer detail so the base isn't empty */}
          <div className="flex flex-col gap-4">
            {footer ? <p className="text-center text-sm text-fg-muted">{footer}</p> : null}
            <p className="mono flex items-center justify-center gap-2 text-[11px] text-fg-muted">
              <span className="text-accent">$</span> mdn-stackmart · vetted micro-SaaS
            </p>
          </div>
        </div>
      </div>

      {/* ── Branded navy coding panel ──────────────────────────────────────── */}
      <div className="panel-navy relative flex min-h-[360px] flex-col justify-between overflow-hidden p-[clamp(32px,4.5vw,64px)] lg:min-h-full">
        <div className="motif-grid absolute inset-0" aria-hidden />

        <div className="relative">
          <span className="mono inline-flex items-center gap-[7px] rounded-md border border-tag-bg/30 bg-tag-bg/15 px-[11px] py-[5px] text-[11px] text-tag-bg">
            the micro-SaaS marketplace
          </span>
          <p className="mt-6 max-w-[20ch] text-[clamp(1.45rem,2.8vw,2.15rem)] leading-[1.25] font-semibold text-canvas">
            Buy and sell profitable software, transparently.
          </p>
        </div>

        <div
          aria-hidden
          className="mono relative mt-10 rounded-lg border border-tag-bg/20 bg-primary-emphasis/55 px-[18px] py-4 text-[12.5px] leading-[1.85]"
        >
          <div className="text-tag-bg/55">{"// how stackmart ships"}</div>
          <div className="text-canvas">
            <span className="text-tag-bg">catalog</span> = vetted listings
          </div>
          <div className="text-canvas">
            <span className="text-tag-bg">delivery</span> = zip + license key
          </div>
          <div className="text-canvas">
            await sm.connect()
            <span className="anim-blink ml-1 inline-block h-3 w-1.5 -translate-y-px bg-tag-bg align-middle" />
          </div>
        </div>
      </div>
    </div>
  );
}
