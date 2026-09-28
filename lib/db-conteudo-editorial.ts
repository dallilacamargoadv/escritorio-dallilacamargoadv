import { createClient } from "@/lib/supabase/server";

export type ContentCanal = "instagram" | "tiktok" | "linkedin" | "blog" | "whatsapp" | "outro";
export type ContentFormato = "stories" | "post" | "carrossel" | "reels" | "artigo";
export type ContentPilar = "topo" | "meio" | "fundo";

export interface ConteudoEditorial {
  id: string;
  data: string;
  canal: ContentCanal;
  formato: ContentFormato;
  pilar: ContentPilar;
  tema: string;
  publicado: boolean;
  atividade_id: string | null;
  alcance: number | null;
  interacoes: number | null;
  utm_content: string | null;
  observacoes: string | null;
  instagram_media_id: string | null;
  permalink: string | null;
  sincronizado_em: string | null;
  created_at: string;
}

export interface ConteudoEditorialInput {
  data: string;
  canal: ContentCanal;
  formato: ContentFormato;
  pilar: ContentPilar;
  tema: string;
  utm_content: string | null;
  observacoes: string | null;
}

export async function getConteudoEditorialByMes(
  ano: number,
  mes: number,
): Promise<ConteudoEditorial[]> {
  const supabase = await createClient();
  const inicio = `${ano}-${String(mes).padStart(2, "0")}-01`;
  const fimDate = new Date(ano, mes, 0).getDate();
  const fim = `${ano}-${String(mes).padStart(2, "0")}-${String(fimDate).padStart(2, "0")}`;

  const { data, error } = await supabase
    .from("conteudo_editorial")
    .select("*")
    .gte("data", inicio)
    .lte("data", fim)
    .order("data", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ConteudoEditorial[];
}

/** Posts reais sincronizados do Instagram (via Composio) — usado na aba
 * "Feed do Instagram", separada do calendário de conteúdo planejado. */
export async function getConteudoInstagramSincronizado(
  limite: number = 30,
): Promise<ConteudoEditorial[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conteudo_editorial")
    .select("*")
    .eq("canal", "instagram")
    .not("instagram_media_id", "is", null)
    .order("data", { ascending: false })
    .limit(limite);

  if (error) throw error;
  return (data ?? []) as ConteudoEditorial[];
}

export async function getConteudoEditorialRecente(dias: number): Promise<ConteudoEditorial[]> {
  const supabase = await createClient();
  const desde = new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("conteudo_editorial")
    .select("*")
    .gte("data", desde)
    .order("data", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ConteudoEditorial[];
}

export async function createConteudoEditorial(
  input: ConteudoEditorialInput,
): Promise<ConteudoEditorial> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conteudo_editorial")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as ConteudoEditorial;
}

export async function updateConteudoEditorial(
  id: string,
  input: Partial<ConteudoEditorialInput>,
): Promise<ConteudoEditorial> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conteudo_editorial")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as ConteudoEditorial;
}

export async function deleteConteudoEditorial(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("conteudo_editorial").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Marca (ou desmarca) um conteúdo como publicado. Ao marcar, cria uma atividade
 * (tipo "compromisso") linkada, pra aparecer em Atividades sem digitar duas vezes;
 * ao desmarcar, apenas desvincula (não apaga a atividade, pra não perder histórico).
 */
export async function setConteudoPublicado(
  id: string,
  publicado: boolean,
): Promise<ConteudoEditorial> {
  const supabase = await createClient();

  const { data: atual, error: fetchError } = await supabase
    .from("conteudo_editorial")
    .select("*")
    .eq("id", id)
    .single();
  if (fetchError) throw fetchError;
  const conteudo = atual as ConteudoEditorial;

  let atividadeId = conteudo.atividade_id;

  if (publicado && !atividadeId) {
    const { data: atividade, error: atividadeError } = await supabase
      .from("atividades")
      .insert({
        tipo: "compromisso",
        titulo: `Publicar (${conteudo.canal}/${conteudo.formato}): ${conteudo.tema}`,
        data: conteudo.data,
        hora: null,
        caso_frente_id: null,
        caso_id: null,
        cliente_id: null,
        status: "concluido",
        visivel_cliente: false,
      })
      .select()
      .single();
    if (atividadeError) throw atividadeError;
    atividadeId = atividade.id as string;
  } else if (!publicado && atividadeId) {
    await supabase
      .from("atividades")
      .update({ status: "cancelado" })
      .eq("id", atividadeId);
  } else if (publicado && atividadeId) {
    await supabase
      .from("atividades")
      .update({ status: "concluido", concluido_em: new Date().toISOString() })
      .eq("id", atividadeId);
  }

  const { data, error } = await supabase
    .from("conteudo_editorial")
    .update({ publicado, atividade_id: atividadeId })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as ConteudoEditorial;
}

export async function updateMetricas(
  id: string,
  alcance: number | null,
  interacoes: number | null,
): Promise<ConteudoEditorial> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conteudo_editorial")
    .update({ alcance, interacoes })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as ConteudoEditorial;
}
