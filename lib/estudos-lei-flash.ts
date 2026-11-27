// Lei seca em flashcard (pedido dela, 27/11): o artigo que ela errou vira cartão (frente: a referência;
// verso: o texto vigente) e, depois de ler, um treino rápido só com itens que JÁ existem no banco
// (trilhas.json em certo/errado e desafios.json em lacuna/pegadinha). Nada é escrito à mão aqui.
import { TRILHAS } from "@/lib/db-estudos-trilhas";
import { DESAFIOS } from "@/lib/db-estudos-desafios";
import { htmlSeguro } from "@/lib/estudos-html";

export interface TreinoLei {
  id: string;
  ref: string;
  /** "ce": certo ou errado; "lacuna": escolher a palavra que falta */
  tipo: "ce" | "lacuna";
  /** enunciado já em HTML seguro */
  texto: string;
  opcoes: string[];
  resposta: string;
  /** texto literal do dispositivo, para mostrar depois de responder */
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
function chaveLei(lei: string): string {
  const k = lei.trim().toLowerCase();
  return ALIAS[k] ?? k;
}

/** "CTN, arts. 151, 156 e 175" → lei "ctn" e artigos {151,156,175}. Faixas curtas ("55 a 57") são abertas. */
export function artigosDaRef(ref: string): { lei: string; arts: Set<string> } | null {
  const m = ref.match(/^(.*?),?\s+arts?\.\s*(.*)$/i);
  if (!m) return null;
  const lei = chaveLei(m[1]);
  // corta parágrafos e incisos: o que vem depois de "§" ou de vírgula seguida de inciso romano não é artigo
  const resto = m[2].replace(/§+\s*[\dº°o]+/g, " ").replace(/\b[IVXLC]+\b/g, " ").replace(/parágrafo único/gi, " ");
  const arts = new Set<string>();
  const nums = [...resto.matchAll(/(\d{1,2}\.\d{3}|\d+)(?:-([A-Z]))?\s*[º°o]?(\s+a\s+(\d{1,2}\.\d{3}|\d+))?/g)];
  for (const n of nums) {
    const de = Number(n[1].replace(".", ""));
    const ate = n[4] ? Number(n[4].replace(".", "")) : de;
    for (let a = de; a <= ate && a - de <= 10; a++) arts.add(String(a) + (n[2] && a === de ? `-${n[2]}` : ""));
  }
  return arts.size ? { lei, arts } : null;
}

/** Primeiro artigo de uma referência de dispositivo ("Lei 9.784/1999, art. 2º, Parágrafo único, XII" → 2). */
function artigoDoItem(ref: string): { lei: string; art: string } | null {
  const m = ref.match(/^(.*?),\s*art\.\s*(\d{1,2}\.\d{3}|\d+)(?:-([A-Z]))?/i);
  if (!m) return null;
  return { lei: chaveLei(m[1]), art: String(Number(m[2].replace(".", ""))) + (m[3] ? `-${m[3]}` : "") };
}

interface Bruto {
  id: string;
  ref: string;
  lei: string;
  art: string;
  item: TreinoLei;
}
let INDICE: Map<string, Bruto[]> | null = null;
function indice(): Map<string, Bruto[]> {
  if (INDICE) return INDICE;
  const idx = new Map<string, Bruto[]>();
  const por = (b: Bruto) => {
    const k = `${b.lei}|${b.art}`;
    idx.set(k, [...(idx.get(k) ?? []), b]);
  };
  for (const t of TRILHAS)
    for (const tema of t.temas)
      for (const i of tema.itens) {
        const a = artigoDoItem(i.ref);
        if (!a) continue;
        por({
          id: i.id,
          ref: i.ref,
          ...a,
          item: {
            id: i.id,
            ref: i.ref,
            tipo: "ce",
            texto: htmlSeguro((i.contexto ? i.contexto + "\n" : "") + i.texto).replace(/\n/g, "<br>"),
            opcoes: ["Certo", "Errado"],
            resposta: i.certo ? "Certo" : "Errado",
            literal: htmlSeguro(i.literal),
          },
        });
      }
  for (const d of DESAFIOS as unknown as Record<string, unknown>[]) {
    const ref = String(d.ref ?? "");
    const a = artigoDoItem(ref);
    if (!a) continue;
    const lacuna = d.tipo === "lacuna";
    por({
      id: String(d.id),
      ref,
      ...a,
      item: {
        id: String(d.id),
        ref,
        tipo: lacuna ? "lacuna" : "ce",
        texto: htmlSeguro(String(d.texto ?? "")).replace(/_{3,}/g, "<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>"),
        opcoes: lacuna ? ((d.opcoes as string[]) ?? []) : ["Certo", "Errado"],
        resposta: lacuna ? String(d.resposta ?? "") : d.certo ? "Certo" : "Errado",
        literal: htmlSeguro(String(d.literal ?? "")),
      },
    });
  }
  INDICE = idx;
  return idx;
}

/** Até `max` itens de treino dos artigos citados na referência da questão (mistura C/E e lacuna). */
export function treinoDoArtigo(ref: string, max = 5): TreinoLei[] {
  const r = artigosDaRef(ref);
  if (!r) return [];
  const idx = indice();
  const achados: Bruto[] = [];
  for (const art of r.arts) achados.push(...(idx.get(`${r.lei}|${art}`) ?? []));
  // alterna tipos e evita repetir o mesmo dispositivo
  const vistos = new Set<string>();
  const ce = achados.filter((b) => b.item.tipo === "ce");
  const lac = achados.filter((b) => b.item.tipo === "lacuna");
  const out: TreinoLei[] = [];
  for (let i = 0; out.length < max && (i < ce.length || i < lac.length); i++) {
    for (const b of [lac[i], ce[i]]) {
      if (!b || out.length >= max || vistos.has(b.ref + b.item.tipo)) continue;
      vistos.add(b.ref + b.item.tipo);
      out.push(b.item);
    }
  }
  return out;
}
