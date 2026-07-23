import { NextRequest, NextResponse } from "next/server";
import { cancelarLancamento } from "@/lib/db-financeiro";

export async function PATCH(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/financeiro/[id]/cancelar">,
) {
  const { id } = await ctx.params;

  try {
    const lancamento = await cancelarLancamento(id);
    return NextResponse.json({ lancamento });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível cancelar o lançamento" },
      { status: 401 },
    );
  }
}
