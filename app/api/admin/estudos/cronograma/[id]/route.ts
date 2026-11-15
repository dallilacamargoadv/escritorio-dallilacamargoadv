import { NextRequest, NextResponse } from "next/server";
import { marcarItem } from "@/lib/db-estudos";

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/admin/estudos/cronograma/[id]">) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => ({}));
  if (typeof body?.feito !== "boolean") return NextResponse.json({ error: "Informe feito" }, { status: 400 });
  try {
    const item = await marcarItem(id, body.feito);
    return NextResponse.json({ item });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível atualizar" }, { status: 401 });
  }
}
