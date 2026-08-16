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

// Ordem oficial das 5 áreas de atuação
export const SERVICE_AREAS: ServiceArea[] = [
  {
    slug: "contratos",
    formType: "contratos",
    menuLabel: "Contratos Digitais",
    shortLabel: "Contratos Digitais",
    icon: "contrato",
    description:
      "Contratos de patrocínio, parceria, publi e prestação de serviço — feitos ou revisados para você não assinar no escuro.",
  },
  {
    slug: "propriedade-intelectual",
    formType: "propriedade_intelectual",
    menuLabel: "Propriedade Intelectual",
    shortLabel: "Propriedade Intelectual",
    icon: "marca",
    description:
      "Registro de marca no INPI, direitos autorais e proteção do que você cria — do nome ao conteúdo.",
  },
  {
    slug: "contas-e-plataformas",
    formType: "contas_e_plataformas",
    menuLabel: "Contas e Plataformas",
    shortLabel: "Contas e Plataformas",
    icon: "plataforma",
    description:
      "Atuação em casos de conta comprometida, bloqueada ou com restrição, do pedido administrativo à medida judicial cabível.",
  },
  {
    slug: "golpes-virtuais",
    formType: "golpes_virtuais",
    menuLabel: "Golpes Virtuais",
    shortLabel: "Golpes Virtuais",
    icon: "alerta",
    description:
      "Atuação em casos de fraude eletrônica, golpe do PIX e phishing, com foco em preservação de prova e reparação cabível.",
  },
  {
    slug: "assessoria-estrategica",
    formType: "assessoria_estrategica",
    menuLabel: "Assessoria Estratégica",
    shortLabel: "Assessoria Estratégica",
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
  domain: "dallilacamargoadv.com.br",
};
