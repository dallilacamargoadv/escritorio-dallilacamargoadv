import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getEstadoRedacao, TEMA_POR_ID } from "@/lib/db-estudos-redacao";
import { Cabecalho } from "@/components/estudos/ui";
import { RedacaoClient } from "@/components/estudos/RedacaoClient";

export default async function TemaPage(props: PageProps<"/admin/estudos/redacao/[tema]">) {
  const { tema: id } = await props.params;
  const tema = id === "livre" ? null : TEMA_POR_ID.get(id);
  if (id !== "livre" && !tema) notFound();
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
      <Cabecalho titulo={tema ? tema.tema : "Recortador de tema"} sub={tema ? `${tema.eixo} · ${tema.assunto}` : "Cole o tema, recorte e escreva."} />
      <RedacaoClient id={id} tema={tema ?? null} salvo={estado.temas[id] ?? null} />
    </>
  );
}
