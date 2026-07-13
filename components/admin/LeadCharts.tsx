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

const COLORS = ["#e5e5e5", "#a3a3a3", "#737373", "#525252", "#404040"];

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-neutral-800 bg-neutral-900 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
        {title}
      </h3>
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
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis type="number" stroke="#737373" fontSize={11} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#737373"
              fontSize={11}
              width={80}
            />
            <Tooltip
              contentStyle={{
                background: "#171717",
                border: "1px solid #404040",
                fontSize: 12,
              }}
            />
            <Bar dataKey="value" fill="#e5e5e5" />
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
            <Tooltip
              contentStyle={{
                background: "#171717",
                border: "1px solid #404040",
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Cadastros ao longo do tempo">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis dataKey="name" stroke="#737373" fontSize={10} />
            <YAxis stroke="#737373" fontSize={11} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: "#171717",
                border: "1px solid #404040",
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#e5e5e5"
              fill="#404040"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
