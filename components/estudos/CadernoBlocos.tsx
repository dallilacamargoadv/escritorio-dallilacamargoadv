"use client";

import { useEffect, useRef, useState } from "react";
import type { Bloco } from "@/lib/estudos-cadernos";
import { fonteHtml, htmlSeguro } from "@/lib/estudos-html";
import { Sparkle } from "@/components/estudos/Sparkle";

const H = (s: string) => ({ __html: htmlSeguro(s) });
const BTN = "rounded-full border border-e-line px-3 py-1.5 text-xs text-e-dim transition-colors duration-150 hover:text-e-ink";
const BTN_ON = "rounded-full border border-e-glow bg-e-glow px-3 py-1.5 text-xs text-e-bg";

function Matriz({ b }: { b: Extract<Bloco, { t: "matriz" }> }) {
  const [sel, setSel] = useState<[number, number] | null>(null);
  const [soTipicas, setSoTipicas] = useState(false);
  return (
    <div className="rounded-2xl border border-e-line bg-e-card p-4">
      <div className="grid gap-2" style={{ gridTemplateColumns: `minmax(70px,110px) repeat(${b.colunas.length}, minmax(0,1fr))` }}>
        <span />
        {b.colunas.map((c) => (
          <span key={c} className="text-center text-xs font-medium text-e-ink">{c}</span>
        ))}
        {b.linhas.map((l, i) => (
          <div key={l} className="contents">
            <span className="self-center text-xs font-medium text-e-ink">{l}</span>
            {b.celulas[i].map(([tipica], j) => {
              const ativa = sel?.[0] === i && sel?.[1] === j;
              return (
                <button
                  key={j}
                  type="button"
                  onClick={() => setSel([i, j])}
                  aria-pressed={ativa}
                  className={`min-h-14 rounded-xl border px-1 text-xs font-medium transition-all duration-200 hover:-translate-y-0.5 ${
                    tipica ? "border-e-ok/50 bg-e-ok-soft text-e-ok" : "border-e-line bg-e-card-2 text-e-dim"
                  } ${ativa ? "outline outline-2 outline-e-glow" : ""} ${soTipicas && !tipica ? "opacity-25" : ""}`}
                >
                  {tipica ? "Típica" : "Atípica"}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <button type="button" className={`${soTipicas ? BTN_ON : BTN} mt-3`} aria-pressed={soTipicas} onClick={() => setSoTipicas((v) => !v)}>
        Destacar só as típicas
      </button>
      <p className="mt-3 min-h-12 border-l-2 border-e-accent pl-3 text-sm text-e-ink" aria-live="polite">
        {sel ? (
          <>
            <b className="font-medium">{b.linhas[sel[0]]} · {b.colunas[sel[1]]}.</b> <span dangerouslySetInnerHTML={H(b.celulas[sel[0]][sel[1]][1])} />
          </>
        ) : (
          <span className="text-e-dim">Toque numa célula para ver o exemplo.</span>
        )}
      </p>
    </div>
  );
}

function Virar({ b }: { b: Extract<Bloco, { t: "virar" }> }) {
  const [viradas, setViradas] = useState<boolean[]>(() => b.cartas.map(() => false));
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {b.cartas.map((c, i) => (
        <button
          key={i}
          type="button"
          aria-pressed={viradas[i]}
          aria-label={`${c.frente}: toque para virar`}
          onClick={() => setViradas((v) => v.map((x, j) => (j === i ? !x : x)))}
          className="group min-h-48 text-left [perspective:900px]"
        >
          <span
            className={`relative block h-full min-h-48 transition-transform duration-700 [transform-style:preserve-3d] motion-reduce:transition-none ${viradas[i] ? "[transform:rotateY(180deg)]" : ""}`}
          >
            <span className="absolute inset-0 flex flex-col justify-center gap-1 rounded-2xl border border-e-line bg-e-card p-5 [backface-visibility:hidden]">
              <span className="text-xl font-medium text-e-ink">{c.frente}</span>
              {c.sub && <span className="text-xs text-e-dim">{c.sub}</span>}
              <span className="mt-2 text-[11px] text-e-dim">Toque para virar</span>
            </span>
            <span className="absolute inset-0 flex flex-col justify-center gap-2 rounded-2xl border border-e-accent bg-e-accent-soft p-5 [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <span className="text-sm font-medium text-e-ink" dangerouslySetInnerHTML={H(c.verso)} />
              {c.detalhe && <span className="text-xs text-e-dim" dangerouslySetInnerHTML={H(c.detalhe)} />}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}

function Passos({ b }: { b: Extract<Bloco, { t: "passos" }> }) {
  const [p, setP] = useState(0);
  const [rodando, setRodando] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);
  function parar() {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setRodando(false);
  }
  function animar() {
    if (rodando) return parar();
    setP(0);
    setRodando(true);
    timer.current = setInterval(() => {
      setP((x) => {
        if (x >= b.passos.length - 1) {
          parar();
          return x;
        }
        return x + 1;
      });
    }, 2200);
  }
  const n = b.nos.length;
  const largura = 680;
  const w = 150;
  const gap = (largura - n * w) / (n + 1);
  const xNo = (i: number) => gap + i * (w + gap);
  const atual = b.passos[p];
  return (
    <div className="rounded-2xl border border-e-line bg-e-card p-4">
      <svg viewBox={`0 0 ${largura} 170`} className="w-full" role="img" aria-label={b.nos.map((x) => x.titulo).join(", depois ")}>
        {b.nos.slice(0, -1).map((_, i) => (
          <path key={i} d={`M${xNo(i) + w} 105 H${xNo(i + 1)}`} stroke="var(--e-line)" strokeWidth="2" strokeDasharray="5 5" fill="none" />
        ))}
        {b.nos.map((no, i) => (
          <g key={i}>
            <rect
              x={xNo(i)}
              y="70"
              width={w}
              height="72"
              rx="12"
              fill={atual.no === i ? "var(--e-accent-soft)" : "var(--e-card-2)"}
              stroke={atual.no === i ? "var(--e-accent)" : "var(--e-line)"}
              strokeWidth={atual.no === i ? 2 : 1}
              className="transition-all duration-500"
            />
            <text x={xNo(i) + w / 2} y="102" textAnchor="middle" fill="var(--e-ink)" fontSize="14">{no.titulo}</text>
            <text x={xNo(i) + w / 2} y="122" textAnchor="middle" fill="var(--e-dim)" fontSize="11">{no.sub}</text>
          </g>
        ))}
        <g style={{ transform: `translateX(${xNo(atual.no) - xNo(0)}px)` }} className="transition-transform duration-[900ms] ease-[cubic-bezier(.5,0,.2,1)] motion-reduce:transition-none">
          <circle cx={xNo(0) + w / 2} cy="38" r="17" fill="var(--e-accent)" />
          <path transform={`translate(${xNo(0) + w / 2 - 9} 29) scale(0.28)`} d="M32,4 C36,20 44,28 60,32 C44,36 36,44 32,60 C28,44 20,36 4,32 C20,28 28,20 32,4 Z" fill="var(--e-glow)" />
        </g>
      </svg>
      <p className="mt-2 min-h-14 text-sm text-e-ink" aria-live="polite">
        <b className="font-medium">Passo {p + 1} de {b.passos.length}.</b> <span dangerouslySetInnerHTML={H(atual.texto)} />
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" className={BTN} onClick={() => { parar(); setP((x) => Math.max(0, x - 1)); }}>Anterior</button>
        <button type="button" className={BTN_ON} onClick={() => { parar(); setP((x) => Math.min(b.passos.length - 1, x + 1)); }}>Próximo</button>
        <button type="button" className={BTN} onClick={animar}>{rodando ? "Parar" : "Animar"}</button>
      </div>
    </div>
  );
}

function Alternar({ b }: { b: Extract<Bloco, { t: "alternar" }> }) {
  const [i, setI] = useState(0);
  const o = b.opcoes[i];
  return (
    <div className="rounded-2xl border border-e-line bg-e-card p-4">
      <div className="flex flex-wrap gap-2" role="tablist">
        {b.opcoes.map((op, j) => (
          <button key={op.rotulo} type="button" role="tab" aria-selected={i === j} className={i === j ? BTN_ON : BTN} onClick={() => setI(j)}>
            {op.rotulo}
          </button>
        ))}
      </div>
      <div key={i} className="mt-4 animate-[e-surge_.45s_ease-out] motion-reduce:animate-none">
        {o.modo === "dentro" ? (
          <div className="rounded-2xl border border-e-line p-3">
            <p className="text-xs text-e-dim">{o.caixas[0].titulo}</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {o.caixas.slice(1).map((c) => (
                <div key={c.titulo} className="rounded-xl border border-e-accent bg-e-accent-soft p-3 text-center">
                  <p className="text-sm text-e-ink">{c.titulo}</p>
                  <p className="text-[11px] text-e-dim">{c.sub}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            {o.caixas.map((c, j) => (
              <div key={c.titulo} className="contents">
                {j > 0 && <span className="text-center text-e-accent" aria-hidden="true">→</span>}
                <div className={`flex-1 rounded-xl border p-3 text-center ${j > 0 ? "border-e-accent bg-e-accent-soft" : "border-e-line bg-e-card-2"}`}>
                  <p className="text-sm text-e-ink">{c.titulo}</p>
                  <p className="text-[11px] text-e-dim">{c.sub}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="mt-3 text-sm text-e-ink" dangerouslySetInnerHTML={H(o.texto)} />
      </div>
    </div>
  );
}

function VF({ b }: { b: Extract<Bloco, { t: "vf" }> }) {
  const [resp, setResp] = useState<(boolean | null)[]>(() => b.itens.map(() => null));
  return (
    <ul className="space-y-2">
      {b.itens.map((it, i) => {
        const r = resp[i];
        const acertou = r !== null && r === it.v;
        return (
          <li key={i} className={`rounded-xl border p-3 ${r === null ? "border-e-line bg-e-card" : acertou ? "border-e-ok/50 bg-e-ok-soft" : "border-e-bad/50 bg-e-bad-soft"}`}>
            <div className="flex items-start justify-between gap-3">
              <span className="text-sm text-e-ink" dangerouslySetInnerHTML={H(it.texto)} />
              <span className="flex shrink-0 gap-1.5">
                {[true, false].map((v) => (
                  <button key={String(v)} type="button" disabled={r !== null} onClick={() => setResp((x) => x.map((y, j) => (j === i ? v : y)))} className={BTN}>
                    {v ? "V" : "F"}
                  </button>
                ))}
              </span>
            </div>
            {r !== null && (
              <p className={`mt-1 text-xs ${acertou ? "text-e-ok" : "text-e-bad"}`}>
                {acertou ? "Acertou. " : "Quase. "}
                <span className="text-e-ink/80" dangerouslySetInnerHTML={H(it.porque)} />
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function Escada({ b }: { b: Extract<Bloco, { t: "escada" }> }) {
  const [i, setI] = useState<number | null>(null);
  const n = b.degraus.length;
  return (
    <div className="rounded-2xl border border-e-line bg-e-card p-4">
      <div className="flex h-56 items-end gap-2">
        {b.degraus.map((d, j) => (
          <button
            key={d.titulo}
            type="button"
            aria-pressed={i === j}
            onClick={() => setI(j)}
            style={{ height: `${100 - (j * 66) / Math.max(1, n - 1)}%` }}
            className={`flex-1 rounded-t-xl border px-1 py-2 text-xs font-medium transition-colors duration-300 ${i === j ? "border-e-accent bg-e-accent-soft text-e-ink" : "border-e-line bg-e-card-2 text-e-dim"}`}
          >
            {d.titulo}
            <span className="block text-[10px] font-normal opacity-80">{d.sub}</span>
          </button>
        ))}
      </div>
      <p className="mt-3 min-h-12 border-l-2 border-e-accent pl-3 text-sm text-e-ink" aria-live="polite">
        {i === null ? <span className="text-e-dim">Toque num degrau.</span> : <><b className="font-medium">{b.degraus[i].titulo}.</b> <span dangerouslySetInnerHTML={H(b.degraus[i].texto)} /></>}
      </p>
    </div>
  );
}

function Abrir({ b }: { b: Extract<Bloco, { t: "abrir" }> }) {
  const [aberto, setAberto] = useState<boolean[]>(() => b.cartas.map(() => false));
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {b.cartas.map((c, i) => (
        <button
          key={c.titulo}
          type="button"
          aria-expanded={aberto[i]}
          onClick={() => setAberto((v) => v.map((x, j) => (j === i ? !x : x)))}
          className={`rounded-2xl border p-4 text-left transition-colors duration-200 ${aberto[i] ? "border-e-accent bg-e-accent-soft" : "border-e-line bg-e-card"}`}
        >
          <span className="text-[11px] uppercase tracking-[0.12em] text-e-dim">{c.tag}</span>
          <span className="mt-0.5 block text-base font-medium text-e-ink">{c.titulo}</span>
          {aberto[i] && <span className="mt-2 block text-sm text-e-ink/90" dangerouslySetInnerHTML={H(c.texto)} />}
        </button>
      ))}
    </div>
  );
}

const TOM: Record<string, { cls: string; rot: string }> = {
  pegadinha: { cls: "border-e-bad/50 bg-e-bad-soft", rot: "Pegadinha FCC" },
  atencao: { cls: "border-e-warn/50 bg-e-warn-soft", rot: "Atenção" },
  macete: { cls: "border-e-ok/50 bg-e-ok-soft", rot: "Macete" },
  hipotese: { cls: "border-e-line bg-e-card-2", rot: "Hipótese, não dado" },
};

export function BlocoView({ b }: { b: Bloco }) {
  switch (b.t) {
    case "texto":
      return <div className="space-y-3 text-[15px] leading-relaxed text-e-ink/90 [&_b]:font-medium [&_b]:text-e-ink" dangerouslySetInnerHTML={H(b.html)} />;
    case "lei":
      return (
        <figure className="rounded-xl border-l-2 border-e-blue bg-e-card-2 px-4 py-3">
          <figcaption className="text-[11px] uppercase tracking-[0.12em] text-e-blue">Lei seca · {b.ref}</figcaption>
          <blockquote className="fonte-lei mt-1 text-sm leading-relaxed text-e-ink" dangerouslySetInnerHTML={{ __html: fonteHtml(b.texto) }} />
        </figure>
      );
    case "leia":
      return (
        <div className="flex gap-3 rounded-xl border border-e-blue/40 bg-e-card-2 px-4 py-3">
          <span aria-hidden="true" className="text-lg leading-none text-e-blue">§</span>
          <p className="text-sm text-e-ink">
            <b className="font-medium">Leia agora: {b.ref}.</b> <span className="text-e-dim">{b.motivo}</span>
          </p>
        </div>
      );
    case "nota":
      return (
        <div className={`rounded-xl border px-4 py-3 ${TOM[b.tom].cls}`}>
          <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-e-dim">
            {b.tom === "pegadinha" && <Sparkle size={11} cor="var(--e-bad)" />} {TOM[b.tom].rot}
          </p>
          <p className="mt-0.5 text-sm font-medium text-e-ink">{b.titulo}</p>
          <p className="mt-1 text-sm text-e-ink/90" dangerouslySetInnerHTML={H(b.html)} />
        </div>
      );
    case "juris":
      return (
        <div className="rounded-xl border border-e-line bg-e-card px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-e-warn">Jurisprudência · {b.tribunal}</p>
          <p className="mt-1 text-sm text-e-ink" dangerouslySetInnerHTML={H(b.tese)} />
          <p className="mt-1 text-[11px] text-e-dim">{b.ref}</p>
        </div>
      );
    case "tabela":
      return (
        <div className="overflow-x-auto rounded-xl border border-e-line">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-e-card-2 text-[11px] uppercase tracking-[0.1em] text-e-dim">
              <tr>{b.cab.map((c) => <th key={c} className="px-3 py-2 font-normal">{c}</th>)}</tr>
            </thead>
            <tbody>
              {b.linhas.map((l, i) => (
                <tr key={i} className="border-t border-e-line">
                  {l.map((c, j) => <td key={j} className={`px-3 py-2 align-top ${j === 0 ? "font-medium text-e-ink" : "text-e-ink/85"}`} dangerouslySetInnerHTML={H(c)} />)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "matriz":
      return <Matriz b={b} />;
    case "virar":
      return <Virar b={b} />;
    case "passos":
      return <Passos b={b} />;
    case "alternar":
      return <Alternar b={b} />;
    case "vf":
      return <VF b={b} />;
    case "escada":
      return <Escada b={b} />;
    case "abrir":
      return <Abrir b={b} />;
  }
}
