import { redirect } from "next/navigation";
import { getRespostas, QUESTOES, QUESTAO_POR_ID } from "@/lib/db-estudos";
import { MATERIA_POR_ID } from "@/lib/estudos-utils";
import type { Resposta } from "@/lib/estudos-desempenho";
import { agendaQuestoes, dataBelem, ehFalha } from "@/lib/estudos-revisao";
import { todayBelemDateString } from "@/lib/atividades-utils";
import { Cabecalho } from "@/components/estudos/ui";
import { QuestaoClient } from "@/components/estudos/QuestaoClient";
import type { Mapa } from "@/components/estudos/MapaDoTema";
import mapasJson from "@/content/estudos/mapas.json";
import { SUBTEMAS } from "@/lib/estudos-subtemas";

const MAPAS = mapasJson as Record<string, Mapa>;

type Status = "todas" | "nao_respondidas" | "erradas";

export default async function QuestoesPage(props: PageProps<"/admin/estudos/questoes">) {
  const sp = await props.searchParams;
  const s = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  let respostas;
  try {
    respostas = await getRespostas();
  } catch {
    redirect("/login");
  }
  const materia = s("materia");
  const tema = s("tema");
  const subtema = s("subtema");
  const status: Status = s("status") === "nao_respondidas" || s("status") === "erradas" ? (s("status") as Status) : "todas";

  const ultima = new Map<string, (typeof respostas)[number]>();
  for (const r of respostas) ultima.set(r.questao_id, r);
  const erradaAlgumaVez = new Set(respostas.filter((r) => !r.correta || r.classificacao === "chute" || r.classificacao === "duvida").map((r) => r.questao_id));

  const daMateria = QUESTOES.filter((q) => !materia || q.materia_id === materia);
  const lista = daMateria.filter((q) => {
    if (tema && q.tema !== tema) return false;
    if (subtema && q.subtema !== subtema) return false;
    if (status === "nao_respondidas") return !ultima.has(q.id);
    if (status === "erradas") return erradaAlgumaVez.has(q.id);
    return true;
  });

  const pedida = s("id");
  const atual = (pedida && lista.find((q) => q.id === pedida)) || lista.find((q) => !ultima.has(q.id)) || lista[0] || null;
  const revisao = s("revisao") === "1";
  const ids = revisao ? filaDaRevisao(respostas, atual?.id ?? null) : lista.map((q) => q.id);
  const materias = [...new Set(QUESTOES.map((q) => q.materia_id))].map((id) => ({
    id,
    nome: MATERIA_POR_ID.get(id)?.nome ?? id,
    total: QUESTOES.filter((q) => q.materia_id === id).length,
  }));
  const temas = [...new Set(daMateria.map((q) => q.tema))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const subtemas = [...new Set(daMateria.filter((q) => !tema || q.tema === tema).map((q) => q.subtema).filter((k): k is string => !!k && !!SUBTEMAS[k]))]
    .map((k) => ({ k, nome: SUBTEMAS[k].nome }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  const historico = atual ? respostas.filter((r) => r.questao_id === atual.id).slice(-5).reverse() : [];

  return (
    <>
      <Cabecalho
        titulo="Questões"
        sub={`${QUESTOES.length} questões no estilo FCC · ${new Set(respostas.map((r) => r.questao_id)).size} já respondidas. Cada resposta registra o tempo e o motivo do erro ou do acerto.`}
      />
      <QuestaoClient
        key={atual?.id ?? "vazio"}
        questao={atual ? QUESTAO_POR_ID.get(atual.id)! : null}
        ids={ids}
        filtros={{ materia, tema, subtema, status }}
        materias={materias}
        temas={temas}
        subtemas={subtemas}
        historico={historico}
        mapa={atual ? (MAPAS[`${atual.mat}|${atual.tema}`] ?? null) : null}
        revisao={revisao}
      />
    </>
  );
}

/**
 * Fila da revisão: as erradas que vencem hoje mais os erros do último dia de estudo ainda não refeitos hoje.
 * A matéria da questão aberta vem primeiro, para dar para zerar uma matéria de uma vez.
 */
function filaDaRevisao(respostas: Resposta[], atual: string | null): string[] {
  const hoje = todayBelemDateString();
  const feitasHoje = new Set(respostas.filter((r) => dataBelem(r.respondida_em) === hoje).map((r) => r.questao_id));
  const vencidas = agendaQuestoes(respostas, QUESTAO_POR_ID)
    .filter((q) => q.vence_em <= hoje)
    .sort((a, b) => a.vence_em.localeCompare(b.vence_em))
    .map((q) => q.id);
  const dia = respostas.map((r) => dataBelem(r.respondida_em)).filter((d) => d < hoje).sort().at(-1);
  const deOntem = respostas.filter((r) => dataBelem(r.respondida_em) === dia && ehFalha(r)).map((r) => r.questao_id);
  const fila = [...new Set([...vencidas, ...deOntem])].filter((id) => QUESTAO_POR_ID.has(id) && (id === atual || !feitasHoje.has(id)));
  if (atual && !fila.includes(atual)) fila.unshift(atual);
  const materia = atual ? QUESTAO_POR_ID.get(atual)?.materia_id : undefined;
  return [...fila.filter((id) => QUESTAO_POR_ID.get(id)?.materia_id === materia), ...fila.filter((id) => QUESTAO_POR_ID.get(id)?.materia_id !== materia)];
}
