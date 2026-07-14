"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function CollapsibleText({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="group border border-hairline p-6 transition-colors duration-300 md:hover:border-gold">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-3 text-left md:pointer-events-none"
      >
        <h2 className="text-xl">{title}</h2>
        <ChevronDown
          size={18}
          className={`shrink-0 text-gold transition-transform duration-300 md:hidden ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          expanded ? "mt-4 grid-rows-[1fr]" : "grid-rows-[0fr]"
        } md:mt-4 md:grid-rows-[0fr] md:group-hover:grid-rows-[1fr]`}
      >
        <p
          className={`overflow-hidden text-sm leading-relaxed text-ink-dim transition-opacity duration-300 ${
            expanded ? "opacity-100" : "opacity-0"
          } md:opacity-0 md:group-hover:opacity-100`}
        >
          {children}
        </p>
      </div>
    </div>
  );
}
