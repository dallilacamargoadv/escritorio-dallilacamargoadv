"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pause, Play, RotateCcw, Square } from "lucide-react";
import { addDaysToDateString } from "@/lib/atividades-utils";
import { rotuloEtapa } from "@/lib/estudos-revisao";
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

  async function responder(ok: boolean) {
    if (!atual) return;
    setSalvando(true);
    const e = await enviarRevisao({ tipo: "cartao", id: atual.id, ok });
    setSalvando(false);
    if (e) return setErro(e);
    setErro(null);
    setVirado(false);
    setFeitos((n) => n + 1);
    // errou: volta ao fim da fila de hoje para uma segunda tentativa
    setFila((f) => (ok ? f.slice(1) : [...f.slice(1), { ...f[0], etapa: 0, novo: false }]));
  }

  return (
    <Card>
      <CardTitulo acao={<span className="text-xs tabular-nums text-e-dim">{fila.length} na fila · {feitos} feitos</span>}>Cartões</CardTitulo>
      {!atual ? (
        <p className="flex items-center gap-2 text-sm text-e-dim">
          <Sparkle size={14} /> Cartões do dia terminados.
        </p>
      ) : (
        <div>
          <p className="text-[11px] text-e-dim">
            {atual.baralho} · {atual.novo ? "novo" : rotuloEtapa(atual.etapa)}
          </p>
          <div className="mt-2 rounded-xl border border-e-line bg-e-card-2 p-4 text-base leading-relaxed text-e-ink" dangerouslySetInnerHTML={{ __html: atual.frente }} />
          {virado ? (
            <>
              <div className="mt-2 rounded-xl border border-e-accent/40 p-4 text-base leading-relaxed text-e-ink" dangerouslySetInnerHTML={{ __html: atual.verso }} />
              {atual.extra && <p className="mt-2 text-xs text-e-dim" dangerouslySetInnerHTML={{ __html: atual.extra }} />}
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" disabled={salvando} onClick={() => responder(true)} className={BOTAO_PRIMARIO}>
                  Lembrei
                </button>
                <button type="button" disabled={salvando} onClick={() => responder(false)} className={BOTAO_SECUNDARIO}>
                  Esqueci, volta amanhã
                </button>
              </div>
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

/* ===================== TELA ===================== */

export function RevisaoClient({
  hoje,
  questoes,
  artigos,
  cartoes,
  proximos,
  pomodoros,
}: {
  hoje: string;
  questoes: QuestaoFila[];
  artigos: ArtigoFila[];
  cartoes: CartaoFila[];
  proximos: { questoes: number; artigos: number; cartoes: number };
  pomodoros: { data: string; minutos: number }[];
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
