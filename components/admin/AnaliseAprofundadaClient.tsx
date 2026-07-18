"use client";

import { useMemo, useState } from "react";
import type { Lead } from "@/lib/db-admin";
import type { Cliente } from "@/lib/db-clientes";
import {
  FORM_TYPE_CHART_COLORS,
  FORM_TYPE_LABELS,
  CHART_COLOR_OUTROS,
} from "@/lib/admin-labels";
import { DateRangeFilter } from "@/components/admin/DateRangeFilter";
import {
  isWithinRange,
  resolveDateRange,
  type DateRangeValue,
} from "@/lib/date-range";
import {
  computeAnswerFrequencies,
  computeChannelBreakdown,
  computeConversionRate,
  computeDayHourMatrix,
  computeDonutSegments,
  computeServiceProfile,
  computeTopCities,
  computeTopUtm,
  computeWeeklyVolume,
  countLeadsInPreviousPeriod,
  DAY_LABELS,
  type RankedItem,
} from "@/lib/analytics";
import { ANSWER_QUESTION_LABELS, prettifyAnswerValue } from "@/lib/answer-labels";

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-hairline bg-surface p-5">
      <h2 className="text-[15px] italic text-ink">{title}</h2>
      <p className="font-mono text-[9.5px] uppercase tracking-wide text-ink-dim">
        {subtitle}
      </p>
      {children}
    </div>
  );
}

function RankList({
  items,
  barColor = "var(--chart-1)",
  emptyLabel = "Sem dados no período.",
}: {
  items: RankedItem[];
  barColor?: string;
  emptyLabel?: string;
}) {
  if (items.length === 0) {
    return <p className="mt-4 text-xs text-ink-dim">{emptyLabel}</p>;
  }
  const max = items[0].count;
  return (
    <div className="mt-3 flex flex-col gap-2">
      {items.map((item) => (
        <div key={item.label} className="grid grid-cols-[minmax(0,110px)_1fr_32px] items-center gap-2">
          <span className="truncate text-[11.5px] text-ink" title={item.label}>
            {item.label}
          </span>
          <div className="h-2 overflow-hidden rounded-full bg-hairline">
            <div
              className="h-full rounded-full"
              style={{ width: `${(item.count / max) * 100}%`, background: barColor }}
            />
          </div>
          <span className="text-right font-mono text-[11px] text-ink-dim tabular-nums">
            {item.count}
          </span>
        </div>
      ))}
    </div>
  );
}

function ServiceDonut({ profile }: { profile: RankedItem[] }) {
  const total = profile.reduce((sum, p) => sum + p.count, 0);
  const circumference = 2 * Math.PI * 45;
  const segments = computeDonutSegments(profile);

  return (
    <div className="mt-3 flex flex-wrap items-center gap-5">
      <svg viewBox="0 0 120 120" width="120" height="120" className="shrink-0">
        <circle cx="60" cy="60" r="45" fill="none" stroke="var(--hairline)" strokeWidth="16" />
        {segments.map((segment) => (
          <circle
            key={segment.label}
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke={FORM_TYPE_CHART_COLORS[segment.label] ?? CHART_COLOR_OUTROS}
            strokeWidth="16"
            strokeDasharray={`${segment.dash} ${circumference - segment.dash}`}
            strokeDashoffset={-segment.offset}
            transform="rotate(-90 60 60)"
          />
        ))}
      </svg>
      <div className="flex flex-col gap-1.5 text-[11.5px]">
        {profile.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ background: FORM_TYPE_CHART_COLORS[item.label] ?? CHART_COLOR_OUTROS }}
            />
            <span className="text-ink">{FORM_TYPE_LABELS[item.label] ?? item.label}</span>
            <span className="font-mono text-ink-dim tabular-nums">
              {total > 0 ? Math.round((item.count / total) * 100) : 0}%
            </span>
          </div>
        ))}
        {profile.length === 0 && <p className="text-ink-dim">Sem dados no período.</p>}
      </div>
    </div>
  );
}

function ChannelTable({
  stats,
}: {
  stats: { channel: string; count: number; conversions: number }[];
}) {
  if (stats.length === 0) {
    return <p className="mt-4 text-xs text-ink-dim">Sem dados no período.</p>;
  }
  const total = stats.reduce((sum, s) => sum + s.count, 0);
  return (
    <table className="mt-3 w-full text-left text-xs">
      <thead>
        <tr className="border-b border-hairline font-mono text-[9px] uppercase text-ink-dim">
          <th className="py-1.5 pr-2">Canal</th>
          <th className="py-1.5 pr-2 text-right">Leads</th>
          <th className="py-1.5 pr-2 text-right">%</th>
          <th className="py-1.5 text-right">Conversão</th>
        </tr>
      </thead>
      <tbody>
        {stats.slice(0, 8).map((s) => {
          const convRate = s.count > 0 ? Math.round((s.conversions / s.count) * 100) : 0;
          return (
            <tr key={s.channel} className="border-b border-hairline">
              <td className="py-1.5 pr-2 text-ink">{s.channel}</td>
              <td className="py-1.5 pr-2 text-right font-mono text-ink-dim tabular-nums">
                {s.count}
              </td>
              <td className="py-1.5 pr-2 text-right font-mono text-ink-dim tabular-nums">
                {total > 0 ? Math.round((s.count / total) * 100) : 0}%
              </td>
              <td
                className={`py-1.5 text-right font-mono tabular-nums ${
                  convRate >= 15 ? "text-success" : "text-warning"
                }`}
              >
                {convRate}%
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function WeeklyBarChart({ weeks }: { weeks: { weekStart: string; count: number }[] }) {
  const max = Math.max(1, ...weeks.map((w) => w.count));
  return (
    <div className="mt-4 flex h-32 items-end gap-2">
      {weeks.map((w) => (
        <div key={w.weekStart} className="flex flex-1 flex-col items-center gap-1">
          <span className="font-mono text-[9.5px] text-ink-dim tabular-nums">{w.count}</span>
          <div
            className="w-full rounded-t-sm bg-chart-1"
            style={{ height: `${(w.count / max) * 90}px`, minHeight: w.count > 0 ? "4px" : "0" }}
          />
          <span className="font-mono text-[8.5px] text-ink-dim">
            {w.weekStart.slice(5).replace("-", "/")}
          </span>
        </div>
      ))}
    </div>
  );
}

function DayHourHeatmap({ matrix }: { matrix: number[][] }) {
  const max = Math.max(1, ...matrix.flat());
  return (
    <div className="mt-3 overflow-x-auto">
      <div className="grid min-w-[640px] grid-cols-[32px_repeat(24,1fr)] gap-[2px]">
        <div />
        {Array.from({ length: 24 }, (_, h) => (
          <div key={h} className="text-center font-mono text-[8px] text-ink-dim">
            {h % 3 === 0 ? h : ""}
          </div>
        ))}
        {matrix.map((row, day) => (
          <div key={day} className="contents">
            <div className="flex items-center font-mono text-[9px] text-ink-dim">
              {DAY_LABELS[day]}
            </div>
            {row.map((count, hour) => (
              <div
                key={hour}
                title={`${DAY_LABELS[day]} ${hour}h — ${count} lead(s)`}
                className="aspect-square rounded-sm"
                style={{
                  background: "var(--chart-1)",
                  opacity: count === 0 ? 0.06 : 0.25 + (count / max) * 0.75,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnaliseAprofundadaClient({
  initialLeads,
  clientes,
}: {
  initialLeads: Lead[];
  clientes: Cliente[];
}) {
  const [range, setRange] = useState<DateRangeValue>({
    key: "7d",
    from: null,
    to: null,
  });
  const [answerTab, setAnswerTab] = useState<string>("");

  const convertedLeadIds = useMemo(
    () => new Set(clientes.filter((c) => c.lead_id).map((c) => c.lead_id as string)),
    [clientes],
  );

  const resolved = useMemo(() => resolveDateRange(range), [range]);
  const leads = useMemo(
    () => initialLeads.filter((l) => isWithinRange(l.created_at, resolved)),
    [initialLeads, resolved],
  );

  const previousPeriodCount = useMemo(() => {
    if (range.key === "all" || range.key === "custom" || !resolved.from) return null;
    return countLeadsInPreviousPeriod(initialLeads, resolved.from);
  }, [initialLeads, range, resolved]);

  const serviceProfile = useMemo(() => computeServiceProfile(leads), [leads]);
  const channelStats = useMemo(
    () => computeChannelBreakdown(leads, convertedLeadIds),
    [leads, convertedLeadIds],
  );
  const topCampaigns = useMemo(() => computeTopUtm(leads, "utm_campaign"), [leads]);
  const topTerms = useMemo(() => computeTopUtm(leads, "utm_term"), [leads]);
  const topContent = useMemo(() => computeTopUtm(leads, "utm_content"), [leads]);
  const topCities = useMemo(() => computeTopCities(leads), [leads]);
  const weeklyVolume = useMemo(() => computeWeeklyVolume(leads, 8), [leads]);
  const dayHourMatrix = useMemo(() => computeDayHourMatrix(leads), [leads]);
  const conversionRate = useMemo(
    () => computeConversionRate(leads, convertedLeadIds),
    [leads, convertedLeadIds],
  );

  const areaKeys = Object.keys(FORM_TYPE_LABELS);
  const currentAnswerArea = answerTab || areaKeys[0];
  const answerFrequencies = useMemo(
    () => computeAnswerFrequencies(leads.filter((l) => l.form_type === currentAnswerArea)),
    [leads, currentAnswerArea],
  );

  const topChannel = channelStats[0];
  const topArea = serviceProfile[0];
  const deltaPercent =
    previousPeriodCount !== null && previousPeriodCount > 0
      ? Math.round(((leads.length - previousPeriodCount) / previousPeriodCount) * 100)
      : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <h1 className="text-lg italic text-ink">Análise Aprofundada</h1>
          <p className="max-w-[46ch] font-mono text-xs text-ink-dim">
            Origem, comportamento e perfil dos leads — por canal, campanha, geografia e horário
            de chegada
          </p>
        </div>
        <DateRangeFilter value={range} onChange={setRange} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="border border-hairline p-5">
          <p className="font-mono text-[9.5px] uppercase text-ink-dim">Leads no período</p>
          <p className="mt-2 font-mono text-2xl text-ink tabular-nums">{leads.length}</p>
          {deltaPercent !== null && (
            <p className={`mt-1 text-[10.5px] ${deltaPercent >= 0 ? "text-success" : "text-error"}`}>
              {deltaPercent >= 0 ? "↑" : "↓"} {Math.abs(deltaPercent)}% vs. período anterior
            </p>
          )}
        </div>
        <div className="border border-hairline p-5">
          <p className="font-mono text-[9.5px] uppercase text-ink-dim">Taxa de conversão</p>
          <p className="mt-2 font-mono text-2xl text-ink tabular-nums">{conversionRate}%</p>
          <p className="mt-1 text-[10.5px] text-ink-dim">
            {leads.filter((l) => convertedLeadIds.has(l.id)).length} viraram cliente
          </p>
        </div>
        <div className="border border-hairline p-5">
          <p className="font-mono text-[9.5px] uppercase text-ink-dim">Canal líder</p>
          <p className="mt-2 truncate text-base text-ink" title={topChannel?.channel}>
            {topChannel?.channel ?? "—"}
          </p>
          <p className="mt-1 text-[10.5px] text-ink-dim">
            {topChannel && leads.length > 0
              ? `${Math.round((topChannel.count / leads.length) * 100)}% dos leads`
              : "—"}
          </p>
        </div>
        <div className="border border-hairline p-5">
          <p className="font-mono text-[9.5px] uppercase text-ink-dim">Área líder</p>
          <p className="mt-2 truncate text-base text-ink">
            {topArea ? FORM_TYPE_LABELS[topArea.label] ?? topArea.label : "—"}
          </p>
          <p className="mt-1 text-[10.5px] text-ink-dim">
            {topArea && leads.length > 0
              ? `${Math.round((topArea.count / leads.length) * 100)}% dos leads`
              : "—"}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel title="Perfil por Serviço" subtitle="distribuição de leads pelas 5 áreas">
          <ServiceDonut profile={serviceProfile} />
        </Panel>
        <Panel title="Performance por Canal" subtitle="utm_source / utm_medium combinados">
          <ChannelTable stats={channelStats} />
        </Panel>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Panel title="Top Campanhas" subtitle="utm_campaign">
          <RankList items={topCampaigns} />
        </Panel>
        <Panel title="Top Terms" subtitle="utm_term">
          <RankList items={topTerms} barColor="var(--chart-2)" />
        </Panel>
        <Panel title="Top Content" subtitle="utm_content">
          <RankList items={topContent} barColor="var(--chart-5)" />
        </Panel>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel title="Distribuição Geográfica" subtitle="top cidades por IP/geolocalização">
          <RankList items={topCities} barColor="var(--chart-3)" />
        </Panel>
        <Panel title="Volume Semanal" subtitle="leads por semana, últimas 8 semanas">
          <WeeklyBarChart weeks={weeklyVolume} />
        </Panel>
      </div>

      <div className="mt-5">
        <Panel title="Padrão de Cadastro — Dia × Hora" subtitle="quando os leads chegam (fuso de Redenção/PA)">
          <DayHourHeatmap matrix={dayHourMatrix} />
        </Panel>
      </div>

      <div className="mt-5">
        <Panel title="Análise de Respostas por Serviço" subtitle="frequência das respostas do formulário, por área">
          <div className="mt-3 flex flex-wrap gap-1.5">
            {areaKeys.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setAnswerTab(key)}
                className={`border px-2.5 py-1 text-[11px] transition-colors duration-150 ${
                  currentAnswerArea === key
                    ? "border-gold bg-gold text-bg"
                    : "border-hairline-strong text-ink-dim hover:border-gold hover:text-gold"
                }`}
              >
                {FORM_TYPE_LABELS[key]}
              </button>
            ))}
          </div>
          {Object.keys(answerFrequencies).length === 0 && (
            <p className="mt-4 text-xs text-ink-dim">Sem respostas registradas no período.</p>
          )}
          {Object.entries(answerFrequencies).map(([question, items]) => (
            <div key={question} className="mt-4">
              <p className="text-[11.5px] text-ink">
                {ANSWER_QUESTION_LABELS[question] ?? question}
              </p>
              <RankList
                items={items.map((i) => ({ ...i, label: prettifyAnswerValue(i.label) }))}
                barColor="var(--chart-4)"
              />
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
}
