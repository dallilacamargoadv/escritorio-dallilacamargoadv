import { NextRequest, NextResponse } from "next/server";
import { createFrente, getAllFrentes, type FrenteInput } from "@/lib/db-frentes";

const VALID_TIPOS = ["extrajudicial", "judicial", "administrativo"];
const VALID_STATUSES = ["aberta", "em_andamento", "concluida", "arquivada"];

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/casos/[id]/frentes">,
) {
  const { id } = await ctx.params;

  try {
    const frentes = await getAllFrentes(id);
    return NextResponse.json({ frentes });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível carregar as frentes" },
      { status: 401 },
    );
  }
}

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/casos/[id]/frentes">,
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const tipo = VALID_TIPOS.includes(body?.tipo) ? body.tipo : undefined;

  if (!tipo) {
    return NextResponse.json({ error: "Tipo é obrigatório" }, { status: 400 });
  }

  const input: FrenteInput = {
    tipo,
    orgao: typeof body?.orgao === "string" ? body.orgao.trim() : "",
    numero_processo:
      typeof body?.numero_processo === "string"
        ? body.numero_processo.trim()
        : "",
    status: VALID_STATUSES.includes(body?.status) ? body.status : "aberta",
  };

  try {
    const frente = await createFrente(id, input);
    return NextResponse.json({ frente });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível criar a frente" },
      { status: 401 },
    );
  }
}
