import { NextRequest, NextResponse } from "next/server";
import { salvarEstadoVerbos } from "@/lib/db-estudos-verbos";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.estado !== "object" || JSON.stringify(body.estado).length > 200_000) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  try {
    await salvarEstadoVerbos(body.estado);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível salvar" }, { status: 401 });
  }
}
