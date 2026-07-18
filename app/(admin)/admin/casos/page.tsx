import { redirect } from "next/navigation";
import { getAllCasos } from "@/lib/db-casos";
import { getAllContratos } from "@/lib/db-contratos";
import { getAllClientes } from "@/lib/db-clientes";
import { CasosAdminList, type CasoRow } from "@/components/admin/CasosAdminList";

export default async function AdminCasosPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string }>;
}) {
  const { area } = await searchParams;

  let casos;
  let contratos;
  let clientes;
  try {
    casos = await getAllCasos();
    contratos = await getAllContratos();
    clientes = await getAllClientes();
  } catch {
    redirect("/login");
  }

  const clienteNomeById = new Map(
    clientes.map((cliente) => [cliente.id, cliente.nome_razao_social]),
  );
  const clienteIdByContrato = new Map(
    contratos.map((contrato) => [contrato.id, contrato.cliente_id]),
  );

  const rows: CasoRow[] = casos.map((caso) => {
    const clienteId = clienteIdByContrato.get(caso.contrato_id);
    return {
      ...caso,
      clienteNome: (clienteId && clienteNomeById.get(clienteId)) ?? "—",
    };
  });

  return (
    <CasosAdminList key={area ?? "all"} initialCasos={rows} initialArea={area ?? "all"} />
  );
}
