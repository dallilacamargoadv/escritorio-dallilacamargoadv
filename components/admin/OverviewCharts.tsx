"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FORM_TYPE_CHART_COLORS, CHART_COLOR_OUTROS } from "@/lib/admin-labels";
import type { LeadFormType } from "@/lib/db-leads";

const TOOLTIP_STYLE = {
  background: "var(--surface)",
  border: "1px solid var(--hairline-strong)",
  fontSize: 12,
  color: "var(--ink)",
};

export function FunilDonutChart({
  data,
  onSliceClick,
}: {
  data: { formType: LeadFormType; label: string; count: number }[];
  onSliceClick: (formType: LeadFormType) => void;
}) {
  const chartData = data.map((d) => ({ name: d.label, value: d.count, formType: d.formType }));
  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="border border-hairline p-4">
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={45}
              outerRadius={75}
              onClick={(entry) =>
                onSliceClick((entry as unknown as { formType: LeadFormType }).formType)
              }
              cursor="pointer"
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.formType}
                  fill={FORM_TYPE_CHART_COLORS[entry.formType] ?? CHART_COLOR_OUTROS}
                />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
        {chartData.map((entry) => (
          <button
            key={entry.formType}
            type="button"
            onClick={() => onSliceClick(entry.formType)}
            className="flex items-center gap-1.5 font-mono text-[10px] text-ink-dim transition-colors duration-150 hover:text-gold"
          >
            <span
              className="h-2 w-2 shrink-0"
              style={{ background: FORM_TYPE_CHART_COLORS[entry.formType] ?? CHART_COLOR_OUTROS }}
            />
            {entry.name} — {entry.value}
          </button>
        ))}
      </div>
      <p className="mt-2 font-mono text-[9px] text-ink-dim">{total} lead(s) no período</p>
    </div>
  );
}

export function OperacaoBarChart({
  data,
  onBarClick,
}: {
  data: { key: string; label: string; value: number }[];
  onBarClick: (key: string) => void;
}) {
  return (
    <div className="h-52 border border-hairline p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline)" />
          <XAxis type="number" stroke="var(--ink-dim)" fontSize={11} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="label"
            stroke="var(--ink-dim)"
            fontSize={11}
            width={110}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Bar
            dataKey="value"
            fill="var(--gold)"
            cursor="pointer"
            onClick={(entry) => onBarClick((entry as unknown as { key: string }).key)}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SlaGauge({ percent }: { percent: number }) {
  const color = percent >= 80 ? "var(--success)" : percent >= 50 ? "var(--warning)" : "var(--error)";
  const data = [{ value: percent, fill: color }];

  return (
    <div className="flex items-center gap-3">
      <div className="h-14 w-14 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="70%"
            outerRadius="100%"
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar dataKey="value" background={{ fill: "var(--bg)" }} cornerRadius={6} max={100} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <p className="font-mono text-xl text-ink tabular-nums">{percent}%</p>
    </div>
  );
}
