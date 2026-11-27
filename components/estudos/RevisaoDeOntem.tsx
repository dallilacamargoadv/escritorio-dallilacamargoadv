import Link from "next/link";
import { QUESTAO_POR_ID } from "@/lib/db-estudos";
import type { Resposta } from "@/lib/estudos-desempenho";
import { dataBelem, ehFalha } from "@/lib/estudos-revisao";
import { formatarData, MATERIA_POR_ID } from "@/lib/estudos-utils";
import { SUBTEMAS } from "@/lib/estudos-subtemas";
import { addDaysToDateString } from "@/lib/atividades-utils";
import { Card, CardTitulo } from "@/components/estudos/ui";

interface Grupo {
  materia_id: string;
  nome: string;
  total: number;
  pendentes: string[];
  subs: { chave: string; nome: string; filtro: Record<string, string>; ids: string[]; pendentes: string[] }[];
}

/** Refazer em sequência só a matéria (ou o subtema) clicada. */
function linkRefazer(id: string, filtro: Record<string, string>) {
  const p = new URLSearchParams({ status: "erradas", revisao: "1", ...filtro, id });
  return `/admin/estudos/questoes?${p.toString()}`;
}

const CHIP = "rounded-full border border-e-line px-2.5 py-0.5 text-[11px] text-e-dim transition-colors duration-150 hover:border-e-accent hover:text-e-ink";

/**
 * Erros do último dia de estudo (normalmente ontem), por matéria e subtema, para refazer.
 * Fica no Mapa dos erros (27/11): a Revisão mostra só o que fazer hoje.
 */
export function RevisaoDeOntem({ hoje, respostas }: { hoje: string; respostas: Resposta[] }) {
  const dia = [...new Set(respostas.map((r) => dataBelem(r.respondida_em)))].filter((d) => d < hoje).sort().at(-1);
  if (!dia) return null;

  // erradas do dia: uma vez cada questão, mesmo que tenha errado duas vezes
  const erradas = new Map<string, NonNullable<ReturnType<typeof QUESTAO_POR_ID.get>>>();
  for (const r of respostas) {
    if (dataBelem(r.respondida_em) !== dia || !ehFalha(r)) continue;
    const q = QUESTAO_POR_ID.get(r.questao_id);
    if (q) erradas.set(q.id, q);
  }
  // já refeitas hoje: guarda a última resposta de hoje de cada uma
  const refeitaHoje = new Map<string, Resposta>();
  for (const r of respostas) if (dataBelem(r.respondida_em) === hoje && erradas.has(r.questao_id)) refeitaHoje.set(r.questao_id, r);
  const pendentes = [...erradas.keys()].filter((id) => !refeitaHoje.has(id));

  // agrupa por matéria e, dentro dela, por subtema (ou tema, quando a questão não tem subtema)
  const porMateria = new Map<string, Grupo>();
  for (const q of erradas.values()) {
    const g = porMateria.get(q.materia_id) ?? {
      materia_id: q.materia_id,
      nome: MATERIA_POR_ID.get(q.materia_id)?.nome ?? q.mat,
      total: 0,
      pendentes: [],
      subs: [],
    };
    const filtro: Record<string, string> = q.subtema && SUBTEMAS[q.subtema] ? { subtema: q.subtema } : { tema: q.tema };
    const chave = filtro.subtema ? "s:" + filtro.subtema : "t:" + q.tema;
    let s = g.subs.find((x) => x.chave === chave);
    if (!s) {
      s = { chave, nome: filtro.subtema ? SUBTEMAS[filtro.subtema].nome : q.tema, filtro, ids: [], pendentes: [] };
      g.subs.push(s);
    }
    s.ids.push(q.id);
    g.total++;
    if (!refeitaHoje.has(q.id)) {
      s.pendentes.push(q.id);
      g.pendentes.push(q.id);
    }
    porMateria.set(q.materia_id, g);
  }
  const grupos = [...porMateria.values()].sort((a, b) => b.total - a.total);
  for (const g of grupos) g.subs.sort((a, b) => b.ids.length - a.ids.length);

  if (!erradas.size) return null;
  const ontem = dia === addDaysToDateString(hoje, -1);
  const rotuloDia = ontem ? "ontem" : formatarData(dia, { weekday: "long", day: "2-digit", month: "2-digit" });

  return (
    <Card className="mb-4">
      <CardTitulo>Erros de {rotuloDia} para refazer</CardTitulo>
      <p className="-mt-1 mb-3 text-xs text-e-dim">
        Abra só a matéria que for fazer. Eles também entram na revisão de todo dia como flashcards, alguns por dia.
      </p>

      <section>
        <h3 className="text-[11px] uppercase tracking-[0.14em] text-e-dim">
          {erradas.size} {erradas.size === 1 ? "erro" : "erros"}{erradas.size ? `, ${erradas.size - pendentes.length} refeitos hoje` : ""}
        </h3>
        {grupos.length ? (
          <div className="mt-2 divide-y divide-e-line rounded-xl border border-e-line">
            {grupos.map((g) => (
              <details key={g.materia_id} className="group px-3 py-2">
                <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 text-sm text-e-ink">
                  <span className="flex items-center gap-2">
                    <span className="text-e-dim transition-transform duration-150 group-open:rotate-90" aria-hidden="true">›</span>
                    {g.nome}
                    <span className="rounded-full bg-e-bad-soft px-2 py-0.5 text-[11px] text-e-bad">
                      {g.total} {g.total === 1 ? "erro" : "erros"}
                    </span>
                    {g.pendentes.length < g.total && <span className="text-[11px] text-e-ok">{g.total - g.pendentes.length} refeitos</span>}
                  </span>
                  {g.pendentes.length > 0 && (
                    <Link href={linkRefazer(g.pendentes[0], { materia: g.materia_id })} className={CHIP}>
                      Refazer todas ({g.pendentes.length}) →
                    </Link>
                  )}
                </summary>
                <ul className="mt-2 space-y-1.5 pb-1 pl-5">
                  {g.subs.map((s) => (
                    <li key={s.chave} className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                      <span className="text-e-ink">
                        {s.nome} <span className="text-e-dim">· {s.ids.length}</span>
                      </span>
                      {s.pendentes.length ? (
                        <Link href={linkRefazer(s.pendentes[0], { materia: g.materia_id, ...s.filtro })} className={CHIP}>
                          Refazer {s.pendentes.length} →
                        </Link>
                      ) : (
                        <span className="text-[11px] text-e-ok">refeitas hoje ✓</span>
                      )}
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-e-dim">Nenhum erro registrado no site nesse dia.</p>
        )}
      </section>

    </Card>
  );
}

