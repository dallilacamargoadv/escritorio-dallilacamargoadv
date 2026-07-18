import { redirect } from "next/navigation";
import { getAllLancamentos } from "@/lib/db-financeiro";
import {
  METAS_TIERS,
  computeMonthlyHistory,
  computeRevenueByMonth,
  computeTierProgress,
  currentBelemMonthKey,
  monthKeyLabel,
} from "@/lib/metas";

function formatBRL(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function MetasPage() {
  let lancamentos;
  try {
    lancamentos = await getAllLancamentos();
  } catch {
    redirect("/login");
  }

  const mesAtualKey = currentBelemMonthKey();
  const revenueByMonth = computeRevenueByMonth(lancamentos);
  const valorMesAtual = revenueByMonth.get(mesAtualKey) ?? 0;
  const progresso = computeTierProgress(valorMesAtual);
  const historico = computeMonthlyHistory(lancamentos, 6);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="border-b border-hairline pb-6">
        <h1 className="text-lg italic text-ink">Painel de Metas</h1>
        <p className="font-mono text-xs text-ink-dim">
          Faturamento pago vs. tiers de meta
        </p>
      </div>

      <div className="mt-6 border border-hairline bg-surface p-6">
        <p className="font-mono text-3xl text-gold-bright tabular-nums">
          {formatBRL(valorMesAtual)}
        </p>
        <p className="mt-1 font-eyebrow text-[10px] text-ink-dim">
          Faturado em {monthKeyLabel(mesAtualKey)}
        </p>
        <p className="mt-1.5 text-sm text-ink-dim">
          {progresso.proximoTier !== null
            ? `${formatBRL(progresso.faltaProximoTier ?? 0)} até o próximo tier (${formatBRL(progresso.proximoTier)})`
            : "Todos os tiers atingidos neste mês."}
        </p>

        <div className="mt-5">
          <div className="relative h-3.5 border border-hairline-strong bg-bg">
            <div
              className="h-full bg-gold transition-all"
              style={{ width: `${progresso.progressoPercent}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between">
            {METAS_TIERS.map((tier, index) => (
              <div
                key={tier}
                className={`text-center text-[10.5px] ${index === 0 ? "text-left" : index === METAS_TIERS.length - 1 ? "text-right" : ""}`}
              >
                <p
                  className={`font-mono ${
                    progresso.tierIndex !== null && index <= progresso.tierIndex
                      ? "text-success"
                      : progresso.tierIndex === index - 1
                        ? "text-gold-bright"
                        : "text-ink"
                  }`}
                >
                  {tier / 1000}k
                </p>
                <p className="mt-0.5 text-ink-dim">tier {index + 1}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-5 gap-2">
        {METAS_TIERS.map((tier, index) => {
          const status =
            progresso.tierIndex !== null && index <= progresso.tierIndex
              ? "reached"
              : progresso.tierIndex === index - 1
                ? "current"
                : "pending";
          return (
            <div
              key={tier}
              className={`border p-3 text-center ${
                status === "reached" ? "border-success" : "border-hairline"
              }`}
            >
              <p className="font-mono text-[9px] text-ink-dim">Tier {index + 1}</p>
              <p className="mt-1 font-mono text-[13px] tabular-nums text-ink">
                {formatBRL(tier)}
              </p>
              <p
                className={`mt-1 font-mono text-[9px] uppercase tracking-wide ${
                  status === "reached"
                    ? "text-success"
                    : status === "current"
                      ? "text-gold-bright"
                      : "text-ink-dim"
                }`}
              >
                {status === "reached"
                  ? "Atingido"
                  : status === "current"
                    ? "Em curso"
                    : "Pendente"}
              </p>
            </div>
          );
        })}
      </div>

      <p className="mt-8 font-eyebrow text-[10px] text-ink-dim">
        Histórico mensal
      </p>
      <div className="mt-2 border border-hairline">
        {historico.map((mes, index) => (
          <div
            key={mes.mesKey}
            className={`flex items-center justify-between gap-4 px-4 py-3 text-sm ${
              index !== historico.length - 1 ? "border-b border-hairline" : ""
            }`}
          >
            <span className="text-ink">
              {mes.label}
              {mes.mesKey === mesAtualKey ? " (em curso)" : ""}
            </span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-ink-dim tabular-nums">
                {formatBRL(mes.valor)}
              </span>
              {mes.tierIndex !== null && (
                <span className="border border-success px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-success">
                  Tier {mes.tierIndex + 1}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
