import { SITE } from "@/lib/site-data";
import { getWhatsAppUrl } from "@/lib/whatsapp";

/**
 * Footer enxuto para landing pages de campanha — mantém só o que é
 * obrigatório (identificação + disclaimer do Provimento 205/2021 da OAB) e
 * os canais de contato, sem o sitemap completo do Footer institucional.
 */
export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-hairline bg-bg-alt">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-ink-dim">
          <a
            href={getWhatsAppUrl("Olá! Vim pelo site e gostaria de conversar.")}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gold transition-colors duration-150"
          >
            WhatsApp {SITE.whatsappDisplay}
          </a>
          <a
            href={`mailto:${SITE.email}`}
            className="hover:text-gold transition-colors duration-150"
          >
            {SITE.email}
          </a>
          <a
            href={SITE.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gold transition-colors duration-150"
          >
            {SITE.instagram}
          </a>
        </div>

        <div className="mt-8 space-y-2 border-t border-hairline pt-6 text-xs text-ink-dim">
          <p className="max-w-2xl">
            Este site tem caráter exclusivamente informativo. As informações
            apresentadas não constituem aconselhamento jurídico
            individualizado e não substituem a consulta a profissional
            habilitado. Em conformidade com o Provimento 205/2021 da OAB.
          </p>
          <p>Dallila Camargo · {SITE.oab}</p>
          <p>© {year} Dallila Camargo I Advocacia. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
