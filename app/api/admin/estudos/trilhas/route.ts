import { NextRequest, NextResponse } from "next/server";
import { concluirTema, reabrirTema, responderItem } from "@/lib/db-estudos-trilhas";
import { todayBelemDateString } from "@/lib/atividades-utils";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const acao = typeof body?.acao === "string" ? body.acao : "";
  try {
    if (acao === "responder") {
      const id = typeof body.id === "string" ? body.id : "";
      const resposta = body.resposta === "certo" || body.resposta === "errado" ? body.resposta : "";
      if (!id || !resposta) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
      const correcao = await responderItem(id, resposta);
      if (!correcao) return NextResponse.json({ error: "Item não encontrado" }, { status: 404 });
      return NextResponse.json({ correcao });
    }
    const tema = typeof body?.tema === "string" ? body.tema : "";
    if (!tema) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    if (acao === "concluir") {
      const ok = await concluirTema(tema, typeof body.blurt === "string" ? body.blurt : "", todayBelemDateString());
      return ok ? NextResponse.json({ ok }) : NextResponse.json({ error: "Tema não encontrado" }, { status: 404 });
    }
    if (acao === "reabrir") {
      await reabrirTema(tema);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível salvar" }, { status: 401 });
  }
}
