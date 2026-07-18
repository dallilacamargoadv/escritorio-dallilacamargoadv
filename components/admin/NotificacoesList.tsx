"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import type { Notificacao } from "@/lib/db-notificacoes";
import { NOTIFICACAO_TIPO_LABELS } from "@/lib/admin-labels";
import { formatDate } from "@/lib/format";

function linkFor(n: Notificacao): string {
  if (n.financeiro_id) return `/admin/financeiro/${n.financeiro_id}`;
  if (n.post_id) return `/admin/blog/${n.post_id}`;
  if (n.lead_id) return "/admin/leads";
  return "/admin/notificacoes";
}

type Aba = "ativas" | "arquivo";

export function NotificacoesList({
  initialNotificacoes,
}: {
  initialNotificacoes: Notificacao[];
}) {
  const [notificacoes, setNotificacoes] = useState(initialNotificacoes);
  const [markingAll, setMarkingAll] = useState(false);
  const [aba, setAba] = useState<Aba>("ativas");

  async function handleDismiss(id: string) {
    setNotificacoes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: true } : n)),
    );
    await fetch(`/api/admin/notificacoes/${id}`, { method: "PATCH" });
  }

  async function handleDismissAll() {
    setMarkingAll(true);
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
    try {
      await fetch("/api/admin/notificacoes", { method: "PATCH" });
    } finally {
      setMarkingAll(false);
    }
  }

  const ativas = notificacoes.filter((n) => !n.lida);
  const arquivadas = notificacoes.filter((n) => n.lida);
  const visiveis = aba === "ativas" ? ativas : arquivadas;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between border-b border-hairline pb-6">
        <div>
          <h1 className="text-lg italic text-ink">Notificações</h1>
          <p className="font-mono text-xs text-ink-dim">
            {ativas.length} ativas · {arquivadas.length} arquivadas
          </p>
        </div>
        {aba === "ativas" && ativas.length > 0 && (
          <button
            type="button"
            onClick={handleDismissAll}
            disabled={markingAll}
            className="border border-hairline-strong px-4 py-2 text-sm text-ink-dim transition-colors duration-150 hover:border-gold hover:text-gold disabled:opacity-50"
          >
            Arquivar todas
          </button>
        )}
      </div>

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={() => setAba("ativas")}
          className={`border px-3 py-1.5 text-xs transition-colors duration-150 ${
            aba === "ativas"
              ? "border-gold bg-gold text-bg"
              : "border-hairline-strong text-ink-dim hover:border-gold hover:text-gold"
          }`}
        >
          Ativas ({ativas.length})
        </button>
        <button
          type="button"
          onClick={() => setAba("arquivo")}
          className={`border px-3 py-1.5 text-xs transition-colors duration-150 ${
            aba === "arquivo"
              ? "border-gold bg-gold text-bg"
              : "border-hairline-strong text-ink-dim hover:border-gold hover:text-gold"
          }`}
        >
          Arquivo ({arquivadas.length})
        </button>
      </div>

      <div className="mt-6 border border-hairline">
        {visiveis.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-ink-dim">
            {aba === "ativas"
              ? "Nenhuma notificação ativa."
              : "Nenhuma notificação arquivada ainda."}
          </p>
        )}
        {visiveis.map((n, index) => (
          <div
            key={n.id}
            className={`flex items-center justify-between gap-4 px-4 py-3 text-sm ${
              index !== visiveis.length - 1 ? "border-b border-hairline" : ""
            } ${n.lida ? "opacity-60" : ""}`}
          >
            <Link href={linkFor(n)} className="min-w-0 flex-1">
              <p className="truncate text-ink">{n.titulo}</p>
              <p className="font-mono text-[10px] uppercase text-ink-dim">
                {NOTIFICACAO_TIPO_LABELS[n.tipo]} · {formatDate(n.created_at)}
              </p>
            </Link>
            {aba === "ativas" ? (
              <button
                type="button"
                aria-label="Arquivar notificação"
                onClick={() => handleDismiss(n.id)}
                className="flex h-6 w-6 shrink-0 items-center justify-center border border-hairline-strong text-ink-dim transition-colors duration-150 hover:border-gold hover:text-gold"
              >
                <Check size={13} />
              </button>
            ) : (
              <span className="h-2 w-2 shrink-0 rounded-full bg-hairline-strong" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
