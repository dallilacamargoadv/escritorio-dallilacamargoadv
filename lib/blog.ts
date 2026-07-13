import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export const BLOG_CATEGORIES = [
  "Conta Hackeada e Golpes Digitais",
  "Contratos",
  "Propriedade Intelectual",
  "Atualizações regulatórias",
  "Análises técnicas",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

function slugify(value: string): string {
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
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

function listMdxFiles(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs.readdirSync(BLOG_DIR).filter((file) => file.endsWith(".mdx"));
}

function formatReadingTime(minutes: number): string {
  return `${Math.max(1, Math.ceil(minutes))} min de leitura`;
}

function toMeta(file: string, raw: string): BlogPostMeta {
  const { data, content } = matter(raw);
  return {
    slug: file.replace(/\.mdx$/, ""),
    title: data.title,
    subtitle: data.subtitle,
    category: data.category,
    date: data.date,
    updatedAt: data.updatedAt,
    readingTime: formatReadingTime(readingTime(content).minutes),
    faq: data.faq,
  };
}

export function getAllPosts(): BlogPostMeta[] {
  return listMdxFiles()
    .map((file) => toMeta(file, fs.readFileSync(path.join(BLOG_DIR, file), "utf-8")))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { content } = matter(raw);
  const meta = toMeta(`${slug}.mdx`, raw);

  return { ...meta, content };
}

export const BLOG_PAGE_SIZE = 9;

export function getPostsByCategory(category: BlogCategory): BlogPostMeta[] {
  return getAllPosts().filter((post) => post.category === category);
}
