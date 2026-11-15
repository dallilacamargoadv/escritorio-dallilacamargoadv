import { NextRequest, NextResponse } from "next/server";
import { apagarRegistroTec } from "@/lib/db-estudos-cadernos";

export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/admin/estudos/tec/[id]">) {
  const { id } = await ctx.params;
  try {
    await apagarRegistroTec(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível apagar" }, { status: 401 });
  }
}
