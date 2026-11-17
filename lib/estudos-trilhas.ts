// Trilha de lei seca (leitura por dia + bloco de Certo/Errado) e agenda semanal de desafios.
// Lógica pura (cliente e servidor). Texto em content/estudos/trilhas.json, gerado por
// CONCURSO PGE-MA/geradores/gerar_trilhas.py.

import { addDaysToDateString } from "@/lib/atividades-utils";

export interface ItemTrilha {
  id: string;
  ref: string;
  contexto: string;
  literal: string;
  texto: string;
  certo: boolean;
  original: string;
  troca: string;
}
export interface DiaTrilha {
  dia: number;
  de: string;
  ate: string;
  artigos: number;
  itens: ItemTrilha[];
}
export interface Trilha {
  id: string;
  nome: string;
  materia_id: string;
  dias: DiaTrilha[];
}

/** Sem gabarito: o que vai ao navegador antes de responder. */
export interface ItemAberto {
  id: string;
  ref: string;
  contexto: string;
  texto: string;
}

export interface CorrecaoTrilha {
  id: string;
  ok: boolean;
  literal: string;
  explicacao: string;
}

export interface DiaConcluido {
  data: string;
  acertos: number;
  total: number;
  blurt: string;
}
export interface EstadoTrilhas {
  resp: Record<string, boolean>;
  concluidos: Record<string, DiaConcluido>;
}

/** Documento da Biblioteca onde ela lê o trecho do dia. */
export const DOC_BIBLIOTECA: Record<string, string> = {
  cc: "cc", lindb: "lindb", cpc: "cpc", cf: "cf88", cema: "ce-ma",
  l9784: "l9784", l8429: "l8429", l14133: "l14133", ctn: "ctn", l6830: "l6830",
};

export function normalizarTrilhas(v: unknown): EstadoTrilhas {
  const o = (v && typeof v === "object" ? v : {}) as Partial<EstadoTrilhas>;
  return {
    resp: o.resp && typeof o.resp === "object" ? o.resp : {},
    concluidos: o.concluidos && typeof o.concluidos === "object" ? o.concluidos : {},
  };
}

export const chaveDia = (trilha: string, dia: number) => `${trilha}:${dia}`;

export function rotuloTrecho(d: DiaTrilha): string {
  return d.de === d.ate ? `art. ${d.de}` : `arts. ${d.de} a ${d.ate}`;
}

export function abrirItem(i: ItemTrilha): ItemAberto {
  return { id: i.id, ref: i.ref, contexto: i.contexto, texto: i.texto };
}

export function corrigirItem(i: ItemTrilha, resposta: string): CorrecaoTrilha {
  const ok = (resposta === "certo") === i.certo;
  const explicacao = i.certo ? "Texto literal. Estava certo." : `Trocaram "${i.original}" por "${i.troca}".`;
  return { id: i.id, ok, literal: i.literal, explicacao };
}

/** Primeiro dia ainda não concluído (ou null se a trilha acabou). */
export function diaAtual(t: Trilha, e: EstadoTrilhas): DiaTrilha | null {
  return t.dias.find((d) => !e.concluidos[chaveDia(t.id, d.dia)]) ?? null;
}

export function diasFeitos(t: Trilha, e: EstadoTrilhas): number {
  return t.dias.filter((d) => e.concluidos[chaveDia(t.id, d.dia)]).length;
}

/** A trilha em curso de cada matéria: a primeira, na ordem, que ainda não acabou. */
export function trilhaDaMateria(trilhas: Trilha[], e: EstadoTrilhas, materia: string): Trilha | null {
  return trilhas.filter((t) => t.materia_id === materia).find((t) => diaAtual(t, e)) ?? null;
}

// ---------- Agenda semanal: RLM, Redação e Discursiva, duas vezes cada ----------

export type TipoSemanal = "rlm" | "redacao" | "discursiva";
/**
 * 0 = domingo. Regra dela (15/11): revisão + no máximo 2 matérias por dia. RLM e Redação ocupam
 * uma das 2; a discursiva entra dentro da matéria jurídica do dia.
 */
export const AGENDA_SEMANA: Record<number, TipoSemanal[]> = { 2: ["rlm"], 3: ["discursiva"], 4: ["redacao"], 5: ["rlm"], 6: ["discursiva", "redacao"] };
export const ROTULO_SEMANAL: Record<TipoSemanal, string> = { rlm: "Raciocínio lógico", redacao: "Redação", discursiva: "Discursiva de caso concreto" };
export const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function diaDaSemana(data: string): number {
  return new Date(`${data}T12:00:00`).getDay();
}

/**
 * Índice para escolher tema ou caso. Por padrão gira 2 por semana (1º e 2º encontro).
 * Com porSemana, o mesmo item vale a semana toda (redação: recorte na terça, texto na sexta).
 */
export function rodizioSemanal(data: string, tamanho: number, porSemana = false): number {
  const base = "2026-11-16"; // uma segunda-feira
  const dias = Math.round((new Date(`${data}T12:00:00`).getTime() - new Date(`${base}T12:00:00`).getTime()) / 86400000);
  const semana = Math.floor(dias / 7);
  const segundo = diaDaSemana(data) >= 5 || diaDaSemana(data) === 0 ? 1 : 0;
  const n = porSemana ? semana : semana * 2 + segundo;
  return ((n % tamanho) + tamanho) % tamanho;
}

/** Os 7 dias da semana atual (segunda a domingo). */
export function semanaDe(hoje: string): string[] {
  const dow = diaDaSemana(hoje);
  const seg = addDaysToDateString(hoje, dow === 0 ? -6 : 1 - dow);
  return Array.from({ length: 7 }, (_, i) => addDaysToDateString(seg, i));
}

/** Métodos de revisão ativa, um por dia. */
export const METODOS_ATIVOS = [
  { nome: "Blurting", como: "Feche o material e escreva tudo o que lembra do trecho. Depois confira e marque o que faltou." },
  { nome: "Técnica Feynman", como: "Explique um artigo em voz alta, como se fosse para um leigo. Onde travar, volte ao texto." },
  { nome: "Teste antes de reler", como: "Responda as questões primeiro e só depois releia, focando no que errou." },
  { nome: "Intercalação", como: "Misture matérias na revisão: 10 min de uma, 10 min de outra. Cansa mais e fixa mais." },
  { nome: "Pergunta do examinador", como: "Para cada artigo, escreva a pegadinha que a FCC faria (pode/deve, prazo, competência)." },
  { nome: "Mapa de memória", como: "Desenhe de cabeça o esquema do capítulo (quem, prazo, exceção) e compare com a lei." },
  { nome: "Autoexplicação", como: "Ao errar, escreva em uma linha por que a alternativa certa é certa." },
];
export function metodoDoDia(hoje: string) {
  const n = Math.floor(new Date(`${hoje}T12:00:00`).getTime() / 86400000);
  return METODOS_ATIVOS[n % METODOS_ATIVOS.length];
}
