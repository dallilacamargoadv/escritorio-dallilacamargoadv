import { notFound, redirect } from "next/navigation";
import { getPrazoById } from "@/lib/db-prazos";
import { getAllClientes } from "@/lib/db-clientes";
import { getAllCasos } from "@/lib/db-casos";
import { getAllFrentes } from "@/lib/db-frentes";
import { FRENTE_TIPO_LABELS } from "@/lib/admin-labels";
import { PrazoForm, type LinkOption } from "@/components/admin/PrazoForm";

export default async function PrazoDetailPage(
  props: PageProps<"/admin/prazos/[id]">,
) {
  const { id } = await props.params;

  let prazo;
  let clienteOptions: LinkOption[];
  let casoOptions: LinkOption[];
  let frenteOptions: LinkOption[];

  try {
    const [prazoData, clientes, casos, frentes] = await Promise.all([
      getPrazoById(id),
      getAllClientes(),
      getAllCasos(),
      getAllFrentes(),
    ]);

    prazo = prazoData;

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

  if (!prazo) notFound();

  return (
    <PrazoForm
      prazo={prazo}
      clienteOptions={clienteOptions}
      casoOptions={casoOptions}
      frenteOptions={frenteOptions}
    />
  );
}
