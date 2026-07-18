import { NextRequest, NextResponse } from "next/server";
import { createDespesa, getAllDespesas, type DespesaInput } from "@/lib/db-despesas";
import { CATEGORIAS_DESPESA, type CategoriaDespesaKey } from "@/lib/despesas-categorias";

const VALID_CATEGORIAS = Object.keys(CATEGORIAS_DESPESA) as CategoriaDespesaKey[];
const VALID_STATUSES = ["a_pagar", "pago", "cancelado"];
const VALID_RECORRENCIAS = ["nenhuma", "mensal", "trimestral", "semestral", "anual"];

export async function GET() {
  try {
    const despesas = await getAllDespesas();
    return NextResponse.json({ despesas });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível carregar as despesas" },
      { status: 401 },
    );
  }
}

function parseInput(body: Record<string, unknown>): DespesaInput | null {
  const categoria = VALID_CATEGORIAS.includes(body?.categoria as CategoriaDespesaKey)
    ? (body.categoria as string)
    : undefined;
  const descricao = typeof body?.descricao === "string" ? body.descricao.trim() : "";
  const valor = typeof body?.valor === "number" ? body.valor : NaN;
  const vencimento = typeof body?.vencimento === "string" ? body.vencimento : "";
  const status = VALID_STATUSES.includes(body?.status as string)
    ? (body.status as DespesaInput["status"])
    : "a_pagar";
  const recorrencia = VALID_RECORRENCIAS.includes(body?.recorrencia as string)
    ? (body.recorrencia as DespesaInput["recorrencia"])
    : "nenhuma";

  if (!categoria || !descricao || !valor || !vencimento) return null;

  return {
    categoria,
    subcategoria: typeof body?.subcategoria === "string" ? body.subcategoria : null,
    descricao,
    fornecedor: typeof body?.fornecedor === "string" ? body.fornecedor.trim() || null : null,
    valor,
    vencimento,
    status,
    forma_pagamento: typeof body?.forma_pagamento === "string" ? body.forma_pagamento : null,
    recorrencia,
    centro_custo: typeof body?.centro_custo === "string" ? body.centro_custo : null,
    observacoes: typeof body?.observacoes === "string" ? body.observacoes.trim() || null : null,
  };
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const input = parseInput(body);

  if (!input) {
    return NextResponse.json(
      { error: "Categoria, descrição, valor e vencimento são obrigatórios" },
      { status: 400 },
    );
  }

  try {
    const despesa = await createDespesa(input);
    return NextResponse.json({ despesa });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível criar a despesa" },
      { status: 401 },
    );
  }
}
