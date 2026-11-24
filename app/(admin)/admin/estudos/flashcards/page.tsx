import { redirect } from "next/navigation";
import { CARTOES, getEstadosCartoes, getRespostas, QUESTAO_POR_ID } from "@/lib/db-estudos";
import { todayBelemDateString } from "@/lib/atividades-utils";
import { ETAPA_FINAL, etapaDoCartao, venceCartao } from "@/lib/estudos-revisao";
import { htmlSeguro } from "@/lib/estudos-html";
import { BARALHO_ERROS, cartoesDosErros, type CartaoErro } from "@/lib/estudos-erros-cartoes";
import { htmlDoCartaoErro } from "@/lib/estudos-revisao-hoje";
import { lugarComCache, SEM_ASSUNTO, SEM_SUB } from "@/lib/estudos-cartoes-assunto";
import { Cabecalho } from "@/components/estudos/ui";
import { FlashcardsClient, type Assunto, type Baralho, type CartaoFlash } from "@/components/estudos/FlashcardsClient";

type Modo = "todos" | "vencidos" | "novos" | "esquecidos";

export default async function FlashcardsPage(props: PageProps<"/admin/estudos/flashcards">) {
  const sp = await props.searchParams;
  const s = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  let estados, respostas;
  try {
    [estados, respostas] = await Promise.all([getEstadosCartoes(), getRespostas()]);
  } catch {
    redirect("/login");
  }
  const hoje = todayBelemDateString();

  const situacao = (id: string) => {
    const e = estados.get(id);
    if (!e) return { novo: true, vencido: false, esquecido: false, dominado: false, etapa: -1 };
    const etapa = etapaDoCartao(e);
    const vence = venceCartao(e);
    const ultimo = e.hist?.at(-1);
    return {
      novo: false,
      vencido: etapa < ETAPA_FINAL && !!vence && vence <= hoje,
      esquecido: ultimo ? !ultimo.ok : false,
      dominado: etapa >= ETAPA_FINAL,
      etapa,
    };
  };

  // Baralho gerado dos erros dela: um cartão por questão errada, com o texto da própria questão.
  const erros = cartoesDosErros(respostas, QUESTAO_POR_ID);
  const sitsErros = erros.map((c) => situacao(c.id));
  const baralhoErros: Baralho = {
    nome: BARALHO_ERROS,
    total: erros.length,
    novos: sitsErros.filter((x) => x.novo).length,
    vencidos: sitsErros.filter((x) => x.vencido).length,
    dominados: sitsErros.filter((x) => x.dominado).length,
    comLei: erros.filter((c) => c.fonte).length,
    doErro: true,
  };

  const nomes = [...new Set(CARTOES.map((c) => c.b))];
  const baralhosFixos: Baralho[] = nomes.map((nome) => {
    const doBaralho = CARTOES.filter((c) => c.b === nome);
    const sits = doBaralho.map((c) => situacao(c.id));
    return {
      nome,
      total: doBaralho.length,
      novos: sits.filter((x) => x.novo).length,
      vencidos: sits.filter((x) => x.vencido).length,
      dominados: sits.filter((x) => x.dominado).length,
      comLei: doBaralho.filter((c) => c.lei).length,
    };
  });

  const baralhos = erros.length ? [baralhoErros, ...baralhosFixos] : baralhosFixos;
  const baralho = nomes.includes(s("baralho")) || (s("baralho") === BARALHO_ERROS && erros.length) ? s("baralho") : "";
  const subtema = baralho === BARALHO_ERROS && erros.some((c) => c.grupo === s("subtema")) ? s("subtema") : "";
  // assunto (tema do edital) e subtópico (subtema) dos cartões do baralho escolhido
  const doBaralho = baralho && baralho !== BARALHO_ERROS ? CARTOES.filter((c) => c.b === baralho) : [];
  const assuntosMap = new Map<string, Assunto>();
  for (const c of doBaralho) {
    const l = lugarComCache(c);
    const st = situacao(c.id);
    const a = assuntosMap.get(l.assunto) ?? { nome: l.assunto, total: 0, vencidos: 0, novos: 0, subs: [] };
    a.total++;
    if (st.vencido) a.vencidos++;
    if (st.novo) a.novos++;
    const subId = l.sub || "-";
    let sb = a.subs.find((x) => x.id === subId);
    if (!sb) a.subs.push((sb = { id: subId, nome: l.sub ? l.subNome : SEM_SUB, total: 0, vencidos: 0 }));
    sb.total++;
    if (st.vencido) sb.vencidos++;
    assuntosMap.set(l.assunto, a);
  }
  const assuntos = [...assuntosMap.values()]
    .map((a) => ({ ...a, subs: a.subs.sort((x, y) => Number(x.id === "-") - Number(y.id === "-") || y.total - x.total) }))
    .sort((x, y) => Number(x.nome === SEM_ASSUNTO) - Number(y.nome === SEM_ASSUNTO) || y.total - x.total);
  const assunto = assuntosMap.has(s("assunto")) ? s("assunto") : "";
  const sub = assunto && assuntosMap.get(assunto)!.subs.some((x) => x.id === s("sub")) ? s("sub") : "";

  const nivel = ["1", "2", "3"].includes(s("nivel")) ? Number(s("nivel")) : 0;
  const modo: Modo = ["vencidos", "novos", "esquecidos"].includes(s("modo")) ? (s("modo") as Modo) : "todos";

  const filtraModo = (st: ReturnType<typeof situacao>) =>
    modo === "vencidos" ? st.vencido : modo === "novos" ? st.novo : modo === "esquecidos" ? st.esquecido : true;

  const cartoes: CartaoFlash[] = baralho === BARALHO_ERROS
    ? erros
        .filter((c) => !subtema || c.grupo === subtema)
        .map((c) => ({ c, st: situacao(c.id) }))
        .filter(({ st }) => filtraModo(st))
        // vencidos primeiro; a lista já vem com "ainda errando" antes de "superado"
        .sort((a, b) => Number(b.st.vencido) - Number(a.st.vencido))
        .map(({ c, st }) => cartaoDoErro(c, st.etapa))
    : baralho
    ? doBaralho
        .filter((c) => !assunto || lugarComCache(c).assunto === assunto)
        .filter((c) => !sub || (lugarComCache(c).sub || "-") === sub)
        .filter((c) => !nivel || (c.nv ?? 2) === nivel)
        .map((c) => ({ c, st: situacao(c.id) }))
        .filter(({ st }) => filtraModo(st))
        // vencidos primeiro, depois do fácil ao difícil
        .sort((a, b) => Number(b.st.vencido) - Number(a.st.vencido) || (a.c.nv ?? 2) - (b.c.nv ?? 2))
        .map(({ c, st }) => ({
          id: c.id,
          baralho: c.b,
          frente: htmlSeguro(c.f),
          verso: htmlSeguro(c.v),
          extra: c.x ? htmlSeguro(c.x) : "",
          lei: c.lei ? htmlSeguro(c.lei) : "",
          fcc: c.fcc ? htmlSeguro(c.fcc) : "",
          nivel: c.nv ?? 0,
          etapa: st.etapa,
          lugar: (() => {
            const l = lugarComCache(c);
            return l.sub ? `${l.assunto} · ${l.subNome}` : l.assunto;
          })(),
          respAnterior: typeof estados.get(c.id)?.resp === "string" ? (estados.get(c.id)!.resp as string) : "",
        }))
    : [];
  const subtemaNome = subtema ? erros.find((c) => c.grupo === subtema)?.grupoNome ?? "" : "";

  return (
    <>
      <Cabecalho
        titulo="Flashcards"
        sub="Escolha a matéria, o assunto e o subtópico. Pense na resposta, vire o cartão e diga como foi: Errei, Quase ou Acertei. Tudo conta na mesma revisão espaçada (1, 3, 7, 15 e 30 dias)."
      />
      <FlashcardsClient key={`${baralho}|${nivel}|${modo}|${subtema}|${assunto}|${sub}`} baralhos={baralhos} assuntos={assuntos} filtros={{ baralho, nivel, modo, subtema, assunto, sub }} subtemaNome={subtemaNome} cartoes={cartoes} />
    </>
  );
}

/** Frente: o enunciado e o que ela marcou. Verso: por que está errado, o certo, a lei seca, a nota e a regra. */
function cartaoDoErro(c: CartaoErro, etapa: number): CartaoFlash {
  return {
    id: c.id,
    ...htmlDoCartaoErro(c),
    nivel: 0,
    etapa,
    questaoHref: `/admin/estudos/questoes?materia=${c.materia_id}&id=${c.questao_id}`,
  };
}
