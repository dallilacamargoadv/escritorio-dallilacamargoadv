import { NextRequest, NextResponse } from "next/server";
import {
  deleteDespesaCategoriaPessoal,
  updateDespesaCategoriaPessoalNome,
} from "@/lib/db-despesa-categorias-pessoal";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/despesa-categorias-pessoal/[id]">,
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const nome = typeof body?.nome === "string" ? body.nome.trim() : "";

  if (!nome) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  try {
    await updateDespesaCategoriaPessoalNome(id, nome);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível atualizar a categoria" },
      { status: 401 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/despesa-categorias-pessoal/[id]">,
) {
  const { id } = await ctx.params;

  try {
    await deleteDespesaCategoriaPessoal(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível excluir a categoria" },
      { status: 401 },
    );
  }
}
