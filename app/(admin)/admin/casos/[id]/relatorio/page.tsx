import { notFound, redirect } from "next/navigation";
import { getCasoRelatorioData } from "@/lib/db-caso-relatorio";
import { CasoRelatorio } from "@/components/admin/CasoRelatorio";

export default async function CasoRelatorioInternoPage(
  props: PageProps<"/admin/casos/[id]/relatorio">,
) {
  const { id } = await props.params;

  let dados;
  try {
    dados = await getCasoRelatorioData(id);
  } catch {
    redirect("/login");
  }

  if (!dados) notFound();

  return (
    <CasoRelatorio
      caso={dados.caso}
      contrato={dados.contrato}
      cliente={dados.cliente}
      frentes={dados.frentes}
      prazos={dados.prazos}
      lancamentos={dados.lancamentos}
      documentos={dados.documentos}
      variant="interno"
    />
  );
}
