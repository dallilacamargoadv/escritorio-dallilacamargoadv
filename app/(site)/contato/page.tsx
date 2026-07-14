import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { SERVICE_AREAS, SITE } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Inicie seu atendimento com a Dallila Camargo I Advogada. Escolha a área que melhor descreve a sua necessidade.",
  alternates: { canonical: "/contato" },
};

export default function ContatoPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <Reveal>
        <h1 className="max-w-2xl text-4xl sm:text-5xl">
          Qual área você <em className="italic text-gold">precisa</em>?
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-dim">
          Escolha a opção que melhor descreve a sua situação. Você será
          direcionado ao formulário específico daquela área para iniciar o
          atendimento.
        </p>

        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-3">
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
            <a href={`mailto:${SITE.email}`} className="text-gold underline">
              {SITE.email}
            </a>
          </p>
        </div>
      </Reveal>
    </section>
  );
}
