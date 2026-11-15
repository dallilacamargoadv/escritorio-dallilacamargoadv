"use client";

import Link from "next/link";

/** Chave Escritório / Estudos no topo da barra lateral. */
export function ModoSwitch({ modo }: { modo: "escritorio" | "estudos" }) {
  const base = "flex-1 py-1.5 text-center text-[11px] transition-colors duration-150";
  const estudos = modo === "estudos";
  return (
    <nav
      aria-label="Área do painel"
      className={`flex overflow-hidden border ${estudos ? "rounded-lg border-e-line" : "border-hairline-strong"}`}
    >
      <Link
        href="/admin"
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
