// Revisão espaçada: 1, 7, 15 e 30 dias e depois 4 revisões semanais de manutenção (pedido dela, 26/11/2026).
// Lógica pura, usada no servidor e no navegador.
import { addDaysToDateString } from "@/lib/atividades-utils";
import type { Questao, Resposta } from "@/lib/estudos-desempenho";

export const INTERVALOS = [1, 7, 15, 30, 7, 7, 7, 7] as const;
/** Passou por todos os intervalos (inclusive a manutenção semanal): o item sai da fila. */
export const ETAPA_FINAL = INTERVALOS.length;
export const NOVOS_CARTOES_POR_DIA = 5;
/** Teto diário da revisão (pedido dela, 27/11/2026): o que passar disso fica para os próximos dias, mais antigo primeiro. */
export const LIMITE_DIA = { questoes: 10, artigos: 8, cartoes: 20 } as const;

const TZ = "America/Belem";
export function dataBelem(ms: number | string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(ms));
}

/** Próxima etapa e vencimento depois de uma revisão. Errou: volta ao começo (amanhã). */
export function proximaEtapa(etapa: number, ok: boolean, hoje: string): { etapa: number; vence_em: string } {
  // A etapa N espera INTERVALOS[N] dias. Acertou: sobe uma. Na etapa final o item sai da fila.
  const nova = ok ? Math.min(etapa + 1, ETAPA_FINAL) : 0;
  return { etapa: nova, vence_em: addDaysToDateString(hoje, INTERVALOS[Math.min(nova, ETAPA_FINAL - 1)]) };
}

/** "Quase": lembrou em parte. Fica na mesma etapa e repete o mesmo intervalo (nunca novo: vai para a etapa 1). */
export function proximaEtapaQuase(etapa: number, hoje: string): { etapa: number; vence_em: string } {
  const e = Math.min(Math.max(etapa, 0), ETAPA_FINAL - 1);
  return { etapa: e, vence_em: addDaysToDateString(hoje, INTERVALOS[e]) };
}

/** Dias até a próxima revisão para cada botão (Errei, Quase, Acertei), a partir da etapa atual (-1 = nunca visto). */
export function diasDosBotoes(etapa: number): { errei: number; quase: number; acertei: number | null } {
  const e = Math.max(etapa, -1);
  const sobe = Math.min(e + 1, ETAPA_FINAL);
  return { errei: INTERVALOS[0], quase: INTERVALOS[Math.min(Math.max(e, 0), ETAPA_FINAL - 1)], acertei: sobe >= ETAPA_FINAL ? null : INTERVALOS[sobe] };
}

/** Falha = errou, chutou ou acertou com dúvida. Mesmo critério do filtro "Só as que errei ou chutei". */
export function ehFalha(r: Resposta): boolean {
  return !r.correta || r.classificacao === "chute" || r.classificacao === "duvida";
}

export interface ItemQuestao {
  id: string;
  materia: string;
  tema: string;
  ref: string;
  etapa: number;
  vence_em: string;
}

/**
 * Questões: a agenda sai do próprio histórico de respostas.
 * Depois da última falha, cada acerto firme sobe uma etapa. Vence em (data da última resposta + intervalo da etapa).
 */
export function agendaQuestoes(respostas: Resposta[], questoes: Map<string, Questao>): ItemQuestao[] {
  const porQuestao = new Map<string, Resposta[]>();
  for (const r of respostas) {
    const l = porQuestao.get(r.questao_id) ?? [];
    l.push(r);
    porQuestao.set(r.questao_id, l);
  }
  const itens: ItemQuestao[] = [];
  for (const [id, lista] of porQuestao) {
    const q = questoes.get(id);
    if (!q) continue;
    let ultimaFalha = -1;
    lista.forEach((r, i) => {
      if (ehFalha(r)) ultimaFalha = i;
    });
    if (ultimaFalha < 0) continue;
    const etapa = lista.length - 1 - ultimaFalha;
    if (etapa >= ETAPA_FINAL) continue;
    const ultima = lista[lista.length - 1];
    itens.push({
      id,
      materia: q.mat,
      tema: q.tema,
      ref: q.ref,
      etapa,
      vence_em: addDaysToDateString(dataBelem(ultima.respondida_em), INTERVALOS[etapa]),
    });
  }
  return itens;
}

export interface EstadoRevisao {
  item_id: string;
  etapa: number;
  vence_em: string;
  atualizado_em: string;
}

export interface ItemArtigo {
  item_id: string;
  ref: string;
  materia: string;
  fonte: string;
  questoes: string[];
  etapa: number;
  vence_em: string;
}

/**
 * Artigos: entram quando ela erra uma questão. O texto é a "fonte" (lei seca) da questão.
 * Um erro novo depois da última revisão do artigo zera a etapa.
 */
export function agendaArtigos(respostas: Resposta[], questoes: Map<string, Questao>, estados: Map<string, EstadoRevisao>): ItemArtigo[] {
  const porRef = new Map<string, { q: Questao; ultimaFalhaMs: number; questoes: Set<string> }>();
  for (const r of respostas) {
    if (!ehFalha(r)) continue;
    const q = questoes.get(r.questao_id);
    if (!q?.fonte || !q.ref) continue;
    const ms = new Date(r.respondida_em).getTime();
    const atual = porRef.get(q.ref);
    if (!atual) porRef.set(q.ref, { q, ultimaFalhaMs: ms, questoes: new Set([q.id]) });
    else {
      atual.questoes.add(q.id);
      if (ms >= atual.ultimaFalhaMs) {
        atual.ultimaFalhaMs = ms;
        atual.q = q;
      }
    }
  }
  const itens: ItemArtigo[] = [];
  for (const [ref, a] of porRef) {
    const item_id = `art:${ref}`;
    const est = estados.get(item_id);
    const erroDepois = !est || a.ultimaFalhaMs > new Date(est.atualizado_em).getTime();
    const etapa = erroDepois ? 0 : est.etapa;
    if (etapa >= ETAPA_FINAL) continue;
    const vence_em = erroDepois ? addDaysToDateString(dataBelem(a.ultimaFalhaMs), INTERVALOS[0]) : est.vence_em;
    itens.push({ item_id, ref, materia: a.q.mat, fonte: a.q.fonte, questoes: [...a.questoes], etapa, vence_em });
  }
  return itens;
}

/* ===================== CARTÕES ===================== */

export interface Cartao {
  id: string;
  b: string;
  f: string;
  v: string;
  x?: string;
  /** texto literal da lei ou da súmula que fundamenta o cartão */
  lei?: string;
  /** como a FCC costuma cobrar (pegadinha) */
  fcc?: string;
  /** nível: 1 fácil, 2 médio, 3 difícil */
  nv?: 1 | 2 | 3;
  /** assunto do edital (mesmo nome do tema das questões), para revisar por tema */
  tema?: string;
  /** tipo do cartão de tema (27/11): regra, exceção ou particularidade, pegadinha da FCC, jurisprudência */
  k?: "regra" | "excecao" | "pegadinha" | "juris";
  /** aula do caderno de onde o cartão saiu (cartões de tema refeitos em 27/11) */
  aula?: string;
}

export const ROTULO_TIPO: Record<NonNullable<Cartao["k"]>, string> = {
  regra: "Regra",
  excecao: "Exceção",
  pegadinha: "Pegadinha FCC",
  juris: "Jurisprudência",
};

/** Estado gravado em `estudo_cartoes.estado`. Os cartões migrados usam ms em `due` e `int` (dias). */
export interface EstadoCartao {
  due?: number;
  int?: number;
  etapa?: number;
  hist?: { t: number; ok: boolean; quase?: boolean }[];
  /** última resposta escrita por ela no modo "Escrever antes" */
  resp?: string;
  [k: string]: unknown;
}

/** Etapa de um cartão migrado (SM-2): o maior intervalo da escada que cabe no intervalo antigo. */
export function etapaDoCartao(e: EstadoCartao): number {
  if (typeof e.etapa === "number") return e.etapa;
  const int = Number(e.int ?? 0);
  let etapa = 0;
  INTERVALOS.forEach((d, i) => {
    if (int >= d) etapa = i;
  });
  return etapa;
}

export function venceCartao(e: EstadoCartao): string | null {
  return typeof e.due === "number" ? dataBelem(e.due) : null;
}

/** Ms do meio-dia (Belém, UTC-3) da data, para manter `due` compatível com o formato antigo. */
export function msDaData(data: string): number {
  return new Date(`${data}T12:00:00-03:00`).getTime();
}

export function rotuloEtapa(etapa: number): string {
  return etapa >= ETAPA_FINAL ? "concluída" : `etapa ${etapa + 1} de ${ETAPA_FINAL} · ${INTERVALOS[etapa]} d`;
}
