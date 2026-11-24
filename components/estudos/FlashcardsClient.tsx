"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shuffle } from "lucide-react";
import { diasDosBotoes, rotuloEtapa } from "@/lib/estudos-revisao";
import { Sparkle } from "@/components/estudos/Sparkle";
import { BOTAO_PRIMARIO, BOTAO_SECUNDARIO, Card, CardTitulo } from "@/components/estudos/ui";

export interface Baralho {
  nome: string;
  total: number;
  novos: number;
  vencidos: number;
  dominados: number;
  comLei: number;
  /** baralho gerado dos erros dela */
  doErro?: boolean;
}
export interface CartaoFlash {
  id: string;
  baralho: string;
  frente: string;
  verso: string;
  extra: string;
  lei: string;
  fcc: string;
  nivel: number;
  etapa: number;
  /** cartão de erro: link para refazer a questão */
  questaoHref?: string;
  /** "assunto · subtópico" */
  lugar?: string;
  /** o que ela escreveu na última vez */
  respAnterior?: string;
}
export interface Assunto {
  nome: string;
  total: number;
  vencidos: number;
  novos: number;
  subs: { id: string; nome: string; total: number; vencidos: number }[];
}
type Filtros = { baralho: string; nivel: number; modo: "todos" | "vencidos" | "novos" | "esquecidos"; subtema: string; assunto: string; sub: string };

const NIVEIS = ["", "Fácil", "Médio", "Difícil"];
const MODOS: { k: Filtros["modo"]; t: string }[] = [
  { k: "todos", t: "Todos" },
  { k: "vencidos", t: "Vencidos hoje" },
  { k: "novos", t: "Nunca vistos" },
  { k: "esquecidos", t: "Os que esqueci" },
];

const chip = (on: boolean) =>
  `rounded-full border px-3 py-1 text-xs transition-colors duration-150 ${on ? "border-e-glow bg-e-glow text-e-bg" : "border-e-line text-e-dim hover:text-e-ink"}`;

function url(f: Filtros) {
  const p = new URLSearchParams();
  if (f.baralho) p.set("baralho", f.baralho);
  if (f.nivel) p.set("nivel", String(f.nivel));
  if (f.modo !== "todos") p.set("modo", f.modo);
  if (f.subtema) p.set("subtema", f.subtema);
  if (f.assunto) p.set("assunto", f.assunto);
  if (f.sub) p.set("sub", f.sub);
  const q = p.toString();
  return `/admin/estudos/flashcards${q ? `?${q}` : ""}`;
}

const dias = (n: number | null) => (n === null ? "sai da fila" : n === 1 ? "amanhã" : `${n} dias`);

export function FlashcardsClient({ baralhos, assuntos = [], filtros, subtemaNome = "", cartoes }: { baralhos: Baralho[]; assuntos?: Assunto[]; filtros: Filtros; subtemaNome?: string; cartoes: CartaoFlash[] }) {
  const router = useRouter();
  const [fila, setFila] = useState(cartoes);
  const [virado, setVirado] = useState(false);
  const [lembrei, setLembrei] = useState(0);
  const [esqueci, setEsqueci] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [quase, setQuase] = useState(0);
  const [texto, setTexto] = useState("");
  // escrever antes de virar é opcional e começa desligado (pedido dela, 23/11); a escolha fica neste aparelho
  const [escrever, setEscrever] = useState(false);
  useEffect(() => {
    try {
      if (localStorage.getItem("flash-escrever") === "1") setEscrever(true);
    } catch {}
  }, []);
  function trocarEscrever(v: boolean) {
    setEscrever(v);
    try {
      localStorage.setItem("flash-escrever", v ? "1" : "0");
    } catch {}
  }
  const atual = fila[0];
  const ir = (novo: Partial<Filtros>) => router.push(url({ ...filtros, ...novo }));
  const doErro = baralhos.find((b) => b.nome === filtros.baralho)?.doErro ?? false;

  async function responder(ok: boolean, eQuase = false) {
    if (!atual || salvando) return;
    setSalvando(true);
    const res = await fetch("/api/admin/estudos/revisao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: "cartao", id: atual.id, ok, quase: eQuase, resp: escrever ? texto : undefined }),
    }).catch(() => null);
    setSalvando(false);
    if (!res?.ok) {
      const j = await res?.json().catch(() => ({}));
      return setErro(j?.error ?? "Não consegui salvar agora. Confira a conexão e tente de novo.");
    }
    setErro(null);
    setVirado(false);
    setTexto("");
    if (eQuase) setQuase((n) => n + 1);
    else if (ok) setLembrei((n) => n + 1);
    else setEsqueci((n) => n + 1);
    // errou: volta para o fim desta sessão, para tentar de novo antes de sair
    setFila((f) => (ok ? f.slice(1) : [...f.slice(1), f[0]]));
  }

  function embaralhar() {
    setFila((f) => [...f].sort(() => Math.random() - 0.5));
    setVirado(false);
  }

  // atalhos: espaço vira, 1 lembrei, 2 esqueci
  useEffect(() => {
    function tecla(e: KeyboardEvent) {
      if (!atual || (e.target as HTMLElement)?.closest("input,textarea,select")) return;
      if (e.key === " ") {
        e.preventDefault();
        setVirado(true);
      } else if (virado && e.key === "1") void responder(false);
      else if (virado && e.key === "2") void responder(true, true);
      else if (virado && e.key === "3") void responder(true);
    }
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardTitulo>Baralhos</CardTitulo>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {baralhos.map((b) => (
            <button
              key={b.nome}
              type="button"
              onClick={() => ir({ baralho: b.nome, nivel: 0, subtema: "", assunto: "", sub: "" })}
              className={`rounded-xl border p-3 text-left transition-colors duration-150 ${filtros.baralho === b.nome ? "border-e-accent bg-e-accent-soft" : b.doErro ? "border-e-bad/50 bg-e-card-2 hover:border-e-accent/60" : "border-e-line bg-e-card-2 hover:border-e-accent/60"}`}
            >
              <span className="block text-sm text-e-ink">{b.nome}</span>
              <span className="mt-1 block text-[11px] tabular-nums text-e-dim">
                {b.total} cartões · {b.vencidos} vencidos · {b.novos} nunca vistos · {b.dominados} dominados
              </span>
              {b.doErro ? (
                <span className="mt-1 block text-[11px] text-e-dim">Um cartão por questão que você errou: o que marcou, o certo, a lei seca e a sua nota</span>
              ) : (
                b.comLei > 0 && <span className="mt-1 block text-[11px] text-e-dim">{b.comLei} com lei literal e pegadinha FCC</span>
              )}
            </button>
          ))}
        </div>
      </Card>

      {filtros.baralho && assuntos.length > 0 && (
        <Card>
          <CardTitulo>Assuntos de {filtros.baralho}</CardTitulo>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <button type="button" onClick={() => ir({ assunto: "", sub: "" })} className={`rounded-xl border p-3 text-left text-sm ${!filtros.assunto ? "border-e-accent bg-e-accent-soft" : "border-e-line bg-e-card-2 hover:border-e-accent/60"}`}>
              Todos os assuntos
            </button>
            {assuntos.map((a) => (
              <button key={a.nome} type="button" onClick={() => ir({ assunto: a.nome, sub: "" })} className={`rounded-xl border p-3 text-left transition-colors duration-150 ${filtros.assunto === a.nome ? "border-e-accent bg-e-accent-soft" : "border-e-line bg-e-card-2 hover:border-e-accent/60"}`}>
                <span className="block text-sm text-e-ink">{a.nome}</span>
                <span className="mt-1 block text-[11px] tabular-nums text-e-dim">
                  {a.total} cartões · {a.vencidos} para hoje · {a.novos} nunca vistos
                </span>
              </button>
            ))}
          </div>
          {filtros.assunto && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-[11px] text-e-dim">Subtópicos</span>
              <button type="button" onClick={() => ir({ sub: "" })} className={chip(!filtros.sub)}>
                Todos
              </button>
              {assuntos
                .find((a) => a.nome === filtros.assunto)
                ?.subs.map((x) => (
                  <button key={x.id} type="button" onClick={() => ir({ sub: x.id })} className={chip(filtros.sub === x.id)}>
                    {x.nome} <span className="tabular-nums opacity-70">{x.vencidos ? `${x.vencidos} hoje · ` : ""}{x.total}</span>
                  </button>
                ))}
            </div>
          )}
        </Card>
      )}

      {filtros.baralho && (
        <Card>
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            {doErro ? (
              <>
                <span className="mr-1 text-[11px] text-e-dim">Subtema</span>
                {filtros.subtema ? (
                  <button type="button" onClick={() => ir({ subtema: "" })} className={chip(true)}>
                    {subtemaNome} ×
                  </button>
                ) : (
                  <Link href="/admin/estudos/mapa-erros" className={chip(false)}>
                    Escolher no mapa dos erros
                  </Link>
                )}
              </>
            ) : (
              <>
                <span className="mr-1 text-[11px] text-e-dim">Nível</span>
                {[0, 1, 2, 3].map((n) => (
                  <button key={n} type="button" onClick={() => ir({ nivel: n })} className={chip(filtros.nivel === n)}>
                    {n ? NIVEIS[n] : "Todos"}
                  </button>
                ))}
              </>
            )}
            <span className="ml-3 mr-1 text-[11px] text-e-dim">Mostrar</span>
            {MODOS.map((m) => (
              <button key={m.k} type="button" onClick={() => ir({ modo: m.k })} className={chip(filtros.modo === m.k)}>
                {m.t}
              </button>
            ))}
          </div>

          <CardTitulo
            acao={
              <span className="flex items-center gap-3 text-xs tabular-nums text-e-dim">
                {fila.length} na sessão · {lembrei} acertei · {quase} quase · {esqueci} errei
                <label className="inline-flex items-center gap-1 hover:text-e-ink">
                  <input type="checkbox" checked={escrever} onChange={(e) => trocarEscrever(e.target.checked)} /> Escrever antes (opcional)
                </label>
                {fila.length > 1 && (
                  <button type="button" onClick={embaralhar} className="inline-flex items-center gap-1 hover:text-e-ink">
                    <Shuffle size={12} aria-hidden="true" /> Embaralhar
                  </button>
                )}
              </span>
            }
          >
            {filtros.baralho}
          </CardTitulo>

          {!atual ? (
            <p className="flex items-center gap-2 text-sm text-e-dim">
              <Sparkle size={14} /> {cartoes.length ? "Sessão terminada. Troque o filtro para continuar." : "Nenhum cartão com esse filtro."}
            </p>
          ) : (
            <div>
              <p className="text-[11px] text-e-dim">
                {atual.lugar ? `${atual.lugar} · ` : ""}
                {atual.nivel ? `${NIVEIS[atual.nivel]} · ` : ""}
                {atual.etapa < 0 ? "nunca visto" : rotuloEtapa(atual.etapa)}
              </p>
              <div className="mt-2 rounded-xl border border-e-line bg-e-card-2 p-4 text-base leading-relaxed text-e-ink" dangerouslySetInnerHTML={{ __html: atual.frente }} />
              {escrever && !virado && (
                <textarea
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  rows={4}
                  placeholder="Escreva a resposta de cabeça: a regra, a exceção e o artigo, se lembrar."
                  className="mt-2 w-full rounded-xl border border-e-line bg-e-card-2 p-3 text-[15px] leading-relaxed text-e-ink placeholder:text-e-dim focus:border-e-accent focus:outline-none"
                />
              )}
              {virado ? (
                <>
                  {escrever && (
                    <div className="mt-2 rounded-xl border border-e-line px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-e-dim">Sua resposta</p>
                      <p className="mt-1 whitespace-pre-wrap text-[15px] italic leading-relaxed text-e-ink">{texto.trim() || "Você não escreveu nada desta vez."}</p>
                      {atual.respAnterior && atual.respAnterior !== texto.trim() && (
                        <p className="mt-2 whitespace-pre-wrap text-xs text-e-dim">Da última vez: “{atual.respAnterior}”</p>
                      )}
                    </div>
                  )}
                  <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-e-dim">A resposta certa</p>
                  <div className="mt-1 rounded-xl border border-e-accent/40 p-4 text-base leading-relaxed text-e-ink" dangerouslySetInnerHTML={{ __html: atual.verso }} />
                  {atual.lei && (
                    <div className="mt-2 rounded-xl border border-e-line px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-e-dim">{doErro ? "Lei seca da questão" : "Fundamento literal"}</p>
                      <div className="mt-1 font-serif text-[15px] leading-relaxed text-e-ink" dangerouslySetInnerHTML={{ __html: atual.lei }} />
                    </div>
                  )}
                  {atual.fcc && (
                    <p className="mt-2 flex gap-2 text-sm text-e-warn">
                      <Sparkle size={14} cor="var(--e-warn)" className="mt-1 shrink-0" />
                      <span>
                        {doErro ? "Para não cair de novo" : "Como a FCC cobra"}: <span dangerouslySetInnerHTML={{ __html: atual.fcc }} />
                      </span>
                    </p>
                  )}
                  {atual.extra && <p className="mt-2 text-xs leading-relaxed text-e-dim" dangerouslySetInnerHTML={{ __html: atual.extra }} />}
                  {atual.questaoHref && (
                    <Link href={atual.questaoHref} className="mt-2 inline-block text-xs text-e-blue hover:underline">
                      Refazer a questão
                    </Link>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(() => {
                      const d = diasDosBotoes(atual.etapa);
                      return (
                        <>
                          <button type="button" disabled={salvando} onClick={() => responder(false)} className={`${BOTAO_SECUNDARIO} border-e-bad/60 text-e-bad`}>
                            Errei · {dias(d.errei)}
                          </button>
                          <button type="button" disabled={salvando} onClick={() => responder(true, true)} className={`${BOTAO_SECUNDARIO} border-e-warn/60 text-e-warn`}>
                            Quase · {dias(d.quase)}
                          </button>
                          <button type="button" disabled={salvando} onClick={() => responder(true)} className={BOTAO_PRIMARIO}>
                            Acertei · {dias(d.acertei)}
                          </button>
                        </>
                      );
                    })()}
                  </div>
                </>
              ) : (
                <button type="button" onClick={() => setVirado(true)} className={`mt-3 ${BOTAO_PRIMARIO}`}>
                  {escrever ? "Conferir com a resposta certa" : "Mostrar o verso"}
                </button>
              )}
              <p className="mt-3 text-[11px] text-e-dim">Atalhos: espaço vira o cartão (fora da caixa de texto), 1 errei, 2 quase, 3 acertei.</p>
            </div>
          )}
          {erro && (
            <p role="alert" className="mt-3 text-sm text-e-bad">
              {erro}
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
