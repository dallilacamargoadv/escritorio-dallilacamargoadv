// Central de estudos (PGE-MA). Arquivo puro: pode ser importado por Server e Client Components.
import editalJson from "@/content/estudos/edital.json";
import { addDaysToDateString } from "@/lib/atividades-utils";

export type TopicoStatus = "nao_iniciado" | "estudando" | "revisar" | "dominado";
export type ItemTipo = "teoria" | "questoes" | "revisao" | "lei_seca" | "discursiva" | "simulado";

export interface Topico {
  id: string;
  n: number;
  titulo: string;
  sub: string[];
}
export interface Materia {
  id: string;
  nome: string;
  fase: number;
  condicional: boolean;
  topicos: Topico[];
}
export interface TopicoEstado {
  topico_id: string;
  status: TopicoStatus;
  fora_do_edital: boolean;
  nota: string | null;
}
export interface CronogramaItem {
  id: string;
  data: string;
  ordem: number;
  materia_id: string;
  topico_id: string | null;
  tipo: ItemTipo;
  titulo: string;
  minutos: number;
  feito: boolean;
  feito_em: string | null;
}
export type NovoItem = Omit<CronogramaItem, "id" | "feito" | "feito_em">;

export interface EstudoConfig {
  dataProva: string | null;
  /** minutos disponíveis por dia da semana, de domingo (0) a sábado (6) */
  minutosPorDia: number[];
  /** matérias de Conhecimentos Gerais que só entram se o edital trouxer */
  incluirCondicionais: string[];
  /** horas diferentes em datas específicas (de/ate inclusive); a última que casar vale */
  excecoes?: ExcecaoHoras[];
  /** dias inteiros de revisão do que já foi estudado (sem matéria nova) */
  diasRevisao?: string[];
}

export interface ExcecaoHoras {
  de: string;
  ate: string;
  minutos: number;
}

export function minutosDoDia(config: EstudoConfig, data: string, dow: number): number {
  const ex = (config.excecoes ?? []).filter((e) => data >= e.de && data <= e.ate).pop();
  return ex ? ex.minutos : (config.minutosPorDia[dow] ?? 0);
}

export const EDITAL = editalJson as {
  fonte: string;
  prova: Record<string, string>;
  materias: Materia[];
};
export const MATERIAS: Materia[] = EDITAL.materias;
export const MATERIA_POR_ID = new Map(MATERIAS.map((m) => [m.id, m]));
export const TOPICO_POR_ID = new Map(
  MATERIAS.flatMap((m) => m.topicos.map((t) => [t.id, { ...t, materia: m }] as const)),
);

export const STATUS_LABELS: Record<TopicoStatus, string> = {
  nao_iniciado: "Não iniciado",
  estudando: "Estudando",
  revisar: "Precisa revisar",
  dominado: "Dominado",
};
/** peso de cada status no progresso do edital */
export const STATUS_PESO: Record<TopicoStatus, number> = {
  nao_iniciado: 0,
  estudando: 0.35,
  revisar: 0.7,
  dominado: 1,
};
export const TIPO_LABELS: Record<ItemTipo, string> = {
  teoria: "Teoria",
  questoes: "Questões",
  revisao: "Revisão",
  lei_seca: "Lei seca",
  discursiva: "Discursiva",
  simulado: "Simulado",
};
export const FASE_LABELS: Record<number, string> = {
  0: "Rotina diária",
  1: "Fase 1 · Núcleo da prova",
  2: "Fase 2 · Eixo da Procuradoria",
  3: "Fase 3 · Complementares",
  4: "Dias alternados",
  5: "Cultura geral do Estado",
};

export const CONFIG_PADRAO: EstudoConfig = {
  dataProva: null,
  minutosPorDia: [120, 180, 180, 180, 180, 180, 150],
  incluirCondicionais: [],
};

export function normalizarConfig(valor: unknown): EstudoConfig {
  const v = (valor ?? {}) as Partial<EstudoConfig>;
  const minutos =
    Array.isArray(v.minutosPorDia) && v.minutosPorDia.length === 7
      ? v.minutosPorDia.map((m) => Math.max(0, Math.min(600, Math.round(Number(m) || 0))))
      : CONFIG_PADRAO.minutosPorDia;
  const data =
    typeof v.dataProva === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v.dataProva) ? v.dataProva : null;
  const cond = Array.isArray(v.incluirCondicionais)
    ? v.incluirCondicionais.filter((id) => MATERIA_POR_ID.get(id)?.condicional)
    : [];
  const iso = (x: unknown) => typeof x === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x);
  const excecoes = Array.isArray(v.excecoes)
    ? v.excecoes
        .filter((e) => e && iso(e.de) && iso(e.ate) && e.de <= e.ate)
        .slice(0, 20)
        .map((e) => ({ de: e.de, ate: e.ate, minutos: Math.max(0, Math.min(600, Math.round(Number(e.minutos) || 0))) }))
    : [];
  const diasRevisao = Array.isArray(v.diasRevisao) ? v.diasRevisao.filter(iso).slice(0, 30) : [];
  return {
    dataProva: data,
    minutosPorDia: minutos,
    incluirCondicionais: cond,
    ...(excecoes.length ? { excecoes } : {}),
    ...(diasRevisao.length ? { diasRevisao } : {}),
  };
}

/**
 * Mapa estratégico dela (24/11/2026, pré-edital): estas matérias não entram no cronograma gerado
 * até o edital sair. Ambiental, Trabalho, Direitos Humanos, Previdenciário, legislação e
 * conhecimentos do Maranhão. Arquivo: CONCURSO PGE-MA/05 Edital/mapa-estrategico-prioridades.md.
 */
export const FORA_ATE_O_EDITAL = new Set(["B1", "B4", "B9", "B10", "B11", "A4", "A5", "A6", "A7"]);
// A4 e A5 (História e Geografia do MA) entram só no fim de semana, ver `cultura` em gerarCronograma.

export function materiaAtiva(m: Materia, config: EstudoConfig): boolean {
  return !m.condicional || config.incluirCondicionais.includes(m.id);
}

/** dia da semana (0 = domingo) de uma data YYYY-MM-DD, sem fuso */
export function diaDaSemana(data: string): number {
  const [a, m, d] = data.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d)).getUTCDay();
}
export function diasEntre(de: string, ate: string): number {
  const [a1, m1, d1] = de.split("-").map(Number);
  const [a2, m2, d2] = ate.split("-").map(Number);
  return Math.round((Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1)) / 86400000);
}
export function formatarData(data: string, opcoes: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit" }) {
  const [a, m, d] = data.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d, 12)).toLocaleDateString("pt-BR", { timeZone: "UTC", ...opcoes });
}

export interface ProgressoMateria {
  materia: Materia;
  total: number;
  dominados: number;
  iniciados: number;
  percentual: number;
}
export function progressoPorMateria(
  estados: Map<string, TopicoEstado>,
  config: EstudoConfig,
): ProgressoMateria[] {
  return MATERIAS.filter((m) => materiaAtiva(m, config)).map((m) => {
    const tops = m.topicos.filter((t) => !estados.get(t.id)?.fora_do_edital);
    let soma = 0;
    let dominados = 0;
    let iniciados = 0;
    for (const t of tops) {
      const s = estados.get(t.id)?.status ?? "nao_iniciado";
      soma += STATUS_PESO[s];
      if (s === "dominado") dominados++;
      if (s !== "nao_iniciado") iniciados++;
    }
    return {
      materia: m,
      total: tops.length,
      dominados,
      iniciados,
      percentual: tops.length ? Math.round((soma / tops.length) * 100) : 0,
    };
  });
}
export function progressoGeral(lista: ProgressoMateria[]) {
  const total = lista.reduce((s, p) => s + p.total, 0);
  const pond = lista.reduce((s, p) => s + (p.percentual / 100) * p.total, 0);
  const dominados = lista.reduce((s, p) => s + p.dominados, 0);
  const iniciados = lista.reduce((s, p) => s + p.iniciados, 0);
  return { total, dominados, iniciados, percentual: total ? Math.round((pond / total) * 100) : 0 };
}

/* ===================== GERADOR DO CRONOGRAMA ===================== */
const LIMITE_DIAS = 200;
/** peso no rodízio: matérias do núcleo da prova aparecem mais vezes */
const PESO_FASE: Record<number, number> = { 1: 3, 2: 2, 3: 1 };
const arred5 = (n: number) => Math.max(5, Math.round(n / 5) * 5);

/**
 * Monta o cronograma de hoje até a véspera da prova (ou 200 dias, se não houver data).
 * Método revisto em 26/11/2026 (pedido dela: Direito e Português primeiro, revisão todo dia,
 * matemática e informática sem ficar para trás, erros e subjetiva no domingo):
 * - Todo dia, inclusive fim de semana: revisão espaçada (questões, cartões e artigos que vencem hoje).
 * - Segunda a sexta: 2 matérias de Direito em rodízio (núcleo pesa mais). Cada uma segue
 *   aquecimento → lei seca do tema (leitura + certo/errado) → teoria só no que errou → bateria de questões.
 *   Português todo dia (teoria segunda, quarta e sexta). Matemática ou Informática todo dia, alternando,
 *   com o roteiro "como reconhecer e resolver".
 * - Quarta: uma matéria + simulado de lei seca de uma matéria já estudada.
 * - Sábado: simuladão cronometrado + correção rápida.
 * - Domingo: caderno de erros da semana (inclusive do simuladão e do TEC), discursiva e análise dela, cultura do Estado.
 * Quando a teoria acaba, as matérias do dia viram lei seca + questões.
 */
export function gerarCronograma(
  hoje: string,
  config: EstudoConfig,
  estados: Map<string, TopicoEstado>,
  /** aulas dos cadernos ainda não marcadas como estudadas, por tópico do edital, na ordem do caderno */
  aulasPendentes: Map<string, string[]> = new Map(),
): NovoItem[] {
  const ativas = MATERIAS.filter((m) => materiaAtiva(m, config) && !FORA_ATE_O_EDITAL.has(m.id));
  // Teoria nova só para o que ainda não foi estudado. O que já foi visto (estudando, revisar) vai para revisão e questões.
  const pendente = (t: Topico) => {
    const e = estados.get(t.id);
    return !e?.fora_do_edital && (!e || e.status === "nao_iniciado");
  };
  const principais = ativas.filter((m) => m.fase >= 1 && m.fase <= 3).sort((a, b) => a.fase - b.fase);
  // Fila de teoria por aula: tópico com caderno vira uma unidade por aula não estudada (ex.: só "Remédios
  // constitucionais", se o resto de direitos fundamentais já foi estudado). Sem caderno, vale o tópico inteiro.
  const unidades = (m: Materia) =>
    m.topicos.flatMap((t) => {
      if (estados.get(t.id)?.fora_do_edital) return [];
      const aulas = aulasPendentes.get(t.id);
      if (aulas) return aulas.map((titulo) => ({ id: t.id, titulo }));
      return pendente(t) ? [{ id: t.id, titulo: t.titulo }] : [];
    });
  const filaTopicos = new Map(principais.map((m) => [m.id, unidades(m)]));
  const vistos = new Map(principais.map((m) => [m.id, 0]));
  const credito = new Map(principais.map((m) => [m.id, 0]));
  const portugues = ativas.find((m) => m.id === "A1");
  const matematica = ativas.find((m) => m.id === "A2");
  const informatica = ativas.find((m) => m.id === "A3");
  // História e Geografia do MA voltam no fim de semana (pedido dela em 27/11), mesmo antes do edital.
  const cultura = MATERIAS.filter((m) => (m.id === "A4" || m.id === "A5") && materiaAtiva(m, config)).flatMap((m) =>
    m.topicos.filter(pendente).map((t) => ({ m, t })),
  );
  const estudadas = principais.filter((m) => m.topicos.some((t) => {
    const st = estados.get(t.id)?.status;
    return st && st !== "nao_iniciado";
  }));
  const diasRevisao = new Set(config.diasRevisao ?? []);

  const fim = config.dataProva ? addDaysToDateString(config.dataProva, -1) : addDaysToDateString(hoje, LIMITE_DIAS);
  const total = Math.min(LIMITE_DIAS, diasEntre(hoje, fim));
  const itens: NovoItem[] = [];
  let iCult = 0;
  let iSimLei = 0;

  /** rodízio ponderado: escolhe a matéria com mais crédito acumulado, sem repetir no dia */
  function escolher(excluir: Set<string>): Materia | null {
    const comTeoria = principais.filter((m) => (filaTopicos.get(m.id)?.length ?? 0) > 0);
    const candidatas = (comTeoria.length ? comTeoria : principais).filter((m) => !excluir.has(m.id));
    if (!candidatas.length) return null;
    for (const m of candidatas) credito.set(m.id, (credito.get(m.id) ?? 0) + (PESO_FASE[m.fase] ?? 1));
    const soma = candidatas.reduce((s, m) => s + (PESO_FASE[m.fase] ?? 1), 0);
    const melhor = candidatas.reduce((a, b) => ((credito.get(b.id) ?? 0) > (credito.get(a.id) ?? 0) ? b : a));
    credito.set(melhor.id, (credito.get(melhor.id) ?? 0) - soma);
    return melhor;
  }

  type Add = (it: Omit<NovoItem, "data" | "ordem">) => void;
  /** Um bloco de matéria: tópico novo (aquecimento, lei seca, teoria, questões) ou, sem tópico novo, lei seca + questões. */
  function estudar(m: Materia, bloco: number, add: Add) {
    const fila = filaTopicos.get(m.id) ?? [];
    const t = fila.shift();
    if (t) {
      vistos.set(m.id, (vistos.get(m.id) ?? 0) + 1);
      const aquece = 10;
      const lei = arred5((bloco - aquece) * 0.3);
      const teoria = arred5((bloco - aquece) * 0.4);
      const questoes = Math.floor((bloco - aquece - lei - teoria) / 5) * 5;
      add({ materia_id: m.id, topico_id: t.id, tipo: "questoes", titulo: `${m.nome}: aquecimento, 5 questões de ${t.titulo} antes de estudar`, minutos: aquece });
      add({ materia_id: m.id, topico_id: t.id, tipo: "lei_seca", titulo: `${m.nome}: lei seca de ${t.titulo} (grife o que a FCC troca: pode/deve, prazos, competência)`, minutos: lei });
      add({ materia_id: m.id, topico_id: t.id, tipo: "teoria", titulo: `${m.nome}: ${t.titulo} (aula no caderno, com calma)`, minutos: teoria });
      add({ materia_id: m.id, topico_id: t.id, tipo: "questoes", titulo: `${m.nome}: bateria de questões de ${t.titulo}`, minutos: questoes });
    } else {
      const lei = arred5(bloco * 0.3);
      add({ materia_id: m.id, topico_id: null, tipo: "lei_seca", titulo: `${m.nome}: lei seca dos pontos que mais caem`, minutos: lei });
      add({ materia_id: m.id, topico_id: null, tipo: "questoes", titulo: `${m.nome}: questões FCC e refazer os erros`, minutos: Math.floor((bloco - lei) / 5) * 5 });
    }
  }

  for (let d = 0; d <= total; d++) {
    const data = addDaysToDateString(hoje, d);
    const dow = diaDaSemana(data);
    let resta = minutosDoDia(config, data, dow);
    if (resta < 15) continue;
    let ordem = 0;
    const add = (it: Omit<NovoItem, "data" | "ordem">) => {
      if (it.minutos < 5 || resta < 5) return;
      const minutos = Math.min(it.minutos, resta);
      itens.push({ ...it, minutos, data, ordem: ordem++ });
      resta -= minutos;
    };

    // revisão espaçada todo dia, até a prova
    add({ materia_id: "REV", topico_id: null, tipo: "revisao", titulo: "Revisão espaçada: a fila de hoje na aba Revisão (questões, cartões e artigos)", minutos: dow === 6 ? 20 : 15 });

    /* ---------- DIA DE REVISÃO: só o que já foi estudado ---------- */
    if (diasRevisao.has(data)) {
      for (const m of estudadas) {
        if (resta < 30) break;
        const vistosM = m.topicos.filter((t) => (estados.get(t.id)?.status ?? "nao_iniciado") !== "nao_iniciado");
        const temas = vistosM.map((t) => t.titulo).join(", ");
        const t0 = vistosM[0]?.id ?? null;
        add({ materia_id: m.id, topico_id: t0, tipo: "lei_seca", titulo: `${m.nome}: lei seca + certo/errado de ${temas} (aba Desafios)`, minutos: 30 });
        add({ materia_id: m.id, topico_id: t0, tipo: "questoes", titulo: `${m.nome}: questões com jurisprudência e cartões de ${temas}`, minutos: 30 });
      }
      if (portugues && resta >= 20) {
        add({ materia_id: "A1", topico_id: null, tipo: "questoes", titulo: "Português: questões dos assuntos já vistos com a professora Adriana", minutos: 30 });
      }
      continue;
    }

    /* ---------- SÁBADO: dia inteiro ---------- */
    if (dow === 6) {
      add({ materia_id: "REV", topico_id: null, tipo: "revisao", titulo: "Revisão do que ficou para trás: questões erradas das matérias já estudadas (laboratório de erros)", minutos: 60 });
      const prova = resta >= 300 ? 150 : Math.max(60, arred5(resta * 0.4));
      add({ materia_id: "SIM", topico_id: null, tipo: "simulado", titulo: `Simuladão FCC cronometrado (${Math.round(prova / 3)} questões, 3 minutos cada, sem consulta)`, minutos: prova });
      add({ materia_id: "SIM", topico_id: null, tipo: "questoes", titulo: "Correção do simuladão: classifique cada erro, inclusive chute e dúvida", minutos: 40 });
      const m = escolher(new Set());
      if (m && resta >= 60) estudar(m, Math.min(resta, 120), add);
      if (informatica && resta >= 30) {
        add({ materia_id: "A3", topico_id: null, tipo: "questoes", titulo: "Informática: roteiro \"como reconhecer e resolver\" da aula da vez + questões", minutos: 40 });
      }
      if (cultura.length && resta >= 30) {
        const c = cultura[iCult++ % cultura.length];
        add({ materia_id: c.m.id, topico_id: c.t.id, tipo: "teoria", titulo: `${c.m.nome}: ${c.t.titulo}`, minutos: Math.min(resta, 50) });
      }
      continue;
    }

    /* ---------- DOMINGO: dia inteiro ---------- */
    if (dow === 0) {
      add({ materia_id: "REV", topico_id: null, tipo: "revisao", titulo: "Caderno de erros da semana: refaça as erradas (site, simuladão e TEC), anote o motivo e o artigo", minutos: 90 });
      add({ materia_id: "REV", topico_id: null, tipo: "lei_seca", titulo: "Lei seca dos erros: releia os artigos que apareceram no caderno de erros", minutos: 30 });
      if (resta >= 120) {
        add({ materia_id: "DISC", topico_id: null, tipo: "discursiva", titulo: "Discursiva cronometrada + análise: nota, o que faltou (tese, base legal, jurisprudência, estrutura)", minutos: 60 });
      }
      const m = escolher(new Set());
      if (m && resta >= 75) estudar(m, Math.min(resta - 60, 120), add);
      if (matematica && resta >= 40) {
        add({ materia_id: "A2", topico_id: null, tipo: "questoes", titulo: "Matemática: refazer as erradas da semana com o roteiro + 10 questões novas", minutos: 45 });
      }
      if (cultura.length && resta >= 45) {
        const c = cultura[iCult++ % cultura.length];
        add({ materia_id: c.m.id, topico_id: c.t.id, tipo: "teoria", titulo: `${c.m.nome}: ${c.t.titulo}`, minutos: Math.min(resta - 15, 50) });
      }
      add({ materia_id: "REV", topico_id: null, tipo: "revisao", titulo: "Fechamento: olhe a semana que vem e anote os 3 pontos fracos da semana", minutos: 15 });
      continue;
    }

    /* ---------- SEGUNDA A SEXTA: no máximo 3 matérias (Português + 2) ---------- */
    if (portugues) {
      // Português segue a ordem do curso da professora Adriana (fora do site): aula da vez + questões do mesmo assunto.
      const teoriaPt = dow === 1 || dow === 3 || dow === 5;
      add(
        teoriaPt
          ? { materia_id: "A1", topico_id: null, tipo: "teoria", titulo: "Português: próxima aula da professora Adriana + 10 questões FCC do mesmo assunto", minutos: 40 }
          : { materia_id: "A1", topico_id: null, tipo: "questoes", titulo: "Português: questões FCC do assunto da última aula da Adriana + refazer os erros", minutos: 25 },
      );
    }

    // terça e quinta: subjetiva curta (a pergunta discursiva do dia na aba Revisão)
    if (dow === 2 || dow === 4) {
      add({ materia_id: "DISC", topico_id: null, tipo: "discursiva", titulo: "Subjetiva curta: responda por escrito a pergunta discursiva do dia (aba Revisão)", minutos: 20 });
    }

    // quarta: dia da matemática (uma matéria de Direito + Matemática + simulado de lei seca)
    const diaMat = dow === 3 && !!matematica;
    const jaVistas = principais.filter((m) => (vistos.get(m.id) ?? 0) > 0 || estudadas.includes(m));
    const simLei = dow === 3 && jaVistas.length ? jaVistas[iSimLei++ % jaVistas.length] : null;
    const reservaSim = simLei ? 30 : 0;
    const reservaMat = diaMat ? 60 : 0;

    const usadas = new Set<string>();
    const nMaterias = diaMat ? 1 : 2;
    for (let k = 0; k < nMaterias; k++) {
      const m = escolher(usadas);
      if (!m) break;
      usadas.add(m.id);
      const bloco = Math.floor((resta - reservaSim - reservaMat) / (nMaterias - k));
      if (bloco < 25) break;
      estudar(m, bloco, add);
    }

    if (diaMat) {
      add({ materia_id: "A2", topico_id: null, tipo: "teoria", titulo: "Matemática: aula da vez (roteiro \"como reconhecer e resolver\") + 15 questões, escrevendo cada passo", minutos: 60 });
    }
    if (simLei) {
      add({ materia_id: simLei.id, topico_id: null, tipo: "simulado", titulo: `Simulado de lei seca: ${simLei.nome} (10 questões, cronometrado)`, minutos: resta });
    }
  }
  return itens;
}

/** data do último bloco de teoria: quando o edital termina de ser visto no ritmo atual */
export function previsaoFimTeoria(itens: { data: string; tipo: ItemTipo; materia_id: string }[]): string | null {
  const teoria = itens.filter((i) => i.tipo === "teoria" && (MATERIA_POR_ID.get(i.materia_id)?.fase ?? 0) >= 1 && (MATERIA_POR_ID.get(i.materia_id)?.fase ?? 0) <= 3);
  return teoria.length ? teoria[teoria.length - 1].data : null;
}

/** dias seguidos (terminando hoje ou ontem) com pelo menos um bloco feito */
export function diasSeguidos(feitos: string[], hoje: string): number {
  const dias = new Set(feitos);
  let seq = 0;
  let dia = dias.has(hoje) ? hoje : addDaysToDateString(hoje, -1);
  while (dias.has(dia)) {
    seq++;
    dia = addDaysToDateString(dia, -1);
  }
  return seq;
}

/* ===================== MENSAGENS ===================== */
const INCENTIVOS = [
  "Constância ganha de intensidade. Um bloco bem feito hoje vale mais que uma maratona no domingo.",
  "Errar questão agora é barato. Cada erro anotado é um ponto a menos de surpresa na prova.",
  "Você não precisa estudar tudo hoje. Precisa só fazer o bloco que está na sua frente.",
  "A FCC cobra a letra da lei. Ler o artigo com calma hoje é ganhar questão depois.",
  "Revisar é o que transforma estudo em memória. Não pule a revisão de hoje.",
  "Dia ruim também conta. Se der só a revisão, já é um dia na sequência.",
  "Quem chega à aprovação raramente é quem mais estudou num dia. É quem não parou.",
];

export interface ContextoMensagem {
  hoje: string;
  atrasados: number;
  feitosHoje: number;
  totalHoje: number;
  seguidos: number;
  percentualEdital: number;
  diasAteProva: number | null;
  materiaMaisAtrasada: string | null;
}
export function mensagemDoDia(c: ContextoMensagem): { titulo: string; texto: string } {
  const indice = diasEntre("2026-01-01", c.hoje);
  const incentivo = INCENTIVOS[((indice % INCENTIVOS.length) + INCENTIVOS.length) % INCENTIVOS.length];
  if (c.totalHoje === 0 && c.atrasados === 0) {
    return { titulo: "Comece pelo cronograma", texto: "Preencha seus horários na aba Cronograma e gere o plano. A partir daí, esta tela mostra o que fazer a cada dia." };
  }
  if (c.totalHoje > 0 && c.feitosHoje === c.totalHoje) {
    return { titulo: "Dia cumprido", texto: `Você fechou todos os blocos de hoje${c.seguidos > 1 ? ` e está há ${c.seguidos} dias seguidos estudando` : ""}. Descanse sem culpa.` };
  }
  if (c.atrasados >= 6) {
    return { titulo: "Hora de replanejar", texto: `Ficaram ${c.atrasados} blocos para trás. Isso acontece. Na aba Cronograma, toque em "Replanejar" e o plano se ajusta a partir de hoje, sem você precisar recuperar tudo de uma vez.` };
  }
  if (c.diasAteProva !== null && c.diasAteProva <= 30) {
    return { titulo: `Faltam ${c.diasAteProva} dias`, texto: "Reta final: priorize questões, revisão dos seus erros e lei seca. Conteúdo novo só se for do núcleo da prova." };
  }
  if (c.seguidos >= 3) {
    return { titulo: `${c.seguidos} dias seguidos`, texto: `${incentivo}` };
  }
  if (c.materiaMaisAtrasada) {
    return { titulo: "Atenção a uma matéria", texto: `${c.materiaMaisAtrasada} é a matéria do núcleo com menos progresso. ${incentivo}` };
  }
  return { titulo: "Mensagem de hoje", texto: incentivo };
}
