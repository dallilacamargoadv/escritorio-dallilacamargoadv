import { createClient } from "@/lib/supabase/server";
import { createConteudoEditorial } from "@/lib/db-conteudo-editorial";
import type {
  ContentCanal,
  ContentFormato,
  ContentPilar,
} from "@/lib/db-conteudo-editorial";
import type { Ideia, IdeiaFormato, IdeiaStatus } from "@/lib/ideias-labels";

export interface IdeiaInput {
  titulo: string;
  formato: IdeiaFormato;
  area: string | null;
  gancho: string | null;
  notas: string | null;
}

export async function getIdeias(): Promise<Ideia[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ideias_conteudo")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Ideia[];
}

export async function createIdeia(input: IdeiaInput): Promise<Ideia> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ideias_conteudo")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as Ideia;
}

export async function updateIdeia(
  id: string,
  patch: Partial<IdeiaInput> & { status?: IdeiaStatus },
): Promise<Ideia> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ideias_conteudo")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Ideia;
}

export async function deleteIdeia(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("ideias_conteudo").delete().eq("id", id);
  if (error) throw error;
}

const FORMATO_PARA_CALENDARIO: Record<IdeiaFormato, ContentFormato> = {
  video: "reels",
  carrossel: "carrossel",
  stories: "stories",
  post: "post",
  artigo: "artigo",
};

/** Cria o item no Calendário Editorial a partir da ideia e liga os dois. */
export async function enviarIdeiaAoCalendario(
  id: string,
  { data, pilar }: { data: string; pilar: ContentPilar },
): Promise<Ideia> {
  const supabase = await createClient();
  const { data: ideia, error } = await supabase
    .from("ideias_conteudo")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  const atual = ideia as Ideia;

  const canal: ContentCanal = atual.formato === "artigo" ? "blog" : "instagram";
  const observacoes =
    [atual.gancho ? `Gancho: ${atual.gancho}` : "", atual.notas ?? ""]
      .filter(Boolean)
      .join("\n") || null;

  const conteudo = await createConteudoEditorial({
    data,
    canal,
    formato: FORMATO_PARA_CALENDARIO[atual.formato],
    pilar,
    tema: atual.titulo,
    utm_content: null,
    observacoes,
  });

  const { data: atualizada, error: updError } = await supabase
    .from("ideias_conteudo")
    .update({
      conteudo_editorial_id: conteudo.id,
      status: atual.status === "publicada" ? "publicada" : "pronta",
    })
    .eq("id", id)
    .select()
    .single();
  if (updError) throw updError;
  return atualizada as Ideia;
}
