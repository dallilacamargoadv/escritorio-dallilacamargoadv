"use client";

import { useState } from "react";
import Link from "next/link";
import type { AtividadeRow } from "@/components/admin/AtividadesAdminList";
import { AtividadesAgenda } from "@/components/admin/AtividadesAgenda";
import { AtividadesKanban } from "@/components/admin/AtividadesKanban";

const QUICK_ADD = [
  { tipo: "audiencia", label: "+ Audiência" },
  { tipo: "reuniao_cliente", label: "+ Reunião com cliente" },
  { tipo: "peca_prazo", label: "+ Prazo de peça" },
] as const;

export function AgendaClient({
  initialAtividades,
}: {
  initialAtividades: AtividadeRow[];
}) {
  const [atividades, setAtividades] = useState(initialAtividades);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <h1 className="text-lg italic text-ink">Agenda</h1>
          <p className="font-mono text-xs text-ink-dim">
            Audiências, reuniões com cliente e prazos de peça — separado das
            demais atividades de propósito.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_ADD.map((item) => (
            <Link
              key={item.tipo}
              href={`/admin/atividades/novo?tipo=${item.tipo}&voltar=agenda`}
              className="border border-hairline-strong px-3 py-1.5 text-xs text-ink-dim transition-colors duration-150 hover:border-gold hover:text-gold"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <span className="font-eyebrow text-[10px] text-ink-dim">Calendário</span>
        <div className="mt-2">
          <AtividadesAgenda atividades={atividades} />
        </div>
      </div>

      <div className="mt-10">
        <span className="font-eyebrow text-[10px] text-ink-dim">Kanban</span>
        <div className="mt-2">
          <AtividadesKanban atividades={atividades} onChange={setAtividades} />
        </div>
      </div>
    </div>
  );
}
