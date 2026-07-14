import { SITE } from "./site-data";

export const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://dallilacamargoadv.com.br";

export const SCHEMA_IDS = {
  legalService: `${BASE_URL}/#legalservice`,
  person: `${BASE_URL}/#person-dallila-camargo`,
  website: `${BASE_URL}/#website`,
};

export function getLegalServiceSchema() {
  return {
    "@type": "LegalService",
    "@id": SCHEMA_IDS.legalService,
    name: SITE.name,
    description:
      "Assessoria jurídica em Direito Digital para criadores de conteúdo, profissionais liberais e negócios digitais: contratos, marcas e proteção de dados.",
    url: BASE_URL,
    logo: `${BASE_URL}/logo-abelha.png`,
    image: `${BASE_URL}/logo-abelha.png`,
    email: SITE.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Redenção",
      addressRegion: "PA",
      addressCountry: "BR",
    },
    areaServed: "BR",
    knowsAbout: [
      "Direito Digital",
      "Contratos Digitais",
      "Propriedade Intelectual",
      "Recuperação de Conta Hackeada",
      "Proteção de Dados",
      "LGPD",
    ],
    founder: { "@id": SCHEMA_IDS.person },
    sameAs: [SITE.instagramUrl],
  };
}

export function getPersonSchema() {
  return {
    "@type": "Person",
    "@id": SCHEMA_IDS.person,
    name: "Dallila Camargo",
    jobTitle: "Advogada",
    description:
      "Advogada especializada em Direito Digital (OAB/PA nº 36.762), atuando em contratos digitais, propriedade intelectual e recuperação de contas comprometidas.",
    url: `${BASE_URL}/sobre`,
    worksFor: { "@id": SCHEMA_IDS.legalService },
    identifier: SITE.oab,
    sameAs: [SITE.instagramUrl],
    knowsAbout: [
      "Direito Digital",
      "Direito Tributário",
      "Direito Constitucional",
      "Propriedade Intelectual",
    ],
  };
}

export function getWebsiteSchema() {
  return {
    "@type": "WebSite",
    "@id": SCHEMA_IDS.website,
    name: SITE.name,
    url: BASE_URL,
    inLanguage: "pt-BR",
    publisher: { "@id": SCHEMA_IDS.legalService },
  };
}

export function getBreadcrumbSchema(
  items: { name: string; url: string }[],
) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function getServiceSchema(input: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    "@type": "Service",
    serviceType: input.name,
    description: input.description,
    url: input.url,
    provider: { "@id": SCHEMA_IDS.legalService },
    areaServed: "BR",
  };
}

export function getArticleSchema(input: {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  category: string;
}) {
  return {
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    mainEntityOfPage: input.url,
    url: input.url,
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    inLanguage: "pt-BR",
    isAccessibleForFree: true,
    articleSection: input.category,
    author: { "@id": SCHEMA_IDS.person },
    publisher: { "@id": SCHEMA_IDS.legalService },
  };
}

export function getFaqSchema(items: { question: string; answer: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function jsonLdGraph(nodes: object[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}
