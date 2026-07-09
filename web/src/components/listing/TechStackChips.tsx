/**
 * TechStackChips (13_Component_Map.md) — tag pills over tech_stack[], using the `tag-bg`/`tag-fg`
 * tokens (lavender bg + navy text after the MDN rebrand) with mono text. Server-safe (no hooks).
 */
export function TechStackChips({ stack }: { stack: string[] }) {
  if (!stack || stack.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {stack.map((tech) => (
        <span
          key={tech}
          className="mono inline-flex items-center rounded-full bg-tag-bg px-2.5 py-0.5 text-xs font-medium text-tag-fg"
        >
          {tech}
        </span>
      ))}
    </div>
  );
}
