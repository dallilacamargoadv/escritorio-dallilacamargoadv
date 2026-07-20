import { NextRequest, NextResponse } from "next/server";
import { createHistoricoEntry, getHistoricoByCaso } from "@/lib/db-caso-historico";

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/casos/[id]/historico">,
) {
  const { id } = await ctx.params;

  try {
    const historico = await getHistoricoByCaso(id);
    return NextResponse.json({ historico });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível carregar o histórico" },
      { status: 401 },
    );
  }
}

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/casos/[id]/historico">,
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const texto = typeof body?.texto === "string" ? body.texto.trim() : "";

  if (!texto) {
    return NextResponse.json({ error: "Texto é obrigatório" }, { status: 400 });
  }

  try {
    const entry = await createHistoricoEntry(id, texto);
    return NextResponse.json({ entry });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível salvar a entrada" },
      { status: 401 },
    );
  }
}
