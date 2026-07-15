import { createClient } from "@/lib/supabase/server";
import type { BlogCategory, FaqItem } from "@/lib/blog";

export interface AdminPost {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: BlogCategory;
  content: string;
  faq: FaqItem[] | null;
  published: boolean;
  date: string;
  updated_at: string | null;
  created_at: string;
}

export interface PostInput {
  slug: string;
  title: string;
  subtitle: string;
  category: BlogCategory;
  content: string;
  published: boolean;
}

export async function getAllPostsAdmin(): Promise<AdminPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as AdminPost[];
}

export async function getPostByIdAdmin(id: string): Promise<AdminPost | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as AdminPost | null;
}

export async function createPost(input: PostInput): Promise<AdminPost> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .insert({
      slug: input.slug,
      title: input.title,
      subtitle: input.subtitle,
      category: input.category,
      content: input.content,
      published: input.published,
      date: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data as AdminPost;
}

export async function updatePost(
  id: string,
  input: PostInput,
): Promise<AdminPost> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .update({
      slug: input.slug,
      title: input.title,
      subtitle: input.subtitle,
      category: input.category,
      content: input.content,
      published: input.published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as AdminPost;
}

export async function deletePost(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw error;
}
