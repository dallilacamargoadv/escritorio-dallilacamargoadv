"use client";

import { useState } from "react";
import Link from "next/link";
import type { Notificacao } from "@/lib/db-notificacoes";
import { NOTIFICACAO_TIPO_LABELS } from "@/lib/admin-labels";
import { formatDate } from "@/lib/format";

function linkFor(n: Notificacao): string {
  if (n.financeiro_id) return `/admin/financeiro/${n.financeiro_id}`;
  if (n.post_id) return `/admin/blog/${n.post_id}`;
  if (n.lead_id) return "/admin/leads";
  return "/admin/notificacoes";
}

export function NotificacoesList({
  initialNotificacoes,
}: {
  initialNotificacoes: Notificacao[];
}) {
  const [notificacoes, setNotificacoes] = useState(initialNotificacoes);
  const [markingAll, setMarkingAll] = useState(false);

  async function handleMarkAsRead(id: string) {
    setNotificacoes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: true } : n)),
    );
    await fetch(`/api/admin/notificacoes/${id}`, { method: "PATCH" });
  }

  async function handleMarkAllAsRead() {
    setMarkingAll(true);
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
    try {
      await fetch("/api/admin/notificacoes", { method: "PATCH" });
    } finally {
      setMarkingAll(false);
    }
  }

  const unreadCount = notificacoes.filter((n) => !n.lida).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between border-b border-hairline pb-6">
        <div>
          <h1 className="text-lg italic text-ink">Notificações</h1>
          <p className="font-mono text-xs text-ink-dim">
            {unreadCount} não lidas
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
            className="border border-hairline-strong px-4 py-2 text-sm text-ink-dim transition-colors duration-150 hover:border-gold hover:text-gold disabled:opacity-50"
          >
            Marcar todas como lidas
          </button>
        )}
      </div>

      <div className="mt-6 border border-hairline">
        {notificacoes.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-ink-dim">
            Nenhuma notificação ainda.
          </p>
        )}
        {notificacoes.map((n, index) => (
          <div
            key={n.id}
            className={`flex items-center justify-between gap-4 px-4 py-3 text-sm ${
              index !== notificacoes.length - 1 ? "border-b border-hairline" : ""
            } ${n.lida ? "opacity-60" : ""}`}
          >
            <Link
              href={linkFor(n)}
              onClick={() => !n.lida && handleMarkAsRead(n.id)}
              className="min-w-0 flex-1"
            >
              <p className="truncate text-ink">{n.titulo}</p>
              <p className="font-mono text-[10px] uppercase text-ink-dim">
                {NOTIFICACAO_TIPO_LABELS[n.tipo]} · {formatDate(n.created_at)}
              </p>
            </Link>
            {!n.lida && (
              <span className="h-2 w-2 shrink-0 rounded-full bg-gold" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
