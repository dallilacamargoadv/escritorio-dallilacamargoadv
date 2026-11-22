// Cadernos por matéria: aulas em cadeia lógica (origem, regra, exceção, banca), com lei seca e blocos interativos.
// Arquivo puro (Server e Client). O conteúdo fica em content/estudos/cadernos/<materia>.json.

export type Etapa = "origem" | "regra" | "excecao" | "banca";
export const ETAPA_LABEL: Record<Etapa, string> = {
  origem: "De onde vem",
  regra: "Como funciona",
  excecao: "Exceções e divergências",
  banca: "Como a FCC cobra",
};

export type Bloco =
  | { t: "texto"; html: string }
  | { t: "lei"; ref: string; texto: string }
  | { t: "leia"; ref: string; motivo: string }
  | { t: "nota"; tom: "pegadinha" | "atencao" | "macete" | "hipotese"; titulo: string; html: string }
  | { t: "juris"; tribunal: string; ref: string; tese: string }
  | { t: "tabela"; cab: string[]; linhas: string[][] }
  | { t: "matriz"; linhas: string[]; colunas: string[]; celulas: [boolean, string][][] }
  | { t: "virar"; cartas: { frente: string; sub?: string; verso: string; detalhe?: string }[] }
  | { t: "passos"; nos: { titulo: string; sub: string }[]; passos: { no: number; texto: string }[] }
  | { t: "alternar"; opcoes: { rotulo: string; modo: "dentro" | "fora"; caixas: { titulo: string; sub: string }[]; texto: string }[] }
  | { t: "vf"; itens: { texto: string; v: boolean; porque: string }[] }
  | { t: "escada"; degraus: { titulo: string; sub: string; texto: string }[] }
  | { t: "abrir"; cartas: { tag: string; titulo: string; texto: string }[] }
  | { t: "cena"; titulo?: string; altura?: number; elementos: CenaEl[]; passos: CenaPasso[] };

// Cena: desenho montado por peças (coordenadas num quadro de 680 de largura) que muda a cada passo.
export type CenaCor = "ok" | "bad" | "accent" | "blue" | "warn" | "dim";
export interface CenaEl {
  id: string;
  tipo: "caixa" | "gota" | "cupula" | "seta" | "rotulo";
  x: number;
  y: number;
  w?: number; // caixa e cupula: largura; seta: x final
  h?: number; // caixa: altura; cupula: altura do arco; seta: y final
  texto?: string;
  sub?: string;
  cor?: CenaCor;
  fixo?: boolean; // sempre visível; os outros só aparecem nos passos que os mostram
}
export type CenaAnim = "cai" | "bate" | "pulsa" | "treme";
export interface CenaPasso {
  texto: string; // pode ter <b>
  mostra?: string[];
  anima?: Record<string, CenaAnim>;
  move?: Record<string, [number, number]>; // deslocamento [dx, dy] do elemento neste passo
  q?: Record<string, number>; // queda da gota (px) neste passo: onde ela bate ou some
}

export interface Secao {
  titulo: string;
  etapa?: Etapa;
  blocos: Bloco[];
}
export interface Aula {
  id: string;
  topico_id: string;
  numero: number;
  titulo: string;
  status: "pronta" | "a_montar";
  fonte?: string;
  resumo?: string[];
  secoes?: Secao[];
  questoes?: string[];
}
export interface Caderno {
  materia_id: string;
  titulo: string;
  subtitulo: string;
  fontes: string[];
  banca?: {
    titulo: string;
    fonte: string;
    stats: { valor: string; rotulo: string }[];
    ranking: [string, number][];
    notas: { titulo: string; html: string }[];
  };
  aulas: Aula[];
  glossario: [string, string][];
}
