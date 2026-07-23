import { NextRequest, NextResponse } from "next/server";
import {
  deleteDespesaPessoal,
  getDespesaPessoalById,
  updateDespesaPessoal,
  type DespesaPessoalInput,
} from "@/lib/db-despesas-pessoal";

const VALID_STATUSES = ["a_pagar", "pago", "cancelado"];
const VALID_RECORRENCIAS = ["nenhuma", "mensal", "trimestral", "semestral", "anual"];

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/despesas-pessoal/[id]">,
) {
  const { id } = await ctx.params;

  try {
    const despesa = await getDespesaPessoalById(id);
    if (!despesa) {
      return NextResponse.json({ error: "Despesa não encontrada" }, { status: 404 });
    }
    return NextResponse.json({ despesa });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível carregar a despesa" },
      { status: 401 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/despesas-pessoal/[id]">,
) {
  const { id } = await ctx.params;
  const body = await request.json();

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

  if (!categoria || !descricao || !valor || !vencimento) {
    return NextResponse.json(
      { error: "Categoria, descrição, valor e vencimento são obrigatórios" },
      { status: 400 },
    );
  }

  const input: DespesaPessoalInput = {
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

  try {
    const despesa = await updateDespesaPessoal(id, input);
    return NextResponse.json({ despesa });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível atualizar a despesa" },
      { status: 401 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/despesas-pessoal/[id]">,
) {
  const { id } = await ctx.params;

  try {
    await deleteDespesaPessoal(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível excluir a despesa" },
      { status: 401 },
    );
  }
}
