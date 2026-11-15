import { NextRequest, NextResponse } from "next/server";
import { createPomodoro } from "@/lib/db-estudos";
import { todayBelemDateString } from "@/lib/atividades-utils";

/** Grava um bloco de foco: só o tempo efetivo (sem as pausas). */
export async function POST(request: NextRequest) {
  const b = await request.json().catch(() => null);
  const minutos = Math.round(Number(b?.minutos_efetivos));
  const pausas = Math.round(Number(b?.pausas ?? 0));
  if (!Number.isFinite(minutos) || minutos < 1 || minutos > 600 || !Number.isFinite(pausas) || pausas < 0) {
    return NextResponse.json({ error: "Tempo inválido" }, { status: 400 });
  }
  try {
    const pomodoro = await createPomodoro({ data: todayBelemDateString(), minutos_efetivos: minutos, pausas: Math.min(pausas, 100) });
    return NextResponse.json({ pomodoro });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível salvar" }, { status: 401 });
  }
}
