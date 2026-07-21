import type { LancamentoPessoal } from "@/lib/db-financeiro-pessoal";
import type { DespesaPessoal } from "@/lib/db-despesas-pessoal";

export function isLancamentoPessoalAtrasado(lancamento: LancamentoPessoal): boolean {
  return (
    lancamento.status === "pendente" &&
    new Date(lancamento.vencimento).getTime() < Date.now()
  );
}

export function isDespesaPessoalVencida(despesa: DespesaPessoal): boolean {
  return (
    despesa.status === "a_pagar" &&
    new Date(despesa.vencimento).getTime() < Date.now()
  );
}

export function isDespesaPessoalProxima(despesa: DespesaPessoal, dias: number): boolean {
  if (despesa.status !== "a_pagar") return false;
  const limite = Date.now() + dias * 24 * 60 * 60 * 1000;
  return new Date(despesa.vencimento).getTime() <= limite;
}
