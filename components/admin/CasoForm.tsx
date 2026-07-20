"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Caso, CasoStatus, CasoPrioridade } from "@/lib/db-casos";
import type { LeadFormType } from "@/lib/db-leads";
import {
  CASO_STATUS_LABELS,
  CASO_PRIORIDADE_LABELS,
  CASO_PRIORIDADE_COLORS,
  FORM_TYPE_LABELS,
} from "@/lib/admin-labels";

export interface ContratoOption {
  id: string;
  label: string;
}

export function CasoForm({
  caso,
  contratoFixo,
  contratoOptions,
}: {
  caso?: Caso;
  contratoFixo?: ContratoOption;
  contratoOptions?: ContratoOption[];
}) {
  const router = useRouter();
  const [contratoId, setContratoId] = useState(
    caso?.contrato_id ?? contratoFixo?.id ?? contratoOptions?.[0]?.id ?? "",
  );
  const [area, setArea] = useState<LeadFormType | "">(caso?.area ?? "");
  const [titulo, setTitulo] = useState(caso?.titulo ?? "");
  const [status, setStatus] = useState<CasoStatus>(caso?.status ?? "aberto");
  const [prioridade, setPrioridade] = useState<CasoPrioridade>(
    caso?.prioridade ?? "media",
  );
  const [slaHoras, setSlaHoras] = useState(
    caso?.sla_horas != null ? String(caso.sla_horas) : "",
  );
  const [categoria, setCategoria] = useState(caso?.categoria ?? "");
  const [responsavel, setResponsavel] = useState(caso?.responsavel ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const contratoLocked = Boolean(contratoFixo);

  async function handleSave() {
    if (!contratoId || !area || !titulo.trim()) {
      setError("Contrato, área e título são obrigatórios.");
      return;
    }

    setSaving(true);
    setError("");

    const url = caso ? `/api/admin/casos/${caso.id}` : "/api/admin/casos";
    const method = caso ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contrato_id: contratoId,
          area,
          titulo,
          status,
          prioridade,
          sla_horas: slaHoras.trim() ? Number(slaHoras) : null,
          categoria: categoria.trim() || null,
          responsavel: responsavel.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar");

      router.push("/admin/casos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-6">
        <h1 className="text-lg italic text-ink">
          {caso ? "Editar caso" : "Novo caso"}
        </h1>
        {caso && (
          <div className="flex gap-2">
            <Link
              href={`/admin/casos/${caso.id}/relatorio`}
              target="_blank"
              className="border border-hairline-strong px-3 py-1.5 text-xs text-ink-dim transition-colors duration-150 hover:border-gold hover:text-gold"
            >
              Relatório interno
            </Link>
            <Link
              href={`/admin/casos/${caso.id}/relatorio-cliente`}
              target="_blank"
              className="border border-gold bg-gold px-3 py-1.5 text-xs font-semibold text-bg transition-all duration-150 hover:bg-transparent hover:text-gold"
            >
              📄 Abrir relatório do cliente
            </Link>
          </div>
        )}
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
          {!contratoLocked && (contratoOptions ?? []).length === 0 && (
            <p className="mt-2 text-xs text-warning">
              Nenhum contrato assinado disponível — um caso só pode ser aberto
              sob um contrato assinado.
            </p>
          )}
        </div>

        <div>
          <label className="font-eyebrow text-[10px] text-ink-dim">Área</label>
          <select
            value={area}
            onChange={(e) => setArea(e.target.value as LeadFormType)}
            className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink"
          >
            <option value="">—</option>
            {Object.entries(FORM_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-eyebrow text-[10px] text-ink-dim">
            Título do caso
          </label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
          />
        </div>

        <div>
          <label className="font-eyebrow text-[10px] text-ink-dim">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as CasoStatus)}
            className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink"
          >
            {(Object.keys(CASO_STATUS_LABELS) as CasoStatus[]).map((s) => (
              <option key={s} value={s}>
                {CASO_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-eyebrow text-[10px] text-ink-dim">
            Prioridade
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(CASO_PRIORIDADE_LABELS) as CasoPrioridade[]).map(
              (p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPrioridade(p)}
                  className={`border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors duration-150 ${
                    prioridade === p
                      ? CASO_PRIORIDADE_COLORS[p]
                      : "border-hairline-strong text-ink-dim hover:border-gold hover:text-gold"
                  }`}
                >
                  {CASO_PRIORIDADE_LABELS[p]}
                </button>
              ),
            )}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="font-eyebrow text-[10px] text-ink-dim">
              SLA — prazo pra próxima ação (horas)
            </label>
            <input
              type="number"
              min={0}
              value={slaHoras}
              onChange={(e) => setSlaHoras(e.target.value)}
              placeholder="ex.: 48"
              className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
            />
          </div>
          <div>
            <label className="font-eyebrow text-[10px] text-ink-dim">
              Responsável
            </label>
            <input
              type="text"
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              placeholder="ex.: Dallila Camargo"
              className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
            />
          </div>
        </div>

        <div>
          <label className="font-eyebrow text-[10px] text-ink-dim">
            Categoria
          </label>
          <input
            type="text"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            placeholder="ex.: Revisão de Termos de Uso"
            className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || (!contratoLocked && !contratoId)}
            className="border border-gold bg-gold px-5 py-2.5 text-sm text-bg transition-all duration-150 hover:bg-transparent hover:text-gold disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/casos")}
            className="border border-hairline-strong px-5 py-2.5 text-sm text-ink-dim transition-colors duration-150 hover:border-gold hover:text-gold"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
