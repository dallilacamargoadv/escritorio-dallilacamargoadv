import { redirect } from "next/navigation";
import { getAllLancamentos } from "@/lib/db-financeiro";
import { getAllClientes } from "@/lib/db-clientes";
import {
  FinanceiroAdminList,
  type LancamentoRow,
} from "@/components/admin/FinanceiroAdminList";

export default async function AdminFinanceiroPage() {
  let lancamentos;
  let clientes;
  try {
    lancamentos = await getAllLancamentos();
    clientes = await getAllClientes();
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

  return <FinanceiroAdminList initialLancamentos={rows} />;
}
