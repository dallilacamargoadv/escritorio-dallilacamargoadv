import type { Metadata } from "next";
import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icon";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { SITE } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Inicie seu atendimento com a Dallila Camargo I Advogada. Escolha a área que melhor descreve a sua necessidade: conta hackeada, contratos ou propriedade intelectual.",
  alternates: { canonical: "/contato" },
};

const CARDS: {
  slug: string;
  icon: IconName;
  title: string;
  description: string;
}[] = [
  {
    slug: "recuperacao-e-reativacao-de-conta-hackeada",
    icon: "acesso",
    title: "Conta Hackeada",
    description:
      "Sua conta foi invadida, bloqueada, ou estão usando seu nome para aplicar golpes.",
  },
  {
    slug: "contratos",
    icon: "contrato",
    title: "Contratos",
    description:
      "Precisa elaborar, revisar ou negociar um contrato para sua atividade digital.",
  },
  {
    slug: "propriedade-intelectual",
    icon: "marca",
    title: "Propriedade Intelectual",
    description:
      "Quer registrar uma marca, proteger conteúdo autoral ou licenciar um ativo intelectual.",
  },
];

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
          {CARDS.map((card) => (
            <Link
              key={card.slug}
              href={`/${card.slug}#formulario`}
              className="group block border border-hairline p-8 transition-colors duration-150 hover:border-gold"
            >
              <Icon name={card.icon} />
              <h2 className="mt-6 text-xl">{card.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-dim">
                {card.description}
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
              href={`https://wa.me/${SITE.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold underline"
            >
              WhatsApp
            </a>{" "}
            ·{" "}
            <a href={`mailto:${SITE.email}`} className="text-gold underline">
              {SITE.email}
            </a>
          </p>
        </div>
      </Reveal>
    </section>
  );
}
