import Link from "next/link";
import { CATEGORY_SLUGS, type BlogPostMeta } from "@/lib/blog";
import { formatDate } from "@/lib/format";

export function BlogPostCard({ post }: { post: BlogPostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="block border border-hairline p-6 transition-colors duration-150 hover:border-gold"
    >
      <span className="font-eyebrow text-[10px] text-gold">
        {post.category}
      </span>
      <h3 className="mt-3 text-lg">{post.title}</h3>
      <div className="mt-4 flex items-center gap-3 font-mono text-xs text-ink-dim tabular-nums">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span aria-hidden="true">·</span>
        <span>{post.readingTime}</span>
      </div>
    </Link>
  );
}

export function categoryHref(category: BlogPostMeta["category"]) {
  return `/blog/categoria/${CATEGORY_SLUGS[category]}`;
}
