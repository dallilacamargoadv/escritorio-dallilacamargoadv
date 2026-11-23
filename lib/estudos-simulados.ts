// Simulados: montagem (lei seca de uma matéria, temas da semana ou prova no formato PGE-MA), aviso de repetição e evolução semanal.
// Arquivo puro (Server e Client).
import type { Classificacao, Questao, Resposta } from "@/lib/estudos-desempenho";
import { addDaysToDateString } from "@/lib/atividades-utils";
import { MATERIA_POR_ID } from "@/lib/estudos-utils";
import { dataBelem } from "@/lib/estudos-revisao";

export type TipoSimulado = "lei_seca" | "simuladao" | "outro";
export const TIPO_LABEL: Record<TipoSimulado, string> = {
  lei_seca: "Lei seca",
  simuladao: "Simuladão",
  outro: "Outro",
};
/** tempo de referência por questão (FCC: cerca de 3 minutos) */
export const SEG_POR_QUESTAO = 180;
export const TAMANHOS_LEI_SECA = [10, 20, 30];

export interface ItemSimulado {
  questao_id: string;
  alternativa: number | null;
  tempo_seg: number;
  correta: boolean;
  classificacao: Classificacao;
  resposta_id: string | null;
}

export interface Simulado {
  id: string;
  origem: "site" | "externo";
  tipo: TipoSimulado;
  materia_id: string | null;
  status: "em_andamento" | "entregue";
  data: string;
  questoes: string[];
  itens: ItemSimulado[];
  total: number;
  acertos: number | null;
  duracao_seg: number | null;
  limite_seg: number | null;
  fonte: string | null;
  nota: string | null;
  iniciado_em: string;
  entregue_em: string | null;
}

/** Questão sem gabarito, para o navegador durante a prova. */
export interface QuestaoProva {
  id: string;
  materia: string;
  tema: string;
  enun: string;
  itens?: string[];
  alts: string[];
}

export function semGabarito(q: Questao): QuestaoProva {
  return { id: q.id, materia: MATERIA_POR_ID.get(q.materia_id)?.nome ?? q.mat, tema: q.tema, enun: q.enun, itens: q.itens, alts: q.alts };
}

/** Questão de lei seca: a referência cita artigo. */
export function ehLeiSeca(q: Questao) {
  return /\barts?\.|\bartigo/i.test(q.ref);
}

/** Pool da lei seca de uma matéria (se a matéria quase não tiver referência a artigo, usa todas). */
export function poolLeiSeca(questoes: Questao[], materiaId: string): Questao[] {
  const da = questoes.filter((q) => q.materia_id === materiaId);
  const lei = da.filter(ehLeiSeca);
  return lei.length >= 10 ? lei : da;
}

/**
 * Formato da prova (aprovado por ela em 22/11/2026). O edital previsto só fixa 30 específicas + 20 gerais;
 * o peso de cada matéria vem da prova real FCC PGE-AM 2022 (Analista Procuratorial), com História e
 * Geografia do MA nas gerais (2 saem de Português, 1 de RLM e 1 de Informática).
 * Bloco sem questão no banco: as vagas vão para os outros do mesmo grupo, na proporção dos pesos.
 */
export type ModoProva = "completo" | "direito";
export const PROVA_TOTAL: Record<ModoProva, number> = { completo: 50, direito: 30 };
export const MODO_LABEL: Record<ModoProva, string> = { completo: "Simulado completo", direito: "Só Direito" };

interface BlocoProva {
  id: string;
  nome: string;
  grupo: "direito" | "gerais";
  materias: string[];
  peso: number;
}
export const BLOCOS_PROVA: BlocoProva[] = [
  { id: "B3", nome: "Direito Constitucional", grupo: "direito", materias: ["B3"], peso: 5 },
  { id: "B2", nome: "Direito Administrativo", grupo: "direito", materias: ["B2"], peso: 5 },
  { id: "B5", nome: "Direito Processual Civil", grupo: "direito", materias: ["B5"], peso: 5 },
  { id: "B7", nome: "Direito Tributário", grupo: "direito", materias: ["B7"], peso: 5 },
  { id: "B10", nome: "Direito do Trabalho", grupo: "direito", materias: ["B10"], peso: 4 },
  { id: "B6", nome: "Direito Civil", grupo: "direito", materias: ["B6"], peso: 3 },
  { id: "B8", nome: "Direito Financeiro", grupo: "direito", materias: ["B8"], peso: 3 },
  { id: "A1", nome: "Língua Portuguesa", grupo: "gerais", materias: ["A1"], peso: 8 },
  { id: "A2", nome: "Matemática e RLM", grupo: "gerais", materias: ["A2"], peso: 4 },
  { id: "A3", nome: "Informática", grupo: "gerais", materias: ["A3"], peso: 4 },
  { id: "MA", nome: "História e Geografia do MA", grupo: "gerais", materias: ["A4", "A5", "A6", "A7"], peso: 4 },
];
export const GRUPO_TOTAL = { direito: 30, gerais: 20 } as const;

export interface LinhaProva {
  bloco: string;
  nome: string;
  grupo: "direito" | "gerais";
  materias: string[];
  n: number;
  disponiveis: number;
}

function repartir(blocos: (BlocoProva & { disp: number })[], alvo: number) {
  const ativos = blocos.filter((b) => b.disp > 0);
  const soma = ativos.reduce((s, b) => s + b.peso, 0);
  if (!soma) return [];
  const linhas = ativos.map((b) => {
    const exato = (alvo * b.peso) / soma;
    return { ...b, n: Math.min(b.disp, Math.floor(exato)), resto: exato - Math.floor(exato) };
  });
  let falta = alvo - linhas.reduce((s, l) => s + l.n, 0);
  const ordem = [...linhas].sort((a, b) => b.resto - a.resto || b.peso - a.peso);
  while (falta > 0) {
    const l = ordem.find((x) => x.n < x.disp);
    if (!l) break;
    l.n++;
    falta--;
    ordem.push(ordem.splice(ordem.indexOf(l), 1)[0]);
  }
  return linhas.filter((l) => l.n > 0);
}

/** Quantas questões de cada bloco entram na prova (Direito primeiro, depois as gerais). */
export function distribuicaoProva(questoes: Questao[], modo: ModoProva): LinhaProva[] {
  const disp = new Map<string, number>();
  for (const q of questoes) disp.set(q.materia_id, (disp.get(q.materia_id) ?? 0) + 1);
  const comDisp = BLOCOS_PROVA.map((b) => ({ ...b, disp: b.materias.reduce((s, m) => s + (disp.get(m) ?? 0), 0) }));
  const grupos: ("direito" | "gerais")[] = modo === "completo" ? ["direito", "gerais"] : ["direito"];
  return grupos.flatMap((g) =>
    repartir(comDisp.filter((b) => b.grupo === g), GRUPO_TOTAL[g]).map((l) => ({
      bloco: l.id,
      nome: l.nome,
      grupo: l.grupo,
      materias: l.materias,
      n: l.n,
      disponiveis: l.disp,
    })),
  );
}

function embaralhar<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const TAMANHOS_SEMANA = [20, 30];

/**
 * Temas praticados nos últimos 7 dias (qualquer contexto), como "materia|tema".
 * Base do simulado de domingo: só cobra o que ela já estudou na semana.
 */
export function temasDaSemana(respostas: Resposta[], questoes: Map<string, Questao>, desde: string): Set<string> {
  const temas = new Set<string>();
  for (const r of respostas) {
    if (dataBelem(r.respondida_em) < desde) continue;
    const q = questoes.get(r.questao_id);
    if (q?.tema) temas.add(`${q.materia_id}|${q.tema}`);
  }
  return temas;
}

export function poolSemana(questoes: Questao[], temas: Set<string>): Questao[] {
  return questoes.filter((q) => temas.has(`${q.materia_id}|${q.tema}`));
}

/** Inéditas primeiro (sorteadas); faltando, as respondidas há mais tempo. */
export function escolher(pool: Questao[], n: number, ultimaVez: Map<string, string>): Questao[] {
  const ineditas = embaralhar(pool.filter((q) => !ultimaVez.has(q.id)));
  const vistas = pool.filter((q) => ultimaVez.has(q.id)).sort((a, b) => ultimaVez.get(a.id)!.localeCompare(ultimaVez.get(b.id)!));
  return [...ineditas, ...vistas].slice(0, n);
}

export function ultimaVezPorQuestao(respostas: Resposta[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const r of respostas) m.set(r.questao_id, r.respondida_em);
  return m;
}

/** Segunda-feira da semana da data (AAAA-MM-DD). */
export function inicioDaSemana(data: string): string {
  const [a, m, d] = data.split("-").map(Number);
  const dow = new Date(Date.UTC(a, m - 1, d)).getUTCDay(); // 0 = domingo
  return addDaysToDateString(data, -((dow + 6) % 7));
}

export interface SemanaSimulados {
  semana: string;
  feitos: number;
  questoes: number;
  acertos: number;
  pct: number;
}

/** Evolução semanal: soma de todos os simulados entregues (site e fora) com nota. */
export function evolucaoSemanal(simulados: Simulado[], semanas = 8): SemanaSimulados[] {
  const m = new Map<string, SemanaSimulados>();
  for (const s of simulados) {
    if (s.status !== "entregue" || s.acertos === null || !s.total) continue;
    const k = inicioDaSemana(s.data);
    const l = m.get(k) ?? { semana: k, feitos: 0, questoes: 0, acertos: 0, pct: 0 };
    l.feitos++;
    l.questoes += s.total;
    l.acertos += s.acertos;
    m.set(k, l);
  }
  return [...m.values()]
    .map((l) => ({ ...l, pct: Math.round((l.acertos / l.questoes) * 100) }))
    .sort((a, b) => a.semana.localeCompare(b.semana))
    .slice(-semanas);
}

export function classificacaoPadrao(correta: boolean, alternativa: number | null): Classificacao {
  if (alternativa === null) return "estrategia";
  return correta ? "seguro" : "conteudo";
}

/** Duração longa legível: 2h30, 45 min, 50s. */
export function formatarDuracao(seg: number): string {
  const s = Math.max(0, Math.round(seg));
  if (s < 60) return `${s}s`;
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  return h ? `${h}h${m ? String(m).padStart(2, "0") : ""}` : `${m} min`;
}
