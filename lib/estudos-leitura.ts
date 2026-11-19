// Leitura diária: junta jurisprudência, lei seca, macetes e certo-ou-errado de todos os cadernos.
// Sai direto dos cadernos, então toda aula nova entra aqui sem passo extra.
import { CADERNOS } from "@/lib/db-estudos-cadernos";
import type { Bloco } from "@/lib/estudos-cadernos";

export type TipoLeitura = "juris" | "lei" | "macete" | "vf";
export const TIPO_LEITURA_LABEL: Record<TipoLeitura, string> = {
  juris: "Jurisprudência",
  lei: "Lei seca",
  macete: "Macetes",
  vf: "Certo ou errado",
};

export interface ItemLeitura {
  chave: string;
  tipo: TipoLeitura;
  materia_id: string;
  materia: string;
  aula_id: string;
  aula: string;
  secao: string;
  bloco: Bloco;
  /** Macete da Prof. Adriane Fauth. */
  adri: boolean;
}

function tipoDo(b: Bloco): TipoLeitura | null {
  if (b.t === "juris" || b.t === "lei" || b.t === "vf") return b.t;
  if (b.t === "nota" && b.tom === "macete") return "macete";
  return null;
}

export const LEITURA: ItemLeitura[] = Object.values(CADERNOS).flatMap((c) =>
  c.aulas.flatMap((a) =>
    (a.secoes ?? []).flatMap((s, i) =>
      s.blocos.flatMap((b, j) => {
        const tipo = tipoDo(b);
        if (!tipo) return [];
        const adri = b.t === "nota" && /professora|adri/i.test(`${b.titulo} ${a.fonte ?? ""}`);
        return [{ chave: `${a.id}-${i}-${j}`, tipo, materia_id: c.materia_id, materia: c.titulo, aula_id: a.id, aula: a.titulo, secao: s.titulo, bloco: b, adri }];
      }),
    ),
  ),
);

/** Número pseudoaleatório estável por texto: a leitura de hoje é a mesma o dia todo e muda no dia seguinte. */
function semente(texto: string) {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) h = Math.imul(h ^ texto.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

const COTA: [TipoLeitura, number][] = [["juris", 4], ["lei", 4], ["macete", 2], ["vf", 1]];

/** Leitura do dia: prioriza as matérias do cronograma de hoje; completa com as demais se faltar. */
export function leituraDoDia(data: string, materiasHoje: string[]): ItemLeitura[] {
  const rnd = semente(data);
  const embaralhar = (xs: ItemLeitura[]) => xs.map((x) => [rnd(), x] as const).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
  const hoje = new Set(materiasHoje);
  return COTA.flatMap(([tipo, n]) => {
    const doTipo = LEITURA.filter((x) => x.tipo === tipo);
    const preferidos = embaralhar(doTipo.filter((x) => hoje.has(x.materia_id)));
    const resto = embaralhar(doTipo.filter((x) => !hoje.has(x.materia_id)));
    return [...preferidos, ...resto].slice(0, n);
  });
}
