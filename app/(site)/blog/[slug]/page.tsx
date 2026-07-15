import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Reveal } from "@/components/ui/Reveal";
import { EnclosureNested } from "@/components/ui/EnclosureNested";
import { BlogPostCard, categoryHref } from "@/components/blog/BlogPostCard";
import { JsonLd } from "@/components/JsonLd";
import { getAllPosts, getPostBySlug, getPostsByCategory } from "@/lib/blog";
import { formatDate } from "@/lib/format";
import {
  BASE_URL,
  getArticleSchema,
  getBreadcrumbSchema,
  getFaqSchema,
  jsonLdGraph,
} from "@/lib/schema";

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.subtitle,
    alternates: { canonical: `/blog/${slug}` },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const pageUrl = `${BASE_URL}/blog/${slug}`;
  const related = (await getPostsByCategory(post.category))
    .filter((p) => p.slug !== slug)
    .slice(0, 3);

  return (
    <article className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-28">
      <JsonLd
        data={jsonLdGraph([
          getArticleSchema({
            headline: post.title,
            description: post.subtitle,
            url: pageUrl,
            datePublished: post.date,
            dateModified: post.updatedAt,
            category: post.category,
          }),
          getBreadcrumbSchema([
            { name: "Home", url: BASE_URL },
            { name: "Blog", url: `${BASE_URL}/blog` },
            { name: post.title, url: pageUrl },
          ]),
          ...(post.faq && post.faq.length > 0
            ? [getFaqSchema(post.faq)]
            : []),
        ])}
      />

      <Reveal>
        <Link
          href={categoryHref(post.category)}
          className="font-eyebrow text-[10px] text-gold"
        >
          {post.category}
        </Link>
        <h1 className="mt-3 text-4xl sm:text-5xl">{post.title}</h1>
        <p className="mt-4 text-base leading-relaxed text-ink-dim">
          {post.subtitle}
        </p>
        <div className="mt-6 flex items-center gap-3 font-mono text-xs text-ink-dim tabular-nums">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <Link href="/sobre" className="hover:text-gold">
            Dallila Camargo
          </Link>
          <span aria-hidden="true">·</span>
          <span>{post.readingTime}</span>
        </div>

        <div className="prose-article mt-12">
          <MDXRemote source={post.content} />
        </div>

        <EnclosureNested className="mt-16">
          <p className="text-sm leading-relaxed text-ink-dim">
            Este conteúdo tem caráter informativo e não substitui a consulta
            jurídica especializada. Dallila Camargo I Advogada atua em
            Direito Digital, incluindo contratos, propriedade intelectual e
            recuperação de contas comprometidas. Para análise de caso
            concreto,{" "}
            <Link href="/contato" className="text-gold underline">
              entre em contato
            </Link>
            .
          </p>
        </EnclosureNested>

        {related.length > 0 && (
          <div className="mt-16">
            <span className="font-eyebrow text-[10px] text-gold">
              Leitura relacionada
            </span>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {related.map((relatedPost) => (
                <BlogPostCard key={relatedPost.slug} post={relatedPost} />
              ))}
            </div>
          </div>
        )}
      </Reveal>
    </article>
  );
}
