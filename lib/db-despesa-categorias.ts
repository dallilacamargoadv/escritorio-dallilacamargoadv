import { createClient } from "@/lib/supabase/server";

export interface DespesaSubcategoria {
  id: string;
  categoria_id: string;
  nome: string;
  posicao: number;
  created_at: string;
}

export interface DespesaCategoria {
  id: string;
  nome: string;
  posicao: number;
  created_at: string;
  subcategorias: DespesaSubcategoria[];
}

export async function getAllDespesaCategorias(): Promise<DespesaCategoria[]> {
  const supabase = await createClient();
  const [{ data: categorias, error: categoriasError }, { data: subcategorias, error: subError }] =
    await Promise.all([
      supabase.from("despesa_categorias").select("*").order("posicao", { ascending: true }),
      supabase.from("despesa_subcategorias").select("*").order("posicao", { ascending: true }),
    ]);

  if (categoriasError) throw categoriasError;
  if (subError) throw subError;

  return (categorias ?? []).map((categoria) => ({
    ...categoria,
    subcategorias: (subcategorias ?? []).filter((sub) => sub.categoria_id === categoria.id),
  })) as DespesaCategoria[];
}

export async function createDespesaCategoria(nome: string): Promise<DespesaCategoria> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("despesa_categorias")
    .select("*", { count: "exact", head: true });

  const { data, error } = await supabase
    .from("despesa_categorias")
    .insert({ nome, posicao: count ?? 0 })
    .select()
    .single();

  if (error) throw error;
  return { ...data, subcategorias: [] } as DespesaCategoria;
}

export async function updateDespesaCategoriaNome(id: string, nome: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("despesa_categorias").update({ nome }).eq("id", id);
  if (error) throw error;
}

export async function deleteDespesaCategoria(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("despesa_categorias").delete().eq("id", id);
  if (error) throw error;
}

export async function createDespesaSubcategoria(
  categoriaId: string,
  nome: string,
): Promise<DespesaSubcategoria> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("despesa_subcategorias")
    .select("*", { count: "exact", head: true })
    .eq("categoria_id", categoriaId);

  const { data, error } = await supabase
    .from("despesa_subcategorias")
    .insert({ categoria_id: categoriaId, nome, posicao: count ?? 0 })
    .select()
    .single();

  if (error) throw error;
  return data as DespesaSubcategoria;
}

export async function deleteDespesaSubcategoria(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("despesa_subcategorias").delete().eq("id", id);
  if (error) throw error;
}
