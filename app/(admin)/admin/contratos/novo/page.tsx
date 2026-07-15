import { redirect } from "next/navigation";
import { getClienteById, getAllClientes } from "@/lib/db-clientes";
import {
  ContratoForm,
  type ClienteOption,
} from "@/components/admin/ContratoForm";

export default async function NewContratoPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string }>;
}) {
  const { clienteId } = await searchParams;

  let clienteFixo: ClienteOption | undefined;
  let clienteOptions: ClienteOption[] | undefined;

  try {
    if (clienteId) {
      const cliente = await getClienteById(clienteId);
      clienteFixo = cliente
        ? { id: cliente.id, label: cliente.nome_razao_social }
        : undefined;
    } else {
      const clientes = await getAllClientes();
      clienteOptions = clientes.map((cliente) => ({
        id: cliente.id,
        label: cliente.nome_razao_social,
      }));
    }
  } catch {
    redirect("/login");
  }

  return (
    <ContratoForm clienteFixo={clienteFixo} clienteOptions={clienteOptions} />
  );
}
