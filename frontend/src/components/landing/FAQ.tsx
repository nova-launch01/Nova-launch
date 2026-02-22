import { LANDING_SECTION_IDS } from "./sectionIds";
import { Accordion, type AccordionItem, PillTag } from "./shared";

const FAQ_ITEMS: AccordionItem[] = [
  {
    id: "fees",
    title: "What does deployment cost?",
    content: "Network fees are shown before confirmation so you can review costs before signing.",
  },
  {
    id: "wallet",
    title: "Which wallet is supported?",
    content: "The current deployment flow supports Freighter with testnet and mainnet toggling.",
  },
  {
    id: "speed",
    title: "How long does deployment take?",
    content: "Most deployments complete in under a minute after transaction confirmation.",
  },
];

export function FAQ() {
  return (
    <section id={LANDING_SECTION_IDS.faq} className="mx-auto max-w-7xl px-4 py-section sm:px-6 lg:px-8">
      <PillTag tone="neutral">FAQ</PillTag>
      <h2 className="mt-3 text-heading-xl text-text-primary">Common questions</h2>
      <div className="mt-8">
        <Accordion items={FAQ_ITEMS} />
      </div>
    </section>
  );
}
