import { NextRequest, NextResponse } from "next/server";
import { criarRegistrosTec } from "@/lib/db-estudos-cadernos";
import { MATERIA_POR_ID } from "@/lib/estudos-utils";
import type { RegistroTec } from "@/lib/db-estudos-cadernos";

/** Recebe várias linhas de uma vez (colagem do TEC já interpretada no navegador). */
export async function POST(request: NextRequest) {
  const b = await request.json().catch(() => null);
  const tipo: RegistroTec["tipo"] | null = b?.tipo === "incidencia" ? "incidencia" : b?.tipo === "resolucao" ? "resolucao" : null;
  const materia = typeof b?.materia_id === "string" && MATERIA_POR_ID.has(b.materia_id) ? b.materia_id : null;
  const linhas = Array.isArray(b?.linhas) ? b.linhas.slice(0, 300) : [];
  if (!tipo || !materia || !linhas.length) return NextResponse.json({ error: "Escolha o tipo, a matéria e cole ao menos uma linha" }, { status: 400 });
  const referencia = typeof b?.referencia === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.referencia) ? b.referencia : new Date().toISOString().slice(0, 10);
  const limpas: Omit<RegistroTec, "id">[] = [];
  for (const l of linhas) {
    const assunto = typeof l?.assunto === "string" ? l.assunto.trim().slice(0, 200) : "";
    const questoes = Number(l?.questoes);
    const acertos = l?.acertos === null || l?.acertos === undefined || l?.acertos === "" ? null : Number(l.acertos);
    if (!assunto || !Number.isInteger(questoes) || questoes < 0) return NextResponse.json({ error: `Linha inválida: ${assunto || "sem assunto"}` }, { status: 400 });
    if (acertos !== null && (!Number.isInteger(acertos) || acertos < 0 || acertos > questoes)) return NextResponse.json({ error: `Acertos inválidos em: ${assunto}` }, { status: 400 });
    limpas.push({ tipo, materia_id: materia, assunto, questoes, acertos: tipo === "incidencia" ? null : acertos, banca: "FCC", fonte: "TEC Concursos", referencia, nota: null });
  }
  try {
    await criarRegistrosTec(limpas);
    return NextResponse.json({ total: limpas.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível salvar" }, { status: 401 });
  }
}
