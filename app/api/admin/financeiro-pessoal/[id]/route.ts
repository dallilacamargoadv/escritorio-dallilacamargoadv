import { NextRequest, NextResponse } from "next/server";
import {
  deleteLancamentoPessoal,
  getLancamentoPessoalById,
  updateLancamentoPessoal,
  type LancamentoPessoalInput,
} from "@/lib/db-financeiro-pessoal";

const VALID_STATUSES = ["pendente", "pago", "cancelado"];

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/financeiro-pessoal/[id]">,
) {
  const { id } = await ctx.params;

  try {
    const lancamento = await getLancamentoPessoalById(id);
    if (!lancamento) {
      return NextResponse.json({ error: "Lançamento não encontrado" }, { status: 404 });
    }
    return NextResponse.json({ lancamento });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível carregar o lançamento" },
      { status: 401 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/financeiro-pessoal/[id]">,
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const descricao = typeof body?.descricao === "string" ? body.descricao.trim() : "";
  const valor = typeof body?.valor === "number" ? body.valor : NaN;
  const vencimento = typeof body?.vencimento === "string" ? body.vencimento : "";
  const status = VALID_STATUSES.includes(body?.status as string)
    ? (body.status as LancamentoPessoalInput["status"])
    : "pendente";

  if (!descricao || !valor || !vencimento) {
    return NextResponse.json(
      { error: "Descrição, valor e vencimento são obrigatórios" },
      { status: 400 },
    );
  }

  const input: LancamentoPessoalInput = { descricao, valor, vencimento, status };

  try {
    const lancamento = await updateLancamentoPessoal(id, input);
    return NextResponse.json({ lancamento });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível atualizar o lançamento" },
      { status: 401 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/financeiro-pessoal/[id]">,
) {
  const { id } = await ctx.params;

  try {
    await deleteLancamentoPessoal(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível excluir o lançamento" },
      { status: 401 },
    );
  }
}
