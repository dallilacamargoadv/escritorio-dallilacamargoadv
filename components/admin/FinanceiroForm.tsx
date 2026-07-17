"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface ContratoOption {
  id: string;
  clienteId: string;
  label: string;
}

type TipoLancamento = "unico" | "parcelado" | "recorrente";

export function FinanceiroForm({
  contratoFixo,
  contratoOptions,
}: {
  contratoFixo?: ContratoOption;
  contratoOptions?: ContratoOption[];
}) {
  const router = useRouter();
  const [contratoId, setContratoId] = useState(
    contratoFixo?.id ?? contratoOptions?.[0]?.id ?? "",
  );
  const [tipo, setTipo] = useState<TipoLancamento>("unico");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [vencimento, setVencimento] = useState("");
  const [quantidade, setQuantidade] = useState("2");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const contratoLocked = Boolean(contratoFixo);
  const selected = contratoFixo ?? contratoOptions?.find((o) => o.id === contratoId);

  async function handleSave() {
    if (!selected || !descricao.trim() || !valor || !vencimento) {
      setError("Contrato, descrição, valor e vencimento são obrigatórios.");
      return;
    }
    if (tipo !== "unico" && (!quantidade || Number(quantidade) < 2)) {
      setError("Informe uma quantidade de pelo menos 2.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/financeiro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contrato_id: selected.id,
          cliente_id: selected.clienteId,
          descricao,
          valor: Number(valor),
          vencimento: new Date(vencimento).toISOString(),
          tipo,
          quantidade: tipo === "unico" ? 1 : Number(quantidade),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar");

      router.push("/admin/financeiro");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="border-b border-hairline pb-6">
        <h1 className="text-lg italic text-ink">Novo lançamento</h1>
      </div>

      <div className="mt-8 space-y-5">
        <div>
          <label className="font-eyebrow text-[10px] text-ink-dim">
            Contrato
          </label>
          {contratoLocked ? (
            <p className="mt-2 border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink-dim">
              {contratoFixo?.label}
            </p>
          ) : (contratoOptions ?? []).length === 0 ? (
            <p className="mt-2 text-xs text-warning">
              Nenhum contrato assinado disponível.
            </p>
          ) : (
            <select
              value={contratoId}
              onChange={(e) => setContratoId(e.target.value)}
              className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink"
            >
              {(contratoOptions ?? []).map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="font-eyebrow text-[10px] text-ink-dim">
            Tipo de lançamento
          </label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoLancamento)}
            className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink"
          >
            <option value="unico">Único</option>
            <option value="parcelado">Parcelado (N vezes)</option>
            <option value="recorrente">Recorrente (mensal, gerar em lote)</option>
          </select>
        </div>

        <div>
          <label className="font-eyebrow text-[10px] text-ink-dim">
            Descrição
          </label>
          <input
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder={
              tipo === "unico"
                ? "Ex.: Honorários - análise de contrato"
                : "Ex.: Assessoria Estratégica mensal"
            }
            className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-eyebrow text-[10px] text-ink-dim">
              Valor de cada parcela (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
            />
          </div>

          {tipo !== "unico" && (
            <div>
              <label className="font-eyebrow text-[10px] text-ink-dim">
                {tipo === "parcelado" ? "Número de parcelas" : "Quantos meses gerar agora"}
              </label>
              <input
                type="number"
                min={2}
                step="1"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
              />
            </div>
          )}
        </div>

        <div>
          <label className="font-eyebrow text-[10px] text-ink-dim">
            Vencimento {tipo !== "unico" ? "(1ª parcela / 1º mês)" : ""}
          </label>
          <input
            type="date"
            value={vencimento}
            onChange={(e) => setVencimento(e.target.value)}
            className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
          />
        </div>

        {tipo !== "unico" && (
          <p className="text-xs text-ink-dim">
            {tipo === "parcelado"
              ? `Vai criar ${quantidade || "N"} lançamentos, um por mês a partir do vencimento acima, marcados "Parcela 1/${quantidade || "N"}" até "Parcela ${quantidade || "N"}/${quantidade || "N"}".`
              : `Vai criar ${quantidade || "N"} lançamentos mensais a partir do vencimento acima. Quando estiver acabando, volte aqui e gere mais um lote.`}
          </p>
        )}

        {error && (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="border border-gold bg-gold px-5 py-2.5 text-sm text-bg transition-all duration-150 hover:bg-transparent hover:text-gold disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/financeiro")}
            className="border border-hairline-strong px-5 py-2.5 text-sm text-ink-dim transition-colors duration-150 hover:border-gold hover:text-gold"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
