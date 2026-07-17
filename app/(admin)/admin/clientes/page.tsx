import { redirect } from "next/navigation";
import { getAllClientes } from "@/lib/db-clientes";
import { getAllContratos } from "@/lib/db-contratos";
import { getAllCasos } from "@/lib/db-casos";
import { ClientesAdminList, type ClienteRow } from "@/components/admin/ClientesAdminList";

export default async function AdminClientesPage() {
  let clientes;
  let contratos;
  let casos;
  try {
    clientes = await getAllClientes();
    contratos = await getAllContratos();
    casos = await getAllCasos();
  } catch {
    redirect("/login");
  }

  const clienteIdByContrato = new Map(
    contratos.map((contrato) => [contrato.id, contrato.cliente_id]),
  );
  const areasByCliente = new Map<string, Set<string>>();
  for (const caso of casos) {
    const clienteId = clienteIdByContrato.get(caso.contrato_id);
    if (!clienteId) continue;
    if (!areasByCliente.has(clienteId)) areasByCliente.set(clienteId, new Set());
    areasByCliente.get(clienteId)!.add(caso.area);
  }

  const rows: ClienteRow[] = clientes.map((cliente) => ({
    ...cliente,
    areas: Array.from(areasByCliente.get(cliente.id) ?? []) as ClienteRow["areas"],
  }));

  return <ClientesAdminList initialClientes={rows} />;
}
