import { NextRequest, NextResponse } from "next/server";
import { deleteFluxoTemplate } from "@/lib/db-fluxo-templates";

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/fluxos/[id]">,
) {
  const { id } = await ctx.params;

  try {
    await deleteFluxoTemplate(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível excluir o modelo" },
      { status: 401 },
    );
  }
}
