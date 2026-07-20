"use client";

import { useState } from "react";
import { PAGE_SEO_ENTRIES } from "@/lib/site-data";
import type { PageSeo } from "@/lib/db-page-seo";

function PageSeoCard({
  slug,
  label,
  path,
  page,
}: {
  slug: string;
  label: string;
  path: string;
  page: PageSeo | undefined;
}) {
  const [metaTitle, setMetaTitle] = useState(page?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(page?.meta_description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!metaTitle.trim() || !metaDescription.trim()) {
      setError("Meta título e meta descrição são obrigatórios.");
      return;
    }
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/page-seo/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meta_title: metaTitle,
          meta_description: metaDescription,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar");
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <details className="border border-hairline-strong bg-surface">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm text-ink marker:content-none [&::-webkit-details-marker]:hidden">
        <span>{label}</span>
        <span className="font-mono text-[10px] text-ink-dim">{path}</span>
      </summary>
      <div className="space-y-4 border-t border-hairline p-4">
        <div>
          <label className="font-eyebrow text-[10px] text-ink-dim">
            Meta título
          </label>
          <input
            type="text"
            value={metaTitle}
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
            onChange={(e) => setMetaDescription(e.target.value)}
            rows={3}
            className="mt-2 w-full border border-hairline-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
          />
          <p className="mt-1 text-right font-mono text-[10px] text-ink-dim">
            {metaDescription.length}/155
          </p>
        </div>

        {error && (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="border border-gold bg-gold px-5 py-2 text-sm text-bg transition-all duration-150 hover:bg-transparent hover:text-gold disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
          {saved && (
            <span className="font-mono text-[10px] text-gold">salvo</span>
          )}
        </div>
      </div>
    </details>
  );
}

export function PageSeoList({ initialPages }: { initialPages: PageSeo[] }) {
  const pageBySlug = new Map(initialPages.map((page) => [page.slug, page]));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="border-b border-hairline pb-6">
        <h1 className="text-lg italic text-ink">SEO por página</h1>
        <p className="mt-2 text-sm text-ink-dim">
          Título e descrição que aparecem no resultado de busca do Google
          para cada página do site.
        </p>
      </div>

      <div className="mt-8 space-y-3">
        {PAGE_SEO_ENTRIES.map((entry) => (
          <PageSeoCard
            key={entry.slug}
            slug={entry.slug}
            label={entry.label}
            path={entry.path}
            page={pageBySlug.get(entry.slug)}
          />
        ))}
      </div>
    </div>
  );
}
