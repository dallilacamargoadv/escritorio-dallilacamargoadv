/**
 * Calculadora de data fatal (prazo) — dias úteis ou corridos a partir de um marco inicial.
 *
 * Sem dependências de servidor de propósito, mesmo padrão de `financeiro-utils.ts` /
 * `atividades-utils.ts` — importável tanto por Server quanto por Client Components.
 *
 * Escopo v1: só reflete o que a advogada já sabe (quantidade de dias, tipo de contagem) —
 * não decide qual artigo/prazo se aplica a qual peça. Ver `TABELAS_PRAZO_REFERENCIA` só
 * como chuleta de apoio visual, não é usada no cálculo.
 */

/** Feriados nacionais fixos (mesma data todo ano). */
const FERIADOS_NACIONAIS_FIXOS: Array<{ mes: number; dia: number }> = [
  { mes: 1, dia: 1 }, // Confraternização Universal
  { mes: 4, dia: 21 }, // Tiradentes
  { mes: 5, dia: 1 }, // Dia do Trabalho
  { mes: 9, dia: 7 }, // Independência
  { mes: 10, dia: 12 }, // Nossa Senhora Aparecida
  { mes: 11, dia: 2 }, // Finados
  { mes: 11, dia: 15 }, // Proclamação da República
  { mes: 11, dia: 20 }, // Consciência Negra (Lei 14.759/2023, nacional desde 2024)
  { mes: 12, dia: 25 }, // Natal
];

/**
 * Feriados forenses locais conhecidos (Belém/PA e Redenção/PA — as duas comarcas do
 * escritório hoje). Lista fixa por decisão da advogada (v1) — se faltar algum feriado
 * forense específico do TJPA, adicionar aqui. NÃO confiar cegamente sem conferir o
 * calendário forense oficial do TJPA antes de um protocolo real (mesmo aviso que os
 * agentes de prazo do Claude Code já dão).
 */
const FERIADOS_FORENSES_LOCAIS: Array<{ mes: number; dia: number; nome: string }> = [
  { mes: 8, dia: 15, nome: "Adesão do Grão-Pará à Independência (feriado estadual PA)" },
];

/** Calcula o domingo de Páscoa de um ano (algoritmo de Gauss/Meeus). Base pra Carnaval,
 * Sexta-feira Santa e Corpus Christi, que são móveis. */
function calcularPascoa(ano: number): { mes: number; dia: number } {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return { mes, dia };
}

function diaUTC(ano: number, mes: number, dia: number, offsetDias = 0): Date {
  return new Date(Date.UTC(ano, mes - 1, dia + offsetDias));
}

function dataStringDe(data: Date): string {
  return `${data.getUTCFullYear()}-${String(data.getUTCMonth() + 1).padStart(2, "0")}-${String(
    data.getUTCDate(),
  ).padStart(2, "0")}`;
}

/** Feriados móveis nacionais (Carnaval seg+ter, Sexta-feira Santa, Corpus Christi) do ano. */
function feriadosMoveisDoAno(ano: number): Set<string> {
  const pascoa = calcularPascoa(ano);
  const pascoaDate = diaUTC(ano, pascoa.mes, pascoa.dia);
  const offsets = [-47, -46, -2, 60]; // carnaval seg, carnaval ter, sexta santa, corpus christi
  return new Set(
    offsets.map((offset) =>
      dataStringDe(new Date(pascoaDate.getTime() + offset * 24 * 60 * 60 * 1000)),
    ),
  );
}

const cacheFeriadosMoveisPorAno = new Map<number, Set<string>>();

function isFeriado(dateStr: string): boolean {
  const [ano, mes, dia] = dateStr.split("-").map(Number);

  if (FERIADOS_NACIONAIS_FIXOS.some((f) => f.mes === mes && f.dia === dia)) return true;
  if (FERIADOS_FORENSES_LOCAIS.some((f) => f.mes === mes && f.dia === dia)) return true;

  if (!cacheFeriadosMoveisPorAno.has(ano)) {
    cacheFeriadosMoveisPorAno.set(ano, feriadosMoveisDoAno(ano));
  }
  return cacheFeriadosMoveisPorAno.get(ano)!.has(dateStr);
}

function isFimDeSemana(dateStr: string): boolean {
  const [ano, mes, dia] = dateStr.split("-").map(Number);
  const diaSemana = diaUTC(ano, mes, dia).getUTCDay(); // 0 = domingo, 6 = sábado
  return diaSemana === 0 || diaSemana === 6;
}

export function isDiaUtil(dateStr: string): boolean {
  return !isFimDeSemana(dateStr) && !isFeriado(dateStr);
}

function somarUmDia(dateStr: string): string {
  const [ano, mes, dia] = dateStr.split("-").map(Number);
  return dataStringDe(diaUTC(ano, mes, dia, 1));
}

export type TipoContagem = "uteis" | "corridos";

export interface ResultadoCalculoPrazo {
  dataFatal: string; // YYYY-MM-DD
  diasPulados: number; // quantos dias de fim de semana/feriado foram pulados (só relevante em "uteis")
}

/**
 * Calcula a data fatal a partir de um marco inicial + quantidade de dias.
 *
 * `dias úteis`: conta só dias úteis a partir do dia seguinte ao marco (CPC 224 §2º/231 —
 * início no 1º dia útil seguinte à intimação/publicação), pulando fim de semana e feriado.
 * `dias corridos`: soma calendário corrido, sem pular nada (regra de contratos/prazos
 * administrativos que não seguem CPC 219).
 *
 * Não decide qual é o prazo aplicável (isso é julgamento jurídico da advogada) — só faz a
 * matemática de calendário a partir do que ela informar.
 */
export function calcularDataFatal(
  marcoInicial: string,
  dias: number,
  tipoContagem: TipoContagem,
): ResultadoCalculoPrazo {
  if (dias <= 0) {
    return { dataFatal: marcoInicial, diasPulados: 0 };
  }

  if (tipoContagem === "corridos") {
    const [ano, mes, dia] = marcoInicial.split("-").map(Number);
    return { dataFatal: dataStringDe(diaUTC(ano, mes, dia, dias)), diasPulados: 0 };
  }

  // dias úteis: começa a contar a partir do 1º dia útil seguinte ao marco
  let cursor = somarUmDia(marcoInicial);
  let diasPulados = 0;
  while (!isDiaUtil(cursor)) {
    cursor = somarUmDia(cursor);
    diasPulados++;
  }

  let contados = 1; // o dia acima já é o 1º dia útil contado
  while (contados < dias) {
    cursor = somarUmDia(cursor);
    if (isDiaUtil(cursor)) {
      contados++;
    } else {
      diasPulados++;
    }
  }

  return { dataFatal: cursor, diasPulados };
}

/**
 * Chuleta de referência (não usada no cálculo, só exibida como apoio visual no formulário
 * pra advogada lembrar quantos dias cada peça costuma ter — ela quem decide o número real).
 */
export const TABELAS_PRAZO_REFERENCIA: Array<{ label: string; dias: number; tipo: TipoContagem }> = [
  { label: "Contestação (rito comum)", dias: 15, tipo: "uteis" },
  { label: "Apelação", dias: 15, tipo: "uteis" },
  { label: "Agravo de instrumento", dias: 15, tipo: "uteis" },
  { label: "Embargos de declaração", dias: 5, tipo: "uteis" },
  { label: "Contrarrazões", dias: 15, tipo: "uteis" },
  { label: "Embargos à execução fiscal", dias: 30, tipo: "corridos" },
];
