"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { LancamentoPessoal, FinanceiroPessoalStatus } from "@/lib/db-financeiro-pessoal";

const STATUS_KEYS: FinanceiroPessoalStatus[] = ["pendente", "pago", "cancelado"];
const STATUS_LABELS: Record<FinanceiroPessoalStatus, string> = {
  pendente: "Pendente",
  pago: "Pago",
  cancelado: "Cancelado",
};

export function ReceitaPessoalModal({
  lancamento,
  onClose,
  onSaved,
}: {
  lancamento?: LancamentoPessoal;
  onClose: () => void;
  onSaved: (lancamento: LancamentoPessoal) => void;
}) {
  const [descricao, setDescricao] = useState(lancamento?.descricao ?? "");
  const [valor, setValor] = useState(lancamento?.valor?.toString() ?? "");
  const [vencimento, setVencimento] = useState(lancamento?.vencimento ?? "");
  const [status, setStatus] = useState<FinanceiroPessoalStatus>(lancamento?.status ?? "pendente");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    const valorNumerico = Number(valor.replace(",", "."));
    if (!descricao.trim() || !valorNumerico || !vencimento) {
      setError("Descrição, valor e vencimento são obrigatórios.");
      return;
    }

    setSaving(true);
    setError("");

    const url = lancamento
      ? `/api/admin/financeiro-pessoal/${lancamento.id}`
      : "/api/admin/financeiro-pessoal";
    const method = lancamento ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descricao, valor: valorNumerico, vencimento, status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erro ao salvar");
      onSaved(json.lancamento);
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
        className="flex max-h-[85vh] w-full max-w-md flex-col border border-hairline bg-surface"
        role="dialog"
        aria-modal="true"
        aria-label={lancamento ? "Editar receita pessoal" : "Nova receita pessoal"}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <p className="text-[15px] italic text-ink">
            {lancamento ? "Editar receita" : "Nova receita pessoal"}
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
          <label className="font-eyebrow text-[10px] text-ink-dim">Descrição</label>
          <input
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex.: salário, aluguel recebido, freelance"
            className="mt-1.5 w-full border border-hairline-strong bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
          />

          <div className="mt-3 grid grid-cols-2 gap-3">
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
            <div>
              <label className="font-eyebrow text-[10px] text-ink-dim">Vencimento</label>
              <input
                type="date"
                value={vencimento}
                onChange={(e) => setVencimento(e.target.value)}
                className="mt-1.5 w-full border border-hairline-strong bg-bg px-3 py-2 text-sm text-ink"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="font-eyebrow text-[10px] text-ink-dim">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as FinanceiroPessoalStatus)}
              className="mt-1.5 w-full border border-hairline-strong bg-bg px-3 py-2 text-sm text-ink"
            >
              {STATUS_KEYS.map((key) => (
                <option key={key} value={key}>
                  {STATUS_LABELS[key]}
                </option>
              ))}
            </select>
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
            {saving ? "Salvando…" : "Salvar receita"}
          </button>
        </div>
      </div>
    </div>
  );
}
