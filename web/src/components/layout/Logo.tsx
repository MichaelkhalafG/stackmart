import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * The MDN STACKMART logo lockup (approved landing design).
 *
 * The MDN mark (web/public/logo-mdn.png — the supplied company logo) is the dominant wordmark;
 * "STACKMART" sits after a hairline divider as the smaller platform name. This replaces the old
 * text-only "STACKMART" logo and is the single logo used in BOTH the header and the footer.
 *
 * `variant="light"` renders the mark white for dark navy surfaces (the mark is a solid navy
 * silhouette, so `brightness-0 invert` flips it to pure white — same asset, no second file).
 * Server-safe: no hooks.
 */
export function Logo({
  variant = "navy",
  size = "header",
  asLink = true,
  className,
}: {
  variant?: "navy" | "light";
  size?: "header" | "footer";
  /**
   * Render the lockup as a link home (default — header/footer). Set `false` where navigating away
   * would destroy the user's context, e.g. the purchase `AuthModal`: there the lockup is pure
   * branding and must NOT be a link, or clicking it would abandon the checkout mid-flow.
   */
  asLink?: boolean;
  className?: string;
}) {
  const light = variant === "light";

  const lockupClassName = cn(
    "flex flex-none items-center",
    size === "footer" ? "gap-3" : "gap-[11px]",
    className,
  );

  const lockup = (
    <>
      <Image
        src="/logo-mdn.png"
        alt="MDN"
        width={1855}
        height={752}
        priority
        className={cn(
          "block w-auto",
          size === "footer" ? "h-[26px]" : "h-[23px]",
          light && "brightness-0 invert",
        )}
      />
      <span
        aria-hidden
        className={cn("w-px", size === "footer" ? "h-[22px]" : "h-5", light ? "bg-canvas/30" : "bg-border")}
      />
      <span
        className={cn(
          "font-semibold tracking-[0.26em]",
          size === "footer" ? "text-xs" : "text-[11.5px]",
          light ? "text-tag-bg" : "text-fg-muted",
        )}
      >
        STACKMART
      </span>
    </>
  );

  // Non-link mode: the lockup is pure branding (used inside the purchase modal, where a link home
  // would abandon the checkout). It stays announced as an image with its accessible name.
  if (!asLink) {
    return (
      <span role="img" aria-label="MDN STACKMART" className={lockupClassName}>
        {lockup}
      </span>
    );
  }

  return (
    <Link href="/" aria-label="MDN STACKMART home" className={lockupClassName}>
      {lockup}
    </Link>
  );
}
