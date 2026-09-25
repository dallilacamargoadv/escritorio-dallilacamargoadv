import Image from "next/image";
import Link from "next/link";
import { SERVICE_AREAS, SITE } from "@/lib/site-data";
import { getWhatsAppUrl } from "@/lib/whatsapp";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-hairline bg-bg-alt">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo-d-malva.png"
                alt=""
                width={24}
                height={24}
                unoptimized
                aria-hidden="true"
                className="brand-mark-on-dark h-6 w-6 object-contain"
              />
              <Image
                src="/logo-d-bordo.png"
                alt=""
                width={24}
                height={24}
                unoptimized
                aria-hidden="true"
                className="brand-mark-on-light h-6 w-6 object-contain"
              />
              <span className="font-display text-base italic text-gold">
                Dallila Camargo
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-ink-dim">
              Direito Digital com método para quem constrói negócios, marca
              e conteúdo na internet.
            </p>
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
            </ul>
          </div>

          <div>
            <h3 className="font-eyebrow text-[10px] text-gold">Blog</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-ink-dim hover:text-gold transition-colors duration-150"
                >
                  Ver artigos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-eyebrow text-[10px] text-gold">Institucional</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/sobre"
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
              <li>
                <a
                  href={getWhatsAppUrl(
                    "Olá! Vim pelo site e gostaria de conversar.",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors duration-150"
                >
                  WhatsApp {SITE.whatsappDisplay}
                </a>
              </li>
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

        <div className="mt-12 space-y-2 border-t border-hairline pt-6 text-xs text-ink-dim">
          <p className="max-w-2xl">
            Este site tem caráter exclusivamente informativo. As
            informações apresentadas não constituem aconselhamento
            jurídico individualizado e não substituem a consulta a
            profissional habilitado. Em conformidade com o Provimento
            205/2021 da OAB.
          </p>
          <p>Dallila Camargo · {SITE.oab}</p>
          <p>© {year} Dallila Camargo I Advocacia. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
