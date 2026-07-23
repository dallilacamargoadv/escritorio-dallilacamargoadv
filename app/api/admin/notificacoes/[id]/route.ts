import { NextRequest, NextResponse } from "next/server";
import { markNotificacaoAsRead } from "@/lib/db-notificacoes";

export async function PATCH(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/notificacoes/[id]">,
) {
  const { id } = await ctx.params;

  try {
    await markNotificacaoAsRead(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível marcar como lida" },
      { status: 401 },
    );
  }
}
