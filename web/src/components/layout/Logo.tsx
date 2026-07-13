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
  className,
}: {
  variant?: "navy" | "light";
  size?: "header" | "footer";
  className?: string;
}) {
  const light = variant === "light";

  return (
    <Link
      href="/"
      aria-label="MDN STACKMART home"
      className={cn("flex flex-none items-center", size === "footer" ? "gap-3" : "gap-[11px]", className)}
    >
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
    </Link>
  );
}
