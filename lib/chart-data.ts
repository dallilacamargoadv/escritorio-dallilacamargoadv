import type { Lead } from "@/lib/db-admin";

export interface ChartDataItem {
  name: string;
  value: number;
}

export function computeUtmDistribution(
  leads: Lead[],
  key: "utm_source" | "utm_medium" | "utm_campaign",
): ChartDataItem[] {
  const counts = new Map<string, number>();
  for (const lead of leads) {
    const value = lead.utms?.[key] || "(direto)";
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function computeGeographicDistribution(leads: Lead[]): ChartDataItem[] {
  const counts = new Map<string, number>();
  for (const lead of leads) {
    const city = (lead.metadata?.city as string) || "(desconhecido)";
    counts.set(city, (counts.get(city) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function computeRegistrationTimeline(
  leads: Lead[],
  granularity: "day" | "week" = "day",
): ChartDataItem[] {
  const counts = new Map<string, number>();
  for (const lead of leads) {
    const date = new Date(lead.created_at);
    const bucket =
      granularity === "day"
        ? date.toISOString().slice(0, 10)
        : `${date.getFullYear()}-S${Math.ceil(date.getDate() / 7)}`;
    counts.set(bucket, (counts.get(bucket) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
