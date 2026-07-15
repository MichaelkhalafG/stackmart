/**
 * /marketplace code motif — faint mono code columns in the outer margins (left: browse terminal,
 * right: filter query), same treatment as SellBackdrop. Grid/mesh come from `.mkt-backdrop`; this
 * adds only the code. `.mkt-codewrap` masks it out of the central column and it's `xl:block` only,
 * so it never sits under a card/label. Decorative; drift/blink stop under reduced-motion.
 */
const BROWSE_LOG = [
  "$ mdn-stackmart browse --vetted",
  "",
  "  GET /products?category=ai-tools",
  "  ✓ 12 listings verified",
  "  ✓ MRR confirmed",
  "  ✓ code audited",
  "",
  "sort = price DESC",
  "await catalog.fetch()",
];

const FILTER_QUERY = [
  "filter.apply({",
  '  stack: "laravel",',
  '  price: "<= 500k",',
  '  sort: "price_desc"',
  "})",
];

export function MarketplaceBackdrop() {
  return (
    <div
      className="mkt-codewrap pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {/* Oversized bracket glyphs */}
      <span className="how-glyph mono absolute -top-16 left-[2%] text-[16rem] leading-none font-bold select-none">
        {"{"}
      </span>
      <span className="how-glyph mono absolute right-[2%] -bottom-24 text-[16rem] leading-none font-bold select-none">
        {"}"}
      </span>

      {/* Left: catalog-browse terminal */}
      <pre className="how-code mono anim-drift-slow absolute top-24 left-[1.5%] hidden text-[13px] leading-[1.9] whitespace-pre select-none xl:block">
        {BROWSE_LOG.join("\n")}
      </pre>

      {/* Left: blinking prompt under the log */}
      <span className="how-code-accent mono anim-drift-slow absolute top-[28rem] left-[1.5%] hidden items-center gap-1.5 text-[13px] xl:flex">
        ${" "}
        <span className="anim-blink inline-block h-[13px] w-[7px] bg-accent align-middle" />
      </span>

      {/* Right: applied filter query */}
      <pre className="how-code-accent mono anim-drift-slower absolute right-[1.5%] bottom-32 hidden text-[13px] leading-[1.9] whitespace-pre select-none xl:block">
        {FILTER_QUERY.join("\n")}
      </pre>
    </div>
  );
}
