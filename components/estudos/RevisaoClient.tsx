"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pause, Play, RotateCcw, Square } from "lucide-react";
import { addDaysToDateString } from "@/lib/atividades-utils";
import { diasDosBotoes, rotuloEtapa } from "@/lib/estudos-revisao";
import type { ProblemaDoDia, Subjetiva } from "@/lib/estudos-revisao-hoje";
import { formatarData } from "@/lib/estudos-utils";
import { Sparkle } from "@/components/estudos/Sparkle";
import { BOTAO_PRIMARIO, BOTAO_SECUNDARIO, Card, CardTitulo, Kpi } from "@/components/estudos/ui";

export interface CartaoFila {
  id: string;
  baralho: string;
  frente: string;
  verso: string;
  extra: string;
  etapa: number;
  novo: boolean;
  /** lei seca (cartões de erro: a fonte da questão) */
  lei?: string;
  /** cartão do baralho "Dos meus erros" */
  doErro?: boolean;
}
interface QuestaoFila {
  id: string;
  materia: string;
  tema: string;
  ref: string;
  etapa: number;
  vence_em: string;
}
interface ArtigoFila {
  item_id: string;
  ref: string;
  materia: string;
  html: string;
  questoes: number;
  etapa: number;
  vence_em: string;
}

const FOCO = 50 * 60;
const PROBLEMA = 15 * 60;

const dias = (n: number) => (n === 1 ? "amanhã" : `${n} dias`);

/** Errei / Quase / Acertei com os dias reais da escada. */
function BotoesTres({ etapa, desabilitado, responder }: { etapa: number; desabilitado: boolean; responder: (r: "errei" | "quase" | "acertei") => void }) {
  const d = diasDosBotoes(etapa);
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <button type="button" disabled={desabilitado} onClick={() => responder("errei")} className={BOTAO_SECUNDARIO}>
        Errei · {dias(d.errei)}
      </button>
      <button type="button" disabled={desabilitado} onClick={() => responder("quase")} className={BOTAO_SECUNDARIO}>
        Quase · {dias(d.quase)}
      </button>
      <button type="button" disabled={desabilitado} onClick={() => responder("acertei")} className={BOTAO_PRIMARIO}>
        Acertei · {d.acertei === null ? "sai da fila" : dias(d.acertei)}
      </button>
    </div>
  );
}

const corpo = (r: "errei" | "quase" | "acertei") => ({ ok: r !== "errei", quase: r === "quase" });
const PAUSA = 10 * 60;

function mmss(s: number) {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

async function enviarRevisao(corpo: object): Promise<string | null> {
  const res = await fetch("/api/admin/estudos/revisao", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  }).catch(() => null);
  if (res?.ok) return null;
  const j = await res?.json().catch(() => ({}));
  return j?.error ?? "Não consegui salvar agora. Confira a conexão e tente de novo.";
}

/* ===================== POMODORO 50/10 ===================== */

function Pomodoro({ hoje, historico }: { hoje: string; historico: { data: string; minutos: number }[] }) {
  const router = useRouter();
  const [fase, setFase] = useState<"foco" | "pausa">("foco");
  const [restante, setRestante] = useState(FOCO);
  const [rodando, setRodando] = useState(false);
  const [efetivo, setEfetivo] = useState(0);
  const [pausas, setPausas] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const ultimo = useRef(0);
  const efetivoRef = useRef(0);
  const pausasRef = useRef(0);
  const faseRef = useRef<"foco" | "pausa">("foco");

  async function gravar(seg: number) {
    const minutos = Math.round(seg / 60);
    if (minutos < 1) return;
    const res = await fetch("/api/admin/estudos/pomodoros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minutos_efetivos: minutos, pausas: pausasRef.current }),
    }).catch(() => null);
    setAviso(res?.ok ? `Bloco salvo: ${minutos} min de tempo efetivo.` : "Não consegui salvar o bloco. Confira a conexão.");
    router.refresh();
  }

  useEffect(() => {
    if (!rodando) return;
    ultimo.current = Date.now();
    const t = setInterval(() => {
      const agora = Date.now();
      const passou = Math.round((agora - ultimo.current) / 1000);
      if (passou < 1) return;
      ultimo.current = agora;
      if (faseRef.current === "foco") {
        efetivoRef.current += passou;
        setEfetivo(efetivoRef.current);
      }
      setRestante((r) => Math.max(0, r - passou));
    }, 250);
    return () => clearInterval(t);
  }, [rodando]);

  useEffect(() => {
    if (restante > 0) return;
    if (faseRef.current === "foco") {
      void gravar(efetivoRef.current);
      efetivoRef.current = 0;
      pausasRef.current = 0;
      setEfetivo(0);
      setPausas(0);
      faseRef.current = "pausa";
      setFase("pausa");
      setRestante(PAUSA);
    } else {
      faseRef.current = "foco";
      setFase("foco");
      setRestante(FOCO);
      setRodando(false);
      setAviso("Pausa terminou. Comece o próximo bloco quando estiver pronta.");
    }
    // gravar usa só refs; rodar apenas quando o tempo zera
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restante]);

  function alternar() {
    if (rodando && faseRef.current === "foco") {
      pausasRef.current += 1;
      setPausas(pausasRef.current);
    }
    setAviso(null);
    setRodando((r) => !r);
  }

  function encerrar() {
    setRodando(false);
    if (faseRef.current === "foco") void gravar(efetivoRef.current);
    efetivoRef.current = 0;
    pausasRef.current = 0;
    setEfetivo(0);
    setPausas(0);
    faseRef.current = "foco";
    setFase("foco");
    setRestante(FOCO);
  }

  const minutosHoje = historico.filter((p) => p.data === hoje).reduce((s, p) => s + p.minutos, 0);
  const dias = Array.from({ length: 7 }, (_, i) => addDaysToDateString(hoje, i - 6));
  const porDia = dias.map((d) => historico.filter((p) => p.data === d).reduce((s, p) => s + p.minutos, 0));
  const max = Math.max(60, ...porDia);
  const total = fase === "foco" ? FOCO : PAUSA;

  return (
    <Card destaque={rodando && fase === "foco"}>
      <CardTitulo acao={<span className="text-xs tabular-nums text-e-dim">Hoje: {minutosHoje} min efetivos</span>}>Pomodoro 50/10</CardTitulo>
      <div className="flex flex-wrap items-center gap-5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-e-dim">{fase === "foco" ? "Foco" : "Pausa"}</p>
          <p className="text-4xl font-medium tabular-nums text-e-ink" aria-live="off">
            {mmss(restante)}
          </p>
          <span className="mt-2 block h-1.5 w-44 overflow-hidden rounded-full bg-e-line">
            <span className="block h-full rounded-full bg-e-accent" style={{ width: `${((total - restante) / total) * 100}%` }} />
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={alternar} className={BOTAO_PRIMARIO}>
            {rodando ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
            {rodando ? "Pausar" : restante === total ? "Começar" : "Continuar"}
          </button>
          {fase === "foco" && efetivo > 0 && (
            <button type="button" onClick={encerrar} className={BOTAO_SECUNDARIO}>
              <Square size={12} aria-hidden="true" /> Encerrar e salvar
            </button>
          )}
          {fase === "pausa" && (
            <button type="button" onClick={() => setRestante(0)} className={BOTAO_SECUNDARIO}>
              <RotateCcw size={12} aria-hidden="true" /> Pular a pausa
            </button>
          )}
        </div>
        <div className="ml-auto text-right text-xs text-e-dim">
          <p>
            Tempo efetivo do bloco: <span className="tabular-nums text-e-ink">{mmss(efetivo)}</span>
          </p>
          <p>Interrupções: {pausas}</p>
        </div>
      </div>
      <div className="mt-4 flex items-end gap-2" aria-label="Minutos efetivos nos últimos 7 dias">
        {dias.map((d, i) => (
          <div key={d} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[10px] tabular-nums text-e-dim">{porDia[i] || ""}</span>
            <span className="block w-full rounded-t bg-e-accent/70" style={{ height: `${Math.max(2, (porDia[i] / max) * 48)}px` }} />
            <span className="text-[10px] text-e-dim">{formatarData(d, { weekday: "short" }).replace(".", "")}</span>
          </div>
        ))}
      </div>
      {aviso && <p className="mt-3 text-xs text-e-dim">{aviso}</p>}
      <p className="mt-2 text-[11px] text-e-dim">Só conta o tempo de foco com o relógio andando. Pausas e a pausa de 10 minutos ficam de fora.</p>
    </Card>
  );
}

/* ===================== CARTÕES ===================== */

function Cartoes({ inicial }: { inicial: CartaoFila[] }) {
  const [fila, setFila] = useState(inicial);
  const [virado, setVirado] = useState(false);
  const [feitos, setFeitos] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const atual = fila[0];

  async function responder(r: "errei" | "quase" | "acertei") {
    if (!atual) return;
    setSalvando(true);
    const e = await enviarRevisao({ tipo: "cartao", id: atual.id, ...corpo(r) });
    setSalvando(false);
    if (e) return setErro(e);
    setErro(null);
    setVirado(false);
    setFeitos((n) => n + 1);
    // errou: volta ao fim da fila de hoje para uma segunda tentativa
    setFila((f) => (r !== "errei" ? f.slice(1) : [...f.slice(1), { ...f[0], etapa: 0, novo: false }]));
  }
  const deErro = fila.filter((c) => c.doErro).length;

  return (
    <Card>
      <CardTitulo acao={<span className="text-xs tabular-nums text-e-dim">{fila.length} na fila{deErro ? ` (${deErro} dos seus erros)` : ""} · {feitos} feitos</span>}>Cartões</CardTitulo>
      {!atual ? (
        <p className="flex items-center gap-2 text-sm text-e-dim">
          <Sparkle size={14} /> Cartões do dia terminados.
        </p>
      ) : (
        <div>
          <p className="text-[11px] text-e-dim">
            {atual.doErro && <span className="mr-2 rounded-full bg-e-bad-soft px-2 py-0.5 uppercase tracking-[0.1em] text-e-bad">Dos meus erros</span>}
            {atual.baralho} · {atual.novo ? "novo" : rotuloEtapa(atual.etapa)}
          </p>
          <div className="mt-2 rounded-xl border border-e-line bg-e-card-2 p-4 text-base leading-relaxed text-e-ink" dangerouslySetInnerHTML={{ __html: atual.frente }} />
          {virado ? (
            <>
              <div className="mt-2 rounded-xl border border-e-accent/40 p-4 text-base leading-relaxed text-e-ink" dangerouslySetInnerHTML={{ __html: atual.verso }} />
              {atual.lei && <div className="mt-2 border-l-2 border-e-blue/60 pl-3 font-serif text-[15px] leading-relaxed text-e-ink [&_mark]:rounded [&_mark]:bg-e-accent-soft [&_mark]:px-0.5" dangerouslySetInnerHTML={{ __html: atual.lei }} />}
              {atual.extra && <p className="mt-2 text-xs text-e-dim" dangerouslySetInnerHTML={{ __html: atual.extra }} />}
              <BotoesTres etapa={atual.novo ? -1 : atual.etapa} desabilitado={salvando} responder={responder} />
            </>
          ) : (
            <button type="button" onClick={() => setVirado(true)} className={`mt-3 ${BOTAO_PRIMARIO}`}>
              Mostrar o verso
            </button>
          )}
        </div>
      )}
      {erro && (
        <p role="alert" className="mt-3 text-sm text-e-bad">
          {erro}
        </p>
      )}
    </Card>
  );
}

/* ===================== ARTIGOS ===================== */

function Artigos({ inicial }: { inicial: ArtigoFila[] }) {
  const [fila, setFila] = useState(inicial);
  const [aberto, setAberto] = useState<string | null>(inicial[0]?.item_id ?? null);
  const [erro, setErro] = useState<string | null>(null);

  async function responder(a: ArtigoFila, ok: boolean) {
    const e = await enviarRevisao({ tipo: "artigo", id: a.item_id, ok, etapa: a.etapa });
    if (e) return setErro(e);
    setErro(null);
    const resto = fila.filter((x) => x.item_id !== a.item_id);
    setFila(resto);
    setAberto(resto[0]?.item_id ?? null);
  }

  return (
    <Card>
      <CardTitulo acao={<span className="text-xs tabular-nums text-e-dim">{fila.length} na fila</span>}>Artigos de lei</CardTitulo>
      {fila.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-e-dim">
          <Sparkle size={14} /> Nenhum artigo vence hoje.
        </p>
      ) : (
        <ul className="space-y-2">
          {fila.map((a) => (
            <li key={a.item_id} className="rounded-xl border border-e-line bg-e-card-2">
              <button
                type="button"
                onClick={() => setAberto(aberto === a.item_id ? null : a.item_id)}
                aria-expanded={aberto === a.item_id}
                className="flex w-full flex-wrap items-baseline justify-between gap-2 px-4 py-3 text-left"
              >
                <span className="text-sm text-e-ink">{a.ref}</span>
                <span className="text-[11px] text-e-dim">
                  {a.materia} · {rotuloEtapa(a.etapa)} · {a.questoes} {a.questoes === 1 ? "questão errada" : "questões erradas"}
                </span>
              </button>
              {aberto === a.item_id && (
                <div className="border-t border-e-line px-4 py-3">
                  <p className="text-[11px] text-e-dim">Leia em voz baixa e repare no trecho marcado. Ele foi o ponto da questão.</p>
                  <div className="mt-2 font-serif text-[15px] leading-relaxed text-e-ink [&_mark]:rounded [&_mark]:bg-e-accent-soft [&_mark]:px-0.5 [&_mark]:text-e-ink" dangerouslySetInnerHTML={{ __html: a.html }} />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => responder(a, true)} className={BOTAO_PRIMARIO}>
                      Li e lembrava
                    </button>
                    <button type="button" onClick={() => responder(a, false)} className={BOTAO_SECUNDARIO}>
                      Não lembrava, volta amanhã
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {erro && (
        <p role="alert" className="mt-3 text-sm text-e-bad">
          {erro}
        </p>
      )}
    </Card>
  );
}

/* ===================== SUBJETIVA DO DIA ===================== */

function SubjetivaDoDia({ dia, subjetiva, proxima }: { dia: boolean; subjetiva: Subjetiva | null; proxima: string }) {
  const [i, setI] = useState(0);
  const [texto, setTexto] = useState("");
  const [conferindo, setConferindo] = useState(false);
  const [feitas, setFeitas] = useState(subjetiva?.feita ? subjetiva.perguntas.length : 0);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (!dia)
    return (
      <Card>
        <CardTitulo>Subjetiva do dia</CardTitulo>
        <p className="text-sm text-e-dim">Hoje não tem subjetiva. A próxima é na {proxima}.</p>
      </Card>
    );
  if (!subjetiva || !subjetiva.perguntas.length)
    return (
      <Card>
        <CardTitulo>Subjetiva do dia</CardTitulo>
        <p className="text-sm text-e-dim">Nenhum tema com cartão vence hoje. A subjetiva volta quando a fila tiver um tema.</p>
      </Card>
    );

  const p = subjetiva.perguntas[i];
  const terminou = feitas >= subjetiva.perguntas.length;

  async function responder(r: "errei" | "quase" | "acertei") {
    setSalvando(true);
    const e = await enviarRevisao({ tipo: "cartao", id: p.cartao_id, ...corpo(r), resp: texto || "(sem resposta escrita)" });
    setSalvando(false);
    if (e) return setErro(e);
    setErro(null);
    setFeitas((n) => n + 1);
    setTexto("");
    setConferindo(false);
    if (i + 1 < subjetiva!.perguntas.length) setI(i + 1);
  }

  return (
    <Card>
      <CardTitulo acao={<span className="text-xs tabular-nums text-e-dim">{Math.min(feitas, subjetiva.perguntas.length)} de {subjetiva.perguntas.length}</span>}>Subjetiva do dia</CardTitulo>
      <p className="text-sm text-e-ink">
        Tema que vence hoje: {subjetiva.materia} · {subjetiva.tema}
      </p>
      <p className="mt-1 text-xs text-e-dim">
        {subjetiva.vencendo ? `É o tema com mais itens vencendo na fila de hoje (${subjetiva.vencendo}). ` : ""}Responda por escrito, sem consultar. Depois confira com a lei seca.
      </p>
      {terminou ? (
        <div className="mt-3 space-y-3">
          <p className="flex items-center gap-2 text-sm text-e-dim">
            <Sparkle size={14} /> Subjetiva de hoje feita. O que você escreveu ficou salvo no cartão.
          </p>
          {subjetiva.feita &&
            subjetiva.perguntas.map((x) => (
              <div key={x.cartao_id} className="rounded-xl border border-e-line bg-e-card-2 p-3 text-sm">
                <p className="text-e-ink" dangerouslySetInnerHTML={{ __html: x.pergunta }} />
                {x.escrita && <p className="mt-2 whitespace-pre-wrap text-e-dim" dangerouslySetInnerHTML={{ __html: `Você escreveu: ${x.escrita}` }} />}
              </div>
            ))}
        </div>
      ) : (
        <>
          <div className="mt-3 rounded-xl border border-e-line bg-e-card-2 p-4 text-base leading-relaxed text-e-ink">
            <span className="block text-[11px] text-e-dim">Pergunta {i + 1} de {subjetiva.perguntas.length}. Explique com suas palavras e cite o artigo, se lembrar.</span>
            <span className="mt-1 block" dangerouslySetInnerHTML={{ __html: p.pergunta }} />
          </div>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            readOnly={conferindo}
            rows={5}
            placeholder="Escreva aqui, sem consultar."
            aria-label="Sua resposta"
            className="mt-3 w-full rounded-xl border border-e-line bg-e-bg p-3 text-sm text-e-ink placeholder:text-e-dim"
          />
          {!conferindo ? (
            <button type="button" onClick={() => setConferindo(true)} className={`mt-2 ${BOTAO_PRIMARIO}`}>
              Conferir com a lei seca
            </button>
          ) : (
            <div className="mt-2 rounded-xl border border-e-accent/40 p-4 text-sm leading-relaxed text-e-ink">
              <span className="block text-[11px] uppercase tracking-[0.14em] text-e-dim">Resposta</span>
              <span className="mt-1 block" dangerouslySetInnerHTML={{ __html: p.resposta }} />
              {p.lei ? (
                <>
                  <span className="mt-3 block text-[11px] uppercase tracking-[0.14em] text-e-dim">Lei seca{p.leiOrigem !== "cartão" ? ` (da questão ${p.leiOrigem})` : ""}</span>
                  <div className="mt-1 border-l-2 border-e-blue/60 pl-3 font-serif text-[15px] [&_mark]:rounded [&_mark]:bg-e-accent-soft [&_mark]:px-0.5" dangerouslySetInnerHTML={{ __html: p.lei }} />
                </>
              ) : (
                <span className="mt-3 block text-xs text-e-dim">Este cartão ainda não tem lei seca. Confira o artigo no seu vade-mécum.</span>
              )}
              {p.fcc && <p className="mt-2 text-xs text-e-warn" dangerouslySetInnerHTML={{ __html: `Como a FCC cobra: ${p.fcc}` }} />}
              {p.extra && <p className="mt-2 text-xs text-e-dim" dangerouslySetInnerHTML={{ __html: p.extra }} />}
              <BotoesTres etapa={p.etapa} desabilitado={salvando} responder={responder} />
              <p className="mt-2 text-[11px] text-e-dim">O que você escreveu fica salvo no cartão. Esta passagem conta como a revisão dele hoje.</p>
            </div>
          )}
        </>
      )}
      {erro && (
        <p role="alert" className="mt-3 text-sm text-e-bad">
          {erro}
        </p>
      )}
    </Card>
  );
}

/* ===================== PROBLEMA DO DIA ===================== */

function ProblemaDoDiaCard({ problema }: { problema: ProblemaDoDia | null }) {
  const [restante, setRestante] = useState(PROBLEMA);
  const [rodando, setRodando] = useState(false);
  useEffect(() => {
    if (!rodando) return;
    const t = setInterval(() => setRestante((r) => (r <= 1 ? (setRodando(false), 0) : r - 1)), 1000);
    return () => clearInterval(t);
  }, [rodando]);

  if (!problema)
    return (
      <Card>
        <CardTitulo>Problema do dia · Matemática e RLM</CardTitulo>
        <p className="text-sm text-e-dim">Ainda não há problema de um assunto que você já viu. Marque como estudada a aula de frações, razão ou porcentagem no caderno.</p>
      </Card>
    );
  const href = `/admin/estudos/questoes?materia=${problema.materia_id}&id=${encodeURIComponent(problema.questao_id)}`;
  return (
    <Card>
      <CardTitulo acao={<span className="text-xs text-e-dim">15 min</span>}>Problema do dia · Matemática e RLM</CardTitulo>
      <p className="text-sm text-e-ink">{problema.tema}</p>
      <p className="mt-1 text-xs text-e-dim">
        Sorteado só entre assuntos que você já viu ({problema.pelasMarcadas ? "aulas marcadas como estudadas" : "aulas já publicadas, nenhuma marcada ainda"}): {problema.temas.join(", ")}. Sem lógica proposicional.
      </p>
      <div className="mt-3 max-h-48 overflow-hidden rounded-xl border border-e-line bg-e-card-2 p-4 text-sm leading-relaxed text-e-ink" dangerouslySetInnerHTML={{ __html: problema.enun }} />
      {problema.feitoHoje !== null ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-e-dim">
          <Sparkle size={14} /> Feito hoje: {problema.feitoHoje ? "acertou" : "errou, ele volta na fila de questões"}.
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className={`text-2xl font-medium tabular-nums ${restante === 0 ? "text-e-bad" : "text-e-warn"}`}>{mmss(restante)}</span>
          <a href={href} target="_blank" rel="noopener" onClick={() => setRodando(true)} className={BOTAO_PRIMARIO}>
            {rodando ? "Abrir a questão de novo" : "Começar (abre a questão)"}
          </a>
          {restante === 0 && <span className="text-xs text-e-bad">Tempo esgotado. Termine e veja a correção.</span>}
        </div>
      )}
      <p className="mt-3 text-[11px] text-e-dim">Desenhe antes de calcular: traduza a historinha em conta. A correção e o motivo do erro ficam na tela de questões.</p>
    </Card>
  );
}

/* ===================== TELA ===================== */

export function RevisaoClient({
  hoje,
  questoes,
  artigos,
  cartoes,
  proximos,
  pomodoros,
  diaDeSubjetiva,
  subjetiva,
  proximaSubjetiva,
  problema,
}: {
  hoje: string;
  questoes: QuestaoFila[];
  artigos: ArtigoFila[];
  cartoes: CartaoFila[];
  proximos: { questoes: number; artigos: number; cartoes: number };
  pomodoros: { data: string; minutos: number }[];
  diaDeSubjetiva: boolean;
  subjetiva: Subjetiva | null;
  proximaSubjetiva: string;
  problema: ProblemaDoDia | null;
}) {
  const total = questoes.length + artigos.length + cartoes.length;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi rotulo="Na fila de hoje" valor={String(total)} detalhe={total ? "comece pelas questões" : "fila zerada"} tom={total ? undefined : "ok"} />
        <Kpi rotulo="Questões" valor={String(questoes.length)} detalhe={`${proximos.questoes} nos próximos 7 dias`} />
        <Kpi rotulo="Cartões" valor={String(cartoes.length)} detalhe={`${proximos.cartoes} nos próximos 7 dias`} />
        <Kpi rotulo="Artigos" valor={String(artigos.length)} detalhe={`${proximos.artigos} nos próximos 7 dias`} />
      </div>

      <Pomodoro hoje={hoje} historico={pomodoros} />

      <div className="grid gap-4 lg:grid-cols-2">
        <SubjetivaDoDia dia={diaDeSubjetiva} subjetiva={subjetiva} proxima={proximaSubjetiva} />
        <ProblemaDoDiaCard problema={problema} />
      </div>

      <Card>
        <CardTitulo acao={<span className="text-xs tabular-nums text-e-dim">{questoes.length} na fila</span>}>Questões que você errou</CardTitulo>
        {questoes.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-e-dim">
            <Sparkle size={14} /> Nenhuma questão vence hoje.
          </p>
        ) : (
          <>
            <Link href={`/admin/estudos/questoes?status=erradas&revisao=1&id=${encodeURIComponent(questoes[0].id)}`} className={BOTAO_PRIMARIO}>
              Refazer a primeira
            </Link>
            <ul className="mt-3 divide-y divide-e-line">
              {questoes.map((q) => (
                <li key={q.id}>
                  <Link
                    href={`/admin/estudos/questoes?status=erradas&revisao=1&id=${encodeURIComponent(q.id)}`}
                    className="flex flex-wrap items-baseline justify-between gap-2 py-2.5 text-sm text-e-ink hover:text-e-glow"
                  >
                    <span>
                      {q.materia} · {q.tema}
                    </span>
                    <span className="text-[11px] text-e-dim">
                      {q.ref} · {rotuloEtapa(q.etapa)}
                      {q.vence_em < hoje ? ` · venceu ${formatarData(q.vence_em)}` : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
        <p className="mt-3 text-[11px] text-e-dim">Acerto com dúvida ou chute conta como erro e mantém a questão na fila.</p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Cartoes inicial={cartoes} />
        <Artigos inicial={artigos} />
      </div>
    </div>
  );
}
