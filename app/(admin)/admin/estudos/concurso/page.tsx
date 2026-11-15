import { redirect } from "next/navigation";
import { getEventos } from "@/lib/db-estudos";
import { todayBelemDateString } from "@/lib/atividades-utils";
import { Cabecalho } from "@/components/estudos/ui";
import { ConcursoClient } from "@/components/estudos/ConcursoClient";

export default async function ConcursoPage() {
  let eventos;
  try {
    eventos = await getEventos();
  } catch {
    redirect("/login");
  }
  return (
    <>
      <Cabecalho
        titulo="Calendário do concurso"
        sub="Cada fase com data, situação e link da fonte oficial. Nada aqui é inventado: sem fonte, fica como previsão ou sem data."
      />
      <ConcursoClient eventos={eventos} hoje={todayBelemDateString()} />
    </>
  );
}
