"use client";

import { useState } from "react";
import type { CasoHistoricoEntry } from "@/lib/db-caso-historico";

function formatDateTime(dateString: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Belem",
  }).format(new Date(dateString));
}

export function CasoAnamnese({
  casoId,
  initialHistorico,
}: {
  casoId: string;
  initialHistorico: CasoHistoricoEntry[];
}) {
  const [historico, setHistorico] = useState(initialHistorico);
  const [texto, setTexto] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd() {
    if (!texto.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/casos/${casoId}/historico`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: texto.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar");
      setHistorico((prev) => [...prev, data.entry]);
      setTexto("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  const timeline = [...historico].reverse();

  return (
    <div className="mx-auto max-w-3xl px-4 pb-8 sm:px-6">
      <div className="mt-2 border-t border-hairline pt-6">
        <span className="font-eyebrow text-[10px] text-ink-dim">
          Anamnese Jurídica
        </span>
        <p className="mt-1 text-xs text-ink-dim">
          Histórico do caso — só cresce, nunca é editado ou apagado. Se algo
          estiver errado, corrija com uma entrada nova.
        </p>

        <div className="mt-3 border border-hairline-strong bg-surface p-4">
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escreva uma atualização..."
            rows={3}
            className="w-full resize-none border border-hairline-strong bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={handleAdd}
              disabled={saving || !texto.trim()}
              className="border border-gold bg-gold px-4 py-1.5 text-xs text-bg transition-all duration-150 hover:bg-transparent hover:text-gold disabled:opacity-50"
            >
              {saving ? "Salvando..." : "+ Adicionar ao histórico"}
            </button>
          </div>
          {error && (
            <p role="alert" className="mt-2 text-xs text-error">
              {error}
            </p>
          )}
        </div>

        <div className="mt-3 border border-hairline">
          {timeline.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-ink-dim">
              Nenhuma entrada ainda — a primeira vira a Anamnese do caso.
            </p>
          )}
          {timeline.map((entry, index) => {
            const isAnamnese = index === timeline.length - 1;
            return (
              <div
                key={entry.id}
                className={`px-4 py-3 ${
                  index !== timeline.length - 1 ? "border-b border-hairline" : ""
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`font-mono text-[10px] uppercase tracking-wide ${
                      isAnamnese ? "text-gold" : "text-wine"
                    }`}
                  >
                    {isAnamnese ? "Anamnese" : "Atualização"}
                  </span>
                  <span className="text-xs text-ink-dim">
                    {formatDateTime(entry.created_at)}
                  </span>
                  <span className="text-xs text-ink-dim">· {entry.autor}</span>
                </div>
                <p className="mt-1.5 whitespace-pre-wrap text-sm text-ink">
                  {entry.texto}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
