import { createClient } from "@/lib/supabase/server";
import type { LinkTipo } from "@/lib/link-tipo";

export interface LinkItem {
  id: string;
  grupo_id: string;
  titulo: string;
  url: string;
  tipo: LinkTipo;
  posicao: number;
  created_at: string;
}

export interface LinkGrupo {
  id: string;
  titulo: string;
  posicao: number;
  created_at: string;
  links: LinkItem[];
}

export async function getAllLinkGrupos(): Promise<LinkGrupo[]> {
  const supabase = await createClient();
  const [{ data: grupos, error: gruposError }, { data: links, error: linksError }] =
    await Promise.all([
      supabase.from("link_grupos").select("*").order("posicao", { ascending: true }),
      supabase.from("links").select("*").order("posicao", { ascending: true }),
    ]);

  if (gruposError) throw gruposError;
  if (linksError) throw linksError;

  return (grupos ?? []).map((grupo) => ({
    ...grupo,
    links: (links ?? []).filter((link) => link.grupo_id === grupo.id),
  })) as LinkGrupo[];
}

export async function createLinkGrupo(titulo: string): Promise<LinkGrupo> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("link_grupos")
    .select("*", { count: "exact", head: true });

  const { data, error } = await supabase
    .from("link_grupos")
    .insert({ titulo, posicao: count ?? 0 })
    .select()
    .single();

  if (error) throw error;
  return { ...data, links: [] } as LinkGrupo;
}

export async function updateLinkGrupoTitulo(
  id: string,
  titulo: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("link_grupos")
    .update({ titulo })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteLinkGrupo(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("link_grupos").delete().eq("id", id);
  if (error) throw error;
}

export async function createLink(input: {
  grupo_id: string;
  titulo: string;
  url: string;
  tipo: LinkTipo;
}): Promise<LinkItem> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("links")
    .select("*", { count: "exact", head: true })
    .eq("grupo_id", input.grupo_id);

  const { data, error } = await supabase
    .from("links")
    .insert({ ...input, posicao: count ?? 0 })
    .select()
    .single();

  if (error) throw error;
  return data as LinkItem;
}

export async function updateLinkTitulo(id: string, titulo: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("links").update({ titulo }).eq("id", id);
  if (error) throw error;
}

export async function deleteLink(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("links").delete().eq("id", id);
  if (error) throw error;
}
