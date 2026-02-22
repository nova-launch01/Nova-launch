import { useState } from "react";

export interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

interface AccordionProps {
  items: AccordionItem[];
}

export function Accordion({ items }: AccordionProps) {
  const [openItemId, setOpenItemId] = useState<string>(items[0]?.id ?? "");

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = openItemId === item.id;

        return (
          <article key={item.id} className="overflow-hidden rounded-card border border-border-medium bg-background-card">
            <h3>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={isOpen}
                aria-controls={`${item.id}-panel`}
                onClick={() => setOpenItemId(isOpen ? "" : item.id)}
              >
                <span className="font-medium text-text-primary">{item.title}</span>
                <span className="text-text-muted">{isOpen ? "−" : "+"}</span>
              </button>
            </h3>
            {isOpen ? (
              <div id={`${item.id}-panel`} className="border-t border-border-subtle px-5 py-4 text-sm leading-6 text-text-secondary">
                {item.content}
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
