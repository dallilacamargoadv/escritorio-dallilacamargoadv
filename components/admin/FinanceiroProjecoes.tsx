"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Lancamento } from "@/lib/db-financeiro";
import type { Despesa } from "@/lib/db-despesas";
import type { Contrato } from "@/lib/db-contratos";
import {
  computeProjecao,
  MESES_POR_PERIODO,
  type PeriodoProjecao,
} from "@/lib/financeiro-projecoes";

const TOOLTIP_STYLE = {
  background: "var(--surface)",
  border: "1px solid var(--hairline-strong)",
  fontSize: 12,
  color: "var(--ink)",
};

const PERIODO_LABELS: Record<PeriodoProjecao, string> = {
  trimestre: "Trimestre",
  semestre: "Semestre",
  ano: "Ano",
};

function formatBRL(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function FinanceiroProjecoes({
  lancamentos,
  despesas,
  contratos,
}: {
  lancamentos: Lancamento[];
  despesas: Despesa[];
  contratos: Contrato[];
}) {
  const [periodo, setPeriodo] = useState<PeriodoProjecao>("trimestre");

  const projecao = useMemo(
    () => computeProjecao({ lancamentos, despesas, contratos, periodo }),
    [lancamentos, despesas, contratos, periodo],
  );

  const chartData = projecao.meses.map((m) => ({
    label: m.label,
    "Receita confirmada": Math.round(m.receitaConfirmada),
    "Receita estimada": Math.round(m.receitaEstimada),
    "Despesa confirmada": Math.round(m.despesaConfirmada),
    "Despesa estimada": Math.round(m.despesaEstimada),
  }));

  const primeiroMes = projecao.meses[0]?.label;
  const ultimoMes = projecao.meses[projecao.meses.length - 1]?.label;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex border border-hairline-strong">
          {(Object.keys(MESES_POR_PERIODO) as PeriodoProjecao[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setPeriodo(key)}
              className={`px-4 py-2 text-xs transition-colors duration-150 ${
                periodo === key
                  ? "bg-gold text-bg"
                  : "border-l border-hairline-strong text-ink-dim first:border-l-0 hover:text-ink"
              }`}
            >
              {PERIODO_LABELS[key]}
            </button>
          ))}
        </div>
        {primeiroMes && ultimoMes && (
          <p className="font-mono text-[11px] text-ink-dim">
            {primeiroMes} – {ultimoMes}
          </p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="border border-hairline p-5">
          <p className="font-mono text-xl text-ink tabular-nums">
            {formatBRL(projecao.receitaProjetada)}
          </p>
          <p className="mt-1.5 font-eyebrow text-[10px] text-ink-dim">Receita projetada</p>
          <p className="mt-1 text-xs text-ink-dim">
            {formatBRL(projecao.receitaConfirmada)} confirmado + {formatBRL(projecao.receitaEstimada)} estimado
          </p>
        </div>
        <div className="border border-hairline p-5">
          <p className="font-mono text-xl text-ink tabular-nums">
            {formatBRL(projecao.despesaProjetada)}
          </p>
          <p className="mt-1.5 font-eyebrow text-[10px] text-ink-dim">Despesa projetada</p>
          <p className="mt-1 text-xs text-ink-dim">
            {formatBRL(projecao.despesaConfirmada)} confirmado + {formatBRL(projecao.despesaEstimada)} estimado
          </p>
        </div>
        <div className="border border-gold p-5">
          <p
            className={`font-mono text-xl tabular-nums ${projecao.resultadoProjetado >= 0 ? "text-success" : "text-error"}`}
          >
            {formatBRL(projecao.resultadoProjetado)}
          </p>
          <p className="mt-1.5 font-eyebrow text-[10px] text-ink-dim">Resultado projetado</p>
          <p className="mt-1 text-xs text-ink-dim">
            {projecao.margemProjetada !== null
              ? `${projecao.margemProjetada.toFixed(1)}% de margem`
              : "sem receita projetada"}
          </p>
        </div>
      </div>

      <div className="mt-4 h-64 border border-hairline p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline)" />
            <XAxis dataKey="label" stroke="var(--ink-dim)" fontSize={11} />
            <YAxis stroke="var(--ink-dim)" fontSize={11} width={70} />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(value) => formatBRL(Number(value))}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: "var(--ink-dim)" }} />
            <Bar dataKey="Receita confirmada" stackId="receita" fill="var(--chart-3)" />
            <Bar dataKey="Receita estimada" stackId="receita" fill="var(--chart-3)" fillOpacity={0.45} />
            <Bar dataKey="Despesa confirmada" stackId="despesa" fill="var(--chart-2)" />
            <Bar dataKey="Despesa estimada" stackId="despesa" fill="var(--chart-2)" fillOpacity={0.45} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-3 max-w-[70ch] text-[11px] text-ink-dim">
        Confirmado = contratos recorrentes ativos e faturas/despesas já lançadas no período.
        Estimado = média dos últimos 3 meses de receita/despesa avulsa, para os meses sem lançamento ainda.
      </p>
    </div>
  );
}
