"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Atividade, AtividadeStatus, AtividadeTipo } from "@/lib/db-atividades";
import {
  ATIVIDADE_STATUS_COLORS,
  ATIVIDADE_STATUS_LABELS,
  ATIVIDADE_TIPO_LABELS,
} from "@/lib/admin-labels";
import { isAtividadeAtrasada, isAtividadeProxima } from "@/lib/atividades-utils";
import { formatDate } from "@/lib/format";
import { DateRangeFilter } from "@/components/admin/DateRangeFilter";
import { resolveDateRange, isWithinRange, type DateRangeValue } from "@/lib/date-range";
import { AtividadesKanban } from "@/components/admin/AtividadesKanban";
import { AtividadesAgenda } from "@/components/admin/AtividadesAgenda";

function formatBRL(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export interface AtividadeRow extends Atividade {
  vinculo: string;
}

export interface CasoAguardandoRow {
  id: string;
  titulo: string;
  clienteNome: string;
}

export interface DespesaVencendoRow {
  id: string;
  descricao: string;
  valor: number;
  vencimento: string;
  vencida: boolean;
}

export function AtividadesAdminList({
  initialAtividades,
  casosAguardandoCliente,
  despesasVencendo,
}: {
  initialAtividades: AtividadeRow[];
  casosAguardandoCliente: CasoAguardandoRow[];
  despesasVencendo: DespesaVencendoRow[];
}) {
  const [atividades, setAtividades] = useState(initialAtividades);
  const [view, setView] = useState<"lista" | "kanban" | "agenda">("lista");
  const [tipoFilter, setTipoFilter] = useState<AtividadeTipo | "all">("all");
  const [statusFilter, setStatusFilter] = useState<AtividadeStatus | "all">("all");
  const [range, setRange] = useState<DateRangeValue>({ key: "all", from: null, to: null });

  async function handleDelete(atividade: AtividadeRow) {
    if (!confirm(`Excluir "${atividade.titulo}"? Essa ação não pode ser desfeita.`)) return;
    setAtividades((prev) => prev.filter((a) => a.id !== atividade.id));
    await fetch(`/api/admin/atividades/${atividade.id}`, { method: "DELETE" });
  }

  const filtered = useMemo(() => {
    const resolved = resolveDateRange(range);
    return atividades.filter((atividade) => {
      if (tipoFilter !== "all" && atividade.tipo !== tipoFilter) return false;
      if (statusFilter !== "all" && atividade.status !== statusFilter) return false;
      if (!isWithinRange(atividade.data, resolved)) return false;
      return true;
    });
  }, [atividades, tipoFilter, statusFilter, range]);

  const pendentes = atividades.filter((a) => a.status === "pendente");
  const atrasadas = pendentes.filter(isAtividadeAtrasada);
  const proximos7Dias = pendentes.filter((a) => isAtividadeProxima(a, 7));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between border-b border-hairline pb-6">
        <div>
          <h1 className="text-lg italic text-ink">Atividades</h1>
          <p className="font-mono text-xs text-ink-dim">
            {pendentes.length} atividades pendentes · {atrasadas.length} atrasadas,{" "}
            {proximos7Dias.length} nos próximos 7 dias
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border border-hairline-strong">
            {(["lista", "kanban", "agenda"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`px-3 py-2 text-xs capitalize transition-colors duration-150 ${
                  view === v
                    ? "bg-gold text-bg"
                    : "border-l border-hairline-strong text-ink-dim first:border-l-0 hover:text-ink"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <Link
            href="/admin/atividades/novo"
            className="border border-gold bg-gold px-4 py-2 text-sm text-bg transition-all duration-150 hover:bg-transparent hover:text-gold"
          >
            Nova atividade
          </Link>
        </div>
      </div>

      {(casosAguardandoCliente.length > 0 || despesasVencendo.length > 0) && (
        <div className="mt-6">
          <p className="font-eyebrow text-[10px] text-ink-dim">Central de atividades</p>
          <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="border border-hairline">
              <p className="border-b border-hairline px-4 py-2.5 font-eyebrow text-[10px] text-ink-dim">
                Clientes aguardando retorno ({casosAguardandoCliente.length})
              </p>
              {casosAguardandoCliente.length === 0 ? (
                <p className="px-4 py-4 text-xs text-ink-dim">Nenhum no momento.</p>
              ) : (
                casosAguardandoCliente.map((caso, index) => (
                  <Link
                    key={caso.id}
                    href={`/admin/casos/${caso.id}`}
                    className={`flex items-center justify-between gap-4 px-4 py-2.5 text-xs transition-colors duration-150 hover:bg-bg-alt ${
                      index !== casosAguardandoCliente.length - 1 ? "border-b border-hairline" : ""
                    }`}
                  >
                    <span className="text-ink">{caso.titulo}</span>
                    <span className="shrink-0 text-ink-dim">{caso.clienteNome}</span>
                  </Link>
                ))
              )}
            </div>

            <div className="border border-hairline">
              <p className="border-b border-hairline px-4 py-2.5 font-eyebrow text-[10px] text-ink-dim">
                Despesas vencendo ({despesasVencendo.length})
              </p>
              {despesasVencendo.length === 0 ? (
                <p className="px-4 py-4 text-xs text-ink-dim">Nenhuma no momento.</p>
              ) : (
                despesasVencendo.map((despesa, index) => (
                  <Link
                    key={despesa.id}
                    href="/admin/financeiro"
                    className={`flex items-center justify-between gap-4 px-4 py-2.5 text-xs transition-colors duration-150 hover:bg-bg-alt ${
                      index !== despesasVencendo.length - 1 ? "border-b border-hairline" : ""
                    }`}
                  >
                    <span className="text-ink">{despesa.descricao}</span>
                    <span className={`shrink-0 font-mono ${despesa.vencida ? "text-error" : "text-warning"}`}>
                      {formatBRL(despesa.valor)} · {formatDate(despesa.vencimento)}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="border border-hairline p-5">
          <p className="font-mono text-2xl text-error tabular-nums">{atrasadas.length}</p>
          <p className="mt-1 font-eyebrow text-[10px] text-ink-dim">Atrasadas</p>
        </div>
        <div className="border border-hairline p-5">
          <p className="font-mono text-2xl text-warning tabular-nums">{proximos7Dias.length}</p>
          <p className="mt-1 font-eyebrow text-[10px] text-ink-dim">Próximas 7 dias</p>
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
        {(Object.keys(ATIVIDADE_TIPO_LABELS) as AtividadeTipo[]).map((tipo) => (
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
            {ATIVIDADE_TIPO_LABELS[tipo]}
          </button>
        ))}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as AtividadeStatus | "all")}
          className="border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink"
        >
          <option value="all">Todos os status</option>
          {(Object.keys(ATIVIDADE_STATUS_LABELS) as AtividadeStatus[]).map((status) => (
            <option key={status} value={status}>
              {ATIVIDADE_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        <DateRangeFilter value={range} onChange={setRange} />
      </div>

      {view === "lista" && (
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
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((atividade) => {
                const atrasada = isAtividadeAtrasada(atividade);
                return (
                  <tr key={atividade.id} className="border-b border-hairline">
                    <td className="px-4 py-3 text-ink">
                      <Link
                        href={`/admin/atividades/${atividade.id}`}
                        className="transition-colors duration-150 hover:text-gold"
                      >
                        {atividade.titulo}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-dim">
                      {ATIVIDADE_TIPO_LABELS[atividade.tipo]}
                    </td>
                    <td className="px-4 py-3 text-ink-dim">{atividade.vinculo}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      <span className={atrasada ? "text-error" : "text-ink-dim"}>
                        {formatDate(atividade.data)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-dim">
                      {atividade.hora ? atividade.hora.slice(0, 5) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${ATIVIDADE_STATUS_COLORS[atividade.status]}`}
                      >
                        {ATIVIDADE_STATUS_LABELS[atividade.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <button
                        type="button"
                        onClick={() => handleDelete(atividade)}
                        className="text-error transition-colors duration-150 hover:underline"
                      >
                        excluir
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-ink-dim">
                    Nenhuma atividade encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {view === "kanban" && (
        <div className="mt-6">
          <AtividadesKanban atividades={atividades} onChange={setAtividades} />
        </div>
      )}

      {view === "agenda" && (
        <div className="mt-6">
          <AtividadesAgenda atividades={atividades} />
        </div>
      )}
    </div>
  );
}
