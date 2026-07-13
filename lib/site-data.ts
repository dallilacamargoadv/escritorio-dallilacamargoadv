import type { LeadFormType } from "./db-leads";

export interface ServiceArea {
  slug: string;
  formType: LeadFormType;
  menuLabel: string;
  shortLabel: string;
}

// Ordem oficial: Conta Hackeada -> Contratos -> Propriedade Intelectual
// (segue os arquivos de copy e a prioridade de cluster do prompt SEO/GEO v1.1)
export const SERVICE_AREAS: ServiceArea[] = [
  {
    slug: "recuperacao-e-reativacao-de-conta-hackeada",
    formType: "conta_hackeada",
    menuLabel: "Recuperação e Reativação de Conta Hackeada",
    shortLabel: "Conta Hackeada",
  },
  {
    slug: "contratos",
    formType: "contratos",
    menuLabel: "Contratos",
    shortLabel: "Contratos",
  },
  {
    slug: "propriedade-intelectual",
    formType: "propriedade_intelectual",
    menuLabel: "Propriedade Intelectual",
    shortLabel: "Propriedade Intelectual",
  },
];

export const SITE = {
  name: "Dallila Camargo I Advogada",
  oab: "OAB/PA nº 36.762",
  city: "Redenção/PA (atendimento nacional 100% online)",
  phone: "(94) 99140-0801",
  whatsappNumber: "5594991400801",
  email: "dallilacamargoadv@gmail.com",
  instagram: "@dallilacamargoadv",
  instagramUrl: "https://instagram.com/dallilacamargoadv",
  domain: "dallilacamargoadv.com.br",
};
