import type { Atividade, AtividadeTipo } from "@/lib/db-atividades";

/** Tipos que compõem a tela de Agenda (separada de Atividades). */
export const AGENDA_TIPOS: AtividadeTipo[] = [
  "audiencia",
  "reuniao_cliente",
  "peca_prazo",
];

export function isAgendaAtividade(atividade: Atividade): boolean {
  return AGENDA_TIPOS.includes(atividade.tipo);
}

/** Audiência tem cor de alerta própria, sempre, em qualquer lista/coluna —
 * é o único tipo que "não pode passar batido" a esse ponto (pedido explícito). */
export function isAudiencia(atividade: Atividade): boolean {
  return atividade.tipo === "audiencia";
}

/**
 * Sem dependências de servidor de propósito — importado tanto por Server
 * quanto por Client Components, mesmo padrão de `financeiro-utils.ts`.
 */
export function isAtividadeAtrasada(atividade: Atividade): boolean {
  return (
    atividade.status === "pendente" && new Date(atividade.data).getTime() < Date.now()
  );
}

export function isAtividadeProxima(atividade: Atividade, dias: number): boolean {
  if (atividade.status !== "pendente") return false;
  const limite = Date.now() + dias * 24 * 60 * 60 * 1000;
  const data = new Date(atividade.data).getTime();
  return data >= Date.now() && data <= limite;
}

const TZ = "America/Belem";

export function todayBelemDateString(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function addDaysToDateString(dateStr: string, dias: number): string {
  const [ano, mes, dia] = dateStr.split("-").map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia + dias));
  return `${data.getUTCFullYear()}-${String(data.getUTCMonth() + 1).padStart(2, "0")}-${String(
    data.getUTCDate(),
  ).padStart(2, "0")}`;
}

export type AtividadeColuna = "atrasadas" | "hoje" | "vencendo" | "proximos" | "concluidas";

export function colunaDaAtividade(
  atividade: Atividade,
  hoje: string,
  limite7: string,
): AtividadeColuna | null {
  if (atividade.status === "cancelado") return null;
  if (atividade.status === "concluido") return "concluidas";
  if (atividade.data < hoje) return "atrasadas";
  if (atividade.data === hoje) return "hoje";
  if (atividade.data <= limite7) return "vencendo";
  return "proximos";
}
