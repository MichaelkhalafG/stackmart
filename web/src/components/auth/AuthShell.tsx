import type { ReactNode } from "react";

import { Logo } from "@/components/layout/Logo";

/**
 * The shared auth shell (Forms & Utility reference §01 "Auth pages") — /login, /register,
 * /forgot-password and /reset-password all render inside it.
 *
 * Split layout in one bordered, rounded, shadowed card:
 *   LEFT  — the form side: MDN STACKMART lockup, heading + sub-line, the fields, footer link line.
 *   RIGHT — the branded navy panel (`.panel-navy` + `.motif-grid`): lavender pill badge, value prop
 *           and a mono terminal card with a blinking cursor.
 * The columns are `repeat(auto-fit, minmax(340px, 1fr))`, so the panel stacks below the form on
 * narrow screens (auto-fit collapses the empty tracks, keeping a clean 50/50 split on desktop).
 *
 * SIZING: the card fills the page container (up to 1240px) and stands a generous 660px tall on
 * desktop, so it reads as a large, confident centered card rather than a small box floating in
 * whitespace. The form column centres its content at a comfortable 420px measure, so the fields
 * stay readable even though the column itself is wide. Server-safe (no hooks) — the interactive
 * form is passed in as children.
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
    <div className="flex justify-center py-2 sm:py-4">
      <div className="shadow-mega grid w-full max-w-[1240px] grid-cols-[repeat(auto-fit,minmax(340px,1fr))] overflow-hidden rounded-[10px] border border-border bg-canvas lg:min-h-[660px]">
        {/* form side — content centred at a readable measure inside the now-wide column */}
        <div className="flex flex-col justify-center p-[clamp(32px,5vw,72px)]">
          <div className="mx-auto w-full max-w-[420px]">
            <Logo />

            <h1 className="mt-8 text-[clamp(1.75rem,2.4vw,2.15rem)] leading-tight font-bold tracking-[-0.01em] text-primary">
              {title}
            </h1>
            {subtitle ? <p className="mt-2 text-[15px] text-fg-muted">{subtitle}</p> : null}

            <div className="mt-8">{children}</div>

            {footer ? (
              <p className="mt-7 text-center text-sm text-fg-muted">{footer}</p>
            ) : null}
          </div>
        </div>

        {/* brand panel */}
        <div className="panel-navy relative flex min-h-[380px] flex-col justify-between overflow-hidden p-[clamp(32px,4.5vw,60px)] lg:min-h-full">
          <div className="motif-grid absolute inset-0" aria-hidden />

          <div className="relative">
            <span className="mono inline-flex items-center gap-[7px] rounded-md border border-tag-bg/30 bg-tag-bg/15 px-[11px] py-[5px] text-[11px] text-tag-bg">
              the micro-SaaS marketplace
            </span>
            <p className="mt-6 max-w-[20ch] text-[clamp(1.45rem,2.8vw,2.05rem)] leading-[1.25] font-semibold text-canvas">
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
    </div>
  );
}
