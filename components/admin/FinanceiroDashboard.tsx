"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { LancamentoRow } from "@/lib/db-financeiro";
import type { Despesa } from "@/lib/db-despesas";
import { isLancamentoAtrasado, isDespesaVencida } from "@/lib/financeiro-utils";
import { computeFinanceiroAlertas, computeFinanceiroCards } from "@/lib/financeiro-fase1";
import { formatDate } from "@/lib/format";
import {
  CATEGORIA_DESPESA_LABELS,
  CATEGORIAS_DESPESA,
  type CategoriaDespesaKey,
} from "@/lib/despesas-categorias";
import { DESPESA_RECORRENCIA_LABELS } from "@/lib/admin-labels";
import { DateRangeFilter } from "@/components/admin/DateRangeFilter";
import { resolveDateRange, isWithinRange, type DateRangeValue } from "@/lib/date-range";
import { FinanceiroSummaryCards } from "@/components/admin/FinanceiroSummaryCards";
import { RevenueExpenseRatio } from "@/components/admin/RevenueExpenseRatio";
import { FinanceiroAlerts } from "@/components/admin/FinanceiroAlerts";
import { DespesaModal } from "@/components/admin/DespesaModal";
import { NovoLancamentoChoiceModal } from "@/components/admin/NovoLancamentoChoiceModal";

function formatBRL(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type TipoFiltro = "all" | "receita" | "despesa";
type StatusFiltro = "all" | "aberto" | "atrasado" | "pago" | "cancelado";

interface RowReceita {
  tipo: "receita";
  id: string;
  data: string;
  categoriaLabel: string;
  descricao: string;
  contraparte: string;
  statusLabel: string;
  statusClass: string;
  valor: number;
  recorrenciaLabel: string;
  item: LancamentoRow;
}

interface RowDespesa {
  tipo: "despesa";
  id: string;
  data: string;
  categoriaLabel: string;
  descricao: string;
  contraparte: string;
  statusLabel: string;
  statusClass: string;
  valor: number;
  recorrenciaLabel: string;
  item: Despesa;
}

type FinanceiroRow = RowReceita | RowDespesa;

function receitaToRow(l: LancamentoRow): RowReceita {
  const atrasado = isLancamentoAtrasado(l);
  return {
    tipo: "receita",
    id: l.id,
    data: l.vencimento,
    categoriaLabel: "—",
    descricao: l.descricao,
    contraparte: l.clienteNome,
    statusLabel: l.status === "pago" ? "Pago" : l.status === "cancelado" ? "Cancelado" : atrasado ? "Atrasado" : "Pendente",
    statusClass:
      l.status === "pago"
        ? "text-success border-success"
        : l.status === "cancelado"
          ? "text-ink-dim border-hairline-strong"
          : atrasado
            ? "text-error border-error"
            : "text-gold border-gold",
    valor: l.valor,
    recorrenciaLabel: "—",
    item: l,
  };
}

function despesaToRow(d: Despesa): RowDespesa {
  const vencida = isDespesaVencida(d);
  return {
    tipo: "despesa",
    id: d.id,
    data: d.vencimento,
    categoriaLabel: `${CATEGORIA_DESPESA_LABELS[d.categoria as CategoriaDespesaKey] ?? d.categoria}${d.subcategoria ? ` · ${d.subcategoria}` : ""}`,
    descricao: d.descricao,
    contraparte: d.fornecedor ?? "—",
    statusLabel: d.status === "pago" ? "Pago" : d.status === "cancelado" ? "Cancelado" : vencida ? "Vencido" : "A pagar",
    statusClass:
      d.status === "pago"
        ? "text-success border-success"
        : d.status === "cancelado"
          ? "text-ink-dim border-hairline-strong"
          : vencida
            ? "text-error border-error"
            : "text-gold border-gold",
    valor: d.valor,
    recorrenciaLabel: DESPESA_RECORRENCIA_LABELS[d.recorrencia],
    item: d,
  };
}

export function FinanceiroDashboard({
  initialLancamentos,
  initialDespesas,
}: {
  initialLancamentos: LancamentoRow[];
  initialDespesas: Despesa[];
}) {
  const [lancamentos] = useState(initialLancamentos);
  const [despesas, setDespesas] = useState(initialDespesas);

  const [tipoFilter, setTipoFilter] = useState<TipoFiltro>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFiltro>("all");
  const [categoriaFilter, setCategoriaFilter] = useState<string>("all");
  const [busca, setBusca] = useState("");
  const [range, setRange] = useState<DateRangeValue>({ key: "all", from: null, to: null });

  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [despesaModal, setDespesaModal] = useState<{ despesa?: Despesa } | null>(null);

  const cards = useMemo(
    () => computeFinanceiroCards({ lancamentos, despesas }),
    [lancamentos, despesas],
  );
  const alertas = useMemo(
    () => computeFinanceiroAlertas({ lancamentos, despesas }),
    [lancamentos, despesas],
  );

  const rows = useMemo<FinanceiroRow[]>(() => {
    const receitaRows = lancamentos.map(receitaToRow);
    const despesaRows = despesas.map(despesaToRow);
    return [...receitaRows, ...despesaRows].sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
    );
  }, [lancamentos, despesas]);

  const filtered = useMemo(() => {
    const resolved = resolveDateRange(range);
    const buscaLower = busca.trim().toLowerCase();

    return rows.filter((row) => {
      if (tipoFilter !== "all" && row.tipo !== tipoFilter) return false;
      if (!isWithinRange(row.data, resolved)) return false;

      if (statusFilter !== "all") {
        const aberto = row.statusLabel === "Pendente" || row.statusLabel === "A pagar";
        const atrasado = row.statusLabel === "Atrasado" || row.statusLabel === "Vencido";
        const pago = row.statusLabel === "Pago";
        const cancelado = row.statusLabel === "Cancelado";
        if (statusFilter === "aberto" && !aberto) return false;
        if (statusFilter === "atrasado" && !atrasado) return false;
        if (statusFilter === "pago" && !pago) return false;
        if (statusFilter === "cancelado" && !cancelado) return false;
      }

      if (categoriaFilter !== "all") {
        if (row.tipo !== "despesa" || row.item.categoria !== categoriaFilter) return false;
      }

      if (buscaLower) {
        const haystack =
          `${row.descricao} ${row.contraparte} ${row.categoriaLabel}`.toLowerCase();
        if (!haystack.includes(buscaLower)) return false;
      }

      return true;
    });
  }, [rows, tipoFilter, statusFilter, categoriaFilter, busca, range]);

  function handleDespesaSaved(saved: Despesa) {
    setDespesas((prev) => {
      const exists = prev.some((d) => d.id === saved.id);
      return exists ? prev.map((d) => (d.id === saved.id ? saved : d)) : [...prev, saved];
    });
    setDespesaModal(null);
  }

  async function handleMarcarDespesaPaga(despesa: Despesa) {
    const res = await fetch(`/api/admin/despesas/${despesa.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...despesa, status: "pago" }),
    });
    const json = await res.json();
    if (res.ok && json.despesa) {
      setDespesas((prev) => prev.map((d) => (d.id === despesa.id ? json.despesa : d)));
    }
  }

  async function handleExcluirDespesa(despesa: Despesa) {
    if (!confirm(`Excluir "${despesa.descricao}"? Essa ação não pode ser desfeita.`)) return;
    setDespesas((prev) => prev.filter((d) => d.id !== despesa.id));
    await fetch(`/api/admin/despesas/${despesa.id}`, { method: "DELETE" });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <h1 className="text-lg italic text-ink">Financeiro</h1>
          <p className="max-w-[46ch] font-mono text-xs text-ink-dim">
            Receitas, despesas, faturas e inadimplência do escritório.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowChoiceModal(true)}
          className="border border-gold bg-gold px-4 py-2 text-sm text-bg transition-all duration-150 hover:bg-transparent hover:text-gold"
        >
          + Novo lançamento
        </button>
      </div>

      <FinanceiroAlerts alertas={alertas} />

      {rows.length === 0 ? (
        <div className="mt-10 border border-hairline p-10 text-center">
          <p className="text-sm text-ink">Nenhum lançamento financeiro ainda</p>
          <p className="mx-auto mt-2 max-w-[42ch] text-xs text-ink-dim">
            Comece registrando uma receita, uma despesa ou uma fatura para acompanhar a saúde
            financeira do escritório.
          </p>
          <button
            type="button"
            onClick={() => setShowChoiceModal(true)}
            className="mt-5 border border-gold bg-gold px-4 py-2 text-sm text-bg transition-all duration-150 hover:bg-transparent hover:text-gold"
          >
            + Novo lançamento
          </button>
        </div>
      ) : (
        <>
          <p className="mt-8 font-eyebrow text-[10px] text-ink-dim">Régua financeira</p>
          <div className="mt-2">
            <FinanceiroSummaryCards cards={cards} />
          </div>

          <p className="mt-8 font-eyebrow text-[10px] text-ink-dim">Receita x Despesa</p>
          <div className="mt-2">
            <RevenueExpenseRatio cards={cards} />
          </div>

          <p className="mt-8 font-eyebrow text-[10px] text-ink-dim">Lançamentos financeiros</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value as TipoFiltro)}
              className="border border-hairline-strong bg-surface px-3 py-2 text-xs text-ink"
            >
              <option value="all">Todos os tipos</option>
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFiltro)}
              className="border border-hairline-strong bg-surface px-3 py-2 text-xs text-ink"
            >
              <option value="all">Todos os status</option>
              <option value="aberto">Em aberto</option>
              <option value="atrasado">Atrasado / vencido</option>
              <option value="pago">Pago</option>
              <option value="cancelado">Cancelado</option>
            </select>
            <select
              value={categoriaFilter}
              onChange={(e) => setCategoriaFilter(e.target.value)}
              className="border border-hairline-strong bg-surface px-3 py-2 text-xs text-ink"
            >
              <option value="all">Todas as categorias</option>
              {(Object.keys(CATEGORIAS_DESPESA) as CategoriaDespesaKey[]).map((key) => (
                <option key={key} value={key}>
                  {CATEGORIA_DESPESA_LABELS[key]}
                </option>
              ))}
            </select>
            <DateRangeFilter value={range} onChange={setRange} />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar cliente, fornecedor, descrição…"
              className="min-w-[200px] flex-1 border border-hairline-strong bg-surface px-3 py-2 text-xs text-ink outline-none focus:border-gold"
            />
          </div>

          <div className="mt-3 overflow-x-auto border border-hairline">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-hairline font-eyebrow text-[10px] text-ink-dim">
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Descrição</th>
                  <th className="px-4 py-3">Cliente/Fornecedor</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Recorrência</th>
                  <th className="px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={`${row.tipo}-${row.id}`} className="border-b border-hairline">
                    <td className="px-4 py-3 font-mono text-xs text-ink-dim">
                      {formatDate(row.data)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide ${
                          row.tipo === "receita"
                            ? "text-success border-success"
                            : "text-error border-error"
                        }`}
                      >
                        {row.tipo === "receita" ? "Receita" : "Despesa"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-dim">{row.categoriaLabel}</td>
                    <td className="px-4 py-3 text-ink">{row.descricao}</td>
                    <td className="px-4 py-3 text-ink-dim">{row.contraparte}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${row.statusClass}`}
                      >
                        {row.statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono tabular-nums text-ink-dim">
                      {formatBRL(row.valor)}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-dim">{row.recorrenciaLabel}</td>
                    <td className="px-4 py-3 text-xs">
                      {row.tipo === "receita" ? (
                        <Link
                          href={`/admin/financeiro/${row.id}`}
                          className="text-gold transition-colors duration-150 hover:underline"
                        >
                          ver detalhes
                        </Link>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setDespesaModal({ despesa: row.item })}
                            className="text-gold transition-colors duration-150 hover:underline"
                          >
                            editar
                          </button>
                          {row.item.status === "a_pagar" && (
                            <button
                              type="button"
                              onClick={() => handleMarcarDespesaPaga(row.item)}
                              className="text-success transition-colors duration-150 hover:underline"
                            >
                              marcar pago
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleExcluirDespesa(row.item)}
                            className="text-error transition-colors duration-150 hover:underline"
                          >
                            excluir
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-sm text-ink-dim">
                      Nenhum lançamento encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showChoiceModal && (
        <NovoLancamentoChoiceModal
          onClose={() => setShowChoiceModal(false)}
          onEscolherDespesa={() => {
            setShowChoiceModal(false);
            setDespesaModal({});
          }}
        />
      )}

      {despesaModal && (
        <DespesaModal
          despesa={despesaModal.despesa}
          onClose={() => setDespesaModal(null)}
          onSaved={handleDespesaSaved}
        />
      )}
    </div>
  );
}
