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
