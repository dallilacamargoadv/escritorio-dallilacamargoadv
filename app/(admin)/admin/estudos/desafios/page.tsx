import { redirect } from "next/navigation";
import { todayBelemDateString } from "@/lib/atividades-utils";
import { DESAFIOS, getEstadoDesafios } from "@/lib/db-estudos-desafios";
import { abrir, DESAFIOS_POR_DIA, escolherRodada, recorde, sequencia, type EstadoDesafios } from "@/lib/estudos-desafios";
import { MATERIA_POR_ID } from "@/lib/estudos-utils";
import { Cabecalho } from "@/components/estudos/ui";
import { DesafiosClient } from "@/components/estudos/DesafiosClient";
import { AlertaRevisao } from "@/components/estudos/AlertaRevisao";
import { HojeDesafios } from "@/components/estudos/HojeDesafios";

export default async function DesafiosPage(props: PageProps<"/admin/estudos/desafios">) {
  const sp = await props.searchParams;
  const materia = typeof sp.materia === "string" ? sp.materia : "";
  const rodada = typeof sp.r === "string" ? Math.max(0, Math.min(99, Number(sp.r) || 0)) : 0;
  const hoje = todayBelemDateString();
  let estado: EstadoDesafios;
  try {
    estado = await getEstadoDesafios();
  } catch {
    redirect("/login");
  }

  const ids = [...new Set(DESAFIOS.map((d) => d.materia_id))];
  const materias = ids.map((id) => ({ id, nome: MATERIA_POR_ID.get(id)?.nome ?? id }));
  const lista = escolherRodada(DESAFIOS, estado, `${hoje}#${rodada}#${materia}`, materia || undefined);
  const dia = estado.dias[hoje] ?? { acertos: 0, total: 0 };

  return (
    <>
      <Cabecalho
        titulo="Desafios"
        sub={`Lei seca do jeito que a FCC cobra: complete a lacuna do artigo literal ou ache a troca de palavra (pode/deve, prazo, competência). ${DESAFIOS_POR_DIA} por dia mantêm a sequência.`}
      />
      <AlertaRevisao />
      <HojeDesafios hoje={hoje} />
      <h2 className="mb-3 text-sm font-medium uppercase tracking-[0.12em] text-e-dim">Rodada rápida: 10 por dia</h2>
      <DesafiosClient
        key={`${rodada}-${materia}`}
        desafios={lista.map(abrir)}
        materias={materias}
        materia={materia}
        rodada={rodada}
        hojeFeitos={dia.total}
        hojeAcertos={dia.acertos}
        sequencia={sequencia(estado, hoje)}
        recorde={recorde(estado)}
        total={DESAFIOS.length}
        vistos={Object.keys(estado.vistos).length}
      />
    </>
  );
}
