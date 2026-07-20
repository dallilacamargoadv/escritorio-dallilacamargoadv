"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { Lead } from "@/lib/db-admin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { DateRangeFilter } from "@/components/admin/DateRangeFilter";
import { resolveDateRange, isWithinRange, type DateRangeValue } from "@/lib/date-range";

// ssr: false de propósito — @dnd-kit gera ids internos de acessibilidade
// (aria-describedby) a partir de um contador que diverge entre o processo
// de servidor e o cliente, causando warning de hydration mismatch inofensivo
// mas evitável ao só montar o board no cliente.
const LeadsKanbanBoard = dynamic(
  () =>
    import("@/components/admin/LeadsKanbanBoard").then(
      (mod) => mod.LeadsKanbanBoard,
    ),
  { ssr: false },
);

const OutrosCanaisKanbanBoard = dynamic(
  () =>
    import("@/components/admin/OutrosCanaisKanbanBoard").then(
      (mod) => mod.OutrosCanaisKanbanBoard,
    ),
  { ssr: false },
);

type Aba = "kanban" | "outros" | "lista";

export function LeadsPageClient({ initialLeads }: { initialLeads: Lead[] }) {
  const [aba, setAba] = useState<Aba>("kanban");
  const [range, setRange] = useState<DateRangeValue>({ key: "all", from: null, to: null });

  const leads = useMemo(() => {
    const resolved = resolveDateRange(range);
    return initialLeads.filter((lead) => isWithinRange(lead.created_at, resolved));
  }, [initialLeads, range]);

  const leadsSite = useMemo(() => leads.filter((l) => l.origem === "site"), [leads]);
  const leadsOutrosCanais = useMemo(
    () => leads.filter((l) => l.origem !== "site"),
    [leads],
  );

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <h1 className="text-lg italic text-ink">Leads / Contatos</h1>
          <p className="font-mono text-xs text-ink-dim">
            {leads.length} lead(s) no período
          </p>
        </div>
        <DateRangeFilter value={range} onChange={setRange} />
        <div className="flex border border-hairline-strong">
          <button
            type="button"
            onClick={() => setAba("kanban")}
            className={`px-4 py-2 text-sm transition-colors duration-150 ${
              aba === "kanban" ? "bg-gold text-bg" : "text-ink-dim hover:text-gold"
            }`}
          >
            Kanban (Site)
          </button>
          <button
            type="button"
            onClick={() => setAba("outros")}
            className={`border-l border-hairline-strong px-4 py-2 text-sm transition-colors duration-150 ${
              aba === "outros" ? "bg-gold text-bg" : "text-ink-dim hover:text-gold"
            }`}
          >
            Outros canais
          </button>
          <button
            type="button"
            onClick={() => setAba("lista")}
            className={`border-l border-hairline-strong px-4 py-2 text-sm transition-colors duration-150 ${
              aba === "lista" ? "bg-gold text-bg" : "text-ink-dim hover:text-gold"
            }`}
          >
            Lista
          </button>
        </div>
      </div>

      <div className="mt-6">
        {aba === "kanban" && <LeadsKanbanBoard initialLeads={leadsSite} />}
        {aba === "outros" && <OutrosCanaisKanbanBoard initialLeads={leadsOutrosCanais} />}
        {aba === "lista" && <AdminDashboard initialLeads={leads} />}
      </div>
    </div>
  );
}
