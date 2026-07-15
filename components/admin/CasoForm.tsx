"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Caso, CasoStatus } from "@/lib/db-casos";
import type { LeadFormType } from "@/lib/db-leads";
import { CASO_STATUS_LABELS, FORM_TYPE_LABELS } from "@/lib/admin-labels";

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
        body: JSON.stringify({ contrato_id: contratoId, area, titulo, status }),
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
      <div className="border-b border-hairline pb-6">
        <h1 className="text-lg italic text-ink">
          {caso ? "Editar caso" : "Novo caso"}
        </h1>
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
