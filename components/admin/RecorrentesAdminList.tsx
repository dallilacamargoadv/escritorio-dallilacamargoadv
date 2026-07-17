"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Contrato, ContratoStatus } from "@/lib/db-contratos";
import { CONTRATO_STATUS_COLORS, CONTRATO_STATUS_LABELS } from "@/lib/admin-labels";
import { formatDate } from "@/lib/format";

export interface RecorrenteRow extends Contrato {
  clienteNome: string;
  casosCount: number;
  proximoVencimento: string | null;
  proximoVencimentoAtrasado: boolean;
}

function formatBRL(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function RecorrentesAdminList({
  initialContratos,
}: {
  initialContratos: RecorrenteRow[];
}) {
  const [contratos] = useState(initialContratos);
  const [statusFilter, setStatusFilter] = useState<ContratoStatus | "all">("all");

  const filtered = useMemo(() => {
    if (statusFilter === "all") return contratos;
    return contratos.filter((contrato) => contrato.status === statusFilter);
  }, [contratos, statusFilter]);

  const ativos = contratos.filter((contrato) => contrato.status === "assinado");
  const aguardando = contratos.filter((contrato) => contrato.status === "enviado");
  const mrrAtivo = ativos.reduce((sum, contrato) => sum + (contrato.valor ?? 0), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between border-b border-hairline pb-6">
        <div>
          <h1 className="text-lg italic text-ink">Recorrentes</h1>
          <p className="font-mono text-xs text-ink-dim">
            {contratos.length} clientes em contrato recorrente · {ativos.length} ativos,{" "}
            {aguardando.length} aguardando assinatura
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="border border-hairline p-5">
          <p className="font-mono text-2xl text-ink tabular-nums">{formatBRL(mrrAtivo)}</p>
          <p className="mt-1 font-eyebrow text-[10px] text-ink-dim">MRR ativo</p>
        </div>
        <div className="border border-hairline p-5">
          <p className="font-mono text-2xl text-ink tabular-nums">{ativos.length}</p>
          <p className="mt-1 font-eyebrow text-[10px] text-ink-dim">Clientes ativos</p>
        </div>
        <div className="border border-hairline p-5">
          <p className="font-mono text-2xl text-warning tabular-nums">{aguardando.length}</p>
          <p className="mt-1 font-eyebrow text-[10px] text-ink-dim">Aguardando assinatura</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          className={`border px-3 py-1.5 text-xs transition-colors duration-150 ${
            statusFilter === "all"
              ? "border-gold bg-gold text-bg"
              : "border-hairline-strong text-ink-dim hover:border-gold hover:text-gold"
          }`}
        >
          Todos os status
        </button>
        {(Object.keys(CONTRATO_STATUS_LABELS) as ContratoStatus[]).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={`border px-3 py-1.5 text-xs transition-colors duration-150 ${
              statusFilter === status
                ? "border-gold bg-gold text-bg"
                : "border-hairline-strong text-ink-dim hover:border-gold hover:text-gold"
            }`}
          >
            {CONTRATO_STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto border border-hairline">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-hairline font-eyebrow text-[10px] text-ink-dim">
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Periodicidade</th>
              <th className="px-4 py-3">Assinado em</th>
              <th className="px-4 py-3">Próximo vencimento</th>
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
                <td className="px-4 py-3">
                  <span
                    className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${CONTRATO_STATUS_COLORS[contrato.status]}`}
                  >
                    {CONTRATO_STATUS_LABELS[contrato.status]}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-ink-dim tabular-nums">
                  {contrato.valor != null ? formatBRL(contrato.valor) : "—"}
                </td>
                <td className="px-4 py-3 text-ink-dim">{contrato.periodicidade ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-xs text-ink-dim">
                  {contrato.assinado_em ? formatDate(contrato.assinado_em) : "—"}
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  {contrato.proximoVencimento ? (
                    <span
                      className={contrato.proximoVencimentoAtrasado ? "text-error" : "text-ink-dim"}
                    >
                      {formatDate(contrato.proximoVencimento)}
                    </span>
                  ) : (
                    <span className="text-ink-dim">—</span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-ink-dim tabular-nums">
                  {contrato.casosCount}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-ink-dim">
                  Nenhum contrato recorrente encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
