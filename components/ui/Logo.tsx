import Image from "next/image";
import { SITE } from "@/lib/site-data";

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/logo-abelha.png"
        alt=""
        width={36}
        height={36}
        aria-hidden="true"
        className="h-9 w-9 shrink-0"
      />
      <div className="hidden leading-tight sm:block">
        <div className="font-display text-base italic text-ink">
          Dallila Camargo
        </div>
        <div className="font-mono text-[10px] uppercase tracking-wide text-ink-dim">
          Advogada · {SITE.oab}
        </div>
      </div>
    </div>
  );
}
