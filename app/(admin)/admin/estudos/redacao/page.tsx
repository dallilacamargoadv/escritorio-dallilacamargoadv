import Link from "next/link";
import { redirect } from "next/navigation";
import { PenLine, Scale, Scissors } from "lucide-react";
import { CASOS, getEstadoRedacao, TEMAS } from "@/lib/db-estudos-redacao";
import { casoDaSemana, notaDiscursiva, notaGrade } from "@/lib/estudos-redacao";
import { AULA_POR_ID, getAulasEstudadas } from "@/lib/db-estudos-cadernos";
import { getRespostas, QUESTAO_POR_ID } from "@/lib/db-estudos";
import { temasDaSemana } from "@/lib/estudos-simulados";
import { dataBelem } from "@/lib/estudos-revisao";
import { addDaysToDateString, todayBelemDateString } from "@/lib/atividades-utils";
import { MATERIA_POR_ID } from "@/lib/estudos-utils";
import { BOTAO_PRIMARIO, Cabecalho, Card, CardTitulo } from "@/components/estudos/ui";

export default async function RedacaoPage() {
  let estado, aulas, respostas;
  try {
    [estado, aulas, respostas] = await Promise.all([getEstadoRedacao(), getAulasEstudadas(), getRespostas()]);
  } catch {
    redirect("/login");
  }
  const desde = addDaysToDateString(todayBelemDateString(), -6);
  const topicos = new Set<string>();
  for (const [id, em] of aulas) {
    const t = AULA_POR_ID.get(id)?.aula.topico_id;
    if (t && em && dataBelem(em) >= desde) topicos.add(t);
  }
  const temas = temasDaSemana(respostas, QUESTAO_POR_ID, desde);
  const casos = [...CASOS].sort((a, b) => Number(casoDaSemana(b, topicos, temas)) - Number(casoDaSemana(a, topicos, temas)));
  const eixos = [...new Set(TEMAS.map((t) => t.eixo))];
  return (
    <>
      <Cabecalho
        titulo="Redação e discursivas"
        sub="Antes da primeira linha: ler o tema e achar os limites. Recorte (eixo, assunto, tema), palavra de comando, checagem de tangenciamento e autocorreção. Redação às quintas e sábados (o mesmo tema na semana). Discursiva às quartas e sábados, sempre de um tema que você estudou na semana."
      />

      <Card destaque className="mb-4">
        <CardTitulo acao={<Scissors size={16} aria-hidden="true" />}>Recortador de tema</CardTitulo>
        <p className="text-sm text-e-dim">
          Caiu um tema novo (de prova, do curso, de outro site)? Cole aqui, marque eixo, assunto, tema e a palavra de comando, escreva e rode a checagem de tangenciamento.
        </p>
        <Link href="/admin/estudos/redacao/livre" className={`mt-3 ${BOTAO_PRIMARIO}`}>
          Recortar um tema meu
        </Link>
      </Card>

      <h2 className="mb-3 flex items-center gap-2 text-sm font-medium uppercase tracking-[0.12em] text-e-dim">
        <PenLine size={14} aria-hidden="true" /> Banco de temas comentados
      </h2>
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        {eixos.map((eixo) => (
          <Card key={eixo}>
            <CardTitulo>{eixo}</CardTitulo>
            <ul className="flex flex-col gap-2">
              {TEMAS.filter((t) => t.eixo === eixo).map((t) => {
                const s = estado.temas[t.id];
                return (
                  <li key={t.id}>
                    <Link href={`/admin/estudos/redacao/${t.id}`} className="group block rounded-lg px-2 py-1.5 hover:bg-e-card-2">
                      <span className="text-sm text-e-ink group-hover:underline">{t.tema}</span>
                      <span className="block text-[11px] text-e-dim">
                        {t.assunto}
                        {s?.grade ? ` · nota estimada ${notaGrade(s.grade)}/100` : s?.texto ? " · rascunho salvo" : ""}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>
        ))}
      </div>

      <h2 className="mb-3 flex items-center gap-2 text-sm font-medium uppercase tracking-[0.12em] text-e-dim">
        <Scale size={14} aria-hidden="true" /> Discursivas de caso concreto
      </h2>
      <Card>
        <ul className="flex flex-col gap-2">
          {casos.map((c) => {
            const s = estado.casos[c.id];
            const daSemana = casoDaSemana(c, topicos, temas);
            const n = s ? notaDiscursiva(c, s.pontos) : null;
            return (
              <li key={c.id}>
                <Link href={`/admin/estudos/redacao/discursiva/${c.id}`} className="group block rounded-lg px-2 py-1.5 hover:bg-e-card-2">
                  <span className="text-sm text-e-ink group-hover:underline">{c.titulo}</span>
                  {daSemana && <span className="ml-2 rounded bg-e-ok-soft px-1.5 py-0.5 text-[10px] uppercase text-e-ok">da sua semana</span>}
                  <span className="block text-[11px] text-e-dim">
                    {MATERIA_POR_ID.get(c.materia_id)?.nome} · {c.linhas_min ? `${c.linhas_min} a ${c.linhas}` : `até ${c.linhas}`} linhas
                    {n && Object.keys(s!.pontos).length ? ` · ${n.nota.toLocaleString("pt-BR")}/${n.max} no espelho` : s?.texto ? " · rascunho salvo" : ""}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-[11px] text-e-dim">Espelhos montados só com a lei seca conferida. Jurisprudência entra quando houver fonte.</p>
      </Card>
    </>
  );
}
