"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BLOG_CATEGORIES, type BlogCategory } from "@/lib/blog";
import type { AdminPost } from "@/lib/db-blog-admin";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

export function PostForm({ post }: { post?: AdminPost }) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? "");
  const [subtitle, setSubtitle] = useState(post?.subtitle ?? "");
  const [category, setCategory] = useState<BlogCategory>(
    post?.category ?? BLOG_CATEGORIES[0],
  );
  const [content, setContent] = useState(post?.content ?? "");
  const [published, setPublished] = useState(post?.published ?? false);
  const [metaTitle, setMetaTitle] = useState(post?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(post?.meta_description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!title.trim()) {
      setError("O título é obrigatório.");
      return;
    }

    setSaving(true);
    setError("");

    const url = post ? `/api/admin/posts/${post.id}` : "/api/admin/posts";
    const method = post ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          category,
          content,
          published,
          meta_title: metaTitle,
          meta_description: metaDescription,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar");

      router.push("/admin/blog");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="border-b border-hairline pb-6">
        <h1 className="text-lg italic text-ink">
          {post ? "Editar post" : "Novo post"}
        </h1>
      </div>

      <div className="mt-8 space-y-5">
        <div>
          <label className="font-eyebrow text-[10px] text-ink-dim">
            Título
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
          />
        </div>

        <div>
          <label className="font-eyebrow text-[10px] text-ink-dim">
            Subtítulo
          </label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
          />
        </div>

        <div>
          <label className="font-eyebrow text-[10px] text-ink-dim">
            Categoria
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as BlogCategory)}
            className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink"
          >
            {BLOG_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-eyebrow text-[10px] text-ink-dim">
            Conteúdo
          </label>
          <div className="mt-2">
            <RichTextEditor value={content} onChange={setContent} />
          </div>
        </div>

        <details className="border border-hairline-strong bg-surface">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm text-ink marker:content-none [&::-webkit-details-marker]:hidden">
            SEO (opcional — em branco usa o título/subtítulo do post)
          </summary>
          <div className="space-y-4 border-t border-hairline p-4">
            <div>
              <label className="font-eyebrow text-[10px] text-ink-dim">
                Meta título
              </label>
              <input
                type="text"
                value={metaTitle}
                placeholder={title}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
              />
              <p className="mt-1 text-right font-mono text-[10px] text-ink-dim">
                {metaTitle.length}/60
              </p>
            </div>
            <div>
              <label className="font-eyebrow text-[10px] text-ink-dim">
                Meta descrição
              </label>
              <textarea
                value={metaDescription}
                placeholder={subtitle}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={3}
                className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
              />
              <p className="mt-1 text-right font-mono text-[10px] text-ink-dim">
                {metaDescription.length}/155
              </p>
            </div>
          </div>
        </details>

        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="h-4 w-4 accent-gold"
          />
          Publicado (visível no site)
        </label>

        {error && (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="border border-gold bg-gold px-5 py-2.5 text-sm text-bg transition-all duration-150 hover:bg-transparent hover:text-gold disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/blog")}
            className="border border-hairline-strong px-5 py-2.5 text-sm text-ink-dim transition-colors duration-150 hover:border-gold hover:text-gold"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
