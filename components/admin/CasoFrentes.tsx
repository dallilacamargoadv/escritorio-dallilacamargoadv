"use client";

import { useState } from "react";
import type { Frente, FrenteStatus, FrenteTipo } from "@/lib/db-frentes";
import {
  FRENTE_STATUS_COLORS,
  FRENTE_STATUS_LABELS,
  FRENTE_TIPO_LABELS,
} from "@/lib/admin-labels";

export function CasoFrentes({
  casoId,
  initialFrentes,
}: {
  casoId: string;
  initialFrentes: Frente[];
}) {
  const [frentes, setFrentes] = useState(initialFrentes);
  const [showForm, setShowForm] = useState(false);
  const [tipo, setTipo] = useState<FrenteTipo>("extrajudicial");
  const [orgao, setOrgao] = useState("");
  const [numeroProcesso, setNumeroProcesso] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusSavingId, setStatusSavingId] = useState<string | null>(null);

  async function handleAddFrente() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/casos/${casoId}/frentes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          orgao,
          numero_processo: numeroProcesso,
          status: "aberta",
        }),
      });
      const data = await res.json();
      if (res.ok && data.frente) {
        setFrentes((prev) => [data.frente, ...prev]);
        setOrgao("");
        setNumeroProcesso("");
        setShowForm(false);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(frente: Frente, status: FrenteStatus) {
    setStatusSavingId(frente.id);
    try {
      const res = await fetch(
        `/api/admin/casos/${casoId}/frentes/${frente.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tipo: frente.tipo,
            orgao: frente.orgao,
            numero_processo: frente.numero_processo,
            status,
          }),
        },
      );
      const data = await res.json();
      if (res.ok && data.frente) {
        setFrentes((prev) =>
          prev.map((f) => (f.id === frente.id ? data.frente : f)),
        );
      }
    } finally {
      setStatusSavingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-8 sm:px-6">
      <div className="mt-2 border-t border-hairline pt-6">
      <div className="flex items-center justify-between">
        <span className="font-eyebrow text-[10px] text-ink-dim">
          Frentes do caso
        </span>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="text-xs text-gold transition-colors duration-150 hover:underline"
        >
          {showForm ? "Cancelar" : "+ Nova frente"}
        </button>
      </div>

      {showForm && (
        <div className="mt-3 space-y-3 border border-hairline-strong bg-surface p-4">
          <div>
            <label className="font-eyebrow text-[10px] text-ink-dim">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as FrenteTipo)}
              className="mt-2 w-full border border-hairline-strong bg-bg px-3 py-2 text-sm text-ink"
            >
              {(Object.keys(FRENTE_TIPO_LABELS) as FrenteTipo[]).map((t) => (
                <option key={t} value={t}>
                  {FRENTE_TIPO_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-eyebrow text-[10px] text-ink-dim">
              Órgão / Tribunal
            </label>
            <input
              type="text"
              value={orgao}
              onChange={(e) => setOrgao(e.target.value)}
              placeholder="INPI, TJPA, TRF1..."
              className="mt-2 w-full border border-hairline-strong bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
            />
          </div>
          <div>
            <label className="font-eyebrow text-[10px] text-ink-dim">
              Número do processo
            </label>
            <input
              type="text"
              value={numeroProcesso}
              onChange={(e) => setNumeroProcesso(e.target.value)}
              className="mt-2 w-full border border-hairline-strong bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
            />
          </div>
          <button
            type="button"
            onClick={handleAddFrente}
            disabled={saving}
            className="border border-gold bg-gold px-4 py-2 text-sm text-bg transition-all duration-150 hover:bg-transparent hover:text-gold disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar frente"}
          </button>
        </div>
      )}

      <div className="mt-3 border border-hairline">
        {frentes.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-ink-dim">
            Nenhuma frente aberta ainda.
          </p>
        )}
        {frentes.map((frente, index) => (
          <div
            key={frente.id}
            className={`flex items-center justify-between gap-4 px-4 py-3 text-sm ${
              index !== frentes.length - 1 ? "border-b border-hairline" : ""
            }`}
          >
            <div className="min-w-0">
              <p className="text-ink">
                {FRENTE_TIPO_LABELS[frente.tipo]}
                {frente.orgao ? ` — ${frente.orgao}` : ""}
              </p>
              {frente.numero_processo && (
                <p className="font-mono text-xs text-ink-dim">
                  {frente.numero_processo}
                </p>
              )}
            </div>
            <select
              value={frente.status}
              disabled={statusSavingId === frente.id}
              onChange={(e) =>
                handleStatusChange(frente, e.target.value as FrenteStatus)
              }
              className={`shrink-0 border bg-transparent px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide disabled:opacity-50 ${FRENTE_STATUS_COLORS[frente.status]}`}
            >
              {(Object.keys(FRENTE_STATUS_LABELS) as FrenteStatus[]).map(
                (status) => (
                  <option key={status} value={status}>
                    {FRENTE_STATUS_LABELS[status]}
                  </option>
                ),
              )}
            </select>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}
