"use client";

import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";

/**
 * No celular (abaixo de md) o menu lateral vira gaveta: barra fixa no topo (abaixo da área do relógio)
 * com botão ☰; a gaveta abre por cima e fecha ao tocar num link ou fora dela. No computador nada muda.
 */
export function MenuCelular({ titulo, estudos, children }: { titulo: ReactNode; estudos: boolean; children: ReactNode }) {
  const [aberto, setAberto] = useState(false);
  const fundo = estudos ? "bg-e-side text-e-ink border-e-line" : "bg-bg text-ink border-hairline";

  return (
    <>
      <div
        className={`fixed inset-x-0 top-0 z-40 flex items-center gap-3 border-b px-4 pb-2.5 pt-[calc(env(safe-area-inset-top)+0.625rem)] md:hidden print:hidden ${fundo}`}
      >
        <button
          type="button"
          onClick={() => setAberto(true)}
          aria-label="Abrir menu"
          aria-expanded={aberto}
          className="-ml-1 rounded-lg p-1.5"
        >
          <Menu size={20} aria-hidden="true" />
        </button>
        <span className="min-w-0 truncate text-sm">{titulo}</span>
      </div>

      {aberto && (
        <button type="button" aria-label="Fechar menu" onClick={() => setAberto(false)} className="fixed inset-0 z-40 bg-black/55 md:hidden" />
      )}

      <div
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) setAberto(false);
        }}
        className={`${aberto ? "flex" : "hidden"} fixed inset-y-0 left-0 z-50 max-w-[85vw] overflow-y-auto pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] md:static md:z-auto md:flex md:max-w-none md:overflow-visible md:p-0 ${
          estudos ? "bg-e-side" : "bg-bg"
        } md:bg-transparent`}
      >
        {aberto && (
          <button type="button" onClick={() => setAberto(false)} aria-label="Fechar menu" className="absolute right-2 top-[calc(env(safe-area-inset-top)+0.5rem)] z-10 rounded-lg p-1.5 md:hidden">
            <X size={18} aria-hidden="true" />
          </button>
        )}
        {children}
      </div>
    </>
  );
}
