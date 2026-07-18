"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Lancamento } from "@/lib/db-financeiro";
import { isLancamentoAtrasado as isAtrasado } from "@/lib/financeiro-utils";
import { formatDate } from "@/lib/format";
import { DateRangeFilter } from "@/components/admin/DateRangeFilter";
import { resolveDateRange, isWithinRange, type DateRangeValue } from "@/lib/date-range";

export interface LancamentoRow extends Lancamento {
  clienteNome: string;
}

type StatusFiltro = "all" | "pendente" | "atrasado" | "pago";

function formatBRL(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function FinanceiroAdminList({
  initialLancamentos,
}: {
  initialLancamentos: LancamentoRow[];
}) {
  const [lancamentos] = useState(initialLancamentos);
  const [statusFilter, setStatusFilter] = useState<StatusFiltro>("all");
  const [range, setRange] = useState<DateRangeValue>({ key: "all", from: null, to: null });

  const filtered = useMemo(() => {
    const resolved = resolveDateRange(range);
    return lancamentos.filter((l) => {
      if (!isWithinRange(l.vencimento, resolved)) return false;
      if (statusFilter === "all") return true;
      if (statusFilter === "atrasado") return isAtrasado(l);
      if (statusFilter === "pendente") return l.status === "pendente" && !isAtrasado(l);
      return l.status === "pago";
    });
  }, [lancamentos, statusFilter, range]);

  const totalPendente = lancamentos
    .filter((l) => l.status === "pendente")
    .reduce((sum, l) => sum + l.valor, 0);
  const totalAtrasado = lancamentos.filter(isAtrasado).reduce((sum, l) => sum + l.valor, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between border-b border-hairline pb-6">
        <div>
          <h1 className="text-lg italic text-ink">Financeiro</h1>
          <p className="font-mono text-xs text-ink-dim">
            {lancamentos.length} lançamentos no total
          </p>
        </div>
        <Link
          href="/admin/financeiro/novo"
          className="border border-gold bg-gold px-4 py-2 text-sm text-bg transition-all duration-150 hover:bg-transparent hover:text-gold"
        >
          Novo lançamento
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="border border-hairline p-5">
          <p className="font-mono text-2xl text-ink tabular-nums">
            {formatBRL(totalPendente)}
          </p>
          <p className="mt-1 font-eyebrow text-[10px] text-ink-dim">
            Total a receber
          </p>
        </div>
        <div className="border border-hairline p-5">
          <p className="font-mono text-2xl text-error tabular-nums">
            {formatBRL(totalAtrasado)}
          </p>
          <p className="mt-1 font-eyebrow text-[10px] text-ink-dim">
            Total vencido
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            ["all", "Todos"],
            ["pendente", "Pendente"],
            ["atrasado", "Atrasado"],
            ["pago", "Pago"],
          ] as [StatusFiltro, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatusFilter(value)}
            className={`border px-3 py-1.5 text-xs transition-colors duration-150 ${
              statusFilter === value
                ? "border-gold bg-gold text-bg"
                : "border-hairline-strong text-ink-dim hover:border-gold hover:text-gold"
            }`}
          >
            {label}
          </button>
        ))}
        <DateRangeFilter value={range} onChange={setRange} />
      </div>

      <div className="mt-6 overflow-x-auto border border-hairline">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-hairline font-eyebrow text-[10px] text-ink-dim">
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Vencimento</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => {
              const atrasado = isAtrasado(l);
              return (
                <tr key={l.id} className="border-b border-hairline">
                  <td className="px-4 py-3 text-ink">
                    <Link
                      href={`/admin/financeiro/${l.id}`}
                      className="transition-colors duration-150 hover:text-gold"
                    >
                      {l.descricao}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-dim">{l.clienteNome}</td>
                  <td className="px-4 py-3 font-mono text-ink-dim tabular-nums">
                    {formatBRL(l.valor)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-dim">
                    {formatDate(l.vencimento)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${
                        l.status === "pago"
                          ? "text-success border-success"
                          : atrasado
                            ? "text-error border-error"
                            : "text-gold border-gold"
                      }`}
                    >
                      {l.status === "pago" ? "Pago" : atrasado ? "Atrasado" : "Pendente"}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-ink-dim">
                  Nenhum lançamento encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
