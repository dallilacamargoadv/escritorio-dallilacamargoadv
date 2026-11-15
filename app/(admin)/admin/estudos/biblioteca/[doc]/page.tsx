import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DOC_POR_ID, getEstadoBiblioteca, getPdfsEnviados, resumo } from "@/lib/db-estudos-biblioteca";
import { casa, POR_PAGINA, termos } from "@/lib/estudos-biblioteca";
import { MATERIA_POR_ID } from "@/lib/estudos-utils";
import { Cabecalho } from "@/components/estudos/ui";
import { BibliotecaLeitor } from "@/components/estudos/BibliotecaLeitor";

export default async function DocumentoPage(props: PageProps<"/admin/estudos/biblioteca/[doc]">) {
  const { doc } = await props.params;
  const sp = await props.searchParams;
  const s = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const d = DOC_POR_ID.get(doc);
  if (!d) notFound();
  let estado, enviados;
  try {
    [estado, enviados] = await Promise.all([getEstadoBiblioteca(), getPdfsEnviados()]);
  } catch {
    redirect("/login");
  }

  const q = s("q").slice(0, 120);
  const ts = termos(q);
  const soGrifos = s("grifos") === "1";
  const grifos = estado.grifos[d.id] ?? [];
  const grifoSet = new Set(grifos);

  // "ir para": aceita "37", "art. 37", "p. 12", "12"
  const ir = s("ir").trim();
  const alvoIr = ir ? d.trechos.find((t) => t.ref.replace(/[^\d\-A-Z]/g, "").replace(/^0+/, "") === ir.replace(/[^\d\-A-Z]/gi, "").toUpperCase()) : undefined;
  const ref = s("ref") || alvoIr?.ref || "";

  const filtrados = d.trechos.filter((t) => (!soGrifos || grifoSet.has(t.ref)) && (!ts.length || casa(t.t, ts)));
  const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const idxRef = ref ? filtrados.findIndex((t) => t.ref === ref) : -1;
  const pagina = idxRef >= 0 ? Math.floor(idxRef / POR_PAGINA) + 1 : Math.max(1, Math.min(paginas, Number(s("p")) || 1));
  const trechos = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  return (
    <>
      <Link href="/admin/estudos/biblioteca" className="mb-3 inline-flex items-center gap-1.5 text-xs text-e-dim hover:text-e-ink">
        <ArrowLeft size={13} aria-hidden="true" /> Biblioteca
      </Link>
      <Cabecalho titulo={d.titulo} sub={`${MATERIA_POR_ID.get(d.materia_id)?.nome ?? "Várias matérias"} · ${d.trechos.length} ${d.unidade === "artigo" ? "artigos" : "páginas"}`} />
      <BibliotecaLeitor
        key={`${d.id}|${q}|${soGrifos}|${pagina}|${ref}`}
        doc={resumo(d)}
        trechos={trechos}
        grifos={grifos}
        etiquetas={estado.etiquetas[d.id] ?? []}
        temPdf={enviados.has(d.id)}
        q={q}
        ts={ts}
        soGrifos={soGrifos}
        pagina={pagina}
        paginas={paginas}
        totalFiltrado={filtrados.length}
        alvo={ref}
        irNaoAchou={!!ir && !alvoIr}
      />
    </>
  );
}
