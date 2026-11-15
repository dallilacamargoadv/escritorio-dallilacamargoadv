// Classificação de erros/acertos, estatísticas e "próxima melhor ação". Arquivo puro (Server e Client).
import { MATERIA_POR_ID, type CronogramaItem } from "@/lib/estudos-utils";

export type TipoErro =
  | "conteudo"
  | "interpretacao"
  | "atencao"
  | "confusao"
  | "legislacao"
  | "jurisprudencia"
  | "excecao"
  | "esquecimento"
  | "estrategia"
  | "pegadinha";
export type TipoAcerto = "seguro" | "eliminacao" | "duvida" | "chute" | "apos_revisao";
export type Classificacao = TipoErro | TipoAcerto;

export const TIPOS_ERRO: { k: TipoErro; t: string; d: string }[] = [
  { k: "conteudo", t: "Não conhecia o assunto", d: "Erro de conteúdo" },
  { k: "interpretacao", t: "Entendi mal o enunciado", d: "Erro de interpretação" },
  { k: "atencao", t: "Não vi uma palavra-chave", d: "Erro de atenção (exceto, não, sempre)" },
  { k: "confusao", t: "Misturei conceitos", d: "Erro de confusão" },
  { k: "legislacao", t: "Não sabia o artigo", d: "Erro de legislação" },
  { k: "jurisprudencia", t: "Não sabia o entendimento", d: "Erro de jurisprudência" },
  { k: "excecao", t: "Esqueci a exceção", d: "Sabia a regra, não a exceção" },
  { k: "esquecimento", t: "Já soube e esqueci", d: "Erro de memória" },
  { k: "estrategia", t: "Tempo ou prioridade", d: "Erro estratégico" },
  { k: "pegadinha", t: "Caí na pegadinha", d: "Armadilha característica da banca" },
];
export const TIPOS_ACERTO: { k: TipoAcerto; t: string }[] = [
  { k: "seguro", t: "Com segurança" },
  { k: "eliminacao", t: "Por eliminação" },
  { k: "duvida", t: "Com dúvida" },
  { k: "chute", t: "No chute" },
  { k: "apos_revisao", t: "Depois de revisar" },
];
export const CLASSIFICACAO_LABEL: Record<Classificacao, string> = Object.fromEntries([
  ...TIPOS_ERRO.map((e) => [e.k, e.t]),
  ...TIPOS_ACERTO.map((a) => [a.k, a.t]),
]) as Record<Classificacao, string>;
export const EH_ERRO = new Set<string>(TIPOS_ERRO.map((e) => e.k));

export interface Questao {
  id: string;
  materia_id: string;
  mat: string;
  tema: string;
  ref: string;
  enun: string;
  itens?: string[];
  alts: string[];
  c: number;
  why: string[];
  fonte: string;
  alerta?: string;
  orig?: string;
}
export interface Resposta {
  id: string;
  questao_id: string;
  materia_id: string;
  tema: string | null;
  correta: boolean;
  alternativa: number | null;
  classificacao: Classificacao;
  tempo_seg: number | null;
  contexto: string;
  nota: string | null;
  respondida_em: string;
}

/** acerto que não conta como domínio: chute e dúvida */
export function acertoFirme(r: Resposta) {
  return r.correta && r.classificacao !== "chute" && r.classificacao !== "duvida";
}

export interface StatMateria {
  materia_id: string;
  nome: string;
  respostas: number;
  acertos: number;
  firmes: number;
  pct: number;
  pctFirme: number;
}
export function estatisticasPorMateria(respostas: Resposta[]): StatMateria[] {
  const m = new Map<string, StatMateria>();
  for (const r of respostas) {
    const s =
      m.get(r.materia_id) ??
      { materia_id: r.materia_id, nome: MATERIA_POR_ID.get(r.materia_id)?.nome ?? r.materia_id, respostas: 0, acertos: 0, firmes: 0, pct: 0, pctFirme: 0 };
    s.respostas++;
    if (r.correta) s.acertos++;
    if (acertoFirme(r)) s.firmes++;
    m.set(r.materia_id, s);
  }
  return [...m.values()]
    .map((s) => ({ ...s, pct: Math.round((s.acertos / s.respostas) * 100), pctFirme: Math.round((s.firmes / s.respostas) * 100) }))
    .sort((a, b) => a.pctFirme - b.pctFirme);
}

export interface TemaCritico {
  materia_id: string;
  tema: string;
  erros: number;
  tentativas: number;
  tipoMaisComum: TipoErro | null;
}
/** temas com 2 ou mais erros (ou acertos no chute) nos últimos 45 dias */
export function temasCriticos(respostas: Resposta[], agoraMs: number): TemaCritico[] {
  const limite = agoraMs - 45 * 86400000;
  const m = new Map<string, { materia_id: string; tema: string; erros: number; tentativas: number; tipos: Map<string, number> }>();
  for (const r of respostas) {
    if (!r.tema || Date.parse(r.respondida_em) < limite) continue;
    const k = r.materia_id + "|" + r.tema;
    const s = m.get(k) ?? { materia_id: r.materia_id, tema: r.tema, erros: 0, tentativas: 0, tipos: new Map() };
    s.tentativas++;
    if (!acertoFirme(r)) {
      s.erros++;
      if (EH_ERRO.has(r.classificacao)) s.tipos.set(r.classificacao, (s.tipos.get(r.classificacao) ?? 0) + 1);
    }
    m.set(k, s);
  }
  return [...m.values()]
    .filter((s) => s.erros >= 2)
    .map((s) => ({
      materia_id: s.materia_id,
      tema: s.tema,
      erros: s.erros,
      tentativas: s.tentativas,
      tipoMaisComum: ([...s.tipos.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] as TipoErro) ?? null,
    }))
    .sort((a, b) => b.erros - a.erros);
}

export function tempoMedio(respostas: Resposta[]): number | null {
  const t = respostas.map((r) => r.tempo_seg).filter((x): x is number => typeof x === "number" && x > 0);
  return t.length ? Math.round(t.reduce((s, x) => s + x, 0) / t.length) : null;
}
export function formatarTempo(seg: number | null): string {
  if (seg === null) return "?";
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return m ? `${m}m ${String(s).padStart(2, "0")}s` : `${s}s`;
}

export interface Acao {
  titulo: string;
  porque: string;
  href: string;
  rotulo: string;
}
/**
 * Escolhe a ação mais útil agora, sempre com a justificativa nos dados.
 * Ordem: erro repetido > muitos blocos atrasados > próximo bloco de hoje > começar o plano.
 */
export function proximaMelhorAcao(c: {
  criticos: TemaCritico[];
  atrasados: number;
  proximoBloco: CronogramaItem | null;
  temPlano: boolean;
}): Acao {
  const t = c.criticos[0];
  if (t) {
    const tipo = t.tipoMaisComum ? ` O motivo mais comum foi: ${CLASSIFICACAO_LABEL[t.tipoMaisComum].toLowerCase()}.` : "";
    return {
      titulo: `Treine ${t.tema} (${MATERIA_POR_ID.get(t.materia_id)?.nome ?? t.materia_id})`,
      porque: `Você errou ou acertou sem firmeza ${t.erros} de ${t.tentativas} tentativas desse tema nos últimos 45 dias.${tipo} Leia a fonte de cada questão e refaça só esse tema.`,
      href: `/admin/estudos/questoes?materia=${t.materia_id}&tema=${encodeURIComponent(t.tema)}&status=erradas`,
      rotulo: "Treinar esse tema",
    };
  }
  if (c.atrasados >= 6) {
    return {
      titulo: "Replanejar o cronograma",
      porque: `Ficaram ${c.atrasados} blocos para trás. Refazer o plano a partir de hoje evita acumular tudo no mesmo dia.`,
      href: "/admin/estudos/cronograma",
      rotulo: "Abrir cronograma",
    };
  }
  if (c.proximoBloco) {
    return {
      titulo: c.proximoBloco.titulo,
      porque: `É o próximo bloco do seu cronograma de hoje (${c.proximoBloco.minutos} min).`,
      href: c.proximoBloco.tipo === "questoes" ? `/admin/estudos/questoes?materia=${c.proximoBloco.materia_id}` : "/admin/estudos/cronograma",
      rotulo: c.proximoBloco.tipo === "questoes" ? "Ir para as questões" : "Ver o bloco",
    };
  }
  if (!c.temPlano) {
    return {
      titulo: "Montar o seu cronograma",
      porque: "Sem horários cadastrados, o sistema não consegue sugerir o que fazer em cada dia.",
      href: "/admin/estudos/cronograma",
      rotulo: "Montar agora",
    };
  }
  return {
    titulo: "Questões mistas para fixar",
    porque: "O plano de hoje está em dia. Intercalar matérias fixa mais do que repetir a mesma.",
    href: "/admin/estudos/questoes?status=nao_respondidas",
    rotulo: "Fazer questões",
  };
}
