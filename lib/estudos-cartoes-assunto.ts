// Liga cada cartão a um assunto (tema do edital) e a um subtópico (subtema das questões).
// Cartão com `tema` usa o próprio tema. Cartão sem tema só ganha assunto se o texto dele bater
// com folga num subtema da mesma matéria. Sem folga, fica em "Outros": melhor sem lugar do que no lugar errado.
// Arquivo puro (Server e Client).
import { SUBTEMAS } from "@/lib/estudos-subtemas";
import type { Cartao } from "@/lib/estudos-revisao";

export const SEM_ASSUNTO = "Outros da matéria";
export const SEM_SUB = "Outros do assunto";

/** baralho → prefixo dos ids de subtema da mesma matéria */
const PREFIXO: Record<string, string> = {
  Constitucional: "cf",
  Administrativo: "adm",
  "Tributário": "trib",
  "Processo Civil": "cpc",
  "Raciocínio Lógico": "rl",
  "Informática": "inf",
};

/** pontuação mínima para aceitar a ligação (conferida à mão nos cartões de Constitucional em 23/11) */
const MINIMO = 9;

const VAZIAS = new Set(
  "sobre quando entre outra outro pela pelos pelas desde ainda depois antes porque sempre nunca tambem podem pode deve devem artigo constituicao federal estado sendo serao forma regra caso casos leis".split(" "),
);

function palavras(t: string): Set<string> {
  const limpo = t
    .replace(/<[^>]+>/g, " ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  return new Set((limpo.match(/[a-z]{5,}/g) ?? []).filter((w) => !VAZIAS.has(w)));
}

const comuns = (a: Set<string>, b: Set<string>) => {
  let n = 0;
  for (const w of a) if (b.has(w)) n++;
  return n;
};

export interface LugarCartao {
  assunto: string;
  /** id do subtema, ou "" */
  sub: string;
  subNome: string;
}

let cacheSubs: { id: string; pre: string; tema: string; nome: string; pNome: Set<string>; pTudo: Set<string> }[] | null = null;
function subtemas() {
  cacheSubs ??= Object.entries(SUBTEMAS).map(([id, s]) => {
    const pNome = palavras(s.nome);
    return { id, pre: id.split("-")[0], tema: s.tema, nome: s.nome, pNome, pTudo: new Set([...pNome, ...palavras(s.revisao)]) };
  });
  return cacheSubs;
}

export function lugarDoCartao(c: Cartao): LugarCartao {
  const pre = PREFIXO[c.b];
  const assuntoProprio = c.tema ?? "";
  if (!pre) return { assunto: assuntoProprio || SEM_ASSUNTO, sub: "", subNome: SEM_SUB };
  const texto = palavras(`${c.f} ${c.v}`);
  let melhor: { id: string; tema: string; nome: string } | null = null;
  let nota = 0;
  for (const s of subtemas()) {
    if (s.pre !== pre || (assuntoProprio && s.tema !== assuntoProprio)) continue;
    const n = comuns(texto, s.pTudo) + 2 * comuns(texto, s.pNome);
    if (n > nota) {
      nota = n;
      melhor = s;
    }
  }
  if (melhor && nota >= MINIMO) return { assunto: assuntoProprio || melhor.tema, sub: melhor.id, subNome: melhor.nome };
  return { assunto: assuntoProprio || SEM_ASSUNTO, sub: "", subNome: SEM_SUB };
}

const cacheLugar = new Map<string, LugarCartao>();
export function lugarComCache(c: Cartao): LugarCartao {
  let l = cacheLugar.get(c.id);
  if (!l) {
    l = lugarDoCartao(c);
    cacheLugar.set(c.id, l);
  }
  return l;
}
