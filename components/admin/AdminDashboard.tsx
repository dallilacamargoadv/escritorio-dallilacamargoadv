"use client";

import { useMemo, useState } from "react";
import { Monitor } from "lucide-react";
import type { Lead, LeadStatus } from "@/lib/db-admin";
import { FORM_TYPE_LABELS, STATUS_COLORS, STATUS_LABELS } from "@/lib/admin-labels";
import { LeadDetailModal } from "@/components/admin/LeadDetailModal";
import { LeadCharts } from "@/components/admin/LeadCharts";

const PAGE_SIZE = 30;

type SlaState = "critical" | "warning" | null;

function getSlaState(lead: Lead): SlaState {
  if (lead.status !== "leads" || !lead.sla_due_at) return null;
  const due = new Date(lead.sla_due_at).getTime();
  const now = Date.now();
  if (now > due) return "critical";
  if (due - now < 24 * 60 * 60 * 1000) return "warning";
  return null;
}

type SortKey = "created_at" | "name" | "email" | "form_type";

export function AdminDashboard({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [search, setSearch] = useState("");
  const [formTypeFilter, setFormTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [utmSourceFilter, setUtmSourceFilter] = useState("");
  const [utmMediumFilter, setUtmMediumFilter] = useState("");
  const [utmCampaignFilter, setUtmCampaignFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  function handleLeadUpdate(updated: Lead) {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    setSelectedLead(updated);
  }

  const filtered = useMemo(() => {
    let result = leads;

    if (formTypeFilter !== "all") {
      result = result.filter((lead) => lead.form_type === formTypeFilter);
    }
    if (statusFilter !== "all") {
      result = result.filter((lead) => lead.status === statusFilter);
    }
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      result = result.filter(
        (lead) =>
          lead.name?.toLowerCase().includes(term) ||
          lead.email?.toLowerCase().includes(term) ||
          lead.whatsapp?.toLowerCase().includes(term),
      );
    }
    if (utmSourceFilter.trim()) {
      result = result.filter((lead) =>
        (lead.utms?.utm_source ?? "")
          .toLowerCase()
          .includes(utmSourceFilter.toLowerCase()),
      );
    }
    if (utmMediumFilter.trim()) {
      result = result.filter((lead) =>
        (lead.utms?.utm_medium ?? "")
          .toLowerCase()
          .includes(utmMediumFilter.toLowerCase()),
      );
    }
    if (utmCampaignFilter.trim()) {
      result = result.filter((lead) =>
        (lead.utms?.utm_campaign ?? "")
          .toLowerCase()
          .includes(utmCampaignFilter.toLowerCase()),
      );
    }

    const sorted = [...result].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const aVal = a[sortKey] ?? "";
      const bVal = b[sortKey] ?? "";
      return aVal > bVal ? dir : aVal < bVal ? -dir : 0;
    });

    return sorted;
  }, [
    leads,
    search,
    formTypeFilter,
    statusFilter,
    utmSourceFilter,
    utmMediumFilter,
    utmCampaignFilter,
    sortKey,
    sortDir,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageLeads = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(0);
  }

  return (
    <div>
      <p className="font-mono text-xs text-ink-dim">
        {filtered.length} nesta visualização
      </p>

      <div>
        <LeadCharts leads={filtered} />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar por nome, e-mail ou WhatsApp"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="min-w-[240px] flex-1 border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
        />
        <select
          value={formTypeFilter}
          onChange={(e) => {
            setFormTypeFilter(e.target.value);
            setPage(0);
          }}
          className="border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink"
        >
          <option value="all">Todas as áreas</option>
          {Object.entries(FORM_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          className="border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink"
        >
          <option value="all">Todos os status</option>
          {(Object.keys(STATUS_LABELS) as LeadStatus[]).map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="UTM source"
          value={utmSourceFilter}
          onChange={(e) => {
            setUtmSourceFilter(e.target.value);
            setPage(0);
          }}
          className="w-32 border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
        />
        <input
          type="text"
          placeholder="UTM medium"
          value={utmMediumFilter}
          onChange={(e) => {
            setUtmMediumFilter(e.target.value);
            setPage(0);
          }}
          className="w-32 border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
        />
        <input
          type="text"
          placeholder="UTM campaign"
          value={utmCampaignFilter}
          onChange={(e) => {
            setUtmCampaignFilter(e.target.value);
            setPage(0);
          }}
          className="w-32 border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
        />
        <a
          href="/api/admin/leads/export?format=csv"
          className="border border-gold bg-gold px-4 py-2 text-sm text-bg transition-all duration-150 hover:bg-transparent hover:text-gold"
        >
          Exportar CSV
        </a>
        <a
          href="/api/admin/leads/export?format=xlsx"
          className="border border-gold bg-gold px-4 py-2 text-sm text-bg transition-all duration-150 hover:bg-transparent hover:text-gold"
        >
          Exportar XLSX
        </a>
      </div>

      <div className="mt-6 overflow-x-auto border border-hairline">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-hairline font-eyebrow text-[10px] text-ink-dim">
              <th className="cursor-pointer px-4 py-3" onClick={() => toggleSort("name")}>
                Nome
              </th>
              <th className="cursor-pointer px-4 py-3" onClick={() => toggleSort("email")}>
                E-mail
              </th>
              <th className="px-4 py-3">WhatsApp</th>
              <th
                className="cursor-pointer px-4 py-3"
                onClick={() => toggleSort("form_type")}
              >
                Área
              </th>
              <th className="px-4 py-3">Status</th>
              <th
                className="cursor-pointer px-4 py-3"
                onClick={() => toggleSort("created_at")}
              >
                Criado em
              </th>
              <th className="px-4 py-3">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {pageLeads.map((lead) => {
              const sla = getSlaState(lead);
              return (
                <tr key={lead.id} className="border-b border-hairline">
                  <td className="px-4 py-3 text-ink">{lead.name}</td>
                  <td className="px-4 py-3 text-ink-dim">{lead.email}</td>
                  <td className="px-4 py-3 text-ink-dim">{lead.whatsapp}</td>
                  <td className="px-4 py-3 text-ink-dim">
                    {FORM_TYPE_LABELS[lead.form_type] ?? lead.form_type}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${STATUS_COLORS[lead.status]}`}
                      >
                        {STATUS_LABELS[lead.status]}
                      </span>
                      {sla === "critical" && (
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full bg-error"
                          title="SLA de 2 dias úteis vencido"
                        />
                      )}
                      {sla === "warning" && (
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full bg-warning"
                          title="SLA de 2 dias úteis vencendo"
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-dim">
                    {new Date(lead.created_at).toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      aria-label="Ver inteligência técnica"
                      onClick={() => setSelectedLead(lead)}
                      className="text-ink-dim transition-colors duration-150 hover:text-gold"
                    >
                      <Monitor size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {pageLeads.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm text-ink-dim"
                >
                  Nenhum lead encontrado com os filtros atuais.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from({ length: totalPages }, (_, i) => i).map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i)}
              className={`border px-3 py-1.5 text-xs transition-colors duration-150 ${
                i === page
                  ? "border-gold text-gold"
                  : "border-hairline text-ink-dim hover:border-gold/50"
              }`}
            >
              {i * PAGE_SIZE + 1}-{Math.min((i + 1) * PAGE_SIZE, filtered.length)}
            </button>
          ))}
        </div>
      )}

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
