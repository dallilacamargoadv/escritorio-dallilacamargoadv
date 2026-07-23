import { NextRequest, NextResponse } from "next/server";
import {
  getParceiroById,
  updateParceiro,
  type ParceiroInput,
} from "@/lib/db-parceiros";

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/parceiros/[id]">,
) {
  const { id } = await ctx.params;

  try {
    const parceiro = await getParceiroById(id);
    if (!parceiro) {
      return NextResponse.json({ error: "Parceiro não encontrado" }, { status: 404 });
    }
    return NextResponse.json({ parceiro });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível carregar o parceiro" },
      { status: 401 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/parceiros/[id]">,
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const nome = typeof body?.nome === "string" ? body.nome.trim() : "";

  if (!nome) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  const input: ParceiroInput = {
    nome,
    tipo_pessoa: body?.tipo_pessoa === "pj" ? "pj" : "pf",
    contato: typeof body?.contato === "string" && body.contato.trim() ? body.contato.trim() : null,
    observacoes:
      typeof body?.observacoes === "string" && body.observacoes.trim()
        ? body.observacoes.trim()
        : null,
  };

  try {
    const parceiro = await updateParceiro(id, input);
    return NextResponse.json({ parceiro });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível atualizar o parceiro" },
      { status: 401 },
    );
  }
}
