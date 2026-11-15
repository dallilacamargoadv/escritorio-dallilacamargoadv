import { redirect } from "next/navigation";
import { getRespostas, QUESTAO_POR_ID, QUESTOES } from "@/lib/db-estudos";
import { getSimulado, getSimulados } from "@/lib/db-estudos-simulados";
import {
  distribuicaoSimuladao,
  evolucaoSemanal,
  poolLeiSeca,
  semGabarito,
  TAMANHOS_SIMULADAO,
  TIPO_LABEL,
} from "@/lib/estudos-simulados";
import { MATERIA_POR_ID } from "@/lib/estudos-utils";
import { todayBelemDateString } from "@/lib/atividades-utils";
import { Cabecalho } from "@/components/estudos/ui";
import { SimuladosClient } from "@/components/estudos/SimuladosClient";
import { SimuladoProva } from "@/components/estudos/SimuladoProva";
import { SimuladoRelatorio } from "@/components/estudos/SimuladoRelatorio";

export default async function SimuladosPage(props: PageProps<"/admin/estudos/simulados">) {
  const sp = await props.searchParams;
  const id = typeof sp.id === "string" ? sp.id : "";

  if (id) {
    let sim;
    try {
      sim = await getSimulado(id);
    } catch {
      redirect("/login");
    }
    if (!sim || sim.origem !== "site") redirect("/admin/estudos/simulados");
    const titulo = `${TIPO_LABEL[sim.tipo]}${sim.materia_id ? ` · ${MATERIA_POR_ID.get(sim.materia_id)?.nome ?? ""}` : ""}`;
    if (sim.status === "em_andamento") {
      return (
        <>
          <Cabecalho titulo={titulo} sub={`${sim.total} questões. O gabarito só aparece quando você entregar.`} />
          <SimuladoProva
            id={sim.id}
            questoes={sim.questoes.map((q) => semGabarito(QUESTAO_POR_ID.get(q)!))}
            limiteSeg={sim.limite_seg ?? sim.total * 180}
          />
        </>
      );
    }
    return (
      <>
        <Cabecalho titulo={`Relatório · ${titulo}`} sub="Confira o motivo de cada erro e de cada acerto. Os erros já entraram na Revisão." />
        <SimuladoRelatorio
          simulado={sim}
          questoes={sim.itens.map((i) => {
            const q = QUESTAO_POR_ID.get(i.questao_id)!;
            return { ...q, materia: MATERIA_POR_ID.get(q.materia_id)?.nome ?? q.mat };
          })}
        />
      </>
    );
  }

  let respostas, simulados;
  try {
    [respostas, simulados] = await Promise.all([getRespostas(), getSimulados()]);
  } catch {
    redirect("/login");
  }
  const vistas = new Set(respostas.map((r) => r.questao_id));
  const materias = [...new Set(QUESTOES.map((q) => q.materia_id))]
    .map((mid) => {
      const pool = poolLeiSeca(QUESTOES, mid);
      return { id: mid, nome: MATERIA_POR_ID.get(mid)?.nome ?? mid, total: pool.length, ineditas: pool.filter((q) => !vistas.has(q.id)).length };
    })
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  const distribuicoes = Object.fromEntries(
    TAMANHOS_SIMULADAO.map((n) => [
      n,
      distribuicaoSimuladao(QUESTOES, n).map((d) => ({
        ...d,
        ineditas: QUESTOES.filter((q) => q.materia_id === d.materia_id && !vistas.has(q.id)).length,
      })),
    ]),
  );

  return (
    <>
      <Cabecalho
        titulo="Simulados"
        sub="Quarta: lei seca de uma matéria. Domingo: simuladão misto, proporcional ao edital. Cronômetro corre do início ao fim e o gabarito só aparece ao entregar."
      />
      <SimuladosClient
        hoje={todayBelemDateString()}
        totalBanco={QUESTOES.length}
        ineditas={QUESTOES.filter((q) => !vistas.has(q.id)).length}
        materias={materias}
        distribuicoes={distribuicoes}
        simulados={simulados.map((s) => ({ ...s, itens: [], questoes: [] }))}
        evolucao={evolucaoSemanal(simulados)}
        todasMaterias={[...MATERIA_POR_ID.values()].map((m) => ({ id: m.id, nome: m.nome }))}
      />
    </>
  );
}
