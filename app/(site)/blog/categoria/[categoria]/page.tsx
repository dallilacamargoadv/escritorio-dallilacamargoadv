import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import {
  BLOG_CATEGORIES,
  CATEGORY_SLUGS,
  getCategoryBySlug,
  getPostsByCategory,
} from "@/lib/blog";

export function generateStaticParams() {
  return BLOG_CATEGORIES.map((category) => ({
    categoria: CATEGORY_SLUGS[category],
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string }>;
}): Promise<Metadata> {
  const { categoria } = await params;
  const category = getCategoryBySlug(categoria);
  if (!category) return {};

  return {
    title: category,
    description: `Artigos técnicos sobre ${category.toLowerCase()} publicados no blog da Dallila Camargo I Advogada.`,
    alternates: { canonical: `/blog/categoria/${categoria}` },
  };
}

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;
  const category = getCategoryBySlug(categoria);
  if (!category) notFound();

  const posts = getPostsByCategory(category);

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <Reveal>
        <span className="font-eyebrow text-[10px] text-gold">Categoria</span>
        <h1 className="mt-3 max-w-2xl text-4xl sm:text-5xl">{category}</h1>

        {posts.length === 0 ? (
          <div className="mt-16 border border-hairline p-10 text-center">
            <p className="text-sm leading-relaxed text-ink-dim">
              Ainda não há artigos publicados nesta categoria.
            </p>
          </div>
        ) : (
          <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </Reveal>
    </section>
  );
}
