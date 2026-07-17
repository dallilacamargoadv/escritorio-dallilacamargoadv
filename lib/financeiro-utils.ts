import type { Lancamento } from "@/lib/db-financeiro";

/**
 * Sem dependências de servidor (next/headers) de propósito — importado tanto
 * por Server quanto por Client Components. Manter `isLancamentoAtrasado` fora
 * de `lib/db-financeiro.ts` evita puxar o cliente Supabase de servidor para
 * o bundle do browser.
 */
export function isLancamentoAtrasado(lancamento: Lancamento): boolean {
  return (
    lancamento.status === "pendente" &&
    new Date(lancamento.vencimento).getTime() < Date.now()
  );
}
