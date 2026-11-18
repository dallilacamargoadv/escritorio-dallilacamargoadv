"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CLASSIFICACAO_LABEL,
  TIPOS_ACERTO,
  TIPOS_ERRO,
  formatarTempo,
  type Classificacao,
  type Questao,
  type Resposta,
} from "@/lib/estudos-desempenho";
import { fonteHtml, htmlSeguro } from "@/lib/estudos-html";
import { Sparkle } from "@/components/estudos/Sparkle";
import { BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CAMPO, Card } from "@/components/estudos/ui";

const LETRAS = "ABCDE";

interface Filtros {
  materia: string;
  tema: string;
  status: "todas" | "nao_respondidas" | "erradas";
}

function urlDe(f: Filtros, id?: string) {
  const p = new URLSearchParams();
  if (f.materia) p.set("materia", f.materia);
  if (f.tema) p.set("tema", f.tema);
  if (f.status !== "todas") p.set("status", f.status);
  if (id) p.set("id", id);
  const q = p.toString();
  return `/admin/estudos/questoes${q ? `?${q}` : ""}`;
}

export function QuestaoClient({
  questao,
  ids,
  filtros,
  materias,
  temas,
  historico,
  revisao = false,
}: {
  questao: Questao | null;
  ids: string[];
  filtros: Filtros;
  materias: { id: string; nome: string; total: number }[];
  temas: string[];
  historico: Resposta[];
  /** Veio da aba Revisão: grava como "revisao" e volta para a fila ao salvar. */
  revisao?: boolean;
}) {
  const router = useRouter();
  const inicio = useRef(0);
  const [segundos, setSegundos] = useState(0);
  const [marcada, setMarcada] = useState<number | null>(null);
  const [respondida, setRespondida] = useState(false);
  const [classe, setClasse] = useState<Classificacao | null>(null);
  const [nota, setNota] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [tempoFinal, setTempoFinal] = useState<number | null>(null);

  useEffect(() => {
    inicio.current = Date.now();
    const t = setInterval(() => setSegundos(Math.round((Date.now() - inicio.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  const pos = questao ? ids.indexOf(questao.id) : -1;
  const proximo = ids.length ? ids[(pos + 1) % ids.length] : undefined;
  // na revisão, a próxima é a seguinte da fila (sem dar a volta para a mesma questão)
  const proximaRevisao = revisao ? ids.slice(pos + 1).concat(ids.slice(0, Math.max(pos, 0))).find((id) => id !== questao?.id) : undefined;
  const urlRevisao = (id?: string) => (id ? `/admin/estudos/questoes?status=erradas&revisao=1&id=${encodeURIComponent(id)}` : "/admin/estudos/revisao");

  function filtrar(novo: Partial<Filtros>) {
    const f = { ...filtros, ...novo };
    if ("materia" in novo) f.tema = "";
    router.push(urlDe(f));
  }

  function responder() {
    if (marcada === null) {
      setErro("Marque uma alternativa antes de responder.");
      return;
    }
    setErro(null);
    setTempoFinal(Math.round((Date.now() - inicio.current) / 1000));
    setRespondida(true);
  }

  async function salvar(irPara?: string) {
    if (!questao || marcada === null) return;
    if (!classe) {
      setErro(marcada === questao.c ? "Diga como você acertou." : "Diga por que você errou.");
      return;
    }
    setSalvando(true);
    setErro(null);
    const res = await fetch("/api/admin/estudos/respostas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questao_id: questao.id, alternativa: marcada, classificacao: classe, tempo_seg: tempoFinal, nota, contexto: revisao ? "revisao" : "treino" }),
    });
    setSalvando(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErro(j.error ?? "Não consegui salvar agora. Confira a conexão e tente de novo.");
      return;
    }
    router.push(revisao ? urlRevisao(proximaRevisao) : urlDe(filtros, irPara));
    router.refresh();
  }

  const acertou = questao !== null && marcada === questao.c;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-[11px] text-e-dim">
          Matéria
          <select value={filtros.materia} onChange={(e) => filtrar({ materia: e.target.value })} className={CAMPO}>
            <option value="">Todas</option>
            {materias.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome} ({m.total})
              </option>
            ))}
          </select>
        </label>
        <label className="text-[11px] text-e-dim">
          Tema
          <select value={filtros.tema} onChange={(e) => filtrar({ tema: e.target.value })} className={CAMPO}>
            <option value="">Todos</option>
            {temas.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[11px] text-e-dim">
          Mostrar
          <select value={filtros.status} onChange={(e) => filtrar({ status: e.target.value as Filtros["status"] })} className={CAMPO}>
            <option value="todas">Todas</option>
            <option value="nao_respondidas">Só as não respondidas</option>
            <option value="erradas">Só as que errei ou chutei</option>
          </select>
        </label>
        <p className="ml-auto text-xs tabular-nums text-e-dim">{ids.length ? `${pos + 1} de ${ids.length}` : "0 questões"}</p>
      </div>

      {!questao ? (
        <Card>
          <p className="text-sm text-e-dim">Nenhuma questão com esse filtro. Troque a matéria, o tema ou o que mostrar.</p>
        </Card>
      ) : (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] uppercase tracking-[0.14em] text-e-dim">
              {questao.mat} · {questao.tema} · {questao.ref}
            </p>
            <span className="rounded-full border border-e-line px-2.5 py-0.5 text-xs tabular-nums text-e-blue" aria-label="Tempo nesta questão">
              {formatarTempo(tempoFinal ?? segundos)}
            </span>
          </div>
          <div className="mt-3 text-[15px] leading-relaxed text-e-ink" dangerouslySetInnerHTML={{ __html: htmlSeguro(questao.enun) }} />
          {questao.itens && (
            <ol className="mt-3 space-y-1.5 text-sm leading-relaxed text-e-ink">
              {questao.itens.map((it, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: htmlSeguro(it) }} />
              ))}
            </ol>
          )}

          <fieldset className="mt-4 space-y-2" disabled={respondida}>
            <legend className="sr-only">Alternativas</legend>
            {questao.alts.map((alt, i) => {
              const certa = respondida && i === questao.c;
              const errada = respondida && i === marcada && i !== questao.c;
              return (
                <label
                  key={i}
                  className={`flex cursor-pointer gap-3 rounded-xl border p-3 text-sm transition-colors duration-150 ${
                    certa
                      ? "border-e-ok/60 bg-e-ok-soft"
                      : errada
                        ? "border-e-bad/60 bg-e-bad-soft"
                        : marcada === i
                          ? "border-e-accent bg-e-accent-soft"
                          : "border-e-line hover:border-e-dim"
                  }`}
                >
                  <input type="radio" name="alt" className="sr-only" checked={marcada === i} onChange={() => setMarcada(i)} />
                  <span className="font-medium text-e-dim">{LETRAS[i]})</span>
                  <span className="min-w-0 flex-1">
                    <span className="text-e-ink" dangerouslySetInnerHTML={{ __html: htmlSeguro(alt) }} />
                    {respondida && (
                      <span className={`mt-1 block text-xs ${i === questao.c ? "text-e-ok" : "text-e-dim"}`} dangerouslySetInnerHTML={{ __html: htmlSeguro(questao.why[i]) }} />
                    )}
                  </span>
                </label>
              );
            })}
          </fieldset>

          {!respondida ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button type="button" onClick={responder} className={BOTAO_PRIMARIO}>
                Responder
              </button>
              {revisao
                ? proximaRevisao && (
                    <button type="button" onClick={() => router.push(urlRevisao(proximaRevisao))} className={BOTAO_SECUNDARIO}>
                      Pular
                    </button>
                  )
                : proximo &&
                  proximo !== questao.id && (
                    <button type="button" onClick={() => router.push(urlDe(filtros, proximo))} className={BOTAO_SECUNDARIO}>
                      Pular
                    </button>
                  )}
              {revisao && (
                <Link href="/admin/estudos/revisao" className="text-xs text-e-dim underline-offset-2 hover:text-e-ink hover:underline">
                  Voltar à fila da revisão
                </Link>
              )}
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <p className={`text-sm font-medium ${acertou ? "text-e-ok" : "text-e-bad"}`}>
                {acertou ? "Você acertou." : `Você marcou ${LETRAS[marcada!]}. A correta é ${LETRAS[questao.c]}.`}
              </p>

              <div className="rounded-xl border border-e-line bg-e-card-2 p-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-e-dim">Fonte</p>
                <div className="fonte-lei mt-1 text-sm leading-relaxed text-e-ink" dangerouslySetInnerHTML={{ __html: fonteHtml(questao.fonte) }} />
                {questao.alerta && (
                  <p className="mt-2 flex gap-2 text-sm text-e-warn">
                    <Sparkle size={14} cor="var(--e-warn)" className="mt-1 shrink-0" />
                    <span dangerouslySetInnerHTML={{ __html: htmlSeguro(questao.alerta) }} />
                  </p>
                )}
              </div>

              <div>
                <p className="text-sm text-e-ink">{acertou ? "Como você acertou?" : "Por que você errou?"}</p>
                <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label={acertou ? "Como você acertou" : "Por que você errou"}>
                  {(acertou ? TIPOS_ACERTO : TIPOS_ERRO).map((t) => (
                    <button
                      key={t.k}
                      type="button"
                      role="radio"
                      aria-checked={classe === t.k}
                      title={"d" in t ? t.d : undefined}
                      onClick={() => {
                        setClasse(t.k);
                        setErro(null);
                      }}
                      className={`rounded-full border px-3 py-1 text-xs transition-colors duration-150 ${
                        classe === t.k ? "border-e-glow bg-e-glow text-e-bg" : "border-e-line text-e-dim hover:text-e-ink"
                      }`}
                    >
                      {t.t}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block text-[11px] text-e-dim">
                Anotação (opcional): o que você entendeu, ou a regra com suas palavras
                <textarea value={nota} onChange={(e) => setNota(e.target.value)} rows={2} className={CAMPO} />
              </label>

              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => salvar(proximo)} disabled={salvando} className={BOTAO_PRIMARIO}>
                  {salvando && <Sparkle size={14} variante="carregando" cor="var(--e-bg)" />}
                  {salvando ? "Salvando" : revisao ? (proximaRevisao ? "Salvar e próxima da revisão" : "Salvar e voltar à fila") : "Salvar e próxima"}
                </button>
                {!revisao && (
                  <button type="button" onClick={() => salvar(questao.id)} disabled={salvando} className={BOTAO_SECUNDARIO}>
                    Salvar e refazer depois
                  </button>
                )}
              </div>
            </div>
          )}
          {erro && (
            <p role="alert" className="mt-3 text-sm text-e-bad">
              {erro}
            </p>
          )}

          {historico.length > 0 && (
            <div className="mt-5 border-t border-e-line pt-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-e-dim">Suas últimas tentativas nesta questão</p>
              <ul className="mt-2 space-y-1 text-xs text-e-dim">
                {historico.map((h) => (
                  <li key={h.id}>
                    <span className={h.correta ? "text-e-ok" : "text-e-bad"}>{h.correta ? "Acertou" : "Errou"}</span> ·{" "}
                    {CLASSIFICACAO_LABEL[h.classificacao]} ·{" "}
                    {new Date(h.respondida_em).toLocaleDateString("pt-BR", { timeZone: "America/Belem" })}
                    {h.tempo_seg ? ` · ${formatarTempo(h.tempo_seg)}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
