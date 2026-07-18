import type { Lead } from "@/lib/db-admin";

const TZ = "America/Belem";
const DIA_MS = 24 * 60 * 60 * 1000;
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export interface RankedItem {
  label: string;
  count: number;
}

export interface ChannelStat {
  channel: string;
  count: number;
  conversions: number;
}

export interface WeeklyVolume {
  weekStart: string;
  count: number;
}

function toRanked(counts: Map<string, number>, limit = 10): RankedItem[] {
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function bump(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

export function computeServiceProfile(leads: Lead[]): RankedItem[] {
  const counts = new Map<string, number>();
  for (const lead of leads) bump(counts, lead.form_type);
  return toRanked(counts, 999);
}

export function computeChannelBreakdown(
  leads: Lead[],
  convertedLeadIds: Set<string>,
): ChannelStat[] {
  const stats = new Map<string, { count: number; conversions: number }>();

  for (const lead of leads) {
    const source = lead.utms?.utm_source;
    const medium = lead.utms?.utm_medium;
    const channel = !source ? "(direto)" : `${source} / ${medium || "não definido"}`;
    const current = stats.get(channel) ?? { count: 0, conversions: 0 };
    current.count += 1;
    if (convertedLeadIds.has(lead.id)) current.conversions += 1;
    stats.set(channel, current);
  }

  return Array.from(stats.entries())
    .map(([channel, { count, conversions }]) => ({ channel, count, conversions }))
    .sort((a, b) => b.count - a.count);
}

export function computeTopUtm(
  leads: Lead[],
  utmKey: "utm_source" | "utm_medium" | "utm_campaign" | "utm_term" | "utm_content",
  limit = 8,
): RankedItem[] {
  const counts = new Map<string, number>();
  for (const lead of leads) {
    const value = lead.utms?.[utmKey];
    bump(counts, value || "(não definido)");
  }
  return toRanked(counts, limit);
}

export function computeTopCities(leads: Lead[], limit = 8): RankedItem[] {
  const counts = new Map<string, number>();
  for (const lead of leads) {
    const city = lead.metadata?.city as string | undefined;
    const region = lead.metadata?.region as string | undefined;
    const label = city ? `${city}${region ? `/${region}` : ""}` : "Não identificado";
    bump(counts, label);
  }
  return toRanked(counts, limit);
}

function weekStartInTz(dateIso: string): string {
  const localDateStr = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(
    new Date(dateIso),
  );
  const local = new Date(`${localDateStr}T00:00:00-03:00`);
  const dayOfWeek = local.getDay();
  const start = new Date(local.getTime() - dayOfWeek * DIA_MS);
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(start);
}

export function computeWeeklyVolume(leads: Lead[], weeks = 8): WeeklyVolume[] {
  const counts = new Map<string, number>();
  for (const lead of leads) {
    const week = weekStartInTz(lead.created_at);
    counts.set(week, (counts.get(week) ?? 0) + 1);
  }

  const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
  // -03:00 explícito: um "YYYY-MM-DD" puro é lido como meia-noite UTC, o que
  // "vaza" pro dia anterior ao formatar de volta no fuso de Belém (UTC-3).
  const currentWeekStart = new Date(`${weekStartInTz(`${todayStr}T12:00:00Z`)}T00:00:00-03:00`);

  const result: WeeklyVolume[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(
      new Date(currentWeekStart.getTime() - i * 7 * DIA_MS),
    );
    result.push({ weekStart, count: counts.get(weekStart) ?? 0 });
  }
  return result;
}

/** Matriz [dia da semana 0-6][hora 0-23], no fuso do escritório. */
export function computeDayHourMatrix(leads: Lead[]): number[][] {
  const matrix = Array.from({ length: 7 }, () => Array(24).fill(0));

  for (const lead of leads) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      weekday: "short",
      hour: "2-digit",
      hour12: false,
    }).formatToParts(new Date(lead.created_at));

    const weekdayStr = parts.find((p) => p.type === "weekday")?.value ?? "";
    const hourStr = parts.find((p) => p.type === "hour")?.value ?? "0";
    const weekdayMap: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };
    const day = weekdayMap[weekdayStr] ?? 0;
    const hour = parseInt(hourStr, 10) % 24;
    matrix[day][hour] += 1;
  }

  return matrix;
}

export const DAY_LABELS = DIAS_SEMANA;

export function computeAnswerFrequencies(
  leads: Lead[],
): Record<string, RankedItem[]> {
  const perQuestion = new Map<string, Map<string, number>>();

  for (const lead of leads) {
    for (const [question, value] of Object.entries(lead.answers ?? {})) {
      if (value === undefined || value === null || value === "") continue;
      if (!perQuestion.has(question)) perQuestion.set(question, new Map());
      bump(perQuestion.get(question)!, String(value));
    }
  }

  const result: Record<string, RankedItem[]> = {};
  for (const [question, counts] of perQuestion.entries()) {
    result[question] = toRanked(counts, 999);
  }
  return result;
}

export function computeConversionRate(
  leads: Lead[],
  convertedLeadIds: Set<string>,
): number {
  if (leads.length === 0) return 0;
  const converted = leads.filter((l) => convertedLeadIds.has(l.id)).length;
  return Math.round((converted / leads.length) * 1000) / 10;
}

/** Fora do corpo do componente de propósito — Date.now() precisa ficar numa
 * função auxiliar de módulo, não direto no render (react-hooks/purity). */
export function countLeadsInPreviousPeriod(leads: Lead[], from: Date): number {
  const durationMs = Date.now() - from.getTime();
  const prevFrom = from.getTime() - durationMs;
  const prevTo = from.getTime() - 1;
  return leads.filter((l) => {
    const time = new Date(l.created_at).getTime();
    return time >= prevFrom && time <= prevTo;
  }).length;
}

export interface DonutSegment extends RankedItem {
  dash: number;
  offset: number;
}

/** Idem — o acúmulo de offset fica fora do corpo do componente. */
export function computeDonutSegments(profile: RankedItem[], radius = 45): DonutSegment[] {
  const total = profile.reduce((sum, p) => sum + p.count, 0);
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;
  return profile.map((item) => {
    const fraction = total > 0 ? item.count / total : 0;
    const dash = fraction * circumference;
    const segment = { ...item, dash, offset: cumulative };
    cumulative += dash;
    return segment;
  });
}
