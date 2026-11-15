"use client";

import { useMemo, useState } from "react";
import {
  FASE_LABELS,
  MATERIAS,
  STATUS_LABELS,
  STATUS_PESO,
  materiaAtiva,
  type EstudoConfig,
  type TopicoEstado,
  type TopicoStatus,
} from "@/lib/estudos-utils";

const STATUS_ORDEM: TopicoStatus[] = ["nao_iniciado", "estudando", "revisar", "dominado"];
const STATUS_COR: Record<TopicoStatus, string> = {
  nao_iniciado: "border-e-line text-e-dim",
  estudando: "border-e-warn text-e-warn",
  revisar: "border-e-bad text-e-bad",
  dominado: "border-e-ok text-e-ok",
};

export function EditalClient({ estadosIniciais, config }: { estadosIniciais: TopicoEstado[]; config: EstudoConfig }) {
  const [estados, setEstados] = useState(() => new Map(estadosIniciais.map((e) => [e.topico_id, e])));
  const [filtro, setFiltro] = useState<TopicoStatus | "todos">("todos");
  const [erro, setErro] = useState<string | null>(null);

  async function salvar(topicoId: string, patch: Partial<TopicoEstado>) {
    const anterior = estados.get(topicoId);
    const novo: TopicoEstado = {
      topico_id: topicoId,
      status: anterior?.status ?? "nao_iniciado",
      fora_do_edital: anterior?.fora_do_edital ?? false,
      nota: anterior?.nota ?? null,
      ...patch,
    };
    setEstados((m) => new Map(m).set(topicoId, novo));
    setErro(null);
    const res = await fetch(`/api/admin/estudos/topicos/${topicoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      setEstados((m) => {
        const c = new Map(m);
        if (anterior) c.set(topicoId, anterior);
        else c.delete(topicoId);
        return c;
      });
      setErro("Não consegui salvar agora. Confira a conexão e tente de novo.");
    }
  }

  const grupos = useMemo(() => {
    const ordem = [1, 2, 3, 0, 4, 5];
    return ordem.map((f) => ({ fase: f, materias: MATERIAS.filter((m) => m.fase === f) })).filter((g) => g.materias.length);
  }, []);

  return (
    <div className="space-y-6">
      <p className="text-sm text-e-dim">
        Marque o andamento de cada tópico. O cronograma usa essas marcas: tópico dominado sai do plano, e o que estiver
        em &quot;Precisa revisar&quot; aparece no diagnóstico. Se o edital oficial não trouxer um tópico, marque &quot;Fora do
        edital&quot;.
      </p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por andamento">
        {(["todos", ...STATUS_ORDEM] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFiltro(s)}
            aria-pressed={filtro === s}
            className={`rounded-full border px-3 py-1.5 text-xs transition-colors duration-150 ${
              filtro === s ? "border-e-accent bg-e-glow text-e-bg" : "border-e-line text-e-dim hover:text-e-ink"
            }`}
          >
            {s === "todos" ? "Todos" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>
      {erro && <p role="alert" className="text-sm text-e-bad">{erro}</p>}

      {grupos.map((g) => (
        <section key={g.fase} className="space-y-3">
          <h2 className="text-[11px] uppercase tracking-[0.14em] text-e-dim">{FASE_LABELS[g.fase]}</h2>
          {g.materias.map((m) => {
            const ativa = materiaAtiva(m, config);
            const tops = m.topicos.filter((t) => filtro === "todos" || (estados.get(t.id)?.status ?? "nao_iniciado") === filtro);
            const validos = m.topicos.filter((t) => !estados.get(t.id)?.fora_do_edital);
            const pct = validos.length
              ? Math.round((validos.reduce((s, t) => s + STATUS_PESO[estados.get(t.id)?.status ?? "nao_iniciado"], 0) / validos.length) * 100)
              : 0;
            if (!tops.length) return null;
            return (
              <details key={m.id} className={`rounded-2xl border border-e-line bg-e-card ${ativa ? "" : "opacity-70"}`}>
                <summary className="flex cursor-pointer items-center gap-3 p-3">
                  <span className="text-xs text-e-dim">{m.id}</span>
                  <span className="flex-1 text-sm text-e-ink">
                    {m.nome}
                    {m.condicional && <span className="ml-2 text-xs text-e-dim">({ativa ? "incluída no plano" : "só se o edital trouxer"})</span>}
                  </span>
                  <span className="text-xs text-e-ink tabular-nums">{pct}%</span>
                </summary>
                <ul className="divide-y divide-e-line border-t border-e-line">
                  {tops.map((t) => {
                    const e = estados.get(t.id);
                    const status = e?.status ?? "nao_iniciado";
                    return (
                      <li key={t.id} className={`p-3 ${e?.fora_do_edital ? "opacity-50" : ""}`}>
                        <p className="text-sm text-e-ink">
                          <span className="text-xs text-e-dim">{t.n}.</span> {t.titulo}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-e-dim">{t.sub.join(" · ")}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          {STATUS_ORDEM.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => salvar(t.id, { status: s })}
                              aria-pressed={status === s}
                              className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors duration-150 ${
                                status === s ? STATUS_COR[s] + " bg-e-card" : "border-e-line text-e-dim hover:text-e-ink"
                              }`}
                            >
                              {STATUS_LABELS[s]}
                            </button>
                          ))}
                          <label className="ml-auto flex items-center gap-1.5 text-[11px] text-e-dim">
                            <input
                              type="checkbox"
                              checked={e?.fora_do_edital ?? false}
                              onChange={(ev) => salvar(t.id, { fora_do_edital: ev.target.checked })}
                              className="accent-[var(--e-accent)]"
                            />
                            Fora do edital
                          </label>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </details>
            );
          })}
        </section>
      ))}
    </div>
  );
}
