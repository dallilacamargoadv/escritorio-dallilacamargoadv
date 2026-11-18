"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MATERIA_POR_ID, TIPO_LABELS, type CronogramaItem } from "@/lib/estudos-utils";
import type { LinkBloco } from "@/lib/estudos-links";

export function BlocosDoDia({ itens, vazio, links = {} }: { itens: CronogramaItem[]; vazio: string; links?: Record<string, LinkBloco[]> }) {
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
    });
    if (!res.ok) {
      setEstado((s) => ({ ...s, [item.id]: !novo }));
      setErro("Não consegui salvar agora. Confira a conexão e tente de novo.");
      return;
    }
    router.refresh();
  }

  if (!itens.length) return <p className="text-sm text-e-dim">{vazio}</p>;
  const total = itens.reduce((s, i) => s + i.minutos, 0);
  return (
    <div>
      <ul className="divide-y divide-e-line">
        {itens.map((item) => {
          const feito = estado[item.id] ?? item.feito;
          return (
            <li key={item.id}>
              <label className="flex cursor-pointer items-start gap-3 py-2.5">
                <input type="checkbox" checked={feito} onChange={() => alternar(item)} className="mt-1 h-4 w-4 accent-[var(--e-accent)]" />
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm ${feito ? "text-e-dim line-through" : "text-e-ink"}`}>{item.titulo}</span>
                  <span className="text-[11px] text-e-dim">
                    {TIPO_LABELS[item.tipo]} · {item.minutos} min
                    {MATERIA_POR_ID.get(item.materia_id) ? ` · ${MATERIA_POR_ID.get(item.materia_id)!.id}` : ""}
                  </span>
                </span>
              </label>
              {!feito && (links[item.id]?.length ?? 0) > 0 && (
                <div className="-mt-1 flex flex-wrap gap-1.5 pb-2.5 pl-7">
                  {links[item.id].map((l) => (
                    <Link
                      key={l.href + l.rotulo}
                      href={l.href}
                      className="rounded-full border border-e-line px-2.5 py-0.5 text-[11px] text-e-dim transition-colors duration-150 hover:border-e-accent hover:text-e-ink"
                    >
                      {l.rotulo} →
                    </Link>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-[11px] text-e-dim">
        Total: {Math.floor(total / 60)}h{total % 60 ? ` ${total % 60}min` : ""}
      </p>
      {erro && <p role="alert" className="mt-2 text-sm text-e-bad">{erro}</p>}
    </div>
  );
}
