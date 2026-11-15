import { NextResponse } from "next/server";
import { getEstudoConfig, getTopicoEstados, substituirCronograma } from "@/lib/db-estudos";
import { gerarCronograma, previsaoFimTeoria } from "@/lib/estudos-utils";
import { todayBelemDateString } from "@/lib/atividades-utils";

/** Gera (ou refaz) o cronograma a partir de hoje com a configuração e o andamento atuais. */
export async function POST() {
  try {
    const [config, estados] = await Promise.all([getEstudoConfig(), getTopicoEstados()]);
    const itens = gerarCronograma(todayBelemDateString(), config, estados);
    const total = await substituirCronograma(itens);
    return NextResponse.json({ total, fimTeoria: previsaoFimTeoria(itens) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível gerar o cronograma" }, { status: 401 });
  }
}
