"use client";

import Link from "next/link";

/** Chave Escritório / Estudos no topo da barra lateral. */
export function ModoSwitch({ modo }: { modo: "escritorio" | "estudos" }) {
  const base = "flex-1 py-1.5 text-center text-[11px] transition-colors duration-150";
  const estudos = modo === "estudos";
  // Nos estudos, o escritório fica escondido atrás de um link discreto.
  if (estudos) {
    return (
      <Link
        href="/admin/escritorio"
        className="block px-1 text-[11px] text-e-dim transition-colors duration-150 hover:text-e-ink"
      >
        Ir para o escritório →
      </Link>
    );
  }
  return (
    <nav
      aria-label="Área do painel"
      className={`flex overflow-hidden border ${estudos ? "rounded-lg border-e-line" : "border-hairline-strong"}`}
    >
      <Link
        href="/admin/escritorio"
        aria-current={!estudos ? "page" : undefined}
        className={`${base} ${!estudos ? "bg-gold text-bg" : "text-e-dim hover:text-e-ink"}`}
      >
        Escritório
      </Link>
      <Link
        href="/admin/estudos"
        aria-current={estudos ? "page" : undefined}
        className={`${base} ${estudos ? "bg-e-accent text-[#f2efea]" : "text-ink-dim hover:text-gold"}`}
      >
        Estudos
      </Link>
    </nav>
  );
}
