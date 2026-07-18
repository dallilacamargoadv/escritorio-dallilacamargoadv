import { redirect } from "next/navigation";
import { getAllClientes } from "@/lib/db-clientes";
import { getAllCasos } from "@/lib/db-casos";
import { getAllFrentes } from "@/lib/db-frentes";
import { FRENTE_TIPO_LABELS } from "@/lib/admin-labels";
import { PrazoForm, type LinkOption } from "@/components/admin/PrazoForm";

export default async function NewPrazoPage() {
  let clienteOptions: LinkOption[];
  let casoOptions: LinkOption[];
  let frenteOptions: LinkOption[];

  try {
    const [clientes, casos, frentes] = await Promise.all([
      getAllClientes(),
      getAllCasos(),
      getAllFrentes(),
    ]);

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

  return (
    <PrazoForm
      clienteOptions={clienteOptions}
      casoOptions={casoOptions}
      frenteOptions={frenteOptions}
    />
  );
}
