import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "invert";

const base =
  "inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium tracking-wide transition-all duration-150 ease-out active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-wine-deep text-[#F2EFEA] border border-wine-deep hover:bg-transparent hover:text-wine-deep",
  secondary:
    "bg-transparent text-ink border border-hairline-strong hover:border-gold hover:text-gold",
  /* pra usar sobre um bloco de cor dominante (fundo vermelho ou azul) — claro
     sempre, nunca some no fundo; texto em wine-deep funciona em cima de
     qualquer bloco da paleta */
  invert:
    "bg-gold-bright text-wine-deep border border-gold-bright hover:bg-transparent hover:text-gold-bright",
};

interface CommonProps {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}

interface LinkButtonProps extends CommonProps {
  href: string;
}

interface NativeButtonProps
  extends CommonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> {
  href?: undefined;
}

type ButtonProps = LinkButtonProps | NativeButtonProps;

export function Button(props: ButtonProps) {
  const { variant = "primary", className = "", children } = props;
  const classes = `${base} ${variants[variant]} ${className}`;

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const { href, variant: _variant, className: _className, children: _children, ...rest } = props as NativeButtonProps;
  /* eslint-enable @typescript-eslint/no-unused-vars */

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
