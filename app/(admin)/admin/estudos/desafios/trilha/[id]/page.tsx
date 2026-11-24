import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getEstadoTrilhas, TEMA_POR_ID } from "@/lib/db-estudos-trilhas";
import { abrirItem, metodoDoDia, rotuloTema, rotuloTrecho } from "@/lib/estudos-trilhas";
import { QUESTOES } from "@/lib/db-estudos";
import { MATERIA_POR_ID } from "@/lib/estudos-utils";
import { todayBelemDateString } from "@/lib/atividades-utils";
import { Cabecalho } from "@/components/estudos/ui";
import { TrilhaClient } from "@/components/estudos/TrilhaClient";

export default async function TrilhaTemaPage(props: PageProps<"/admin/estudos/desafios/trilha/[id]">) {
  const { id } = await props.params;
  const achado = TEMA_POR_ID.get(id);
  if (!achado) notFound();
  const { trilha: t, tema: x } = achado;
  let estado;
  try {
    estado = await getEstadoTrilhas();
  } catch {
    redirect("/login");
  }
  const concluido = estado.concluidos[x.id] ?? null;
  const respondidos: Record<string, boolean> = {};
  for (const i of x.itens) if (i.id in estado.resp) respondidos[i.id] = estado.resp[i.id];
  const temQuestoes = QUESTOES.some((q) => q.materia_id === t.materia_id && q.tema === x.tema_questoes);
  const proximo = t.temas.find((y) => y.ordem === x.ordem + 1);

  return (
    <>
      <Link href="/admin/estudos/desafios/trilha" className="mb-3 inline-flex items-center gap-1 text-xs text-e-dim hover:text-e-ink">
        <ArrowLeft size={13} aria-hidden="true" /> Lei seca por tema
      </Link>
      <Cabecalho
        titulo={`${MATERIA_POR_ID.get(t.materia_id)?.nome ?? ""} · tema ${x.ordem}: ${x.nome}`}
        sub={`Só a lei deste tema: ${rotuloTema(x)} (${x.itens.length} dispositivos).`}
      />
      <TrilhaClient
        key={x.id}
        tema={x.id}
        leituras={x.trechos.map((tr) => ({ rotulo: rotuloTrecho(tr), href: `/admin/estudos/biblioteca/${tr.doc}?ir=${encodeURIComponent(tr.de)}` }))}
        fcc={x.fcc}
        procuradoria={x.procuradoria}
        itens={x.itens.map(abrirItem)}
        respondidos={respondidos}
        concluido={concluido}
        metodo={metodoDoDia(todayBelemDateString())}
        linkQuestoes={temQuestoes ? `/admin/estudos/questoes?materia=${t.materia_id}&tema=${encodeURIComponent(x.tema_questoes)}` : `/admin/estudos/questoes?materia=${t.materia_id}`}
        linkProximo={proximo ? `/admin/estudos/desafios/trilha/${proximo.id}` : ""}
      />
    </>
  );
}
