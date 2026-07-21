import type { DespesaPessoal } from "@/lib/db-despesas-pessoal";

const TZ = "America/Belem";

function belemMonthKey(dateIso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
  }).format(new Date(dateIso));
}

export interface MaiorCategoriaDespesaPessoal {
  categoria: string;
  valor: number;
  percentual: number;
}

export function computeMaiorCategoriaDespesaPessoal(
  despesas: DespesaPessoal[],
): MaiorCategoriaDespesaPessoal | null {
  const mesAtual = belemMonthKey(new Date().toISOString());
  const despesasDoMes = despesas.filter(
    (d) => d.status !== "cancelado" && belemMonthKey(d.vencimento) === mesAtual,
  );
  const totalDespesasMes = despesasDoMes.reduce((sum, d) => sum + d.valor, 0);

  const porCategoria = new Map<string, number>();
  for (const d of despesasDoMes) {
    porCategoria.set(d.categoria, (porCategoria.get(d.categoria) ?? 0) + d.valor);
  }

  let maior: MaiorCategoriaDespesaPessoal | null = null;
  for (const [categoria, valor] of porCategoria) {
    if (!maior || valor > maior.valor) {
      maior = {
        categoria,
        valor,
        percentual: totalDespesasMes > 0 ? (valor / totalDespesasMes) * 100 : 0,
      };
    }
  }
  return maior;
}
