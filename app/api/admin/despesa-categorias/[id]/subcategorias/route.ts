import { NextRequest, NextResponse } from "next/server";
import { createDespesaSubcategoria } from "@/lib/db-despesa-categorias";

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/despesa-categorias/[id]/subcategorias">,
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const nome = typeof body?.nome === "string" ? body.nome.trim() : "";

  if (!nome) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  try {
    const subcategoria = await createDespesaSubcategoria(id, nome);
    return NextResponse.json({ subcategoria });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível criar a subcategoria" },
      { status: 401 },
    );
  }
}
