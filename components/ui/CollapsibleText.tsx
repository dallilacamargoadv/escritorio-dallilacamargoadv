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
    <div>
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
      <p
        className={`mt-4 text-sm leading-relaxed text-ink-dim ${
          expanded ? "block" : "hidden md:block"
        }`}
      >
        {children}
      </p>
    </div>
  );
}
