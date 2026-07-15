/**
 * The /sell page backdrop — the same coding motif language as the landing's "How it works"
 * section, tuned for a form page.
 *
 * Layers (all decorative: `aria-hidden`, `pointer-events-none`):
 *   1. a faint navy technical grid (`.sell-grid`)
 *   2. two columns of low-opacity IBM Plex Mono code — a submission/verification terminal on the
 *      left, the reviewed listing payload on the right — reusing the shared `.how-code` /
 *      `.how-code-accent` ink levels so the whole site stays one visual language
 *   3. oversized `{ }` bracket glyphs (`.how-glyph`, deliberately lighter than the code)
 *
 * READABILITY: the whole thing sits inside `.sell-backdrop`, whose horizontal mask confines it to
 * the outer page margins and fades it to zero across the entire central column — so nothing ever
 * renders beneath the heading, the form card, or any label/helper/error text. The code columns are
 * additionally `xl:block` only, so they never appear on narrower viewports where content spans the
 * full width.
 *
 * Motion: the drift/blink loops are the existing CSS keyframes, already disabled under
 * `prefers-reduced-motion`. Content is 100% static — nothing random or time-based, so the server
 * and client render identically (no hydration warnings).
 */
const SUBMIT_LOG = [
  "$ mdn-stackmart submit --listing",
  "",
  "  ✓ deliverable.zip ......... attached",
  "  ✓ verification README ..... attached",
  "  ✓ screenshots ............. 4 files",
  "  ✓ tech stack .............. laravel, next",
  "",
  "await review.queue(submission)",
];

const REVIEW_PAYLOAD = [
  "{",
  '  "status": "in_review",',
  '  "mrr": 11800,',
  '  "verified": false,',
  '  "commission": "20%"',
  "}",
];

export function SellBackdrop() {
  return (
    <div
      className="sell-backdrop pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {/* Technical grid */}
      <div className="sell-grid absolute inset-0" />

      {/* Oversized bracket glyphs */}
      <span className="how-glyph mono absolute -top-16 left-[2%] text-[16rem] leading-none font-bold select-none">
        {"{"}
      </span>
      <span className="how-glyph mono absolute right-[2%] -bottom-24 text-[16rem] leading-none font-bold select-none">
        {"}"}
      </span>

      {/* Left: submission terminal */}
      <pre className="how-code mono anim-drift-slow absolute top-24 left-[1.5%] hidden text-[13px] leading-[1.9] whitespace-pre select-none xl:block">
        {SUBMIT_LOG.join("\n")}
      </pre>

      {/* Left: blinking prompt under the log */}
      <span className="how-code-accent mono anim-drift-slow absolute top-[26rem] left-[1.5%] hidden items-center gap-1.5 text-[13px] xl:flex">
        ${" "}
        <span className="anim-blink inline-block h-[13px] w-[7px] bg-accent align-middle" />
      </span>

      {/* Right: review payload */}
      <pre className="how-code-accent mono anim-drift-slower absolute right-[1.5%] bottom-32 hidden text-[13px] leading-[1.9] whitespace-pre select-none xl:block">
        {REVIEW_PAYLOAD.join("\n")}
      </pre>
    </div>
  );
}
