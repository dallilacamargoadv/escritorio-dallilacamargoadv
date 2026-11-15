"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { formatarTempo } from "@/lib/estudos-desempenho";
import { htmlSeguro } from "@/lib/estudos-html";
import type { QuestaoProva } from "@/lib/estudos-simulados";
import { BOTAO_PRIMARIO, BOTAO_SECUNDARIO, Card } from "@/components/estudos/ui";

const LETRAS = ["A", "B", "C", "D", "E"];

interface Estado {
  marcadas: (number | null)[];
  tempos: number[];
  decorrido: number;
  atual: number;
}

function relogio(seg: number) {
  const s = Math.max(0, Math.round(seg));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h ? `${h}:` : ""}${String(m).padStart(h ? 2 : 1, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function SimuladoProva({ id, questoes, limiteSeg }: { id: string; questoes: QuestaoProva[]; limiteSeg: number }) {
  const router = useRouter();
  const chave = `simulado:${id}`;
  const vazio: Estado = { marcadas: questoes.map(() => null), tempos: questoes.map(() => 0), decorrido: 0, atual: 0 };
  const [estado, setEstado] = useState<Estado>(vazio);
  const [carregado, setCarregado] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const topo = useRef<HTMLDivElement>(null);

  // retoma o progresso salvo neste navegador (recarregar a página não perde nada)
  useEffect(() => {
    // fora do corpo do efeito (o servidor não tem localStorage, então a leitura é só depois de montar)
    const t = setTimeout(() => {
      try {
        const salvo = JSON.parse(localStorage.getItem(chave) ?? "null") as Estado | null;
        if (salvo && salvo.marcadas?.length === questoes.length) setEstado(salvo);
      } catch {}
      setCarregado(true);
    }, 0);
    return () => clearTimeout(t);
  }, [chave, questoes.length]);

  useEffect(() => {
    if (!carregado) return;
    try {
      localStorage.setItem(chave, JSON.stringify(estado));
    } catch {}
  }, [carregado, chave, estado]);

  useEffect(() => {
    if (!carregado || pausado || enviando) return;
    const t = setInterval(() => {
      setEstado((e) => {
        const tempos = [...e.tempos];
        tempos[e.atual] = (tempos[e.atual] ?? 0) + 1;
        return { ...e, tempos, decorrido: e.decorrido + 1 };
      });
    }, 1000);
    return () => clearInterval(t);
  }, [carregado, pausado, enviando]);

  const q = questoes[estado.atual];
  const respondidas = estado.marcadas.filter((m) => m !== null).length;
  const restante = limiteSeg - estado.decorrido;

  function ir(i: number) {
    setEstado((e) => ({ ...e, atual: Math.max(0, Math.min(questoes.length - 1, i)) }));
    topo.current?.scrollIntoView({ block: "start" });
  }
  function marcar(i: number) {
    setEstado((e) => {
      const marcadas = [...e.marcadas];
      marcadas[e.atual] = marcadas[e.atual] === i ? null : i;
      return { ...e, marcadas };
    });
  }

  async function entregar() {
    const brancas = questoes.length - respondidas;
    if (!confirm(brancas ? `Entregar com ${brancas} questão(ões) em branco? Elas contam como erro.` : "Entregar o simulado?")) return;
    setEnviando(true);
    setErro("");
    const res = await fetch(`/api/admin/estudos/simulados/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        duracao_seg: estado.decorrido,
        respostas: questoes.map((x, i) => ({ questao_id: x.id, alternativa: estado.marcadas[i], tempo_seg: estado.tempos[i] })),
      }),
    });
    if (!res.ok) {
      setErro((await res.json().catch(() => null))?.error ?? "Não foi possível entregar");
      setEnviando(false);
      return;
    }
    try {
      localStorage.removeItem(chave);
    } catch {}
    router.refresh();
  }

  async function descartar() {
    if (!confirm("Descartar este simulado? Nada será gravado.")) return;
    await fetch(`/api/admin/estudos/simulados/${id}`, { method: "DELETE" });
    try {
      localStorage.removeItem(chave);
    } catch {}
    router.push("/admin/estudos/simulados");
    router.refresh();
  }

  return (
    <div ref={topo} className="space-y-4 scroll-mt-4">
      <div className="sticky top-0 z-10 -mx-1 flex flex-wrap items-center gap-3 rounded-2xl border border-e-line bg-e-card/95 px-4 py-3 backdrop-blur">
        <div>
          <p className="text-[11px] text-e-dim">Tempo de prova</p>
          <p className="text-xl font-medium tabular-nums text-e-ink">{relogio(estado.decorrido)}</p>
        </div>
        <div>
          <p className="text-[11px] text-e-dim">{restante >= 0 ? "Restante (3 min/questão)" : "Passou do tempo de referência"}</p>
          <p className={`text-xl font-medium tabular-nums ${restante >= 0 ? (restante < 600 ? "text-e-warn" : "text-e-ok") : "text-e-bad"}`}>
            {restante >= 0 ? relogio(restante) : `+${relogio(-restante)}`}
          </p>
        </div>
        <p className="text-sm text-e-dim tabular-nums">
          {respondidas}/{questoes.length} marcadas
        </p>
        <div className="ml-auto flex flex-wrap gap-2">
          <button type="button" className={BOTAO_SECUNDARIO} onClick={() => setPausado((p) => !p)}>
            {pausado ? <Play size={14} /> : <Pause size={14} />} {pausado ? "Continuar" : "Pausar"}
          </button>
          <button type="button" className={BOTAO_PRIMARIO} onClick={entregar} disabled={enviando || !carregado}>
            {enviando ? "Corrigindo..." : "Entregar"}
          </button>
        </div>
      </div>
      {erro && <p className="text-sm text-e-bad">{erro}</p>}

      <nav aria-label="Questões do simulado" className="flex flex-wrap gap-1.5">
        {questoes.map((x, i) => (
          <button
            key={x.id}
            type="button"
            onClick={() => ir(i)}
            aria-current={i === estado.atual ? "true" : undefined}
            className={`h-8 w-8 rounded-lg border text-xs tabular-nums transition-colors duration-150 ${
              i === estado.atual
                ? "border-e-accent bg-e-accent-soft text-e-ink"
                : estado.marcadas[i] !== null
                  ? "border-e-line bg-e-card-2 text-e-ink"
                  : "border-e-line text-e-dim hover:text-e-ink"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </nav>

      {pausado ? (
        <Card>
          <p className="text-sm text-e-dim">Simulado pausado. O cronômetro parou e a questão está escondida.</p>
        </Card>
      ) : (
        q && (
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] uppercase tracking-[0.14em] text-e-dim">
                Questão {estado.atual + 1} · {q.materia}
              </p>
              <span className="rounded-full border border-e-line px-2.5 py-0.5 text-xs tabular-nums text-e-blue" aria-label="Tempo nesta questão">
                {formatarTempo(estado.tempos[estado.atual] ?? 0)}
              </span>
            </div>
            <div className="mt-3 text-[15px] leading-relaxed text-e-ink" dangerouslySetInnerHTML={{ __html: htmlSeguro(q.enun) }} />
            {q.itens && (
              <ol className="mt-3 space-y-1.5 text-sm leading-relaxed text-e-ink">
                {q.itens.map((it, i) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: htmlSeguro(it) }} />
                ))}
              </ol>
            )}
            <fieldset className="mt-4 space-y-2">
              <legend className="sr-only">Alternativas</legend>
              {q.alts.map((alt, i) => (
                <label
                  key={i}
                  className={`flex cursor-pointer gap-3 rounded-xl border p-3 text-sm transition-colors duration-150 ${
                    estado.marcadas[estado.atual] === i ? "border-e-accent bg-e-accent-soft" : "border-e-line hover:border-e-dim"
                  }`}
                >
                  <input type="checkbox" className="sr-only" checked={estado.marcadas[estado.atual] === i} onChange={() => marcar(i)} />
                  <span className="font-medium text-e-dim">{LETRAS[i]})</span>
                  <span className="min-w-0 flex-1 text-e-ink" dangerouslySetInnerHTML={{ __html: htmlSeguro(alt) }} />
                </label>
              ))}
            </fieldset>
            <div className="mt-4 flex items-center justify-between gap-2">
              <button type="button" className={BOTAO_SECUNDARIO} onClick={() => ir(estado.atual - 1)} disabled={estado.atual === 0}>
                <ChevronLeft size={14} /> Anterior
              </button>
              <p className="text-xs text-e-dim">Clique de novo na alternativa para desmarcar.</p>
              <button type="button" className={BOTAO_SECUNDARIO} onClick={() => ir(estado.atual + 1)} disabled={estado.atual === questoes.length - 1}>
                Próxima <ChevronRight size={14} />
              </button>
            </div>
          </Card>
        )
      )}

      <button type="button" onClick={descartar} className="text-xs text-e-dim underline-offset-2 hover:text-e-bad hover:underline">
        Descartar simulado
      </button>
    </div>
  );
}
