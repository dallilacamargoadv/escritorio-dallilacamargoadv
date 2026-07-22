import { NextRequest, NextResponse } from "next/server";
import {
  createIndicacao,
  getIndicacoesByParceiro,
  type IndicacaoInput,
} from "@/lib/db-indicacoes";

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/parceiros/[id]/indicacoes">,
) {
  const { id } = await ctx.params;

  try {
    const indicacoes = await getIndicacoesByParceiro(id);
    return NextResponse.json({ indicacoes });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível carregar as indicações" },
      { status: 401 },
    );
  }
}

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/parceiros/[id]/indicacoes">,
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const direcao = body?.direcao === "enviada" ? "enviada" : "recebida";
  const data = typeof body?.data === "string" && body.data ? body.data : null;

  if (!data) {
    return NextResponse.json({ error: "Data é obrigatória" }, { status: 400 });
  }

  const input: IndicacaoInput = {
    direcao,
    data,
    lead_id: typeof body?.lead_id === "string" && body.lead_id ? body.lead_id : null,
    cliente_id:
      typeof body?.cliente_id === "string" && body.cliente_id ? body.cliente_id : null,
    observacoes:
      typeof body?.observacoes === "string" && body.observacoes.trim()
        ? body.observacoes.trim()
        : null,
  };

  try {
    const indicacao = await createIndicacao(id, input);
    return NextResponse.json({ indicacao });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível salvar a indicação" },
      { status: 401 },
    );
  }
}
