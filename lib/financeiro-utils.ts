import type { Lancamento } from "@/lib/db-financeiro";
import type { Despesa } from "@/lib/db-despesas";

/**
 * Sem dependências de servidor (next/headers) de propósito — importado tanto
 * por Server quanto por Client Components. Manter essas funções fora de
 * lib/db-financeiro.ts e lib/db-despesas.ts evita puxar o cliente Supabase de
 * servidor para o bundle do browser.
 */
export function isLancamentoAtrasado(lancamento: Lancamento): boolean {
  return (
    lancamento.status === "pendente" &&
    new Date(lancamento.vencimento).getTime() < Date.now()
  );
}

export function isDespesaVencida(despesa: Despesa): boolean {
  return (
    despesa.status === "a_pagar" &&
    new Date(despesa.vencimento).getTime() < Date.now()
  );
}

export function isDespesaProxima(despesa: Despesa, dias: number): boolean {
  if (despesa.status !== "a_pagar") return false;
  const limite = Date.now() + dias * 24 * 60 * 60 * 1000;
  return new Date(despesa.vencimento).getTime() <= limite;
}
