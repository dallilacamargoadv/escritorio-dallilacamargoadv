"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  AreaChart,
  Area,
} from "recharts";
import type { Lead } from "@/lib/db-admin";
import {
  computeGeographicDistribution,
  computeRegistrationTimeline,
  computeUtmDistribution,
} from "@/lib/chart-data";

const COLORS = [
  "var(--gold)",
  "var(--wine)",
  "var(--gold-bright)",
  "var(--wine-deep)",
  "var(--ink-dim)",
];

const TOOLTIP_STYLE = {
  background: "var(--surface)",
  border: "1px solid var(--hairline-strong)",
  fontSize: 12,
  color: "var(--ink)",
};

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-hairline bg-surface p-4">
      <h3 className="font-eyebrow text-[10px] text-gold">{title}</h3>
      <div className="mt-4 h-56">{children}</div>
    </div>
  );
}

export function LeadCharts({ leads }: { leads: Lead[] }) {
  const utmSource = computeUtmDistribution(leads, "utm_source").slice(0, 10);
  const geo = computeGeographicDistribution(leads).slice(0, 6);
  const timeline = computeRegistrationTimeline(leads, "day");

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <ChartCard title="Origem (UTM Source)">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={utmSource} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline)" />
            <XAxis
              type="number"
              stroke="var(--ink-dim)"
              fontSize={11}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="var(--ink-dim)"
              fontSize={11}
              width={80}
            />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="value" fill="var(--gold)" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Distribuição geográfica">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={geo}
              dataKey="value"
              nameKey="name"
              innerRadius={40}
              outerRadius={70}
            >
              {geo.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Cadastros ao longo do tempo">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline)" />
            <XAxis dataKey="name" stroke="var(--ink-dim)" fontSize={10} />
            <YAxis stroke="var(--ink-dim)" fontSize={11} allowDecimals={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--gold)"
              fill="var(--gold)"
              fillOpacity={0.25}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
