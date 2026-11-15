import { NextRequest, NextResponse } from "next/server";
import { AULA_POR_ID, marcarAula } from "@/lib/db-estudos-cadernos";

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/admin/estudos/aulas/[id]">) {
  const { id } = await ctx.params;
  if (!AULA_POR_ID.has(id)) return NextResponse.json({ error: "Aula inexistente" }, { status: 404 });
  const b = await request.json().catch(() => ({}));
  if (typeof b?.estudada !== "boolean") return NextResponse.json({ error: "Informe estudada" }, { status: 400 });
  try {
    await marcarAula(id, b.estudada);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível salvar" }, { status: 401 });
  }
}
