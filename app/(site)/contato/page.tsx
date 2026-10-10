import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { AtendimentoHero } from "@/components/ui/AtendimentoHero";
import { ContatoGeralForm } from "@/components/forms/ContatoGeralForm";
import { getPageMetadata } from "@/lib/page-metadata";
import { SERVICE_AREAS, SITE } from "@/lib/site-data";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata({
    slug: "contato",
    path: "/contato",
    fallbackTitle: "Contato",
    fallbackDescription:
      "Conte o que aconteceu e a Dallila Camargo I Advogada responde pelo WhatsApp para entender o seu caso. Ou escolha a área do atendimento.",
  });
}

export default function ContatoPage() {
  return (
    <>
      <AtendimentoHero
        eyebrow="atendimento"
        title={
          <>
            Conte o que{" "}
            <em className="italic text-atendimento-accent">aconteceu</em>
          </>
        }
        description="Preencha o relato abaixo. Eu leio com calma e respondo pelo WhatsApp para entender o seu caso e explicar os próximos passos."
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal>
          <div className="mx-auto max-w-2xl">
            <ContatoGeralForm />
          </div>

          <div className="mx-auto mt-16 max-w-2xl">
            <SectionEyebrow>Como funciona</SectionEyebrow>
            <ol className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                "Você conta o que aconteceu",
                "Eu respondo pelo WhatsApp",
                "Conversamos e definimos o caminho",
              ].map((text, i) => (
                <li key={text} className="border-t border-hairline pt-3">
                  <span className="text-xs text-wine">{i + 1}</span>
                  <p className="mt-1 text-sm text-ink">{text}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-16">
            <SectionEyebrow>Ou escolha a área</SectionEyebrow>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {SERVICE_AREAS.map((area) => (
              <Link
                key={area.slug}
                href={`/${area.slug}#formulario`}
                className="group block border border-hairline p-8 transition-colors duration-150 hover:border-gold"
              >
                <Icon name={area.icon} />
                <h2 className="mt-6 text-xl">{area.shortLabel}</h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-dim">
                  {area.description}
                </p>
                <span className="mt-6 inline-block text-sm text-gold underline-offset-4 group-hover:underline">
                  Iniciar atendimento →
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-16">
            <SectionEyebrow>Outros canais</SectionEyebrow>
            <p className="text-sm text-ink-dim">
              Prefere falar diretamente?{" "}
              <a
                href={`mailto:${SITE.email}`}
                className="text-gold underline"
              >
                {SITE.email}
              </a>
            </p>
          </div>
        </Reveal>
      </section>
    </>
  );
}
