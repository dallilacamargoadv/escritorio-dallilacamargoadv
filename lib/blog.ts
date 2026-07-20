import readingTime from "reading-time";
import { getAnonClient } from "@/lib/supabase/anon";

export const BLOG_CATEGORIES = [
  "Conta Hackeada e Golpes Digitais",
  "Contratos",
  "Propriedade Intelectual",
  "Atualizações regulatórias",
  "Análises técnicas",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const CATEGORY_SLUGS: Record<BlogCategory, string> = Object.fromEntries(
  BLOG_CATEGORIES.map((category) => [category, slugify(category)]),
) as Record<BlogCategory, string>;

export function getCategoryBySlug(slug: string): BlogCategory | undefined {
  return BLOG_CATEGORIES.find((category) => CATEGORY_SLUGS[category] === slug);
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface BlogPostMeta {
  slug: string;
  title: string;
  subtitle: string;
  category: BlogCategory;
  date: string;
  updatedAt?: string;
  readingTime: string;
  faq?: FaqItem[];
  metaTitle: string | null;
  metaDescription: string | null;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

function formatReadingTime(minutes: number): string {
  return `${Math.max(1, Math.ceil(minutes))} min de leitura`;
}

interface PostRow {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  content: string;
  date: string;
  updated_at: string | null;
  faq: FaqItem[] | null;
  meta_title: string | null;
  meta_description: string | null;
}

function toMeta(row: PostRow): BlogPostMeta {
  return {
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    category: row.category as BlogCategory,
    date: row.date,
    updatedAt: row.updated_at ?? undefined,
    readingTime: formatReadingTime(readingTime(row.content).minutes),
    faq: row.faq ?? undefined,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
  };
}

export async function getAllPosts(): Promise<BlogPostMeta[]> {
  try {
    const supabase = getAnonClient();
    const { data, error } = await supabase
      .from("posts")
      .select(
        "slug, title, subtitle, category, content, date, updated_at, faq, meta_title, meta_description",
      )
      .eq("published", true)
      .order("date", { ascending: false });

    if (error) throw error;
    return (data as PostRow[]).map(toMeta);
  } catch (err) {
    // Não deixar o Supabase indisponível (ex.: variáveis de ambiente
    // ausentes no momento do build) derrubar páginas que só precisam da
    // lista de posts para renderizar o restante do conteúdo.
    console.error("[blog] Falha ao carregar posts:", err);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const supabase = getAnonClient();
    const { data, error } = await supabase
      .from("posts")
      .select(
        "slug, title, subtitle, category, content, date, updated_at, faq, meta_title, meta_description",
      )
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const row = data as PostRow;
    return { ...toMeta(row), content: row.content };
  } catch (err) {
    console.error("[blog] Falha ao carregar post:", err);
    return null;
  }
}

export const BLOG_PAGE_SIZE = 9;

export async function getPostsByCategory(
  category: BlogCategory,
): Promise<BlogPostMeta[]> {
  const posts = await getAllPosts();
  return posts.filter((post) => post.category === category);
}
