import { NextRequest, NextResponse } from "next/server";
import {
  createDespesaPessoal,
  getAllDespesasPessoal,
  type DespesaPessoalInput,
} from "@/lib/db-despesas-pessoal";

const VALID_STATUSES = ["a_pagar", "pago", "cancelado"];
const VALID_RECORRENCIAS = ["nenhuma", "mensal", "trimestral", "semestral", "anual"];

export async function GET() {
  try {
    const despesas = await getAllDespesasPessoal();
    return NextResponse.json({ despesas });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível carregar as despesas" },
      { status: 401 },
    );
  }
}

function parseInput(body: Record<string, unknown>): DespesaPessoalInput | null {
  const categoria = typeof body?.categoria === "string" ? body.categoria.trim() || undefined : undefined;
  const descricao = typeof body?.descricao === "string" ? body.descricao.trim() : "";
  const valor = typeof body?.valor === "number" ? body.valor : NaN;
  const vencimento = typeof body?.vencimento === "string" ? body.vencimento : "";
  const status = VALID_STATUSES.includes(body?.status as string)
    ? (body.status as DespesaPessoalInput["status"])
    : "a_pagar";
  const recorrencia = VALID_RECORRENCIAS.includes(body?.recorrencia as string)
    ? (body.recorrencia as DespesaPessoalInput["recorrencia"])
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
    const despesa = await createDespesaPessoal(input);
    return NextResponse.json({ despesa });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível criar a despesa" },
      { status: 401 },
    );
  }
}
