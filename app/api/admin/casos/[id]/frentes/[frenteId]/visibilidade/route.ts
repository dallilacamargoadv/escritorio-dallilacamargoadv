import { NextRequest, NextResponse } from "next/server";
import { setFrenteVisivelCliente } from "@/lib/db-frentes";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/casos/[id]/frentes/[frenteId]/visibilidade">,
) {
  const { frenteId } = await ctx.params;
  const body = await request.json();

  if (typeof body?.visivel_cliente !== "boolean") {
    return NextResponse.json(
      { error: "visivel_cliente é obrigatório" },
      { status: 400 },
    );
  }

  try {
    const frente = await setFrenteVisivelCliente(frenteId, body.visivel_cliente);
    return NextResponse.json({ frente });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível atualizar a visibilidade" },
      { status: 401 },
    );
  }
}
