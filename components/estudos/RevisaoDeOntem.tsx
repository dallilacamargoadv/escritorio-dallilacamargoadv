import Link from "next/link";
import { getCronograma, getDiasComBlocoFeito, QUESTAO_POR_ID } from "@/lib/db-estudos";
import type { Resposta } from "@/lib/estudos-desempenho";
import { dataBelem, ehFalha } from "@/lib/estudos-revisao";
import { formatarData, MATERIA_POR_ID } from "@/lib/estudos-utils";
import { linksDoBloco } from "@/lib/estudos-links";
import { fonteHtml } from "@/lib/estudos-html";
import { SUBTEMAS } from "@/lib/estudos-subtemas";
import { LeiSecaFlash } from "@/components/estudos/LeiSecaFlash";
import { certoErradoDoArtigo } from "@/lib/estudos-lei-flash";
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
 * Revisão do último dia de estudo (normalmente ontem): o que foi estudado, as questões erradas
 * nesse dia e a lei seca correspondente (artigos das erradas + blocos de lei seca do plano).
 */
export async function RevisaoDeOntem({ hoje, respostas }: { hoje: string; respostas: Resposta[] }) {
  let diasFeitos: string[];
  try {
    diasFeitos = await getDiasComBlocoFeito();
  } catch {
    return null;
  }
  const diasResposta = respostas.map((r) => dataBelem(r.respondida_em));
  const dia = [...new Set([...diasFeitos, ...diasResposta])].filter((d) => d < hoje).sort().at(-1);
  if (!dia) return null;

  let blocos;
  try {
    blocos = (await getCronograma(dia, dia)).filter((b) => b.feito && b.tipo !== "revisao" && b.tipo !== "simulado");
  } catch {
    return null;
  }
  const estudados = blocos.filter((b) => b.tipo !== "lei_seca");
  const leiDoPlano = blocos.filter((b) => b.tipo === "lei_seca");

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
  // lei seca das erradas, sem repetir o mesmo dispositivo
  const artigos = new Map<string, { ref: string; fonte: string; materia: string }>();
  for (const q of erradas.values()) {
    if (q.fonte && q.ref && !artigos.has(q.ref)) artigos.set(q.ref, { ref: q.ref, fonte: q.fonte, materia: q.mat });
  }

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

  if (!estudados.length && !erradas.size && !leiDoPlano.length) return null;
  const ontem = dia === addDaysToDateString(hoje, -1);
  const rotuloDia = ontem ? "ontem" : formatarData(dia, { weekday: "long", day: "2-digit", month: "2-digit" });

  return (
    <Card className="mb-5" destaque>
      <CardTitulo>Revisão de {rotuloDia}</CardTitulo>
      <p className="-mt-1 mb-4 text-xs text-e-dim">
        Antes da fila: releia o que estudou, refaça o que errou (abra só a matéria que for fazer) e vire os flashcards da lei seca. Só entram as questões resolvidas aqui no site.
      </p>

      <section className="mb-4">
        <h3 className="text-[11px] uppercase tracking-[0.14em] text-e-dim">1. O que você estudou ({estudados.length})</h3>
        {estudados.length ? (
          <ul className="mt-2 space-y-2">
            {estudados.map((b) => (
              <li key={b.id} className="text-sm text-e-ink">
                {b.titulo}
                <span className="mt-1 flex flex-wrap gap-1.5">
                  {linksDoBloco(b).map((l) => (
                    <Link key={l.href + l.rotulo} href={l.href} className={CHIP}>
                      {l.rotulo} →
                    </Link>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-e-dim">Nenhum bloco marcado como feito nesse dia.</p>
        )}
      </section>

      <section className="mb-4">
        <h3 className="text-[11px] uppercase tracking-[0.14em] text-e-dim">
          2. Seus erros, por matéria ({erradas.size}{erradas.size ? `, ${erradas.size - pendentes.length} refeitos hoje` : ""})
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

      <section>
        <h3 className="text-[11px] uppercase tracking-[0.14em] text-e-dim">3. Lei seca em flashcard</h3>
        {artigos.size || leiDoPlano.length ? (
          <div className="mt-2 space-y-2">
            {[...artigos.values()].map((a) => (
              <LeiSecaFlash key={a.ref} refLei={a.ref} detalhe={`${a.materia} · do seu erro`} html={fonteHtml(a.fonte)} itens={certoErradoDoArtigo(a.ref)} />
            ))}
            {leiDoPlano.map((b) => (
              <div key={b.id} className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-e-line px-3 py-2 text-sm">
                <span className="text-e-ink">{b.titulo}</span>
                <span className="flex flex-wrap gap-1.5">
                  {linksDoBloco(b).map((l) => (
                    <Link key={l.href + l.rotulo} href={l.href} className={CHIP}>
                      {l.rotulo} →
                    </Link>
                  ))}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-e-dim">Sem lei seca registrada nesse dia.</p>
        )}
      </section>
    </Card>
  );
}

