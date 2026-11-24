"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Cronômetro de estudo fixo no canto. Fica no layout da central, então continua
 * rodando entre as páginas. O estado vive no navegador (sobrevive a recarregar)
 * e o tempo é gravado em estudo_pomodoros com o tipo de atividade.
 */

const ATIVIDADES = [
  { id: "material", rotulo: "Lendo material" },
  { id: "lei_seca", rotulo: "Lei seca" },
  { id: "questoes", rotulo: "Questões" },
  { id: "flashcards", rotulo: "Flashcards" },
  { id: "revisao", rotulo: "Revisão" },
] as const;
type Atividade = (typeof ATIVIDADES)[number]["id"];

const CHAVE = "estudos-cronometro-v1";
const LIMITE_SEG = 4 * 3600; // trecho esquecido rodando: para em 4 h
const SALVAR_A_CADA_SEG = 60; // grava a cada minuto (pedido dela, 24/11: não perder tempo ao sair)

interface Estado {
  data: string;
  atividade: Atividade;
  rodando: boolean;
  desde: number | null;
  /** segundos ainda não gravados no servidor, por atividade */
  pendente: Partial<Record<string, number>>;
}

function relogio() {
  return Date.now();
}

function hojeBelem() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Belem" }).format(
    new Date(),
  );
}

function ler(): Estado {
  try {
    const e = JSON.parse(localStorage.getItem(CHAVE) ?? "") as Estado;
    if (e && typeof e.atividade === "string") return e;
  } catch {}
  return {
    data: hojeBelem(),
    atividade: "material",
    rodando: false,
    desde: null,
    pendente: {},
  };
}

function gravar(e: Estado) {
  localStorage.setItem(CHAVE, JSON.stringify(e));
}

/** Fecha o trecho em andamento: o tempo corrido vai para "pendente". */
function fecharTrecho(
  e: Estado,
  agora: number,
): { estado: Estado; estourou: boolean } {
  if (!e.rodando || e.desde == null) return { estado: e, estourou: false };
  let seg = Math.max(0, Math.floor((agora - e.desde) / 1000));
  const estourou = seg > LIMITE_SEG;
  if (estourou) seg = LIMITE_SEG;
  const pendente = {
    ...e.pendente,
    [e.atividade]: (e.pendente[e.atividade] ?? 0) + seg,
  };
  return {
    estado: {
      ...e,
      pendente,
      desde: estourou ? null : agora,
      rodando: !estourou,
    },
    estourou,
  };
}

function fmt(seg: number) {
  const h = Math.floor(seg / 3600);
  const m = Math.floor((seg % 3600) / 60);
  const s = seg % 60;
  return h > 0
    ? `${h}h${String(m).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

export function CronometroEstudo() {
  const [estado, setEstado] = useState<Estado | null>(null);
  const [servidor, setServidor] = useState<Record<string, number>>({});
  const [agora, setAgora] = useState(0);
  const [aberto, setAberto] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const aplicar = useCallback((e: Estado) => {
    gravar(e);
    setEstado(e);
  }, []);

  /** Manda ao servidor os minutos inteiros pendentes; o resto em segundos fica guardado. */
  const enviar = useCallback(async (saindo = false) => {
    const e = ler();
    for (const [atv, seg] of Object.entries(e.pendente)) {
      const min = Math.floor((seg ?? 0) / 60);
      if (min < 1) continue;
      const res = await fetch("/api/admin/estudos/pomodoros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: saindo,
        body: JSON.stringify({
          minutos_efetivos: min,
          pausas: 0,
          atividade: atv,
        }),
      }).catch(() => null);
      if (!res?.ok) {
        setAviso(
          "Não consegui salvar o tempo agora. Ele fica guardado e vai na próxima vez.",
        );
        continue;
      }
      const atual = ler();
      aplicar({
        ...atual,
        pendente: {
          ...atual.pendente,
          [atv]: Math.max(0, (atual.pendente[atv] ?? 0) - min * 60),
        },
      });
      setServidor((s) => ({ ...s, [atv]: (s[atv] ?? 0) + min }));
    }
  }, [aplicar]);

  // início: lê o navegador, troca de dia e busca o total de hoje
  useEffect(() => {
    const inicio = setTimeout(iniciar, 0);
    const aoMudar = (ev: StorageEvent) => ev.key === CHAVE && setEstado(ler());
    window.addEventListener("storage", aoMudar);
    return () => {
      clearTimeout(inicio);
      window.removeEventListener("storage", aoMudar);
    };

    function iniciar() {
      let e = ler();
      const hoje = hojeBelem();
      if (e.data !== hoje) {
        // o que ficou do dia anterior ainda é salvo; o trecho em andamento recomeça hoje
        const { estado: fechado } = fecharTrecho(e, Date.now());
        gravar(fechado);
        void enviar().then(() => {
          const depois = ler();
          aplicar({ ...depois, data: hoje, pendente: {} });
        });
        e = { ...fechado, data: hoje };
      } else if (
        e.rodando &&
        e.desde != null &&
        Date.now() - e.desde > LIMITE_SEG * 1000
      ) {
        const { estado: fechado } = fecharTrecho(e, Date.now());
        e = fechado;
        gravar(e);
        setAviso(
          "Pausei: o cronômetro ficou mais de 4 h sem parar. Contei só 4 h.",
        );
        void enviar();
      }
      setEstado(e);
      fetch("/api/admin/estudos/pomodoros")
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => j?.totais && setServidor(j.totais))
        .catch(() => {});
    }
  }, [aplicar, enviar]);

  // ao sair da página ou trocar de aba: fecha o trecho e grava (o cronômetro continua rodando)
  useEffect(() => {
    const aoSair = () => {
      const e = ler();
      if (!e.rodando) return;
      const { estado: fechado } = fecharTrecho(e, Date.now());
      gravar(fechado);
      void enviar(true);
    };
    const aoEsconder = () => document.visibilityState === "hidden" && aoSair();
    window.addEventListener("pagehide", aoSair);
    document.addEventListener("visibilitychange", aoEsconder);
    return () => {
      window.removeEventListener("pagehide", aoSair);
      document.removeEventListener("visibilitychange", aoEsconder);
    };
  }, [enviar]);

  // relógio da tela + gravação a cada 5 min enquanto roda
  useEffect(() => {
    if (!estado?.rodando) return;
    const t = setInterval(() => {
      const n = Date.now();
      setAgora(n);
      const e = ler();
      if (
        e.rodando &&
        e.desde != null &&
        n - e.desde >= SALVAR_A_CADA_SEG * 1000
      ) {
        const { estado: fechado, estourou } = fecharTrecho(e, n);
        aplicar(fechado);
        if (estourou)
          setAviso(
            "Pausei: o cronômetro ficou mais de 4 h sem parar. Contei só 4 h.",
          );
        void enviar();
      }
    }, 1000);
    return () => clearInterval(t);
  }, [estado?.rodando, aplicar, enviar]);

  if (!estado) return null;

  function playPausa() {
    const n = relogio();
    setAgora(n);
    setAviso(null);
    const e = ler();
    if (e.rodando) {
      const { estado: fechado } = fecharTrecho(e, n);
      aplicar({ ...fechado, rodando: false, desde: null });
      void enviar();
    } else {
      aplicar({ ...e, rodando: true, desde: n });
    }
  }

  function trocar(atv: Atividade) {
    const n = relogio();
    setAgora(n);
    const { estado: fechado } = fecharTrecho(ler(), n);
    aplicar({ ...fechado, atividade: atv });
    void enviar();
  }

  const correndo =
    estado.rodando && estado.desde != null
      ? Math.max(0, Math.floor((agora - estado.desde) / 1000))
      : 0;
  const totalDe = (atv: string) =>
    (servidor[atv] ?? 0) * 60 +
    (estado.pendente[atv] ?? 0) +
    (atv === estado.atividade ? correndo : 0);
  const chaves = new Set<string>([
    ...ATIVIDADES.map((a) => a.id),
    ...Object.keys(servidor),
  ]);
  const totalDia = [...chaves].reduce((s, k) => s + totalDe(k), 0);
  const rotulo =
    ATIVIDADES.find((a) => a.id === estado.atividade)?.rotulo ?? "";

  return (
    <div className="fixed right-3 top-2 z-[55] flex flex-col items-end print:hidden sm:right-5 sm:top-3">
      <div className="flex items-center gap-1 rounded-full border border-e-line bg-e-card/95 py-1 pl-1 pr-1 shadow-lg backdrop-blur">
        <button
          type="button"
          onClick={playPausa}
          aria-label={estado.rodando ? "Pausar cronômetro" : "Iniciar cronômetro"}
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] ${estado.rodando ? "bg-e-accent text-white" : "border border-e-line text-e-ink hover:border-e-accent"}`}
        >
          {estado.rodando ? "❚❚" : "▶"}
        </button>
        <button
          type="button"
          onClick={() => setAberto((a) => !a)}
          aria-expanded={aberto}
          aria-label={aberto ? "Fechar detalhes do cronômetro" : "Abrir detalhes do cronômetro"}
          className="flex items-center gap-1.5 rounded-full px-2 py-0.5 text-left hover:bg-e-card-2"
        >
          <span className="font-mono text-sm leading-none text-e-ink tabular-nums">{fmt(totalDe(estado.atividade))}</span>
          <span className="hidden max-w-[7rem] truncate text-[11px] text-e-dim sm:inline">{rotulo}</span>
          <span className="text-[10px] text-e-dim" aria-hidden>{aberto ? "▴" : "▾"}</span>
        </button>
      </div>
      {aberto && (
        <div className="mt-2 w-[min(17rem,calc(100vw-1.5rem))] rounded-2xl border border-e-line bg-e-card/95 p-2.5 shadow-xl backdrop-blur">
          <p className="text-[11px] text-e-dim">Trocar atividade (o cronômetro não para):</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {ATIVIDADES.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => trocar(a.id)}
                aria-pressed={a.id === estado.atividade}
                className={`rounded-full border px-2.5 py-1 text-[11px] ${a.id === estado.atividade ? "border-e-accent bg-e-accent-soft text-e-ink" : "border-e-line text-e-dim hover:text-e-ink"}`}
              >
                {a.rotulo}
              </button>
            ))}
          </div>
          <ul className="mt-3 space-y-1 text-[12px]">
            {[...chaves]
              .filter((k) => totalDe(k) > 0)
              .map((k) => (
                <li key={k} className="flex justify-between text-e-dim">
                  <span>{ATIVIDADES.find((a) => a.id === k)?.rotulo ?? "Foco (pomodoro)"}</span>
                  <span className="font-mono tabular-nums text-e-ink">{fmt(totalDe(k))}</span>
                </li>
              ))}
            <li className="flex justify-between border-t border-e-line pt-1 text-e-ink">
              <span>Total de hoje</span>
              <span className="font-mono tabular-nums">{fmt(totalDia)}</span>
            </li>
          </ul>
          <p className="mt-2 text-[11px] text-e-dim">O tempo é salvo sozinho a cada minuto e quando você sai da página.</p>
          <button type="button" onClick={() => setAberto(false)} className="mt-2 w-full rounded-full border border-e-line py-1 text-[11px] text-e-dim hover:text-e-ink">
            Fechar
          </button>
        </div>
      )}
      {aviso && (
        <p className="mt-2 max-w-[17rem] rounded-xl border border-e-line bg-e-card/95 px-2.5 py-1.5 text-[11px] text-e-warn">{aviso}</p>
      )}
    </div>
  );
}
