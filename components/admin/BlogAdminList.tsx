"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import type { AdminPost } from "@/lib/db-blog-admin";
import { formatDate } from "@/lib/format";

export function BlogAdminList({ initialPosts }: { initialPosts: AdminPost[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!window.confirm("Excluir este post? Essa ação não pode ser desfeita.")) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between border-b border-hairline pb-6">
        <div>
          <h1 className="text-lg italic text-ink">Blog</h1>
          <p className="font-mono text-xs text-ink-dim">
            {posts.length} posts no total
          </p>
        </div>
        <Link
          href="/admin/blog/novo"
          className="border border-gold bg-gold px-4 py-2 text-sm text-bg transition-all duration-150 hover:bg-transparent hover:text-gold"
        >
          Novo post
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto border border-hairline">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-hairline font-eyebrow text-[10px] text-ink-dim">
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-hairline">
                <td className="px-4 py-3 text-ink">{post.title}</td>
                <td className="px-4 py-3 text-ink-dim">{post.category}</td>
                <td className="px-4 py-3">
                  <span
                    className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${
                      post.published
                        ? "border-success text-success"
                        : "border-hairline-strong text-ink-dim"
                    }`}
                  >
                    {post.published ? "Publicado" : "Rascunho"}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-ink-dim">
                  {formatDate(post.date)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/blog/${post.id}`}
                      aria-label="Editar post"
                      className="text-ink-dim transition-colors duration-150 hover:text-gold"
                    >
                      <Pencil size={16} />
                    </Link>
                    <button
                      type="button"
                      aria-label="Excluir post"
                      disabled={deletingId === post.id}
                      onClick={() => handleDelete(post.id)}
                      className="text-ink-dim transition-colors duration-150 hover:text-error disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-ink-dim">
                  Nenhum post criado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
