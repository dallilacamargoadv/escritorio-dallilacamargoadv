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
        icon: "contrato",
        title: "Contratos de Prestação",
        description:
          "Elaboração e revisão de contratos para prestadores de serviços, profissionais autônomos e negócios digitais.",
      },
      {
        icon: "parceria",
        title: "Parcerias Comerciais",
        description:
          "Instrumentos jurídicos para colaborações, coproduções, patrocínios e demais relações negociais.",
      },
      {
        icon: "digital",
        title: "Influenciadores Digitais",
        description:
          "Contratos para campanhas publicitárias, publicidade, licenciamento de imagem e produção de conteúdo.",
      },
      {
        icon: "processo",
        title: "Revisão Contratual",
        description:
          "Análise técnica de contratos existentes para identificar riscos, inconsistências e oportunidades de aprimoramento.",
      },
    ],
    steps: [
      {
        number: "01",
        title: "Compreender",
        description:
          "Conhecemos seu negócio, sua forma de atuação e os objetivos da contratação para identificar riscos, responsabilidades e as necessidades jurídicas da relação.",
      },
      {
        number: "02",
        title: "Estruturar",
        description:
          "Elaboramos ou revisamos os instrumentos contratuais de forma personalizada, alinhando cláusulas, direitos, deveres e mecanismos de proteção à realidade do seu negócio.",
      },
      {
        number: "03",
        title: "Orientação e acompanhamento",
        description:
          "Apresentamos o contrato, esclarecemos eventuais dúvidas e fornecemos as orientações necessárias para uma utilização segura do instrumento jurídico.",
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
          title: "As cláusulas existiam, mas não protegiam",
          description:
            "Uma cláusula mal estruturada pode gerar falsa sensação de segurança. Não basta que ela exista; é necessário que seja compatível com a legislação e com a realidade da contratação.",
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
    ],
    steps: [
      {
        number: "01",
        title: "Compreender",
        description:
          "Compreendemos o ativo intelectual a ser protegido, avaliando sua finalidade, utilização e os aspectos jurídicos envolvidos.",
      },
      {
        number: "02",
        title: "Estruturar",
        description:
          "Definimos a estratégia adequada para o caso, realizando os procedimentos necessários à proteção da marca, dos direitos autorais ou de outros ativos intelectuais.",
      },
      {
        number: "03",
        title: "Orientação e acompanhamento",
        description:
          "Acompanhamos as etapas do procedimento e prestamos orientações para a gestão e utilização adequada dos direitos protegidos.",
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
        title: "Conta Comprometida",
        description:
          "Atuação jurídica em casos de invasão, acesso indevido e comprometimento de contas em plataformas digitais.",
      },
      {
        icon: "bloqueio",
        title: "Conta Bloqueada / Suspensa",
        description:
          "Assessoria em situações de suspensão, bloqueio ou restrição de acesso por plataformas digitais.",
      },
      {
        icon: "alerta",
        title: "Strikes e Restrições",
        description:
          "Orientação em casos de remoção de publicações, limitação de alcance ou avisos de violação de termos.",
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
        title: "Compreender",
        description:
          "Analisamos o ocorrido, reunimos as informações essenciais e identificamos as medidas jurídicas compatíveis com a situação apresentada.",
      },
      {
        number: "02",
        title: "Estruturar",
        description:
          "Avaliamos as providências cabíveis perante a plataforma e, quando necessário, as medidas extrajudiciais ou judiciais aplicáveis ao caso.",
      },
      {
        number: "03",
        title: "Orientação e acompanhamento",
        description:
          "Conduzimos a atuação jurídica mantendo o cliente informado sobre as etapas do procedimento e os próximos desdobramentos.",
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
        title: "Uso Indevido de Identidade",
        description:
          "Atuação em casos de perfis falsos e utilização não autorizada de informações e imagem.",
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
        title: "Compreender",
        description:
          "Analisamos os fatos, identificamos a dinâmica da fraude e orientamos sobre a preservação das informações relevantes.",
      },
      {
        number: "02",
        title: "Estruturar",
        description:
          "Reunimos e analisamos os elementos necessários para fundamentar as medidas jurídicas cabíveis.",
      },
      {
        number: "03",
        title: "Orientação e acompanhamento",
        description:
          "Adotamos as providências adequadas ao caso, sempre observando as circunstâncias concretas e a estratégia definida.",
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
        title: "Relações Digitais",
        description:
          "Orientação sobre relações contratuais e jurídicas construídas no ambiente digital.",
      },
      {
        icon: "estrategia",
        title: "Orientação Preventiva",
        description:
          "Apoio jurídico para identificar riscos e oportunidades antes que se tornem conflitos.",
      },
      {
        icon: "processo",
        title: "Desafios da Tecnologia",
        description:
          "Acompanhamento jurídico contínuo diante das constantes transformações tecnológicas.",
      },
    ],
    steps: [
      {
        number: "01",
        title: "Compreender",
        description:
          "Compreendemos sua atividade, seus objetivos e os desafios jurídicos relacionados ao ambiente digital.",
      },
      {
        number: "02",
        title: "Estruturar",
        description:
          "Identificamos riscos, oportunidades e definimos as orientações jurídicas mais adequadas às necessidades do seu negócio.",
      },
      {
        number: "03",
        title: "Orientação e acompanhamento contínuo",
        description:
          "Prestamos suporte jurídico para que decisões importantes sejam tomadas com clareza, responsabilidade e alinhamento às constantes transformações do ambiente digital.",
      },
    ],
    attention: {
      introTitle: "Quando os problemas costumam começar",
      introDescription:
        "O crescimento de um negócio costuma trazer novas responsabilidades jurídicas. Antecipar essas questões permite que decisões importantes sejam tomadas com maior clareza.",
      points: [
        { number: "01", title: "O negócio cresceu sem estrutura jurídica" },
        { number: "02", title: "Novos projetos começaram sem análise preventiva" },
        { number: "03", title: "O tratamento de dados evoluiu sem adequação" },
        { number: "04", title: "A tecnologia mudou mais rápido que os processos" },
        {
          number: "05",
          title: "As decisões passaram a exigir suporte jurídico contínuo",
        },
      ],
    },
  },
};
