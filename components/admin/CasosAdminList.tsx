"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Caso, CasoStatus } from "@/lib/db-casos";
import { CASO_STATUS_LABELS, CASO_STATUS_COLORS, FORM_TYPE_LABELS } from "@/lib/admin-labels";
import { formatDate } from "@/lib/format";
import { AreaFilterPills } from "@/components/admin/AreaFilterPills";
import { DateRangeFilter } from "@/components/admin/DateRangeFilter";
import { resolveDateRange, isWithinRange, type DateRangeValue } from "@/lib/date-range";

export interface CasoRow extends Caso {
  clienteNome: string;
}

export function CasosAdminList({
  initialCasos,
  initialArea = "all",
}: {
  initialCasos: CasoRow[];
  initialArea?: string;
}) {
  const [casos] = useState(initialCasos);
  const [statusFilter, setStatusFilter] = useState<CasoStatus | "all">("all");
  const [areaFilter, setAreaFilter] = useState(initialArea);
  const [range, setRange] = useState<DateRangeValue>({ key: "all", from: null, to: null });

  const filtered = useMemo(() => {
    const resolved = resolveDateRange(range);
    return casos.filter((caso) => {
      if (statusFilter !== "all" && caso.status !== statusFilter) return false;
      if (areaFilter !== "all" && caso.area !== areaFilter) return false;
      if (!isWithinRange(caso.aberto_em, resolved)) return false;
      return true;
    });
  }, [casos, statusFilter, areaFilter, range]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between border-b border-hairline pb-6">
        <div>
          <h1 className="text-lg italic text-ink">Casos</h1>
          <p className="font-mono text-xs text-ink-dim">
            {casos.length} casos no total
          </p>
        </div>
        <Link
          href="/admin/casos/novo"
          className="border border-gold bg-gold px-4 py-2 text-sm text-bg transition-all duration-150 hover:bg-transparent hover:text-gold"
        >
          Novo caso
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        <AreaFilterPills value={areaFilter} onChange={setAreaFilter} />
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CasoStatus | "all")}
            className="border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink"
          >
            <option value="all">Todos os status</option>
            {(Object.keys(CASO_STATUS_LABELS) as CasoStatus[]).map((status) => (
              <option key={status} value={status}>
                {CASO_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <DateRangeFilter value={range} onChange={setRange} />
        </div>
      </div>

      <div className="mt-6 overflow-x-auto border border-hairline">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-hairline font-eyebrow text-[10px] text-ink-dim">
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Área</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Aberto em</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((caso) => (
              <tr key={caso.id} className="border-b border-hairline">
                <td className="px-4 py-3 text-ink">
                  <Link
                    href={`/admin/casos/${caso.id}`}
                    className="transition-colors duration-150 hover:text-gold"
                  >
                    {caso.titulo}
                  </Link>
                </td>
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
                <td className="px-4 py-3 font-mono text-xs text-ink-dim">
                  {formatDate(caso.aberto_em)}
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
