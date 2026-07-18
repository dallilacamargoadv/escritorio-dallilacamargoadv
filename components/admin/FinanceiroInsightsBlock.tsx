import type { FinanceiroInsights } from "@/lib/financeiro-insights";

function formatBRL(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function benchmarkSeverity(percentual: number): {
  borderClass: string;
  textClass: string;
  label: string;
} {
  if (percentual > 80) return { borderClass: "border-error", textClass: "text-error", label: "alerta" };
  if (percentual >= 50)
    return { borderClass: "border-warning", textClass: "text-warning", label: "atenção" };
  return { borderClass: "border-success", textClass: "text-success", label: "saudável" };
}

export function FinanceiroInsightsBlock({
  insights,
  percentualDespesas,
}: {
  insights: FinanceiroInsights;
  percentualDespesas: number | null;
}) {
  const { maiorCategoriaDespesa, clienteMaiorReceita } = insights;

  if (!maiorCategoriaDespesa && !clienteMaiorReceita && percentualDespesas === null) {
    return null;
  }

  const benchmark = percentualDespesas !== null ? benchmarkSeverity(percentualDespesas) : null;

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="border border-hairline p-5">
          {maiorCategoriaDespesa ? (
            <>
              <p className="font-mono text-xl text-ink tabular-nums">
                {formatBRL(maiorCategoriaDespesa.valor)}
              </p>
              <p className="mt-1.5 font-eyebrow text-[10px] text-ink-dim">
                Maior categoria de despesa (mês)
              </p>
              <p className="mt-1 text-xs text-ink-dim">
                {maiorCategoriaDespesa.categoria} · {maiorCategoriaDespesa.percentual.toFixed(0)}%
                das despesas do mês
              </p>
            </>
          ) : (
            <p className="text-sm text-ink-dim">Sem despesas registradas no mês.</p>
          )}
        </div>

        <div className="border border-hairline p-5">
          {clienteMaiorReceita ? (
            <>
              <p className="font-mono text-xl text-ink tabular-nums">
                {formatBRL(clienteMaiorReceita.valor)}
              </p>
              <p className="mt-1.5 font-eyebrow text-[10px] text-ink-dim">
                Cliente com maior receita (mês)
              </p>
              <p className="mt-1 text-xs text-ink-dim">{clienteMaiorReceita.clienteNome}</p>
            </>
          ) : (
            <p className="text-sm text-ink-dim">Sem receita recebida no mês.</p>
          )}
        </div>
      </div>

      {benchmark && percentualDespesas !== null && (
        <div
          className={`mt-3 flex items-center gap-2.5 border p-3.5 bg-surface ${benchmark.borderClass}`}
        >
          <span className={`font-mono text-sm font-semibold ${benchmark.textClass}`}>
            {percentualDespesas.toFixed(0)}%
          </span>
          <span className="text-xs text-ink-dim">
            das despesas do mês em relação à receita — {benchmark.label} (
            {benchmark.label === "saudável"
              ? "até 50%"
              : benchmark.label === "atenção"
                ? "50–80%"
                : "acima de 80%"}
            ).
          </span>
        </div>
      )}
    </div>
  );
}
