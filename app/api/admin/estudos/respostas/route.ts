import { NextRequest, NextResponse } from "next/server";
import { createResposta, QUESTAO_POR_ID } from "@/lib/db-estudos";
import { EH_ERRO, TIPOS_ACERTO, type Classificacao } from "@/lib/estudos-desempenho";

const ACERTOS = new Set<string>(TIPOS_ACERTO.map((a) => a.k));

export async function POST(request: NextRequest) {
  const b = await request.json().catch(() => null);
  const q = typeof b?.questao_id === "string" ? QUESTAO_POR_ID.get(b.questao_id) : undefined;
  if (!q) return NextResponse.json({ error: "Questão inexistente" }, { status: 400 });
  const alternativa = Number(b.alternativa);
  if (!Number.isInteger(alternativa) || alternativa < 0 || alternativa > 4) {
    return NextResponse.json({ error: "Alternativa inválida" }, { status: 400 });
  }
  const correta = alternativa === q.c;
  const cl = String(b.classificacao ?? "");
  if (correta ? !ACERTOS.has(cl) : !EH_ERRO.has(cl)) {
    return NextResponse.json({ error: correta ? "Diga como você acertou" : "Diga por que você errou" }, { status: 400 });
  }
  const tempo = Number.isFinite(Number(b.tempo_seg)) ? Math.max(0, Math.min(7200, Math.round(Number(b.tempo_seg)))) : null;
  const contexto = b.contexto === "revisao" || b.contexto === "simulado" ? b.contexto : "treino";
  const nota = typeof b.nota === "string" && b.nota.trim() ? b.nota.trim().slice(0, 2000) : null;
  try {
    const resposta = await createResposta({ questao_id: q.id, correta, alternativa, classificacao: cl as Classificacao, tempo_seg: tempo, contexto, nota });
    return NextResponse.json({ resposta });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível salvar" }, { status: 401 });
  }
}
