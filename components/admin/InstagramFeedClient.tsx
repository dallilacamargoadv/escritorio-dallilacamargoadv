"use client";

import type { ConteudoEditorial } from "@/lib/db-conteudo-editorial";
import { FORMATO_LABELS, PILAR_COLORS, PILAR_LABELS } from "@/lib/admin-labels";

function formatDateBR(iso: string) {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

function formatDateTimeBR(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function InstagramFeedClient({ posts }: { posts: ConteudoEditorial[] }) {
  const ultimaSincronizacao = posts
    .map((p) => p.sincronizado_em)
    .filter((d): d is string => !!d)
    .sort()
    .at(-1);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="border-b border-hairline pb-6">
        <p className="font-eyebrow text-[10px] text-ink-dim">Marketing</p>
        <h1 className="mt-3 text-lg italic text-ink">Feed do Instagram</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-dim">
          Alcance e interações reais, puxados direto do Instagram (@dallilacamargoadv) via
          Composio — sem digitação manual.
        </p>
      </div>

      <div className="mt-6 border border-hairline-strong bg-bg-alt p-4">
        <p className="text-xs text-ink-dim">
          <strong className="text-ink">Isso não atualiza sozinho.</strong> Os números aqui são
          da última vez que alguém pediu uma sincronização
          {ultimaSincronizacao ? (
            <> — <span className="font-mono tabular-nums">{formatDateTimeBR(ultimaSincronizacao)}</span></>
          ) : null}
          . Pra atualizar, é só pedir &ldquo;sincroniza o Instagram&rdquo; na conversa. Se quiser que isso
          rode sozinho todo dia, dá pra configurar — mas é uma automação separada, me avise se
          quiser ligar.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {posts.length === 0 && (
          <p className="text-sm text-ink-dim">Nenhum post sincronizado ainda.</p>
        )}
        {posts.map((post) => (
          <div key={post.id} className="border border-hairline p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wide text-ink-dim">
                    {formatDateBR(post.data)} · {FORMATO_LABELS[post.formato]}
                  </span>
                  <span className={`border px-1.5 py-0.5 font-mono text-[9px] uppercase ${PILAR_COLORS[post.pilar]}`}>
                    {PILAR_LABELS[post.pilar]}
                  </span>
                </div>
                <p className="mt-2 line-clamp-3 text-sm text-ink">{post.tema}</p>
                {post.permalink && (
                  <a
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs text-gold underline underline-offset-2"
                  >
                    Ver no Instagram ↗
                  </a>
                )}
              </div>
              <div className="flex shrink-0 gap-4 text-right">
                <div>
                  <p className="font-display text-lg italic text-ink tabular-nums">{post.alcance ?? "—"}</p>
                  <p className="font-mono text-[9px] uppercase tracking-wide text-ink-dim">Alcance</p>
                </div>
                <div>
                  <p className="font-display text-lg italic text-ink tabular-nums">{post.interacoes ?? "—"}</p>
                  <p className="font-mono text-[9px] uppercase tracking-wide text-ink-dim">Interações</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
