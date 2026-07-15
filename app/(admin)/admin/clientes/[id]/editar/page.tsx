import { notFound, redirect } from "next/navigation";
import { getClienteById } from "@/lib/db-clientes";
import { ClienteForm } from "@/components/admin/ClienteForm";

export default async function EditClientePage(
  props: PageProps<"/admin/clientes/[id]/editar">,
) {
  const { id } = await props.params;

  let cliente;
  try {
    cliente = await getClienteById(id);
  } catch {
    redirect("/login");
  }

  if (!cliente) notFound();

  return <ClienteForm cliente={cliente} />;
}
