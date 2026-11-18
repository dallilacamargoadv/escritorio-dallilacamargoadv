import Link from "next/link";
import { getCronograma, getDiasComBlocoFeito, QUESTAO_POR_ID } from "@/lib/db-estudos";
import type { Resposta } from "@/lib/estudos-desempenho";
import { dataBelem, ehFalha } from "@/lib/estudos-revisao";
import { formatarData, MATERIA_POR_ID } from "@/lib/estudos-utils";
import { linksDoBloco } from "@/lib/estudos-links";
import { fonteHtml } from "@/lib/estudos-html";
import { addDaysToDateString } from "@/lib/atividades-utils";
import { Card, CardTitulo } from "@/components/estudos/ui";

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
  // lei seca das erradas, sem repetir o mesmo dispositivo
  const artigos = new Map<string, { ref: string; fonte: string; materia: string }>();
  for (const q of erradas.values()) {
    if (q.fonte && q.ref && !artigos.has(q.ref)) artigos.set(q.ref, { ref: q.ref, fonte: q.fonte, materia: q.mat });
  }

  if (!estudados.length && !erradas.size && !leiDoPlano.length) return null;
  const ontem = dia === addDaysToDateString(hoje, -1);
  const rotuloDia = ontem ? "ontem" : formatarData(dia, { weekday: "long", day: "2-digit", month: "2-digit" });

  return (
    <Card className="mb-5" destaque>
      <CardTitulo>Revisão de {rotuloDia}</CardTitulo>
      <p className="-mt-1 mb-4 text-xs text-e-dim">
        Antes da fila: releia o que estudou, refaça o que errou e leia a lei seca do dia. Só entram as questões resolvidas aqui no site.
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
        <h3 className="text-[11px] uppercase tracking-[0.14em] text-e-dim">2. Seus erros ({erradas.size})</h3>
        {erradas.size ? (
          <ul className="mt-2 space-y-1.5">
            {[...erradas.values()].map((q) => (
              <li key={q.id} className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                <span className="text-e-ink">
                  {MATERIA_POR_ID.get(q.materia_id)?.nome ?? q.mat}: {q.tema}
                  <span className="text-e-dim"> · {q.ref}</span>
                </span>
                <Link href={`/admin/estudos/questoes?status=erradas&revisao=1&id=${encodeURIComponent(q.id)}`} className={CHIP}>
                  Refazer →
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-e-dim">Nenhum erro registrado no site nesse dia.</p>
        )}
      </section>

      <section>
        <h3 className="text-[11px] uppercase tracking-[0.14em] text-e-dim">3. Lei seca para ler</h3>
        {artigos.size || leiDoPlano.length ? (
          <div className="mt-2 space-y-2">
            {[...artigos.values()].map((a) => (
              <details key={a.ref} className="rounded-xl border border-e-line px-3 py-2">
                <summary className="cursor-pointer text-sm text-e-ink">
                  {a.ref} <span className="text-e-dim">· {a.materia} · do seu erro</span>
                </summary>
                <div className="mt-2 text-sm leading-relaxed text-e-ink [&_mark]:bg-e-accent-soft [&_mark]:text-e-ink" dangerouslySetInnerHTML={{ __html: fonteHtml(a.fonte) }} />
              </details>
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

