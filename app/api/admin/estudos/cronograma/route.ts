import { NextResponse } from "next/server";
import { getEstudoConfig, getTopicoEstados, substituirCronograma } from "@/lib/db-estudos";
import { gerarCronograma, previsaoFimTeoria } from "@/lib/estudos-utils";
import { todayBelemDateString } from "@/lib/atividades-utils";
import { CADERNOS, getAulasEstudadas } from "@/lib/db-estudos-cadernos";

/** Gera (ou refaz) o cronograma a partir de hoje com a configuração e o andamento atuais. */
export async function POST() {
  try {
    const [config, estados, estudadas] = await Promise.all([getEstudoConfig(), getTopicoEstados(), getAulasEstudadas()]);
    // aulas dos cadernos ainda não estudadas, por tópico, na ordem do caderno
    const pendentes = new Map<string, string[]>();
    for (const c of Object.values(CADERNOS)) {
      for (const a of c.aulas) {
        if (!a.topico_id || estudadas.has(a.id)) continue;
        pendentes.set(a.topico_id, [...(pendentes.get(a.topico_id) ?? []), a.titulo]);
      }
    }
    const itens = gerarCronograma(todayBelemDateString(), config, estados, pendentes);
    const total = await substituirCronograma(itens);
    return NextResponse.json({ total, fimTeoria: previsaoFimTeoria(itens) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível gerar o cronograma" }, { status: 401 });
  }
}
