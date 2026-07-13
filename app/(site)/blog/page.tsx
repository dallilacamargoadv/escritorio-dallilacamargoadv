import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { BlogPostCard, categoryHref } from "@/components/blog/BlogPostCard";
import { BLOG_CATEGORIES, BLOG_PAGE_SIZE, getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Conteúdo técnico sobre Direito Digital, contratos, propriedade intelectual e proteção de contas, produzido para orientar criadores de conteúdo, profissionais e negócios digitais.",
  alternates: { canonical: "/blog" },
};

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, Number(pageParam) || 1);

  const posts = getAllPosts();
  const totalPages = Math.max(1, Math.ceil(posts.length / BLOG_PAGE_SIZE));
  const pagePosts = posts.slice(
    (currentPage - 1) * BLOG_PAGE_SIZE,
    currentPage * BLOG_PAGE_SIZE,
  );

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <Reveal>
        <h1 className="max-w-2xl text-4xl sm:text-5xl">
          <em className="italic text-gold">Conteúdo técnico</em> sobre
          Direito Digital, contratos e propriedade intelectual.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-dim">
          Conteúdo técnico sobre Direito Digital, contratos, propriedade
          intelectual e proteção de contas, produzido para orientar
          criadores de conteúdo, profissionais e negócios digitais.
        </p>

        <nav aria-label="Categorias" className="mt-10 flex flex-wrap gap-3">
          {BLOG_CATEGORIES.map((category) => (
            <Link
              key={category}
              href={categoryHref(category)}
              className="border border-hairline px-4 py-2 text-xs text-ink-dim transition-colors duration-150 hover:border-gold hover:text-gold"
            >
              {category}
            </Link>
          ))}
        </nav>

        {pagePosts.length === 0 ? (
          <div className="mt-16 border border-hairline p-10 text-center">
            <p className="text-sm leading-relaxed text-ink-dim">
              Ainda não há artigos publicados. O conteúdo técnico deste blog
              está em produção e será publicado em breve.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pagePosts.map((post) => (
                <BlogPostCard key={post.slug} post={post} />
              ))}
            </div>

            {totalPages > 1 && (
              <nav
                aria-label="Paginação"
                className="mt-12 flex justify-center gap-3"
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNumber) => (
                    <Link
                      key={pageNumber}
                      href={pageNumber === 1 ? "/blog" : `/blog?page=${pageNumber}`}
                      className={`border px-4 py-2 text-sm transition-colors duration-150 ${
                        pageNumber === currentPage
                          ? "border-gold text-gold"
                          : "border-hairline text-ink-dim hover:border-gold/50"
                      }`}
                    >
                      {pageNumber}
                    </Link>
                  ),
                )}
              </nav>
            )}
          </>
        )}
      </Reveal>
    </section>
  );
}
