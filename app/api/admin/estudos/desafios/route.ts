import { NextRequest, NextResponse } from "next/server";
import { responderDesafio } from "@/lib/db-estudos-desafios";
import { todayBelemDateString } from "@/lib/atividades-utils";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  const resposta = typeof body?.resposta === "string" ? body.resposta.slice(0, 200) : "";
  if (!id || !resposta) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  try {
    const correcao = await responderDesafio(id, resposta, todayBelemDateString());
    if (!correcao) return NextResponse.json({ error: "Desafio não encontrado" }, { status: 404 });
    return NextResponse.json({ correcao });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível salvar" }, { status: 401 });
  }
}
