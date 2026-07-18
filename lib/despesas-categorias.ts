export const CATEGORIAS_DESPESA = {
  pessoas_equipe: {
    label: "Pessoas e equipe",
    subcategorias: [
      "Salários",
      "Pró-labore",
      "Freelancers",
      "Prestadores de serviço",
      "Comissões",
      "Bônus",
      "Benefícios",
    ],
  },
  marketing_vendas: {
    label: "Marketing e vendas",
    subcategorias: [
      "Tráfego pago",
      "Agência",
      "Designer",
      "Social media",
      "Copywriter",
      "Ferramentas de marketing",
      "Produção audiovisual",
      "Eventos",
      "Landing pages",
    ],
  },
  tecnologia_sistemas: {
    label: "Tecnologia e sistemas",
    subcategorias: [
      "Supabase",
      "Vercel",
      "Cloudflare",
      "Google Workspace",
      "CRM",
      "Automação",
      "IA",
      "Assinaturas SaaS",
      "Hospedagem",
      "Domínios",
    ],
  },
  operacional: {
    label: "Operacional",
    subcategorias: [
      "Custas processuais",
      "Diligências",
      "Protocolos",
      "Cartório",
      "Correios",
      "Certidões",
      "Deslocamentos",
    ],
  },
  administrativo: {
    label: "Administrativo",
    subcategorias: [
      "Material de escritório",
      "Bancos",
      "Taxas administrativas",
      "Serviços gerais",
      "Assinaturas administrativas",
    ],
  },
  juridico_tecnico: {
    label: "Jurídico técnico",
    subcategorias: [
      "Correspondentes",
      "Pareceres",
      "Perícias",
      "Consultores externos",
      "Pesquisas jurídicas",
      "Softwares jurídicos",
    ],
  },
  tributos_contabilidade: {
    label: "Tributos e contabilidade",
    subcategorias: [
      "Contabilidade",
      "Impostos",
      "Taxas fiscais",
      "Certificados digitais",
      "Emissão de nota fiscal",
    ],
  },
  infraestrutura: {
    label: "Infraestrutura",
    subcategorias: [
      "Aluguel",
      "Condomínio",
      "Energia",
      "Internet",
      "Móveis",
      "Equipamentos",
      "Manutenção",
    ],
  },
  educacao_desenvolvimento: {
    label: "Educação e desenvolvimento",
    subcategorias: ["Cursos", "Livros", "Mentorias", "Eventos", "Treinamentos", "Certificações"],
  },
  financeiro: {
    label: "Financeiro",
    subcategorias: ["Juros", "Multas", "Tarifas bancárias", "Taxas de cartão", "Antecipações", "Empréstimos"],
  },
  outros: {
    label: "Outros",
    subcategorias: ["Despesa avulsa", "Reembolso", "Ajuste manual"],
  },
} as const;

export type CategoriaDespesaKey = keyof typeof CATEGORIAS_DESPESA;

export const CATEGORIA_DESPESA_LABELS: Record<CategoriaDespesaKey, string> = Object.fromEntries(
  Object.entries(CATEGORIAS_DESPESA).map(([key, value]) => [key, value.label]),
) as Record<CategoriaDespesaKey, string>;

export function subcategoriasDaCategoria(categoria: string): readonly string[] {
  return CATEGORIAS_DESPESA[categoria as CategoriaDespesaKey]?.subcategorias ?? [];
}

export const CENTROS_CUSTO = [
  "Escritório",
  "Marketing",
  "Comercial",
  "Operação jurídica",
  "Administrativo",
  "Tecnologia",
  "Outro",
] as const;

export const FORMAS_PAGAMENTO = [
  "Pix",
  "Cartão",
  "Boleto",
  "Transferência",
  "Débito automático",
  "Dinheiro",
  "Outro",
] as const;
