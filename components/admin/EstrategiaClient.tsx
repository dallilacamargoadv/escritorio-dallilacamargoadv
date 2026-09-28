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

const DIAS_UTEIS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

/** Distribui os itens diários (todo dia útil) e semanais (1 dia fixo cada,
 * revezando entre as áreas) pelos 5 dias úteis — só cadências que fazem
 * sentido numa rotina de dia a dia. Mensal/trimestral/etc. continuam
 * melhor representados na visão "Por área". */
function distribuirPorDiaUtil(areas: EstrategiaArea[]) {
  const porDia: { area: EstrategiaArea; item: EstrategiaItem }[][] = [[], [], [], [], []];
  let semanalIndex = 0;
  for (const area of areas) {
    for (const item of area.itens) {
      if (item.cadencia === "diaria") {
        for (let d = 0; d < 5; d++) porDia[d].push({ area, item });
      } else if (item.cadencia === "semanal") {
        porDia[semanalIndex % 5].push({ area, item });
        semanalIndex++;
      }
    }
  }
  return porDia;
}

export function EstrategiaClient({ areasIniciais }: { areasIniciais: EstrategiaArea[] }) {
  const [areas, setAreas] = useState(areasIniciais);
  const [aberta, setAberta] = useState<string | null>(areasIniciais[0]?.id ?? null);
  const [visao, setVisao] = useState<"area" | "semana">("area");
  const porDiaUtil = useMemo(() => distribuirPorDiaUtil(areas), [areas]);

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

      <div className="mt-6 flex gap-2">
        <button
          onClick={() => setVisao("area")}
          className={`border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide ${
            visao === "area" ? "border-gold text-gold" : "border-hairline-strong text-ink-dim"
          }`}
        >
          Por área
        </button>
        <button
          onClick={() => setVisao("semana")}
          className={`border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide ${
            visao === "semana" ? "border-gold text-gold" : "border-hairline-strong text-ink-dim"
          }`}
        >
          Por dia da semana
        </button>
      </div>

      {visao === "semana" && (
        <div className="mt-4">
          <p className="text-xs text-ink-dim">
            Só entram aqui os itens <strong className="text-ink">diários</strong> (todo dia útil)
            e <strong className="text-ink">semanais</strong> (1 dia fixo cada). Cadências mais
            longas (mensal, trimestral...) continuam na visão “Por área”. Fim de semana fica livre
            de tarefa — combinamos que sábado e domingo são só conteúdo leve.
          </p>
          <p className="mt-2 text-xs text-ink-dim">
            <strong className="text-ink">Importante:</strong> marcar um item aqui conclui ele de
            vez (não volta desmarcado sozinho na semana seguinte) — ainda não é um hábito
            recorrente de verdade. Se você quiser que reinicie toda semana, me avisa que essa é
            uma mudança maior, separada.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-5">
            {DIAS_UTEIS.map((dia, i) => (
              <div key={dia} className="border border-hairline">
                <p className="border-b border-hairline bg-bg-alt px-3 py-2 font-mono text-[10px] uppercase tracking-wide text-ink-dim">
                  {dia}
                </p>
                <div className="divide-y divide-hairline">
                  {porDiaUtil[i].length === 0 && (
                    <p className="px-3 py-3 text-xs text-ink-dim">Nada fixo aqui.</p>
                  )}
                  {porDiaUtil[i].map(({ area, item }) => (
                    <label key={item.id} className="flex cursor-pointer items-start gap-2 px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={item.concluido}
                        onChange={() => handleToggle(area.id, item)}
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-gold"
                      />
                      <span>
                        <span className="block font-mono text-[9px] uppercase tracking-wide text-ink-dim">
                          {area.nome}
                        </span>
                        <span className={`block text-xs text-ink ${item.concluido ? "text-ink-dim line-through" : ""}`}>
                          {item.titulo}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {visao === "area" && (
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
      )}
    </div>
  );
}
