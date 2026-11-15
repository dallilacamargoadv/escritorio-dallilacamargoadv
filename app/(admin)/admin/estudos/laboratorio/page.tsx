import Link from "next/link";
import { redirect } from "next/navigation";
import { getLabConfig, getRespostas, QUESTOES, QUESTAO_POR_ID } from "@/lib/db-estudos";
import { AULA_POR_ID, getAulasEstudadas } from "@/lib/db-estudos-cadernos";
import { CLASSIFICACAO_LABEL, type Resposta } from "@/lib/estudos-desempenho";
import { arvoreDominio, contagemTipos, errosDoLaboratorio, niveis, NIVEL_COR, resumoParaTutor } from "@/lib/estudos-laboratorio";
import { MATERIA_POR_ID } from "@/lib/estudos-utils";
import { BOTAO_SECUNDARIO, Cabecalho, Card, CardTitulo, Kpi } from "@/components/estudos/ui";
import { ArvoreDominio, AjustarNiveis, CopiarResumo } from "@/components/estudos/LaboratorioClient";

const PERIODOS = [
  { k: "45", t: "Últimos 45 dias", dias: 45 },
  { k: "90", t: "Últimos 90 dias", dias: 90 },
  { k: "tudo", t: "Todo o histórico", dias: null },
] as const;

function agoraMs() {
  return Date.now();
}
const dataBR = (iso: string) => iso.slice(0, 10).split("-").reverse().join("/");

export default async function LaboratorioPage(props: PageProps<"/admin/estudos/laboratorio">) {
  const sp = await props.searchParams;
  const s = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  let respostas: Resposta[], config, aulas;
  try {
    [respostas, config, aulas] = await Promise.all([getRespostas(), getLabConfig(), getAulasEstudadas()]);
  } catch {
    redirect("/login");
  }
  const periodo = PERIODOS.find((p) => p.k === s("periodo")) ?? PERIODOS[0];
  const materia = MATERIA_POR_ID.has(s("materia")) ? s("materia") : "";
  const agora = agoraMs();
  const limite = periodo.dias ? agora - periodo.dias * 86400000 : 0;

  const daMateria = respostas.filter((r) => !materia || r.materia_id === materia);
  const noPeriodo = daMateria.filter((r) => Date.parse(r.respondida_em) >= limite);
  const ativasNoPeriodo = new Set(noPeriodo.map((r) => r.questao_id));
  // histórico completo das questões tocadas no período (o nível depende de toda a sequência)
  const porQuestao = new Map<string, Resposta[]>();
  for (const r of daMateria) {
    if (!ativasNoPeriodo.has(r.questao_id)) continue;
    porQuestao.set(r.questao_id, [...(porQuestao.get(r.questao_id) ?? []), r]);
  }

  const erros = errosDoLaboratorio(porQuestao, QUESTAO_POR_ID, config);
  const errosPorId = new Map(erros.map((e) => [e.questao_id, e]));
  const ativos = erros.filter((e) => !e.superado);
  const reincidentes = ativos.filter((e) => e.reincidente).sort((a, b) => b.falhas - a.falhas || b.ultimaFalha.localeCompare(a.ultimaFalha));
  const superados = erros.filter((e) => e.superado).sort((a, b) => b.ultimaFalha.localeCompare(a.ultimaFalha));
  const tempos = superados.map((e) => e.diasAteCorrigir).filter((d): d is number => d !== null);
  const tempoMedio = tempos.length ? Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length) : null;
  const tipos = contagemTipos(noPeriodo);
  const maxTipo = Math.max(1, ...tipos.map((t) => t.n));

  const materiasComAula = new Set([...aulas.keys()].map((id) => AULA_POR_ID.get(id)?.caderno.materia_id).filter((x): x is string => !!x));
  const arvore = arvoreDominio(
    porQuestao,
    QUESTOES.filter((q) => !materia || q.materia_id === materia),
    errosPorId,
    materia ? new Set([...materiasComAula].filter((m) => m === materia)) : materiasComAula,
    config,
  );
  const listaNiveis = niveis(config);
  const resumo = resumoParaTutor({
    periodo: periodo.t.toLowerCase(),
    materia: materia ? MATERIA_POR_ID.get(materia)?.nome ?? materia : null,
    erros,
    tipos,
    questoes: QUESTAO_POR_ID,
  });
  const materiasComResposta = [...new Set(respostas.map((r) => r.materia_id))];
  const refazer = (qid: string, mid: string) => `/admin/estudos/questoes?materia=${mid}&status=erradas&id=${encodeURIComponent(qid)}`;
  const linkFiltro = (p: { periodo?: string; materia?: string }) => {
    const q = new URLSearchParams();
    const per = p.periodo ?? periodo.k;
    const mat = p.materia ?? materia;
    if (per !== "45") q.set("periodo", per);
    if (mat) q.set("materia", mat);
    const str = q.toString();
    return `/admin/estudos/laboratorio${str ? `?${str}` : ""}`;
  };

  return (
    <>
      <Cabecalho
        titulo="Laboratório de erros"
        sub="Onde você erra, por que erra, o que volta a errar e o que já corrigiu. Acerto no chute ou com dúvida conta como erro aqui."
      />

      <nav aria-label="Filtros" className="mb-5 flex flex-wrap gap-2 text-xs">
        {PERIODOS.map((p) => (
          <Link key={p.k} href={linkFiltro({ periodo: p.k })} className={`rounded-full border px-3 py-1.5 ${p.k === periodo.k ? "border-e-accent bg-e-accent-soft text-e-ink" : "border-e-line text-e-dim hover:text-e-ink"}`}>
            {p.t}
          </Link>
        ))}
        <span className="mx-1 w-px bg-e-line" aria-hidden="true" />
        <Link href={linkFiltro({ materia: "" })} className={`rounded-full border px-3 py-1.5 ${!materia ? "border-e-accent bg-e-accent-soft text-e-ink" : "border-e-line text-e-dim hover:text-e-ink"}`}>
          Todas as matérias
        </Link>
        {materiasComResposta.map((m) => (
          <Link key={m} href={linkFiltro({ materia: m })} className={`rounded-full border px-3 py-1.5 ${m === materia ? "border-e-accent bg-e-accent-soft text-e-ink" : "border-e-line text-e-dim hover:text-e-ink"}`}>
            {MATERIA_POR_ID.get(m)?.nome ?? m}
          </Link>
        ))}
      </nav>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi rotulo="Erros ainda abertos" valor={String(ativos.length)} detalhe={`${porQuestao.size} questões respondidas no período`} />
        <Kpi rotulo="Erros que se repetem" valor={String(reincidentes.length)} detalhe={`${config.vezesReincidencia} ou mais erros na mesma questão`} tom={reincidentes.length ? "bad" : "ok"} />
        <Kpi rotulo="Erros superados" valor={String(superados.length)} detalhe="Última tentativa foi acerto firme" tom="ok" />
        <Kpi rotulo="Tempo até corrigir" valor={tempoMedio === null ? "?" : `${tempoMedio} ${tempoMedio === 1 ? "dia" : "dias"}`} detalhe={tempos.length ? `Média de ${tempos.length} ${tempos.length === 1 ? "erro corrigido" : "erros corrigidos"}` : "Ainda sem erro corrigido"} />
      </div>

      <Card className="mb-5">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-sm font-medium text-e-ink">Índice de domínio</h2>
          <AjustarNiveis config={config} />
        </div>
        <ul className="mb-4 flex flex-wrap gap-1.5" aria-label="Os 7 níveis">
          {listaNiveis.map((n) => (
            <li key={n.n} title={n.d} className={`rounded-full px-2.5 py-1 text-[11px] ${NIVEL_COR[n.n].pill}`}>
              {n.n} {n.t}
            </li>
          ))}
        </ul>
        {arvore.length ? (
          <ArvoreDominio arvore={arvore} niveis={listaNiveis.map((n) => n.t)} />
        ) : (
          <p className="text-sm text-e-dim">Ainda sem questões respondidas neste período. Responda algumas em Questões e a árvore aparece aqui.</p>
        )}
        <p className="mt-3 text-[11px] text-e-dim">
          O nível da questão sai das suas tentativas. O do tema e o da matéria é a média das questões já respondidas, arredondada para baixo. Passe o mouse num nível para ver a regra.
        </p>
      </Card>

      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardTitulo>Erros que voltam</CardTitulo>
          {reincidentes.length ? (
            <ul className="divide-y divide-e-line">
              {reincidentes.slice(0, 15).map((e) => (
                <li key={e.questao_id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-e-ink">{e.tema}</p>
                    <p className="text-xs text-e-dim">
                      {CLASSIFICACAO_LABEL[e.tipoMaisComum]} · {e.falhas}x · último em {dataBR(e.ultimaFalha)}
                      {!materia && ` · ${MATERIA_POR_ID.get(e.materia_id)?.nome ?? e.materia_id}`}
                    </p>
                  </div>
                  <Link href={refazer(e.questao_id, e.materia_id)} className={BOTAO_SECUNDARIO}>Refazer</Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-e-dim">Nenhum erro repetido neste período.</p>
          )}
          {ativos.length > reincidentes.length && (
            <p className="mt-3 text-xs text-e-dim">
              Mais {ativos.length - reincidentes.length} {ativos.length - reincidentes.length === 1 ? "erro aberto" : "erros abertos"} de uma vez só.{" "}
              <Link href={`/admin/estudos/questoes?status=erradas${materia ? `&materia=${materia}` : ""}`} className="text-e-ink underline underline-offset-2">Ver em Questões</Link>
            </p>
          )}
        </Card>
        <Card>
          <CardTitulo>Erros superados</CardTitulo>
          {superados.length ? (
            <ul className="divide-y divide-e-line">
              {superados.slice(0, 15).map((e) => (
                <li key={e.questao_id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="min-w-0 truncate text-e-ink">{e.tema}</span>
                  <span className="shrink-0 text-xs text-e-dim">
                    {e.diasAteCorrigir === null ? "corrigido" : e.diasAteCorrigir === 0 ? "corrigiu no mesmo dia" : `corrigiu em ${e.diasAteCorrigir} ${e.diasAteCorrigir === 1 ? "dia" : "dias"}`}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-e-dim">Quando você acertar com firmeza uma questão que já errou, ela aparece aqui.</p>
          )}
        </Card>
      </div>

      <Card className="mb-5">
        <CardTitulo>Por que eu erro</CardTitulo>
        {tipos.some((t) => t.n) ? (
          <ul className="space-y-1.5">
            {tipos.filter((t) => t.n).map((t) => (
              <li key={t.k} className="grid grid-cols-[minmax(130px,200px)_minmax(0,1fr)_32px] items-center gap-3 text-sm">
                <span className="truncate text-e-ink">{t.t}</span>
                <span className="h-2 overflow-hidden rounded-full bg-e-line">
                  <span className="block h-full rounded-full bg-e-bad" style={{ width: `${(t.n / maxTipo) * 100}%` }} />
                </span>
                <span className="text-right text-xs tabular-nums text-e-dim">{t.n}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-e-dim">Nenhum erro classificado neste período.</p>
        )}
        <p className="mt-3 text-[11px] text-e-dim">Conta cada tentativa errada pelo motivo que você marcou. Chute e dúvida ficam de fora desta conta, porque são acertos.</p>
      </Card>

      <Card destaque>
        <CardTitulo acao={<CopiarResumo texto={resumo} />}>Resumo para o tutor</CardTitulo>
        <p className="mb-3 text-xs text-e-dim">Cole no Projeto do tutor no claude.ai. O texto segue os filtros escolhidos acima.</p>
        <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-xl border border-e-line bg-e-card-2 p-3 font-mono text-xs text-e-dim">{resumo}</pre>
      </Card>
    </>
  );
}
