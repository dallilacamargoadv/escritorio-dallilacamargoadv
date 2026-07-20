import type { FrenteEtapa } from "@/lib/db-frente-etapas";

/** Sem dependências de servidor de propósito — usado tanto no client quanto no server. */
export function isEtapaAtrasada(etapa: FrenteEtapa): boolean {
  if (etapa.status === "concluida" || !etapa.sla_dias) return false;
  const limite = new Date(etapa.created_at).getTime() + etapa.sla_dias * 24 * 60 * 60 * 1000;
  return Date.now() > limite;
}

export function tempoExibidoEtapa(etapa: FrenteEtapa): number {
  if (!etapa.timer_iniciado_em) return etapa.tempo_total_segundos;
  const decorrido = Math.floor(
    (Date.now() - new Date(etapa.timer_iniciado_em).getTime()) / 1000,
  );
  return etapa.tempo_total_segundos + decorrido;
}

export function formatSegundos(totalSegundos: number): string {
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  if (horas === 0) return `${minutos}min`;
  return `${horas}h ${minutos}min`;
}
