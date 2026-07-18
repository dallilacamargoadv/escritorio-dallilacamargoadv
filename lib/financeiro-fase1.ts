import type { Lancamento } from "@/lib/db-financeiro";
import type { Despesa } from "@/lib/db-despesas";
import { isLancamentoAtrasado, isDespesaVencida } from "@/lib/financeiro-utils";

const TZ = "America/Belem";
const DAY_MS = 24 * 60 * 60 * 1000;

function belemMonthKey(dateIso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
  }).format(new Date(dateIso));
}

function previousMonthKey(monthKey: string): string {
  const [ano, mes] = monthKey.split("-").map(Number);
  const data = new Date(Date.UTC(ano, mes - 2, 15));
  return `${data.getUTCFullYear()}-${String(data.getUTCMonth() + 1).padStart(2, "0")}`;
}

export interface FinanceiroCards {
  receitaMes: number;
  receitaMesAnterior: number;
  despesasMes: number;
  despesasMesAnterior: number;
  resultadoLiquido: number;
  margemLiquida: number | null;
  percentualDespesas: number | null;
  emAbertoValor: number;
  emAbertoCount: number;
  proximoVencimento: string | null;
  inadimplenciaValor: number;
  inadimplenciaCount: number;
  inadimplenciaPercentual: number | null;
  projecaoMes: number;
}

export function computeFinanceiroCards({
  lancamentos,
  despesas,
}: {
  lancamentos: Lancamento[];
  despesas: Despesa[];
}): FinanceiroCards {
  const mesAtual = belemMonthKey(new Date().toISOString());
  const mesAnterior = previousMonthKey(mesAtual);

  const receitaMes = lancamentos
    .filter((l) => l.status === "pago" && l.pago_em && belemMonthKey(l.pago_em) === mesAtual)
    .reduce((sum, l) => sum + l.valor, 0);
  const receitaMesAnterior = lancamentos
    .filter((l) => l.status === "pago" && l.pago_em && belemMonthKey(l.pago_em) === mesAnterior)
    .reduce((sum, l) => sum + l.valor, 0);

  const despesasMes = despesas
    .filter((d) => d.status !== "cancelado" && belemMonthKey(d.vencimento) === mesAtual)
    .reduce((sum, d) => sum + d.valor, 0);
  const despesasMesAnterior = despesas
    .filter((d) => d.status !== "cancelado" && belemMonthKey(d.vencimento) === mesAnterior)
    .reduce((sum, d) => sum + d.valor, 0);

  const resultadoLiquido = receitaMes - despesasMes;
  const margemLiquida = receitaMes > 0 ? (resultadoLiquido / receitaMes) * 100 : null;
  const percentualDespesas = receitaMes > 0 ? (despesasMes / receitaMes) * 100 : null;

  const emAberto = lancamentos.filter((l) => l.status === "pendente");
  const emAbertoValor = emAberto.reduce((sum, l) => sum + l.valor, 0);
  const proximoVencimento =
    emAberto.length > 0
      ? emAberto
          .slice()
          .sort((a, b) => new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime())[0]
          .vencimento
      : null;

  const inadimplentes = lancamentos.filter(isLancamentoAtrasado);
  const inadimplenciaValor = inadimplentes.reduce((sum, l) => sum + l.valor, 0);
  const faturadoEmitido = lancamentos
    .filter((l) => l.status !== "cancelado")
    .reduce((sum, l) => sum + l.valor, 0);
  const inadimplenciaPercentual =
    faturadoEmitido > 0 ? (inadimplenciaValor / faturadoEmitido) * 100 : null;

  const projecaoMes = receitaMes + emAbertoValor;

  return {
    receitaMes,
    receitaMesAnterior,
    despesasMes,
    despesasMesAnterior,
    resultadoLiquido,
    margemLiquida,
    percentualDespesas,
    emAbertoValor,
    emAbertoCount: emAberto.length,
    proximoVencimento,
    inadimplenciaValor,
    inadimplenciaCount: inadimplentes.length,
    inadimplenciaPercentual,
    projecaoMes,
  };
}

export interface FinanceiroAlertas {
  faturasVencidas: number;
  despesasVencidas: number;
  receitasProx7Dias: number;
  despesasProx7Dias: number;
}

export function computeFinanceiroAlertas({
  lancamentos,
  despesas,
}: {
  lancamentos: Lancamento[];
  despesas: Despesa[];
}): FinanceiroAlertas {
  const now = Date.now();
  const em7Dias = now + 7 * DAY_MS;

  const receitasProx7Dias = lancamentos.filter((l) => {
    if (l.status !== "pendente") return false;
    const t = new Date(l.vencimento).getTime();
    return t >= now && t <= em7Dias;
  }).length;

  const despesasProx7Dias = despesas.filter((d) => {
    if (d.status !== "a_pagar") return false;
    const t = new Date(d.vencimento).getTime();
    return t >= now && t <= em7Dias;
  }).length;

  return {
    faturasVencidas: lancamentos.filter(isLancamentoAtrasado).length,
    despesasVencidas: despesas.filter(isDespesaVencida).length,
    receitasProx7Dias,
    despesasProx7Dias,
  };
}

export function percentDelta(atual: number, anterior: number): number | null {
  if (anterior === 0) return atual > 0 ? null : 0;
  return ((atual - anterior) / anterior) * 100;
}
