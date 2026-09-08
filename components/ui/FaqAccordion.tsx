"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

export interface FaqItem {
  question: string;
  answer: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="border-t border-hairline">
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <div key={item.question} className="border-b border-hairline">
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : index)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
            >
              <span className="font-display text-base font-normal not-italic text-ink">
                {item.question}
              </span>
              <Plus
                size={16}
                className={`shrink-0 text-gold transition-transform duration-200 ${open ? "rotate-45" : ""}`}
              />
            </button>
            <div
              className={`grid overflow-hidden transition-all duration-200 ease-out ${
                open ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <p className="max-w-2xl text-sm leading-relaxed text-ink-dim">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
