"use client";

import { useMemo, useState } from "react";
import type { EstrategiaArea, EstrategiaItem } from "@/lib/db-estrategia";
import { CADENCIA_LABELS } from "@/lib/admin-labels";

const CADENCIA_ORDEM = [
  "diaria",
  "semanal",
  "quinzenal",
  "mensal",
  "trimestral",
  "semestral",
  "anual",
  "ao_final_do_caso",
  "segundo_semestre",
] as const;

export function EstrategiaClient({ areasIniciais }: { areasIniciais: EstrategiaArea[] }) {
  const [areas, setAreas] = useState(areasIniciais);
  const [aberta, setAberta] = useState<string | null>(areasIniciais[0]?.id ?? null);

  async function handleToggle(areaId: string, item: EstrategiaItem) {
    const novoValor = !item.concluido;
    setAreas((prev) =>
      prev.map((a) =>
        a.id !== areaId
          ? a
          : { ...a, itens: a.itens.map((i) => (i.id === item.id ? { ...i, concluido: novoValor } : i)) },
      ),
    );
    const res = await fetch(`/api/admin/estrategia/itens/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ concluido: novoValor }),
    });
    if (res.ok) {
      const { item: atualizado } = await res.json();
      setAreas((prev) =>
        prev.map((a) =>
          a.id !== areaId
            ? a
            : { ...a, itens: a.itens.map((i) => (i.id === item.id ? atualizado : i)) },
        ),
      );
    }
  }

  const progressoGeral = useMemo(() => {
    const todos = areas.flatMap((a) => a.itens);
    const concluidos = todos.filter((i) => i.concluido).length;
    return { concluidos, total: todos.length };
  }, [areas]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="border-b border-hairline pb-6">
        <p className="font-eyebrow text-[10px] text-ink-dim">Marketing</p>
        <h1 className="mt-3 text-lg italic text-ink">Estratégia de 90 dias</h1>
        <p className="mt-2 text-sm text-ink-dim">
          As 6 frentes do seu planejamento (Perfil 1 — construção de autoridade e estrutura),
          com o plano operacional em checklist. Marcar um item cria o compromisso em
          Atividades sozinho.
        </p>
      </div>

      <div className="mt-6 flex items-center gap-4 border border-hairline p-5">
        <div className="flex-1">
          <div className="h-2 w-full overflow-hidden bg-bg-alt">
            <div
              className="h-full bg-gold transition-all duration-300"
              style={{
                width: `${progressoGeral.total > 0 ? (progressoGeral.concluidos / progressoGeral.total) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
        <span className="font-mono text-xs text-ink-dim tabular-nums">
          {progressoGeral.concluidos}/{progressoGeral.total} concluídos
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {areas.map((area, idx) => {
          const concluidos = area.itens.filter((i) => i.concluido).length;
          const aberto = aberta === area.id;
          const grupos = CADENCIA_ORDEM.map((cad) => ({
            cad,
            itens: area.itens.filter((i) => i.cadencia === cad),
          })).filter((g) => g.itens.length > 0);

          return (
            <div key={area.id} className="border border-hairline">
              <button
                onClick={() => setAberta(aberto ? null : area.id)}
                className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left"
              >
                <span className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-ink-dim">{String(idx + 1).padStart(2, "0")}</span>
                  <span className="font-display text-base italic text-ink">{area.nome}</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-wide text-ink-dim tabular-nums">
                    {concluidos}/{area.itens.length}
                  </span>
                  <span className={`text-ink-dim transition-transform ${aberto ? "rotate-90" : ""}`}>›</span>
                </span>
              </button>

              {aberto && (
                <div className="border-t border-hairline px-5 pb-5">
                  {area.objetivo && (
                    <p className="pt-4 text-xs text-ink-dim">{area.objetivo}</p>
                  )}
                  {grupos.map(({ cad, itens }) => (
                    <div key={cad} className="mt-4">
                      <p className="font-mono text-[10px] uppercase tracking-wide text-wine">
                        {CADENCIA_LABELS[cad]}
                      </p>
                      <div className="mt-1.5 divide-y divide-hairline">
                        {itens.map((item) => (
                          <label
                            key={item.id}
                            className="flex cursor-pointer items-start gap-3 py-2"
                          >
                            <input
                              type="checkbox"
                              checked={item.concluido}
                              onChange={() => handleToggle(area.id, item)}
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-gold"
                            />
                            <span>
                              <span className={`block text-sm text-ink ${item.concluido ? "text-ink-dim line-through" : ""}`}>
                                {item.titulo}
                              </span>
                              {item.indicador && (
                                <span className="mt-0.5 block text-xs text-ink-dim">
                                  Indicador: {item.indicador}
                                </span>
                              )}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
