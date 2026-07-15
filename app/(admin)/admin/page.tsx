import { redirect } from "next/navigation";
import Link from "next/link";
import { getAllLeads, type Lead } from "@/lib/db-admin";
import { FORM_TYPE_LABELS, STATUS_COLORS, STATUS_LABELS } from "@/lib/admin-labels";

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
  try {
    leads = await getAllLeads();
  } catch {
    redirect("/login");
  }

  const { leadsThisWeek, awaitingContact, slaPercent } = computeKpis(leads);
  const recentLeads = leads.slice(0, 6);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="border-b border-hairline pb-6">
        <h1 className="text-lg italic text-ink">Visão Geral</h1>
        <p className="font-mono text-xs text-ink-dim">
          Resumo da operação do escritório
        </p>
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
