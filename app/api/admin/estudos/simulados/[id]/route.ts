import { NextRequest, NextResponse } from "next/server";
import { apagarSimulado, classificarItem, entregarSimulado } from "@/lib/db-estudos-simulados";

/** Entregar: corrige e grava as respostas. */
export async function POST(request: NextRequest, ctx: RouteContext<"/api/admin/estudos/simulados/[id]">) {
  const { id } = await ctx.params;
  const b = await request.json().catch(() => null);
  const marcadas = Array.isArray(b?.respostas)
    ? b.respostas
        .slice(0, 200)
        .filter((r: unknown) => typeof (r as { questao_id?: unknown })?.questao_id === "string")
        .map((r: { questao_id: string; alternativa: unknown; tempo_seg: unknown }) => ({
          questao_id: r.questao_id,
          alternativa: r.alternativa === null || r.alternativa === undefined ? null : Number(r.alternativa),
          tempo_seg: Number(r.tempo_seg) || 0,
        }))
    : [];
  try {
    await entregarSimulado(id, marcadas, Number(b?.duracao_seg) || 0);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível entregar" }, { status: 401 });
  }
}

/** Trocar o motivo do erro/acerto de uma questão no relatório. */
export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/admin/estudos/simulados/[id]">) {
  const { id } = await ctx.params;
  const b = await request.json().catch(() => null);
  if (typeof b?.questao_id !== "string" || typeof b?.classificacao !== "string") return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  try {
    await classificarItem(id, b.questao_id, b.classificacao);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível salvar" }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/admin/estudos/simulados/[id]">) {
  const { id } = await ctx.params;
  try {
    await apagarSimulado(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível apagar" }, { status: 400 });
  }
}
