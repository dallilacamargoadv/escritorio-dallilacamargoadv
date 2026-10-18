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
          "Análise técnica de contrato existente, incluindo as cláusulas que mais faltam: o que fazer em caso de inadimplência ou quando a relação com a marca entra em crise.",
      },
      {
        icon: "marca",
        title: "Contrato com a Cara da Sua Marca",
        description:
          "Contrato, proposta e termo formatados com a metodologia de Legal Design, nas cores e na identidade visual do seu negócio. Mais fácil de ler, mais fácil de assinar.",
      },
    ],
    steps: [
      {
        number: "01",
        title: "Conversar",
        description:
          "Você me conta como fecha parceria, o que já foi combinado e o que te preocupa. É daí que sai o contrato certo, nunca um modelo pronto.",
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
          "Devolvo o contrato explicado, não só assinado: você entende cada cláusula antes de fechar.",
      },
    ],
    attention: {
      introTitle: "Quando o problema costuma aparecer",
      introDescription:
        "Ninguém pensa no contrato enquanto tudo está bem. O problema é que, quando surge uma briga ou um desentendimento, é aí que você sente falta de uma cláusula clara, de um documento feito sob medida, ou de contrato nenhum.",
      points: [
        {
          number: "01",
          title: "Você fechou parceria só no combinado",
          description:
            "Muita parceria começa só no WhatsApp, e-mail ou mensagem direta. Enquanto dá tudo certo, parece suficiente. Na hora de um desentendimento, sem regra clara escrita, fica difícil dizer quem tinha razão.",
        },
        {
          number: "02",
          title: "O contrato não bate com o que você realmente faz",
          description:
            "Modelo pronto da internet raramente encaixa no seu jeito de trabalhar. Prazo de entrega, quem é dono do conteúdo, sigilo, forma de pagamento, como encerrar: tudo isso pode ficar de fora.",
        },
        {
          number: "03",
          title: "Não tinha combinado o que fazer se desse errado",
          description:
            "Sem uma cláusula de saída, você fica preso à parceria mesmo quando ela virou risco pra sua reputação. Combinar o \"e se der errado\" antes não é desconfiança, é proteção.",
        },
        {
          number: "04",
          title: "O conflito chegou e ninguém sabia o que fazer",
          description:
            "Sem regra combinada antes, coisa comum (atraso, cancelamento, mudança no que foi combinado) vira negociação do zero, toda vez que acontece.",
        },
        {
          number: "05",
          title: "O contrato foi feito sem um advogado olhar",
          description:
            "Ferramenta de IA ou modelo da internet ajuda a montar um rascunho, mas não substitui alguém olhando pro seu caso específico. Cada parceria tem seus detalhes, e eles importam.",
        },
      ],
    },
  },

  "registro-de-marca": {
    cards: [
      {
        icon: "protecao",
        title: "Busca de Anterioridade",
        description:
          "Pesquisa prévia no INPI pra saber se o nome ou a logo que você quer registrar já está sendo usado por outra pessoa ou empresa.",
      },
      {
        icon: "marca",
        title: "Depósito e Acompanhamento",
        description:
          "Pedido de registro no INPI na classe certa pro seu negócio, com acompanhamento de cada etapa até o deferimento.",
      },
      {
        icon: "defesa",
        title: "Oposição e Recursos",
        description:
          "Resposta a quem contesta o seu pedido de registro, ou recurso contra indeferimento do INPI.",
      },
      {
        icon: "licenciamento",
        title: "Licenciamento e Cessão",
        description:
          "Contrato pra autorizar terceiro a usar sua marca já registrada, ou pra transferir a titularidade dela.",
      },
    ],
    steps: [
      {
        number: "01",
        title: "Buscar",
        description:
          "Faço a busca de anterioridade pra confirmar se sua marca está livre antes de você investir em identidade visual e divulgação.",
      },
      {
        number: "02",
        title: "Depositar",
        description:
          "Formalizo o pedido de registro no INPI, na classe certa pro seu tipo de negócio.",
      },
      {
        number: "03",
        title: "Acompanhar",
        description:
          "Sigo o processo até o deferimento, incluindo eventual oposição de terceiro ou recurso, se precisar.",
      },
    ],
    attention: {
      introTitle: "Quando o problema costuma aparecer",
      introDescription:
        "No Brasil, a marca é de quem registra primeiro, não de quem usa primeiro. Por isso o problema quase sempre aparece depois que a marca já vale alguma coisa. E aí proteger fica mais caro e mais demorado do que seria lá no começo.",
      points: [
        {
          number: "01",
          title: "Você já está usando a marca, mas ainda não registrou",
          description:
            "Você investiu em logo, rede social e divulgação antes de checar se o nome estava livre pra registrar. Acontece o tempo todo.",
        },
        {
          number: "02",
          title: "Outra pessoa já registrou uma marca parecida",
          description:
            "Sem pesquisar antes, você só descobre tarde demais que o nome já é de outra empresa, e que ela pode te obrigar a parar de usar.",
        },
        {
          number: "03",
          title: "O registro foi deixado para depois",
          description:
            "Na maioria das vezes, a preocupação com o registro só chega quando já apareceu alguém brigando pela marca.",
        },
        {
          number: "04",
          title: "A marca ficou parada tempo demais",
          description:
            "Marca registrada que fica 5 anos sem uso pode perder a proteção. Não basta registrar uma vez e esquecer: vale acompanhar.",
        },
        {
          number: "05",
          title: "Alguém usa sua marca sem contrato assinado",
          description:
            "Deixar alguém usar sua marca só no combinado, sem contrato, dificulta cobrar, fiscalizar o uso ou voltar atrás depois.",
        },
      ],
    },
  },

  "contas-e-plataformas": {
    cards: [
      {
        icon: "bloqueio",
        title: "Marketplaces (Mercado Livre, Shopee, Amazon)",
        description:
          "Loja suspensa, saldo retido, estoque parado e conta de vendedor bloqueada: análise do caso, pedido de revisão à plataforma e, se preciso, medida judicial.",
      },
      {
        icon: "plataforma",
        title: "TikTok Shop e vendas em rede social",
        description:
          "Suspensão de loja, valores retidos e anúncios bloqueados em plataformas de venda ligadas a redes sociais.",
      },
      {
        icon: "alerta",
        title: "Desmonetização e Strikes (YouTube, TikTok, Instagram)",
        description:
          "Canal desmonetizado, strike por direito autoral, publicação removida ou alcance travado: análise do aviso e contestação junto à plataforma.",
      },
      {
        icon: "acesso",
        title: "Contas profissionais e Meta (Instagram, Facebook, WhatsApp)",
        description:
          "Conta empresarial hackeada, desativada ou restrita: do pedido administrativo à ação judicial com pedido de urgência.",
      },
      {
        icon: "defesa",
        title: "Remoção de Conteúdo e Perfil Falso",
        description:
          "Vídeo, foto ou perfil usando sua imagem, nome ou marca sem autorização: notificação à plataforma e pedido de remoção.",
      },
      {
        icon: "defesa",
        title: "Preservação de Provas",
        description:
          "Organização de prints, e-mails, notas de venda e avisos da plataforma para sustentar o pedido de revisão ou a ação.",
      },
    ],
    steps: [
      {
        number: "01",
        title: "Reunir as provas e analisar",
        description:
          "Prints, e-mails, notas de venda, avisos, reclamações, notificações e a nota de suspensão. Com isso em mãos, analisamos juntos o que você tem.",
      },
      {
        number: "02",
        title: "Pedir revisão à plataforma",
        description:
          "Pedido formal de revisão pelo canal oficial, com a sua versão dos fatos e os documentos que sustentam o caso.",
      },
      {
        number: "03",
        title: "Ir à Justiça, se for preciso",
        description:
          "Se o pedido à plataforma não resolver, avaliamos a ação, inclusive com pedido de urgência para liberar a conta ou os valores retidos.",
      },
    ],
    attention: {
      introTitle: "Quando o problema costuma aparecer",
      introDescription:
        "Pra muita gente, a conta é o negócio: a loja no marketplace, o canal que paga as contas, o perfil que traz o cliente. Quando ela trava, o prejuízo passa longe da tela: vai direto pro caixa e pra rotina.",
      points: [
        {
          number: "01",
          title: "A loja foi suspensa",
          description:
            "Cada dia sem vender é faturamento que não volta, e os recursos das plataformas têm prazos próprios.",
        },
        {
          number: "02",
          title: "O dinheiro das vendas ficou retido",
          description:
            "Valor retido atrasa fornecedor, frete e conta a pagar. O primeiro passo é entender o que a plataforma alegou.",
        },
        {
          number: "03",
          title: "O estoque ficou parado",
          description:
            "Produto preso no centro de distribuição da plataforma é dinheiro parado, e cada caso pede uma estratégia.",
        },
        {
          number: "04",
          title: "O canal perdeu a monetização",
          description:
            "A renda do criador some de uma hora pra outra, e o aviso quase nunca explica bem o motivo.",
        },
        {
          number: "05",
          title: "Você não guardou as provas",
          description:
            "Print, e-mail, nota de venda, aviso e nota de suspensão contam a história. Sem eles, fica mais difícil provar e agir.",
        },
        {
          number: "06",
          title: "A conta foi hackeada",
          description:
            "Perder o acesso pode parar o trabalho de vez e cortar o contato com quem já é seu cliente.",
        },
      ],
    },
  },

  assessoria: {
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
          "Defino com você o que precisa de atenção primeiro (clearance de conteúdo, LGPD, tributário) sem empurrar tudo de uma vez.",
      },
      {
        number: "03",
        title: "Acompanhar de perto",
        description:
          "Fico disponível para revisar contrato, resolver dúvida e checar campanha antes de ir ao ar, todo mês.",
      },
    ],
    attention: {
      introTitle: "Quando o problema costuma aparecer",
      introDescription:
        "Negócio que cresce também cresce em responsabilidade jurídica. Antecipar isso é o que te deixa decidir as coisas importantes com a cabeça no lugar, em vez de correr atrás do prejuízo.",
      points: [
        {
          number: "01",
          title: "O negócio cresceu sem estrutura jurídica",
          description:
            "Faturamento, equipe e contrato aumentam mais rápido do que a parte jurídica e fiscal consegue acompanhar.",
        },
        {
          number: "02",
          title: "Projeto novo entrou no ar sem checar antes",
          description:
            "Campanha, parceria ou produto novo vai ao ar sem checar direito autoral, direito de imagem ou marca envolvidos, e o risco só aparece depois.",
        },
        {
          number: "03",
          title: "Os dados dos seus clientes cresceram sem adequação",
          description:
            "Você coleta e usa mais dado de cliente à medida que o negócio cresce, mas a adequação à LGPD sempre fica pra depois.",
        },
        {
          number: "04",
          title: "A tecnologia mudou mais rápido que os processos",
          description:
            "Ferramenta nova e forma nova de vender chegam antes de você parar pra pensar no risco jurídico que elas trazem.",
        },
        {
          number: "05",
          title: "As decisões ficaram grandes demais pra resolver sozinho",
          description:
            "Quando o negócio cresce, resolver cada problema isolado não é mais suficiente. Ter alguém acompanhando todo mês evita que você viva apagando incêndio.",
        },
      ],
    },
  },

  "alvara-mirim": {
    cards: [
      {
        icon: "protecao",
        title: "Alvará para Atividade Contínua",
        description:
          "Autorização judicial para canal ou perfil infantil já em funcionamento, com monetização e parcerias recorrentes.",
      },
      {
        icon: "defesa",
        title: "Alvará para Campanha Específica",
        description:
          "Autorização pontual para uma ação isolada, como lançamento de produto ou uma publicidade única.",
      },
      {
        icon: "moeda",
        title: "Conta Vinculada e Prestação de Contas",
        description:
          "Estruturação da conta em nome da criança sob custódia judicial, com repasse de valores conforme determinado pelo juízo.",
      },
      {
        icon: "prazo",
        title: "Renovação e Acompanhamento",
        description:
          "Acompanhamento da validade do alvará (normalmente 12 meses) e pedido de renovação enquanto os requisitos continuarem preenchidos.",
      },
    ],
    steps: [
      {
        number: "01",
        title: "Conversar",
        description:
          "Você me conta como funciona a atividade da criança: plataformas, frequência, se já monetiza e se algum documento já está pronto.",
      },
      {
        number: "02",
        title: "Reunir e peticionar",
        description:
          "Organizo a documentação (matrícula escolar, laudo psicológico, anuência dos responsáveis) e protocolo o pedido na Vara da Infância e Juventude.",
      },
      {
        number: "03",
        title: "Acompanhar",
        description:
          "Sigo o processo até a concessão do alvará, incluindo pedido de tutela de urgência quando a monetização já estiver em risco.",
      },
    ],
    attention: {
      introTitle: "Quando o problema costuma aparecer",
      introDescription:
        "Desde 16 de junho de 2026, as plataformas já podem exigir o alvará judicial para manter a monetização ativa de conta de influenciador mirim. Sem ele, o risco deixou de ser teórico.",
      points: [
        {
          number: "01",
          title: "A conta já monetiza, mas ninguém formalizou o alvará",
          description:
            "É o cenário mais comum: o canal já fatura ou já fecha publicidade, mas a autorização judicial que a lei passou a exigir ainda não existe.",
        },
        {
          number: "02",
          title: "A plataforma já notificou pedindo o documento",
          description:
            "Depois da notificação, o prazo pra apresentar o alvará corre rápido. Regularizar antes da notificação chegar evita correr contra o relógio.",
        },
        {
          number: "03",
          title: "Não existe conta bancária vinculada em nome da criança",
          description:
            "O juízo costuma exigir que os valores da monetização fiquem centralizados numa conta sob custódia judicial, não na conta dos pais.",
        },
        {
          number: "04",
          title: "Falta documentação escolar e psicológica atualizada",
          description:
            "Declaração de frequência escolar e laudo psicológico recente fazem parte do pedido. Sem eles, o processo demora mais ou pode ser indeferido.",
        },
        {
          number: "05",
          title: "A atividade cresceu e ninguém pediu autorização a tempo",
          description:
            "Quando o canal começa pequeno, o alvará fica esquecido. O problema aparece quando a audiência e a monetização já são relevantes.",
        },
      ],
    },
  },
};
