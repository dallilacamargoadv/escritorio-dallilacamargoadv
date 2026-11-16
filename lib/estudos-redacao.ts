// Aba Redação: banco de temas, recortador, checagem de tangenciamento, grade de autocorreção
// e discursivas de caso concreto. Lógica pura (cliente e servidor).
// Base: CONCURSO PGE-MA/01 Materiais por materia/Redacao/anotacoes-recorte-tematico-tangenciamento.md

export interface TemaRedacao {
  id: string;
  eixo: string;
  assunto: string;
  tema: string;
  comando: string;
  nucleos: string[][];
  comandoSinonimos: string[];
  armadilhas: { termo: string; porque: string }[];
  coletanea: { titulo: string; texto: string }[];
  recorte: { fazer: string[]; tangenciar: string[] };
  tese: string;
  argumentos: { titulo: string; texto: string }[];
  repertorios: { tipo: string; nome: string; uso: string }[];
  conclusao: string;
}

export interface CasoDiscursiva {
  id: string;
  materia_id: string;
  titulo: string;
  enunciado: string;
  perguntas: string[];
  /** Limite máximo de linhas; `linhas_min` é o mínimo (padrão FCC PGE-AM: 20 a 30). */
  linhas: number;
  linhas_min?: number;
  /** Pesos somam 100 no padrão FCC (nota mínima 60). */
  espelho: { ponto: string; fundamento: string; peso: number }[];
  dica: string;
  /** O que seria abordagem tangencial neste caso (perde pontos; fugir do tema zera). */
  tangencia?: string;
  /** Tópico do edital e temas das questões ("materia|tema") que o caso cobra. */
  topico_id: string;
  temas: string[];
}

export interface Recorte {
  eixo: string;
  assunto: string;
  tema: string;
  palavra: string;
}
export interface Grade {
  conteudo: number;
  estrutura: number;
  expressao: number;
}
export interface TextoRedacao {
  recorte: Recorte;
  texto: string;
  grade: Grade | null;
  atualizado: string;
}
export interface TextoDiscursiva {
  texto: string;
  pontos: Record<string, 0 | 1 | 2>;
  atualizado: string;
}
export interface EstadoRedacao {
  temas: Record<string, TextoRedacao>;
  casos: Record<string, TextoDiscursiva>;
  /** Desafios semanais marcados como feitos: data -> tipos. */
  feitos: Record<string, string[]>;
}

export const RECORTE_VAZIO: Recorte = { eixo: "", assunto: "", tema: "", palavra: "" };

export function normalizarRedacao(v: unknown): EstadoRedacao {
  const o = (v && typeof v === "object" ? v : {}) as Partial<EstadoRedacao>;
  const obj = <T,>(x: unknown) => (x && typeof x === "object" ? (x as Record<string, T>) : {});
  return { temas: obj<TextoRedacao>(o.temas), casos: obj<TextoDiscursiva>(o.casos), feitos: obj<string[]>(o.feitos) };
}

/** Grade no modelo usual da FCC (confira no edital da PGE-MA quando sair). */
export const CRITERIOS: { chave: keyof Grade; nome: string; max: number; itens: string[] }[] = [
  { chave: "conteudo", nome: "Conteúdo", max: 40, itens: ["Respondeu ao tema e à palavra de comando", "Tese clara e sustentada até o fim", "Argumentos consistentes, não só exemplos", "Repertório pertinente e bem ligado"] },
  { chave: "estrutura", nome: "Estrutura", max: 30, itens: ["Introdução com tese", "Um argumento por parágrafo, com tópico frasal", "Coesão entre parágrafos (conectivos, retomadas)", "Conclusão que retoma a tese"] },
  { chave: "expressao", nome: "Expressão", max: 30, itens: ["Norma-padrão (concordância, regência, crase)", "Pontuação", "Vocabulário preciso, sem repetição", "Frases claras, sem períodos longos demais"] },
];

export const CHARS_POR_LINHA = 75;
export const LINHAS_MIN = 20;
export const LINHAS_MAX = 30;

/** Estimativa de linhas na folha: cada parágrafo começa em linha nova. */
export function estimarLinhas(texto: string): number {
  return paragrafos(texto).reduce((n, p) => n + Math.max(1, Math.ceil((p.length + 4) / CHARS_POR_LINHA)), 0);
}

export function paragrafos(texto: string): string[] {
  return texto.split(/\n+/).map((p) => p.trim()).filter(Boolean);
}

export function semAcento(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function contem(texto: string, termo: string): boolean {
  const t = semAcento(termo).trim();
  if (!t) return false;
  return new RegExp(`(^|[^a-z0-9])${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i").test(semAcento(texto));
}

const STOP = new Set(["para", "pela", "pelo", "pelas", "pelos", "como", "entre", "sobre", "seus", "suas", "uma", "umas", "uns", "das", "dos", "nas", "nos", "que", "com", "sem", "sua", "seu", "brasil", "brasileiro", "brasileira", "sociedade", "pode", "apenas"]);

/** Palavras de comando mais comuns e sinônimos que mostram que o texto responde a elas. */
export const COMANDOS: Record<string, string[]> = {
  desafios: ["desafio", "obstáculo", "entrave", "dificuldade", "barreira"],
  obstaculos: ["obstáculo", "barreira", "entrave", "dificulta", "impede"],
  importancia: ["importância", "importante", "relevância", "fundamental", "essencial", "contribui"],
  efeitos: ["efeito", "consequência", "impacto", "reflexo", "acarreta", "provoca"],
  impactos: ["impacto", "efeito", "consequência", "reflexo"],
  riscos: ["risco", "ameaça", "perigo", "compromete"],
  causas: ["causa", "origem", "fator", "decorre", "motivo"],
  papel: ["papel", "função", "contribuição", "atuação"],
};

/** Núcleos de um tema livre: as palavras de 4+ letras do tema, menos as de ligação e o comando. */
export function nucleosLivres(r: Recorte): { nucleos: string[][]; comando: string[] } {
  const chave = semAcento(r.palavra.trim());
  const comando = COMANDOS[chave] ?? (r.palavra.trim() ? [r.palavra.trim()] : []);
  const palavras = semAcento(r.tema)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 4 && !STOP.has(w) && w !== chave);
  return { nucleos: [...new Set(palavras)].map((w) => [w.length > 6 ? w.slice(0, -1) : w]), comando };
}

export interface Checagem {
  ausentes: string[];
  comandoOk: boolean;
  armadilhas: { termo: string; porque: string }[];
  porParagrafo: { n: number; nucleos: number; total: number }[];
  repetidas: { termo: string; vezes: number }[];
  alertas: string[];
}

/** Checagem de tangenciamento (estimativa): núcleos do tema, comando, armadilhas e repetição. */
export function checarTangenciamento(
  texto: string,
  nucleos: string[][],
  comando: string[],
  armadilhas: { termo: string; porque: string }[] = [],
): Checagem {
  const ps = paragrafos(texto);
  const ausentes = nucleos.filter((g) => !g.some((t) => contem(texto, t))).map((g) => g[0]);
  const comandoOk = comando.length === 0 || comando.some((t) => contem(texto, t));
  const achadas = armadilhas.filter((a) => contem(texto, a.termo));
  const porParagrafo = ps.map((p, i) => ({ n: i + 1, nucleos: nucleos.filter((g) => g.some((t) => contem(p, t))).length, total: nucleos.length }));
  const repetidas: { termo: string; vezes: number }[] = [];
  for (const g of nucleos) {
    const t = semAcento(g[0]);
    const vezes = (semAcento(texto).match(new RegExp(`(^|[^a-z0-9])${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "g")) ?? []).length;
    if (vezes > 6) repetidas.push({ termo: g[0], vezes });
  }
  const alertas: string[] = [];
  if (ps.length && ps.length < 3) alertas.push("Poucos parágrafos: o esperado é introdução, 2 desenvolvimentos e conclusão.");
  if (!comandoOk) alertas.push("A palavra de comando não aparece: o texto pode estar respondendo a outra pergunta.");
  if (ausentes.length) alertas.push(`Núcleo do tema ausente: ${ausentes.join(", ")}. Falar menos que o tema também é tangenciar.`);
  const fracos = porParagrafo.filter((p) => p.total && p.nucleos === 0);
  if (fracos.length) alertas.push(`Parágrafo ${fracos.map((p) => p.n).join(", ")} não toca nenhum núcleo do tema: confira se não saiu do recorte.`);
  for (const a of achadas) alertas.push(`Cuidado com "${a.termo}": ${a.porque}.`);
  for (const r of repetidas) alertas.push(`"${r.termo}" aparece ${r.vezes} vezes: alterne com sinônimos e retomadas.`);
  return { ausentes, comandoOk, armadilhas: achadas, porParagrafo, repetidas, alertas };
}

export function notaGrade(g: Grade | null): number {
  return g ? g.conteudo + g.estrutura + g.expressao : 0;
}

export function notaDiscursiva(c: CasoDiscursiva, pontos: Record<string, 0 | 1 | 2>): { nota: number; max: number } {
  const max = c.espelho.reduce((s, e) => s + e.peso, 0);
  const nota = c.espelho.reduce((s, e, i) => s + (e.peso * (pontos[String(i)] ?? 0)) / 2, 0);
  return { nota, max };
}

/** O caso cai num tema estudado na semana (aula marcada como estudada ou questões respondidas)? */
export function casoDaSemana(c: CasoDiscursiva, topicos: Set<string>, temas: Set<string>): boolean {
  return topicos.has(c.topico_id) || c.temas.some((t) => temas.has(t));
}

/** Discursiva do dia: a primeira, na ordem, dos temas da semana que ela ainda não fez. */
export function escolherDiscursiva(casos: CasoDiscursiva[], topicos: Set<string>, temas: Set<string>, feitos: Record<string, TextoDiscursiva>): CasoDiscursiva | null {
  const daSemana = casos.filter((c) => casoDaSemana(c, topicos, temas));
  return daSemana.find((c) => !Object.keys(feitos[c.id]?.pontos ?? {}).length) ?? daSemana[0] ?? null;
}
