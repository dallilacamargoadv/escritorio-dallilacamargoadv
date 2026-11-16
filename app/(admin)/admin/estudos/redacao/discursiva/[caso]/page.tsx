import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CASO_POR_ID, getEstadoRedacao } from "@/lib/db-estudos-redacao";
import { MATERIA_POR_ID } from "@/lib/estudos-utils";
import { Cabecalho } from "@/components/estudos/ui";
import { DiscursivaClient } from "@/components/estudos/DiscursivaClient";

export default async function DiscursivaPage(props: PageProps<"/admin/estudos/redacao/discursiva/[caso]">) {
  const { caso: id } = await props.params;
  const caso = CASO_POR_ID.get(id);
  if (!caso) notFound();
  let estado;
  try {
    estado = await getEstadoRedacao();
  } catch {
    redirect("/login");
  }
  return (
    <>
      <Link href="/admin/estudos/redacao" className="mb-3 inline-flex items-center gap-1 text-xs text-e-dim hover:text-e-ink">
        <ArrowLeft size={13} aria-hidden="true" /> Redação
      </Link>
      <Cabecalho titulo={`Discursiva: ${caso.titulo}`} sub={`${MATERIA_POR_ID.get(caso.materia_id)?.nome ?? ""} · até ${caso.linhas} linhas`} />
      <DiscursivaClient caso={caso} salvo={estado.casos[id] ?? null} />
    </>
  );
}
