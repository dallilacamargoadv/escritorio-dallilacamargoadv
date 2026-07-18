import type { FinanceiroAlertas } from "@/lib/financeiro-fase1";

export function FinanceiroAlerts({ alertas }: { alertas: FinanceiroAlertas }) {
  const itens = [
    { valor: alertas.faturasVencidas, label: "fatura(s) vencida(s)" },
    { valor: alertas.despesasVencidas, label: "despesa(s) vencida(s)" },
    { valor: alertas.receitasProx7Dias, label: "a receber nos próx. 7 dias" },
    { valor: alertas.despesasProx7Dias, label: "a pagar nos próx. 7 dias" },
  ].filter((item) => item.valor > 0);

  if (itens.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1.5 border border-warning bg-surface px-4 py-2.5 text-[11.5px]">
      {itens.map((item) => (
        <span key={item.label} className="text-ink-dim">
          <span className="font-mono text-warning">{item.valor}</span> {item.label}
        </span>
      ))}
    </div>
  );
}
