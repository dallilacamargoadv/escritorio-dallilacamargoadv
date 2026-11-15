// Simulados: montagem (lei seca de uma matéria ou simuladão proporcional ao edital), aviso de repetição e evolução semanal.
// Arquivo puro (Server e Client).
import type { Classificacao, Questao, Resposta } from "@/lib/estudos-desempenho";
import { addDaysToDateString } from "@/lib/atividades-utils";
import { MATERIA_POR_ID } from "@/lib/estudos-utils";

export type TipoSimulado = "lei_seca" | "simuladao" | "outro";
export const TIPO_LABEL: Record<TipoSimulado, string> = {
  lei_seca: "Lei seca",
  simuladao: "Simuladão",
  outro: "Outro",
};
/** tempo de referência por questão (FCC: cerca de 3 minutos) */
export const SEG_POR_QUESTAO = 180;
export const TAMANHOS_LEI_SECA = [10, 20, 30];
export const TAMANHOS_SIMULADAO = [30, 50, 80];

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

/** Distribuição do simuladão proporcional ao número de tópicos do edital, só entre matérias com questões no banco. */
export function distribuicaoSimuladao(questoes: Questao[], total: number): { materia_id: string; nome: string; n: number; disponiveis: number }[] {
  const disp = new Map<string, number>();
  for (const q of questoes) disp.set(q.materia_id, (disp.get(q.materia_id) ?? 0) + 1);
  const mats = [...disp.keys()].map((id) => ({ id, peso: MATERIA_POR_ID.get(id)?.topicos.length ?? 1, disp: disp.get(id)! }));
  const soma = mats.reduce((s, m) => s + m.peso, 0);
  const alvo = Math.min(total, questoes.length);
  const linhas = mats.map((m) => {
    const exato = (alvo * m.peso) / soma;
    return { ...m, n: Math.min(m.disp, Math.floor(exato)), resto: exato - Math.floor(exato) };
  });
  // maior resto primeiro; o que sobrar por falta de questão vai para quem ainda tem
  let falta = alvo - linhas.reduce((s, l) => s + l.n, 0);
  const ordem = [...linhas].sort((a, b) => b.resto - a.resto || b.peso - a.peso);
  while (falta > 0) {
    const l = ordem.find((x) => x.n < x.disp);
    if (!l) break;
    l.n++;
    falta--;
    ordem.push(ordem.splice(ordem.indexOf(l), 1)[0]);
  }
  return linhas
    .filter((l) => l.n > 0)
    .sort((a, b) => b.n - a.n)
    .map((l) => ({ materia_id: l.id, nome: MATERIA_POR_ID.get(l.id)?.nome ?? l.id, n: l.n, disponiveis: l.disp }));
}

function embaralhar<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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
