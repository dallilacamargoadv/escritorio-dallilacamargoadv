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
const SALVAR_A_CADA_SEG = 5 * 60;

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
  const enviar = useCallback(async () => {
    const e = ler();
    for (const [atv, seg] of Object.entries(e.pendente)) {
      const min = Math.floor((seg ?? 0) / 60);
      if (min < 1) continue;
      const res = await fetch("/api/admin/estudos/pomodoros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    <div className="fixed bottom-20 right-4 z-[55] w-[min(18rem,calc(100vw-2rem))] print:hidden sm:right-6">
      <div className="rounded-2xl border border-e-line bg-e-card/95 shadow-xl backdrop-blur">
        <div className="flex items-center gap-2 p-2.5">
          <button
            type="button"
            onClick={playPausa}
            aria-label={
              estado.rodando ? "Pausar cronômetro" : "Iniciar cronômetro"
            }
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm ${estado.rodando ? "bg-e-accent text-white" : "border border-e-line text-e-ink hover:border-e-accent"}`}
          >
            {estado.rodando ? "❚❚" : "▶"}
          </button>
          <button
            type="button"
            onClick={() => setAberto((a) => !a)}
            className="min-w-0 flex-1 text-left"
            aria-expanded={aberto}
          >
            <span className="block font-mono text-lg leading-tight text-e-ink tabular-nums">
              {fmt(totalDe(estado.atividade))}
            </span>
            <span className="block truncate text-[11px] text-e-dim">
              {rotulo} · hoje {fmt(totalDia)}
            </span>
          </button>
          <span className="text-xs text-e-dim" aria-hidden>
            {aberto ? "▾" : "▴"}
          </span>
        </div>
        {aberto && (
          <div className="border-t border-e-line p-2.5">
            <p className="text-[11px] text-e-dim">
              Trocar atividade (o cronômetro não para):
            </p>
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
                    <span>
                      {ATIVIDADES.find((a) => a.id === k)?.rotulo ??
                        "Foco (pomodoro)"}
                    </span>
                    <span className="font-mono tabular-nums text-e-ink">
                      {fmt(totalDe(k))}
                    </span>
                  </li>
                ))}
              <li className="flex justify-between border-t border-e-line pt-1 text-e-ink">
                <span>Total de hoje</span>
                <span className="font-mono tabular-nums">{fmt(totalDia)}</span>
              </li>
            </ul>
          </div>
        )}
        {aviso && (
          <p className="px-2.5 pb-2.5 text-[11px] text-e-warn">{aviso}</p>
        )}
      </div>
    </div>
  );
}
