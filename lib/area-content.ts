import type { ScrollStep } from "@/components/ThreeStepsScroll";
import type { AttentionPoint } from "@/components/PointsOfAttention";
import type { IconName } from "@/components/ui/Icon";

export interface AreaSubCard {
  icon: IconName;
  title: string;
  description: string;
}

export interface AreaContent {
  cards: AreaSubCard[];
  steps: ScrollStep[];
  attention: {
    introTitle: string;
    introDescription: string;
    points: AttentionPoint[];
  };
}

export const AREA_CONTENT: Record<string, AreaContent> = {
  contratos: {
    cards: [
      {
        icon: "moeda",
        title: "Contratos de Monetização",
        description:
          "Patrocínio, agenciamento, endorsement e parceria (collab, publipost, presença VIP), cada um com a lógica de remuneração e risco específica do modelo.",
      },
      {
        icon: "dados",
        title: "Confidencialidade e Publicidade",
        description:
          "NDA e contratos de publicidade, com atenção às regras do CONAR sobre publi e conteúdo patrocinado.",
      },
      {
        icon: "licenciamento",
        title: "Licenciamento e Coprodução",
        description:
          "Licenciamento de imagem e direitos de personalidade, contratos de coprodução e compartilhamento de base de leads, com atenção à LGPD.",
      },
      {
        icon: "protecao",
        title: "Revisão Contratual",
        description:
          "Análise técnica de contrato existente, incluindo as cláusulas que mais faltam: o que fazer em caso de inadimplência ou quando a marca — ou você — entra em crise.",
      },
    ],
    steps: [
      {
        number: "01",
        title: "Conversar",
        description:
          "Você me conta como fecha parceria, o que já foi combinado e o que te preocupa — é daí que sai o contrato certo, nunca um modelo pronto.",
      },
      {
        number: "02",
        title: "Redigir ou revisar",
        description:
          "Elaboro ou reviso o contrato cláusula por cláusula, incluindo o que quase sempre falta: o que fazer se a relação der errado.",
      },
      {
        number: "03",
        title: "Traduzir",
        description:
          "Devolvo o contrato explicado, não só assinado — você entende cada cláusula antes de fechar.",
      },
    ],
    attention: {
      introTitle: "Quando os problemas costumam começar",
      introDescription:
        "O contrato raramente é lembrado quando tudo está funcionando. Na maioria das vezes, ele só ganha atenção quando surge um impasse. É nesse momento que cláusulas ausentes, documentos genéricos ou acordos informais passam a impactar diretamente a relação entre as partes.",
      points: [
        {
          number: "01",
          title: "A parceria começou sem um contrato adequado",
          description:
            "Muitas relações comerciais começam apenas com conversas por WhatsApp, e-mails ou mensagens diretas. Enquanto existe confiança, isso costuma parecer suficiente. Quando surgem divergências, porém, a ausência de regras claras dificulta a definição dos direitos e deveres de cada parte.",
        },
        {
          number: "02",
          title: "O contrato não acompanhava a realidade do negócio",
          description:
            "Modelos prontos nem sempre refletem a forma como cada profissional trabalha. Questões como entregas, propriedade intelectual, confidencialidade, pagamentos ou encerramento da relação podem ficar sem previsão adequada.",
        },
        {
          number: "03",
          title: "Não existia saída se a marca — ou você — entrasse em crise",
          description:
            "Contrato de parceria sem cláusula de segurança prende as duas partes uma à outra mesmo quando continuar junto vira risco de reputação. Prever a saída antes que ela seja necessária é parte da proteção, não desconfiança.",
        },
        {
          number: "04",
          title: "O conflito começou e ninguém sabia como proceder",
          description:
            "Sem regras previamente definidas, situações comuns — como atrasos, cancelamentos, alterações de escopo ou descumprimento de obrigações — passam a depender exclusivamente de negociação entre as partes.",
        },
        {
          number: "05",
          title: "O contrato foi produzido sem revisão jurídica",
          description:
            "Ferramentas tecnológicas podem auxiliar na elaboração de documentos, mas não substituem a análise jurídica individualizada. Cada relação possui características próprias, que exigem adequação técnica ao caso concreto.",
        },
      ],
    },
  },

  "propriedade-intelectual": {
    cards: [
      {
        icon: "marca",
        title: "Registro de Marca",
        description:
          "Assessoria em todas as etapas do registro de marca perante o INPI, desde a análise inicial até o acompanhamento do processo.",
      },
      {
        icon: "autoral",
        title: "Direitos Autorais",
        description:
          "Orientação sobre proteção de obras intelectuais, conteúdos digitais, materiais criativos e demais criações protegidas por lei.",
      },
      {
        icon: "licenciamento",
        title: "Licenciamento de Marca",
        description:
          "Elaboração e revisão de contratos para licenciamento, cessão e autorização de uso de marcas e outros ativos intelectuais.",
      },
      {
        icon: "defesa",
        title: "Defesa de Ativos",
        description:
          "Atuação em conflitos envolvendo uso indevido de marcas, conteúdos e outros direitos de propriedade intelectual, nas esferas cabíveis.",
      },
      {
        icon: "protecao",
        title: "Clearance de Conteúdo",
        description:
          "Análise preventiva de campanhas e conteúdo antes de ir ao ar, verificando direitos autorais, de imagem e de marca envolvidos.",
      },
    ],
    steps: [
      {
        number: "01",
        title: "Entender seu caso",
        description:
          "Você me conta o que precisa proteger — marca, conteúdo ou outra criação — e eu identifico o melhor caminho jurídico.",
      },
      {
        number: "02",
        title: "Agir",
        description:
          "Faço o que for necessário: registro no INPI, contrato de licenciamento, ou a medida certa para a sua situação.",
      },
      {
        number: "03",
        title: "Acompanhar",
        description:
          "Sigo com você até o fim, explicando cada etapa no caminho.",
      },
    ],
    attention: {
      introTitle: "Quando os problemas costumam começar",
      introDescription:
        "Marcas, conteúdos e ativos intelectuais costumam ganhar valor antes mesmo de receber proteção jurídica. Muitas vezes, o problema só aparece quando outra pessoa utiliza aquilo que levou tempo e investimento para ser construído.",
      points: [
        {
          number: "01",
          title: "A marca começou a ser utilizada antes da proteção",
          description:
            "Investimentos em identidade visual, redes sociais e divulgação são realizados antes mesmo da verificação sobre a disponibilidade da marca.",
        },
        {
          number: "02",
          title: "O conteúdo foi utilizado por terceiros",
          description:
            "Fotos, vídeos, textos e materiais criativos podem circular rapidamente no ambiente digital, tornando importante compreender os direitos envolvidos em cada situação.",
        },
        {
          number: "03",
          title: "A autoria nunca foi definida",
          description:
            "Parcerias e produções em conjunto nem sempre deixam claro quem é titular dos direitos sobre a criação.",
        },
        {
          number: "04",
          title: "O registro foi deixado para depois",
          description:
            "Em alguns casos, a preocupação com a proteção jurídica surge somente quando já existe conflito envolvendo a marca.",
        },
        {
          number: "05",
          title: "O ativo intelectual passou a ter valor sem estratégia de proteção",
          description:
            "À medida que o negócio cresce, seus ativos também ganham relevância econômica e merecem acompanhamento jurídico compatível.",
        },
      ],
    },
  },

  "contas-e-plataformas": {
    cards: [
      {
        icon: "acesso",
        title: "Meta (Instagram, Facebook, WhatsApp)",
        description:
          "Atuação em conta hackeada, desativada ou com restrição/shadowban — do pedido administrativo à ação judicial com tutela de urgência.",
      },
      {
        icon: "bloqueio",
        title: "Marketplaces (Mercado Livre, Shopee e outros)",
        description:
          "Bloqueio ou suspensão de conta vendedora, retenção de valores e desbloqueio de operação em plataformas de venda.",
      },
      {
        icon: "alerta",
        title: "Perfil Falso / Fake",
        description:
          "Identificação e remoção de perfil falso, clonagem de identidade ou uso indevido de nome e imagem em conta de terceiro.",
      },
      {
        icon: "bloqueio",
        title: "Strikes e Restrições (YouTube, Instagram, TikTok)",
        description:
          "Orientação e defesa em casos de strike por direito autoral, remoção de publicação, limitação de alcance ou aviso de violação de diretrizes.",
      },
      {
        icon: "defesa",
        title: "Preservação de Provas",
        description:
          "Organização e análise de evidências digitais para subsidiar medidas extrajudiciais ou judiciais, quando cabíveis.",
      },
    ],
    steps: [
      {
        number: "01",
        title: "Diagnosticar",
        description:
          "Análise da situação — conta hackeada, bloqueada ou com strike — para identificar o caminho jurídico adequado.",
      },
      {
        number: "02",
        title: "Agir junto à plataforma e, se necessário, na Justiça",
        description:
          "Encaminhamento do pedido administrativo e, quando cabível, da medida judicial correspondente.",
      },
      {
        number: "03",
        title: "Acompanhar até a resolução",
        description:
          "Acompanhamento do caso até sua resolução, com atualização periódica ao cliente.",
      },
    ],
    attention: {
      introTitle: "Quando os problemas costumam começar",
      introDescription:
        "A presença digital tornou-se parte da atividade profissional de muitas pessoas. Quando uma conta é comprometida ou sofre restrições, as consequências podem ultrapassar o ambiente virtual.",
      points: [
        {
          number: "01",
          title: "A conta foi comprometida",
          description:
            "A perda de acesso pode interromper atividades profissionais e dificultar a comunicação com clientes.",
        },
        {
          number: "02",
          title: "O perfil foi bloqueado",
          description:
            "Suspensões e restrições podem ocorrer por diferentes motivos, exigindo análise individual de cada situação.",
        },
        {
          number: "03",
          title: "O conteúdo recebeu restrições",
          description:
            "Strikes, remoções e limitações de alcance podem gerar dúvidas sobre as medidas disponíveis em cada caso.",
        },
        {
          number: "04",
          title: "As provas não foram preservadas",
          description:
            "Registros e evidências costumam ser importantes para compreender o ocorrido e avaliar as providências cabíveis.",
        },
        {
          number: "05",
          title: "O problema afetou o negócio",
          description:
            "Quando a atividade profissional depende da plataforma, qualquer interrupção pode repercutir em contratos, clientes e operações.",
        },
      ],
    },
  },

  "golpes-virtuais": {
    cards: [
      {
        icon: "alerta",
        title: "Golpe do PIX / Phishing",
        description:
          "Atuação em casos de fraude em pagamento via PIX, links maliciosos e engenharia social aplicada por golpistas.",
      },
      {
        icon: "moeda",
        title: "Fraude em Negociações",
        description:
          "Orientação jurídica em golpes envolvendo pagamentos, vendas ou prestação de serviços.",
      },
      {
        icon: "acesso",
        title: "Conta Utilizada por Terceiros",
        description:
          "Medidas jurídicas para contas utilizadas indevidamente na aplicação de golpes.",
      },
      {
        icon: "defesa",
        title: "Preservação de Provas",
        description:
          "Organização e análise de evidências digitais para subsidiar medidas extrajudiciais ou judiciais.",
      },
    ],
    steps: [
      {
        number: "01",
        title: "Levantar os fatos",
        description:
          "Reconstrução dos fatos e orientação sobre preservação de prova desde o primeiro contato.",
      },
      {
        number: "02",
        title: "Reunir as provas",
        description:
          "Organização de prints, comprovantes e registros de forma a sustentar a medida cabível.",
      },
      {
        number: "03",
        title: "Buscar reparação",
        description:
          "Adoção da medida cabível — notificação, ação judicial ou outra via — buscando a reparação do prejuízo.",
      },
    ],
    attention: {
      introTitle: "Quando os problemas costumam começar",
      introDescription:
        "A evolução da tecnologia também trouxe novas formas de fraude. Muitas delas exploram a confiança, a rapidez das comunicações e o uso cotidiano das plataformas digitais.",
      points: [
        {
          number: "01",
          title: "A identidade foi utilizada indevidamente",
          description:
            "Perfis falsos e utilização não autorizada de informações podem gerar impactos para pessoas e negócios.",
        },
        {
          number: "02",
          title: "Houve fraude em negociações",
          description:
            "Golpes envolvendo pagamentos, vendas ou prestação de serviços exigem análise cuidadosa das circunstâncias.",
        },
        {
          number: "03",
          title: "A conta foi utilizada por terceiros",
          description:
            "Após um acesso indevido, contas podem ser utilizadas para aplicação de golpes ou outras condutas ilícitas.",
        },
        {
          number: "04",
          title: "As evidências se perderam",
          description:
            "A ausência de registros pode dificultar a compreensão dos fatos e das medidas disponíveis.",
        },
        {
          number: "05",
          title: "O incidente gerou outros impactos",
          description:
            "Além do prejuízo imediato, fraudes digitais podem afetar reputação, relações comerciais e confiança dos clientes.",
        },
      ],
    },
  },

  "assessoria-estrategica": {
    cards: [
      {
        icon: "dados",
        title: "Proteção de Dados e LGPD",
        description:
          "Orientação jurídica para adequação às exigências da Lei Geral de Proteção de Dados.",
      },
      {
        icon: "digital",
        title: "Assessoria Mensal 360°",
        description:
          "Acompanhamento contínuo com clearance de conteúdo, revisão de contrato e monitoramento, em planos por camada.",
      },
      {
        icon: "alerta",
        title: "Adequação de Publicidade (CONAR)",
        description:
          "Revisão de peças publicitárias, publi e conteúdo patrocinado à luz das regras do Código Brasileiro de Autorregulamentação Publicitária.",
      },
      {
        icon: "estrategia",
        title: "Orientação Preventiva",
        description:
          "Apoio jurídico para identificar riscos e oportunidades antes que se tornem conflitos.",
      },
      {
        icon: "moeda",
        title: "Estruturação Tributária",
        description:
          "Diagnóstico de formalização, análise de repasses de agenciamento e estruturação fiscal para quem vive do digital.",
      },
    ],
    steps: [
      {
        number: "01",
        title: "Entender seu negócio",
        description:
          "Conheço sua rotina, seu faturamento e onde a estrutura jurídica ainda não acompanhou o crescimento.",
      },
      {
        number: "02",
        title: "Montar o plano certo",
        description:
          "Defino com você o que precisa de atenção primeiro — clearance de conteúdo, LGPD, tributário — sem empurrar tudo de uma vez.",
      },
      {
        number: "03",
        title: "Acompanhar de perto",
        description:
          "Fico disponível para revisar contrato, resolver dúvida e checar campanha antes de ir ao ar, todo mês.",
      },
    ],
    attention: {
      introTitle: "Quando os problemas costumam começar",
      introDescription:
        "O crescimento de um negócio costuma trazer novas responsabilidades jurídicas. Antecipar essas questões permite que decisões importantes sejam tomadas com maior clareza.",
      points: [
        {
          number: "01",
          title: "O negócio cresceu sem estrutura jurídica",
          description:
            "Faturamento, equipe e volume de contratos aumentam mais rápido do que a formalização jurídica e tributária que os acompanha.",
        },
        {
          number: "02",
          title: "Novos projetos começaram sem análise preventiva",
          description:
            "Uma campanha, parceria ou linha de produto nova entra no ar sem checar direitos autorais, de imagem ou de marca envolvidos.",
        },
        {
          number: "03",
          title: "O tratamento de dados evoluiu sem adequação",
          description:
            "Coleta e uso de dados de clientes crescem junto com o negócio, mas a adequação à LGPD costuma ficar pra depois.",
        },
        {
          number: "04",
          title: "A tecnologia mudou mais rápido que os processos",
          description:
            "Novas ferramentas e formas de vender surgem antes de qualquer revisão sobre os riscos jurídicos que elas trazem.",
        },
        {
          number: "05",
          title: "As decisões passaram a exigir suporte jurídico contínuo",
          description:
            "Quando o negócio já não cabe mais em decisões pontuais, acompanhamento mensal substitui apagar incêndio um por um.",
        },
      ],
    },
  },
};
