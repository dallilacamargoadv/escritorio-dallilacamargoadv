// Lei seca em flashcard de certo ou errado (pedido dela, 27/11): o cartão abre com o texto do dispositivo,
// às vezes com uma palavra trocada, e pergunta se está certo. O texto verdadeiro só aparece depois da resposta.
// Só itens que JÁ existem no banco (trilhas.json e as pegadinhas de desafios.json). Nada é escrito à mão aqui.
import { TRILHAS } from "@/lib/db-estudos-trilhas";
import { DESAFIOS } from "@/lib/db-estudos-desafios";
import { htmlSeguro } from "@/lib/estudos-html";

export interface CertoErradoLei {
  id: string;
  ref: string;
  /** o texto apresentado (pode ter a troca), em HTML seguro */
  texto: string;
  certo: boolean;
  /** texto verdadeiro do dispositivo, com a palavra trocada grifada quando houver */
  literal: string;
}

const ALIAS: Record<string, string> = {
  "cf/88": "cf",
  cf88: "cf",
  "código civil": "cc",
  "codigo civil": "cc",
  "lei 6.830/80": "lei 6.830/1980",
  "lei 8.429/92": "lei 8.429/1992",
  "lei 9.784/99": "lei 9.784/1999",
};
const chaveLei = (lei: string) => ALIAS[lei.trim().toLowerCase()] ?? lei.trim().toLowerCase();

/** "CTN, arts. 151, 156 e 175" → lei "ctn" e artigos {151,156,175}. Faixas curtas ("55 a 57") são abertas. */
export function artigosDaRef(ref: string): { lei: string; arts: Set<string> } | null {
  const m = ref.match(/^(.*?),?\s+arts?\.\s*(.*)$/i);
  if (!m) return null;
  // parágrafos, incisos e "parágrafo único" não são artigos
  const resto = m[2].replace(/§+\s*[\dº°o]+/g, " ").replace(/\b[IVXLC]+\b/g, " ").replace(/parágrafo único/gi, " ");
  const arts = new Set<string>();
  for (const n of resto.matchAll(/(\d{1,2}\.\d{3}|\d+)(?:-([A-Z]))?\s*[º°o]?(\s+a\s+(\d{1,2}\.\d{3}|\d+))?/g)) {
    const de = Number(n[1].replace(".", ""));
    const ate = n[4] ? Number(n[4].replace(".", "")) : de;
    for (let a = de; a <= ate && a - de <= 10; a++) arts.add(String(a) + (n[2] && a === de ? `-${n[2]}` : ""));
  }
  return arts.size ? { lei: chaveLei(m[1]), arts } : null;
}

/** Artigo de uma referência de dispositivo ("Lei 9.784/1999, art. 2º, Parágrafo único, XII" → 2). */
function artigoDoItem(ref: string): string | null {
  const m = ref.match(/^(.*?),\s*art\.\s*(\d{1,2}\.\d{3}|\d+)(?:-([A-Z]))?/i);
  return m ? `${chaveLei(m[1])}|${Number(m[2].replace(".", ""))}${m[3] ? `-${m[3]}` : ""}` : null;
}

/** Grifa a palavra original no texto verdadeiro, para ela ver onde estava a troca. */
function grifar(literal: string, original: string): string {
  const html = htmlSeguro(literal);
  const o = htmlSeguro(original);
  return o && html.includes(o) ? html.replace(o, `<mark>${o}</mark>`) : html;
}

let INDICE: Map<string, CertoErradoLei[]> | null = null;
function indice(): Map<string, CertoErradoLei[]> {
  if (INDICE) return INDICE;
  const idx = new Map<string, CertoErradoLei[]>();
  const por = (k: string | null, it: CertoErradoLei) => k && idx.set(k, [...(idx.get(k) ?? []), it]);
  for (const t of TRILHAS)
    for (const tema of t.temas)
      for (const i of tema.itens)
        por(artigoDoItem(i.ref), {
          id: i.id,
          ref: i.ref,
          texto: htmlSeguro((i.contexto ? i.contexto + "\n" : "") + i.texto).replace(/\n/g, "<br>"),
          certo: i.certo,
          literal: grifar(i.literal, i.certo ? "" : i.original),
        });
  for (const d of DESAFIOS as unknown as Record<string, unknown>[]) {
    if (d.tipo !== "pegadinha") continue;
    const ref = String(d.ref ?? "");
    por(artigoDoItem(ref), {
      id: String(d.id),
      ref,
      texto: htmlSeguro(String(d.texto ?? "")),
      certo: !!d.certo,
      literal: grifar(String(d.literal ?? ""), d.certo ? "" : String(d.original ?? "")),
    });
  }
  INDICE = idx;
  return idx;
}

/** Até `max` itens de certo ou errado dos artigos citados na referência da questão, sem repetir dispositivo. */
export function certoErradoDoArtigo(ref: string, max = 5): CertoErradoLei[] {
  const r = artigosDaRef(ref);
  if (!r) return [];
  const idx = indice();
  const vistos = new Set<string>();
  const out: CertoErradoLei[] = [];
  for (const art of r.arts)
    for (const it of idx.get(`${r.lei}|${art}`) ?? []) {
      if (out.length >= max || vistos.has(it.ref)) continue;
      vistos.add(it.ref);
      out.push(it);
    }
  return out;
}
