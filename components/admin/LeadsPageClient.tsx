"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { Lead } from "@/lib/db-admin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

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

type Aba = "kanban" | "lista";

export function LeadsPageClient({ initialLeads }: { initialLeads: Lead[] }) {
  const [aba, setAba] = useState<Aba>("kanban");

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between border-b border-hairline pb-6">
        <div>
          <h1 className="text-lg italic text-ink">Leads / Contatos</h1>
          <p className="font-mono text-xs text-ink-dim">
            {initialLeads.length} leads no total
          </p>
        </div>
        <div className="flex border border-hairline-strong">
          <button
            type="button"
            onClick={() => setAba("kanban")}
            className={`px-4 py-2 text-sm transition-colors duration-150 ${
              aba === "kanban" ? "bg-gold text-bg" : "text-ink-dim hover:text-gold"
            }`}
          >
            Kanban
          </button>
          <button
            type="button"
            onClick={() => setAba("lista")}
            className={`px-4 py-2 text-sm transition-colors duration-150 ${
              aba === "lista" ? "bg-gold text-bg" : "text-ink-dim hover:text-gold"
            }`}
          >
            Lista
          </button>
        </div>
      </div>

      <div className="mt-6">
        {aba === "kanban" ? (
          <LeadsKanbanBoard initialLeads={initialLeads} />
        ) : (
          <AdminDashboard initialLeads={initialLeads} />
        )}
      </div>
    </div>
  );
}
