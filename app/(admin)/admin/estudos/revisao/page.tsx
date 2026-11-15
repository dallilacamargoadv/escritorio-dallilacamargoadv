import { redirect } from "next/navigation";
import {
  CARTOES,
  getEstadosCartoes,
  getEstadosRevisao,
  getPomodoros,
  getRespostas,
  QUESTAO_POR_ID,
} from "@/lib/db-estudos";
import { addDaysToDateString, todayBelemDateString } from "@/lib/atividades-utils";
import {
  agendaArtigos,
  agendaQuestoes,
  dataBelem,
  ETAPA_FINAL,
  etapaDoCartao,
  NOVOS_CARTOES_POR_DIA,
  venceCartao,
} from "@/lib/estudos-revisao";
import { fonteHtml, htmlSeguro } from "@/lib/estudos-html";
import { Cabecalho } from "@/components/estudos/ui";
import { RevisaoClient, type CartaoFila } from "@/components/estudos/RevisaoClient";

export default async function RevisaoPage() {
  const hoje = todayBelemDateString();
  const semana = addDaysToDateString(hoje, 7);
  let respostas, estadosCartoes, estadosRevisao, pomodoros;
  try {
    [respostas, estadosCartoes, estadosRevisao, pomodoros] = await Promise.all([
      getRespostas(),
      getEstadosCartoes(),
      getEstadosRevisao(),
      getPomodoros(addDaysToDateString(hoje, -6)),
    ]);
  } catch {
    redirect("/login");
  }

  const qs = agendaQuestoes(respostas, QUESTAO_POR_ID).sort((a, b) => a.vence_em.localeCompare(b.vence_em));
  const arts = agendaArtigos(respostas, QUESTAO_POR_ID, estadosRevisao).sort((a, b) => a.vence_em.localeCompare(b.vence_em));

  // Cartões vencidos (já começados) e uma cota diária de cartões novos, alternando os baralhos.
  const vencidos: CartaoFila[] = [];
  let proxCartoes = 0;
  let novosHoje = 0;
  for (const c of CARTOES) {
    const e = estadosCartoes.get(c.id);
    if (!e) continue;
    if (typeof e.first === "number" && dataBelem(e.first) === hoje) novosHoje++;
    const etapa = etapaDoCartao(e);
    const vence = venceCartao(e);
    if (etapa >= ETAPA_FINAL || !vence) continue;
    if (vence <= hoje) vencidos.push({ id: c.id, baralho: c.b, frente: htmlSeguro(c.f), verso: htmlSeguro(c.v), extra: c.x ? htmlSeguro(c.x) : "", etapa, novo: false });
    else if (vence <= semana) proxCartoes++;
  }
  const porBaralho = new Map<string, typeof CARTOES>();
  for (const c of CARTOES) {
    if (estadosCartoes.has(c.id)) continue;
    porBaralho.set(c.b, [...(porBaralho.get(c.b) ?? []), c]);
  }
  const novos: CartaoFila[] = [];
  const cota = Math.max(0, NOVOS_CARTOES_POR_DIA - novosHoje);
  for (let i = 0; novos.length < cota && [...porBaralho.values()].some((l) => l.length > i); i++) {
    for (const l of porBaralho.values()) {
      const c = l[i];
      if (c && novos.length < cota) novos.push({ id: c.id, baralho: c.b, frente: htmlSeguro(c.f), verso: htmlSeguro(c.v), extra: c.x ? htmlSeguro(c.x) : "", etapa: 0, novo: true });
    }
  }

  const questoesHoje = qs.filter((q) => q.vence_em <= hoje);
  const artigosHoje = arts.filter((a) => a.vence_em <= hoje);
  const proximos = {
    questoes: qs.filter((q) => q.vence_em > hoje && q.vence_em <= semana).length,
    artigos: arts.filter((a) => a.vence_em > hoje && a.vence_em <= semana).length,
    cartoes: proxCartoes,
  };

  return (
    <>
      <Cabecalho
        titulo="Revisão"
        sub="A fila do dia junta questões que você errou, cartões e artigos de lei. Cada acerto empurra o item para 1, 3, 7, 15 e 30 dias. Errou, ele volta para amanhã."
      />
      <RevisaoClient
        hoje={hoje}
        questoes={questoesHoje.map((q) => ({ id: q.id, materia: q.materia, tema: q.tema, ref: q.ref, etapa: q.etapa, vence_em: q.vence_em }))}
        artigos={artigosHoje.map((a) => ({ item_id: a.item_id, ref: a.ref, materia: a.materia, html: fonteHtml(a.fonte), questoes: a.questoes.length, etapa: a.etapa, vence_em: a.vence_em }))}
        cartoes={[...vencidos, ...novos]}
        proximos={proximos}
        pomodoros={pomodoros.map((p) => ({ data: p.data, minutos: p.minutos_efetivos }))}
      />
    </>
  );
}
