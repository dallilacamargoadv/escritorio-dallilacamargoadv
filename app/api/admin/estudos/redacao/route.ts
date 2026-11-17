import { NextRequest, NextResponse } from "next/server";
import { CASO_POR_ID, marcarSemanal, salvarDiscursiva, salvarRedacao, TEMA_POR_ID } from "@/lib/db-estudos-redacao";
import { todayBelemDateString } from "@/lib/atividades-utils";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const acao = typeof body?.acao === "string" ? body.acao : "";
  const id = typeof body?.id === "string" ? body.id : "";
  try {
    if (acao === "redacao") {
      if (id !== "livre" && !TEMA_POR_ID.has(id)) return NextResponse.json({ error: "Tema não encontrado" }, { status: 404 });
      await salvarRedacao(id, body);
      return NextResponse.json({ ok: true });
    }
    if (acao === "discursiva") {
      if (!CASO_POR_ID.has(id)) return NextResponse.json({ error: "Caso não encontrado" }, { status: 404 });
      await salvarDiscursiva(id, body);
      return NextResponse.json({ ok: true });
    }
    if (acao === "semanal") {
      const tipo = body.tipo === "rlm" || body.tipo === "redacao" || body.tipo === "discursiva" ? body.tipo : "";
      if (!tipo) return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
      await marcarSemanal(todayBelemDateString(), tipo, body.feito !== false);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível salvar" }, { status: 401 });
  }
}
