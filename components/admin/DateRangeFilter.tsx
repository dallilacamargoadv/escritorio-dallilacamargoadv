"use client";

import { DATE_RANGE_LABELS, type DateRangeKey, type DateRangeValue } from "@/lib/date-range";

const KEYS: DateRangeKey[] = ["all", "today", "7d", "30d", "90d", "custom"];

export function DateRangeFilter({
  value,
  onChange,
}: {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {KEYS.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange({ key, from: value.from, to: value.to })}
          className={`whitespace-nowrap border px-3 py-1.5 text-xs transition-colors duration-150 ${
            value.key === key
              ? "border-gold bg-gold text-bg"
              : "border-hairline-strong text-ink-dim hover:border-gold hover:text-gold"
          }`}
        >
          {DATE_RANGE_LABELS[key]}
        </button>
      ))}
      {value.key === "custom" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={value.from ?? ""}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
            className="border border-hairline-strong bg-surface px-2 py-1.5 text-xs text-ink"
          />
          <span className="text-xs text-ink-dim">até</span>
          <input
            type="date"
            value={value.to ?? ""}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
            className="border border-hairline-strong bg-surface px-2 py-1.5 text-xs text-ink"
          />
        </div>
      )}
    </div>
  );
}
