import { NextRequest, NextResponse } from "next/server";
import { concluirDia, reabrirDia, responderItem } from "@/lib/db-estudos-trilhas";
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
    const trilha = typeof body?.trilha === "string" ? body.trilha : "";
    const dia = Number(body?.dia);
    if (!trilha || !Number.isInteger(dia)) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    if (acao === "concluir") {
      const ok = await concluirDia(trilha, dia, typeof body.blurt === "string" ? body.blurt : "", todayBelemDateString());
      return ok ? NextResponse.json({ ok }) : NextResponse.json({ error: "Dia não encontrado" }, { status: 404 });
    }
    if (acao === "reabrir") {
      await reabrirDia(trilha, dia);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível salvar" }, { status: 401 });
  }
}
