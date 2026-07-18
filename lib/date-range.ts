const TZ = "America/Belem";
const DIA_MS = 24 * 60 * 60 * 1000;

export type DateRangeKey = "all" | "today" | "7d" | "30d" | "90d" | "custom";

export interface DateRangeValue {
  key: DateRangeKey;
  from: string | null; // yyyy-mm-dd, só relevante quando key === "custom"
  to: string | null;
}

export interface ResolvedRange {
  from: Date | null;
  to: Date | null;
}

export const DATE_RANGE_LABELS: Record<DateRangeKey, string> = {
  all: "Todo o tempo",
  today: "Hoje",
  "7d": "7 dias",
  "30d": "30 dias",
  "90d": "90 dias",
  custom: "Personalizado",
};

function startOfTodayInTz(): Date {
  const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
  return new Date(`${todayStr}T00:00:00-03:00`);
}

export function resolveDateRange(value: DateRangeValue): ResolvedRange {
  if (value.key === "all") return { from: null, to: null };

  if (value.key === "custom") {
    return {
      from: value.from ? new Date(`${value.from}T00:00:00-03:00`) : null,
      to: value.to ? new Date(`${value.to}T23:59:59-03:00`) : null,
    };
  }

  const startOfToday = startOfTodayInTz();
  if (value.key === "today") return { from: startOfToday, to: null };

  const days = value.key === "7d" ? 7 : value.key === "30d" ? 30 : 90;
  return { from: new Date(startOfToday.getTime() - days * DIA_MS), to: null };
}

export function isWithinRange(dateIso: string, range: ResolvedRange): boolean {
  const time = new Date(dateIso).getTime();
  if (range.from && time < range.from.getTime()) return false;
  if (range.to && time > range.to.getTime()) return false;
  return true;
}
