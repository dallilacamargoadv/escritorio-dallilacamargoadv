// Peças visuais reutilizáveis da área de estudos (tema moderno escuro).
import type { ReactNode } from "react";

export function Card({ children, className = "", destaque = false }: { children: ReactNode; className?: string; destaque?: boolean }) {
  return (
    <section
      className={`rounded-2xl border p-4 sm:p-5 ${destaque ? "border-e-accent/60 bg-e-accent-soft" : "border-e-line bg-e-card"} ${className}`}
    >
      {children}
    </section>
  );
}

export function CardTitulo({ children, acao }: { children: ReactNode; acao?: ReactNode }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="text-sm font-medium text-e-ink">{children}</h2>
      {acao}
    </div>
  );
}

export function Kpi({ rotulo, valor, detalhe, tom }: { rotulo: string; valor: string; detalhe?: string; tom?: "ok" | "warn" | "bad" }) {
  const cor = tom === "ok" ? "text-e-ok" : tom === "warn" ? "text-e-warn" : tom === "bad" ? "text-e-bad" : "text-e-dim";
  return (
    <div className="rounded-2xl border border-e-line bg-e-card p-4">
      <p className="text-[11px] text-e-dim">{rotulo}</p>
      <p className="mt-1 text-2xl font-medium tabular-nums text-e-ink">{valor}</p>
      {detalhe && <p className={`mt-1 text-xs ${cor}`}>{detalhe}</p>}
    </div>
  );
}

export function Barra({ pct, tom }: { pct: number; tom?: "ok" | "warn" | "bad" | "accent" }) {
  const cor = tom === "ok" ? "bg-e-ok" : tom === "warn" ? "bg-e-warn" : tom === "bad" ? "bg-e-bad" : "bg-e-accent";
  return (
    <span className="relative block h-2 flex-1 overflow-hidden rounded-full bg-e-line">
      <span className={`absolute inset-y-0 left-0 rounded-full ${cor}`} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </span>
  );
}

export const BOTAO_PRIMARIO =
  "inline-flex items-center gap-2 rounded-full bg-e-glow px-4 py-2 text-sm font-medium text-e-bg transition-opacity duration-150 hover:opacity-90 disabled:opacity-60";
export const BOTAO_SECUNDARIO =
  "inline-flex items-center gap-2 rounded-full border border-e-line px-3 py-1.5 text-xs text-e-dim transition-colors duration-150 hover:text-e-ink";

/**
 * Botão de resposta depois da correção. Sem border-e-line/text-e-dim na base: com as duas
 * cores na mesma classe, o Tailwind deixa o vermelho perder para o cinza e a escolha errada
 * some da tela (24/11, CPC art. 2º).
 */
export function botaoResposta(tom: "neutro" | "certa" | "marcada-errada" | "apagada"): string {
  const base = "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors duration-150";
  if (tom === "certa") return `${base} border-e-ok bg-e-ok-soft text-e-ok`;
  if (tom === "marcada-errada") return `${base} border-e-bad bg-e-bad-soft text-e-bad`;
  if (tom === "apagada") return `${base} border-e-line text-e-dim opacity-60`;
  return `${base} border-e-line text-e-dim hover:text-e-ink`;
}
export const CAMPO =
  "mt-1 w-full rounded-lg border border-e-line bg-e-card-2 px-2.5 py-1.5 text-sm text-e-ink outline-none focus:border-e-accent";

export function tomPorPct(p: number): "ok" | "warn" | "bad" {
  return p >= 75 ? "ok" : p >= 60 ? "warn" : "bad";
}

export function Cabecalho({ titulo, sub }: { titulo: string; sub?: string }) {
  return (
    <header className="mb-5">
      <p className="text-[11px] uppercase tracking-[0.14em] text-e-dim">Operação Aprovação · PGE-MA</p>
      <h1 className="mt-1 text-2xl font-medium text-e-ink">{titulo}</h1>
      {sub && <p className="mt-1 text-sm text-e-dim">{sub}</p>}
    </header>
  );
}
