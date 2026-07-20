"use client";

import { useEffect, useRef, useState } from "react";
import type { FrenteEtapa } from "@/lib/db-frente-etapas";
import {
  formatSegundos,
  isEtapaAtrasada,
  tempoExibidoEtapa,
} from "@/lib/frente-etapas-utils";

export function FrenteEtapasStepper({
  casoId,
  frenteId,
}: {
  casoId: string;
  frenteId: string;
}) {
  const [etapas, setEtapas] = useState<FrenteEtapa[] | null>(null);
  const [novaEtapa, setNovaEtapa] = useState("");
  const [saving, setSaving] = useState(false);
  const [, setTick] = useState(0);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    fetch(`/api/admin/casos/${casoId}/frentes/${frenteId}/etapas`)
      .then((res) => res.json())
      .then((data) => setEtapas(data.etapas ?? []));
  }, [casoId, frenteId]);

  useEffect(() => {
    const algumRodando = etapas?.some((e) => e.timer_iniciado_em);
    if (!algumRodando) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [etapas]);

  async function handleToggleTimer(etapa: FrenteEtapa) {
    const acao = etapa.timer_iniciado_em ? "stop" : "start";
    const res = await fetch(
      `/api/admin/casos/${casoId}/frentes/${frenteId}/etapas/${etapa.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timer_action: acao }),
      },
    );
    const data = await res.json();
    if (data.etapa) {
      setEtapas((prev) =>
        prev ? prev.map((e) => (e.id === etapa.id ? data.etapa : e)) : prev,
      );
    }
  }


  async function handleToggleStatus(etapa: FrenteEtapa) {
    const novoStatus = etapa.status === "concluida" ? "pendente" : "concluida";
    setEtapas((prev) =>
      prev
        ? prev.map((e) => (e.id === etapa.id ? { ...e, status: novoStatus } : e))
        : prev,
    );
    const res = await fetch(
      `/api/admin/casos/${casoId}/frentes/${frenteId}/etapas/${etapa.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      },
    );
    const data = await res.json();
    if (data.etapa) {
      setEtapas((prev) =>
        prev ? prev.map((e) => (e.id === etapa.id ? data.etapa : e)) : prev,
      );
    }
  }

  async function handleToggleChecklist(etapa: FrenteEtapa, index: number) {
    const marcados = etapa.checklist_marcados.includes(index)
      ? etapa.checklist_marcados.filter((i) => i !== index)
      : [...etapa.checklist_marcados, index];

    setEtapas((prev) =>
      prev
        ? prev.map((e) =>
            e.id === etapa.id ? { ...e, checklist_marcados: marcados } : e,
          )
        : prev,
    );
    await fetch(`/api/admin/casos/${casoId}/frentes/${frenteId}/etapas/${etapa.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checklist_marcados: marcados }),
    });
  }

  async function handleAnexar(etapa: FrenteEtapa) {
    const file = fileInputs.current[etapa.id]?.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("caso_id", casoId);
    formData.append("file", file);
    formData.append("descricao", `Peça — ${etapa.nome}`);

    const uploadRes = await fetch("/api/admin/documentos", {
      method: "POST",
      body: formData,
    });
    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) return;

    const res = await fetch(
      `/api/admin/casos/${casoId}/frentes/${frenteId}/etapas/${etapa.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documento_id: uploadData.documento.id }),
      },
    );
    const data = await res.json();
    if (data.etapa) {
      setEtapas((prev) =>
        prev ? prev.map((e) => (e.id === etapa.id ? data.etapa : e)) : prev,
      );
    }
  }

  async function handleAddEtapa() {
    if (!novaEtapa.trim() || !etapas) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/admin/casos/${casoId}/frentes/${frenteId}/etapas`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome: novaEtapa.trim(), ordem: etapas.length }),
        },
      );
      const data = await res.json();
      if (res.ok && data.etapa) {
        setEtapas((prev) => (prev ? [...prev, data.etapa] : prev));
        setNovaEtapa("");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteEtapa(etapa: FrenteEtapa) {
    if (!confirm(`Excluir a etapa "${etapa.nome}"?`)) return;
    setEtapas((prev) => (prev ? prev.filter((e) => e.id !== etapa.id) : prev));
    await fetch(`/api/admin/casos/${casoId}/frentes/${frenteId}/etapas/${etapa.id}`, {
      method: "DELETE",
    });
  }

  if (etapas === null) {
    return <p className="px-4 py-3 text-xs text-ink-dim">Carregando etapas…</p>;
  }

  return (
    <div className="border-t border-hairline bg-bg-alt px-4 py-3">
      {etapas.length === 0 && (
        <p className="text-xs text-ink-dim">
          Nenhuma etapa ainda (sem modelo cadastrado pra essa área/tipo, ou nenhuma
          adicionada na mão).
        </p>
      )}
      <div className="flex flex-col">
        {etapas.map((etapa, index) => {
          const done = etapa.status === "concluida";
          const atrasada = isEtapaAtrasada(etapa);
          const timerRodando = Boolean(etapa.timer_iniciado_em);
          return (
            <div
              key={etapa.id}
              className={`flex gap-3 py-2.5 ${
                index !== etapas.length - 1 ? "border-b border-hairline" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => handleToggleStatus(etapa)}
                className={`mt-0.5 h-5 w-5 shrink-0 rounded-full border font-mono text-[10px] transition-colors duration-150 ${
                  done
                    ? "border-success bg-success text-bg"
                    : "border-hairline-strong text-ink-dim hover:border-gold hover:text-gold"
                }`}
              >
                {done ? "✓" : index + 1}
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-sm ${done ? "text-ink-dim line-through" : "text-ink"}`}>
                    {etapa.nome}
                  </span>
                  <span
                    className={`font-mono text-[9px] uppercase tracking-wide ${
                      done ? "text-success" : "text-ink-dim"
                    }`}
                  >
                    {done ? "Concluída" : "Pendente"}
                  </span>
                  {atrasada && (
                    <span className="border border-error px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-error">
                      Atrasada (SLA {etapa.sla_dias}d)
                    </span>
                  )}
                  {etapa.minuta_url && (
                    <a
                      href={etapa.minuta_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[9px] text-gold hover:underline"
                    >
                      minuta ↗
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteEtapa(etapa)}
                    className="ml-auto text-[10px] text-error hover:underline"
                  >
                    excluir
                  </button>
                </div>

                {etapa.checklist_texto.length > 0 && (
                  <div className="mt-1.5 flex flex-col gap-1">
                    {etapa.checklist_texto.map((item, i) => (
                      <label
                        key={i}
                        className="flex items-center gap-2 text-xs text-ink-dim"
                      >
                        <input
                          type="checkbox"
                          checked={etapa.checklist_marcados.includes(i)}
                          onChange={() => handleToggleChecklist(etapa, i)}
                        />
                        <span
                          className={
                            etapa.checklist_marcados.includes(i) ? "text-ink" : ""
                          }
                        >
                          {item}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                <div className="mt-1.5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleTimer(etapa)}
                    className={`flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[10px] transition-colors duration-150 ${
                      timerRodando
                        ? "border-warning text-warning"
                        : "border-hairline-strong text-ink-dim hover:border-gold hover:text-gold"
                    }`}
                    title="Cronômetro — referência de tempo gasto, não gera cobrança"
                  >
                    {timerRodando ? "⏸ Pausar" : "▶ Iniciar"}
                    <span className="tabular-nums">{formatSegundos(tempoExibidoEtapa(etapa))}</span>
                  </button>
                  <input
                    ref={(el) => {
                      fileInputs.current[etapa.id] = el;
                    }}
                    type="file"
                    onChange={() => handleAnexar(etapa)}
                    className="text-[10px] text-ink-dim file:mr-2 file:border file:border-hairline-strong file:bg-bg file:px-2 file:py-0.5 file:text-[10px] file:text-ink-dim"
                  />
                  {etapa.documento_id && (
                    <span className="font-mono text-[10px] text-gold">
                      📎 peça anexada
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={novaEtapa}
          onChange={(e) => setNovaEtapa(e.target.value)}
          placeholder="Nova etapa..."
          className="min-w-[160px] flex-1 border border-hairline-strong bg-bg px-2 py-1 text-xs text-ink outline-none focus:border-gold"
        />
        <button
          type="button"
          onClick={handleAddEtapa}
          disabled={saving || !novaEtapa.trim()}
          className="border border-hairline-strong px-3 py-1 text-xs text-ink-dim transition-colors duration-150 hover:border-gold hover:text-gold disabled:opacity-50"
        >
          + Etapa
        </button>
      </div>
    </div>
  );
}
