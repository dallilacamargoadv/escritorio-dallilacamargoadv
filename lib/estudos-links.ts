import { AULA_POR_ID, CADERNOS } from "@/lib/db-estudos-cadernos";
import { CARTOES, QUESTOES } from "@/lib/db-estudos";
import { TRILHAS } from "@/lib/db-estudos-trilhas";
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


/** Baralho de flashcards de cada matéria (nome do baralho em cartoes.json). */
const BARALHO_DA_MATERIA: Record<string, string> = {
  A1: "Português", A2: "Raciocínio Lógico", A3: "Informática", B2: "Administrativo", B3: "Constitucional",
  B5: "Processo Civil", B6: "Civil", B7: "Tributário", B8: "Financeiro",
};

/** Temas de questões de cada matéria, com as palavras do nome, para achar o tema de um bloco. */
const TEMAS_DA_MATERIA = new Map<string, { tema: string; palavras: Set<string> }[]>();
for (const q of QUESTOES) {
  const lista = TEMAS_DA_MATERIA.get(q.materia_id) ?? [];
  if (!lista.some((t) => t.tema === q.tema)) lista.push({ tema: q.tema, palavras: palavras(q.tema) });
  TEMAS_DA_MATERIA.set(q.materia_id, lista);
}

/**
 * Tema do bloco (pedido dela, 24/11: o link do dia não pode cair no geral). Procura o nome do tema
 * no título do bloco e, se não achar, o tema que mais se parece com o título do bloco e da aula.
 */
function temaDoBloco(item: CronogramaItem): string | null {
  const lista = TEMAS_DA_MATERIA.get(item.materia_id);
  if (!lista?.length) return null;
  const titulo = item.titulo.toLowerCase();
  const literal = [...lista].sort((a, b) => b.tema.length - a.tema.length).find((t) => titulo.includes(t.tema.toLowerCase()));
  if (literal) return literal.tema;
  const aula = aulaDoBloco(item);
  const alvo = palavras(item.titulo + " " + (aula ? (AULA_POR_ID.get(aula.aula)?.aula.titulo ?? "") : ""));
  let melhor: { tema: string; nota: number } | null = null;
  for (const t of lista) {
    const nota = [...t.palavras].filter((p) => alvo.has(p)).length / Math.max(1, t.palavras.size);
    if (nota > 0 && (!melhor || nota > melhor.nota)) melhor = { tema: t.tema, nota };
  }
  return melhor && melhor.nota >= 0.5 ? melhor.tema : null;
}

function qs(o: Record<string, string | null | undefined>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(o)) if (v) p.set(k, v);
  const t = p.toString();
  return t ? `?${t}` : "";
}

/** Atalhos de cada bloco do cronograma: leva direto ao material (fila de revisão, caderno, questões, lei seca). */
export function linksDoBloco(item: CronogramaItem): LinkBloco[] {
  const materia = MATERIA_POR_ID.has(item.materia_id) ? item.materia_id : "";
  const tema = materia ? temaDoBloco(item) : null;
  const questoes = { rotulo: tema ? `Questões: ${tema}` : "Questões", href: `${BASE}/questoes${qs({ materia, tema })}` };
  const erradas: LinkBloco | null = materia ? { rotulo: tema ? "Erradas deste tema" : "Erradas da matéria", href: `${BASE}/questoes${qs({ materia, tema, status: "erradas" })}` } : null;
  const baralho = BARALHO_DA_MATERIA[item.materia_id];
  const temCartaoDoTema = !!tema && !!baralho && CARTOES.some((c) => c.b === baralho && c.tema === tema);
  const cartoes: LinkBloco | null = baralho ? { rotulo: temCartaoDoTema ? "Cartões do tema" : "Cartões da matéria", href: `${BASE}/flashcards${qs({ baralho, assunto: temCartaoDoTema ? tema : null })}` } : null;
  const temaTrilha = TRILHAS.find((t) => t.materia_id === item.materia_id)?.temas.find((t) => t.tema_questoes === tema);
  const caderno = (): LinkBloco | null => {
    const a = aulaDoBloco(item);
    if (a) return { rotulo: "Aula no caderno", href: `${BASE}/cadernos/${a.materia}?aula=${a.aula}` };
    if (materia && CADERNOS[materia]) return { rotulo: "Caderno", href: `${BASE}/cadernos/${materia}` };
    return null;
  };
  const leiSeca = { rotulo: "Lei seca", href: temaTrilha ? `${BASE}/desafios/trilha/${temaTrilha.id}` : `${BASE}/desafios/trilha` };
  const doTema = (...l: (LinkBloco | null)[]) => l.filter((x): x is LinkBloco => !!x);

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
      return doTema(leiSeca, materia ? questoes : null);
    case "teoria":
      return doTema(caderno(), questoes, cartoes, temaTrilha ? leiSeca : null);
    case "questoes":
      if (item.materia_id === "SIM") return [{ rotulo: "Simulados", href: `${BASE}/simulados` }, { rotulo: "Revisão", href: `${BASE}/revisao` }];
      // Matemática e Informática: o bloco de questões também abre a aula (ela pediu o "como resolver" à mão).
      return doTema(item.materia_id === "A2" || item.materia_id === "A3" ? caderno() : null, questoes, erradas, cartoes);
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
