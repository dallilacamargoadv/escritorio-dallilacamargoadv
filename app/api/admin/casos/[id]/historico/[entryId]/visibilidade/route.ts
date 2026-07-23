import { NextRequest, NextResponse } from "next/server";
import { setHistoricoVisivelCliente } from "@/lib/db-caso-historico";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/casos/[id]/historico/[entryId]/visibilidade">,
) {
  const { entryId } = await ctx.params;
  const body = await request.json();

  if (typeof body?.visivel_cliente !== "boolean") {
    return NextResponse.json(
      { error: "visivel_cliente é obrigatório" },
      { status: 400 },
    );
  }

  try {
    const entry = await setHistoricoVisivelCliente(entryId, body.visivel_cliente);
    return NextResponse.json({ entry });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível atualizar a visibilidade" },
      { status: 401 },
    );
  }
}
