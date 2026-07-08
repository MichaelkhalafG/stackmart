// STACKMART design tokens — canonical NAMES for TS consumers.
// Values live in src/app/globals.css (Tailwind v4 @theme) per Planning/06_UI_System.md.
// This module intentionally holds no hex values — globals.css is the single source of truth.

/** Brand color tokens (also available as Tailwind utilities, e.g. `bg-canvas`, `text-fg`). */
export const colorTokens = [
  "canvas",
  "canvas-subtle",
  "border",
  "fg",
  "fg-muted",
  "accent",
  "success",
  "danger",
  "attention",
  "tag-bg",
  "tag-fg",
] as const;
export type ColorToken = (typeof colorTokens)[number];

/** Resolve a token to its CSS variable reference, e.g. cssVar("accent") → "var(--accent)". */
export const cssVar = (token: ColorToken): string => `var(--${token})`;

/** Layout constants mirrored from globals.css (for JS that can't read CSS vars, e.g. next.config). */
export const layout = {
  radius: "6px",
  container: "1280px",
  boxPadding: "16px",
} as const;
