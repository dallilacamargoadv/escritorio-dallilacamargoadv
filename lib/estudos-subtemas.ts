// Subtemas das questões: mapa questão → subtema e o texto de revisão de cada subtema. Arquivo puro (Server e Client).
import subtemasJson from "@/content/estudos/subtemas.json";

export interface Subtema {
  nome: string;
  tema: string;
  /** regra do subtema, com base legal, mostrada depois de responder (revisão ativa) */
  revisao: string;
}

const DADOS = subtemasJson as { subtemas: Record<string, Subtema>; questoes: Record<string, string> };

export const SUBTEMAS: Record<string, Subtema> = DADOS.subtemas;
export const SUBTEMA_DA_QUESTAO: Record<string, string> = DADOS.questoes;
