import type { Lancamento } from "@/lib/db-financeiro";
import type { Despesa } from "@/lib/db-despesas";
import type { Contrato } from "@/lib/db-contratos";

const TZ = "America/Belem";
const MESES_HISTORICO = 3;

export type PeriodoProjecao = "trimestre" | "semestre" | "ano";

export const MESES_POR_PERIODO: Record<PeriodoProjecao, number> = {
  trimestre: 3,
  semestre: 6,
  ano: 12,
};

function belemMonthKey(dateIso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
  }).format(new Date(dateIso));
}

function addMonths(monthKey: string, n: number): string {
  const [ano, mes] = monthKey.split("-").map(Number);
  const data = new Date(Date.UTC(ano, mes - 1 + n, 15));
  return `${data.getUTCFullYear()}-${String(data.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthKeyShortLabel(monthKey: string): string {
  const [ano, mes] = monthKey.split("-").map(Number);
  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "2-digit",
    timeZone: TZ,
  }).format(new Date(Date.UTC(ano, mes - 1, 15)));
  return label.replace(".", "");
}

export interface MesProjetado {
  mesKey: string;
  label: string;
  receitaConfirmada: number;
  receitaEstimada: number;
  despesaConfirmada: number;
  despesaEstimada: number;
}

export interface ProjecaoResultado {
  periodo: PeriodoProjecao;
  meses: MesProjetado[];
  receitaProjetada: number;
  receitaConfirmada: number;
  receitaEstimada: number;
  despesaProjetada: number;
  despesaConfirmada: number;
  despesaEstimada: number;
  resultadoProjetado: number;
  margemProjetada: number | null;
}

export function computeProjecao({
  lancamentos,
  despesas,
  contratos,
  periodo,
}: {
  lancamentos: Lancamento[];
  despesas: Despesa[];
  contratos: Contrato[];
  periodo: PeriodoProjecao;
}): ProjecaoResultado {
  const numMeses = MESES_POR_PERIODO[periodo];
  const mesAtualKey = belemMonthKey(new Date().toISOString());

  const mesesJanela: string[] = [];
  for (let i = 0; i < numMeses; i++) mesesJanela.push(addMonths(mesAtualKey, i));

  const mesesHistorico: string[] = [];
  for (let i = 1; i <= MESES_HISTORICO; i++) mesesHistorico.push(addMonths(mesAtualKey, -i));

  const contratoById = new Map(contratos.map((c) => [c.id, c]));
  const contratosRecorrentesAtivos = contratos.filter(
    (c) => c.tipo === "recorrente" && c.status === "assinado",
  );

  const receitaAvulsaHistorico = lancamentos
    .filter((l) => {
      if (l.status !== "pago" || !l.pago_em) return false;
      if (contratoById.get(l.contrato_id)?.tipo !== "projeto") return false;
      return mesesHistorico.includes(belemMonthKey(l.pago_em));
    })
    .reduce((sum, l) => sum + l.valor, 0);
  const mediaReceitaAvulsa = receitaAvulsaHistorico / MESES_HISTORICO;

  const despesaHistorico = despesas
    .filter((d) => d.status !== "cancelado" && mesesHistorico.includes(belemMonthKey(d.vencimento)))
    .reduce((sum, d) => sum + d.valor, 0);
  const mediaDespesa = despesaHistorico / MESES_HISTORICO;

  const meses: MesProjetado[] = mesesJanela.map((mesKey) => {
    let receitaConfirmada = 0;
    let receitaEstimada = 0;

    for (const contrato of contratosRecorrentesAtivos) {
      const lancamentosDoMes = lancamentos.filter(
        (l) =>
          l.contrato_id === contrato.id &&
          l.status !== "cancelado" &&
          belemMonthKey(l.vencimento) === mesKey,
      );
      if (lancamentosDoMes.length > 0) {
        receitaConfirmada += lancamentosDoMes.reduce((sum, l) => sum + l.valor, 0);
      } else {
        receitaEstimada += contrato.valor ?? 0;
      }
    }

    const avulsoDoMes = lancamentos.filter(
      (l) =>
        l.status !== "cancelado" &&
        contratoById.get(l.contrato_id)?.tipo === "projeto" &&
        belemMonthKey(l.vencimento) === mesKey,
    );
    if (avulsoDoMes.length > 0) {
      receitaConfirmada += avulsoDoMes.reduce((sum, l) => sum + l.valor, 0);
    } else {
      receitaEstimada += mediaReceitaAvulsa;
    }

    const despesasDoMes = despesas.filter(
      (d) => d.status !== "cancelado" && belemMonthKey(d.vencimento) === mesKey,
    );
    const despesaConfirmada =
      despesasDoMes.length > 0 ? despesasDoMes.reduce((sum, d) => sum + d.valor, 0) : 0;
    const despesaEstimada = despesasDoMes.length > 0 ? 0 : mediaDespesa;

    return {
      mesKey,
      label: monthKeyShortLabel(mesKey),
      receitaConfirmada,
      receitaEstimada,
      despesaConfirmada,
      despesaEstimada,
    };
  });

  const receitaConfirmada = meses.reduce((sum, m) => sum + m.receitaConfirmada, 0);
  const receitaEstimada = meses.reduce((sum, m) => sum + m.receitaEstimada, 0);
  const despesaConfirmada = meses.reduce((sum, m) => sum + m.despesaConfirmada, 0);
  const despesaEstimada = meses.reduce((sum, m) => sum + m.despesaEstimada, 0);

  const receitaProjetada = receitaConfirmada + receitaEstimada;
  const despesaProjetada = despesaConfirmada + despesaEstimada;
  const resultadoProjetado = receitaProjetada - despesaProjetada;
  const margemProjetada = receitaProjetada > 0 ? (resultadoProjetado / receitaProjetada) * 100 : null;

  return {
    periodo,
    meses,
    receitaProjetada,
    receitaConfirmada,
    receitaEstimada,
    despesaProjetada,
    despesaConfirmada,
    despesaEstimada,
    resultadoProjetado,
    margemProjetada,
  };
}
