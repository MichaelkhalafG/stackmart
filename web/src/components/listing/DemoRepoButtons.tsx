import { ExternalLink } from "lucide-react";

import { RepoIcon } from "@/components/RepoIcon";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Demo / Repository affordances for the listing purchase card (06_UI_System.md §3, verbatim):
 * - Live Demo — shadcn Button `secondary` + external-link icon, directly UNDER Buy Now; rendered
 *   ONLY when `demo_url` exists (no placeholder, no disabled state).
 * - View Repository — shadcn Button `outline` + `<RepoIcon>` (hostname → inline SVG); rendered ONLY
 *   when `repository_url` exists.
 * Both open a new tab with `rel="noopener noreferrer"`. Neither is green — Buy Now stays the sole
 * primary. Plain external HTTPS links: no integration, no iframe, no hosting assumption.
 * Server-safe (styled anchors via `buttonVariants`, no hooks).
 */
export function DemoRepoButtons({
  demoUrl,
  repositoryUrl,
}: {
  demoUrl: string | null;
  repositoryUrl: string | null;
}) {
  if (!demoUrl && !repositoryUrl) return null;

  return (
    <>
      {demoUrl ? (
        <a
          href={demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "w-full")}
        >
          Live Demo
          <ExternalLink className="size-4" aria-hidden />
        </a>
      ) : null}

      {repositoryUrl ? (
        <a
          href={repositoryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}
        >
          <RepoIcon url={repositoryUrl} className="size-4" />
          View Repository
        </a>
      ) : null}
    </>
  );
}
