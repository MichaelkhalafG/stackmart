import { cn } from "@/lib/utils";

/**
 * Page container — 1280px max-width, centered, 16px gutters (06_UI_System.md §1).
 * Uses the `.container-page` utility from globals.css so the width lives in one place.
 */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("container-page", className)}>{children}</div>;
}
