import { NextRequest, NextResponse } from "next/server";
import { deleteDespesaSubcategoria } from "@/lib/db-despesa-categorias";

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/despesa-categorias/[id]/subcategorias/[subId]">,
) {
  const { subId } = await ctx.params;

  try {
    await deleteDespesaSubcategoria(subId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível excluir a subcategoria" },
      { status: 401 },
    );
  }
}
