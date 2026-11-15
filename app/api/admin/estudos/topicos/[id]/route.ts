import { NextRequest, NextResponse } from "next/server";
import { updateTopicoEstado } from "@/lib/db-estudos";
import { STATUS_LABELS, TOPICO_POR_ID, type TopicoStatus } from "@/lib/estudos-utils";

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/admin/estudos/topicos/[id]">) {
  const { id } = await ctx.params;
  if (!TOPICO_POR_ID.has(id)) return NextResponse.json({ error: "Tópico inexistente" }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const patch: { status?: TopicoStatus; fora_do_edital?: boolean; nota?: string | null } = {};
  if (body?.status in STATUS_LABELS) patch.status = body.status;
  if (typeof body?.fora_do_edital === "boolean") patch.fora_do_edital = body.fora_do_edital;
  if ("nota" in (body ?? {})) patch.nota = typeof body.nota === "string" && body.nota.trim() ? body.nota.trim().slice(0, 2000) : null;
  if (Object.keys(patch).length === 0) return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
  try {
    const estado = await updateTopicoEstado(id, patch);
    return NextResponse.json({ estado });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível atualizar" }, { status: 401 });
  }
}
