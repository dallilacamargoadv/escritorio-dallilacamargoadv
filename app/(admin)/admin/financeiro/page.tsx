import { redirect } from "next/navigation";
import { getAllLancamentos, type LancamentoRow } from "@/lib/db-financeiro";
import { getAllDespesas } from "@/lib/db-despesas";
import { getAllClientes } from "@/lib/db-clientes";
import { FinanceiroDashboard } from "@/components/admin/FinanceiroDashboard";

export default async function AdminFinanceiroPage() {
  let lancamentos;
  let despesas;
  let clientes;
  try {
    [lancamentos, despesas, clientes] = await Promise.all([
      getAllLancamentos(),
      getAllDespesas(),
      getAllClientes(),
    ]);
  } catch {
    redirect("/login");
  }

  const clienteNomeById = new Map(
    clientes.map((cliente) => [cliente.id, cliente.nome_razao_social]),
  );

  const rows: LancamentoRow[] = lancamentos.map((lancamento) => ({
    ...lancamento,
    clienteNome: clienteNomeById.get(lancamento.cliente_id) ?? "—",
  }));

  return <FinanceiroDashboard initialLancamentos={rows} initialDespesas={despesas} />;
}
