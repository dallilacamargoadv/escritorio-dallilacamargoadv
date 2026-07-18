"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import type { Lead } from "@/lib/db-admin";
import type { Contrato } from "@/lib/db-contratos";
import type { Cliente } from "@/lib/db-clientes";
import type { Caso } from "@/lib/db-casos";
import type { Lancamento } from "@/lib/db-financeiro";
import type { Prazo } from "@/lib/db-prazos";
import type { Notificacao } from "@/lib/db-notificacoes";
import {
  FORM_TYPE_LABELS,
  NOTIFICACAO_TIPO_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/lib/admin-labels";
import { formatDate } from "@/lib/format";
import { DashboardAutoRefresh } from "@/components/admin/DashboardAutoRefresh";
import { DateRangeFilter } from "@/components/admin/DateRangeFilter";
import {
  DATE_RANGE_LABELS,
  resolveDateRange,
  type DateRangeValue,
} from "@/lib/date-range";
import { computeOverviewKpis } from "@/lib/overview-kpis";

function formatBRL(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function AdminOverviewClient({
  leads,
  notificacoes,
  contratos,
  clientes,
  casos,
  lancamentos,
  prazos,
  atualizadoEm,
}: {
  leads: Lead[];
  notificacoes: Notificacao[];
  contratos: Contrato[];
  clientes: Cliente[];
  casos: Caso[];
  lancamentos: Lancamento[];
  prazos: Prazo[];
  atualizadoEm: string;
}) {
  const [range, setRange] = useState<DateRangeValue>({ key: "7d", from: null, to: null });

  const kpis = useMemo(
    () =>
      computeOverviewKpis({
        leads,
        contratos,
        clientes,
        casos,
        lancamentos,
        prazos,
        range: resolveDateRange(range),
      }),
    [leads, contratos, clientes, casos, lancamentos, prazos, range],
  );

  const periodoLabel = DATE_RANGE_LABELS[range.key];
  const recentLeads = leads.slice(0, 6);
  const unreadNotificacoes = notificacoes.filter((n) => !n.lida);
  const recentNotificacoes = unreadNotificacoes.slice(0, 4);
  const unreadCount = unreadNotificacoes.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <DashboardAutoRefresh />

      <div className="flex flex-wrap items-start justify-between gap-6 border-b border-hairline pb-6">
        <div>
          <h1 className="text-lg italic text-ink">Visão Geral</h1>
          <p className="font-mono text-xs text-ink-dim">
            Resumo da operação do escritório
          </p>
        </div>

        <DateRangeFilter value={range} onChange={setRange} />

        <div className="w-72 shrink-0 border border-hairline">
          <div className="flex items-center gap-2 border-b border-hairline px-3 py-2">
            <Bell size={13} className="text-gold" />
            <span className="font-eyebrow text-[10px] text-ink-dim">
              Notificações
            </span>
            {unreadCount > 0 && (
              <span className="ml-auto font-mono text-[10px] text-bg bg-gold px-1.5 py-0.5">
                {unreadCount}
              </span>
            )}
          </div>
          {recentNotificacoes.length === 0 && (
            <p className="px-3 py-4 text-center text-xs text-ink-dim">
              Nenhuma notificação ainda.
            </p>
          )}
          {recentNotificacoes.map((n, index) => (
            <div
              key={n.id}
              className={`px-3 py-2 text-xs ${
                index !== recentNotificacoes.length - 1
                  ? "border-b border-hairline"
                  : ""
              }`}
            >
              <p className="truncate text-ink">{n.titulo}</p>
              <p className="mt-0.5 font-mono text-[9px] uppercase text-ink-dim">
                {NOTIFICACAO_TIPO_LABELS[n.tipo]} · {formatDate(n.created_at)}
              </p>
            </div>
          ))}
          <Link
            href="/admin/notificacoes"
            className="block border-t border-hairline px-3 py-2 text-center text-xs text-gold transition-colors duration-150 hover:underline"
          >
            Ver todas →
          </Link>
        </div>
      </div>

      <p className="mt-8 font-eyebrow text-[10px] text-ink-dim">Financeiro</p>
      <div className="mt-2 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="border border-hairline p-5">
          <p className="font-mono text-xl text-gold-bright tabular-nums">
            {formatBRL(kpis.mrr)}
          </p>
          <p className="mt-1 font-eyebrow text-[10px] text-ink-dim">
            MRR (mês corrente)
          </p>
        </div>
        <div className="border border-hairline p-5">
          <p className="font-mono text-xl text-error tabular-nums">
            {formatBRL(kpis.inadimplencia)}
          </p>
          <p className="mt-1 font-eyebrow text-[10px] text-ink-dim">
            Inadimplência
          </p>
          <p className="mt-1 text-xs text-ink-dim">
            {kpis.faturasVencidas} fatura(s) vencida(s)
          </p>
        </div>
        <div className="border border-hairline p-5">
          <p className="font-mono text-xl text-success tabular-nums">
            {formatBRL(kpis.receitaPeriodo)}
          </p>
          <p className="mt-1 font-eyebrow text-[10px] text-ink-dim">
            Receita ({periodoLabel})
          </p>
        </div>
        <div className="border border-hairline p-5">
          <p className="font-mono text-xl text-ink tabular-nums">
            {kpis.slaPercentPeriodo}%
          </p>
          <p className="mt-1 font-eyebrow text-[10px] text-ink-dim">
            SLA cumprido ({periodoLabel})
          </p>
        </div>
      </div>

      <p className="mt-8 font-eyebrow text-[10px] text-ink-dim">Operação</p>
      <div className="mt-2 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="border border-hairline p-5">
          <p className="font-mono text-xl text-ink tabular-nums">
            {kpis.clientesAtivos}
          </p>
          <p className="mt-1 font-eyebrow text-[10px] text-ink-dim">
            Clientes ativos
          </p>
        </div>
        <div className="border border-hairline p-5">
          <p className="font-mono text-xl text-ink tabular-nums">
            {kpis.contratosAtivos}
          </p>
          <p className="mt-1 font-eyebrow text-[10px] text-ink-dim">
            Contratos ativos
          </p>
          <p className="mt-1 text-xs text-ink-dim">
            {kpis.aRenovar30d} a renovar em 30d
          </p>
        </div>
        <div className="border border-hairline p-5">
          <p className="font-mono text-xl text-ink tabular-nums">
            {kpis.casosAbertos}
          </p>
          <p className="mt-1 font-eyebrow text-[10px] text-ink-dim">
            Casos em aberto
          </p>
        </div>
        <div className="border border-hairline p-5">
          <p className="font-mono text-xl text-warning tabular-nums">
            {kpis.prazos30d}
          </p>
          <p className="mt-1 font-eyebrow text-[10px] text-ink-dim">
            Prazos (30D)
          </p>
        </div>
      </div>

      <p className="mt-8 font-eyebrow text-[10px] text-ink-dim">
        Funil ({periodoLabel})
      </p>
      <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="border border-hairline p-5">
          <p className="font-mono text-xl text-ink tabular-nums">
            {kpis.leadsPeriodo}
          </p>
          <p className="mt-1 font-eyebrow text-[10px] text-ink-dim">
            Leads ({periodoLabel})
          </p>
          <p className="mt-1 text-xs text-ink-dim">
            conversões: {kpis.conversoesPeriodo}
          </p>
        </div>
        {kpis.leadsPorAreaPeriodo.map((area) => (
          <div key={area.formType} className="border border-hairline p-5">
            <p className="font-mono text-xl text-ink tabular-nums">
              {area.count}
            </p>
            <p className="mt-1 font-eyebrow text-[10px] text-ink-dim">
              {area.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <span className="font-eyebrow text-[10px] text-ink-dim">
            Leads recentes
          </span>
          <Link
            href="/admin/leads"
            className="text-xs text-gold transition-colors duration-150 hover:underline"
          >
            Ver todos →
          </Link>
        </div>

        <div className="mt-4 border border-hairline">
          {recentLeads.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-ink-dim">
              Nenhum lead cadastrado ainda.
            </p>
          )}
          {recentLeads.map((lead, index) => (
            <div
              key={lead.id}
              className={`flex items-center justify-between gap-4 px-4 py-3 text-sm ${
                index !== recentLeads.length - 1 ? "border-b border-hairline" : ""
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-ink">{lead.name}</p>
                <p className="truncate text-xs text-ink-dim">
                  {FORM_TYPE_LABELS[lead.form_type] ?? lead.form_type}
                </p>
              </div>
              <span
                className={`shrink-0 border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${STATUS_COLORS[lead.status]}`}
              >
                {STATUS_LABELS[lead.status]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-6 font-mono text-[10px] text-ink-dim">
        Indicadores atualizados em {atualizadoEm} · refresh automático a cada
        30min
      </p>
    </div>
  );
}
