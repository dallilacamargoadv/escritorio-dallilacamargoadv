import { redirect } from "next/navigation";
import Link from "next/link";
import { Bell } from "lucide-react";
import { getAllLeads, type Lead } from "@/lib/db-admin";
import { getAllNotificacoes } from "@/lib/db-notificacoes";
import { getAllContratos } from "@/lib/db-contratos";
import { getAllClientes } from "@/lib/db-clientes";
import { getAllCasos } from "@/lib/db-casos";
import { getAllLancamentos, type Lancamento } from "@/lib/db-financeiro";
import { getAllPrazos } from "@/lib/db-prazos";
import { isLancamentoAtrasado } from "@/lib/financeiro-utils";
import {
  FORM_TYPE_LABELS,
  NOTIFICACAO_TIPO_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/lib/admin-labels";
import { formatDate } from "@/lib/format";
import { DashboardAutoRefresh } from "@/components/admin/DashboardAutoRefresh";
import type { LeadFormType } from "@/lib/db-leads";
import type { Contrato } from "@/lib/db-contratos";
import type { Cliente } from "@/lib/db-clientes";
import type { Caso } from "@/lib/db-casos";
import type { Prazo } from "@/lib/db-prazos";

const DAY_MS = 24 * 60 * 60 * 1000;

function formatBRL(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function computeLeadKpis(leads: Lead[]) {
  const now = Date.now();
  const leadsThisWeek = leads.filter(
    (lead) => now - new Date(lead.created_at).getTime() <= 7 * DAY_MS,
  ).length;

  const metSla = leads.filter((lead) => {
    if (lead.status === "novo") {
      return !lead.sla_due_at || new Date(lead.sla_due_at).getTime() > now;
    }
    if (!lead.first_contacted_at || !lead.sla_due_at) return true;
    return (
      new Date(lead.first_contacted_at).getTime() <=
      new Date(lead.sla_due_at).getTime()
    );
  }).length;
  const slaPercent =
    leads.length > 0 ? Math.round((metSla / leads.length) * 100) : 100;

  return { leadsThisWeek, slaPercent };
}

function computeOverviewKpis({
  leads,
  contratos,
  clientes,
  casos,
  lancamentos,
  prazos,
}: {
  leads: Lead[];
  contratos: Contrato[];
  clientes: Cliente[];
  casos: Caso[];
  lancamentos: Lancamento[];
  prazos: Prazo[];
}) {
  const now = Date.now();

  // Financeiro
  const mrr = contratos
    .filter((c) => c.tipo === "recorrente" && c.status === "assinado")
    .reduce((sum, c) => sum + (c.valor ?? 0), 0);

  const lancamentosAtrasados = lancamentos.filter(isLancamentoAtrasado);
  const inadimplencia = lancamentosAtrasados.reduce((sum, l) => sum + l.valor, 0);

  const receita30d = lancamentos
    .filter(
      (l) =>
        l.status === "pago" &&
        l.pago_em &&
        now - new Date(l.pago_em).getTime() <= 30 * DAY_MS,
    )
    .reduce((sum, l) => sum + l.valor, 0);

  const leads30d = leads.filter(
    (l) => now - new Date(l.created_at).getTime() <= 30 * DAY_MS,
  );
  const { slaPercent: slaPercent30d } = computeLeadKpis(leads30d);

  // Operação
  const clientesAtivos = new Set(
    contratos.filter((c) => c.status === "assinado").map((c) => c.cliente_id),
  ).size;

  const contratosAtivos = contratos.filter((c) => c.status === "assinado");

  const proximoVencimentoByContrato = new Map<string, Lancamento>();
  for (const l of lancamentos) {
    if (l.status !== "pendente") continue;
    if (!proximoVencimentoByContrato.has(l.contrato_id)) {
      proximoVencimentoByContrato.set(l.contrato_id, l);
    }
  }
  const aRenovar30d = contratosAtivos.filter((c) => {
    if (c.tipo !== "recorrente") return false;
    const proximo = proximoVencimentoByContrato.get(c.id);
    if (!proximo) return false;
    const diff = new Date(proximo.vencimento).getTime() - now;
    return diff >= 0 && diff <= 30 * DAY_MS;
  }).length;

  const casosAbertos = casos.filter((c) =>
    ["aberto", "em_andamento", "aguardando_cliente"].includes(c.status),
  ).length;

  const prazos30d = prazos.filter(
    (p) => p.status === "pendente" && new Date(p.data).getTime() <= now + 30 * DAY_MS,
  ).length;

  // Funil (7 dias)
  const leads7d = leads.filter(
    (l) => now - new Date(l.created_at).getTime() <= 7 * DAY_MS,
  );
  const leadsPorArea7d = Object.keys(FORM_TYPE_LABELS).map((formType) => ({
    formType: formType as LeadFormType,
    label: FORM_TYPE_LABELS[formType],
    count: leads7d.filter((l) => l.form_type === formType).length,
  }));

  const conversoes30d = clientes.filter(
    (c) => c.lead_id && now - new Date(c.created_at).getTime() <= 30 * DAY_MS,
  ).length;

  return {
    mrr,
    inadimplencia,
    faturasVencidas: lancamentosAtrasados.length,
    receita30d,
    slaPercent30d,
    clientesAtivos,
    contratosAtivos: contratosAtivos.length,
    aRenovar30d,
    casosAbertos,
    prazos30d,
    leads7d: leads7d.length,
    conversoes30d,
    leadsPorArea7d,
  };
}

export default async function AdminOverviewPage() {
  let leads: Lead[];
  let notificacoes;
  let contratos;
  let clientes;
  let casos;
  let lancamentos;
  let prazos;
  try {
    [leads, notificacoes, contratos, clientes, casos, lancamentos, prazos] =
      await Promise.all([
        getAllLeads(),
        getAllNotificacoes(),
        getAllContratos(),
        getAllClientes(),
        getAllCasos(),
        getAllLancamentos(),
        getAllPrazos(),
      ]);
  } catch {
    redirect("/login");
  }

  const kpis = computeOverviewKpis({
    leads,
    contratos,
    clientes,
    casos,
    lancamentos,
    prazos,
  });
  const recentLeads = leads.slice(0, 6);
  const unreadNotificacoes = notificacoes.filter((n) => !n.lida);
  const recentNotificacoes = unreadNotificacoes.slice(0, 4);
  const unreadCount = unreadNotificacoes.length;

  const atualizadoEm = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Belem",
  }).format(new Date());

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <DashboardAutoRefresh />

      <div className="flex items-start justify-between gap-6 border-b border-hairline pb-6">
        <div>
          <h1 className="text-lg italic text-ink">Visão Geral</h1>
          <p className="font-mono text-xs text-ink-dim">
            Resumo da operação do escritório
          </p>
        </div>

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
            {formatBRL(kpis.receita30d)}
          </p>
          <p className="mt-1 font-eyebrow text-[10px] text-ink-dim">
            Receita (30D)
          </p>
        </div>
        <div className="border border-hairline p-5">
          <p className="font-mono text-xl text-ink tabular-nums">
            {kpis.slaPercent30d}%
          </p>
          <p className="mt-1 font-eyebrow text-[10px] text-ink-dim">
            SLA cumprido (30D)
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
        Funil (últimos 7 dias)
      </p>
      <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="border border-hairline p-5">
          <p className="font-mono text-xl text-ink tabular-nums">
            {kpis.leads7d}
          </p>
          <p className="mt-1 font-eyebrow text-[10px] text-ink-dim">
            Leads (7D)
          </p>
          <p className="mt-1 text-xs text-ink-dim">
            conversões 30d: {kpis.conversoes30d}
          </p>
        </div>
        {kpis.leadsPorArea7d.map((area) => (
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
