"use client";

import { FORM_TYPE_LABELS } from "@/lib/admin-labels";

export function AreaFilterPills({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange("all")}
        className={`border px-3 py-1.5 text-xs transition-colors duration-150 ${
          value === "all"
            ? "border-gold bg-gold text-bg"
            : "border-hairline-strong text-ink-dim hover:border-gold hover:text-gold"
        }`}
      >
        Todas
      </button>
      {Object.entries(FORM_TYPE_LABELS).map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`border px-3 py-1.5 text-xs transition-colors duration-150 ${
            value === key
              ? "border-gold bg-gold text-bg"
              : "border-hairline-strong text-ink-dim hover:border-gold hover:text-gold"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
