"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Logo } from "@/components/layout/Logo";
import { cn } from "@/lib/utils";

import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

/**
 * AuthModal — the inline sign-in / create-account dialog used ONLY to intercept a purchase made
 * while logged out. It is an ADDITIONAL path, not a replacement: the navbar's "Sign in" /
 * "Get started" still navigate to the /login and /register pages, which are unchanged.
 *
 * It contains NO auth logic of its own. It renders the very same `LoginForm` / `RegisterForm` the
 * pages render — same API calls, same Zustand `setAuth`, same 422 field-error handling — and only
 * supplies an `onSuccess` handler so that, instead of redirecting to /account, the caller can close
 * the dialog and resume whatever the user was doing (i.e. continue to checkout for the same
 * product). One auth implementation, two entry points.
 *
 * Accessibility comes from the shared Base UI `Dialog` primitive: focus trap, Escape to close,
 * `aria-modal`, and the labelling wired by `DialogTitle` / `DialogDescription`.
 */
export function AuthModal({
  open,
  onOpenChange,
  onAuthenticated,
  title = "Sign in to complete your purchase",
  description = "Your order is waiting — sign in or create an account and we'll take you straight to checkout.",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Runs after a successful sign-in OR registration, once the token is in the store. */
  onAuthenticated: () => void;
  title?: string;
  description?: string;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");

  // Always reopen on the sign-in tab, so a reopened modal never shows a stale tab selection.
  // Adjusted DURING RENDER (React's recommended pattern for deriving state from a prop change) —
  // not in an effect, which would trigger a cascading render.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setMode("login");
  }

  function handleAuthenticated() {
    onOpenChange(false);
    onAuthenticated();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[460px]">
        {/* Brand edge — a thin royal-blue → lavender rule across the top of the dialog. */}
        <div
          aria-hidden
          className="h-[3px] w-full bg-[linear-gradient(90deg,var(--accent),var(--tag-bg))]"
        />

        <div className="p-7">
          {/* The MDN STACKMART lockup — the same `Logo` the header and footer use, but NOT a link
              here (`asLink={false}`): clicking it would navigate home and abandon the purchase. */}
          <Logo asLink={false} />

          {/* One restrained line of coding motif, in the site's mono face. */}
          <p className="mono mt-4 flex items-center gap-1.5 text-[11.5px] text-fg-muted">
            <span className="text-accent">$</span> auth --resume-checkout
            <span
              aria-hidden
              className="anim-blink inline-block h-[11px] w-[6px] bg-accent align-middle"
            />
          </p>

          <DialogTitle className="mt-4 text-[1.35rem] leading-tight font-bold tracking-[-0.01em] text-primary">
            {title}
          </DialogTitle>
          <DialogDescription className="mt-2 flex items-start gap-2 text-[14.5px] leading-[1.55] text-fg-muted">
            <ShieldCheck
              className="mt-0.5 size-4 flex-none text-accent"
              strokeWidth={2.2}
              aria-hidden
            />
            {description}
          </DialogDescription>

          {/* Mode toggle — stays inside the dialog, no route change */}
          <div
            role="tablist"
            aria-label="Authentication"
            className="mt-6 grid grid-cols-2 gap-1 rounded-md border border-border bg-canvas-subtle p-1"
          >
            {(["login", "register"] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={mode === value}
                onClick={() => setMode(value)}
                className={cn(
                  "rounded-[4px] px-3 py-2 text-[13.5px] font-semibold transition-colors",
                  "focus-visible:ring-[3px] focus-visible:ring-accent/25 focus-visible:outline-none",
                  mode === value
                    ? "bg-canvas text-primary shadow-sm"
                    : "text-fg-muted hover:text-primary",
                )}
              >
                {value === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {mode === "login" ? (
              <LoginForm onSuccess={handleAuthenticated} />
            ) : (
              <RegisterForm onSuccess={handleAuthenticated} />
            )}
          </div>

          <p className="mt-6 text-center text-[13.5px] text-fg-muted">
            {mode === "login" ? (
              <>
                New to MDN STACKMART?{" "}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="font-semibold text-accent hover:underline"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="font-semibold text-accent hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
