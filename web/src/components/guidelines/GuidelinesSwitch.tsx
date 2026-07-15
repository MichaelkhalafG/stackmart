"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * GuidelinesSwitch (< md only) — turns the guidelines page's three long stacked sections
 * (For buyers / For sellers / FAQ) into a one-tap segmented navigation on mobile, so a reader
 * lands on the part they care about instead of scrolling the whole page.
 *
 * A sticky segmented control sits just under the site header; tapping a segment shows that
 * section and hides the other two. Each section is passed in as a server-rendered node and
 * rendered exactly once, so there are no duplicate ids and no content is copied.
 *
 * Desktop is untouched: the segmented control is `md:hidden`, and every section wrapper is
 * `md:contents` — at `md` and up the wrappers dissolve and all three sections render stacked,
 * byte-for-byte what the server rendered before this component existed. The active-tab state
 * only changes what CSS shows below `md`, so first paint matches on both breakpoints (no
 * hydration mismatch).
 */
type SectionKey = "buyers" | "sellers" | "faq";

const TABS: { key: SectionKey; label: string }[] = [
  { key: "buyers", label: "For buyers" },
  { key: "sellers", label: "For sellers" },
  { key: "faq", label: "FAQ" },
];

export function GuidelinesSwitch({
  buyers,
  sellers,
  faq,
}: {
  buyers: ReactNode;
  sellers: ReactNode;
  faq: ReactNode;
}) {
  const [active, setActive] = useState<SectionKey>("buyers");

  const sections: { key: SectionKey; node: ReactNode }[] = [
    { key: "buyers", node: buyers },
    { key: "sellers", node: sellers },
    { key: "faq", node: faq },
  ];

  return (
    <>
      <nav
        aria-label="Guidelines sections"
        className="sticky top-16 z-30 border-b border-border bg-canvas/95 px-4 py-2.5 backdrop-blur-sm md:hidden"
      >
        <div className="grid grid-cols-3 gap-1 rounded-lg border border-border bg-canvas-subtle p-1">
          {TABS.map((tab) => {
            const isActive = active === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActive(tab.key)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "min-h-11 rounded-md px-2 text-[13px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                  isActive
                    ? "bg-canvas text-primary shadow-preview"
                    : "text-fg-muted hover:text-fg",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {sections.map(({ key, node }) => (
        <div key={key} className={cn("md:contents", active === key ? "block" : "hidden")}>
          {node}
        </div>
      ))}
    </>
  );
}
