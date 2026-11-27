// Jurisprudência em certo ou errado (pedido dela, 27/11): mesmo formato da lei seca. O texto da súmula ou da tese
// aparece primeiro, às vezes com uma palavra trocada; ela responde certo ou errado e só depois vê o texto oficial,
// com a troca grifada. Os itens saem de content/estudos/juris-ce.json, gerado por
// CONCURSO PGE-MA/geradores/gerar_cartoes_tema.py a partir dos cadernos e do campo `fonte` das questões.
// O progresso fica em estudo_cartoes, com o id do item ("jce-...").
import jurisJson from "@/content/estudos/juris-ce.json";
import { htmlSeguro } from "@/lib/estudos-html";
import type { CertoErradoLei } from "@/lib/estudos-lei-flash";

export interface ItemJuris {
  id: string;
  ref: string;
  materia_id: string;
  /** nome do baralho da matéria (Constitucional, Administrativo...) */
  b: string;
  tema: string;
  /** aula do caderno de onde veio, quando houver */
  aula: string | null;
  /** texto oficial (do caderno ou da fonte da questão) */
  literal: string;
  certo: boolean;
  /** texto apresentado: igual ao literal ou com a troca */
  texto: string;
  original?: string;
  troca?: string;
  /** posição da palavra original no literal */
  pos?: number;
}

export const JURIS_CE = jurisJson as ItemJuris[];
export const JURIS_POR_ID = new Map(JURIS_CE.map((j) => [j.id, j]));

/** Novos itens de jurisprudência por dia. */
export const NOVOS_JURIS_POR_DIA = 5;

/** Formato do cartão de certo ou errado (o mesmo da lei seca), com a palavra verdadeira grifada no literal. */
export function certoErradoJuris(j: ItemJuris): CertoErradoLei {
  let literal = htmlSeguro(j.literal);
  if (!j.certo && j.original && typeof j.pos === "number") {
    const antes = htmlSeguro(j.literal.slice(0, j.pos));
    const meio = htmlSeguro(j.literal.slice(j.pos, j.pos + j.original.length));
    const depois = htmlSeguro(j.literal.slice(j.pos + j.original.length));
    literal = `${antes}<mark>${meio}</mark>${depois}`;
  }
  return { id: j.id, ref: j.ref, texto: htmlSeguro(j.texto), certo: j.certo, literal };
}
