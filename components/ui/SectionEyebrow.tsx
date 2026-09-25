/**
 * Glifo "✶" — o mesmo da bio real dela ("Dallila Camargo ✶ Advogada
 * Digital"), não os ✦★✧ que eu tinha misturado antes. Só a cor alterna
 * entre Confiança (vermelho) e Equilíbrio (azul), o glifo é sempre este.
 * Versão estática — ela vai "dar vida" (animação) por conta própria depois.
 */
const STAR_VARIANTS = [
  { glyph: "✶", color: "text-wine" },
  { glyph: "✶", color: "text-gold" },
] as const;

function pickStarVariant(label: string) {
  if (!label) return STAR_VARIANTS[0];
  let sum = 0;
  for (let i = 0; i < label.length; i++) sum += label.charCodeAt(i);
  return STAR_VARIANTS[sum % STAR_VARIANTS.length];
}

export function SectionEyebrow({ children }: { children: React.ReactNode }) {
  const label = typeof children === "string" ? children : "";
  const star = pickStarVariant(label);

  return (
    <div className="flex items-center gap-4 mb-6" aria-hidden={false}>
      <span className="h-px flex-1 bg-hairline" />
      <div className="flex items-center gap-3 shrink-0">
        <span
          aria-hidden="true"
          className={`text-2xl leading-none ${star.color}`}
        >
          {star.glyph}
        </span>
        <span className="font-eyebrow text-gold text-base">{children}</span>
      </div>
      <span className="h-px flex-1 bg-hairline" />
    </div>
  );
}
