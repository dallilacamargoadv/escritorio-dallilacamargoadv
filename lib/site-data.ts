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
      "Elaboração, revisão e negociação de contratos adaptados às relações comerciais no ambiente digital.",
  },
  {
    slug: "propriedade-intelectual",
    formType: "propriedade_intelectual",
    menuLabel: "Propriedade Intelectual",
    shortLabel: "Propriedade Intelectual",
    icon: "marca",
    description:
      "Proteção jurídica de marcas, direitos autorais e demais ativos intelectuais para profissionais e negócios que atuam no ambiente digital.",
  },
  {
    slug: "contas-e-plataformas",
    formType: "contas_e_plataformas",
    menuLabel: "Contas e Plataformas",
    shortLabel: "Contas e Plataformas",
    icon: "plataforma",
    description:
      "Atuação jurídica em casos de contas comprometidas, bloqueios, suspensões, strikes, conflitos com plataformas digitais e medidas decorrentes de incidentes virtuais.",
  },
  {
    slug: "golpes-virtuais",
    formType: "golpes_virtuais",
    menuLabel: "Golpes Virtuais",
    shortLabel: "Golpes Virtuais",
    icon: "alerta",
    description:
      "Atuação em situações envolvendo fraudes eletrônicas, utilização indevida de contas, engenharia social, transações fraudulentas e demais incidentes praticados no ambiente digital.",
  },
  {
    slug: "assessoria-estrategica",
    formType: "assessoria_estrategica",
    menuLabel: "Assessoria Estratégica",
    shortLabel: "Assessoria Estratégica",
    icon: "estrategia",
    description:
      "Orientação jurídica preventiva para influenciadores, criadores de conteúdo, prestadores de serviços e negócios digitais em temas relacionados à proteção de dados, LGPD, relações digitais e desafios jurídicos decorrentes da tecnologia.",
  },
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
