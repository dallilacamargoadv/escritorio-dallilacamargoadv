import { NextRequest, NextResponse } from "next/server";
import { createFrenteEtapa, getEtapasByFrente } from "@/lib/db-frente-etapas";

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/casos/[id]/frentes/[frenteId]/etapas">,
) {
  const { frenteId } = await ctx.params;

  try {
    const etapas = await getEtapasByFrente(frenteId);
    return NextResponse.json({ etapas });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível carregar as etapas" },
      { status: 401 },
    );
  }
}

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/casos/[id]/frentes/[frenteId]/etapas">,
) {
  const { frenteId } = await ctx.params;
  const body = await request.json();
  const nome = typeof body?.nome === "string" ? body.nome.trim() : "";
  const ordem = typeof body?.ordem === "number" ? body.ordem : 0;

  if (!nome) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  try {
    const etapa = await createFrenteEtapa(frenteId, nome, ordem);
    return NextResponse.json({ etapa });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível criar a etapa" },
      { status: 401 },
    );
  }
}
