import { NextRequest, NextResponse } from "next/server";
import { getLancamentoById, marcarComoPago } from "@/lib/db-financeiro";

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/financeiro/[id]">,
) {
  const { id } = await ctx.params;

  try {
    const lancamento = await getLancamentoById(id);
    if (!lancamento) {
      return NextResponse.json(
        { error: "Lançamento não encontrado" },
        { status: 404 },
      );
    }
    return NextResponse.json({ lancamento });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível carregar o lançamento" },
      { status: 401 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/financeiro/[id]">,
) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const pagoEm = typeof body?.pago_em === "string" && body.pago_em ? body.pago_em : undefined;

  try {
    const lancamento = await marcarComoPago(id, pagoEm);
    return NextResponse.json({ lancamento });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível marcar como pago" },
      { status: 401 },
    );
  }
}
