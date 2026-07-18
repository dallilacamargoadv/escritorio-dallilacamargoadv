import type { LancamentoRow } from "@/lib/db-financeiro";
import type { Despesa } from "@/lib/db-despesas";

const TZ = "America/Belem";

function belemMonthKey(dateIso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
  }).format(new Date(dateIso));
}

export interface MaiorCategoriaDespesa {
  categoria: string;
  valor: number;
  percentual: number;
}

export interface ClienteMaiorReceita {
  clienteId: string;
  clienteNome: string;
  valor: number;
}

export interface FinanceiroInsights {
  maiorCategoriaDespesa: MaiorCategoriaDespesa | null;
  clienteMaiorReceita: ClienteMaiorReceita | null;
}

export function computeFinanceiroInsights({
  lancamentos,
  despesas,
}: {
  lancamentos: LancamentoRow[];
  despesas: Despesa[];
}): FinanceiroInsights {
  const mesAtual = belemMonthKey(new Date().toISOString());

  const despesasDoMes = despesas.filter(
    (d) => d.status !== "cancelado" && belemMonthKey(d.vencimento) === mesAtual,
  );
  const totalDespesasMes = despesasDoMes.reduce((sum, d) => sum + d.valor, 0);

  const porCategoria = new Map<string, number>();
  for (const d of despesasDoMes) {
    porCategoria.set(d.categoria, (porCategoria.get(d.categoria) ?? 0) + d.valor);
  }

  let maiorCategoriaDespesa: MaiorCategoriaDespesa | null = null;
  for (const [categoria, valor] of porCategoria) {
    if (!maiorCategoriaDespesa || valor > maiorCategoriaDespesa.valor) {
      maiorCategoriaDespesa = {
        categoria,
        valor,
        percentual: totalDespesasMes > 0 ? (valor / totalDespesasMes) * 100 : 0,
      };
    }
  }

  const receitasDoMes = lancamentos.filter(
    (l) => l.status === "pago" && l.pago_em && belemMonthKey(l.pago_em) === mesAtual,
  );

  const porCliente = new Map<string, { clienteNome: string; valor: number }>();
  for (const l of receitasDoMes) {
    const atual = porCliente.get(l.cliente_id);
    porCliente.set(l.cliente_id, {
      clienteNome: l.clienteNome,
      valor: (atual?.valor ?? 0) + l.valor,
    });
  }

  let clienteMaiorReceita: ClienteMaiorReceita | null = null;
  for (const [clienteId, info] of porCliente) {
    if (!clienteMaiorReceita || info.valor > clienteMaiorReceita.valor) {
      clienteMaiorReceita = { clienteId, clienteNome: info.clienteNome, valor: info.valor };
    }
  }

  return { maiorCategoriaDespesa, clienteMaiorReceita };
}
