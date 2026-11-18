import { AULA_POR_ID, CADERNOS } from "@/lib/db-estudos-cadernos";
import { MATERIA_POR_ID, type CronogramaItem } from "@/lib/estudos-utils";

export type LinkBloco = { rotulo: string; href: string };

const BASE = "/admin/estudos";

/** aulas prontas de cada tópico do edital (um tópico pode ter várias), em ordem, para o bloco abrir direto no caderno */
function palavras(t: string): Set<string> {
  return new Set(
    t
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .split(/[^a-z0-9]+/)
      .filter((p) => p.length > 3),
  );
}

const AULAS_POR_TOPICO = new Map<string, { aula: string; numero: number; materia: string; palavras: Set<string> }[]>();
for (const { aula, caderno } of AULA_POR_ID.values()) {
  if (aula.status !== "pronta" || !aula.topico_id) continue;
  const lista = AULAS_POR_TOPICO.get(aula.topico_id) ?? [];
  lista.push({ aula: aula.id, numero: aula.numero, materia: caderno.materia_id, palavras: palavras(aula.titulo) });
  AULAS_POR_TOPICO.set(aula.topico_id, lista);
}

/** "aula N" no título abre essa aula; senão, a aula do tópico cujo título mais se parece com o do bloco */
function aulaDoBloco(item: CronogramaItem) {
  const lista = item.topico_id ? AULAS_POR_TOPICO.get(item.topico_id) : undefined;
  if (!lista?.length) return undefined;
  const n = Number(/\baula (\d+)\b/i.exec(item.titulo)?.[1]);
  const pelaNumero = lista.find((a) => a.numero === n);
  if (pelaNumero) return pelaNumero;
  const doBloco = palavras(item.titulo);
  const nota = (a: (typeof lista)[number]) => [...a.palavras].filter((p) => doBloco.has(p)).length;
  return [...lista].sort((a, b) => nota(b) - nota(a) || a.numero - b.numero)[0];
}

/** Atalhos de cada bloco do cronograma: leva direto ao material (fila de revisão, caderno, questões, lei seca). */
export function linksDoBloco(item: CronogramaItem): LinkBloco[] {
  const materia = MATERIA_POR_ID.has(item.materia_id) ? item.materia_id : "";
  const questoes = materia ? { rotulo: "Questões", href: `${BASE}/questoes?materia=${materia}` } : { rotulo: "Questões", href: `${BASE}/questoes` };
  const caderno = (): LinkBloco | null => {
    const a = aulaDoBloco(item);
    if (a) return { rotulo: "Aula no caderno", href: `${BASE}/cadernos/${a.materia}?aula=${a.aula}` };
    if (materia && CADERNOS[materia]) return { rotulo: "Caderno", href: `${BASE}/cadernos/${materia}` };
    return null;
  };
  const leiSeca = { rotulo: "Lei seca", href: `${BASE}/desafios/trilha` };

  switch (item.tipo) {
    case "revisao":
      if (/laborat/i.test(item.titulo)) return [{ rotulo: "Laboratório de erros", href: `${BASE}/laboratorio` }];
      if (/lei seca/i.test(item.titulo)) return [leiSeca];
      return [
        { rotulo: "Cartões e questões de hoje", href: `${BASE}/revisao` },
        { rotulo: "Erradas para refazer", href: `${BASE}/questoes?status=erradas` },
        leiSeca,
      ];
    case "lei_seca":
      return [leiSeca, ...(materia ? [questoes] : [])];
    case "teoria":
      return [caderno(), questoes].filter((l): l is LinkBloco => !!l);
    case "questoes":
      if (item.materia_id === "SIM") return [{ rotulo: "Simulados", href: `${BASE}/simulados` }, { rotulo: "Revisão", href: `${BASE}/revisao` }];
      return [questoes];
    case "simulado":
      return [{ rotulo: "Simulados", href: `${BASE}/simulados` }];
    case "discursiva":
      return [{ rotulo: "Redação e discursiva", href: `${BASE}/redacao` }];
    default:
      return [];
  }
}

export function linksDosBlocos(itens: CronogramaItem[]): Record<string, LinkBloco[]> {
  return Object.fromEntries(itens.map((i) => [i.id, linksDoBloco(i)]));
}
