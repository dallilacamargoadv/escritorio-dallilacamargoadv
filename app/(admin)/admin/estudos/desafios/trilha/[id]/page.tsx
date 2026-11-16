import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getEstadoTrilhas, TRILHA_POR_ID } from "@/lib/db-estudos-trilhas";
import { abrirItem, chaveDia, diaAtual, DOC_BIBLIOTECA, metodoDoDia, rotuloTrecho } from "@/lib/estudos-trilhas";
import { QUESTOES } from "@/lib/db-estudos";
import { MATERIA_POR_ID } from "@/lib/estudos-utils";
import { todayBelemDateString } from "@/lib/atividades-utils";
import { Cabecalho } from "@/components/estudos/ui";
import { TrilhaClient } from "@/components/estudos/TrilhaClient";

export default async function TrilhaDiaPage(props: PageProps<"/admin/estudos/desafios/trilha/[id]">) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const t = TRILHA_POR_ID.get(id);
  if (!t) notFound();
  let estado;
  try {
    estado = await getEstadoTrilhas();
  } catch {
    redirect("/login");
  }
  const pedido = typeof sp.dia === "string" ? Number(sp.dia) : NaN;
  const d = t.dias.find((x) => x.dia === pedido) ?? diaAtual(t, estado) ?? t.dias[t.dias.length - 1];
  const concluido = estado.concluidos[chaveDia(t.id, d.dia)] ?? null;
  const respondidos: Record<string, boolean> = {};
  for (const i of d.itens) if (i.id in estado.resp) respondidos[i.id] = estado.resp[i.id];
  const temQuestoes = QUESTOES.some((q) => q.materia_id === t.materia_id);
  const proximo = t.dias.find((x) => x.dia === d.dia + 1);

  return (
    <>
      <Link href="/admin/estudos/desafios/trilha" className="mb-3 inline-flex items-center gap-1 text-xs text-e-dim hover:text-e-ink">
        <ArrowLeft size={13} aria-hidden="true" /> Trilhas
      </Link>
      <Cabecalho
        titulo={`${t.nome} · dia ${d.dia} de ${t.dias.length}`}
        sub={`${MATERIA_POR_ID.get(t.materia_id)?.nome ?? ""}. Hoje: ${rotuloTrecho(d)} (${d.artigos} artigos).`}
      />
      <TrilhaClient
        key={`${t.id}-${d.dia}`}
        trilha={t.id}
        dia={d.dia}
        trecho={rotuloTrecho(d)}
        linkLeitura={`/admin/estudos/biblioteca/${DOC_BIBLIOTECA[t.id]}?ir=${encodeURIComponent(d.de.replace(/^ADCT /, ""))}`}
        itens={d.itens.map(abrirItem)}
        respondidos={respondidos}
        concluido={concluido}
        metodo={metodoDoDia(todayBelemDateString())}
        linkQuestoes={temQuestoes ? `/admin/estudos/questoes?materia=${t.materia_id}` : ""}
        linkProximo={proximo ? `/admin/estudos/desafios/trilha/${t.id}?dia=${proximo.dia}` : ""}
      />
    </>
  );
}
