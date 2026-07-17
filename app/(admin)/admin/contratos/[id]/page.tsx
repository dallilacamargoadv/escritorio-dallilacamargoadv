import { notFound, redirect } from "next/navigation";
import { getContratoById } from "@/lib/db-contratos";
import { getClienteById } from "@/lib/db-clientes";
import { getAllCasos, type Caso } from "@/lib/db-casos";
import { getAllLancamentos, type Lancamento } from "@/lib/db-financeiro";
import { ContratoForm } from "@/components/admin/ContratoForm";

export default async function ContratoDetailPage(
  props: PageProps<"/admin/contratos/[id]">,
) {
  const { id } = await props.params;

  let contrato;
  let cliente;
  let casos: Caso[] = [];
  let lancamentos: Lancamento[] = [];
  try {
    contrato = await getContratoById(id);
    if (contrato) {
      cliente = await getClienteById(contrato.cliente_id);
      casos = await getAllCasos(contrato.id);
      lancamentos = await getAllLancamentos(undefined, contrato.id);
    }
  } catch {
    redirect("/login");
  }

  if (!contrato) notFound();

  return (
    <ContratoForm
      contrato={contrato}
      clienteFixo={
        cliente
          ? { id: cliente.id, label: cliente.nome_razao_social }
          : undefined
      }
      casos={casos}
      lancamentos={lancamentos}
    />
  );
}
