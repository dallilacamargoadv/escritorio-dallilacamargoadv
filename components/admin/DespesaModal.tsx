"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Despesa, DespesaRecorrencia, DespesaStatus } from "@/lib/db-despesas";
import type { DespesaCategoria } from "@/lib/db-despesa-categorias";
import { CENTROS_CUSTO, FORMAS_PAGAMENTO } from "@/lib/despesas-categorias";
import { sugerirCategoria } from "@/lib/categoria-sugestao";
import { DESPESA_RECORRENCIA_LABELS, DESPESA_STATUS_LABELS } from "@/lib/admin-labels";
import { parseCurrencyInput } from "@/lib/currency-input";

const STATUS_KEYS: DespesaStatus[] = ["a_pagar", "pago", "cancelado"];
const RECORRENCIA_KEYS: DespesaRecorrencia[] = [
  "nenhuma",
  "mensal",
  "trimestral",
  "semestral",
  "anual",
];

function FieldGroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 mt-3.5 border-t border-hairline pt-3.5 font-mono text-[9px] uppercase tracking-wide text-gold first:mt-0 first:border-t-0 first:pt-0">
      {children}
    </p>
  );
}

export function DespesaModal({
  despesa,
  categorias,
  despesasHistorico,
  onClose,
  onSaved,
}: {
  despesa?: Despesa;
  categorias: DespesaCategoria[];
  despesasHistorico: Despesa[];
  onClose: () => void;
  onSaved: (despesa: Despesa) => void;
}) {
  const [categoria, setCategoria] = useState(despesa?.categoria ?? categorias[0]?.nome ?? "");
  const [subcategoria, setSubcategoria] = useState(despesa?.subcategoria ?? "");
  const [descricao, setDescricao] = useState(despesa?.descricao ?? "");
  const [fornecedor, setFornecedor] = useState(despesa?.fornecedor ?? "");
  const [valor, setValor] = useState(despesa?.valor?.toString() ?? "");
  const [vencimento, setVencimento] = useState(despesa?.vencimento ?? "");
  const [status, setStatus] = useState<DespesaStatus>(despesa?.status ?? "a_pagar");
  const [formaPagamento, setFormaPagamento] = useState(despesa?.forma_pagamento ?? "");
  const [recorrencia, setRecorrencia] = useState<DespesaRecorrencia>(
    despesa?.recorrencia ?? "nenhuma",
  );
  const [centroCusto, setCentroCusto] = useState(despesa?.centro_custo ?? "");
  const [observacoes, setObservacoes] = useState(despesa?.observacoes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [categoriaTocada, setCategoriaTocada] = useState(Boolean(despesa));
  const [sugestao, setSugestao] = useState<{ categoria: string; subcategoria: string | null } | null>(
    null,
  );

  const subcategorias = categorias.find((c) => c.nome === categoria)?.subcategorias ?? [];

  function handleCategoriaChange(next: string) {
    setCategoria(next);
    setSubcategoria("");
    setCategoriaTocada(true);
    setSugestao(null);
  }

  function handleDescricaoBlur() {
    if (categoriaTocada || !descricao.trim()) return;
    const resultado = sugerirCategoria(
      descricao,
      despesasHistorico.map((d) => ({
        descricao: d.descricao,
        categoria: d.categoria,
        subcategoria: d.subcategoria,
        created_at: d.created_at,
      })),
    );
    if (resultado) {
      setCategoria(resultado.categoria);
      setSubcategoria(resultado.subcategoria ?? "");
      setSugestao(resultado);
    }
  }

  async function handleSave() {
    const valorNumerico = parseCurrencyInput(valor);
    if (!descricao.trim() || !valorNumerico || !vencimento) {
      setError("Descrição, valor e vencimento são obrigatórios.");
      return;
    }

    setSaving(true);
    setError("");

    const url = despesa ? `/api/admin/despesas/${despesa.id}` : "/api/admin/despesas";
    const method = despesa ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoria,
          subcategoria: subcategoria || null,
          descricao,
          fornecedor: fornecedor || null,
          valor: valorNumerico,
          vencimento,
          status,
          forma_pagamento: formaPagamento || null,
          recorrencia,
          centro_custo: centroCusto || null,
          observacoes: observacoes || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erro ao salvar");
      onSaved(json.despesa);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col border border-hairline bg-surface"
        role="dialog"
        aria-modal="true"
        aria-label={despesa ? "Editar despesa" : "Nova despesa"}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <p className="text-[15px] italic text-ink">
            {despesa ? "Editar despesa" : "Nova despesa"}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-dim transition-colors duration-150 hover:text-gold"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <FieldGroupLabel>Dados principais</FieldGroupLabel>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-eyebrow text-[10px] text-ink-dim">Categoria</label>
              <select
                value={categoria}
                onChange={(e) => handleCategoriaChange(e.target.value)}
                className="mt-1.5 w-full border border-hairline-strong bg-bg px-3 py-2 text-sm text-ink"
              >
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.nome}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-eyebrow text-[10px] text-ink-dim">Subcategoria</label>
              <select
                value={subcategoria}
                onChange={(e) => {
                  setSubcategoria(e.target.value);
                  setCategoriaTocada(true);
                  setSugestao(null);
                }}
                className="mt-1.5 w-full border border-hairline-strong bg-bg px-3 py-2 text-sm text-ink"
              >
                <option value="">—</option>
                {subcategorias.map((sub) => (
                  <option key={sub.id} value={sub.nome}>
                    {sub.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3">
            <label className="font-eyebrow text-[10px] text-ink-dim">Descrição</label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              onBlur={handleDescricaoBlur}
              placeholder="Ex.: assinatura mensal do banco de dados"
              className="mt-1.5 w-full border border-hairline-strong bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
            />
            {sugestao && (
              <p className="mt-1.5 text-xs text-success">
                ↳ sugerido: {sugestao.categoria}
                {sugestao.subcategoria ? ` · ${sugestao.subcategoria}` : ""} (baseado em despesa
                anterior)
              </p>
            )}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="font-eyebrow text-[10px] text-ink-dim">Fornecedor</label>
              <input
                type="text"
                value={fornecedor}
                onChange={(e) => setFornecedor(e.target.value)}
                className="mt-1.5 w-full border border-hairline-strong bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
              />
            </div>
            <div>
              <label className="font-eyebrow text-[10px] text-ink-dim">Valor</label>
              <input
                type="text"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
                className="mt-1.5 w-full border border-hairline-strong bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
              />
            </div>
          </div>

          <FieldGroupLabel>Pagamento</FieldGroupLabel>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-eyebrow text-[10px] text-ink-dim">Vencimento</label>
              <input
                type="date"
                value={vencimento}
                onChange={(e) => setVencimento(e.target.value)}
                className="mt-1.5 w-full border border-hairline-strong bg-bg px-3 py-2 text-sm text-ink"
              />
            </div>
            <div>
              <label className="font-eyebrow text-[10px] text-ink-dim">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DespesaStatus)}
                className="mt-1.5 w-full border border-hairline-strong bg-bg px-3 py-2 text-sm text-ink"
              >
                {STATUS_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {DESPESA_STATUS_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="font-eyebrow text-[10px] text-ink-dim">Forma de pagamento</label>
              <select
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value)}
                className="mt-1.5 w-full border border-hairline-strong bg-bg px-3 py-2 text-sm text-ink"
              >
                <option value="">—</option>
                {FORMAS_PAGAMENTO.map((forma) => (
                  <option key={forma} value={forma}>
                    {forma}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-eyebrow text-[10px] text-ink-dim">Recorrência</label>
              <select
                value={recorrencia}
                onChange={(e) => setRecorrencia(e.target.value as DespesaRecorrencia)}
                className="mt-1.5 w-full border border-hairline-strong bg-bg px-3 py-2 text-sm text-ink"
              >
                {RECORRENCIA_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {DESPESA_RECORRENCIA_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <FieldGroupLabel>Organização</FieldGroupLabel>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-eyebrow text-[10px] text-ink-dim">Centro de custo</label>
              <select
                value={centroCusto}
                onChange={(e) => setCentroCusto(e.target.value)}
                className="mt-1.5 w-full border border-hairline-strong bg-bg px-3 py-2 text-sm text-ink"
              >
                <option value="">—</option>
                {CENTROS_CUSTO.map((centro) => (
                  <option key={centro} value={centro}>
                    {centro}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-eyebrow text-[10px] text-ink-dim">Observações</label>
              <input
                type="text"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="mt-1.5 w-full border border-hairline-strong bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="mt-3 text-sm text-error">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-hairline px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="border border-hairline-strong px-4 py-2 text-sm text-ink-dim transition-colors duration-150 hover:border-gold hover:text-gold"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="border border-gold bg-gold px-4 py-2 text-sm text-bg transition-all duration-150 hover:bg-transparent hover:text-gold disabled:opacity-50"
          >
            {saving ? "Salvando…" : "Salvar despesa"}
          </button>
        </div>
      </div>
    </div>
  );
}
