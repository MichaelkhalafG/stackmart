"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import type { ProductFaq } from "./types";

/** FaqAccordion (13_Component_Map.md) — shadcn Accordion as-is over faq[{q,a}]. */
export function FaqAccordion({ faq }: { faq: ProductFaq[] }) {
  if (!faq || faq.length === 0) return null;

  return (
    <Accordion className="rounded-md border border-border px-4">
      {faq.map((entry, index) => (
        <AccordionItem key={index} value={String(index)}>
          <AccordionTrigger>{entry.q}</AccordionTrigger>
          <AccordionContent>
            <p className="text-fg-muted">{entry.a}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
