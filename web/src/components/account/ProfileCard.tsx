import { ShieldCheck } from "lucide-react";

import type { User } from "@/store/auth";
import { Badge } from "@/components/ui/badge";

/**
 * The identity card at the top of the account sidebar — who you are signed in as.
 *
 * Read-only on purpose: it mirrors the auth store, so the moment `EditNameForm` writes the renamed
 * user back via `setAuth`, this re-renders with the new name (exactly like the header does). All the
 * mutation lives in the forms; this is the display.
 *
 * The coding-themed touch is the navy strip (`.panel-navy` + `.motif-grid` — the grid motif is only
 * ever allowed inside a navy panel) with a live-session cursor, plus the mono `~/handle` under the
 * name, derived deterministically from the email local-part (no randomness → no hydration drift).
 */
export function ProfileCard({ user }: { user: User }) {
  const initials = initialsFor(user);
  const handle = handleFor(user);

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-canvas">
      {/* Branded strip — the avatar below overlaps it. */}
      <div className="panel-navy relative h-[92px] overflow-hidden">
        <div className="motif-grid absolute inset-0" aria-hidden />

        <div className="relative flex items-center justify-between px-6 pt-5">
          <span className="mono text-[11px] font-semibold tracking-[0.12em] text-tag-bg/80 uppercase">
            ~/account
          </span>
          <span className="mono inline-flex items-center gap-1.5 text-[11px] text-canvas/70">
            <span
              aria-hidden
              className="anim-pulse-dot inline-block size-1.5 rounded-full bg-tag-bg"
            />
            session active
          </span>
        </div>
      </div>

      <div className="relative px-6 pb-6">
        {/*
          The avatar deliberately straddles the navy/canvas boundary: it is 64px tall and pulled up
          by exactly half its height (-mt-8), so it sits centred on the dividing line, ringed in
          canvas so it reads as a cutout against BOTH the navy above and the white below.

          `relative z-10` is load-bearing, not decoration. The navy strip above is `relative` (it has
          to be, to position the motif overlay), and a POSITIONED element paints above a
          non-positioned sibling no matter the DOM order — so without its own stacking position the
          avatar's top half was being painted over by the strip, which is what made it look clipped
          and half-missing.
        */}
        <div
          aria-hidden
          className="mono relative z-10 -mt-8 flex size-16 items-center justify-center rounded-xl bg-primary text-xl font-bold text-primary-foreground shadow-float-sm ring-4 ring-canvas"
        >
          {initials}
        </div>

        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          <h2 className="text-[1.15rem] leading-tight font-bold tracking-[-0.01em] text-primary">
            {user.name}
          </h2>
          {user.is_admin ? (
            <Badge>
              <ShieldCheck aria-hidden />
              Admin
            </Badge>
          ) : null}
        </div>

        <p className="mono mt-1 flex items-center text-[12.5px] text-fg-muted">
          ~/{handle}
          <span
            aria-hidden
            className="anim-blink ml-1 inline-block h-3.5 w-[7px] bg-accent align-middle"
          />
        </p>

        <dl className="mt-5 flex flex-col gap-3 border-t border-border pt-5 text-[13px]">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-fg-muted">Email</dt>
            <dd className="mono min-w-0 truncate font-medium text-fg">{user.email}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-fg-muted">Role</dt>
            <dd className="font-medium text-fg">{user.is_admin ? "Administrator" : "Buyer"}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

/** "Ada Lovelace" → "AL"; single-word names → first two letters; falls back to the email. */
function initialsFor(user: User): string {
  const words = user.name.trim().split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  }
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return user.email.slice(0, 2).toUpperCase();
}

/** The mono handle: the email local-part, reduced to characters that look like a shell path. */
function handleFor(user: User): string {
  const local = user.email.split("@")[0]?.toLowerCase() ?? "";
  const cleaned = local.replace(/[^a-z0-9._-]/g, "");
  return cleaned || "user";
}
