import type { FaqItem } from "@/components/ui/FaqAccordion";

/**
 * Perguntas frequentes por área, na pergunta real que alguém digita no Google
 * — não na linguagem jurídica. Alimenta o bloco de FAQ da página e o
 * schema.org FAQPage (getFaqSchema em lib/schema.ts) da mesma página.
 * Chave = slug da área em SERVICE_AREAS (lib/site-data.ts).
 */
export const FAQ_CONTENT: Record<string, FaqItem[]> = {
  "contas-e-plataformas": [
    {
      question:
        "Minha conta de vendedor no Mercado Livre ou na Shopee foi suspensa. É possível reverter?",
      answer:
        "Depende do motivo alegado e das provas que você tem. O primeiro passo é entender o que a plataforma disse e reunir o que mostra o seu histórico de vendas. Com isso, avaliamos o pedido de revisão e, se não resolver, se cabe medida judicial. Não dá para prometer resultado: cada caso é analisado individualmente.",
    },
    {
      question: "Como um advogado pode ajudar a recuperar uma conta suspensa em marketplace?",
      answer:
        "Organizando as provas, analisando o motivo alegado, conduzindo o pedido de revisão de forma formal e, quando necessário, ingressando com ação, inclusive com pedido de urgência para liberar a conta ou valores retidos.",
    },
    {
      question: "O dinheiro das minhas vendas ficou retido. O que eu faço?",
      answer:
        "Guarde extratos, notas de venda, mensagens e avisos da plataforma: eles mostram quanto foi retido e por quê. Com esses documentos é possível avaliar o pedido administrativo e, se for o caso, a via judicial.",
    },
    {
      question: "A conta da minha loja no TikTok Shop foi suspensa. O caminho é o mesmo?",
      answer:
        "O caminho é parecido (provas, revisão à plataforma e, se preciso, Justiça), mas cada plataforma tem regras e prazos próprios de recurso. Por isso o primeiro passo é ler o aviso que você recebeu e anotar as datas.",
    },
    {
      question: "Meu canal foi desmonetizado no YouTube. Posso contestar?",
      answer:
        "Em geral a plataforma oferece um pedido de revisão. Guarde o aviso, as datas e os vídeos citados, porque isso sustenta a contestação. Analisamos se o motivo alegado procede e se cabe alguma medida além do recurso interno.",
    },
    {
      question: "Como recuperar a conta empresarial do Instagram ou do WhatsApp Business?",
      answer:
        "Comece reunindo provas de que a conta é sua e de que ela é usada no negócio (CNPJ, notas, anúncios, histórico). Conduzimos o pedido formal à plataforma e, quando ele não resolve, avaliamos a medida judicial cabível.",
    },
    {
      question: "Minha conta do Instagram foi hackeada ou banida. Um advogado consegue recuperar?",
      answer:
        "Podemos atuar na recuperação: pedido formal à plataforma e, quando ele não é suficiente, medida judicial. Quanto antes você agir, melhor, mas o resultado depende do caso e não existe garantia.",
    },
    {
      question: "Quanto um advogado cobra para esse tipo de caso?",
      answer:
        "Os honorários dependem da complexidade do caso e são combinados por escrito, depois de analisarmos a sua situação. Por isso a conversa começa pelo relato do que aconteceu.",
    },
    {
      question: "Que provas eu devo guardar antes de falar com um advogado?",
      answer:
        "Prints da conta e das mensagens da plataforma, e-mails, notas de venda, avisos, reclamações que você fez, notificações recebidas e a nota de suspensão. Não apague nada, mesmo que pareça sem importância.",
    },
    {
      question: "Recebi um strike no YouTube ou Instagram. Isso pode tirar minha conta do ar?",
      answer:
        "Pode, dependendo do histórico e da gravidade. Analisamos se o strike é procedente e, quando não é, conduzimos a contestação junto à plataforma antes que ele vire uma restrição maior.",
    },
  ],

  contratos: [
    {
      question: "Preciso de contrato pra fazer publi com uma marca?",
      answer:
        "Precisa, mesmo que a marca não peça. Sem contrato, não existe combinado formal sobre prazo de entrega, uso da imagem depois da campanha, exclusividade ou o que acontece se a marca atrasar o pagamento.",
    },
    {
      question: "Qual a diferença entre contrato de publicidade e termo de uso?",
      answer:
        "O contrato de publicidade regula a relação entre você e quem te contrata (marca, agência, patrocinador). O termo de uso regula a relação entre você e quem consome o seu produto ou serviço: cliente, aluno, seguidor.",
    },
    {
      question: "Vocês revisam um contrato que a agência já mandou pronto?",
      answer:
        "Sim, é um dos pedidos mais comuns. Reviso cláusula por cláusula e destaco o que está desequilibrado ou faltando, principalmente o que fazer se a relação der errado, que é o que os modelos prontos quase sempre deixam de fora.",
    },
    {
      question: "Fechei parceria só por WhatsApp. Ainda dá pra formalizar um contrato?",
      answer:
        "Dá, e vale a pena fazer isso o quanto antes, mesmo depois de já ter começado a trabalhar. O contrato pode incorporar o que já foi combinado por mensagem e passar a valer daí pra frente.",
    },
  ],

  "registro-de-marca": [
    {
      question: "Quanto custa registrar uma marca em 2026?",
      answer:
        "O valor tem duas partes: as taxas do INPI (que variam por classe e podem ter desconto para MEI/ME/EPP) e os honorários do acompanhamento jurídico. Te passo o valor exato depois de saber em quantas classes sua marca precisa ser registrada.",
    },
    {
      question: "Quanto tempo demora o registro de marca no INPI?",
      answer:
        "Em média, entre 12 e 24 meses até o deferimento, se não houver oposição de terceiros. É um processo com etapas e prazos fixados pelo próprio INPI: não dá pra acelerar por fora, mas dá pra evitar atraso por erro no pedido.",
    },
    {
      question: "Alguém pode registrar minha marca antes de mim?",
      answer:
        "Pode, sim: no Brasil vale quem registra primeiro, não quem usa primeiro. Por isso a busca de anterioridade antes do depósito é essencial: ela mostra se sua marca está livre antes de você investir em identidade visual e divulgação.",
    },
    {
      question: "Preciso ter empresa aberta pra registrar uma marca?",
      answer:
        "Não necessariamente: pessoa física também pode requerer, desde que exerça a atividade relacionada à marca. Mas ter CNPJ costuma facilitar o enquadramento e simplifica o registro quando o negócio já está formalizado.",
    },
  ],

  assessoria: [
    {
      question: "O que está incluso na assessoria mensal?",
      answer:
        "Varia conforme o plano, mas o núcleo é: revisão de contrato, checagem de campanha antes de ir ao ar (clearance de conteúdo), orientação sobre LGPD e suporte pra dúvida jurídica do dia a dia, sem cobrar por consulta avulsa a cada vez.",
    },
    {
      question: "Preciso ter empresa aberta para contratar assessoria?",
      answer:
        "Não é pré-requisito, mas negócios já formalizados (CNPJ, equipe, fornecedores) costumam sentir mais falta desse acompanhamento contínuo. Se você ainda não tem empresa aberta, isso também entra na conversa inicial.",
    },
    {
      question: "Atende negócio pequeno ou só quem já fatura alto?",
      answer:
        "Atende os dois: o plano é dimensionado pelo tamanho real da operação, não por um valor fixo de faturamento. A ideia é justamente entrar antes que o jurídico vire um problema grande, não só depois que ele já apareceu.",
    },
    {
      question: "Qual a diferença entre contratar um serviço avulso e a assessoria?",
      answer:
        "No avulso, você resolve um problema pontual: um contrato, um registro. Na assessoria, o acompanhamento é contínuo: eu já conheço seu negócio, então cada nova dúvida ou risco é resolvido mais rápido, sem explicar tudo de novo a cada vez.",
    },
  ],

  "alvara-mirim": [
    {
      question:
        "Preciso mesmo de alvará se meu filho só faz vídeo por diversão, sem ganhar dinheiro?",
      answer:
        "Se não há monetização, patrocínio nem parceria comercial, a exigência é outra. Assim que a conta começa a monetizar ou fecha publicidade, o alvará passa a ser necessário.",
    },
    {
      question: "O que acontece se eu não tiver o alvará e a plataforma pedir?",
      answer:
        "A plataforma pode suspender a monetização e, se o prazo dado não for cumprido, bloquear a conta até a autorização ser apresentada. Por isso vale regularizar antes da notificação chegar.",
    },
    {
      question: "Alvará pra canal e pra uma campanha pontual são a mesma coisa?",
      answer:
        "Não. O alvará de canal autoriza o perfil funcionando sempre. O de campanha autoriza só uma ação pontual, tipo uma publi isolada ou o lançamento de um produto.",
    },
    {
      question: "Quanto tempo vale o alvará?",
      answer:
        "Normalmente é concedido pelo prazo de 12 meses, com possibilidade de pedido de renovação enquanto os requisitos continuarem preenchidos.",
    },
    {
      question: "O dinheiro da monetização fica em nome de quem?",
      answer:
        "Fica numa conta em nome da criança, sob custódia judicial. Saque costuma depender de autorização do juízo ou esperar a maioridade civil, conforme definido na decisão.",
    },
  ],
};
