"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell } from "lucide-react";
import type { Notificacao } from "@/lib/db-notificacoes";
import { NOTIFICACAO_TIPO_LABELS } from "@/lib/admin-labels";
import { formatDate } from "@/lib/format";

export function AdminPageBanner({
  title,
  subtitle,
  notificacoes,
}: {
  title: string;
  subtitle: string;
  notificacoes?: Notificacao[];
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const unreadNotificacoes = notificacoes?.filter((n) => !n.lida) ?? [];
  const recentNotificacoes = unreadNotificacoes.slice(0, 5);
  const unreadCount = unreadNotificacoes.length;

  return (
    <div className="flex items-center gap-5 bg-bg-alt px-6 py-6 sm:px-8">
      <Image
        src="/logo-abelha.png"
        alt=""
        width={48}
        height={48}
        aria-hidden="true"
        className="h-12 w-12 shrink-0"
      />
      <div className="h-11 w-px shrink-0 bg-hairline-strong" />
      <div>
        <h1 className="text-2xl italic text-ink">{title}</h1>
        <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wide text-ink-dim">
          {subtitle}
        </p>
      </div>

      {notificacoes && (
        <div ref={wrapRef} className="relative ml-auto shrink-0">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Notificações"
            className="relative flex h-9 w-9 items-center justify-center border border-hairline-strong bg-bg text-gold transition-colors duration-150 hover:border-gold"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center bg-gold px-1 font-mono text-[9px] text-bg">
                {unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-10 w-72 border border-hairline-strong bg-surface shadow-lg">
              <div className="border-b border-hairline px-3.5 py-2.5 font-mono text-[10px] uppercase tracking-wide text-ink-dim">
                Notificações não lidas
              </div>
              {recentNotificacoes.length === 0 && (
                <p className="px-3.5 py-4 text-center text-xs text-ink-dim">
                  Nenhuma notificação ainda.
                </p>
              )}
              {recentNotificacoes.map((n, index) => (
                <div
                  key={n.id}
                  className={`px-3.5 py-2.5 text-xs ${
                    index !== recentNotificacoes.length - 1
                      ? "border-b border-hairline"
                      : ""
                  }`}
                >
                  <p className="truncate text-ink">{n.titulo}</p>
                  <p className="mt-0.5 font-mono text-[9px] uppercase text-ink-dim">
                    {NOTIFICACAO_TIPO_LABELS[n.tipo]} · {formatDate(n.created_at)}
                  </p>
                </div>
              ))}
              <Link
                href="/admin/notificacoes"
                onClick={() => setOpen(false)}
                className="block border-t border-hairline px-3.5 py-2.5 text-center text-xs text-gold transition-colors duration-150 hover:underline"
              >
                Ver todas →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
