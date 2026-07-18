import type { FinanceiroCards } from "@/lib/financeiro-fase1";

function formatBRL(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function RevenueExpenseRatio({ cards }: { cards: FinanceiroCards }) {
  if (cards.receitaMes === 0) {
    return (
      <div className="border border-hairline p-5 text-sm text-ink-dim">
        Sem receita registrada no período.
      </div>
    );
  }

  const despesaPercent = Math.min(100, (cards.despesasMes / cards.receitaMes) * 100);

  return (
    <div className="flex flex-wrap items-center gap-8 border border-hairline p-5">
      <div className="min-w-[220px] flex-1">
        <div className="flex items-center gap-2 text-xs">
          <span className="w-16 shrink-0 text-ink-dim">Receita</span>
          <div className="h-3 flex-1 bg-surface">
            <div className="h-full bg-success" style={{ width: "100%" }} />
          </div>
          <span className="w-24 shrink-0 text-right font-mono tabular-nums">
            {formatBRL(cards.receitaMes)}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span className="w-16 shrink-0 text-ink-dim">Despesas</span>
          <div className="h-3 flex-1 bg-surface">
            <div className="h-full bg-error" style={{ width: `${despesaPercent}%` }} />
          </div>
          <span className="w-24 shrink-0 text-right font-mono tabular-nums">
            {formatBRL(cards.despesasMes)}
          </span>
        </div>
      </div>

      <div className="flex min-w-[160px] flex-col gap-1.5 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-ink-dim">Resultado líquido</span>
          <span className={cards.resultadoLiquido >= 0 ? "text-success" : "text-error"}>
            {formatBRL(cards.resultadoLiquido)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-ink-dim">Margem líquida</span>
          <span>{cards.margemLiquida?.toFixed(1) ?? "—"}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-ink-dim">Despesas / receita</span>
          <span>{cards.percentualDespesas?.toFixed(1) ?? "—"}%</span>
        </div>
      </div>
    </div>
  );
}
