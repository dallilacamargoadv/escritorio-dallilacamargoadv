import { NextRequest, NextResponse } from "next/server";
import { setLeadArquivado } from "@/lib/db-admin";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/leads/[id]/arquivar">,
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const arquivado = Boolean(body?.arquivado);

  try {
    await setLeadArquivado(id, arquivado);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível atualizar o lead" },
      { status: 401 },
    );
  }
}
