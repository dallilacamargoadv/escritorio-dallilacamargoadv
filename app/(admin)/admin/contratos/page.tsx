import { redirect } from "next/navigation";
import { getAllContratos } from "@/lib/db-contratos";
import { getAllClientes } from "@/lib/db-clientes";
import { getAllCasos } from "@/lib/db-casos";
import {
  ContratosAdminList,
  type ContratoRow,
} from "@/components/admin/ContratosAdminList";

export default async function AdminContratosPage() {
  let contratos;
  let clientes;
  let casos;
  try {
    contratos = await getAllContratos();
    clientes = await getAllClientes();
    casos = await getAllCasos();
  } catch {
    redirect("/login");
  }

  const clienteNomeById = new Map(
    clientes.map((cliente) => [cliente.id, cliente.nome_razao_social]),
  );
  const casosCountByContrato = new Map<string, number>();
  for (const caso of casos) {
    casosCountByContrato.set(
      caso.contrato_id,
      (casosCountByContrato.get(caso.contrato_id) ?? 0) + 1,
    );
  }

  const rows: ContratoRow[] = contratos.map((contrato) => ({
    ...contrato,
    clienteNome: clienteNomeById.get(contrato.cliente_id) ?? "—",
    casosCount: casosCountByContrato.get(contrato.id) ?? 0,
  }));

  return <ContratosAdminList initialContratos={rows} />;
}
