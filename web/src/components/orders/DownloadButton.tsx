import Link from "next/link";
import { Download } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * "Download your product" — the entry point to the LICENSE-GATED download.
 *
 * It no longer downloads on click. The deliverable is released only after the buyer proves they
 * hold the license key, so this navigates to the dedicated download page for the order
 * (`/download/{id}`), where they enter the key and the stream is requested with their Bearer token.
 *
 * That page enforces nothing on its own — the API is the authority (auth + ownership + paid +
 * matching license). This is just the door to it. Used by the invoice and the purchases table.
 */
export function DownloadButton({
  orderId,
  label = "Download your product",
  size = "default",
  variant = "default",
  className,
}: {
  orderId: number;
  label?: string;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline";
  className?: string;
}) {
  return (
    <Link
      href={`/download/${orderId}`}
      className={cn(buttonVariants({ variant, size }), "w-full gap-2", className)}
    >
      <Download className="size-4" aria-hidden />
      {label}
    </Link>
  );
}
