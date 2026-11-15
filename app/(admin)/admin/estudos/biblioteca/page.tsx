import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, Highlighter, Search } from "lucide-react";
import { BIBLIOTECA, getEstadoBiblioteca, getPdfsEnviados } from "@/lib/db-estudos-biblioteca";
import { QUESTOES } from "@/lib/db-estudos";
import { casa, recorte, termos, TIPO_LABEL, type TipoDoc } from "@/lib/estudos-biblioteca";
import { MATERIA_POR_ID } from "@/lib/estudos-utils";
import { Card, CardTitulo, Cabecalho, CAMPO, BOTAO_PRIMARIO } from "@/components/estudos/ui";
import { Grifado } from "@/components/estudos/BibliotecaLeitor";

const LIMITE = 40;

export default async function BibliotecaPage(props: PageProps<"/admin/estudos/biblioteca">) {
  const sp = await props.searchParams;
  const s = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const q = s("q").slice(0, 120);
  const etiqueta = s("etiqueta");
  let estado, enviados;
  try {
    [estado, enviados] = await Promise.all([getEstadoBiblioteca(), getPdfsEnviados()]);
  } catch {
    redirect("/login");
  }
  const ts = termos(q);

  // Pesquisa global: documentos + questões comentadas (sem mostrar gabarito)
  const achados: { doc: string; titulo: string; ref: string; trecho: string }[] = [];
  let totalAchados = 0;
  if (ts.length) {
    for (const d of BIBLIOTECA) {
      for (const t of d.trechos) {
        if (!casa(t.t, ts)) continue;
        totalAchados++;
        if (achados.length < LIMITE) achados.push({ doc: d.id, titulo: d.titulo, ref: t.ref, trecho: recorte(t.t, ts) });
      }
    }
  }
  const questoes = ts.length ? QUESTOES.filter((x) => casa(`${x.tema} ${x.ref} ${x.enun}`, ts)) : [];

  const todasEtiquetas = [...new Set(Object.values(estado.etiquetas).flat())].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const docs = BIBLIOTECA.filter((d) => !etiqueta || (estado.etiquetas[d.id] ?? []).includes(etiqueta));
  const tipos: TipoDoc[] = ["lei", "apostila", "prova", "material"];
  const totalGrifos = Object.values(estado.grifos).reduce((n, g) => n + g.length, 0);

  return (
    <>
      <Cabecalho
        titulo="Biblioteca"
        sub={`Lei seca, apostilas e provas num lugar só, com busca por texto que mostra o artigo ou a página. ${totalGrifos} trechos grifados.`}
      />

      <form action="/admin/estudos/biblioteca" className="mb-5 flex gap-2">
        <label className="sr-only" htmlFor="q">Pesquisar</label>
        <input id="q" name="q" defaultValue={q} placeholder="Pesquisar em tudo: ex. prescrição quinquenal, art. 37, dívida ativa" className={`${CAMPO} mt-0 flex-1`} />
        <button type="submit" className={BOTAO_PRIMARIO}>
          <Search size={15} aria-hidden="true" /> Buscar
        </button>
      </form>

      {ts.length > 0 ? (
        <div className="flex flex-col gap-4">
          <Card>
            <CardTitulo acao={<Link href="/admin/estudos/biblioteca" className="text-xs text-e-dim hover:text-e-ink">Limpar busca</Link>}>
              {totalAchados} {totalAchados === 1 ? "trecho" : "trechos"} nos documentos
              {totalAchados > LIMITE ? ` (mostrando ${LIMITE}; refine os termos)` : ""}
            </CardTitulo>
            {achados.length === 0 && <p className="text-sm text-e-dim">Nada encontrado. Todas as palavras precisam aparecer no mesmo artigo ou página.</p>}
            <ul className="flex flex-col divide-y divide-e-line">
              {achados.map((a) => (
                <li key={`${a.doc}|${a.ref}`} className="py-2.5">
                  <Link href={`/admin/estudos/biblioteca/${a.doc}?q=${encodeURIComponent(q)}&ref=${encodeURIComponent(a.ref)}`} className="group block">
                    <p className="text-xs text-e-dim">
                      {a.titulo} · <span className="text-e-ink group-hover:underline">{a.ref}</span>
                    </p>
                    <p className="mt-0.5 text-sm text-e-ink/90"><Grifado texto={a.trecho} ts={ts} /></p>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardTitulo>{questoes.length} {questoes.length === 1 ? "questão comentada" : "questões comentadas"}</CardTitulo>
            <ul className="flex flex-col divide-y divide-e-line">
              {questoes.slice(0, 20).map((x) => (
                <li key={x.id} className="py-2.5">
                  <Link href={`/admin/estudos/questoes?id=${x.id}`} className="group block">
                    <p className="text-xs text-e-dim">{MATERIA_POR_ID.get(x.materia_id)?.nome ?? x.mat} · {x.tema} · {x.ref}</p>
                    <p className="mt-0.5 text-sm text-e-ink/90 group-hover:underline"><Grifado texto={recorte(x.enun, ts, 180)} ts={ts} /></p>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {todasEtiquetas.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-e-dim">Etiquetas:</span>
              {todasEtiquetas.map((e) => (
                <Link
                  key={e}
                  href={etiqueta === e ? "/admin/estudos/biblioteca" : `/admin/estudos/biblioteca?etiqueta=${encodeURIComponent(e)}`}
                  className={`rounded-full border px-2.5 py-1 ${etiqueta === e ? "border-e-accent bg-e-accent-soft text-e-ink" : "border-e-line text-e-dim hover:text-e-ink"}`}
                >
                  {e}
                </Link>
              ))}
            </div>
          )}
          {tipos.map((tipo) => {
            const lista = docs.filter((d) => d.tipo === tipo);
            if (!lista.length) return null;
            return (
              <Card key={tipo}>
                <CardTitulo>{TIPO_LABEL[tipo]}</CardTitulo>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {lista.map((d) => {
                    const g = estado.grifos[d.id]?.length ?? 0;
                    return (
                      <li key={d.id}>
                        <Link href={`/admin/estudos/biblioteca/${d.id}`} className="block h-full rounded-xl border border-e-line bg-e-card-2 p-3 transition-colors duration-150 hover:border-e-accent/60">
                          <p className="text-sm text-e-ink">{d.titulo}</p>
                          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-e-dim">
                            <span>{MATERIA_POR_ID.get(d.materia_id)?.nome ?? "Várias matérias"}</span>
                            <span>{d.trechos.length ? `${d.trechos.length} ${d.unidade === "artigo" ? "artigos" : "páginas"}` : "sem texto pesquisável"}</span>
                            {g > 0 && <span className="inline-flex items-center gap-1 text-e-warn"><Highlighter size={11} aria-hidden="true" />{g}</span>}
                            {d.pdf && enviados.has(d.id) && <span className="inline-flex items-center gap-1"><FileText size={11} aria-hidden="true" />PDF</span>}
                          </p>
                          {(estado.etiquetas[d.id] ?? []).length > 0 && (
                            <p className="mt-1.5 flex flex-wrap gap-1">
                              {estado.etiquetas[d.id].map((e) => (
                                <span key={e} className="rounded-full bg-e-accent-soft px-2 py-0.5 text-[10px] text-e-ink">{e}</span>
                              ))}
                            </p>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            );
          })}
          <Card>
            <CardTitulo>Jurisprudência</CardTitulo>
            <p className="text-sm text-e-dim">
              Ainda vazia. Súmulas e teses entram só com fonte e data conferidas, quando você subir os informativos de cada matéria (pasta “04 Informativos e sumulas”).
            </p>
          </Card>
        </div>
      )}
    </>
  );
}
