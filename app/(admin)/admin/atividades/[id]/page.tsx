import { notFound, redirect } from "next/navigation";
import { getAtividadeById } from "@/lib/db-atividades";
import { getAllClientes } from "@/lib/db-clientes";
import { getAllCasos } from "@/lib/db-casos";
import { getAllFrentes } from "@/lib/db-frentes";
import { FRENTE_TIPO_LABELS } from "@/lib/admin-labels";
import { AtividadeForm, type LinkOption } from "@/components/admin/AtividadeForm";

export default async function AtividadeDetailPage(
  props: PageProps<"/admin/atividades/[id]">,
) {
  const { id } = await props.params;

  let atividade;
  let clienteOptions: LinkOption[];
  let casoOptions: LinkOption[];
  let frenteOptions: LinkOption[];

  try {
    const [atividadeData, clientes, casos, frentes] = await Promise.all([
      getAtividadeById(id),
      getAllClientes(),
      getAllCasos(),
      getAllFrentes(),
    ]);

    atividade = atividadeData;

    clienteOptions = clientes.map((cliente) => ({
      id: cliente.id,
      label: cliente.nome_razao_social,
    }));

    const casoTituloById = new Map(casos.map((caso) => [caso.id, caso.titulo]));

    casoOptions = casos.map((caso) => ({ id: caso.id, label: caso.titulo }));

    frenteOptions = frentes.map((frente) => ({
      id: frente.id,
      label: `${casoTituloById.get(frente.caso_id) ?? "Caso"} · ${FRENTE_TIPO_LABELS[frente.tipo]}${frente.orgao ? ` (${frente.orgao})` : ""}`,
    }));
  } catch {
    redirect("/login");
  }

  if (!atividade) notFound();

  return (
    <AtividadeForm
      atividade={atividade}
      clienteOptions={clienteOptions}
      casoOptions={casoOptions}
      frenteOptions={frenteOptions}
    />
  );
}
