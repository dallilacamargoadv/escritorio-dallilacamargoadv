# Pedidos da Dallila em 26/11/2026 (o que falta fazer)

Feito nesta sessão:
- Cronograma: a caixa vermelha "X blocos ficaram para trás... use replanejar" virou uma linha recolhida e neutra. A "próxima melhor ação" não manda mais replanejar.
- Revisão espaçada: escada passou a 1, 7, 15 e 30 dias e depois 4 revisões semanais de manutenção (`INTERVALOS` em `lib/estudos-revisao.ts`). Erro volta para 1 dia.

## Fila, em ordem de prioridade

1. **Leitura diária = C/E de lei e jurisprudência do tema do dia.** Ao abrir o bloco do cronograma (ex.: Constitucional, direitos fundamentais), mostrar: (a) a lista exata de diplomas e artigos daquele tema (Adm: CF art. 37, DL 200/67, Lei 9.784, Lei 14.133...); (b) a rodada certo/errado só desses dispositivos (reaproveitar `trilhas.json`, que já é por tema); (c) itens de jurisprudência com fonte e data conferidas (preencher o campo `juris`). Cobrir todos os temas do edital, não só a semana 1.
2. **Questões com mais jurisprudência e caso concreto.** Novas questões no padrão FCC 2022: letra da lei, caso concreto e jurisprudência (STF/STJ, com tese/informativo citado). Meta: ~1/3 do banco de cada matéria jurídica com jurisprudência.
3. **Flashcards refeitos a partir dos cadernos.** Os de Constitucional e Administrativo estão rasos. Refazer por subtema com a substância dos cadernos (ex.: art. 5º caput, os 5 direitos: vida, igualdade, liberdade, segurança, propriedade, com incisos e julgados). Manter cartões só para matérias teóricas (Português, Constitucional, Administrativo, Tributário, Civil, Proc. Civil, Leis do MA, Informática). Raciocínio Lógico: só conceito/fórmula; matemática sai dos cartões e vira lista de exercícios.
4. **Caderno de erros por matéria → subtema.** Estrutura: Constitucional > Direitos e garantias fundamentais > erros. Cada erro: questão, motivo (atenção, conteúdo, esqueceu, confundiu...), comentário dela, alternativa certa com o porquê e macete, artigo de lei. "Mapa do erro" no topo do subtema (onde mais erra, qual artigo). Unificar erros do TEC (`estudo_tec`, colados) e do site no mesmo caderno. Exportável para análise pré-prova.
5. **Cronograma com lógica visível.** Semana fixa e previsível: teoria do tema + C/E da lei do tema + questões do tema no mesmo dia; revisões espaçadas do que já foi estudado (1/7/15/30); **domingo = caderno de erros da semana + análise das subjetivas**. Mostrar em cada dia o porquê de cada bloco.
6. **Análise de subjetiva no domingo.** Todo domingo: nota estimada, o que faltou (tese, fundamento, estrutura, jurisprudência), padrão de erro das últimas semanas e técnica sugerida.
7. **Mapas mentais rápidos por tema** (já existe `content/estudos/mapas.json`): um por subtema, para revisão de 2 minutos.

Regra para todo o conteúdo novo: lei conferida com texto vigente, jurisprudência só com fonte e data, nada inventado.

## Segunda rodada (26/11/2026)

Feito:
- Gerador do cronograma (`gerarCronograma` em `lib/estudos-utils.ts`): revisão espaçada todo dia, inclusive fim de semana; Português todo dia (teoria seg/qua/sex, 25 a 35 min); Matemática ou Informática todo dia, alternando, 25 min; sábado = simuladão; domingo = caderno de erros da semana + lei seca dos erros + discursiva com análise. Vale depois de publicar e clicar em replanejar.
- Seção "Na prova: como reconhecer e resolver" (tabela: o que o enunciado diz, ferramenta, como resolver, exemplos resolvidos e onde a FCC pega) nas aulas prontas A2-a01, a05, a06, a07 e A3-a01, a04.

Diagnóstico pelos dados (acerto firme, 15 a 26/11): RLM/Matemática 40%, Civil 40% (só 5 tentativas), Tributário 51%, Administrativo 60%, Português 65%, Processo Civil 65%, Constitucional 68%, Informática sem nenhuma questão respondida. Temas mais fracos: concordância nominal e verbal, crase, conectivos; remessa necessária, intervenção de terceiros, honorários, Fazenda em juízo; limitações ao poder de tributar, crédito tributário; licitações; estruturas lógicas, frações, razão/proporção, porcentagem.

Próximo: mesma seção "como reconhecer e resolver" nas aulas a montar de A2 e A3; montar cronograma a partir do simulado de nivelamento.

## Terceira rodada (27/11/2026)

Feito:
- Cronograma por aula: o gerador recebe as aulas dos cadernos ainda não marcadas e agenda uma por vez (ex.: só "Remédios constitucionais"). Reestudo = desmarcar a aula no caderno.
- Semana: até 3 matérias por dia (Português + 2 de Direito); quarta = Matemática 1h + simulado de lei seca; terça e quinta = subjetiva curta; sábado e domingo dia inteiro; História e Geografia do MA só no fim de semana.
- `diasRevisao` em `estudo_config.geral`: dia só de revisão do que foi estudado (27/11 marcado).
- Banco: desmarcadas B5-a02, B5-a03 (competência e sujeitos, reestudar), B2-a03, B2-a04 (órgãos e administração indireta, reestudar).

Falta (pedidos dela):
- Laboratório de erros com mapa por matéria > subtema > artigo, motivo do erro, comentário dela, alternativa certa com porquê e macete, juntando TEC e site.
- Cadernos que não existem: Português (A1), Financeiro (B8), Trabalho (B10). Tributário (B7) já existe.
- Mais questões com jurisprudência e detalhe de lei em CF, Adm e PC (o simulado de 27/11 mostrou poucas).
- Botão "simulado do que já estudei" na aba Simulados (hoje montado à mão).
