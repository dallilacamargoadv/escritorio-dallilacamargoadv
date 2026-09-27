import { SITE } from "@/lib/site-data";

/* 26/09/2026: monograma "D" (PNG malva/bordô, marca anterior) trocado
   pelo ✶ — o Guia de Aplicação reserva o D só pra contextos bem pequenos
   (favicon), o ✶ em Confiança é o logo institucional de verdade agora. */
export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="text-3xl leading-none text-wine shrink-0"
      >
        ✶
      </span>
      <div className="hidden leading-tight sm:block">
        <div className="font-display text-base italic text-gold">
          Dallila Camargo
        </div>
        <div className="font-mono text-[10px] uppercase tracking-wide text-ink-dim">
          Advogada · {SITE.oab}
        </div>
      </div>
    </div>
  );
}
