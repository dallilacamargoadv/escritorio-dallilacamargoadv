import { redirect } from "next/navigation";
import { getAllLancamentosPessoal } from "@/lib/db-financeiro-pessoal";
import { getAllDespesasPessoal } from "@/lib/db-despesas-pessoal";
import { getAllDespesaCategoriasPessoal } from "@/lib/db-despesa-categorias-pessoal";
import { FinanceiroPessoalDashboard } from "@/components/admin/FinanceiroPessoalDashboard";

export default async function FinanceiroPessoalPage() {
  let lancamentos, despesas, categorias;
  try {
    [lancamentos, despesas, categorias] = await Promise.all([
      getAllLancamentosPessoal(),
      getAllDespesasPessoal(),
      getAllDespesaCategoriasPessoal(),
    ]);
  } catch {
    redirect("/login");
  }

  return (
    <FinanceiroPessoalDashboard
      initialLancamentos={lancamentos}
      initialDespesas={despesas}
      initialCategorias={categorias}
    />
  );
}
