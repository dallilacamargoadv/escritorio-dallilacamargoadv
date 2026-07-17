import { notFound, redirect } from "next/navigation";
import { getLancamentoById } from "@/lib/db-financeiro";
import { getClienteById } from "@/lib/db-clientes";
import { getContratoById } from "@/lib/db-contratos";
import { FinanceiroDetail } from "@/components/admin/FinanceiroDetail";
import { CONTRATO_TIPO_LABELS } from "@/lib/admin-labels";

export default async function FinanceiroDetailPage(
  props: PageProps<"/admin/financeiro/[id]">,
) {
  const { id } = await props.params;

  let lancamento;
  let clienteNome = "—";
  let contratoLabel = "—";
  try {
    lancamento = await getLancamentoById(id);
    if (lancamento) {
      const [cliente, contrato] = await Promise.all([
        getClienteById(lancamento.cliente_id),
        getContratoById(lancamento.contrato_id),
      ]);
      clienteNome = cliente?.nome_razao_social ?? "—";
      contratoLabel = contrato ? CONTRATO_TIPO_LABELS[contrato.tipo] : "—";
    }
  } catch {
    redirect("/login");
  }

  if (!lancamento) notFound();

  return (
    <FinanceiroDetail
      lancamento={lancamento}
      clienteNome={clienteNome}
      contratoLabel={contratoLabel}
    />
  );
}
