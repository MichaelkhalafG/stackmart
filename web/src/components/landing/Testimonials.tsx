/** Social proof — approved landing design. Static copy, as specified. */
const TESTIMONIALS = [
  {
    quote:
      "The code audit caught things our own diligence missed. We closed in 9 days with total confidence.",
    initials: "MR",
    name: "Maya R.",
    role: "Acquired Inboxly",
  },
  {
    quote: "Listed on Friday, three vetted offers by Monday. No tire-kickers, no wasted calls.",
    initials: "DK",
    name: "Devin K.",
    role: "Sold Cronbase",
  },
  {
    quote:
      "Escrow plus handover support made my first acquisition genuinely low-risk. I've bought two more since.",
    initials: "PS",
    name: "Priya S.",
    role: "Serial acquirer",
  },
];

export function Testimonials() {
  return (
    <section className="container-page py-[clamp(64px,8vw,108px)] max-md:py-[clamp(48px,8vw,64px)]">
      <div className="mx-auto mb-[46px] max-w-[600px] text-center max-md:mb-8">
        <div className="text-[13px] font-semibold tracking-[0.08em] text-accent uppercase">
          Trusted by operators
        </div>
        {/* Mobile scale tops out at the desktop floor (1.9rem) by 543px, so md+ is unchanged. */}
        <h2 className="mt-2.5 text-[clamp(1.9rem,3.2vw,2.8rem)] font-bold tracking-[-0.025em] text-primary max-md:text-[clamp(1.6rem,5.6vw,1.9rem)]">
          Deals that close, founders who come back
        </h2>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 max-md:gap-4">
        {TESTIMONIALS.map((item) => (
          <figure
            key={item.name}
            className="m-0 rounded-[10px] border border-border bg-canvas-subtle p-[26px] max-md:p-5"
          >
            <div className="flex gap-[3px] text-[15px] text-accent" aria-label="5 out of 5 stars">
              <span aria-hidden>★★★★★</span>
            </div>
            <blockquote className="mt-4 text-base leading-[1.55] text-fg">
              &ldquo;{item.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              {/* max-md:shrink-0 keeps the avatar circular when a long name squeezes the row at 360px. */}
              <span className="flex size-10 items-center justify-center rounded-full bg-tag-bg text-sm font-bold text-tag-fg max-md:shrink-0">
                {item.initials}
              </span>
              <span className="max-md:min-w-0">
                <span className="block text-sm font-semibold text-primary">{item.name}</span>
                <span className="text-[13px] text-fg-muted">{item.role}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
