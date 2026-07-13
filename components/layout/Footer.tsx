import Image from "next/image";
import Link from "next/link";
import { SERVICE_AREAS, SITE } from "@/lib/site-data";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-hairline bg-bg-alt">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo-abelha.png"
                alt=""
                width={24}
                height={24}
                aria-hidden="true"
                className="h-6 w-6"
              />
              <span className="font-display text-base italic text-ink">
                Dallila Camargo
              </span>
            </Link>
            <p className="mt-4 text-sm text-ink-dim">
              Profissional individual, {SITE.oab} (CNPJ em fase de emissão).
            </p>
            <p className="mt-2 text-sm text-ink-dim">{SITE.city}</p>
          </div>

          <div>
            <h3 className="font-eyebrow text-[10px] text-gold">Áreas de Atuação</h3>
            <ul className="mt-4 space-y-3">
              {SERVICE_AREAS.map((area) => (
                <li key={area.slug}>
                  <Link
                    href={`/${area.slug}`}
                    className="text-sm text-ink-dim hover:text-gold transition-colors duration-150"
                  >
                    {area.menuLabel}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-ink-dim hover:text-gold transition-colors duration-150"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-eyebrow text-[10px] text-gold">Institucional</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/#sobre-nos"
                  className="text-sm text-ink-dim hover:text-gold transition-colors duration-150"
                >
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link
                  href="/politica-de-privacidade"
                  className="text-sm text-ink-dim hover:text-gold transition-colors duration-150"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link
                  href="/termos-de-uso"
                  className="text-sm text-ink-dim hover:text-gold transition-colors duration-150"
                >
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-eyebrow text-[10px] text-gold">Contato</h3>
            <ul className="mt-4 space-y-3 text-sm text-ink-dim">
              <li>{SITE.phone}</li>
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="hover:text-gold transition-colors duration-150"
                >
                  {SITE.email}
                </a>
              </li>
              <li>
                <a
                  href={SITE.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors duration-150"
                >
                  {SITE.instagram}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-hairline pt-6 text-xs text-ink-dim">
          © {year} {SITE.name}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
