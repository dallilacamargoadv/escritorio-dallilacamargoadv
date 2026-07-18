import type { Prazo } from "@/lib/db-prazos";

/**
 * Sem dependências de servidor de propósito — importado tanto por Server
 * quanto por Client Components, mesmo padrão de `financeiro-utils.ts`.
 */
export function isPrazoAtrasado(prazo: Prazo): boolean {
  return prazo.status === "pendente" && new Date(prazo.data).getTime() < Date.now();
}

export function isPrazoProximo(prazo: Prazo, dias: number): boolean {
  if (prazo.status !== "pendente") return false;
  const limite = Date.now() + dias * 24 * 60 * 60 * 1000;
  const data = new Date(prazo.data).getTime();
  return data >= Date.now() && data <= limite;
}
