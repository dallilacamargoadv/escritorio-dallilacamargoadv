import { createClient } from "@/lib/supabase/server";
import type { DespesaCategoria, DespesaSubcategoria } from "@/lib/db-despesa-categorias";

export async function getAllDespesaCategoriasPessoal(): Promise<DespesaCategoria[]> {
  const supabase = await createClient();
  const [{ data: categorias, error: categoriasError }, { data: subcategorias, error: subError }] =
    await Promise.all([
      supabase.from("despesa_categorias_pessoal").select("*").order("posicao", { ascending: true }),
      supabase.from("despesa_subcategorias_pessoal").select("*").order("posicao", { ascending: true }),
    ]);

  if (categoriasError) throw categoriasError;
  if (subError) throw subError;

  return (categorias ?? []).map((categoria) => ({
    ...categoria,
    subcategorias: (subcategorias ?? []).filter(
      (sub) => sub.categoria_id === categoria.id,
    ) as DespesaSubcategoria[],
  })) as DespesaCategoria[];
}

export async function createDespesaCategoriaPessoal(nome: string): Promise<DespesaCategoria> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("despesa_categorias_pessoal")
    .select("*", { count: "exact", head: true });

  const { data, error } = await supabase
    .from("despesa_categorias_pessoal")
    .insert({ nome, posicao: count ?? 0 })
    .select()
    .single();

  if (error) throw error;
  return { ...data, subcategorias: [] } as DespesaCategoria;
}

export async function updateDespesaCategoriaPessoalNome(id: string, nome: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("despesa_categorias_pessoal")
    .update({ nome })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteDespesaCategoriaPessoal(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("despesa_categorias_pessoal").delete().eq("id", id);
  if (error) throw error;
}

export async function createDespesaSubcategoriaPessoal(
  categoriaId: string,
  nome: string,
): Promise<DespesaSubcategoria> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("despesa_subcategorias_pessoal")
    .select("*", { count: "exact", head: true })
    .eq("categoria_id", categoriaId);

  const { data, error } = await supabase
    .from("despesa_subcategorias_pessoal")
    .insert({ categoria_id: categoriaId, nome, posicao: count ?? 0 })
    .select()
    .single();

  if (error) throw error;
  return data as DespesaSubcategoria;
}

export async function deleteDespesaSubcategoriaPessoal(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("despesa_subcategorias_pessoal").delete().eq("id", id);
  if (error) throw error;
}
