import Link from "next/link";
import { redirect } from "next/navigation";
import { getEstadosCartoes, getRespostas } from "@/lib/db-estudos";
import { getRegistrosTec, type RegistroTec } from "@/lib/db-estudos-cadernos";
import type { Resposta } from "@/lib/estudos-desempenho";
import { MATERIAS, MATERIA_POR_ID } from "@/lib/estudos-utils";
import {
  ACAO_TEXTO,
  acaoDoAssunto,
  diaCurto,
  diaLocal,
  extremos,
  MIN_QUESTOES_ASSUNTO,
  naJanela,
  porAssunto,
  porMateria,
  porSemana,
  quinzena,
  somarDias,
  totais,
  type Acao,
  type Lancamento,
  type Linha,
} from "@/lib/estudos-relatorio";
import { Barra, BOTAO_SECUNDARIO, Cabecalho, Card, CardTitulo, Kpi, tomPorPct } from "@/components/estudos/ui";
import { TecDiaForm } from "@/components/estudos/TecDiaForm";

const nomeMateria = (id: string) => MATERIA_POR_ID.get(id)?.nome ?? id;

const ACAO_COR: Record<Acao, string> = {
  lei_seca: "bg-e-bad-soft text-e-bad",
  manutencao: "bg-e-warn-soft text-e-warn",
  leve: "bg-e-ok-soft text-e-ok",
  pouco_dado: "bg-e-card-2 text-e-dim",
};

function Delta({ v, sufixo = " pontos" }: { v: number | null; sufixo?: string }) {
  if (v === null) return null;
  const cor = v > 0 ? "text-e-ok" : v < 0 ? "text-e-bad" : "text-e-dim";
  return <span className={`text-[11px] tabular-nums ${cor}`}>{v > 0 ? "+" : ""}{v}{sufixo}</span>;
}

function ListaExtremos({ titulo, itens, tom }: { titulo: string; itens: Linha[]; tom: "ok" | "bad" }) {
  return (
    <div className={`rounded-xl p-3 ${tom === "ok" ? "bg-e-ok-soft" : "bg-e-bad-soft"}`}>
      <p className={`text-[11px] ${tom === "ok" ? "text-e-ok" : "text-e-bad"}`}>{titulo}</p>
      {itens.length === 0 ? (
        <p className="mt-1 text-xs text-e-dim">Ainda sem matérias com {MIN_QUESTOES_ASSUNTO} questões ou mais.</p>
      ) : (
        <ol className="mt-1 space-y-0.5 text-sm text-e-ink">
          {itens.map((m) => (
            <li key={m.chave} className="flex justify-between gap-2">
              <span className="truncate">{nomeMateria(m.materia_id)}</span>
              <span className="tabular-nums">{m.pct}%</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )}

function agoraMs() {
  return Date.now();
}

export default async function RelatorioPage(props: PageProps<"/admin/estudos/relatorio">) {
  const sp = await props.searchParams;
  let respostas: Resposta[], tec: RegistroTec[], cartoes: Awaited<ReturnType<typeof getEstadosCartoes>>;
  try {
    [respostas, tec, cartoes] = await Promise.all([getRespostas(), getRegistrosTec(), getEstadosCartoes()]);
  } catch {
    redirect("/login");
  }
  const hoje = diaLocal(agoraMs());
  const ateParam = typeof sp.ate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.ate) ? sp.ate : hoje;
  const fim = ateParam > hoje ? hoje : ateParam;
  const atual = quinzena(fim);
  const anterior = quinzena(somarDias(atual.inicio, -1));

  const resolucao = tec.filter((r) => r.tipo === "resolucao");
  const lancamentos: Lancamento[] = [
    ...respostas.map((r) => ({
      dia: diaLocal(Date.parse(r.respondida_em)),
      materia_id: r.materia_id,
      assunto: r.tema?.trim() || "Sem tema",
      feitas: 1,
      acertos: r.correta ? 1 : 0,
      origem: "site" as const,
    })),
    ...resolucao.map((r) => ({
      dia: r.referencia,
      materia_id: r.materia_id,
      assunto: r.assunto,
      feitas: r.questoes,
      acertos: r.acertos ?? 0,
      origem: "tec" as const,
    })),
  ];
  const lAtual = naJanela(lancamentos, atual);
  const lAnterior = naJanela(lancamentos, anterior);
  const t = totais(lAtual);
  const tAnt = totais(lAnterior);
  // revisão: flashcards revisados (histórico de cada cartão) + questões abertas pela aba Revisão
  const revisoes = (j: { inicio: string; fim: string }) => {
    let cartoesFeitos = 0;
    let lembrou = 0;
    for (const e of cartoes.values()) {
      for (const h of e.hist ?? []) {
        const d = diaLocal(h.t);
        if (d >= j.inicio && d <= j.fim) {
          cartoesFeitos++;
          if (h.ok) lembrou++;
        }
      }
    }
    const questoes = respostas.filter((r) => r.contexto === "revisao" && (() => { const d = diaLocal(Date.parse(r.respondida_em)); return d >= j.inicio && d <= j.fim; })()).length;
    return { cartoes: cartoesFeitos, lembrou, questoes, total: cartoesFeitos + questoes };
  };
  const rev = revisoes(atual);
  const revAnt = revisoes(anterior);
  const semanas = porSemana(lAtual, atual);
  const maxSemana = Math.max(1, ...semanas.flatMap((s) => [s.acertos, s.erros]));
  const materias = porMateria(lAtual, lAnterior).sort((a, b) => b.pct - a.pct || b.feitas - a.feitas);
  const { melhores, piores } = extremos(materias);
  const assuntos = porAssunto(lAtual, lAnterior);

  // sugestões de assunto por matéria (o que ela já usou no TEC e os temas do site)
  const sugestoes: Record<string, string[]> = {};
  for (const l of lancamentos) {
    if (l.assunto === "Sem tema") continue;
    const arr = (sugestoes[l.materia_id] ??= []);
    if (!arr.includes(l.assunto)) arr.push(l.assunto);
  }
  const desde = somarDias(hoje, -45);
  const registrosRecentes = resolucao
    .filter((r) => r.referencia >= desde)
    .map((r) => ({ id: r.id, referencia: r.referencia, materia_id: r.materia_id, assunto: r.assunto, questoes: r.questoes, acertos: r.acertos }));

  return (
    <>
      <Cabecalho
        titulo="Relatório da quinzena"
        sub="Soma as questões que você respondeu no site e as que lançou do TEC. Compara sempre com os 15 dias anteriores."
      />
      <div className="mb-5 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-e-ink">{diaCurto(atual.inicio)} a {diaCurto(atual.fim)}</span>
        <Link href={`/admin/estudos/relatorio?ate=${anterior.fim}`} className={BOTAO_SECUNDARIO}>Quinzena anterior</Link>
        {fim < hoje && (
          <>
            <Link href={`/admin/estudos/relatorio?ate=${somarDias(fim, 15) > hoje ? hoje : somarDias(fim, 15)}`} className={BOTAO_SECUNDARIO}>Próxima</Link>
            <Link href="/admin/estudos/relatorio" className={BOTAO_SECUNDARIO}>Voltar para hoje</Link>
          </>
        )}
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Kpi
          rotulo="Questões feitas"
          valor={String(t.feitas)}
          detalhe={tAnt.feitas ? `${t.feitas - tAnt.feitas >= 0 ? "+" : ""}${t.feitas - tAnt.feitas} em relação à anterior` : "Sem quinzena anterior para comparar"}
          tom={tAnt.feitas ? (t.feitas >= tAnt.feitas ? "ok" : "warn") : undefined}
        />
        <Kpi rotulo="Acertos" valor={String(t.acertos)} detalhe={`${t.erros} erros`} />
        <Kpi
          rotulo="% de acerto"
          valor={t.feitas ? `${t.pct}%` : "–"}
          detalhe={tAnt.feitas && t.feitas ? `${t.pct - tAnt.pct >= 0 ? "+" : ""}${t.pct - tAnt.pct} pontos (antes ${tAnt.pct}%)` : undefined}
          tom={tAnt.feitas && t.feitas ? (t.pct >= tAnt.pct ? "ok" : "bad") : undefined}
        />
        <Kpi rotulo="De onde vieram" valor={`${t.site} + ${t.tec}`} detalhe="site + TEC" />
        <Kpi
          rotulo="Revisões"
          valor={String(rev.total)}
          detalhe={`${rev.cartoes} flashcards${rev.cartoes ? ` (lembrou ${Math.round((rev.lembrou / rev.cartoes) * 100)}%)` : ""} + ${rev.questoes} questões de revisão${revAnt.total ? `. Antes: ${revAnt.total}` : ""}`}
          tom={revAnt.total ? (rev.total >= revAnt.total ? "ok" : "warn") : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-5">
          {t.feitas === 0 && (
            <Card>
              <p className="text-sm text-e-dim">Nenhuma questão nesta quinzena ainda. Responda no site ou lance ao lado o que fez no TEC, e o relatório se monta sozinho.</p>
            </Card>
          )}

          <Card>
            <CardTitulo>Acertos e erros por semana</CardTitulo>
            <div className="flex items-end gap-6 overflow-x-auto pb-1" role="img" aria-label={semanas.map((s) => `${diaCurto(s.inicio)} a ${diaCurto(s.fim)}: ${s.acertos} acertos e ${s.erros} erros`).join("; ")}>
              {semanas.map((s) => (
                <div key={s.inicio} className="flex shrink-0 flex-col items-center">
                  <div className="flex h-32 items-end gap-1">
                    {[{ v: s.acertos, c: "bg-e-ok" }, { v: s.erros, c: "bg-e-bad" }].map((b, i) => (
                      <div key={i} className="flex w-6 flex-col items-center justify-end">
                        <span className="mb-0.5 text-[10px] tabular-nums text-e-dim">{b.v}</span>
                        <span className={`block w-full rounded-t ${b.c}`} style={{ height: `${(b.v / maxSemana) * 110}px` }} />
                      </div>
                    ))}
                  </div>
                  <span className="mt-1 text-[11px] text-e-dim">{diaCurto(s.inicio)} a {diaCurto(s.fim)}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-e-dim">
              <span className="text-e-ok">■</span> acertos <span className="ml-2 text-e-bad">■</span> erros. Semana de segunda a domingo.
            </p>
          </Card>

          <Card>
            <CardTitulo>Desempenho por matéria</CardTitulo>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ListaExtremos titulo="3 melhores" itens={melhores} tom="ok" />
              <ListaExtremos titulo="3 piores" itens={piores} tom="bad" />
            </div>
            <ul className="space-y-2">
              {materias.map((m) => (
                <li key={m.chave} className="grid grid-cols-[minmax(90px,1fr)_minmax(0,1.3fr)_auto] items-center gap-3 text-sm">
                  <span className="truncate text-e-ink" title={nomeMateria(m.materia_id)}>{nomeMateria(m.materia_id)}</span>
                  <Barra pct={m.pct} tom={tomPorPct(m.pct)} />
                  <span className="flex flex-col items-end text-xs tabular-nums text-e-dim">
                    <span>{m.pct}% ({m.acertos}/{m.feitas})</span>
                    <Delta v={m.delta} />
                  </span>
                </li>
              ))}
            </ul>
            {materias.length > 0 && <p className="mt-3 text-[11px] text-e-dim">Melhores e piores só entre matérias com {MIN_QUESTOES_ASSUNTO} questões ou mais na quinzena. A diferença é em relação à quinzena anterior.</p>}
          </Card>

          <Card>
            <CardTitulo>Taxa por assunto e o que fazer</CardTitulo>
            {assuntos.length === 0 ? (
              <p className="text-sm text-e-dim">Sem assuntos nesta quinzena.</p>
            ) : (
              <ul className="divide-y divide-e-line">
                {assuntos.map((a) => {
                  const acao = acaoDoAssunto(a);
                  return (
                    <li key={a.chave} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 py-2 text-sm sm:grid-cols-[minmax(0,1fr)_110px_auto]">
                      <span className="min-w-0">
                        <span className="block truncate text-e-ink" title={a.assunto}>{a.assunto}</span>
                        <span className="text-[11px] text-e-dim">{nomeMateria(a.materia_id)}</span>
                      </span>
                      <span className="text-right text-xs tabular-nums text-e-dim sm:text-left">
                        {a.pct}% ({a.acertos}/{a.feitas}) <Delta v={a.delta} sufixo="" />
                      </span>
                      <span className={`col-span-2 justify-self-start rounded-full px-2.5 py-0.5 text-[11px] sm:col-span-1 sm:justify-self-end ${ACAO_COR[acao]}`}>{ACAO_TEXTO[acao]}</span>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="mt-3 text-[11px] text-e-dim">
              Abaixo de 70%: volta para a lei seca e faz 20 questões. De 70% a 85%: manutenção com 10 por semana. Acima de 85%: 5 por semana. Com menos de {MIN_QUESTOES_ASSUNTO} questões, o número ainda não diz muito. Assuntos com o mesmo nome no site e no TEC são somados.
            </p>
          </Card>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <Card destaque>
            <CardTitulo>Lançar o TEC do dia</CardTitulo>
            <TecDiaForm
              hoje={hoje}
              materias={MATERIAS.map((m) => ({ id: m.id, nome: m.nome }))}
              assuntos={sugestoes}
              registros={registrosRecentes}
            />
          </Card>
        </div>
      </div>
    </>
  );
}
