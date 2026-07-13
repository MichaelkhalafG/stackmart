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
    <section className="container-page py-[clamp(64px,8vw,108px)]">
      <div className="mx-auto mb-[46px] max-w-[600px] text-center">
        <div className="text-[13px] font-semibold tracking-[0.08em] text-accent uppercase">
          Trusted by operators
        </div>
        <h2 className="mt-2.5 text-[clamp(1.9rem,3.2vw,2.8rem)] font-bold tracking-[-0.025em] text-primary">
          Deals that close, founders who come back
        </h2>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
        {TESTIMONIALS.map((item) => (
          <figure
            key={item.name}
            className="m-0 rounded-[10px] border border-border bg-canvas-subtle p-[26px]"
          >
            <div className="flex gap-[3px] text-[15px] text-accent" aria-label="5 out of 5 stars">
              <span aria-hidden>★★★★★</span>
            </div>
            <blockquote className="mt-4 text-base leading-[1.55] text-fg">
              &ldquo;{item.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-tag-bg text-sm font-bold text-tag-fg">
                {item.initials}
              </span>
              <span>
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
