"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Prazo, PrazoStatus, PrazoTipo } from "@/lib/db-prazos";
import { PRAZO_STATUS_COLORS, PRAZO_STATUS_LABELS, PRAZO_TIPO_LABELS } from "@/lib/admin-labels";
import { isPrazoAtrasado, isPrazoProximo } from "@/lib/prazos-utils";
import { formatDate } from "@/lib/format";
import { DateRangeFilter } from "@/components/admin/DateRangeFilter";
import { resolveDateRange, isWithinRange, type DateRangeValue } from "@/lib/date-range";

export interface PrazoRow extends Prazo {
  vinculo: string;
}

export function PrazosAdminList({ initialPrazos }: { initialPrazos: PrazoRow[] }) {
  const [prazos] = useState(initialPrazos);
  const [tipoFilter, setTipoFilter] = useState<PrazoTipo | "all">("all");
  const [statusFilter, setStatusFilter] = useState<PrazoStatus | "all">("all");
  const [range, setRange] = useState<DateRangeValue>({ key: "all", from: null, to: null });

  const filtered = useMemo(() => {
    const resolved = resolveDateRange(range);
    return prazos.filter((prazo) => {
      if (tipoFilter !== "all" && prazo.tipo !== tipoFilter) return false;
      if (statusFilter !== "all" && prazo.status !== statusFilter) return false;
      if (!isWithinRange(prazo.data, resolved)) return false;
      return true;
    });
  }, [prazos, tipoFilter, statusFilter, range]);

  const pendentes = prazos.filter((p) => p.status === "pendente");
  const atrasados = pendentes.filter(isPrazoAtrasado);
  const proximos7Dias = pendentes.filter((p) => isPrazoProximo(p, 7));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between border-b border-hairline pb-6">
        <div>
          <h1 className="text-lg italic text-ink">Prazos</h1>
          <p className="font-mono text-xs text-ink-dim">
            {pendentes.length} prazos pendentes · {atrasados.length} atrasados,{" "}
            {proximos7Dias.length} nos próximos 7 dias
          </p>
        </div>
        <Link
          href="/admin/prazos/novo"
          className="border border-gold bg-gold px-4 py-2 text-sm text-bg transition-all duration-150 hover:bg-transparent hover:text-gold"
        >
          Novo prazo
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="border border-hairline p-5">
          <p className="font-mono text-2xl text-error tabular-nums">{atrasados.length}</p>
          <p className="mt-1 font-eyebrow text-[10px] text-ink-dim">Atrasados</p>
        </div>
        <div className="border border-hairline p-5">
          <p className="font-mono text-2xl text-warning tabular-nums">{proximos7Dias.length}</p>
          <p className="mt-1 font-eyebrow text-[10px] text-ink-dim">Próximos 7 dias</p>
        </div>
        <div className="border border-hairline p-5">
          <p className="font-mono text-2xl text-ink tabular-nums">{pendentes.length}</p>
          <p className="mt-1 font-eyebrow text-[10px] text-ink-dim">Pendentes no total</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setTipoFilter("all")}
          className={`border px-3 py-1.5 text-xs transition-colors duration-150 ${
            tipoFilter === "all"
              ? "border-gold bg-gold text-bg"
              : "border-hairline-strong text-ink-dim hover:border-gold hover:text-gold"
          }`}
        >
          Todos os tipos
        </button>
        {(Object.keys(PRAZO_TIPO_LABELS) as PrazoTipo[]).map((tipo) => (
          <button
            key={tipo}
            type="button"
            onClick={() => setTipoFilter(tipo)}
            className={`border px-3 py-1.5 text-xs transition-colors duration-150 ${
              tipoFilter === tipo
                ? "border-gold bg-gold text-bg"
                : "border-hairline-strong text-ink-dim hover:border-gold hover:text-gold"
            }`}
          >
            {PRAZO_TIPO_LABELS[tipo]}
          </button>
        ))}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PrazoStatus | "all")}
          className="border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink"
        >
          <option value="all">Todos os status</option>
          {(Object.keys(PRAZO_STATUS_LABELS) as PrazoStatus[]).map((status) => (
            <option key={status} value={status}>
              {PRAZO_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        <DateRangeFilter value={range} onChange={setRange} />
      </div>

      <div className="mt-6 overflow-x-auto border border-hairline">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-hairline font-eyebrow text-[10px] text-ink-dim">
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Vinculado a</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Hora</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((prazo) => {
              const atrasado = isPrazoAtrasado(prazo);
              return (
                <tr key={prazo.id} className="border-b border-hairline">
                  <td className="px-4 py-3 text-ink">
                    <Link
                      href={`/admin/prazos/${prazo.id}`}
                      className="transition-colors duration-150 hover:text-gold"
                    >
                      {prazo.titulo}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-dim">{PRAZO_TIPO_LABELS[prazo.tipo]}</td>
                  <td className="px-4 py-3 text-ink-dim">{prazo.vinculo}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    <span className={atrasado ? "text-error" : "text-ink-dim"}>
                      {formatDate(prazo.data)}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-dim">
                    {prazo.hora ? prazo.hora.slice(0, 5) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${PRAZO_STATUS_COLORS[prazo.status]}`}
                    >
                      {PRAZO_STATUS_LABELS[prazo.status]}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-dim">
                  Nenhum prazo encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
