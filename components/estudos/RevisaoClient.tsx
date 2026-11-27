"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { diasDosBotoes, rotuloEtapa } from "@/lib/estudos-revisao";
import type { ProblemaDoDia, Subjetiva } from "@/lib/estudos-revisao-hoje";
import type { CertoErradoLei } from "@/lib/estudos-lei-flash";
import { LeiSecaFlash } from "@/components/estudos/LeiSecaFlash";
import { Sparkle } from "@/components/estudos/Sparkle";
import { BOTAO_PRIMARIO, BOTAO_SECUNDARIO, Card } from "@/components/estudos/ui";

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
  /** matéria, para separar a fila */
  materia?: string;
  /** cartões de erro: alternativas para responder de novo, a certa e o porquê de cada uma */
  alts?: string[];
  correta?: number;
  porque?: string[];
  /** cartão de tema: Regra, Exceção, Pegadinha FCC ou Jurisprudência */
  tipo?: string;
  /** item de jurisprudência em certo ou errado */
  ce?: CertoErradoLei;
}
interface ArtigoFila {
  item_id: string;
  ref: string;
  materia: string;
  html: string;
  itens: CertoErradoLei[];
  questoes: number;
  etapa: number;
  vence_em: string;
}

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

/* ===================== CARTÕES ===================== */

const LETRA = ["A", "B", "C", "D", "E", "F"];
const CHIP_MATERIA = "rounded-full border px-3 py-1 text-xs transition-colors duration-150";

function Cartoes({ inicial, onRestantes }: { inicial: CartaoFila[]; onRestantes?: (n: number) => void }) {
  const [fila, setFila] = useState(inicial);
  const [materia, setMateria] = useState<string | null>(null);
  const [virado, setVirado] = useState(false);
  const [escolha, setEscolha] = useState<number | null>(null);
  const [feitos, setFeitos] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const daVez = materia ? fila.filter((c) => (c.materia ?? c.baralho) === materia) : fila;
  const atual = daVez[0];
  // matérias na ordem em que aparecem na fila, com quantos cartões cada
  const contagem = new Map<string, number>();
  for (const c of fila) contagem.set(c.materia ?? c.baralho, (contagem.get(c.materia ?? c.baralho) ?? 0) + 1);

  async function responder(r: "errei" | "quase" | "acertei") {
    if (!atual) return;
    setSalvando(true);
    const e = await enviarRevisao({ tipo: "cartao", id: atual.id, ...corpo(r) });
    setSalvando(false);
    if (e) return setErro(e);
    setErro(null);
    setVirado(false);
    setEscolha(null);
    setFeitos((n) => n + 1);
    // errou: volta ao fim da fila de hoje para uma segunda tentativa
    const resto = fila.filter((c) => c.id !== atual.id);
    const nova = r !== "errei" ? resto : [...resto, { ...atual, etapa: 0, novo: false }];
    setFila(nova);
    onRestantes?.(nova.length);
  }
  function trocar(m: string | null) {
    setMateria(m);
    setVirado(false);
    setEscolha(null);
  }
  const deErro = daVez.filter((c) => c.doErro).length;
  const temAlts = !!atual?.alts?.length && typeof atual.correta === "number";

  return (
    <div>
      <p className="mb-3 text-xs tabular-nums text-e-dim">{daVez.length} na fila{deErro && deErro < daVez.length ? ` (${deErro} dos seus erros)` : ""} · {feitos} feitos</p>
      {contagem.size > 1 && (
        <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="Revisar por matéria">
          {[[null, fila.length] as const, ...[...contagem.entries()]].map(([m, n]) => (
            <button
              key={m ?? "todas"}
              type="button"
              onClick={() => trocar(m)}
              aria-pressed={materia === m}
              className={`${CHIP_MATERIA} ${materia === m ? "border-e-accent text-e-ink" : "border-e-line text-e-dim hover:text-e-ink"}`}
            >
              {m ?? "Todas"} · {n}
            </button>
          ))}
        </div>
      )}
      {!atual ? (
        <p className="flex items-center gap-2 text-sm text-e-dim">
          <Sparkle size={14} /> {materia ? `Cartões de ${materia} terminados.` : "Cartões do dia terminados."}
        </p>
      ) : (
        <div>
          <p className="text-[11px] text-e-dim">
            {atual.doErro && <span className="mr-2 rounded-full bg-e-bad-soft px-2 py-0.5 uppercase tracking-[0.1em] text-e-bad">Dos meus erros</span>}
            {atual.tipo && <span className="mr-2 rounded-full bg-e-accent-soft px-2 py-0.5 uppercase tracking-[0.1em] text-e-ink">{atual.tipo}</span>}
            {atual.doErro ? "Responda de novo" : atual.baralho} · {atual.novo ? "novo" : rotuloEtapa(atual.etapa)}
          </p>
          <div className="mt-2 rounded-xl border border-e-line bg-e-card-2 p-4 text-base leading-relaxed text-e-ink" dangerouslySetInnerHTML={{ __html: atual.frente }} />
          {temAlts && (
            <ul className="mt-2 space-y-1.5">
              {atual.alts!.map((a, i) => {
                const marca =
                  escolha === null ? "border-e-line hover:border-e-accent" : i === atual.correta ? "border-e-ok bg-e-ok/10" : i === escolha ? "border-e-bad bg-e-bad-soft" : "border-e-line opacity-60";
                return (
                  <li key={i}>
                    <button
                      type="button"
                      disabled={escolha !== null}
                      onClick={() => (setEscolha(i), setVirado(true))}
                      className={`flex w-full gap-2 rounded-xl border px-3 py-2 text-left text-sm text-e-ink transition-colors duration-150 ${marca}`}
                    >
                      <span className="text-e-dim">{LETRA[i]})</span>
                      <span dangerouslySetInnerHTML={{ __html: a }} />
                    </button>
                    {escolha !== null && (i === escolha || i === atual.correta) && atual.porque?.[i] && (
                      <p className="mt-1 pl-3 text-xs text-e-dim" dangerouslySetInnerHTML={{ __html: atual.porque[i] }} />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {virado ? (
            <>
              {temAlts && escolha !== null && (
                <p className={`mt-3 text-sm ${escolha === atual.correta ? "text-e-ok" : "text-e-bad"}`}>
                  {escolha === atual.correta ? "Acertou desta vez. Se foi com dúvida, marque Quase." : `Ainda não: a certa é a ${LETRA[atual.correta!]}.`}
                </p>
              )}
              <div className="mt-2 rounded-xl border border-e-accent/40 p-4 text-base leading-relaxed text-e-ink" dangerouslySetInnerHTML={{ __html: atual.verso }} />
              {atual.lei && <div className="mt-2 border-l-2 border-e-blue/60 pl-3 font-serif text-[15px] leading-relaxed text-e-ink [&_mark]:rounded [&_mark]:bg-e-accent-soft [&_mark]:px-0.5" dangerouslySetInnerHTML={{ __html: atual.lei }} />}
              {atual.extra && <p className="mt-2 text-xs text-e-dim" dangerouslySetInnerHTML={{ __html: atual.extra }} />}
              <BotoesTres etapa={atual.novo ? -1 : atual.etapa} desabilitado={salvando} responder={responder} />
            </>
          ) : temAlts ? (
            <p className="mt-3 text-xs text-e-dim">Escolha uma alternativa para virar o cartão.</p>
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
    </div>
  );
}

/* ===================== JURISPRUDÊNCIA ===================== */

const TEXTO_JURIS = "font-serif text-[15px] leading-relaxed text-e-ink [&_mark]:rounded [&_mark]:bg-e-accent-soft [&_mark]:px-0.5 [&_mark]:text-e-ink";

/** Súmula ou tese em certo ou errado: o texto vem primeiro; o oficial, com a troca grifada, só depois da resposta. */
function Juris({ inicial, onRestantes }: { inicial: CartaoFila[]; onRestantes?: (n: number) => void }) {
  const [fila, setFila] = useState(inicial);
  const [resposta, setResposta] = useState<boolean | null>(null);
  const [feitos, setFeitos] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const atual = fila[0];
  const it = atual?.ce;

  async function seguir() {
    if (!atual || !it || resposta === null) return;
    const ok = resposta === it.certo;
    setSalvando(true);
    const e = await enviarRevisao({ tipo: "cartao", id: atual.id, ok });
    setSalvando(false);
    if (e) return setErro(e);
    setErro(null);
    setResposta(null);
    setFeitos((n) => n + 1);
    if (ok) setAcertos((n) => n + 1);
    const resto = fila.slice(1);
    setFila(resto);
    onRestantes?.(resto.length);
  }

  return (
    <div>
      <p className="mb-3 text-xs tabular-nums text-e-dim">
        {fila.length} na fila · {feitos} feitos{feitos ? ` · ${acertos} certas` : ""}
      </p>
      {!atual || !it ? (
        <p className="flex items-center gap-2 text-sm text-e-dim">
          <Sparkle size={14} /> Jurisprudência do dia terminada.
        </p>
      ) : (
        <div>
          <p className="text-[11px] text-e-dim">
            {atual.materia} · {it.ref} · {atual.novo ? "novo" : rotuloEtapa(atual.etapa)} · Certo ou errado?
          </p>
          <div className={`mt-2 rounded-xl border border-e-line bg-e-card-2 p-4 ${TEXTO_JURIS}`} dangerouslySetInnerHTML={{ __html: it.texto }} />
          {resposta === null ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => setResposta(true)} className={BOTAO_SECUNDARIO}>
                Certo
              </button>
              <button type="button" onClick={() => setResposta(false)} className={BOTAO_SECUNDARIO}>
                Errado
              </button>
            </div>
          ) : (
            <>
              <p className={`mt-3 text-sm ${resposta === it.certo ? "text-e-ok" : "text-e-bad"}`}>
                {resposta === it.certo ? "Isso." : "Não."} O texto está {it.certo ? "certo: é o texto oficial." : "errado. O grifo mostra a palavra verdadeira:"}
              </p>
              {!it.certo && <div className={`mt-1 border-l-2 border-e-blue/60 pl-3 ${TEXTO_JURIS}`} dangerouslySetInnerHTML={{ __html: it.literal }} />}
              <button type="button" disabled={salvando} onClick={seguir} className={`mt-3 ${BOTAO_PRIMARIO}`}>
                {fila.length > 1 ? "Próximo" : "Terminar"}
              </button>
            </>
          )}
        </div>
      )}
      {erro && (
        <p role="alert" className="mt-3 text-sm text-e-bad">
          {erro}
        </p>
      )}
    </div>
  );
}

/* ===================== ARTIGOS ===================== */

function Artigos({ inicial, onRestantes }: { inicial: ArtigoFila[]; onRestantes?: (n: number) => void }) {
  const [fila, setFila] = useState(inicial);
  const [erro, setErro] = useState<string | null>(null);

  async function responder(a: ArtigoFila, ok: boolean) {
    const e = await enviarRevisao({ tipo: "artigo", id: a.item_id, ok, etapa: a.etapa });
    if (e) return setErro(e);
    setErro(null);
    const resto = fila.filter((x) => x.item_id !== a.item_id);
    setFila(resto);
    onRestantes?.(resto.length);
  }

  return (
    <div>
      <p className="mb-3 text-xs text-e-dim">Abra um artigo: o texto vem primeiro, você diz se está certo ou errado, e só depois vê a lei.</p>
      {fila.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-e-dim">
          <Sparkle size={14} /> Nenhum artigo vence hoje.
        </p>
      ) : (
        <ul className="space-y-2">
          {fila.map((a, i) => (
            <li key={a.item_id}>
              <LeiSecaFlash
                refLei={a.ref}
                detalhe={`${a.materia} · ${rotuloEtapa(a.etapa)} · ${a.questoes} ${a.questoes === 1 ? "questão errada" : "questões erradas"}`}
                html={a.html}
                itens={a.itens}
                abertoInicial={i === 0}
                rodape={
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => responder(a, true)} className={BOTAO_PRIMARIO}>
                      Lembrava
                    </button>
                    <button type="button" onClick={() => responder(a, false)} className={BOTAO_SECUNDARIO}>
                      Não lembrava, volta amanhã
                    </button>
                  </div>
                }
              />
            </li>
          ))}
        </ul>
      )}
      {erro && (
        <p role="alert" className="mt-3 text-sm text-e-bad">
          {erro}
        </p>
      )}
    </div>
  );
}

/* ===================== SUBJETIVA DO DIA ===================== */

function SubjetivaDoDia({ dia, subjetiva, proxima, onFeita }: { dia: boolean; subjetiva: Subjetiva | null; proxima: string; onFeita?: () => void }) {
  const [i, setI] = useState(0);
  const [texto, setTexto] = useState("");
  const [conferindo, setConferindo] = useState(false);
  const [feitas, setFeitas] = useState(subjetiva?.feita ? subjetiva.perguntas.length : 0);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (!dia)
    return (
      <div>
        <p className="text-sm text-e-dim">Hoje não tem subjetiva. A próxima é na {proxima}.</p>
      </div>
    );
  if (!subjetiva || !subjetiva.perguntas.length)
    return (
      <div>
        <p className="text-sm text-e-dim">Nenhum tema com cartão vence hoje. A subjetiva volta quando a fila tiver um tema.</p>
      </div>
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
    if (feitas + 1 >= subjetiva!.perguntas.length) onFeita?.();
    setTexto("");
    setConferindo(false);
    if (i + 1 < subjetiva!.perguntas.length) setI(i + 1);
  }

  return (
    <div>
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
    </div>
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
      <div>
        <p className="text-sm text-e-dim">Ainda não há problema de um assunto que você já viu. Marque como estudada a aula de frações, razão ou porcentagem no caderno.</p>
      </div>
    );
  const href = `/admin/estudos/questoes?materia=${problema.materia_id}&id=${encodeURIComponent(problema.questao_id)}`;
  return (
    <div>
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
    </div>
  );
}

/* ===================== TELA: O QUE FAZER HOJE ===================== */

interface Passo {
  id: string;
  titulo: string;
  detalhe: string;
  /** quantos itens tinha ao abrir a página (0 = nada para hoje) */
  total: number;
  restante: number;
  minutos: number;
  conteudo: ReactNode;
}

export function RevisaoClient({
  artigos,
  cartoes,
  diaDeSubjetiva,
  subjetiva,
  proximaSubjetiva,
  problema,
  errosGuardados,
  juris = [],
}: {
  artigos: ArtigoFila[];
  cartoes: CartaoFila[];
  diaDeSubjetiva: boolean;
  subjetiva: Subjetiva | null;
  proximaSubjetiva: string;
  problema: ProblemaDoDia | null;
  errosGuardados: number;
  juris?: CartaoFila[];
}) {
  const doErro = cartoes.filter((c) => c.doErro);
  const doTema = cartoes.filter((c) => !c.doErro);
  const subjetivaPendente = diaDeSubjetiva && !!subjetiva?.perguntas.length && !subjetiva.feita;
  const [restam, setRestam] = useState<Record<string, number>>({
    erros: doErro.length,
    lei: artigos.length,
    juris: juris.length,
    temas: doTema.length,
    subjetiva: subjetivaPendente ? 1 : 0,
  });
  const [aberto, setAberto] = useState<string | null>(null);
  const marcar = (id: string) => (n: number) => setRestam((r) => ({ ...r, [id]: n }));

  const passos: Passo[] = [
    {
      id: "erros",
      titulo: "Flashcards dos seus erros",
      detalhe: "responda de novo com as alternativas",
      total: doErro.length,
      restante: restam.erros,
      minutos: Math.ceil(doErro.length * 1.5),
      conteudo: <Cartoes inicial={doErro} onRestantes={marcar("erros")} />,
    },
    {
      id: "lei",
      titulo: "Lei seca: certo ou errado",
      detalhe: "artigos dos seus erros · o texto vem primeiro",
      total: artigos.length,
      restante: restam.lei,
      minutos: artigos.length * 2,
      conteudo: <Artigos inicial={artigos} onRestantes={marcar("lei")} />,
    },
    {
      id: "juris",
      titulo: "Jurisprudência: certo ou errado",
      detalhe: "súmulas e teses das aulas estudadas · o texto vem primeiro",
      total: juris.length,
      restante: restam.juris,
      minutos: Math.ceil(juris.length * 1),
      conteudo: <Juris inicial={juris} onRestantes={marcar("juris")} />,
    },
    {
      id: "temas",
      titulo: "Flashcards dos temas",
      detalhe: "os cartões das matérias que vencem hoje",
      total: doTema.length,
      restante: restam.temas,
      minutos: Math.ceil(doTema.length * 0.75),
      conteudo: <Cartoes inicial={doTema} onRestantes={marcar("temas")} />,
    },
  ];
  if (diaDeSubjetiva)
    passos.push({
      id: "subjetiva",
      titulo: "Subjetiva do dia",
      detalhe: subjetiva?.perguntas.length ? `${subjetiva.perguntas.length} ${subjetiva.perguntas.length === 1 ? "pergunta" : "perguntas"} · ${subjetiva.tema}` : "nenhum tema vence hoje",
      total: subjetiva?.perguntas.length ? 1 : 0,
      restante: restam.subjetiva,
      minutos: 10,
      conteudo: <SubjetivaDoDia dia={diaDeSubjetiva} subjetiva={subjetiva} proxima={proximaSubjetiva} onFeita={() => marcar("subjetiva")(0)} />,
    });
  if (problema)
    passos.push({
      id: "problema",
      titulo: "Problema do dia · Matemática",
      detalhe: problema.tema,
      total: 1,
      restante: problema.feitoHoje === null ? 1 : 0,
      minutos: 15,
      conteudo: <ProblemaDoDiaCard problema={problema} />,
    });

  const comItens = passos.filter((p) => p.total > 0);
  const feitos = comItens.filter((p) => p.restante === 0).length;
  const minutos = passos.filter((p) => p.restante > 0).reduce((s, p) => s + p.minutos, 0);
  // só o próximo passo pendente fica destacado: é por onde começar
  const proximo = passos.find((p) => p.total > 0 && p.restante > 0)?.id;

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg text-e-ink">Hoje você tem que fazer</h2>
          <span className="text-xs tabular-nums text-e-dim">
            {feitos} de {comItens.length} feitos{minutos ? ` · uns ${minutos} min` : ""}
          </span>
        </div>
        <span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-e-line" aria-hidden="true">
          <span className="block h-full rounded-full bg-e-ok transition-all duration-300" style={{ width: `${comItens.length ? (feitos / comItens.length) * 100 : 100}%` }} />
        </span>
        {feitos === comItens.length && (
          <p className="mt-3 flex items-center gap-2 text-sm text-e-ok">
            <Sparkle size={14} /> Revisão de hoje feita.
          </p>
        )}
        <ol className="mt-3 divide-y divide-e-line">
          {passos.map((p, i) => {
            const feito = p.restante === 0;
            const vazio = p.total === 0;
            return (
              <li key={p.id} className="py-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs ${feito ? "bg-e-ok-soft text-e-ok" : "bg-e-card-2 text-e-dim"}`}
                    aria-hidden="true"
                  >
                    {feito ? "✓" : i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${feito ? "text-e-dim line-through" : "text-e-ink"}`}>{p.titulo}</p>
                    <p className="text-[11px] text-e-dim">
                      {vazio ? "nada para hoje" : feito ? "feito" : `${p.restante} ${p.restante === 1 ? "item" : "itens"} · ${p.detalhe}`}
                    </p>
                  </div>
                  {!vazio && (
                    <button
                      type="button"
                      onClick={() => setAberto(aberto === p.id ? null : p.id)}
                      aria-expanded={aberto === p.id}
                      className={p.id === proximo && aberto !== p.id ? BOTAO_PRIMARIO : BOTAO_SECUNDARIO}
                    >
                      {aberto === p.id ? "Fechar" : feito ? "Ver" : "Começar"}
                    </button>
                  )}
                </div>
                {/* fica montado depois de aberto, para não perder o ponto da fila ao fechar */}
                <div className={aberto === p.id ? "mt-4" : "hidden"}>{p.conteudo}</div>
              </li>
            );
          })}
        </ol>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-e-ink">Mapa dos erros</p>
            <p className="text-[11px] text-e-dim">
              {errosGuardados} {errosGuardados === 1 ? "erro guardado" : "erros guardados"} por matéria e subtema. Refaça quando quiser; eles entram aqui como flashcards, alguns por dia.
            </p>
          </div>
          <Link href="/admin/estudos/mapa-erros" className={BOTAO_SECUNDARIO}>
            Abrir o mapa →
          </Link>
        </div>
      </Card>
    </div>
  );
}
