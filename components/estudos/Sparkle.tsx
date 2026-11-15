// Sparkle da marca (mesmos paths do componente Sparkle do Design System da Dallila).
const PATH_CHEIO = "M32,4 C36,20 44,28 60,32 C44,36 36,44 32,60 C28,44 20,36 4,32 C20,28 28,20 32,4 Z";
const PATH_FINO = "M32,8 C35,20 41,27 56,32 C41,37 35,44 32,56 C29,44 23,37 8,32 C23,27 29,20 32,8 Z";

type Variante = "estatico" | "brilhante" | "carregando" | "flutuante";

export function Sparkle({
  size = 16,
  variante = "estatico",
  cor = "var(--e-glow)",
  className = "",
  rotulo,
}: {
  size?: number;
  variante?: Variante;
  cor?: string;
  className?: string;
  /** texto para leitor de tela; sem rótulo o sparkle é decorativo */
  rotulo?: string;
}) {
  const classe =
    variante === "brilhante" ? "sparkle-brilhante" : variante === "carregando" ? "sparkle-carregando" : variante === "flutuante" ? "sparkle-flutuante" : "";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={`${classe} ${className}`.trim()}
      role={rotulo ? "img" : undefined}
      aria-label={rotulo}
      aria-hidden={rotulo ? undefined : true}
    >
      <path d={variante === "flutuante" ? PATH_FINO : PATH_CHEIO} fill={cor} />
    </svg>
  );
}
