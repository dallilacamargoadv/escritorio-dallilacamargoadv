import { redirect } from "next/navigation";
import {
  CARTOES,
  getEstadosCartoes,
  QUESTOES,
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
  LIMITE_DIA,
  etapaDoCartao,
  NOVOS_CARTOES_POR_DIA,
  venceCartao,
} from "@/lib/estudos-revisao";
import { fonteHtml, htmlSeguro } from "@/lib/estudos-html";
import { AULA_POR_ID, getAulasEstudadas } from "@/lib/db-estudos-cadernos";
import { cartoesDosErros } from "@/lib/estudos-erros-cartoes";
import { certoErradoDoArtigo } from "@/lib/estudos-lei-flash";
import { lugarComCache, SEM_ASSUNTO } from "@/lib/estudos-cartoes-assunto";
import {
  escolherSubjetiva,
  htmlDoCartaoErro,
  NOVOS_ERROS_POR_DIA,
  problemaDoDia,
  proximaSubjetiva,
  temSubjetiva,
} from "@/lib/estudos-revisao-hoje";
import { Cabecalho } from "@/components/estudos/ui";
import { RevisaoClient, type CartaoFila } from "@/components/estudos/RevisaoClient";
import { RevisaoDeOntem } from "@/components/estudos/RevisaoDeOntem";

/** Um nome só por matéria nos botões da fila: baralhos e cartões de erro usam nomes diferentes. */
const NOME_CURTO: Record<string, string> = {
  "Língua Portuguesa": "Português",
  "Português (verbos)": "Português",
  "Direito Constitucional": "Constitucional",
  "Direito Administrativo": "Administrativo",
  "Lei 9.784 (lei seca)": "Administrativo",
  "Direito Tributário": "Tributário",
  "Reforma tributária": "Tributário",
  "Direito Processual Civil": "Processo Civil",
  "Direito Civil": "Civil",
  "Direito do Trabalho": "Trabalho",
  "Direito Financeiro": "Financeiro",
  "Raciocínio Lógico e Matemática": "Raciocínio Lógico",
};
const curto = (n: string) => NOME_CURTO[n] ?? n.replace(/^Direito\s+(d[oa]\s+)?/, "");

export default async function RevisaoPage() {
  const hoje = todayBelemDateString();
  const semana = addDaysToDateString(hoje, 7);
  let respostas, estadosCartoes, estadosRevisao, pomodoros, aulasEstudadas;
  try {
    [respostas, estadosCartoes, estadosRevisao, pomodoros, aulasEstudadas] = await Promise.all([
      getRespostas(),
      getEstadosCartoes(),
      getEstadosRevisao(),
      getPomodoros(addDaysToDateString(hoje, -6)),
      getAulasEstudadas(),
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
    if (vence <= hoje) vencidos.push({ id: c.id, baralho: c.b, materia: curto(c.b), frente: htmlSeguro(c.f), verso: htmlSeguro(c.v), extra: c.x ? htmlSeguro(c.x) : "", etapa, novo: false });
    else if (vence <= semana) proxCartoes++;
  }
  const porBaralho = new Map<string, typeof CARTOES>();
  for (const c of CARTOES) {
    // Matemática é exercício, não cartão (pedido dela, 27/11): o baralho de Raciocínio Lógico não entra como novo.
    if (estadosCartoes.has(c.id) || c.b === "Raciocínio Lógico") continue;
    porBaralho.set(c.b, [...(porBaralho.get(c.b) ?? []), c]);
  }
  const novos: CartaoFila[] = [];
  const cota = Math.max(0, NOVOS_CARTOES_POR_DIA - novosHoje);
  for (let i = 0; novos.length < cota && [...porBaralho.values()].some((l) => l.length > i); i++) {
    for (const l of porBaralho.values()) {
      const c = l[i];
      if (c && novos.length < cota) novos.push({ id: c.id, baralho: c.b, materia: curto(c.b), frente: htmlSeguro(c.f), verso: htmlSeguro(c.v), extra: c.x ? htmlSeguro(c.x) : "", etapa: 0, novo: true });
    }
  }

  // Cartões dos meus erros: os que vencem hoje e até 5 novos por dia (os que ela ainda erra vêm primeiro).
  const erros = cartoesDosErros(respostas, QUESTAO_POR_ID);
  const errosVencidos: CartaoFila[] = [];
  const errosNovos: CartaoFila[] = [];
  let errosNovosHoje = 0;
  let proxErros = 0;
  for (const c of erros) {
    const e = estadosCartoes.get(c.id);
    if (e && typeof e.first === "number" && dataBelem(e.first) === hoje) errosNovosHoje++;
  }
  for (const c of erros) {
    const e = estadosCartoes.get(c.id);
    const h = htmlDoCartaoErro(c, QUESTAO_POR_ID.get(c.questao_id));
    const item = {
      id: c.id,
      baralho: h.baralho,
      materia: curto(c.materia),
      frente: h.frente,
      verso: h.verso,
      extra: h.extra,
      lei: h.lei,
      doErro: true,
      alts: h.alts,
      correta: h.correta,
      porque: h.porque,
    };
    if (!e) {
      if (!c.superado && errosNovos.length < Math.max(0, NOVOS_ERROS_POR_DIA - errosNovosHoje)) errosNovos.push({ ...item, etapa: -1, novo: true });
      continue;
    }
    const etapa = etapaDoCartao(e);
    const vence = venceCartao(e);
    if (etapa >= ETAPA_FINAL || !vence) continue;
    if (vence <= hoje) errosVencidos.push({ ...item, etapa, novo: false });
    else if (vence <= semana) proxErros++;
  }

  // Subjetiva do dia (seg, ter, qui, sex): tema com mais itens vencendo hoje.
  const temasVencendo = new Map<string, number>();
  const somar = (t: string) => t && t !== SEM_ASSUNTO && temasVencendo.set(t, (temasVencendo.get(t) ?? 0) + 1);
  for (const q of qs) if (q.vence_em <= hoje) somar(q.tema);
  for (const c of vencidos) {
    const cartao = CARTOES.find((x) => x.id === c.id);
    if (cartao) somar(lugarComCache(cartao).assunto);
  }
  for (const c of errosVencidos) somar(erros.find((x) => x.id === c.id)?.tema ?? "");
  const idsVencidos = new Set(vencidos.map((c) => c.id));
  const subjetiva = temSubjetiva(hoje)
    ? escolherSubjetiva(hoje, temasVencendo, CARTOES, estadosCartoes, (id) => idsVencidos.has(id), QUESTOES)
    : null;
  const naSubjetiva = new Set(subjetiva?.perguntas.map((p) => p.cartao_id) ?? []);

  // Problema do dia: só temas de RLM com aula marcada como estudada (sem nenhuma marcada, as aulas já publicadas).
  const marcadas = new Set([...aulasEstudadas.keys()].filter((id) => id.startsWith("A2-")));
  const publicadas = new Set([...AULA_POR_ID.entries()].filter(([id, a]) => id.startsWith("A2-") && a.aula.status === "pronta").map(([id]) => id));
  const problema = problemaDoDia(hoje, QUESTOES, respostas, marcadas.size ? marcadas : publicadas, marcadas.size > 0);

  // Teto diário: os mais atrasados primeiro; o resto entra nos próximos dias.
  const questoesHoje = qs.filter((q) => q.vence_em <= hoje).slice(0, LIMITE_DIA.questoes);
  const artigosHoje = arts.filter((a) => a.vence_em <= hoje).slice(0, LIMITE_DIA.artigos);
  vencidos.splice(LIMITE_DIA.cartoes);
  const proximos = {
    questoes: qs.filter((q) => q.vence_em > hoje && q.vence_em <= semana).length,
    artigos: arts.filter((a) => a.vence_em > hoje && a.vence_em <= semana).length,
    cartoes: proxCartoes + proxErros,
  };

  return (
    <>
      <Cabecalho
        titulo="Revisão"
        sub="A fila do dia junta questões que você errou, cartões e artigos de lei. Cada acerto empurra o item para 1, 3, 7, 15 e 30 dias. Errou, ele volta para amanhã."
      />
      <RevisaoDeOntem hoje={hoje} respostas={respostas} />
      <RevisaoClient
        hoje={hoje}
        questoes={questoesHoje.map((q) => ({ id: q.id, materia: q.materia, materia_id: QUESTAO_POR_ID.get(q.id)?.materia_id ?? "", tema: q.tema, ref: q.ref, etapa: q.etapa, vence_em: q.vence_em }))}
        artigos={artigosHoje.map((a) => ({ item_id: a.item_id, ref: a.ref, materia: a.materia, html: fonteHtml(a.fonte), itens: certoErradoDoArtigo(a.ref), questoes: a.questoes.length, etapa: a.etapa, vence_em: a.vence_em }))}
        cartoes={[...errosVencidos, ...vencidos, ...errosNovos, ...novos].filter((c) => !naSubjetiva.has(c.id))}
        diaDeSubjetiva={temSubjetiva(hoje)}
        subjetiva={subjetiva}
        proximaSubjetiva={proximaSubjetiva(hoje)}
        problema={problema}
        proximos={proximos}
        pomodoros={pomodoros.map((p) => ({ data: p.data, minutos: p.minutos_efetivos }))}
      />
    </>
  );
}
