import { redirect } from "next/navigation";
import { getEstadoVerbos } from "@/lib/db-estudos-verbos";
import { todayBelemDateString } from "@/lib/atividades-utils";
import { Cabecalho } from "@/components/estudos/ui";
import { VerbosClient } from "@/components/estudos/VerbosClient";

export default async function VerbosPage() {
  let estado;
  try {
    estado = await getEstadoVerbos();
  } catch {
    redirect("/login");
  }
  return (
    <>
      <Cabecalho titulo="Treino de verbos" sub="Regulares e irregulares em rodadas curtas, com correção na hora. Cada resposta diz qual pessoa e qual tempo é, e como se monta. Seus erros voltam até você acertar duas vezes." />
      <VerbosClient inicial={estado} hoje={todayBelemDateString()} />
    </>
  );
}
