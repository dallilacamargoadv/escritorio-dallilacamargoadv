import { createClient } from "@/lib/supabase/server";
import { getAnonClient } from "@/lib/supabase/anon";

export interface PageSeo {
  slug: string;
  meta_title: string;
  meta_description: string;
  updated_at: string;
}

export async function getAllPageSeoAdmin(): Promise<PageSeo[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("page_seo").select("*").order("slug");
  if (error) throw error;
  return data as PageSeo[];
}

export async function updatePageSeo(
  slug: string,
  input: { meta_title: string; meta_description: string },
): Promise<PageSeo> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("page_seo")
    .update({
      meta_title: input.meta_title,
      meta_description: input.meta_description,
      updated_at: new Date().toISOString(),
    })
    .eq("slug", slug)
    .select()
    .single();

  if (error) throw error;
  return data as PageSeo;
}

export async function getPageSeo(slug: string): Promise<PageSeo | null> {
  try {
    const supabase = getAnonClient();
    const { data, error } = await supabase
      .from("page_seo")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw error;
    return data as PageSeo | null;
  } catch (err) {
    console.error("[page_seo] Falha ao carregar SEO da página:", err);
    return null;
  }
}
