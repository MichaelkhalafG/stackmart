/**
 * The one source of truth for form-control styling (Forms & Utility reference §03).
 *
 * Every control — input, textarea, select, money/affix input — inherits these so that default,
 * focus, error and disabled look identical across the whole site:
 *
 *   default   1px `border` on canvas, 6px radius, 15px text
 *   focus     royal-blue border + a 3px royal-blue ring
 *   error     danger border + a 3px danger ring (driven by `aria-invalid`)
 *   disabled  canvas-subtle fill, muted text, not-allowed cursor
 *
 * Token-driven only — no hardcoded hex.
 */

/** Base control: use on any focusable form control. Pairs with `aria-invalid` for the error state. */
export const controlBase = [
  "w-full rounded-md border border-border bg-canvas px-3.5 py-2.5 text-[15px] text-fg",
  "outline-none transition-[border-color,box-shadow] duration-150",
  "placeholder:text-fg-muted/70",
  // focus — royal-blue ring
  "focus:border-accent focus:ring-[3px] focus:ring-accent/20",
  "focus-visible:border-accent focus-visible:ring-[3px] focus-visible:ring-accent/20",
  // error — driven by aria-invalid so callers never hand-roll it
  "aria-invalid:border-danger aria-invalid:ring-[3px] aria-invalid:ring-danger/15",
  // disabled
  "disabled:cursor-not-allowed disabled:bg-canvas-subtle disabled:text-fg-muted",
].join(" ");

/** The bordered wrapper used by affix/money inputs, which own the border instead of the <input>. */
export const controlShell = [
  "flex w-full items-center overflow-hidden rounded-md border border-border bg-canvas",
  "transition-[border-color,box-shadow] duration-150",
  "focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent/20",
  "has-disabled:cursor-not-allowed has-disabled:bg-canvas-subtle",
].join(" ");

/** Error styling for `controlShell` (the shell can't read aria-invalid off its child). */
export const controlShellError = "border-danger ring-[3px] ring-danger/15 focus-within:border-danger focus-within:ring-danger/15";

/** The bare input that sits inside a `controlShell` — no border/ring of its own. */
export const controlShellInput = [
  "min-w-0 flex-1 border-0 bg-transparent py-2.5 pr-3.5 text-[15px] text-fg outline-none",
  "placeholder:text-fg-muted/70 disabled:cursor-not-allowed disabled:text-fg-muted",
].join(" ");
