// Relatório quinzenal de questões: soma as respostas da plataforma (estudo_respostas)
// e os lançamentos diários do TEC (estudo_tec, tipo "resolucao", data em `referencia`).
// Lógica pura, usada pela página do servidor.

const TZ = "America/Belem";

export const MIN_QUESTOES_ASSUNTO = 5;

export interface Lancamento {
  dia: string; // YYYY-MM-DD no fuso do Maranhão
  materia_id: string;
  assunto: string;
  feitas: number;
  acertos: number;
  origem: "site" | "tec";
}

export function diaLocal(ms: number): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(ms));
}

export function somarDias(dia: string, n: number): string {
  const [a, m, d] = dia.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10);
}

export const diaCurto = (dia: string) => dia.slice(8, 10) + "/" + dia.slice(5, 7);

export function pct(a: number, q: number) {
  return q ? Math.round((a / q) * 100) : 0;
}

export interface Janela {
  inicio: string;
  fim: string;
}

/** Quinzena de 15 dias terminando em `fim` (inclusive). */
export function quinzena(fim: string): Janela {
  return { inicio: somarDias(fim, -14), fim };
}

export function naJanela(l: Lancamento[], j: Janela) {
  return l.filter((x) => x.dia >= j.inicio && x.dia <= j.fim);
}

export function totais(l: Lancamento[]) {
  const feitas = l.reduce((s, x) => s + x.feitas, 0);
  const acertos = l.reduce((s, x) => s + x.acertos, 0);
  const site = l.filter((x) => x.origem === "site").reduce((s, x) => s + x.feitas, 0);
  return { feitas, acertos, erros: feitas - acertos, pct: pct(acertos, feitas), site, tec: feitas - site };
}

/** Semanas de segunda a domingo que tocam a janela, cortadas nas pontas. */
export function porSemana(l: Lancamento[], j: Janela) {
  const semanas: { inicio: string; fim: string; acertos: number; erros: number }[] = [];
  let ini = j.inicio;
  while (ini <= j.fim) {
    const [a, m, d] = ini.split("-").map(Number);
    const diaSemana = new Date(Date.UTC(a, m - 1, d)).getUTCDay(); // 0 = domingo
    const ateDomingo = diaSemana === 0 ? 0 : 7 - diaSemana;
    const fim = somarDias(ini, ateDomingo) > j.fim ? j.fim : somarDias(ini, ateDomingo);
    const t = totais(l.filter((x) => x.dia >= ini && x.dia <= fim));
    semanas.push({ inicio: ini, fim, acertos: t.acertos, erros: t.erros });
    ini = somarDias(fim, 1);
  }
  return semanas;
}

export interface Linha {
  chave: string;
  materia_id: string;
  assunto?: string;
  feitas: number;
  acertos: number;
  pct: number;
  /** diferença em pontos para a quinzena anterior, null se não houve questão lá */
  delta: number | null;
}

function agrupar(atual: Lancamento[], anterior: Lancamento[], chave: (x: Lancamento) => string): Linha[] {
  const soma = (l: Lancamento[]) => {
    const m = new Map<string, { x: Lancamento; q: number; a: number }>();
    for (const x of l) {
      const k = chave(x);
      const v = m.get(k) ?? { x, q: 0, a: 0 };
      v.q += x.feitas;
      v.a += x.acertos;
      m.set(k, v);
    }
    return m;
  };
  const ant = soma(anterior);
  return [...soma(atual).entries()]
    .filter(([, v]) => v.q > 0)
    .map(([k, v]) => {
      const p = pct(v.a, v.q);
      const va = ant.get(k);
      return { chave: k, materia_id: v.x.materia_id, assunto: v.x.assunto, feitas: v.q, acertos: v.a, pct: p, delta: va && va.q ? p - pct(va.a, va.q) : null };
    });
}

export function porMateria(atual: Lancamento[], anterior: Lancamento[]) {
  return agrupar(atual, anterior, (x) => x.materia_id).map((r) => ({ ...r, assunto: undefined }));
}

const normalizar = (s: string) => s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function porAssunto(atual: Lancamento[], anterior: Lancamento[]) {
  return agrupar(atual, anterior, (x) => x.materia_id + "|" + normalizar(x.assunto)).sort((a, b) => a.pct - b.pct || b.feitas - a.feitas);
}

/** 3 melhores e 3 piores, só entre matérias com dado suficiente, sem repetir. */
export function extremos(materias: Linha[]) {
  const validas = materias.filter((m) => m.feitas >= MIN_QUESTOES_ASSUNTO).sort((a, b) => b.pct - a.pct || b.feitas - a.feitas);
  const melhores = validas.slice(0, 3);
  const piores = validas.filter((m) => !melhores.includes(m)).slice(-3).reverse();
  return { melhores, piores };
}

export type Acao = "lei_seca" | "manutencao" | "leve" | "pouco_dado";

export function acaoDoAssunto(l: Pick<Linha, "feitas" | "pct">): Acao {
  if (l.feitas < MIN_QUESTOES_ASSUNTO) return "pouco_dado";
  if (l.pct < 70) return "lei_seca";
  if (l.pct <= 85) return "manutencao";
  return "leve";
}

export const ACAO_TEXTO: Record<Acao, string> = {
  lei_seca: "Lei seca + 20 questões",
  manutencao: "Manutenção: 10 por semana",
  leve: "5 por semana",
  pouco_dado: "Pouco dado",
};
