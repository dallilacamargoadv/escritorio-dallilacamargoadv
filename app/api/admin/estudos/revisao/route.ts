import { NextRequest, NextResponse } from "next/server";
import { revisarArtigo, revisarCartao } from "@/lib/db-estudos";
import { todayBelemDateString } from "@/lib/atividades-utils";

/** Grava a revisão de um cartão ou de um artigo: { tipo, id, ok, etapa? }. */
export async function POST(request: NextRequest) {
  const b = await request.json().catch(() => null);
  const id = typeof b?.id === "string" ? b.id.slice(0, 300) : "";
  const ok = b?.ok === true;
  if (!id || (b?.tipo !== "cartao" && b?.tipo !== "artigo") || typeof b?.ok !== "boolean") {
    return NextResponse.json({ error: "Pedido inválido" }, { status: 400 });
  }
  const hoje = todayBelemDateString();
  try {
    if (b.tipo === "cartao") await revisarCartao(id, ok, hoje);
    else await revisarArtigo(id, Number.isInteger(b.etapa) ? b.etapa : 0, ok, hoje);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    const msg = error instanceof Error && error.message.includes("inexistente") ? error.message : "Não foi possível salvar";
    return NextResponse.json({ error: msg }, { status: msg === "Não foi possível salvar" ? 401 : 400 });
  }
}
