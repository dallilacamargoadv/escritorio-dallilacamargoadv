"use client";

import { useState } from "react";
import Link from "next/link";
import type { Parceiro } from "@/lib/db-parceiros";
import type { Indicacao, IndicacaoDirecao } from "@/lib/db-indicacoes";
import { INDICACAO_DIRECAO_COLORS, INDICACAO_DIRECAO_LABELS, TIPO_PESSOA_LABELS } from "@/lib/admin-labels";
import { formatDate } from "@/lib/format";

export interface VinculoOption {
  value: string;
  label: string;
}

export function ParceiroDetailSections({
  parceiro,
  initialIndicacoes,
  vinculoOptions,
}: {
  parceiro: Parceiro;
  initialIndicacoes: Indicacao[];
  vinculoOptions: VinculoOption[];
}) {
  const [indicacoes, setIndicacoes] = useState(initialIndicacoes);
  const [direcao, setDirecao] = useState<IndicacaoDirecao>("recebida");
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [vinculo, setVinculo] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function vinculoLabel(indicacao: Indicacao): string {
    if (indicacao.lead_id) {
      return vinculoOptions.find((o) => o.value === `lead:${indicacao.lead_id}`)?.label ?? "Lead";
    }
    if (indicacao.cliente_id) {
      return (
        vinculoOptions.find((o) => o.value === `cliente:${indicacao.cliente_id}`)?.label ??
        "Cliente"
      );
    }
    return "—";
  }

  async function handleSalvarIndicacao() {
    if (!data) {
      setError("Data é obrigatória.");
      return;
    }
    setSaving(true);
    setError("");

    const [tipo, id] = vinculo ? vinculo.split(":") : [null, null];

    try {
      const res = await fetch(`/api/admin/parceiros/${parceiro.id}/indicacoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          direcao,
          data,
          lead_id: tipo === "lead" ? id : null,
          cliente_id: tipo === "cliente" ? id : null,
          observacoes,
        }),
      });
      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || "Erro ao salvar");

      setIndicacoes((prev) => [responseData.indicacao, ...prev]);
      setData(new Date().toISOString().slice(0, 10));
      setVinculo("");
      setObservacoes("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between border-b border-hairline pb-6">
        <div>
          <h1 className="text-lg italic text-ink">{parceiro.nome}</h1>
          <p className="font-mono text-xs text-ink-dim">
            {TIPO_PESSOA_LABELS[parceiro.tipo_pessoa]}
            {parceiro.contato ? ` · ${parceiro.contato}` : ""}
          </p>
        </div>
        <Link
          href={`/admin/parcerias/${parceiro.id}/editar`}
          className="border border-hairline-strong px-4 py-2 text-sm text-ink-dim transition-colors duration-150 hover:border-gold hover:text-gold"
        >
          Editar
        </Link>
      </div>

      {parceiro.observacoes && (
        <p className="mt-6 whitespace-pre-wrap text-sm text-ink-dim">
          {parceiro.observacoes}
        </p>
      )}

      <div className="mt-10">
        <span className="font-eyebrow text-[10px] text-ink-dim">
          Indicações ({indicacoes.length})
        </span>
        <div className="mt-3 border border-hairline">
          {indicacoes.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-ink-dim">
              Nenhuma indicação ainda.
            </p>
          )}
          {indicacoes.map((indicacao, index) => (
            <div
              key={indicacao.id}
              className={`px-4 py-3 ${
                index !== indicacoes.length - 1 ? "border-b border-hairline" : ""
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide ${INDICACAO_DIRECAO_COLORS[indicacao.direcao]}`}
                >
                  {INDICACAO_DIRECAO_LABELS[indicacao.direcao]}
                </span>
                <span className="text-xs text-ink-dim">{formatDate(indicacao.data)}</span>
                <span className="text-xs text-ink-dim">· {vinculoLabel(indicacao)}</span>
              </div>
              {indicacao.observacoes && (
                <p className="mt-1.5 whitespace-pre-wrap text-sm text-ink">
                  {indicacao.observacoes}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <span className="font-eyebrow text-[10px] text-ink-dim">+ Nova indicação</span>
        <div className="mt-3 space-y-3 border border-hairline-strong bg-surface p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="font-eyebrow text-[10px] text-ink-dim">Direção</label>
              <select
                value={direcao}
                onChange={(e) => setDirecao(e.target.value as IndicacaoDirecao)}
                className="mt-2 w-full border border-hairline-strong bg-bg px-3 py-2 text-sm text-ink"
              >
                <option value="recebida">Recebida (ele indicou alguém pra mim)</option>
                <option value="enviada">Enviada (eu indiquei alguém pra ele)</option>
              </select>
            </div>
            <div>
              <label className="font-eyebrow text-[10px] text-ink-dim">Data</label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="mt-2 w-full border border-hairline-strong bg-bg px-3 py-2 text-sm text-ink"
              />
            </div>
          </div>

          <div>
            <label className="font-eyebrow text-[10px] text-ink-dim">
              Vincular a lead ou cliente existente (opcional)
            </label>
            <select
              value={vinculo}
              onChange={(e) => setVinculo(e.target.value)}
              className="mt-2 w-full border border-hairline-strong bg-bg px-3 py-2 text-sm text-ink"
            >
              <option value="">— nenhum —</option>
              {vinculoOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-eyebrow text-[10px] text-ink-dim">
              Observação (opcional)
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={2}
              placeholder='ex.: "indicou cliente com golpe de boleto falso"'
              className="mt-2 w-full resize-none border border-hairline-strong bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-gold"
            />
          </div>

          {error && (
            <p role="alert" className="text-xs text-error">
              {error}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSalvarIndicacao}
              disabled={saving}
              className="border border-gold bg-gold px-4 py-1.5 text-xs text-bg transition-all duration-150 hover:bg-transparent hover:text-gold disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar indicação"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
