// Laboratório de erros: reincidência, erros superados, tempo até corrigir e índice de domínio (7 níveis).
// Arquivo puro (Server e Client).
import { MATERIA_POR_ID } from "@/lib/estudos-utils";
import { acertoFirme, CLASSIFICACAO_LABEL, EH_ERRO, TIPOS_ERRO, type Classificacao, type Questao, type Resposta, type TipoErro } from "@/lib/estudos-desempenho";

const DIA = 86400000;

/* ===================== CONFIGURAÇÃO DOS NÍVEIS ===================== */

export interface LabConfig {
  /** acertos firmes seguidos, em dias diferentes, para "Consolidado" */
  acertosConsolidar: number;
  /** dias entre o primeiro e o último acerto firme da sequência para "Dominado" */
  diasDominado: number;
  /** quantas falhas na mesma questão contam como reincidência */
  vezesReincidencia: number;
}
export const LAB_CONFIG_PADRAO: LabConfig = { acertosConsolidar: 2, diasDominado: 30, vezesReincidencia: 2 };

function inteiro(v: unknown, min: number, max: number, padrao: number) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : padrao;
}
export function normalizarLabConfig(v: unknown): LabConfig {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  return {
    acertosConsolidar: inteiro(o.acertosConsolidar, 2, 6, LAB_CONFIG_PADRAO.acertosConsolidar),
    diasDominado: inteiro(o.diasDominado, 7, 120, LAB_CONFIG_PADRAO.diasDominado),
    vezesReincidencia: inteiro(o.vezesReincidencia, 2, 5, LAB_CONFIG_PADRAO.vezesReincidencia),
  };
}

export type Nivel = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export function niveis(c: LabConfig): { n: Nivel; t: string; d: string }[] {
  return [
    { n: 0, t: "Não visto", d: "Nenhuma aula estudada e nenhuma questão respondida." },
    { n: 1, t: "Contato", d: "Estudou a aula, mas ainda não respondeu questões." },
    { n: 2, t: "Errando", d: "A última tentativa foi erro, chute ou dúvida." },
    { n: 3, t: "Oscilando", d: "Acertou com firmeza depois de ter errado, mas só uma vez." },
    { n: 4, t: "Acerto firme", d: "Acerto firme, ainda sem repetição em outro dia." },
    { n: 5, t: "Consolidado", d: `${c.acertosConsolidar} acertos firmes seguidos, em dias diferentes.` },
    { n: 6, t: "Dominado", d: `Consolidado e ainda firme ${c.diasDominado} dias depois.` },
  ];
}

/** classes de cor de cada nível (tokens --e-*) */
export const NIVEL_COR: Record<number, { pill: string; barra: string }> = {
  0: { pill: "bg-e-line text-e-dim", barra: "bg-e-dim" },
  1: { pill: "bg-e-line text-e-ink", barra: "bg-e-dim" },
  2: { pill: "bg-e-bad-soft text-e-bad", barra: "bg-e-bad" },
  3: { pill: "bg-e-warn-soft text-e-warn", barra: "bg-e-warn" },
  4: { pill: "bg-e-blue/20 text-e-blue", barra: "bg-e-blue" },
  5: { pill: "bg-e-ok-soft text-e-ok", barra: "bg-e-ok" },
  6: { pill: "bg-e-ok/25 text-e-ok ring-1 ring-e-ok/50", barra: "bg-e-ok" },
};

/* ===================== NÍVEL POR QUESTÃO ===================== */

const diaDe = (iso: string) => iso.slice(0, 10);

/** respostas de uma questão em ordem cronológica */
export function nivelDaQuestao(rs: Resposta[], c: LabConfig): Nivel {
  if (!rs.length) return 0;
  const ultima = rs[rs.length - 1];
  if (!acertoFirme(ultima)) return 2;
  let i = rs.length - 1;
  while (i >= 0 && acertoFirme(rs[i])) i--;
  const sequencia = rs.slice(i + 1);
  const jaFalhou = i >= 0;
  const dias = new Set(sequencia.map((r) => diaDe(r.respondida_em))).size;
  if (dias >= c.acertosConsolidar) {
    const span = Date.parse(sequencia[sequencia.length - 1].respondida_em) - Date.parse(sequencia[0].respondida_em);
    return span >= c.diasDominado * DIA ? 6 : 5;
  }
  return jaFalhou ? 3 : 4;
}

/* ===================== ERROS POR QUESTÃO ===================== */

export interface ErroLab {
  questao_id: string;
  materia_id: string;
  tema: string;
  ref: string;
  falhas: number;
  tipoMaisComum: Classificacao;
  ultimaFalha: string;
  superado: boolean;
  reincidente: boolean;
  /** dias do primeiro erro até o acerto firme que encerrou a última falha (só superados) */
  diasAteCorrigir: number | null;
  nivel: Nivel;
  notas: string[];
}

export function errosDoLaboratorio(porQuestao: Map<string, Resposta[]>, questoes: Map<string, Questao>, c: LabConfig): ErroLab[] {
  const out: ErroLab[] = [];
  for (const [qid, rs] of porQuestao) {
    const falhas = rs.filter((r) => !acertoFirme(r));
    if (!falhas.length) continue;
    const ultima = rs[rs.length - 1];
    const superado = acertoFirme(ultima);
    const tipos = new Map<Classificacao, number>();
    for (const f of falhas) tipos.set(f.classificacao, (tipos.get(f.classificacao) ?? 0) + 1);
    const ultimaFalha = falhas[falhas.length - 1];
    let dias: number | null = null;
    if (superado) {
      const idx = rs.indexOf(ultimaFalha);
      const correcao = rs.slice(idx + 1).find(acertoFirme);
      if (correcao) dias = Math.max(0, Math.round((Date.parse(correcao.respondida_em) - Date.parse(falhas[0].respondida_em)) / DIA));
    }
    const q = questoes.get(qid);
    out.push({
      questao_id: qid,
      materia_id: q?.materia_id ?? ultima.materia_id,
      tema: q?.tema ?? ultima.tema ?? "Sem tema",
      ref: q?.ref ?? "",
      falhas: falhas.length,
      tipoMaisComum: [...tipos.entries()].sort((a, b) => b[1] - a[1])[0][0],
      ultimaFalha: ultimaFalha.respondida_em,
      superado,
      reincidente: falhas.length >= c.vezesReincidencia,
      diasAteCorrigir: dias,
      nivel: nivelDaQuestao(rs, c),
      notas: rs.map((r) => r.nota).filter((n): n is string => !!n),
    });
  }
  return out;
}

/* ===================== ÁRVORE DE DOMÍNIO ===================== */

export interface NoDominio {
  id: string;
  rotulo: string;
  nivel: Nivel;
  /** 0 a 100, média dos níveis das questões respondidas (6 = 100) */
  pct: number;
  respondidas: number;
  total: number;
  filhos: NoDominio[];
  erro?: ErroLab;
}

function agregar(niveisQ: Nivel[]): { nivel: Nivel; pct: number } {
  if (!niveisQ.length) return { nivel: 0, pct: 0 };
  const media = niveisQ.reduce((s: number, n) => s + n, 0) / niveisQ.length;
  return { nivel: Math.floor(media) as Nivel, pct: Math.round((media / 6) * 100) };
}

/**
 * Matéria → tema → questão. Nível do tema e da matéria = média (arredondada para baixo) dos níveis
 * das questões já respondidas. Matéria sem resposta, mas com aula estudada, fica em "Contato".
 */
export function arvoreDominio(
  porQuestao: Map<string, Resposta[]>,
  questoes: Questao[],
  erros: Map<string, ErroLab>,
  materiasComAula: Set<string>,
  c: LabConfig,
): NoDominio[] {
  const porMateria = new Map<string, Map<string, Questao[]>>();
  for (const q of questoes) {
    const temas = porMateria.get(q.materia_id) ?? new Map<string, Questao[]>();
    temas.set(q.tema, [...(temas.get(q.tema) ?? []), q]);
    porMateria.set(q.materia_id, temas);
  }
  const arvore: NoDominio[] = [];
  for (const [mid, temas] of porMateria) {
    const nosTema: NoDominio[] = [];
    const niveisMateria: Nivel[] = [];
    let totalM = 0;
    for (const [tema, qs] of temas) {
      totalM += qs.length;
      const respondidas = qs.filter((q) => porQuestao.has(q.id));
      if (!respondidas.length) continue;
      const nq = respondidas.map((q) => nivelDaQuestao(porQuestao.get(q.id)!, c));
      niveisMateria.push(...nq);
      const ag = agregar(nq);
      nosTema.push({
        id: `${mid}|${tema}`,
        rotulo: tema,
        ...ag,
        respondidas: respondidas.length,
        total: qs.length,
        filhos: respondidas
          .filter((q) => erros.has(q.id))
          .map((q) => {
            const e = erros.get(q.id)!;
            return { id: q.id, rotulo: q.ref || q.id, nivel: e.nivel, pct: Math.round((e.nivel / 6) * 100), respondidas: 1, total: 1, filhos: [], erro: e };
          })
          .sort((a, b) => a.nivel - b.nivel),
      });
    }
    let ag = agregar(niveisMateria);
    if (!niveisMateria.length && materiasComAula.has(mid)) ag = { nivel: 1, pct: Math.round((1 / 6) * 100) };
    if (!niveisMateria.length && !materiasComAula.has(mid)) continue;
    arvore.push({
      id: mid,
      rotulo: MATERIA_POR_ID.get(mid)?.nome ?? mid,
      ...ag,
      respondidas: niveisMateria.length,
      total: totalM,
      filhos: nosTema.sort((a, b) => a.pct - b.pct),
    });
  }
  return arvore.sort((a, b) => a.pct - b.pct);
}

/* ===================== TIPOS DE ERRO ===================== */

export function contagemTipos(respostas: Resposta[]): { k: TipoErro; t: string; n: number }[] {
  const m = new Map<string, number>();
  for (const r of respostas) if (EH_ERRO.has(r.classificacao)) m.set(r.classificacao, (m.get(r.classificacao) ?? 0) + 1);
  return TIPOS_ERRO.map((e) => ({ k: e.k, t: e.t, n: m.get(e.k) ?? 0 })).sort((a, b) => b.n - a.n);
}

/* ===================== RESUMO PARA O TUTOR ===================== */

const dataBR = (iso: string) => iso.slice(0, 10).split("-").reverse().join("/");

export function resumoParaTutor(p: {
  periodo: string;
  materia: string | null;
  erros: ErroLab[];
  tipos: { t: string; n: number }[];
  questoes: Map<string, Questao>;
}): string {
  const ativos = p.erros.filter((e) => !e.superado).sort((a, b) => b.falhas - a.falhas);
  const reinc = ativos.filter((e) => e.reincidente);
  const outros = ativos.filter((e) => !e.reincidente);
  const sup = p.erros.filter((e) => e.superado);
  const linhaErro = (e: ErroLab) => {
    const q = p.questoes.get(e.questao_id);
    const mat = MATERIA_POR_ID.get(e.materia_id)?.nome ?? e.materia_id;
    const enun = q ? q.enun.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, 180) : "";
    const nota = e.notas.length ? `\n  Minha anotação: ${e.notas[e.notas.length - 1]}` : "";
    return `- ${mat} · ${e.tema}${e.ref ? ` (${e.ref})` : ""}: errei ${e.falhas}x, motivo mais comum "${CLASSIFICACAO_LABEL[e.tipoMaisComum].toLowerCase()}", último erro em ${dataBR(e.ultimaFalha)}.${enun ? `\n  Questão: ${enun}${q && q.enun.length > 180 ? "..." : ""}` : ""}${nota}`;
  };
  const partes = [
    `Meus erros (${p.periodo}${p.materia ? `, ${p.materia}` : ""}). Analista Jurídico PGE-MA, banca FCC.`,
    "",
    `Erros que se repetem (${reinc.length}):`,
    ...(reinc.length ? reinc.slice(0, 12).map(linhaErro) : ["- nenhum"]),
    "",
    `Outros erros ainda não corrigidos (${outros.length}):`,
    ...(outros.length ? outros.slice(0, 12).map(linhaErro) : ["- nenhum"]),
    "",
    `Por que eu erro: ${p.tipos.filter((t) => t.n > 0).map((t) => `${t.t.toLowerCase()} (${t.n})`).join("; ") || "sem erros classificados"}.`,
    `Já superados: ${sup.length ? sup.slice(0, 15).map((e) => e.tema).filter((t, i, a) => a.indexOf(t) === i).join("; ") : "nenhum ainda"}.`,
    "",
    "Pedido: explique os erros que se repetem em cadeia (de onde vem a regra, como funciona, exceções e como a FCC cobra), com a lei seca literal e a fonte. Depois me dê 3 questões no estilo FCC de cada um, sem a resposta, para eu tentar antes.",
  ];
  return partes.join("\n");
}
