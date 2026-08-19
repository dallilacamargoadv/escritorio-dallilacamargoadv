import { NextRequest, NextResponse } from "next/server";
import { setKRConcluido } from "@/lib/db-planejamento";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/planejamento/krs/[id]">,
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const concluido = body?.concluido === true;

  try {
    const kr = await setKRConcluido(id, concluido);
    return NextResponse.json({ kr });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível atualizar o resultado-chave" },
      { status: 401 },
    );
  }
}
