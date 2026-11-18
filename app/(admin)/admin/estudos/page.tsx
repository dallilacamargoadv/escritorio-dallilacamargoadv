import Link from "next/link";
import { AlertaRevisao } from "@/components/estudos/AlertaRevisao";
import { redirect } from "next/navigation";
import {
  getAtrasados,
  getCronograma,
  getDiasComBlocoFeito,
  getEstudoConfig,
  getEventos,
  getRespostas,
  getTopicoEstados,
  getUltimoDiaTeoria,
} from "@/lib/db-estudos";
import { addDaysToDateString, todayBelemDateString } from "@/lib/atividades-utils";
import {
  EDITAL,
  diasEntre,
  diasSeguidos,
  formatarData,
  mensagemDoDia,
  previsaoFimTeoria,
  progressoGeral,
  progressoPorMateria,
  type ItemTipo,
} from "@/lib/estudos-utils";
import {
  CLASSIFICACAO_LABEL,
  estatisticasPorMateria,
  formatarTempo,
  proximaMelhorAcao,
  temasCriticos,
  tempoMedio,
} from "@/lib/estudos-desempenho";
import { BlocosDoDia } from "@/components/admin/estudos/BlocosDoDia";
import { linksDosBlocos } from "@/lib/estudos-links";
import { Sparkle } from "@/components/estudos/Sparkle";
import { Barra, BOTAO_PRIMARIO, Card, CardTitulo, Kpi, tomPorPct } from "@/components/estudos/ui";

function agora() {
  return Date.now();
}
function saudacao() {
  const h = Number(new Intl.DateTimeFormat("pt-BR", { hour: "numeric", hour12: false, timeZone: "America/Belem" }).format(new Date()));
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

export default async function EstudosInicioPage() {
  const hoje = todayBelemDateString();
  let dados;
  try {
    dados = await Promise.all([
      getEstudoConfig(),
      getTopicoEstados(),
      getCronograma(hoje, hoje),
      getAtrasados(hoje),
      getDiasComBlocoFeito(),
      getUltimoDiaTeoria(),
      getRespostas(),
      getEventos(),
      getCronograma(hoje, addDaysToDateString(hoje, 3)),
    ]);
  } catch {
    redirect("/login");
  }
  const [config, estados, itensHoje, atrasados, diasFeitos, teoria, respostas, eventos, proximos] = dados;
  const porMateria = progressoPorMateria(estados, config);
  const geral = progressoGeral(porMateria);
  const diasResposta = respostas.map((r) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "America/Belem" }).format(new Date(r.respondida_em)),
  );
  const seguidos = diasSeguidos([...diasFeitos, ...diasResposta], hoje);
  const fimTeoria = previsaoFimTeoria(teoria.map((t) => ({ ...t, tipo: t.tipo as ItemTipo })));
  const stats = estatisticasPorMateria(respostas);
  const totalResp = respostas.length;
  const acertoGeral = totalResp ? Math.round((respostas.filter((r) => r.correta).length / totalResp) * 100) : null;
  const criticos = temasCriticos(respostas, agora());
  const proximoBloco = itensHoje.find((i) => !i.feito) ?? null;
  const acao = proximaMelhorAcao({ criticos, atrasados: atrasados.length, proximoBloco, temPlano: proximos.length > 0 });
  const proximoEvento = eventos.find((e) => e.data && e.data >= hoje && e.situacao !== "realizado") ?? null;
  const nucleo = porMateria.filter((p) => p.materia.fase === 1).sort((a, b) => a.percentual - b.percentual)[0];
  const msg = mensagemDoDia({
    hoje,
    atrasados: atrasados.length,
    feitosHoje: itensHoje.filter((i) => i.feito).length,
    totalHoje: itensHoje.length,
    seguidos,
    percentualEdital: geral.percentual,
    diasAteProva: config.dataProva ? diasEntre(hoje, config.dataProva) : null,
    materiaMaisAtrasada: nucleo && nucleo.percentual < 100 ? nucleo.materia.nome : null,
  });

  return (
    <div className="space-y-5">
      <AlertaRevisao />
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-e-dim">
            {formatarData(hoje, { weekday: "short", day: "2-digit", month: "2-digit" })} · Operação Aprovação · PGE-MA
          </p>
          <h1 className="mt-1 text-2xl font-medium text-e-ink">{saudacao()}, Dallila</h1>
        </div>
        {proximoEvento && (
          <Link
            href="/admin/estudos/concurso"
            className="rounded-full border border-e-line bg-e-card px-3 py-1.5 text-xs text-e-blue hover:text-e-ink"
          >
            {proximoEvento.titulo}: {diasEntre(hoje, proximoEvento.data!)} dias
            {proximoEvento.situacao === "previsto" ? " (previsão)" : ""}
          </Link>
        )}
      </header>

      <Card destaque>
        <div className="flex gap-3">
          <Sparkle size={26} variante="flutuante" className="mt-1 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-[0.14em] text-e-bad">Sua próxima melhor ação</p>
            <p className="mt-1 text-base font-medium text-e-ink">{acao.titulo}</p>
            <p className="mt-1 text-sm text-e-dim">
              <span className="text-e-ink/80">Por quê: </span>
              {acao.porque}
            </p>
            <Link href={acao.href} className={`${BOTAO_PRIMARIO} mt-3`}>
              {acao.rotulo}
            </Link>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          rotulo="Questões respondidas"
          valor={String(totalResp)}
          detalhe={acertoGeral !== null ? `${acertoGeral}% de acerto` : "Comece pela aba Questões"}
          tom={acertoGeral !== null ? tomPorPct(acertoGeral) : undefined}
        />
        <Kpi rotulo="Tempo médio" valor={formatarTempo(tempoMedio(respostas))} detalhe="por questão (só as cronometradas)" />
        <Kpi rotulo="Dias seguidos" valor={String(seguidos)} detalhe={atrasados.length ? `${atrasados.length} blocos atrasados` : "Nenhum bloco atrasado"} tom={atrasados.length ? "warn" : "ok"} />
        <Kpi
          rotulo="Edital estudado"
          valor={`${geral.percentual}%`}
          detalhe={fimTeoria ? `Teoria termina em ${formatarData(fimTeoria, { day: "2-digit", month: "2-digit", year: "2-digit" })} no ritmo do plano` : `${geral.dominados} de ${geral.total} tópicos dominados`}
        />
      </div>

      <section className="rounded-2xl border border-e-line bg-e-card px-4 py-3 text-sm text-e-dim">
        <span className="text-e-ink">{msg.titulo}.</span> {msg.texto}
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardTitulo acao={<Link href="/admin/estudos/questoes" className="text-xs text-e-dim hover:text-e-ink">Treinar</Link>}>
            Mapa de fraquezas
          </CardTitulo>
          {stats.length === 0 ? (
            <p className="text-sm text-e-dim">Responda algumas questões e o mapa se monta sozinho.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {stats.map((s) => {
                const tom = tomPorPct(s.pctFirme);
                const cls =
                  tom === "ok" ? "border-e-ok/40 bg-e-ok-soft text-e-ok" : tom === "warn" ? "border-e-warn/40 bg-e-warn-soft text-e-warn" : "border-e-bad/40 bg-e-bad-soft text-e-bad";
                return (
                  <Link key={s.materia_id} href={`/admin/estudos/questoes?materia=${s.materia_id}`} className={`rounded-xl border p-3 ${cls}`}>
                    <span className="block truncate text-xs" title={s.nome}>{s.nome}</span>
                    <span className="block text-xl font-medium tabular-nums">{s.pctFirme}%</span>
                    <span className="block text-[11px] opacity-80">{s.respostas} respostas</span>
                  </Link>
                );
              })}
            </div>
          )}
          <p className="mt-3 text-[11px] text-e-dim">
            Conta só acerto firme: acerto no chute ou com dúvida não entra como domínio. Verde 75% ou mais, amarelo 60 a 74%, vermelho abaixo de 60%.
          </p>
        </Card>

        <Card>
          <CardTitulo acao={<Link href="/admin/estudos/cronograma" className="text-xs text-e-dim hover:text-e-ink">Ver semana</Link>}>
            Hoje no cronograma
          </CardTitulo>
          <BlocosDoDia itens={itensHoje} links={linksDosBlocos(itensHoje)} vazio="Nada planejado para hoje. Monte ou refaça o plano na aba Cronograma." />
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardTitulo>Erros que estão se repetindo</CardTitulo>
          {criticos.length === 0 ? (
            <p className="text-sm text-e-dim">Nenhum tema com 2 ou mais erros nos últimos 45 dias.</p>
          ) : (
            <ul className="divide-y divide-e-line">
              {criticos.slice(0, 6).map((t) => (
                <li key={t.materia_id + t.tema} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-e-ink">{t.tema}</span>
                    <span className="text-[11px] text-e-dim">
                      {t.materia_id}
                      {t.tipoMaisComum ? ` · ${CLASSIFICACAO_LABEL[t.tipoMaisComum]}` : ""}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full bg-e-bad-soft px-2 py-0.5 text-[11px] text-e-bad">{t.erros} de {t.tentativas}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardTitulo acao={<Link href="/admin/estudos/edital" className="text-xs text-e-dim hover:text-e-ink">Abrir edital</Link>}>
            O que falta do edital
          </CardTitulo>
          <ul className="space-y-2">
            {porMateria.map((p) => (
              <li key={p.materia.id} className="flex items-center gap-3 text-sm">
                <span className="w-36 shrink-0 truncate text-e-ink" title={p.materia.nome}>{p.materia.nome}</span>
                <Barra pct={p.percentual} />
                <span className="w-10 text-right text-xs tabular-nums text-e-dim">{p.percentual}%</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <CardTitulo>Sobre a prova (previsão)</CardTitulo>
        <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div><dt className="text-[11px] text-e-dim">Objetiva</dt><dd className="text-e-ink">{EDITAL.prova.objetiva}</dd></div>
          <div><dt className="text-[11px] text-e-dim">Discursiva</dt><dd className="text-e-ink">{EDITAL.prova.discursiva}</dd></div>
          <div><dt className="text-[11px] text-e-dim">Vagas</dt><dd className="text-e-ink">{EDITAL.prova.vagas}</dd></div>
          <div><dt className="text-[11px] text-e-dim">Remuneração inicial</dt><dd className="text-e-ink">{EDITAL.prova.remuneracao}</dd></div>
        </dl>
        <p className="mt-3 text-[11px] text-e-dim">{EDITAL.fonte}</p>
      </Card>
    </div>
  );
}
