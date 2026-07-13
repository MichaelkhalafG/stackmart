import type { ReactNode } from "react";

/**
 * Blankslate (Forms & Utility reference §04 "empty") — the shared empty state: a 56px lavender
 * tile holding a royal-blue glyph, a bold navy heading, one muted line, one clear action.
 *
 * The prop API (icon/title/description/action) is fixed — the marketplace browser, the filter
 * sidebar, the featured strip and the purchases table all render through it. The glyph is sized
 * here (26px) so callers can keep passing whatever lucide icon they already pass.
 * Plain presentational component (no hooks) so it works in any tree.
 */
export function Blankslate({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-border bg-canvas px-6 py-14 text-center">
      {icon ? (
        <div className="mb-4 flex size-14 items-center justify-center rounded-md bg-tag-bg text-accent [&_svg]:size-[26px]">
          {icon}
        </div>
      ) : null}
      <h3 className="text-[1.1rem] font-bold text-primary">{title}</h3>
      <p className="mt-1.5 max-w-[44ch] text-[13.5px] leading-[1.5] text-fg-muted">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
