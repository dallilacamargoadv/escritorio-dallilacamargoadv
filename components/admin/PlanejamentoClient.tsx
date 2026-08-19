"use client";

import { useState } from "react";
import type { MetaTrimestre } from "@/lib/db-planejamento";

export function PlanejamentoClient({ meta }: { meta: MetaTrimestre }) {
  const [krs, setKrs] = useState(meta.krs);
  const concluidos = krs.filter((kr) => kr.concluido).length;
  const total = krs.length;
  const progresso = total > 0 ? Math.round((concluidos / total) * 100) : 0;

  async function handleToggle(id: string, concluido: boolean) {
    setKrs((prev) => prev.map((kr) => (kr.id === id ? { ...kr, concluido } : kr)));
    await fetch(`/api/admin/planejamento/krs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ concluido }),
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="border-b border-hairline pb-6">
        <p className="font-eyebrow text-[10px] text-ink-dim">
          Planejamento estratégico · {meta.periodo}
        </p>
        <h1 className="mt-3 text-lg italic text-ink">{meta.objetivo}</h1>
      </div>

      <div className="mt-6 flex items-center gap-4 border border-hairline p-5">
        <div className="flex-1">
          <div className="h-2 w-full overflow-hidden bg-surface">
            <div
              className="h-full bg-gold transition-all duration-300"
              style={{ width: `${progresso}%` }}
            />
          </div>
        </div>
        <span className="font-mono text-xs text-ink-dim">
          {concluidos}/{total} concluídos
        </span>
      </div>

      <div className="mt-8 space-y-3">
        {krs.map((kr) => (
          <label
            key={kr.id}
            className="flex cursor-pointer items-start gap-4 border border-hairline p-5 transition-colors duration-150 hover:border-hairline-strong"
          >
            <input
              type="checkbox"
              checked={kr.concluido}
              onChange={(e) => handleToggle(kr.id, e.target.checked)}
              aria-label={
                kr.concluido
                  ? `Reabrir "${kr.titulo}"`
                  : `Marcar "${kr.titulo}" como concluído`
              }
              className="mt-1 h-4 w-4 shrink-0 accent-gold"
            />
            <div>
              <p
                className={`font-mono text-[10px] uppercase tracking-wide text-ink-dim`}
              >
                KR{kr.ordem}
              </p>
              <p
                className={`mt-1 text-sm text-ink ${kr.concluido ? "text-ink-dim line-through" : ""}`}
              >
                {kr.titulo}
              </p>
              {kr.descricao && (
                <p className="mt-1 text-xs text-ink-dim">{kr.descricao}</p>
              )}
            </div>
          </label>
        ))}
      </div>

      <p className="mt-10 font-mono text-[10px] text-ink-dim">
        Plano completo (fases, metas financeiras, linha editorial) em{" "}
        <code>Estrategia Comercial/planejamento-estrategico-okrs-kpis.md</code> — esta tela
        mostra só o objetivo do trimestre, pra você conferir no dia a dia.
      </p>
    </div>
  );
}
