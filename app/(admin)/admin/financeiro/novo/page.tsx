import { redirect } from "next/navigation";
import { getContratoById, getAllContratos } from "@/lib/db-contratos";
import { getClienteById, getAllClientes } from "@/lib/db-clientes";
import {
  FinanceiroForm,
  type ContratoOption,
} from "@/components/admin/FinanceiroForm";
import { CONTRATO_TIPO_LABELS } from "@/lib/admin-labels";

export default async function NewFinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ contratoId?: string }>;
}) {
  const { contratoId } = await searchParams;

  let contratoFixo: ContratoOption | undefined;
  let contratoOptions: ContratoOption[] | undefined;

  try {
    if (contratoId) {
      const contrato = await getContratoById(contratoId);
      if (contrato) {
        const cliente = await getClienteById(contrato.cliente_id);
        contratoFixo = {
          id: contrato.id,
          clienteId: contrato.cliente_id,
          label: `${cliente?.nome_razao_social ?? "Cliente"} — ${CONTRATO_TIPO_LABELS[contrato.tipo]}`,
        };
      }
    } else {
      const [contratos, clientes] = await Promise.all([
        getAllContratos(),
        getAllClientes(),
      ]);
      const clienteNomeById = new Map(
        clientes.map((cliente) => [cliente.id, cliente.nome_razao_social]),
      );
      contratoOptions = contratos
        .filter((contrato) => contrato.status === "assinado")
        .map((contrato) => ({
          id: contrato.id,
          clienteId: contrato.cliente_id,
          label: `${clienteNomeById.get(contrato.cliente_id) ?? "Cliente"} — ${CONTRATO_TIPO_LABELS[contrato.tipo]}`,
        }));
    }
  } catch {
    redirect("/login");
  }

  return (
    <FinanceiroForm contratoFixo={contratoFixo} contratoOptions={contratoOptions} />
  );
}
