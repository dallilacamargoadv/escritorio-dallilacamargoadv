"use client";

import { useMemo, useState } from "react";
import type { LancamentoPessoal } from "@/lib/db-financeiro-pessoal";
import type { DespesaPessoal } from "@/lib/db-despesas-pessoal";
import {
  isLancamentoPessoalAtrasado,
  isDespesaPessoalVencida,
} from "@/lib/financeiro-pessoal-utils";
import {
  computeFinanceiroPessoalAlertas,
  computeFinanceiroPessoalCards,
} from "@/lib/financeiro-pessoal-fase1";
import { computeMaiorCategoriaDespesaPessoal } from "@/lib/financeiro-pessoal-insights";
import { formatDate } from "@/lib/format";
import { DESPESA_RECORRENCIA_LABELS } from "@/lib/admin-labels";
import { DateRangeFilter } from "@/components/admin/DateRangeFilter";
import { resolveDateRange, isWithinRange, type DateRangeValue } from "@/lib/date-range";
import { FinanceiroSummaryCards } from "@/components/admin/FinanceiroSummaryCards";
import { RevenueExpenseRatio } from "@/components/admin/RevenueExpenseRatio";
import { FinanceiroPessoalInsightsBlock } from "@/components/admin/FinanceiroPessoalInsightsBlock";
import { FinanceiroAlerts } from "@/components/admin/FinanceiroAlerts";
import { DespesaPessoalModal } from "@/components/admin/DespesaPessoalModal";
import { ReceitaPessoalModal } from "@/components/admin/ReceitaPessoalModal";
import { NovoLancamentoPessoalChoiceModal } from "@/components/admin/NovoLancamentoPessoalChoiceModal";
import { CategoriasDespesaPessoalEditor } from "@/components/admin/CategoriasDespesaPessoalEditor";
import type { DespesaCategoria } from "@/lib/db-despesa-categorias";

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
  statusLabel: string;
  statusClass: string;
  valor: number;
  recorrenciaLabel: string;
  item: LancamentoPessoal;
}

interface RowDespesa {
  tipo: "despesa";
  id: string;
  data: string;
  categoriaLabel: string;
  descricao: string;
  statusLabel: string;
  statusClass: string;
  valor: number;
  recorrenciaLabel: string;
  item: DespesaPessoal;
}

type FinanceiroPessoalRow = RowReceita | RowDespesa;

function receitaToRow(l: LancamentoPessoal): RowReceita {
  const atrasado = isLancamentoPessoalAtrasado(l);
  return {
    tipo: "receita",
    id: l.id,
    data: l.vencimento,
    categoriaLabel: "—",
    descricao: l.descricao,
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

function despesaToRow(d: DespesaPessoal): RowDespesa {
  const vencida = isDespesaPessoalVencida(d);
  return {
    tipo: "despesa",
    id: d.id,
    data: d.vencimento,
    categoriaLabel: `${d.categoria}${d.subcategoria ? ` · ${d.subcategoria}` : ""}`,
    descricao: d.descricao,
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

export function FinanceiroPessoalDashboard({
  initialLancamentos,
  initialDespesas,
  initialCategorias,
}: {
  initialLancamentos: LancamentoPessoal[];
  initialDespesas: DespesaPessoal[];
  initialCategorias: DespesaCategoria[];
}) {
  const [lancamentos, setLancamentos] = useState(initialLancamentos);
  const [despesas, setDespesas] = useState(initialDespesas);
  const [categorias, setCategorias] = useState(initialCategorias);

  const [tipoFilter, setTipoFilter] = useState<TipoFiltro>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFiltro>("all");
  const [categoriaFilter, setCategoriaFilter] = useState<string>("all");
  const [busca, setBusca] = useState("");
  const [range, setRange] = useState<DateRangeValue>({ key: "all", from: null, to: null });

  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [receitaModal, setReceitaModal] = useState<{ lancamento?: LancamentoPessoal } | null>(null);
  const [despesaModal, setDespesaModal] = useState<{ despesa?: DespesaPessoal } | null>(null);
  const [showCategoriasModal, setShowCategoriasModal] = useState(false);

  const cards = useMemo(
    () => computeFinanceiroPessoalCards({ lancamentos, despesas }),
    [lancamentos, despesas],
  );
  const alertas = useMemo(
    () => computeFinanceiroPessoalAlertas({ lancamentos, despesas }),
    [lancamentos, despesas],
  );
  const maiorCategoriaDespesa = useMemo(
    () => computeMaiorCategoriaDespesaPessoal(despesas),
    [despesas],
  );

  const rows = useMemo<FinanceiroPessoalRow[]>(() => {
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
        const haystack = `${row.descricao} ${row.categoriaLabel}`.toLowerCase();
        if (!haystack.includes(buscaLower)) return false;
      }

      return true;
    });
  }, [rows, tipoFilter, statusFilter, categoriaFilter, busca, range]);

  function handleReceitaSaved(saved: LancamentoPessoal) {
    setLancamentos((prev) => {
      const exists = prev.some((l) => l.id === saved.id);
      return exists ? prev.map((l) => (l.id === saved.id ? saved : l)) : [...prev, saved];
    });
    setReceitaModal(null);
  }

  async function handleExcluirReceita(lancamento: LancamentoPessoal) {
    if (!confirm(`Excluir "${lancamento.descricao}"? Essa ação não pode ser desfeita.`)) return;
    setLancamentos((prev) => prev.filter((l) => l.id !== lancamento.id));
    await fetch(`/api/admin/financeiro-pessoal/${lancamento.id}`, { method: "DELETE" });
  }

  function handleDespesaSaved(saved: DespesaPessoal) {
    setDespesas((prev) => {
      const exists = prev.some((d) => d.id === saved.id);
      return exists ? prev.map((d) => (d.id === saved.id ? saved : d)) : [...prev, saved];
    });
    setDespesaModal(null);
  }

  async function handleMarcarDespesaPaga(despesa: DespesaPessoal) {
    const res = await fetch(`/api/admin/despesas-pessoal/${despesa.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...despesa, status: "pago" }),
    });
    const json = await res.json();
    if (res.ok && json.despesa) {
      setDespesas((prev) => prev.map((d) => (d.id === despesa.id ? json.despesa : d)));
    }
  }

  async function handleExcluirDespesa(despesa: DespesaPessoal) {
    if (!confirm(`Excluir "${despesa.descricao}"? Essa ação não pode ser desfeita.`)) return;
    setDespesas((prev) => prev.filter((d) => d.id !== despesa.id));
    await fetch(`/api/admin/despesas-pessoal/${despesa.id}`, { method: "DELETE" });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <h1 className="text-lg italic text-ink">Financeiro Pessoal</h1>
          <p className="max-w-[46ch] font-mono text-xs text-ink-dim">
            Totalmente separado do financeiro do escritório — não entra em nenhum relatório
            profissional nem na Visão Geral.
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
          <p className="text-sm text-ink">Nenhum lançamento pessoal ainda</p>
          <p className="mx-auto mt-2 max-w-[42ch] text-xs text-ink-dim">
            Comece registrando uma receita ou uma despesa pessoal.
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

          <p className="mt-8 font-eyebrow text-[10px] text-ink-dim">Análise financeira</p>
          <div className="mt-2">
            <FinanceiroPessoalInsightsBlock
              maiorCategoriaDespesa={maiorCategoriaDespesa}
              percentualDespesas={cards.percentualDespesas}
            />
          </div>

          <p className="mt-8 font-eyebrow text-[10px] text-ink-dim">Receita x Despesa</p>
          <div className="mt-2">
            <RevenueExpenseRatio cards={cards} />
          </div>

          <p className="mt-8 font-eyebrow text-[10px] text-ink-dim">Lançamentos</p>
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
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.nome}>
                  {cat.nome}
                </option>
              ))}
            </select>
            <DateRangeFilter value={range} onChange={setRange} />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar descrição…"
              className="min-w-[200px] flex-1 border border-hairline-strong bg-surface px-3 py-2 text-xs text-ink outline-none focus:border-gold"
            />
            <button
              type="button"
              onClick={() => setShowCategoriasModal(true)}
              className="border border-hairline-strong px-3 py-2 text-xs text-ink-dim transition-colors duration-150 hover:border-gold hover:text-gold"
            >
              Gerenciar categorias
            </button>
          </div>

          <div className="mt-3 overflow-x-auto border border-hairline">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-hairline font-eyebrow text-[10px] text-ink-dim">
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Descrição</th>
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
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            row.tipo === "receita"
                              ? setReceitaModal({ lancamento: row.item })
                              : setDespesaModal({ despesa: row.item })
                          }
                          className="text-gold transition-colors duration-150 hover:underline"
                        >
                          editar
                        </button>
                        {row.tipo === "despesa" && row.item.status === "a_pagar" && (
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
                          onClick={() =>
                            row.tipo === "receita"
                              ? handleExcluirReceita(row.item)
                              : handleExcluirDespesa(row.item)
                          }
                          className="text-error transition-colors duration-150 hover:underline"
                        >
                          excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-ink-dim">
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
        <NovoLancamentoPessoalChoiceModal
          onClose={() => setShowChoiceModal(false)}
          onEscolherReceita={() => {
            setShowChoiceModal(false);
            setReceitaModal({});
          }}
          onEscolherDespesa={() => {
            setShowChoiceModal(false);
            setDespesaModal({});
          }}
        />
      )}

      {receitaModal && (
        <ReceitaPessoalModal
          lancamento={receitaModal.lancamento}
          onClose={() => setReceitaModal(null)}
          onSaved={handleReceitaSaved}
        />
      )}

      {despesaModal && (
        <DespesaPessoalModal
          despesa={despesaModal.despesa}
          categorias={categorias}
          despesasHistorico={despesas}
          onClose={() => setDespesaModal(null)}
          onSaved={handleDespesaSaved}
        />
      )}

      {showCategoriasModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setShowCategoriasModal(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-lg flex-col border border-hairline bg-surface"
            role="dialog"
            aria-modal="true"
            aria-label="Categorias de despesa pessoal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
              <p className="text-[15px] italic text-ink">Categorias de despesa pessoal</p>
              <button
                type="button"
                onClick={() => setShowCategoriasModal(false)}
                className="text-ink-dim transition-colors duration-150 hover:text-gold"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <CategoriasDespesaPessoalEditor
                categorias={categorias}
                onChange={setCategorias}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
