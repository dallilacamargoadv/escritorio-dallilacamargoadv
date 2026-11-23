import { NextRequest, NextResponse } from "next/server";
import { criarSimulado, registrarExterno } from "@/lib/db-estudos-simulados";
import { MATERIA_POR_ID } from "@/lib/estudos-utils";
import { PROVA_TOTAL, type ModoProva } from "@/lib/estudos-simulados";

/** acao "criar" (simulado no site) ou "externo" (nota de simulado feito fora, ex.: TEC). */
export async function POST(request: NextRequest) {
  const b = await request.json().catch(() => null);
  const materia = typeof b?.materia_id === "string" && MATERIA_POR_ID.has(b.materia_id) ? (b.materia_id as string) : null;
  try {
    if (b?.acao === "criar") {
      const tipo = ["lei_seca", "completo", "direito", "semana"].includes(b.tipo) ? (b.tipo as "lei_seca" | ModoProva | "semana") : null;
      const total = tipo === "completo" || tipo === "direito" ? PROVA_TOTAL[tipo] : Number(b.total);
      if (!tipo || !Number.isInteger(total) || total < 5 || total > 120) return NextResponse.json({ error: "Escolha o tipo e o tamanho" }, { status: 400 });
      if (tipo === "lei_seca" && !materia) return NextResponse.json({ error: "Escolha a matéria" }, { status: 400 });
      const simulado = await criarSimulado(tipo, total, materia);
      return NextResponse.json({ id: simulado.id });
    }
    if (b?.acao === "externo") {
      const tipo = b.tipo === "lei_seca" || b.tipo === "simuladao" ? b.tipo : "outro";
      const total = Number(b.total);
      const acertos = Number(b.acertos);
      if (!Number.isInteger(total) || total < 1 || total > 500) return NextResponse.json({ error: "Informe o número de questões" }, { status: 400 });
      if (!Number.isInteger(acertos) || acertos < 0 || acertos > total) return NextResponse.json({ error: "Acertos inválidos" }, { status: 400 });
      const data = typeof b.data === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.data) ? b.data : null;
      if (!data) return NextResponse.json({ error: "Informe a data" }, { status: 400 });
      const min = Number(b.minutos);
      const simulado = await registrarExterno({
        tipo,
        materia_id: materia,
        data,
        total,
        acertos,
        duracao_seg: Number.isFinite(min) && min > 0 ? Math.round(Math.min(min, 600) * 60) : null,
        fonte: typeof b.fonte === "string" && b.fonte.trim() ? b.fonte.trim().slice(0, 80) : "TEC Concursos",
        nota: typeof b.nota === "string" && b.nota.trim() ? b.nota.trim().slice(0, 1000) : null,
      });
      return NextResponse.json({ id: simulado.id });
    }
    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível salvar" }, { status: 401 });
  }
}
