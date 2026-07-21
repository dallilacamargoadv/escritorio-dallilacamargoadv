import { NextRequest, NextResponse } from "next/server";
import { deleteDespesaSubcategoriaPessoal } from "@/lib/db-despesa-categorias-pessoal";

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/despesa-categorias-pessoal/[id]/subcategorias/[subId]">,
) {
  const { subId } = await ctx.params;

  try {
    await deleteDespesaSubcategoriaPessoal(subId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível excluir a subcategoria" },
      { status: 401 },
    );
  }
}
