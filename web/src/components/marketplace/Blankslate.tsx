import type { ReactNode } from "react";

/**
 * Blankslate (06_UI_System.md / 13_Component_Map.md) — the Primer empty-state pattern: centered
 * icon + heading + one muted line + one action. Used for the marketplace "no results" and error
 * states. Plain presentational component (no hooks) so it works in any tree.
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
    <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-border bg-canvas-subtle px-6 py-16 text-center">
      {icon ? <div className="text-fg-muted">{icon}</div> : null}
      <h3 className="text-base font-semibold text-fg">{title}</h3>
      <p className="max-w-sm text-sm text-fg-muted">{description}</p>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
