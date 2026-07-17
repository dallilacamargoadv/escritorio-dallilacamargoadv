import { redirect } from "next/navigation";
import Link from "next/link";
import { Bell } from "lucide-react";
import { getAllLeads, type Lead } from "@/lib/db-admin";
import { getAllNotificacoes } from "@/lib/db-notificacoes";
import {
  FORM_TYPE_LABELS,
  NOTIFICACAO_TIPO_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/lib/admin-labels";
import { formatDate } from "@/lib/format";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function computeKpis(leads: Lead[]) {
  const now = Date.now();
  const leadsThisWeek = leads.filter(
    (lead) => now - new Date(lead.created_at).getTime() <= WEEK_MS,
  ).length;
  const awaitingContact = leads.filter((lead) => lead.status === "novo").length;

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

  return { leadsThisWeek, awaitingContact, slaPercent };
}

export default async function AdminOverviewPage() {
  let leads: Lead[];
  let notificacoes;
  try {
    leads = await getAllLeads();
    notificacoes = await getAllNotificacoes();
  } catch {
    redirect("/login");
  }

  const { leadsThisWeek, awaitingContact, slaPercent } = computeKpis(leads);
  const recentLeads = leads.slice(0, 6);
  const recentNotificacoes = notificacoes.slice(0, 4);
  const unreadCount = notificacoes.filter((n) => !n.lida).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
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
              } ${n.lida ? "opacity-60" : ""}`}
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

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="border border-hairline p-5">
          <p className="font-mono text-2xl text-ink tabular-nums">
            {leadsThisWeek}
          </p>
          <p className="mt-1 font-eyebrow text-[10px] text-ink-dim">
            Leads esta semana
          </p>
        </div>
        <div className="border border-hairline p-5">
          <p className="font-mono text-2xl text-ink tabular-nums">
            {awaitingContact}
          </p>
          <p className="mt-1 font-eyebrow text-[10px] text-ink-dim">
            Aguardando contato
          </p>
        </div>
        <div className="border border-hairline p-5">
          <p className="font-mono text-2xl text-ink tabular-nums">
            {slaPercent}%
          </p>
          <p className="mt-1 font-eyebrow text-[10px] text-ink-dim">
            SLA cumprido (2 dias úteis)
          </p>
        </div>
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
    </div>
  );
}
