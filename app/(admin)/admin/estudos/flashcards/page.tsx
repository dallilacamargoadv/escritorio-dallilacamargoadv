import { redirect } from "next/navigation";
import { CARTOES, getEstadosCartoes, getRespostas, QUESTAO_POR_ID } from "@/lib/db-estudos";
import { todayBelemDateString } from "@/lib/atividades-utils";
import { ETAPA_FINAL, etapaDoCartao, venceCartao } from "@/lib/estudos-revisao";
import { fonteHtml, htmlSeguro } from "@/lib/estudos-html";
import { BARALHO_ERROS, cartoesDosErros, rotuloMotivo, type CartaoErro } from "@/lib/estudos-erros-cartoes";
import { Cabecalho } from "@/components/estudos/ui";
import { FlashcardsClient, type Baralho, type CartaoFlash } from "@/components/estudos/FlashcardsClient";

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
    ? CARTOES.filter((c) => c.b === baralho)
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
        }))
    : [];
  const subtemaNome = subtema ? erros.find((c) => c.grupo === subtema)?.grupoNome ?? "" : "";

  return (
    <>
      <Cabecalho
        titulo="Flashcards"
        sub="Todos os cartões, por matéria e por nível, sem limite diário. Lembrei e Esqueci contam na mesma revisão espaçada da aba Revisão. O baralho Dos meus erros é montado das questões que você errou."
      />
      <FlashcardsClient key={`${baralho}|${nivel}|${modo}|${subtema}`} baralhos={baralhos} filtros={{ baralho, nivel, modo, subtema }} subtemaNome={subtemaNome} cartoes={cartoes} />
    </>
  );
}

/** Frente: o enunciado e o que ela marcou. Verso: por que está errado, o certo, a lei seca, a nota e a regra. */
function cartaoDoErro(c: CartaoErro, etapa: number): CartaoFlash {
  const p = c.pegadinhas[0];
  const rotulo = (t: string) => `<span class="block text-[11px] uppercase tracking-[0.14em] text-e-dim">${t}</span>`;
  const itens = c.itens.length ? `<br>${c.itens.map(htmlSeguro).join("<br>")}` : "";
  const frente =
    `<span class="block text-[11px] text-e-dim">${htmlSeguro(`${c.materia} · ${c.grupoNome} · ${c.ref}`)}</span>` +
    `<span class="mt-1 block">${htmlSeguro(c.enun)}${itens}</span>` +
    (p
      ? `<span class="mt-3 block border-l-2 border-e-bad/60 pl-3 text-sm">Você marcou: “${htmlSeguro(p.marcada)}”${p.vezes > 1 ? ` (${p.vezes} vezes)` : ""}</span>` +
        `<span class="mt-2 block text-sm text-e-dim">Por que está errado? Qual é o certo? Responda de cabeça antes de virar.</span>`
      : `<span class="mt-3 block text-sm text-e-dim">Você acertou sem firmeza. Qual é a resposta certa e por quê?</span>`);
  const verso =
    (p ? `${rotulo("Por que está errado")}<span class="mt-1 block border-l-2 border-e-bad/60 pl-3">${htmlSeguro(p.texto)}</span>` : "") +
    `<span class="${p ? "mt-3 " : ""}block">${rotulo("O certo")}</span><span class="mt-1 block border-l-2 border-e-ok/60 pl-3">${htmlSeguro(c.certa)}</span>`;
  const nota = c.notas.at(-1);
  const extra = [
    `Motivo: ${c.motivos.map(rotuloMotivo).join(", ")} · ${c.vezes === 1 ? "1 erro" : `${c.vezes} erros`}${c.superado ? " · já acertou firme depois" : ""}.`,
    nota ? `<i>Sua nota: “${htmlSeguro(nota.length > 400 ? nota.slice(0, 400) + "…" : nota)}”</i>` : "",
    c.regra ? `Regra do subtema: ${htmlSeguro(c.regra)}` : "",
  ]
    .filter(Boolean)
    .join("<br><br>");
  return {
    id: c.id,
    baralho: BARALHO_ERROS,
    frente,
    verso,
    extra,
    lei: c.fonte ? fonteHtml(c.fonte) : "",
    fcc: c.alerta ? htmlSeguro(c.alerta) : "",
    nivel: 0,
    etapa,
    questaoHref: `/admin/estudos/questoes?materia=${c.materia_id}&id=${c.questao_id}`,
  };
}
