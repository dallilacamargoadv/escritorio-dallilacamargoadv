import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getRespostas, QUESTAO_POR_ID } from "@/lib/db-estudos";
import { CADERNOS, getAulasEstudadas } from "@/lib/db-estudos-cadernos";
import { ETAPA_LABEL } from "@/lib/estudos-cadernos";
import { CLASSIFICACAO_LABEL, EH_ERRO, cadernoDeErros, cadernoPorSubtema } from "@/lib/estudos-desempenho";
import { htmlSeguro } from "@/lib/estudos-html";
import { SUBTEMAS } from "@/lib/estudos-subtemas";
import { TOPICO_POR_ID } from "@/lib/estudos-utils";
import { BlocoView } from "@/components/estudos/CadernoBlocos";
import { MarcarAula } from "@/components/estudos/MarcarAula";
import { Sparkle } from "@/components/estudos/Sparkle";
import { Barra } from "@/components/estudos/ui";

export default async function CadernoPage(props: PageProps<"/admin/estudos/cadernos/[materia]">) {
  const { materia } = await props.params;
  const sp = await props.searchParams;
  const caderno = CADERNOS[materia];
  if (!caderno) notFound();
  let dados;
  try {
    dados = await Promise.all([getAulasEstudadas(), getRespostas()]);
  } catch {
    redirect("/login");
  }
  const [estudadas, respostas] = dados;
  const pedida = typeof sp.aula === "string" ? sp.aula : "";
  const prontas = caderno.aulas.filter((a) => a.status === "pronta");
  const vista =
    pedida === "banca" || pedida === "glossario"
      ? pedida
      : (caderno.aulas.find((a) => a.id === pedida && a.status === "pronta")?.id ?? prontas.find((a) => !estudadas.has(a.id))?.id ?? prontas[0]?.id ?? "banca");
  const aula = caderno.aulas.find((a) => a.id === vista);
  const erros = cadernoDeErros(respostas, caderno.materia_id, QUESTAO_POR_ID);
  const grupos = cadernoPorSubtema(erros);
  const feitas = prontas.filter((a) => estudadas.has(a.id)).length;
  const href = (id: string) => `/admin/estudos/cadernos/${materia}?aula=${id}`;
  const itemCls = (on: boolean) =>
    `flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors duration-150 ${on ? "bg-e-accent-soft text-e-ink" : "text-e-dim hover:text-e-ink"}`;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_minmax(0,1fr)_260px]">
      <nav aria-label={`Índice do caderno de ${caderno.titulo}`} className="lg:sticky lg:top-6 lg:self-start">
        <Link href="/admin/estudos/cadernos" className="text-[11px] uppercase tracking-[0.14em] text-e-dim hover:text-e-ink">← Cadernos</Link>
        <p className="mt-2 text-lg font-medium text-e-ink">{caderno.titulo}</p>
        <div className="mt-2 flex items-center gap-2"><Barra pct={prontas.length ? (feitas / prontas.length) * 100 : 0} /></div>
        <p className="mt-1 text-[11px] text-e-dim">{feitas} de {prontas.length} aulas prontas estudadas</p>
        <div className="mt-4 flex max-h-[70vh] flex-col gap-0.5 overflow-y-auto">
          {caderno.banca && (
            <Link href={href("banca")} className={itemCls(vista === "banca")}>Mapa da banca</Link>
          )}
          {caderno.aulas.map((a) =>
            a.status === "pronta" ? (
              <Link key={a.id} href={href(a.id)} aria-current={vista === a.id ? "page" : undefined} className={itemCls(vista === a.id)}>
                {vista === a.id ? <Sparkle size={11} /> : estudadas.has(a.id) ? <span className="text-e-ok" aria-label="estudada">✓</span> : <span className="w-[11px]" />}
                <span className="min-w-0 truncate">{a.numero}. {a.titulo}</span>
              </Link>
            ) : (
              <span key={a.id} className="flex items-center gap-2 px-2.5 py-1.5 text-sm text-e-dim/60">
                <span className="w-[11px]" />
                <span className="min-w-0 truncate">{a.numero}. {a.titulo}</span>
              </span>
            ),
          )}
          {caderno.glossario.length > 0 && <Link href={href("glossario")} className={itemCls(vista === "glossario")}>Glossário</Link>}
        </div>
      </nav>

      <article className="min-w-0 space-y-5">
        {vista === "banca" && caderno.banca && (
          <>
            <header>
              <p className="text-[11px] uppercase tracking-[0.14em] text-e-dim">{caderno.titulo} · Mapa da banca</p>
              <h1 className="mt-1 text-2xl font-medium text-e-ink">{caderno.banca.titulo}</h1>
              <p className="mt-1 text-xs text-e-dim">Fonte: {caderno.banca.fonte}</p>
            </header>
            <div className="grid gap-3 sm:grid-cols-3">
              {caderno.banca.stats.map((s) => (
                <div key={s.rotulo} className="rounded-2xl border border-e-line bg-e-card p-4">
                  <p className="text-2xl font-medium text-e-ink">{s.valor}</p>
                  <p className="mt-1 text-xs text-e-dim">{s.rotulo}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 rounded-2xl border border-e-line bg-e-card p-4">
              {caderno.banca.ranking.map(([rot, n], i) => {
                const max = caderno.banca!.ranking[0][1];
                return (
                  <div key={rot} className="grid grid-cols-[minmax(110px,220px)_1fr_28px] items-center gap-3 text-sm">
                    <span className="text-e-ink">{rot}</span>
                    <span className="h-5 overflow-hidden rounded-md bg-e-line">
                      <span className="block h-full origin-left animate-[e-cresce_1.1s_cubic-bezier(.2,.7,.2,1)_backwards] rounded-md motion-reduce:animate-none" style={{ width: `${(n / max) * 100}%`, background: i === 0 ? "var(--e-accent)" : "var(--e-blue)", animationDelay: `${i * 70}ms` }} />
                    </span>
                    <span className="text-right tabular-nums text-e-dim">{n}</span>
                  </div>
                );
              })}
            </div>
            {caderno.banca.notas.map((n) => (
              <BlocoView key={n.titulo} b={{ t: "nota", tom: "atencao", titulo: n.titulo, html: n.html }} />
            ))}
            <p className="text-xs text-e-dim">Seus próprios números do TEC aparecem na aba Banca FCC, separados por matéria e assunto.</p>
          </>
        )}

        {vista === "glossario" && (
          <>
            <h1 className="text-2xl font-medium text-e-ink">Glossário</h1>
            <dl className="divide-y divide-e-line rounded-2xl border border-e-line bg-e-card">
              {caderno.glossario.map(([t, d]) => (
                <div key={t} className="px-4 py-3">
                  <dt className="text-sm font-medium text-e-ink">{t}</dt>
                  <dd className="text-sm text-e-dim">{d}</dd>
                </div>
              ))}
            </dl>
          </>
        )}

        {aula && aula.status === "pronta" && (
          <>
            <header>
              <p className="text-[11px] uppercase tracking-[0.14em] text-e-dim">
                Aula {aula.numero} · Tópico {aula.topico_id} do edital{aula.fonte ? ` · ${aula.fonte}` : ""}
              </p>
              <h1 className="mt-1 text-2xl font-medium text-e-ink">{aula.titulo}</h1>
              <p className="mt-1 text-xs text-e-dim">{TOPICO_POR_ID.get(aula.topico_id)?.sub.join(" · ")}</p>
            </header>
            {aula.resumo && (
              <section className="rounded-2xl border border-e-accent/50 bg-e-accent-soft p-4">
                <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-e-dim"><Sparkle size={11} /> A aula em poucas linhas</p>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-e-ink">
                  {aula.resumo.map((r, i) => <li key={i}>{r}</li>)}
                </ol>
              </section>
            )}
            {aula.secoes?.map((s, i) => (
              <section key={i} className="space-y-3">
                <div>
                  {s.etapa && <p className="text-[11px] uppercase tracking-[0.14em] text-e-accent">{ETAPA_LABEL[s.etapa]}</p>}
                  <h2 className="text-lg font-medium text-e-ink">{s.titulo}</h2>
                </div>
                {s.blocos.map((b, j) => <BlocoView key={j} b={b} />)}
              </section>
            ))}
            <div className="flex flex-wrap items-center gap-3 border-t border-e-line pt-4">
              <MarcarAula aulaId={aula.id} estudada={estudadas.has(aula.id)} />
              {aula.questoes && aula.questoes.length > 0 && (
                <Link href={`/admin/estudos/questoes?materia=${caderno.materia_id}&id=${aula.questoes[0]}`} className="rounded-full border border-e-line px-4 py-2 text-sm text-e-dim hover:text-e-ink">
                  Fazer as {aula.questoes.length} questões desta aula
                </Link>
              )}
            </div>
          </>
        )}
      </article>

      <aside className="space-y-3 lg:sticky lg:top-6 lg:self-start">
        <p className="text-[11px] uppercase tracking-[0.14em] text-e-dim">Caderno de erros · {caderno.titulo}</p>
        {erros.length === 0 ? (
          <p className="rounded-2xl border border-e-line bg-e-card p-4 text-sm text-e-dim">Nenhum erro nesta matéria ainda. Quando você errar uma questão e disser o motivo, ela aparece aqui.</p>
        ) : (
          <ul className="max-h-[75vh] space-y-3 overflow-y-auto">
            {grupos.map((g) => (
              <li key={g.chave} className={`rounded-2xl border p-3 ${g.pendentes === 0 ? "border-e-ok/40 bg-e-card" : "border-e-line bg-e-card"}`}>
                <div className="flex items-start justify-between gap-2">
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-e-ink">{g.nome}</span>
                    {g.nome !== g.tema && <span className="text-[11px] text-e-dim">{g.tema}</span>}
                  </span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] tabular-nums ${g.pendentes === 0 ? "text-e-ok" : "bg-e-bad-soft text-e-bad"}`}>
                    {g.pendentes === 0 ? "Superado" : `${g.vezes} ${g.vezes === 1 ? "erro" : "erros"}`}
                  </span>
                </div>
                {g.itens.map((e) => (
                  <div key={e.questao_id} className="mt-3 border-t border-e-line pt-2.5">
                    <p className="text-[11px] text-e-dim">
                      {e.superado && <span className="text-e-ok">Superado · </span>}
                      {e.ref} · errou {e.vezes} {e.vezes === 1 ? "vez" : "vezes"}
                    </p>
                    <p className="mt-1.5 text-[10px] uppercase tracking-[0.12em] text-e-dim">Motivo</p>
                    <div className="mt-0.5 flex flex-wrap gap-1">
                      {e.motivos.map((m) => (
                        <span key={m} className="rounded-md bg-e-warn-soft px-1.5 py-0.5 text-[11px] text-e-warn">{EH_ERRO.has(m) ? CLASSIFICACAO_LABEL[m] : `Acertou ${CLASSIFICACAO_LABEL[m].toLowerCase()}`}</span>
                      ))}
                    </div>
                    {e.pegadinhas.length > 0 && (
                      <>
                        <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-e-dim">Sua confusão</p>
                        {e.pegadinhas.map((p) => (
                          <p key={p.alternativa} className="mt-0.5 border-l-2 border-e-bad/60 pl-2 text-xs leading-relaxed text-e-ink">
                            Você marcou: “{p.marcada}”{p.vezes > 1 ? ` (${p.vezes} vezes)` : ""}. <span dangerouslySetInnerHTML={{ __html: htmlSeguro(p.texto) }} />
                          </p>
                        ))}
                      </>
                    )}
                    {e.certa && (
                      <>
                        <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-e-dim">O certo</p>
                        <p className="mt-0.5 border-l-2 border-e-ok/60 pl-2 text-xs leading-relaxed text-e-ink">“{e.certa}” ({e.ref})</p>
                      </>
                    )}
                    {e.notas.slice(-1).map((n) => (
                      <p key={n} className="mt-1.5 text-xs italic text-e-dim">Sua nota: “{n.length > 200 ? n.slice(0, 200) + "…" : n}”</p>
                    ))}
                    <Link href={`/admin/estudos/questoes?materia=${caderno.materia_id}&id=${e.questao_id}`} className="mt-1.5 inline-block text-xs text-e-blue hover:underline">Refazer a questão</Link>
                  </div>
                ))}
                {!g.chave.startsWith("tema:") && SUBTEMAS[g.chave] && (
                  <div className="mt-3 rounded-xl bg-e-card-2 p-2.5 text-xs leading-relaxed text-e-ink">
                    <span className="font-medium">Regra para revisar: </span>
                    <span dangerouslySetInnerHTML={{ __html: htmlSeguro(SUBTEMAS[g.chave].revisao) }} />
                  </div>
                )}
                {!g.chave.startsWith("tema:") && (
                  <Link href={`/admin/estudos/questoes?materia=${caderno.materia_id}&subtema=${encodeURIComponent(g.chave)}`} className="mt-2 inline-block text-xs text-e-blue hover:underline">Treinar só este subtema</Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
