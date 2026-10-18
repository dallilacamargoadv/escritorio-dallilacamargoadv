import { NextRequest, NextResponse } from "next/server";
import { enviarIdeiaAoCalendario } from "@/lib/db-ideias";
import type { ContentPilar } from "@/lib/db-conteudo-editorial";

const PILARES: ContentPilar[] = ["topo", "meio", "fundo"];

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/ideias/[id]/calendario">,
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const data = typeof body?.data === "string" ? body.data : "";
  const pilar = body?.pilar as ContentPilar;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || !PILARES.includes(pilar)) {
    return NextResponse.json({ error: "Data e pilar são obrigatórios" }, { status: 400 });
  }

  try {
    const ideia = await enviarIdeiaAoCalendario(id, { data, pilar });
    return NextResponse.json({ ideia });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível enviar ao calendário" },
      { status: 401 },
    );
  }
}
