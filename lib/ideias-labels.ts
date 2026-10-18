// Tipos e rótulos do banco de ideias e do planejador de stories. Arquivo sem
// imports de servidor, para poder ser usado em componentes de cliente.

export type IdeiaFormato = "video" | "carrossel" | "stories" | "post" | "artigo";
export type IdeiaStatus = "ideia" | "em_producao" | "pronta" | "publicada";

export interface Ideia {
  id: string;
  created_at: string;
  titulo: string;
  formato: IdeiaFormato;
  area: string | null;
  gancho: string | null;
  notas: string | null;
  status: IdeiaStatus;
  conteudo_editorial_id: string | null;
}

export const IDEIA_FORMATO_LABELS: Record<IdeiaFormato, string> = {
  video: "Vídeo",
  carrossel: "Carrossel",
  stories: "Stories",
  post: "Post",
  artigo: "Artigo",
};

export const IDEIA_STATUS_LABELS: Record<IdeiaStatus, string> = {
  ideia: "Ideias",
  em_producao: "Em produção",
  pronta: "Pronto para postar",
  publicada: "Publicadas",
};

export const IDEIA_AREA_LABELS: Record<string, string> = {
  conta_hackeada: "Conta hackeada",
  marketplaces: "Marketplaces",
  alvara_mirim: "Alvará mirim",
  registro_marca: "Registro de marca",
  contratos: "Contratos",
  geral: "Geral",
};

export type StoryTelaTipo =
  | "texto"
  | "foto"
  | "video"
  | "enquete"
  | "caixinha"
  | "link";

export interface StoryTela {
  tipo: StoryTelaTipo;
  texto: string;
}

export interface StoriesPlano {
  id: string;
  data: string;
  tema: string;
  telas: StoryTela[];
  conteudo_editorial_id: string | null;
}

export const STORY_TELA_LABELS: Record<StoryTelaTipo, string> = {
  texto: "Texto",
  foto: "Foto",
  video: "Vídeo",
  enquete: "Enquete",
  caixinha: "Caixinha de pergunta",
  link: "Link",
};
