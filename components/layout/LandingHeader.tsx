import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { SITE } from "@/lib/site-data";
import { getWhatsAppUrl } from "@/lib/whatsapp";

/**
 * Header enxuto para landing pages de campanha (Google Ads / Google Meu
 * Negócio) — sem o menu de Áreas de Atuação nem links pra Sobre/Blog, de
 * propósito: a página tem um único objetivo (o formulário), então nada aqui
 * deve tirar o visitante dela antes de converter. Os 3 canais de contato
 * ficam visíveis pra quem prefere falar direto em vez de preencher formulário.
 */
export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-bg/95 backdrop-blur-sm">
      <div className="hidden items-center justify-center gap-6 border-b border-hairline bg-bg-alt px-4 py-2 font-mono text-[11px] text-ink-dim sm:flex">
        <a
          href={getWhatsAppUrl("Olá! Vim pelo site e gostaria de conversar.")}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gold transition-colors duration-150"
        >
          WhatsApp {SITE.whatsappDisplay}
        </a>
        <span className="text-hairline-strong">·</span>
        <a
          href={`mailto:${SITE.email}`}
          className="hover:text-gold transition-colors duration-150"
        >
          {SITE.email}
        </a>
        <span className="text-hairline-strong">·</span>
        <a
          href={SITE.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gold transition-colors duration-150"
        >
          {SITE.instagram}
        </a>
      </div>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Página inicial">
          <Logo />
        </Link>
        <Button href="#formulario" className="!px-5 !py-2.5">
          Iniciar atendimento
        </Button>
      </div>
    </header>
  );
}
