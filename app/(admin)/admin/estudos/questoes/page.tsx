import { redirect } from "next/navigation";
import { getRespostas, QUESTOES, QUESTAO_POR_ID } from "@/lib/db-estudos";
import { MATERIA_POR_ID } from "@/lib/estudos-utils";
import { Cabecalho } from "@/components/estudos/ui";
import { QuestaoClient } from "@/components/estudos/QuestaoClient";

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
  const status: Status = s("status") === "nao_respondidas" || s("status") === "erradas" ? (s("status") as Status) : "todas";

  const ultima = new Map<string, (typeof respostas)[number]>();
  for (const r of respostas) ultima.set(r.questao_id, r);
  const erradaAlgumaVez = new Set(respostas.filter((r) => !r.correta || r.classificacao === "chute" || r.classificacao === "duvida").map((r) => r.questao_id));

  const daMateria = QUESTOES.filter((q) => !materia || q.materia_id === materia);
  const lista = daMateria.filter((q) => {
    if (tema && q.tema !== tema) return false;
    if (status === "nao_respondidas") return !ultima.has(q.id);
    if (status === "erradas") return erradaAlgumaVez.has(q.id);
    return true;
  });

  const pedida = s("id");
  const atual = (pedida && lista.find((q) => q.id === pedida)) || lista.find((q) => !ultima.has(q.id)) || lista[0] || null;
  const materias = [...new Set(QUESTOES.map((q) => q.materia_id))].map((id) => ({
    id,
    nome: MATERIA_POR_ID.get(id)?.nome ?? id,
    total: QUESTOES.filter((q) => q.materia_id === id).length,
  }));
  const temas = [...new Set(daMateria.map((q) => q.tema))].sort((a, b) => a.localeCompare(b, "pt-BR"));
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
        ids={lista.map((q) => q.id)}
        filtros={{ materia, tema, status }}
        materias={materias}
        temas={temas}
        historico={historico}
      />
    </>
  );
}
