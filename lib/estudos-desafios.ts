// Aba Desafios: lei seca com lacuna e pegadinha FCC. Lógica pura (cliente e servidor).
// O texto vem de content/estudos/desafios.json, gerado por CONCURSO PGE-MA/geradores/gerar_desafios.py.

import { addDaysToDateString } from "@/lib/atividades-utils";

export const DESAFIOS_POR_DIA = 10;

/** Jurisprudência ligada ao dispositivo. Só entra com fonte conferida. */
export interface JurisDesafio {
  texto: string;
  fonte: string;
  data: string;
}

interface Base {
  id: string;
  materia_id: string;
  lei: string;
  ref: string;
  contexto: string;
  literal: string;
  texto: string;
  juris: JurisDesafio[];
}
export type Desafio =
  | (Base & { tipo: "lacuna"; opcoes: string[]; resposta: string })
  | (Base & { tipo: "pegadinha"; certo: boolean; original: string; troca: string });

/** O que vai para o navegador antes de responder (sem gabarito). */
export type DesafioAberto =
  | { id: string; tipo: "lacuna"; lei: string; ref: string; contexto: string; texto: string; opcoes: string[] }
  | { id: string; tipo: "pegadinha"; lei: string; ref: string; contexto: string; texto: string };

export interface Correcao {
  id: string;
  ok: boolean;
  literal: string;
  resposta: string;
  explicacao: string;
  juris: JurisDesafio[];
}

export interface DiaDesafio {
  acertos: number;
  total: number;
}
export interface EstadoDesafios {
  dias: Record<string, DiaDesafio>;
  vistos: Record<string, { ult: string; ok: boolean; vezes: number }>;
}

export function normalizarEstado(v: unknown): EstadoDesafios {
  const o = (v && typeof v === "object" ? v : {}) as Partial<EstadoDesafios>;
  return {
    dias: o.dias && typeof o.dias === "object" ? o.dias : {},
    vistos: o.vistos && typeof o.vistos === "object" ? o.vistos : {},
  };
}

export function abrir(d: Desafio): DesafioAberto {
  const base = { id: d.id, lei: d.lei, ref: d.ref, contexto: d.contexto, texto: d.texto };
  return d.tipo === "lacuna" ? { ...base, tipo: "lacuna", opcoes: d.opcoes } : { ...base, tipo: "pegadinha" };
}

/** Resposta: na lacuna, a opção escolhida; na pegadinha, "certo" ou "errado". */
export function corrigir(d: Desafio, resposta: string): Correcao {
  if (d.tipo === "lacuna") {
    const ok = resposta === d.resposta;
    return { id: d.id, ok, literal: d.literal, resposta: d.resposta, explicacao: `A lei diz "${d.resposta}".`, juris: d.juris };
  }
  const ok = (resposta === "certo") === d.certo;
  const explicacao = d.certo
    ? "Texto literal da lei. Estava certo."
    : `Pegadinha: trocaram "${d.original}" por "${d.troca}".`;
  return { id: d.id, ok, literal: d.literal, resposta: d.certo ? "Certo" : "Errado", explicacao, juris: d.juris };
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * Escolhe a rodada: primeiro os que ela errou (os mais antigos antes), depois os inéditos,
 * depois os acertados há mais tempo. Mistura as matérias e muda a cada dia e rodada.
 */
export function escolherRodada(todos: Desafio[], estado: EstadoDesafios, semente: string, materia?: string): Desafio[] {
  const lista = materia ? todos.filter((d) => d.materia_id === materia) : todos;
  const peso = (d: Desafio) => {
    const v = estado.vistos[d.id];
    if (!v) return 1;
    return v.ok ? 2 : 0;
  };
  const ordenada = [...lista].sort((a, b) => {
    const pa = peso(a);
    const pb = peso(b);
    if (pa !== pb) return pa - pb;
    const ua = estado.vistos[a.id]?.ult ?? "";
    const ub = estado.vistos[b.id]?.ult ?? "";
    if (ua !== ub) return ua.localeCompare(ub);
    return hash(semente + a.id) - hash(semente + b.id);
  });
  // No máximo 3 errados antigos por rodada, para não virar só revisão.
  const errados = ordenada.filter((d) => peso(d) === 0).slice(0, 3);
  const resto = ordenada.filter((d) => peso(d) !== 0);
  const porMateria = new Map<string, Desafio[]>();
  for (const d of resto.slice(0, 80)) porMateria.set(d.materia_id, [...(porMateria.get(d.materia_id) ?? []), d]);
  const filas = [...porMateria.values()].sort((a, b) => hash(semente + a[0].materia_id) - hash(semente + b[0].materia_id));
  const out = [...errados];
  for (let i = 0; out.length < DESAFIOS_POR_DIA && filas.some((f) => f.length > i); i++) {
    for (const f of filas) if (f[i] && out.length < DESAFIOS_POR_DIA) out.push(f[i]);
  }
  return out;
}

/** Dias seguidos com a rodada do dia completa. Se hoje ainda não fez, conta até ontem. */
export function sequencia(estado: EstadoDesafios, hoje: string): number {
  const feito = (d: string) => (estado.dias[d]?.total ?? 0) >= DESAFIOS_POR_DIA;
  let dia = feito(hoje) ? hoje : addDaysToDateString(hoje, -1);
  let n = 0;
  while (feito(dia)) {
    n++;
    dia = addDaysToDateString(dia, -1);
  }
  return n;
}

export function recorde(estado: EstadoDesafios): number {
  const dias = Object.keys(estado.dias)
    .filter((d) => estado.dias[d].total >= DESAFIOS_POR_DIA)
    .sort();
  let melhor = 0;
  let atual = 0;
  let anterior = "";
  for (const d of dias) {
    atual = anterior && addDaysToDateString(anterior, 1) === d ? atual + 1 : 1;
    melhor = Math.max(melhor, atual);
    anterior = d;
  }
  return melhor;
}
