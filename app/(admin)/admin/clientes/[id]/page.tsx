import { notFound, redirect } from "next/navigation";
import { getClienteById } from "@/lib/db-clientes";
import { getAllContratos } from "@/lib/db-contratos";
import { getAllCasos, type Caso } from "@/lib/db-casos";
import { ClienteDetailSections } from "@/components/admin/ClienteDetailSections";

export default async function ClienteDetailPage(
  props: PageProps<"/admin/clientes/[id]">,
) {
  const { id } = await props.params;

  let cliente;
  let contratos;
  try {
    cliente = await getClienteById(id);
    contratos = cliente ? await getAllContratos(cliente.id) : [];
  } catch {
    redirect("/login");
  }

  if (!cliente) notFound();

  const casosArrays = await Promise.all(
    contratos.map((contrato) => getAllCasos(contrato.id)),
  );
  const casos: Caso[] = casosArrays.flat();

  return (
    <ClienteDetailSections cliente={cliente} contratos={contratos} casos={casos} />
  );
}
