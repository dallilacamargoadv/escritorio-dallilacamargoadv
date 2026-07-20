import type { LeadStatus } from "@/lib/db-admin";

const DIA_MS = 24 * 60 * 60 * 1000;

/** Estágios da escada automática de follow-up, na ordem. */
export const CADENCIA_STATUSES: LeadStatus[] = [
  "f1_01_dia",
  "f2_02_dias",
  "f3_03_dias",
  "f4_05_dias",
  "f5_07_dias",
  "f6_10_dias",
  "f7_12_dias",
  "f8_15_dias",
];

/** Status "congelados": avanço manual da cliente, o motor de cadência nunca mexe. */
export const STATUS_CONGELADOS: LeadStatus[] = [
  "leads",
  "proposta_enviada",
  "link_enviado",
  "grupo_criado",
  "reuniao_agendada",
  "salesfarming",
  "perdido",
  "cliente",
];

// Do degrau mais alto pro mais baixo — o primeiro que bater o mínimo de dias vence.
const DEGRAUS: [dias: number, status: LeadStatus][] = [
  [15, "f8_15_dias"],
  [12, "f7_12_dias"],
  [10, "f6_10_dias"],
  [7, "f5_07_dias"],
  [5, "f4_05_dias"],
  [3, "f3_03_dias"],
  [2, "f2_02_dias"],
  [1, "f1_01_dia"],
];

/**
 * Sem dependências de servidor de propósito — mesmo padrão de
 * financeiro-utils.ts / atividades-utils.ts.
 */
export function computeCadenciaStatus(diasDesdeContato: number): LeadStatus | null {
  for (const [dias, status] of DEGRAUS) {
    if (diasDesdeContato >= dias) return status;
  }
  return null;
}

export function isElegivelParaCadencia(status: LeadStatus): boolean {
  return !STATUS_CONGELADOS.includes(status);
}

export function diasDesde(dataIso: string, agora: number = Date.now()): number {
  return Math.floor((agora - new Date(dataIso).getTime()) / DIA_MS);
}
