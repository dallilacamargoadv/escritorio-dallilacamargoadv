"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Contrato, ContratoStatus } from "@/lib/db-contratos";
import {
  CONTRATO_STATUS_COLORS,
  CONTRATO_STATUS_LABELS,
  CONTRATO_TIPO_LABELS,
} from "@/lib/admin-labels";
import { formatDate } from "@/lib/format";

export interface ContratoRow extends Contrato {
  clienteNome: string;
  casosCount: number;
}

export function ContratosAdminList({
  initialContratos,
}: {
  initialContratos: ContratoRow[];
}) {
  const [contratos] = useState(initialContratos);
  const [statusFilter, setStatusFilter] = useState<ContratoStatus | "all">("all");

  const filtered = useMemo(() => {
    if (statusFilter === "all") return contratos;
    return contratos.filter((contrato) => contrato.status === statusFilter);
  }, [contratos, statusFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between border-b border-hairline pb-6">
        <div>
          <h1 className="text-lg italic text-ink">Contratos</h1>
          <p className="font-mono text-xs text-ink-dim">
            {contratos.length} contratos no total
          </p>
        </div>
        <Link
          href="/admin/contratos/novo"
          className="border border-gold bg-gold px-4 py-2 text-sm text-bg transition-all duration-150 hover:bg-transparent hover:text-gold"
        >
          Novo contrato
        </Link>
      </div>

      <div className="mt-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ContratoStatus | "all")}
          className="border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink"
        >
          <option value="all">Todos os status</option>
          {(Object.keys(CONTRATO_STATUS_LABELS) as ContratoStatus[]).map((status) => (
            <option key={status} value={status}>
              {CONTRATO_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-x-auto border border-hairline">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-hairline font-eyebrow text-[10px] text-ink-dim">
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Assinado em</th>
              <th className="px-4 py-3">Casos</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((contrato) => (
              <tr key={contrato.id} className="border-b border-hairline">
                <td className="px-4 py-3 text-ink">
                  <Link
                    href={`/admin/contratos/${contrato.id}`}
                    className="transition-colors duration-150 hover:text-gold"
                  >
                    {contrato.clienteNome}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-dim">
                  {CONTRATO_TIPO_LABELS[contrato.tipo]}
                </td>
                <td className="px-4 py-3 font-mono text-ink-dim tabular-nums">
                  {contrato.valor != null
                    ? contrato.valor.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${CONTRATO_STATUS_COLORS[contrato.status]}`}
                  >
                    {CONTRATO_STATUS_LABELS[contrato.status]}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-ink-dim">
                  {contrato.assinado_em ? formatDate(contrato.assinado_em) : "—"}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-ink-dim tabular-nums">
                  {contrato.casosCount}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-dim">
                  Nenhum contrato encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
