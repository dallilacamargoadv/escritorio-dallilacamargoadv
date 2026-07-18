import type { Lancamento } from "@/lib/db-financeiro";

const TZ = "America/Belem";

export const METAS_TIERS = [20000, 30000, 40000, 60000, 80000];

export interface TierProgress {
  valor: number;
  tierIndex: number | null; // último tier atingido (índice em METAS_TIERS), null se nenhum
  proximoTier: number | null; // valor do próximo tier, null se já passou do último
  progressoPercent: number; // 0-100, para a barra até o próximo tier (ou 100 se estourou o último)
  faltaProximoTier: number | null;
}

export interface MesHistorico {
  mesKey: string; // "2026-07"
  label: string; // "Julho/2026"
  valor: number;
  tierIndex: number | null;
}

function belemMonthKey(dateIso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
  }).format(new Date(dateIso));
}

export function currentBelemMonthKey(): string {
  return belemMonthKey(new Date().toISOString());
}

export function monthKeyLabel(mesKey: string): string {
  const [ano, mes] = mesKey.split("-").map(Number);
  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: TZ,
  }).format(new Date(Date.UTC(ano, mes - 1, 15)));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function computeRevenueByMonth(
  lancamentos: Lancamento[],
): Map<string, number> {
  const porMes = new Map<string, number>();
  for (const l of lancamentos) {
    if (l.status !== "pago" || !l.pago_em) continue;
    const mesKey = belemMonthKey(l.pago_em);
    porMes.set(mesKey, (porMes.get(mesKey) ?? 0) + l.valor);
  }
  return porMes;
}

export function computeTierProgress(valor: number): TierProgress {
  let tierIndex: number | null = null;
  for (let i = 0; i < METAS_TIERS.length; i++) {
    if (valor >= METAS_TIERS[i]) tierIndex = i;
  }

  const proximoTierValor =
    tierIndex === null ? METAS_TIERS[0] : (METAS_TIERS[tierIndex + 1] ?? null);

  if (proximoTierValor === null) {
    return {
      valor,
      tierIndex,
      proximoTier: null,
      progressoPercent: 100,
      faltaProximoTier: null,
    };
  }

  const baseAnterior = tierIndex === null ? 0 : METAS_TIERS[tierIndex];
  const progressoPercent =
    ((valor - baseAnterior) / (proximoTierValor - baseAnterior)) * 100;

  return {
    valor,
    tierIndex,
    proximoTier: proximoTierValor,
    progressoPercent: Math.max(0, Math.min(100, progressoPercent)),
    faltaProximoTier: proximoTierValor - valor,
  };
}

export function computeMonthlyHistory(
  lancamentos: Lancamento[],
  mesesParaTras: number,
): MesHistorico[] {
  const porMes = computeRevenueByMonth(lancamentos);
  const atual = currentBelemMonthKey();
  const [anoAtual, mesAtual] = atual.split("-").map(Number);

  const meses: MesHistorico[] = [];
  for (let i = 0; i < mesesParaTras; i++) {
    const data = new Date(Date.UTC(anoAtual, mesAtual - 1 - i, 15));
    const mesKey = `${data.getUTCFullYear()}-${String(data.getUTCMonth() + 1).padStart(2, "0")}`;
    const valor = porMes.get(mesKey) ?? 0;
    meses.push({
      mesKey,
      label: monthKeyLabel(mesKey),
      valor,
      tierIndex: computeTierProgress(valor).tierIndex,
    });
  }

  return meses;
}
