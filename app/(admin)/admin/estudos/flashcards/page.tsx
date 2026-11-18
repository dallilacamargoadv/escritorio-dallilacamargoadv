import { redirect } from "next/navigation";
import { CARTOES, getEstadosCartoes } from "@/lib/db-estudos";
import { todayBelemDateString } from "@/lib/atividades-utils";
import { ETAPA_FINAL, etapaDoCartao, venceCartao } from "@/lib/estudos-revisao";
import { htmlSeguro } from "@/lib/estudos-html";
import { Cabecalho } from "@/components/estudos/ui";
import { FlashcardsClient, type Baralho, type CartaoFlash } from "@/components/estudos/FlashcardsClient";

type Modo = "todos" | "vencidos" | "novos" | "esquecidos";

export default async function FlashcardsPage(props: PageProps<"/admin/estudos/flashcards">) {
  const sp = await props.searchParams;
  const s = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  let estados;
  try {
    estados = await getEstadosCartoes();
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

  const nomes = [...new Set(CARTOES.map((c) => c.b))];
  const baralhos: Baralho[] = nomes.map((nome) => {
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

  const baralho = nomes.includes(s("baralho")) ? s("baralho") : "";
  const nivel = ["1", "2", "3"].includes(s("nivel")) ? Number(s("nivel")) : 0;
  const modo: Modo = ["vencidos", "novos", "esquecidos"].includes(s("modo")) ? (s("modo") as Modo) : "todos";

  const cartoes: CartaoFlash[] = baralho
    ? CARTOES.filter((c) => c.b === baralho)
        .filter((c) => !nivel || (c.nv ?? 2) === nivel)
        .map((c) => ({ c, st: situacao(c.id) }))
        .filter(({ st }) => (modo === "vencidos" ? st.vencido : modo === "novos" ? st.novo : modo === "esquecidos" ? st.esquecido : true))
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

  return (
    <>
      <Cabecalho
        titulo="Flashcards"
        sub="Todos os cartões, por matéria e por nível, sem limite diário. Lembrei e Esqueci contam na mesma revisão espaçada da aba Revisão."
      />
      <FlashcardsClient key={`${baralho}|${nivel}|${modo}`} baralhos={baralhos} filtros={{ baralho, nivel, modo }} cartoes={cartoes} />
    </>
  );
}
