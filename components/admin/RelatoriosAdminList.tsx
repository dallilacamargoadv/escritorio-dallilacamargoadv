"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Caso } from "@/lib/db-casos";
import { CASO_STATUS_LABELS, CASO_STATUS_COLORS, FORM_TYPE_LABELS } from "@/lib/admin-labels";
import { AreaFilterPills } from "@/components/admin/AreaFilterPills";

export interface CasoRow extends Caso {
  clienteNome: string;
}

export function RelatoriosAdminList({ initialCasos }: { initialCasos: CasoRow[] }) {
  const [casos] = useState(initialCasos);
  const [areaFilter, setAreaFilter] = useState("all");

  const filtered = useMemo(() => {
    return casos.filter((caso) => areaFilter === "all" || caso.area === areaFilter);
  }, [casos, areaFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="border-b border-hairline pb-6">
        <h1 className="text-lg italic text-ink">Relatórios</h1>
        <p className="font-mono text-xs text-ink-dim">
          Escolha um caso pra gerar o relatório interno ou o do cliente
        </p>
      </div>

      <div className="mt-6">
        <AreaFilterPills value={areaFilter} onChange={setAreaFilter} />
      </div>

      <div className="mt-6 overflow-x-auto border border-hairline">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-hairline font-eyebrow text-[10px] text-ink-dim">
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Área</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Relatórios</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((caso) => (
              <tr key={caso.id} className="border-b border-hairline">
                <td className="px-4 py-3 text-ink">{caso.titulo}</td>
                <td className="px-4 py-3 text-ink-dim">{caso.clienteNome}</td>
                <td className="px-4 py-3 text-ink-dim">
                  {FORM_TYPE_LABELS[caso.area] ?? caso.area}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${CASO_STATUS_COLORS[caso.status]}`}
                  >
                    {CASO_STATUS_LABELS[caso.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <Link
                      href={`/admin/casos/${caso.id}/relatorio`}
                      target="_blank"
                      className="text-xs text-gold transition-colors duration-150 hover:underline"
                    >
                      Interno
                    </Link>
                    <Link
                      href={`/admin/casos/${caso.id}/relatorio-cliente`}
                      target="_blank"
                      className="text-xs text-gold transition-colors duration-150 hover:underline"
                    >
                      Cliente
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-ink-dim">
                  Nenhum caso encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
