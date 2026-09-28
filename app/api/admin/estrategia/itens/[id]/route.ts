import { NextRequest, NextResponse } from "next/server";
import { setItemConcluido } from "@/lib/db-estrategia";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/estrategia/itens/[id]">,
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const concluido = body?.concluido === true;

  try {
    const item = await setItemConcluido(id, concluido);
    return NextResponse.json({ item });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível atualizar o item" },
      { status: 401 },
    );
  }
}
