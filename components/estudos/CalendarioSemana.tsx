"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MATERIA_POR_ID, TIPO_LABELS, type CronogramaItem } from "@/lib/estudos-utils";
import type { LinkBloco } from "@/lib/estudos-links";

/** Cores aprovadas por ela em 22/11/2026. Matérias fora da lista usam a cor neutra. */
export const COR_MATERIA: Record<string, { nome: string; cor: string }> = {
  B2: { nome: "Administrativo", cor: "#9b7bea" },
  B5: { nome: "Proc. Civil", cor: "#3cc5bd" },
  B7: { nome: "Tributário", cor: "#f07a5f" },
  B3: { nome: "Constitucional", cor: "#5b9cf0" },
  A1: { nome: "Português", cor: "#ee7fb6" },
  A2: { nome: "RLM", cor: "#f0b43c" },
  A3: { nome: "Informática", cor: "#5cc96e" },
};
const COR_OUTRA = "#8d8f99";
const COR_REVISAO = "#e9e4d8";
const COR_CINZA = "#9a9ba3";

function estilo(item: CronogramaItem) {
  if (item.tipo === "simulado" || item.tipo === "discursiva") return { cor: COR_CINZA, tracejado: false };
  if (item.tipo === "revisao") return { cor: COR_REVISAO, tracejado: true };
  return { cor: COR_MATERIA[item.materia_id]?.cor ?? COR_OUTRA, tracejado: false };
}

function horas(min: number) {
  return `${Math.floor(min / 60)}h${min % 60 ? String(min % 60).padStart(2, "0") : ""}`;
}

export function CalendarioSemana({
  dias,
  itens,
  hoje,
  links = {},
}: {
  dias: { data: string; rotulo: string; numero: string }[];
  itens: CronogramaItem[];
  hoje: string;
  links?: Record<string, LinkBloco[]>;
}) {
  const router = useRouter();
  const [estado, setEstado] = useState<Record<string, boolean>>({});
  const [erro, setErro] = useState<string | null>(null);

  async function alternar(item: CronogramaItem) {
    const novo = !(estado[item.id] ?? item.feito);
    setEstado((s) => ({ ...s, [item.id]: novo }));
    setErro(null);
    const res = await fetch(`/api/admin/estudos/cronograma/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feito: novo }),
    }).catch(() => null);
    if (!res?.ok) {
      setEstado((s) => ({ ...s, [item.id]: !novo }));
      setErro("Não consegui salvar agora. Confira a conexão e tente de novo.");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <ul className="flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] text-e-dim">
        {Object.values(COR_MATERIA).map((m) => (
          <li key={m.nome} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: m.cor }} />
            {m.nome}
          </li>
        ))}
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-dashed" style={{ borderColor: COR_REVISAO }} />
          Revisão
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: COR_CINZA }} />
          Simulado / estudo de caso
        </li>
      </ul>

      <div className="-mx-4 mt-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        <div className="grid min-w-[56rem] grid-cols-7 gap-2">
          {dias.map((d) => {
            const doDia = itens.filter((i) => i.data === d.data).sort((a, b) => a.ordem - b.ordem);
            const total = doDia.reduce((s, i) => s + i.minutos, 0);
            const feitos = doDia.filter((i) => estado[i.id] ?? i.feito).reduce((s, i) => s + i.minutos, 0);
            const eHoje = d.data === hoje;
            return (
              <section key={d.data} className={`flex flex-col rounded-2xl border bg-e-card p-2 ${eHoje ? "border-e-accent" : "border-e-line"}`}>
                <h3 className="px-1 pb-2 text-center">
                  <span className="block text-[10px] uppercase tracking-[0.14em] text-e-dim">{d.rotulo}</span>
                  <span className={`text-lg ${eHoje ? "text-e-accent" : "text-e-ink"}`}>{d.numero}</span>
                </h3>
                <div className="flex flex-1 flex-col gap-1.5">
                  {doDia.length === 0 && <p className="px-1 text-center text-[11px] text-e-dim">Livre</p>}
                  {doDia.map((item) => {
                    const feito = estado[item.id] ?? item.feito;
                    const { cor, tracejado } = estilo(item);
                    const materia = COR_MATERIA[item.materia_id]?.nome ?? MATERIA_POR_ID.get(item.materia_id)?.nome ?? "";
                    return (
                      <div key={item.id}>
                        <button
                          type="button"
                          onClick={() => alternar(item)}
                          aria-pressed={feito}
                          title={feito ? "Feito. Clique para desmarcar." : "Clique para marcar como feito."}
                          className={`w-full rounded-lg border px-2 py-1.5 text-left transition-opacity duration-150 ${tracejado ? "border-dashed" : "border-l-4"} ${feito ? "opacity-45" : "hover:brightness-110"}`}
                          style={{
                            borderColor: cor,
                            background: tracejado ? "transparent" : `${cor}22`,
                          }}
                        >
                          <span className="flex items-start gap-1">
                            <span className={`min-w-0 flex-1 text-[12px] leading-snug ${feito ? "text-e-dim line-through" : "text-e-ink"}`}>
                              {item.titulo}
                            </span>
                            {feito && <span className="text-[11px] text-e-ok">✓</span>}
                          </span>
                          <span className="mt-0.5 block text-[10px] text-e-dim">
                            {TIPO_LABELS[item.tipo]} · {item.minutos} min{materia ? ` · ${materia}` : ""}
                          </span>
                        </button>
                        {!feito && (links[item.id]?.length ?? 0) > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {links[item.id].map((l) => (
                              <Link
                                key={l.href + l.rotulo}
                                href={l.href}
                                className="rounded-full border border-e-line px-1.5 py-0.5 text-[10px] text-e-dim hover:border-e-accent hover:text-e-ink"
                              >
                                {l.rotulo} →
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {total > 0 && (
                  <p className="mt-2 px-1 text-center text-[10px] text-e-dim">
                    {horas(feitos)} de {horas(total)}
                  </p>
                )}
              </section>
            );
          })}
        </div>
      </div>
      {erro && <p role="alert" className="mt-2 text-sm text-e-bad">{erro}</p>}
    </div>
  );
}
