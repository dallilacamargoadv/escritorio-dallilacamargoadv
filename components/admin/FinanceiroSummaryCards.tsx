import type { FinanceiroCards } from "@/lib/financeiro-fase1";
import { percentDelta } from "@/lib/financeiro-fase1";
import { formatDate } from "@/lib/format";

function formatBRL(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function DeltaLabel({ atual, anterior }: { atual: number; anterior: number }) {
  const delta = percentDelta(atual, anterior);
  if (delta === null) return <p className="mt-1 text-[10.5px] text-ink-dim">sem dados do mês anterior</p>;
  const positivo = delta >= 0;
  return (
    <p className={`mt-1 text-[10.5px] ${positivo ? "text-success" : "text-error"}`}>
      {positivo ? "↑" : "↓"} {Math.abs(Math.round(delta))}% vs. mês anterior
    </p>
  );
}

export function FinanceiroSummaryCards({ cards }: { cards: FinanceiroCards }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      <div className="border border-hairline p-5">
        <p className="font-mono text-xl text-ink tabular-nums">{formatBRL(cards.receitaMes)}</p>
        <DeltaLabel atual={cards.receitaMes} anterior={cards.receitaMesAnterior} />
        <p className="mt-1.5 font-eyebrow text-[10px] text-ink-dim">Receita recebida no mês</p>
      </div>

      <div className="border border-hairline p-5">
        <p className="font-mono text-xl text-ink tabular-nums">{formatBRL(cards.despesasMes)}</p>
        <DeltaLabel atual={cards.despesasMes} anterior={cards.despesasMesAnterior} />
        <p className="mt-1.5 font-eyebrow text-[10px] text-ink-dim">Despesas do mês</p>
        {cards.percentualDespesas !== null && (
          <p className="mt-1 text-xs text-ink-dim">
            {cards.percentualDespesas.toFixed(1)}% da receita
          </p>
        )}
      </div>

      <div className="border border-gold p-5">
        <p
          className={`font-mono text-xl tabular-nums ${cards.resultadoLiquido >= 0 ? "text-success" : "text-error"}`}
        >
          {formatBRL(cards.resultadoLiquido)}
        </p>
        <p className="mt-1.5 font-eyebrow text-[10px] text-ink-dim">Resultado líquido</p>
        <p className="mt-1 text-xs text-ink-dim">
          {cards.margemLiquida !== null
            ? `${cards.margemLiquida.toFixed(1)}% de margem`
            : "sem receita registrada no período"}
        </p>
      </div>

      <div className="border border-hairline p-5">
        <p className="font-mono text-xl text-ink tabular-nums">{formatBRL(cards.emAbertoValor)}</p>
        <p className="mt-1.5 font-eyebrow text-[10px] text-ink-dim">Em aberto</p>
        <p className="mt-1 text-xs text-ink-dim">
          {cards.emAbertoCount} fatura(s)
          {cards.proximoVencimento && ` · próx. venc. ${formatDate(cards.proximoVencimento)}`}
        </p>
      </div>

      <div className="border border-hairline p-5">
        <p className="font-mono text-xl text-error tabular-nums">
          {formatBRL(cards.inadimplenciaValor)}
        </p>
        <p className="mt-1.5 font-eyebrow text-[10px] text-ink-dim">Inadimplência</p>
        <p className="mt-1 text-xs text-ink-dim">
          {cards.inadimplenciaCount} fatura(s)
          {cards.inadimplenciaPercentual !== null &&
            ` · ${cards.inadimplenciaPercentual.toFixed(1)}% do faturado`}
        </p>
      </div>

      <div className="border border-hairline p-5">
        <p className="font-mono text-xl text-gold-bright tabular-nums">
          {formatBRL(cards.projecaoMes)}
        </p>
        <p className="mt-1.5 font-eyebrow text-[10px] text-ink-dim">Projeção do mês</p>
        <p className="mt-1 text-xs text-ink-dim">
          {formatBRL(cards.receitaMes)} recebido + {formatBRL(cards.emAbertoValor)} previsto
        </p>
      </div>
    </div>
  );
}
