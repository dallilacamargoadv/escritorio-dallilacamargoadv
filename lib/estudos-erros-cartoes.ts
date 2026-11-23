// Cartões e mapa mental gerados dos erros dela. Arquivo puro (Server e Client).
// Nada é escrito à mão aqui: o texto sai da questão (enunciado, gabarito comentado, lei seca),
// do que ela marcou e anotou em estudo_respostas e da regra do subtema (content/estudos/subtemas.json).
import { cadernoDeErros, CLASSIFICACAO_LABEL, EH_ERRO, type Classificacao, type ErroCaderno, type Questao, type Resposta } from "@/lib/estudos-desempenho";
import { SUBTEMAS } from "@/lib/estudos-subtemas";
import { MATERIA_POR_ID } from "@/lib/estudos-utils";

export const BARALHO_ERROS = "Dos meus erros";
export const PREFIXO_ERRO = "erro:";

export interface CartaoErro extends ErroCaderno {
  /** id do cartão em estudo_cartoes: "erro:<questão>" */
  id: string;
  materia_id: string;
  materia: string;
  /** chave do grupo no mapa: o subtema, ou "tema:<tema>" quando a questão ainda não tem subtema */
  grupo: string;
  grupoNome: string;
  enun: string;
  itens: string[];
  fonte: string;
  alerta: string;
  regra: string;
}

export function rotuloMotivo(m: Classificacao): string {
  return EH_ERRO.has(m) ? CLASSIFICACAO_LABEL[m] : `Acertou ${CLASSIFICACAO_LABEL[m].toLowerCase()}`;
}

/** Um cartão por questão errada (ou acertada sem firmeza), de todas as matérias. Ainda errando vem primeiro. */
export function cartoesDosErros(respostas: Resposta[], questoes: Map<string, Questao>): CartaoErro[] {
  const materias = [...new Set(respostas.map((r) => r.materia_id))];
  const out: CartaoErro[] = [];
  for (const mid of materias) {
    for (const e of cadernoDeErros(respostas, mid, questoes)) {
      const q = questoes.get(e.questao_id);
      if (!q) continue;
      const sub = e.subtema ? SUBTEMAS[e.subtema] : null;
      out.push({
        ...e,
        id: PREFIXO_ERRO + e.questao_id,
        materia_id: mid,
        materia: MATERIA_POR_ID.get(mid)?.nome ?? q.mat,
        grupo: e.subtema ?? "tema:" + e.tema,
        grupoNome: sub?.nome ?? e.tema,
        enun: q.enun,
        itens: q.itens ?? [],
        fonte: q.fonte ?? "",
        alerta: q.alerta ?? "",
        regra: sub?.revisao ?? "",
      });
    }
  }
  return out.sort((a, b) => Number(a.superado) - Number(b.superado) || b.vezes - a.vezes);
}

export interface NoSubtema {
  chave: string;
  nome: string;
  vezes: number;
  pendentes: number;
  regra: string;
  /** só o subtema de verdade tem filtro nas questões */
  temFiltro: boolean;
  erros: CartaoErro[];
}
export interface NoTema {
  tema: string;
  vezes: number;
  pendentes: number;
  subtemas: NoSubtema[];
}
export interface NoMateria {
  materia_id: string;
  materia: string;
  vezes: number;
  pendentes: number;
  questoes: number;
  temas: NoTema[];
}

const porPeso = <T extends { pendentes: number; vezes: number }>(a: T, b: T) => Number(a.pendentes === 0) - Number(b.pendentes === 0) || b.vezes - a.vezes;

/** Mapa mental: matéria → tema → subtema → questões erradas. */
export function mapaDosErros(cartoes: CartaoErro[]): NoMateria[] {
  const mats = new Map<string, NoMateria>();
  for (const c of cartoes) {
    const m = mats.get(c.materia_id) ?? { materia_id: c.materia_id, materia: c.materia, vezes: 0, pendentes: 0, questoes: 0, temas: [] };
    let t = m.temas.find((x) => x.tema === c.tema);
    if (!t) m.temas.push((t = { tema: c.tema, vezes: 0, pendentes: 0, subtemas: [] }));
    let s = t.subtemas.find((x) => x.chave === c.grupo);
    if (!s) t.subtemas.push((s = { chave: c.grupo, nome: c.grupoNome, vezes: 0, pendentes: 0, regra: c.regra, temFiltro: !c.grupo.startsWith("tema:"), erros: [] }));
    const pend = c.superado ? 0 : 1;
    s.erros.push(c);
    for (const n of [m, t, s]) {
      n.vezes += c.vezes;
      n.pendentes += pend;
    }
    m.questoes++;
    mats.set(c.materia_id, m);
  }
  return [...mats.values()]
    .map((m) => ({ ...m, temas: m.temas.map((t) => ({ ...t, subtemas: t.subtemas.sort(porPeso) })).sort(porPeso) }))
    .sort((a, b) => b.vezes - a.vezes);
}
