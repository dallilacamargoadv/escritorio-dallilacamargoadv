import Link from "next/link";
import { BookOpenText, Calculator, PenLine, Scale } from "lucide-react";
import { getCronograma, getRespostas, QUESTAO_POR_ID, QUESTOES } from "@/lib/db-estudos";
import { getEstadoTrilhas, TRILHAS } from "@/lib/db-estudos-trilhas";
import { CASOS, getEstadoRedacao, TEMAS } from "@/lib/db-estudos-redacao";
import { AULA_POR_ID, getAulasEstudadas } from "@/lib/db-estudos-cadernos";
import { escolherDiscursiva } from "@/lib/estudos-redacao";
import { temasDaSemana } from "@/lib/estudos-simulados";
import { dataBelem } from "@/lib/estudos-revisao";
import { addDaysToDateString } from "@/lib/atividades-utils";
import {
  AGENDA_SEMANA,
  DIAS_SEMANA,
  diaDaSemana,
  rodizioSemanal,
  ROTULO_SEMANAL,
  rotuloTema,
  semanaDe,
  temaAtual,
  temasFeitos,
  type TipoSemanal,
} from "@/lib/estudos-trilhas";
import { MATERIA_POR_ID } from "@/lib/estudos-utils";
import { Barra, BOTAO_PRIMARIO, Card, CardTitulo } from "@/components/estudos/ui";
import { MarcarSemanal } from "@/components/estudos/MarcarSemanal";

const ICONE: Record<TipoSemanal, typeof Calculator> = { rlm: Calculator, redacao: PenLine, discursiva: Scale };

/** Bloco "Hoje" dos Desafios: lei seca do tema em curso das matérias do cronograma e desafio da semana. */
export async function HojeDesafios({ hoje }: { hoje: string }) {
  const [blocos, estado, redacao, respostas, aulas] = await Promise.all([getCronograma(hoje, hoje), getEstadoTrilhas(), getEstadoRedacao(), getRespostas(), getAulasEstudadas()]);
  const materiasHoje = [...new Set(blocos.map((b) => b.materia_id))];
  const comTrilha = [...new Set(TRILHAS.map((t) => t.materia_id))];
  let doDia = materiasHoje.filter((m) => comTrilha.includes(m));
  const semCronograma = doDia.length === 0;
  if (semCronograma) doDia = comTrilha.filter((m) => TRILHAS.some((t) => t.materia_id === m && temaAtual(t, estado))).slice(0, 1);

  const dow = diaDaSemana(hoje);
  const tipos = AGENDA_SEMANA[dow] ?? [];
  const feitosHoje = redacao.feitos[hoje] ?? [];
  const respondidas = new Set(respostas.map((r) => r.questao_id));
  const rlmLivres = QUESTOES.filter((q) => q.materia_id === "A2" && !respondidas.has(q.id)).length;
  const tema = TEMAS[rodizioSemanal(hoje, TEMAS.length, true)];
  // Discursiva: só dos temas que ela estudou nos últimos 7 dias.
  const desde = addDaysToDateString(hoje, -6);
  const topicosSemana = new Set<string>();
  for (const [id, em] of aulas) {
    const t = AULA_POR_ID.get(id)?.aula.topico_id;
    if (t && em && dataBelem(em) >= desde) topicosSemana.add(t);
  }
  const caso = escolherDiscursiva(CASOS, topicosSemana, temasDaSemana(respostas, QUESTAO_POR_ID, desde), redacao.casos);
  const semana = semanaDe(hoje);

  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-2">
      <Card destaque>
        <CardTitulo acao={<BookOpenText size={16} aria-hidden="true" />}>Leitura de lei seca de hoje</CardTitulo>
        {semCronograma && <p className="mb-2 text-xs text-e-dim">Nenhuma matéria do cronograma de hoje tem lei seca por tema ainda. Sugestão:</p>}
        <div className="flex flex-col gap-3">
          {doDia.map((m) => {
            const t = TRILHAS.find((x) => x.materia_id === m)!;
            const x = temaAtual(t, estado);
            if (!x) return <p key={m} className="text-sm text-e-ok">{MATERIA_POR_ID.get(m)?.nome}: todos os temas prontos foram concluídos.</p>;
            return (
              <div key={m}>
                <p className="text-sm text-e-ink">
                  <span className="text-e-dim">{MATERIA_POR_ID.get(m)?.nome}:</span> tema {x.ordem} de {t.temas.length}
                </p>
                <p className="font-serif text-lg text-e-ink">{x.nome}</p>
                <p className="text-xs text-e-dim">Leia {rotuloTema(x)} e depois {x.itens.length} de certo ou errado.</p>
                <div className="my-2">
                  <Barra pct={(temasFeitos(t, estado) / t.temas.length) * 100} tom="accent" />
                </div>
                <Link href={`/admin/estudos/desafios/trilha/${x.id}`} className={BOTAO_PRIMARIO}>
                  Começar
                </Link>
              </div>
            );
          })}
        </div>
        <Link href="/admin/estudos/desafios/trilha" className="mt-3 inline-block text-xs text-e-dim underline">
          Ver todos os temas
        </Link>
      </Card>

      <Card>
        <CardTitulo>Desafio da semana</CardTitulo>
        <div className="mb-3 flex flex-wrap gap-1">
          {semana.map((d) => {
            const ts = AGENDA_SEMANA[diaDaSemana(d)] ?? [];
            const feito = ts.length > 0 && ts.every((t) => (redacao.feitos[d] ?? []).includes(t));
            const nome = (t: TipoSemanal) => (t === "rlm" ? "RLM" : t === "redacao" ? "Redação" : "Discursiva");
            return (
              <span
                key={d}
                className={`rounded-lg border px-2 py-1 text-[11px] ${d === hoje ? "border-e-accent text-e-ink" : "border-e-line text-e-dim"} ${feito ? "bg-e-ok-soft" : ""}`}
                title={ts.map((t) => ROTULO_SEMANAL[t]).join(" + ") || "Só revisão e as 2 matérias"}
              >
                {DIAS_SEMANA[diaDaSemana(d)]}{ts.length ? ` · ${ts.map(nome).join(" + ")}` : ""}
              </span>
            );
          })}
        </div>
        {tipos.length ? (
          <div className="flex flex-col gap-4">
            {tipos.map((tipo) => {
              const I = ICONE[tipo];
              const href =
                tipo === "rlm"
                  ? `/admin/estudos/questoes?materia=A2&status=${rlmLivres ? "nao_respondidas" : "erradas"}`
                  : tipo === "redacao"
                    ? `/admin/estudos/redacao/${tema.id}`
                    : caso ? `/admin/estudos/redacao/discursiva/${caso.id}` : "/admin/estudos/redacao";
              return (
                <div key={tipo}>
                  <p className="flex items-center gap-2 text-sm font-medium text-e-ink">
                    <I size={15} aria-hidden="true" /> Hoje: {ROTULO_SEMANAL[tipo]}
                  </p>
                  {tipo === "rlm" && (
                    <p className="mt-1 text-sm text-e-dim">Um tema por vez, no tempo de prova (3 min cada). Restam {rlmLivres} inéditas no banco; quando acabarem, a gente expande.</p>
                  )}
                  {tipo === "redacao" && (
                    <p className="mt-1 text-sm text-e-dim">
                      Tema da semana: {tema.tema}. {dow === 6 ? "Hoje: reescrever a partir da autocorreção." : "Hoje: recorte, tese, argumentos e o texto."}
                    </p>
                  )}
                  {tipo === "discursiva" && (
                    <p className="mt-1 text-sm text-e-dim">
                      {caso
                        ? `Caso dos temas que você estudou nesta semana: ${caso.titulo} (${MATERIA_POR_ID.get(caso.materia_id)?.nome}). Faça dentro do tempo da matéria.`
                        : "Ainda não há caso pronto dos temas desta semana. Marque as aulas como estudadas no caderno e responda as questões do tema; quando faltar caso, a gente escreve um novo."}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Link href={href} className={BOTAO_PRIMARIO}>
                      Fazer agora
                    </Link>
                    <MarcarSemanal tipo={tipo} feito={feitosHoje.includes(tipo)} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-e-dim">Hoje sem desafio extra: revisão e as 2 matérias do dia.</p>
        )}
      </Card>
    </div>
  );
}
