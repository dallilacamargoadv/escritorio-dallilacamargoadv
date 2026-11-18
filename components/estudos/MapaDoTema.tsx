"use client";

import { useState } from "react";
import { Sparkle } from "@/components/estudos/Sparkle";
import { htmlSeguro } from "@/lib/estudos-html";

export interface Mapa {
  titulo: string;
  passos: { t: string; r?: string; d: string; lei?: string }[];
  teste: { p: string; v: boolean; exp: string };
}

/** Fluxograma clicável do tema + teste de um clique. Aparece quando ela erra a questão. */
export function MapaDoTema({ mapa, aberto = true }: { mapa: Mapa; aberto?: boolean }) {
  const [ver, setVer] = useState(aberto);
  const [passo, setPasso] = useState(0);
  const [resposta, setResposta] = useState<boolean | null>(null);
  const p = mapa.passos[passo];

  if (!ver) {
    return (
      <button type="button" onClick={() => setVer(true)} className="text-xs text-e-dim underline-offset-2 hover:text-e-ink hover:underline">
        Ver o mapa do tema: {mapa.titulo}
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-e-accent/40 bg-e-card-2 p-4">
      <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-e-dim">
        <Sparkle size={12} /> Entenda em 1 minuto · {mapa.titulo}
      </p>
      <div className="mt-3 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <ol className="space-y-0">
          {mapa.passos.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => setPasso(i)}
                aria-current={i === passo ? "step" : undefined}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors duration-150 ${
                  i === passo ? "border-e-accent bg-e-accent-soft text-e-ink" : "border-e-line text-e-dim hover:text-e-ink"
                }`}
              >
                {s.t}
              </button>
              {i < mapa.passos.length - 1 && (
                <p className="py-1 text-center text-[11px] text-e-dim" aria-hidden="true">
                  {s.r ? `${s.r} ↓` : "↓"}
                </p>
              )}
            </li>
          ))}
        </ol>
        <div className="rounded-lg border border-e-line p-3" aria-live="polite">
          <p className="text-sm leading-relaxed text-e-ink">{p.d}</p>
          {p.lei && (
            <div className="mt-2 border-l-2 border-e-accent/60 pl-3 font-serif text-[14px] leading-relaxed text-e-dim" dangerouslySetInnerHTML={{ __html: htmlSeguro(p.lei) }} />
          )}
          {passo < mapa.passos.length - 1 && (
            <button type="button" onClick={() => setPasso(passo + 1)} className="mt-3 text-xs text-e-dim hover:text-e-ink">
              Próximo passo →
            </button>
          )}
        </div>
      </div>
      <div className="mt-4 border-t border-e-line pt-3">
        <p className="text-sm text-e-ink">
          Teste rápido: <span className="text-e-dim">{mapa.teste.p}</span>
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {[true, false].map((v) => (
            <button
              key={String(v)}
              type="button"
              onClick={() => setResposta(v)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors duration-150 ${resposta === v ? "border-e-glow bg-e-glow text-e-bg" : "border-e-line text-e-dim hover:text-e-ink"}`}
            >
              {v ? "Certo" : "Errado"}
            </button>
          ))}
          {resposta !== null && (
            <span className={`text-sm ${resposta === mapa.teste.v ? "text-e-ok" : "text-e-bad"}`}>
              {resposta === mapa.teste.v ? "Isso. " : "Ainda não. "}
              {mapa.teste.exp}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
