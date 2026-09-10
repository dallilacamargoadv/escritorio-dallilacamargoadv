import type { LeadFormType } from "./db-leads";
import type { IconName } from "@/components/ui/Icon";

export interface ServiceArea {
  slug: string;
  formType: LeadFormType;
  menuLabel: string;
  shortLabel: string;
  icon: IconName;
  description: string;
}

// Ordem oficial das 4 frentes de atuação
export const SERVICE_AREAS: ServiceArea[] = [
  {
    slug: "contas-e-plataformas",
    formType: "contas_e_plataformas",
    menuLabel: "Contas e Plataformas",
    shortLabel: "Contas e Plataformas",
    icon: "plataforma",
    description:
      "Reativação e recuperação de conta hackeada, suspensa ou banida — e remoção de conteúdo publicado sem autorização.",
  },
  {
    slug: "contratos",
    formType: "contratos",
    menuLabel: "Contratos",
    shortLabel: "Contratos",
    icon: "contrato",
    description:
      "Contratos de publicidade, patrocínio, parceria e prestação de serviço — feitos ou revisados para você não assinar no escuro.",
  },
  {
    slug: "registro-de-marca",
    formType: "propriedade_intelectual",
    menuLabel: "Registro de Marca",
    shortLabel: "Registro de Marca",
    icon: "marca",
    description:
      "Registro da sua marca no INPI, do zero ao deferimento — proteção do nome, da logo e da identidade do seu negócio.",
  },
  {
    slug: "assessoria",
    formType: "assessoria_estrategica",
    menuLabel: "Assessoria",
    shortLabel: "Assessoria",
    icon: "estrategia",
    description:
      "Acompanhamento jurídico contínuo para o seu negócio digital — de LGPD a estruturação tributária.",
  },
];

export interface PageSeoEntry {
  slug: string;
  label: string;
  path: string;
}

// Páginas fixas cobertas pela tela de SEO do admin (/admin/seo).
export const PAGE_SEO_ENTRIES: PageSeoEntry[] = [
  { slug: "home", label: "Home", path: "/" },
  { slug: "sobre", label: "Sobre", path: "/sobre" },
  { slug: "contato", label: "Contato", path: "/contato" },
  ...SERVICE_AREAS.map((area) => ({
    slug: area.slug,
    label: area.menuLabel,
    path: `/${area.slug}`,
  })),
];

export const SITE = {
  name: "Dallila Camargo I Advogada",
  oab: "OAB/PA nº 36.762",
  city: "Redenção/PA (atendimento nacional 100% online)",
  email: "dallilacamargoadv@gmail.com",
  instagram: "@dallilacamargoadv",
  instagramUrl: "https://instagram.com/dallilacamargoadv",
  // Sem símbolos, com DDI 55 — formato exigido pelo link wa.me (ver lib/whatsapp.ts).
  whatsapp: "5594991400801",
  whatsappDisplay: "(94) 99140-0801",
  domain: "dallilacamargoadv.com.br",
};
