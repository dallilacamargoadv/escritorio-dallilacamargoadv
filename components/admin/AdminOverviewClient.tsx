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
import type { LeadFormType } from "@/lib/db-leads";
import {
  FORM_TYPE_LABELS,
  NOTIFICACAO_TIPO_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  CASO_STATUS_LABELS,
  CASO_STATUS_COLORS,
  CONTRATO_TIPO_LABELS,
  CONTRATO_STATUS_LABELS,
  CONTRATO_STATUS_COLORS,
  PRAZO_TIPO_LABELS,
  PRAZO_STATUS_LABELS,
  PRAZO_STATUS_COLORS,
} from "@/lib/admin-labels";
import { formatDate } from "@/lib/format";
import { isLancamentoAtrasado } from "@/lib/financeiro-utils";
import { DashboardAutoRefresh } from "@/components/admin/DashboardAutoRefresh";
import { DateRangeFilter } from "@/components/admin/DateRangeFilter";
import {
  DATE_RANGE_LABELS,
  resolveDateRange,
  type DateRangeValue,
} from "@/lib/date-range";
import { computeOverviewKpis, leadCumpriuSla } from "@/lib/overview-kpis";
import { QuickViewModal, QuickViewRow, QuickViewEmpty } from "@/components/admin/QuickViewModal";
import { LeadDetailModal } from "@/components/admin/LeadDetailModal";
import { FunilDonutChart, OperacaoBarChart, SlaGauge } from "@/components/admin/OverviewCharts";

function formatBRL(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type ModalKey =
  | "mrr"
  | "inadimplencia"
  | "receita"
  | "sla"
  | "clientesAtivos"
  | "contratosAtivos"
  | "casosAbertos"
  | "prazos30d"
  | "leadsPeriodo"
  | "conversoes"
  | { area: LeadFormType };

const OPERACAO_KEYS = ["clientesAtivos", "contratosAtivos", "casosAbertos", "prazos30d"] as const;

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
  const [leadsState, setLeadsState] = useState(leads);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activeModal, setActiveModal] = useState<ModalKey | null>(null);
  const [funilView, setFunilView] = useState<"cards" | "grafico">("cards");
  const [operacaoView, setOperacaoView] = useState<"cards" | "grafico">("cards");

  function handleLeadUpdate(updated: Lead) {
    setLeadsState((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    setSelectedLead(updated);
  }

  const kpis = useMemo(
    () =>
      computeOverviewKpis({
        leads: leadsState,
        contratos,
        clientes,
        casos,
        lancamentos,
        prazos,
        range: resolveDateRange(range),
      }),
    [leadsState, contratos, clientes, casos, lancamentos, prazos, range],
  );

  const clienteNomeById = useMemo(
    () => new Map(clientes.map((c) => [c.id, c.nome_razao_social])),
    [clientes],
  );
  const clienteIdByContrato = useMemo(
    () => new Map(contratos.map((c) => [c.id, c.cliente_id])),
    [contratos],
  );
  function clienteNomeDoCaso(caso: Caso) {
    const clienteId = clienteIdByContrato.get(caso.contrato_id);
    return (clienteId && clienteNomeById.get(clienteId)) ?? "—";
  }

  const periodoLabel = DATE_RANGE_LABELS[range.key];
  const recentLeads = leadsState.slice(0, 6);
  const unreadNotificacoes = notificacoes.filter((n) => !n.lida);
  const recentNotificacoes = unreadNotificacoes.slice(0, 4);
  const unreadCount = unreadNotificacoes.length;

  const operacaoChartData = [
    { key: "clientesAtivos", label: "Clientes ativos", value: kpis.clientesAtivos },
    { key: "contratosAtivos", label: "Contratos ativos", value: kpis.contratosAtivos },
    { key: "casosAbertos", label: "Casos em aberto", value: kpis.casosAbertos },
    { key: "prazos30d", label: "Prazos (30D)", value: kpis.prazos30d },
  ];

  function openLead(lead: Lead) {
    setSelectedLead(lead);
    setActiveModal(null);
  }

  function renderLeadRow(lead: Lead) {
    return (
      <QuickViewRow
        key={lead.id}
        onClick={() => openLead(lead)}
        label={lead.name}
        meta={FORM_TYPE_LABELS[lead.form_type] ?? lead.form_type}
        pill={STATUS_LABELS[lead.status]}
        pillClassName={STATUS_COLORS[lead.status]}
      />
    );
  }

  function renderCasoRow(caso: Caso) {
    return (
      <QuickViewRow
        key={caso.id}
        href={`/admin/casos/${caso.id}`}
        label={caso.titulo}
        meta={clienteNomeDoCaso(caso)}
        pill={CASO_STATUS_LABELS[caso.status]}
        pillClassName={CASO_STATUS_COLORS[caso.status]}
      />
    );
  }

  function renderContratoRow(contrato: Contrato) {
    return (
      <QuickViewRow
        key={contrato.id}
        href={`/admin/contratos/${contrato.id}`}
        label={clienteNomeById.get(contrato.cliente_id) ?? "—"}
        meta={`${CONTRATO_TIPO_LABELS[contrato.tipo]} · ${contrato.valor != null ? formatBRL(contrato.valor) : "—"}`}
        pill={CONTRATO_STATUS_LABELS[contrato.status]}
        pillClassName={CONTRATO_STATUS_COLORS[contrato.status]}
      />
    );
  }

  function renderLancamentoRow(l: Lancamento) {
    const atrasado = isLancamentoAtrasado(l);
    return (
      <QuickViewRow
        key={l.id}
        href={`/admin/financeiro/${l.id}`}
        label={l.descricao}
        meta={`${clienteNomeById.get(l.cliente_id) ?? "—"} · ${formatBRL(l.valor)}`}
        pill={l.status === "pago" ? "Pago" : atrasado ? "Atrasado" : "Pendente"}
        pillClassName={
          l.status === "pago"
            ? "text-success border-success"
            : atrasado
              ? "text-error border-error"
              : "text-gold border-gold"
        }
      />
    );
  }

  function renderPrazoRow(prazo: Prazo) {
    return (
      <QuickViewRow
        key={prazo.id}
        href={`/admin/prazos/${prazo.id}`}
        label={prazo.titulo}
        meta={`${PRAZO_TIPO_LABELS[prazo.tipo]} · ${formatDate(prazo.data)}`}
        pill={PRAZO_STATUS_LABELS[prazo.status]}
        pillClassName={PRAZO_STATUS_COLORS[prazo.status]}
      />
    );
  }

  function renderClienteRow(cliente: Cliente) {
    return (
      <QuickViewRow
        key={cliente.id}
        href={`/admin/clientes/${cliente.id}`}
        label={cliente.nome_razao_social}
        meta={cliente.email}
      />
    );
  }

  function renderModal() {
    if (!activeModal) return null;

    if (typeof activeModal === "object") {
      const area = kpis.leadsPorAreaPeriodo.find((a) => a.formType === activeModal.area);
      if (!area) return null;
      return (
        <QuickViewModal
          title={area.label}
          subtitle={`${area.count} lead(s) no período`}
          footerHref="/admin/leads"
          onClose={() => setActiveModal(null)}
        >
          {area.leads.length === 0 ? (
            <QuickViewEmpty label="Nenhum lead nessa área no período." />
          ) : (
            area.leads.map(renderLeadRow)
          )}
        </QuickViewModal>
      );
    }

    switch (activeModal) {
      case "mrr":
        return (
          <QuickViewModal
            title="MRR — contratos recorrentes"
            subtitle={`${kpis.contratosRecorrentesAtivos.length} contrato(s) ativo(s)`}
            footerHref="/admin/recorrentes"
            onClose={() => setActiveModal(null)}
          >
            {kpis.contratosRecorrentesAtivos.length === 0 ? (
              <QuickViewEmpty label="Nenhum contrato recorrente ativo." />
            ) : (
              kpis.contratosRecorrentesAtivos.map(renderContratoRow)
            )}
          </QuickViewModal>
        );
      case "inadimplencia":
        return (
          <QuickViewModal
            title="Inadimplência"
            subtitle={`${kpis.lancamentosAtrasados.length} fatura(s) vencida(s)`}
            footerHref="/admin/financeiro"
            onClose={() => setActiveModal(null)}
          >
            {kpis.lancamentosAtrasados.length === 0 ? (
              <QuickViewEmpty label="Nenhuma fatura vencida." />
            ) : (
              kpis.lancamentosAtrasados.map(renderLancamentoRow)
            )}
          </QuickViewModal>
        );
      case "receita":
        return (
          <QuickViewModal
            title={`Receita paga (${periodoLabel})`}
            subtitle={`${kpis.receitaPeriodoList.length} lançamento(s)`}
            footerHref="/admin/financeiro"
            onClose={() => setActiveModal(null)}
          >
            {kpis.receitaPeriodoList.length === 0 ? (
              <QuickViewEmpty label="Nenhum pagamento no período." />
            ) : (
              kpis.receitaPeriodoList.map(renderLancamentoRow)
            )}
          </QuickViewModal>
        );
      case "sla":
        return (
          <QuickViewModal
            title={`SLA cumprido (${periodoLabel})`}
            subtitle={`${kpis.leadsPeriodoList.length} lead(s) no período`}
            footerHref="/admin/leads"
            onClose={() => setActiveModal(null)}
          >
            {kpis.leadsPeriodoList.length === 0 ? (
              <QuickViewEmpty label="Nenhum lead no período." />
            ) : (
              kpis.leadsPeriodoList.map((lead) => (
                <QuickViewRow
                  key={lead.id}
                  onClick={() => openLead(lead)}
                  label={lead.name}
                  meta={FORM_TYPE_LABELS[lead.form_type] ?? lead.form_type}
                  pill={leadCumpriuSla(lead) ? "Cumprido" : "Estourado"}
                  pillClassName={
                    leadCumpriuSla(lead) ? "text-success border-success" : "text-error border-error"
                  }
                />
              ))
            )}
          </QuickViewModal>
        );
      case "clientesAtivos":
        return (
          <QuickViewModal
            title="Clientes ativos"
            subtitle={`${kpis.clientesAtivosList.length} cliente(s)`}
            footerHref="/admin/clientes"
            onClose={() => setActiveModal(null)}
          >
            {kpis.clientesAtivosList.length === 0 ? (
              <QuickViewEmpty label="Nenhum cliente ativo." />
            ) : (
              kpis.clientesAtivosList.map(renderClienteRow)
            )}
          </QuickViewModal>
        );
      case "contratosAtivos":
        return (
          <QuickViewModal
            title="Contratos ativos"
            subtitle={`${kpis.contratosAtivosList.length} contrato(s) · ${kpis.aRenovar30d} a renovar em 30d`}
            footerHref="/admin/contratos"
            onClose={() => setActiveModal(null)}
          >
            {kpis.contratosAtivosList.length === 0 ? (
              <QuickViewEmpty label="Nenhum contrato ativo." />
            ) : (
              kpis.contratosAtivosList.map(renderContratoRow)
            )}
          </QuickViewModal>
        );
      case "casosAbertos":
        return (
          <QuickViewModal
            title="Casos em aberto"
            subtitle={`${kpis.casosAbertosList.length} caso(s)`}
            footerHref="/admin/casos"
            onClose={() => setActiveModal(null)}
          >
            {kpis.casosAbertosList.length === 0 ? (
              <QuickViewEmpty label="Nenhum caso em aberto." />
            ) : (
              kpis.casosAbertosList.map(renderCasoRow)
            )}
          </QuickViewModal>
        );
      case "prazos30d":
        return (
          <QuickViewModal
            title="Prazos (30 dias)"
            subtitle={`${kpis.prazos30dList.length} prazo(s) pendente(s)`}
            footerHref="/admin/prazos"
            onClose={() => setActiveModal(null)}
          >
            {kpis.prazos30dList.length === 0 ? (
              <QuickViewEmpty label="Nenhum prazo nos próximos 30 dias." />
            ) : (
              kpis.prazos30dList.map(renderPrazoRow)
            )}
          </QuickViewModal>
        );
      case "leadsPeriodo":
        return (
          <QuickViewModal
            title={`Leads (${periodoLabel})`}
            subtitle={`${kpis.leadsPeriodoList.length} lead(s) · ${kpis.conversoesPeriodo} conversão(ões)`}
            footerHref="/admin/leads"
            onClose={() => setActiveModal(null)}
          >
            {kpis.leadsPeriodoList.length === 0 ? (
              <QuickViewEmpty label="Nenhum lead no período." />
            ) : (
              kpis.leadsPeriodoList.map(renderLeadRow)
            )}
          </QuickViewModal>
        );
      case "conversoes":
        return (
          <QuickViewModal
            title={`Conversões (${periodoLabel})`}
            subtitle={`${kpis.conversoesPeriodoList.length} cliente(s) convertido(s)`}
            footerHref="/admin/clientes"
            onClose={() => setActiveModal(null)}
          >
            {kpis.conversoesPeriodoList.length === 0 ? (
              <QuickViewEmpty label="Nenhuma conversão no período." />
            ) : (
              kpis.conversoesPeriodoList.map(renderClienteRow)
            )}
          </QuickViewModal>
        );
      default:
        return null;
    }
  }

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
        <button
          type="button"
          onClick={() => setActiveModal("mrr")}
          className="border border-hairline p-5 text-left transition-colors duration-150 hover:border-gold"
        >
          <p className="font-mono text-xl text-gold-bright tabular-nums">
            {formatBRL(kpis.mrr)}
          </p>
          <p className="mt-1 font-eyebrow text-[10px] text-ink-dim">
            MRR (mês corrente)
          </p>
        </button>
        <button
          type="button"
          onClick={() => setActiveModal("inadimplencia")}
          className="border border-hairline p-5 text-left transition-colors duration-150 hover:border-gold"
        >
          <p className="font-mono text-xl text-error tabular-nums">
            {formatBRL(kpis.inadimplencia)}
          </p>
          <p className="mt-1 font-eyebrow text-[10px] text-ink-dim">
            Inadimplência
          </p>
          <p className="mt-1 text-xs text-ink-dim">
            {kpis.faturasVencidas} fatura(s) vencida(s)
          </p>
        </button>
        <button
          type="button"
          onClick={() => setActiveModal("receita")}
          className="border border-hairline p-5 text-left transition-colors duration-150 hover:border-gold"
        >
          <p className="font-mono text-xl text-success tabular-nums">
            {formatBRL(kpis.receitaPeriodo)}
          </p>
          <p className="mt-1 font-eyebrow text-[10px] text-ink-dim">
            Receita ({periodoLabel})
          </p>
        </button>
        <button
          type="button"
          onClick={() => setActiveModal("sla")}
          className="border border-hairline p-5 text-left transition-colors duration-150 hover:border-gold"
        >
          <SlaGauge percent={kpis.slaPercentPeriodo} />
          <p className="mt-1 font-eyebrow text-[10px] text-ink-dim">
            SLA cumprido ({periodoLabel})
          </p>
        </button>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <p className="font-eyebrow text-[10px] text-ink-dim">Operação</p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setOperacaoView("cards")}
            className={`border px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-wide transition-colors duration-150 ${
              operacaoView === "cards"
                ? "border-gold bg-gold text-bg"
                : "border-hairline-strong text-ink-dim hover:border-gold hover:text-gold"
            }`}
          >
            Cards
          </button>
          <button
            type="button"
            onClick={() => setOperacaoView("grafico")}
            className={`border px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-wide transition-colors duration-150 ${
              operacaoView === "grafico"
                ? "border-gold bg-gold text-bg"
                : "border-hairline-strong text-ink-dim hover:border-gold hover:text-gold"
            }`}
          >
            Gráfico
          </button>
        </div>
      </div>
      {operacaoView === "cards" ? (
        <div className="mt-2 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {OPERACAO_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveModal(key)}
              className="border border-hairline p-5 text-left transition-colors duration-150 hover:border-gold"
            >
              <p
                className={`font-mono text-xl tabular-nums ${key === "prazos30d" ? "text-warning" : "text-ink"}`}
              >
                {kpis[key]}
              </p>
              <p className="mt-1 font-eyebrow text-[10px] text-ink-dim">
                {key === "clientesAtivos" && "Clientes ativos"}
                {key === "contratosAtivos" && "Contratos ativos"}
                {key === "casosAbertos" && "Casos em aberto"}
                {key === "prazos30d" && "Prazos (30D)"}
              </p>
              {key === "contratosAtivos" && (
                <p className="mt-1 text-xs text-ink-dim">
                  {kpis.aRenovar30d} a renovar em 30d
                </p>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-2">
          <OperacaoBarChart data={operacaoChartData} onBarClick={(key) => setActiveModal(key as ModalKey)} />
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <p className="font-eyebrow text-[10px] text-ink-dim">Funil ({periodoLabel})</p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setFunilView("cards")}
            className={`border px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-wide transition-colors duration-150 ${
              funilView === "cards"
                ? "border-gold bg-gold text-bg"
                : "border-hairline-strong text-ink-dim hover:border-gold hover:text-gold"
            }`}
          >
            Cards
          </button>
          <button
            type="button"
            onClick={() => setFunilView("grafico")}
            className={`border px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-wide transition-colors duration-150 ${
              funilView === "grafico"
                ? "border-gold bg-gold text-bg"
                : "border-hairline-strong text-ink-dim hover:border-gold hover:text-gold"
            }`}
          >
            Gráfico
          </button>
        </div>
      </div>
      {funilView === "cards" ? (
        <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <button
            type="button"
            onClick={() => setActiveModal("leadsPeriodo")}
            className="border border-hairline p-5 text-left transition-colors duration-150 hover:border-gold"
          >
            <p className="font-mono text-xl text-ink tabular-nums">
              {kpis.leadsPeriodo}
            </p>
            <p className="mt-1 font-eyebrow text-[10px] text-ink-dim">
              Leads ({periodoLabel})
            </p>
            <span
              onClick={(e) => {
                e.stopPropagation();
                setActiveModal("conversoes");
              }}
              className="mt-1 block text-xs text-ink-dim hover:text-gold hover:underline"
            >
              conversões: {kpis.conversoesPeriodo}
            </span>
          </button>
          {kpis.leadsPorAreaPeriodo.map((area) => (
            <button
              key={area.formType}
              type="button"
              onClick={() => setActiveModal({ area: area.formType })}
              className="border border-hairline p-5 text-left transition-colors duration-150 hover:border-gold"
            >
              <p className="font-mono text-xl text-ink tabular-nums">
                {area.count}
              </p>
              <p className="mt-1 font-eyebrow text-[10px] text-ink-dim">
                {area.label}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-2">
          <FunilDonutChart
            data={kpis.leadsPorAreaPeriodo}
            onSliceClick={(formType) => setActiveModal({ area: formType })}
          />
        </div>
      )}

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
              onClick={() => openLead(lead)}
              className={`flex cursor-pointer items-center justify-between gap-4 px-4 py-3 text-sm transition-colors duration-150 hover:bg-bg-alt ${
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

      {renderModal()}

      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={handleLeadUpdate}
        />
      )}
    </div>
  );
}
