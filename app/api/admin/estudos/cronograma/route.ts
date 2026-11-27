import { NextResponse } from "next/server";
import { getEstudoConfig, getRespostas, getTopicoEstados, substituirCronograma } from "@/lib/db-estudos";
import { BATERIAS, gerarCronograma, previsaoFimTeoria, type BateriaPendente } from "@/lib/estudos-utils";
import { todayBelemDateString } from "@/lib/atividades-utils";
import { CADERNOS, getAulasEstudadas } from "@/lib/db-estudos-cadernos";

/** Gera (ou refaz) o cronograma a partir de hoje com a configuração e o andamento atuais. */
export async function POST() {
  try {
    const [config, estados, estudadas, respostas] = await Promise.all([getEstudoConfig(), getTopicoEstados(), getAulasEstudadas(), getRespostas()]);
    // baterias: questões distintas acertadas com segurança (sem chute nem dúvida)
    const baterias = new Map<string, BateriaPendente>();
    for (const [aulaId, b] of Object.entries(BATERIAS)) {
      const certas = new Set(
        respostas
          .filter((r) => r.questao_id.startsWith(b.prefixo) && r.correta && r.classificacao !== "chute" && r.classificacao !== "duvida")
          .map((r) => r.questao_id),
      ).size;
      if (certas < b.total) baterias.set(aulaId, { tema: b.tema, certas, total: b.total });
    }
    // aulas dos cadernos ainda não estudadas, por tópico, na ordem do caderno
    const pendentes = new Map<string, { id: string; titulo: string; pronta: boolean }[]>();
    for (const c of Object.values(CADERNOS)) {
      for (const a of c.aulas) {
        if (!a.topico_id || estudadas.has(a.id)) continue;
        pendentes.set(a.topico_id, [...(pendentes.get(a.topico_id) ?? []), { id: a.id, titulo: a.titulo, pronta: a.status === "pronta" }]);
      }
    }
    const itens = gerarCronograma(todayBelemDateString(), config, estados, pendentes, baterias);
    const total = await substituirCronograma(itens);
    return NextResponse.json({ total, fimTeoria: previsaoFimTeoria(itens) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível gerar o cronograma" }, { status: 401 });
  }
}
