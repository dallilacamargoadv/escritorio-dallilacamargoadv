import { NextRequest, NextResponse } from "next/server";
import { createPomodoro, getPomodoros } from "@/lib/db-estudos";
import { todayBelemDateString } from "@/lib/atividades-utils";

const ATIVIDADES = ["material", "lei_seca", "questoes", "flashcards", "revisao"];

/** Total de hoje, em minutos, por atividade (pomodoros antigos entram como "foco"). */
export async function GET() {
  try {
    const hoje = todayBelemDateString();
    const lista = (await getPomodoros(hoje)).filter((p) => p.data === hoje);
    const totais: Record<string, number> = {};
    for (const p of lista) {
      const k = p.atividade ?? "foco";
      totais[k] = (totais[k] ?? 0) + p.minutos_efetivos;
    }
    return NextResponse.json({ data: hoje, totais });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
}

/** Grava um bloco de estudo: só o tempo efetivo (sem as pausas). */
export async function POST(request: NextRequest) {
  const b = await request.json().catch(() => null);
  const minutos = Math.round(Number(b?.minutos_efetivos));
  const pausas = Math.round(Number(b?.pausas ?? 0));
  const atividade = typeof b?.atividade === "string" && ATIVIDADES.includes(b.atividade) ? b.atividade : null;
  if (!Number.isFinite(minutos) || minutos < 1 || minutos > 600 || !Number.isFinite(pausas) || pausas < 0) {
    return NextResponse.json({ error: "Tempo inválido" }, { status: 400 });
  }
  try {
    const pomodoro = await createPomodoro({ data: todayBelemDateString(), minutos_efetivos: minutos, pausas: Math.min(pausas, 100), atividade });
    return NextResponse.json({ pomodoro });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível salvar" }, { status: 401 });
  }
}
