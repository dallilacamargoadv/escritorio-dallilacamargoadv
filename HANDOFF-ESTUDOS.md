# Handoff: Central de estudos "Operação Aprovação" (PGE-MA, FCC)

Documento único da área de estudos do painel: arquitetura, modelo de dados, regras e roteiro. O `HANDOFF.md` continua valendo para o resto do site. Leia os dois antes de mexer.

## 1. O que é

Área privada em `/admin/estudos` (mesmo login, mesmo PWA do painel) para a preparação da Dallila para Analista Jurídico da PGE-MA (Concurso Unificado do Maranhão, banca FCC, fase pré-edital). Ela substitui aos poucos a plataforma antiga, que é um Artifact (`CONCURSO PGE-MA/plataforma/rumo-pge-ma.html`). A plataforma antiga **não foi alterada** e continua funcionando.

Princípios combinados com ela:
- Nada inventado: lei, jurisprudência, estatística de banca e datas do concurso só com fonte. Hipótese aparece como hipótese.
- Estatística da banca só a partir de provas reais da FCC. As 486 questões do banco são autorais "no estilo FCC" e servem para treino, não para estatística de banca.
- Prontidão, nunca "chance de aprovação".
- Correção automática de redação é sempre estimativa.
- Gamificação premia constância e qualidade. Descanso não quebra a sequência nem é punido.
- Escrita sem travessão.

## 2. Navegação e visual

- `components/admin/AdminSidebar.tsx`: em qualquer rota `/admin/estudos*` renderiza `EstudosSidebar` no lugar da barra do escritório. As duas barras têm a chave `ModoSwitch` (Escritório / Estudos) no topo.
- Visual próprio, moderno e escuro, com tokens `--e-*` no fim de `app/globals.css`, registrados no `@theme inline` como `bg-e-card`, `text-e-dim` etc. Tem variante clara (`data-theme="light"` ou preferência do sistema).
- Sparkle da marca: `components/estudos/Sparkle.tsx` reproduz os paths e as animações (brilhante, carregando, flutuante) do componente Sparkle do Design System dela (artifact XpbUQBSRZcds53PLMn6f5w, `project/components/Sparkle/preview.html`). Respeita `prefers-reduced-motion`. Não aproximar com caractere solto.
- Peças visuais: `components/estudos/ui.tsx` (Card, Kpi, Barra, Cabecalho, botões, campo).

## 3. Telas (etapa 2)

| Rota | O que faz |
|---|---|
| `/admin/estudos` | Saudação, "Sua próxima melhor ação" (sempre com o porquê), KPIs, mapa de fraquezas, blocos de hoje, erros que se repetem, progresso do edital, dados da prova |
| `/admin/estudos/cronograma` | Horários por dia, data da prova, matérias condicionais, gerar/replanejar, atrasados, semana |
| `/admin/estudos/questoes` | Filtros (matéria, tema, status), cronômetro, correção com o porquê de cada alternativa, fonte com destaque, classificação obrigatória do erro (10 tipos) ou do acerto (5 tipos), anotação, histórico |
| `/admin/estudos/edital` | 184 tópicos do edital verticalizado por fase, andamento por tópico, "fora do edital" |
| `/admin/estudos/concurso` | Linha do tempo das 11 fases com data, situação e link de fonte oficial |

## 4. Arquivos

- Conteúdo estático: `content/estudos/edital.json` (18 matérias, 184 tópicos, ids `B3-01`) e `content/estudos/questoes.json` (486 questões, ~670 KB, **só importado no servidor**, via `lib/db-estudos.ts`).
- Lógica pura (cliente e servidor): `lib/estudos-utils.ts` (edital, progresso, gerador de cronograma, mensagens) e `lib/estudos-desempenho.ts` (tipos de erro e acerto, estatísticas, temas críticos, próxima melhor ação).
- Servidor: `lib/db-estudos.ts`. HTML seguro das questões: `lib/estudos-html.ts` (só libera b, i, u, sup, sub, mark e br).
- APIs: `app/api/admin/estudos/{config,cronograma,cronograma/[id],topicos/[id],respostas,eventos/[id],simulados,simulados/[id]}`.
- Simulados: lógica pura em `lib/estudos-simulados.ts`, banco em `lib/db-estudos-simulados.ts`, telas `SimuladosClient` (painel), `SimuladoProva` (prova, sem gabarito no navegador) e `SimuladoRelatorio`.

## 5. Banco (Supabase `zojcjeinftoscpmkwtdi`), RLS `authenticated` em tudo

| Tabela | Uso |
|---|---|
| `estudo_config` | chave `geral`: `{dataProva, minutosPorDia[7], incluirCondicionais[]}` |
| `estudo_topicos` | andamento por tópico do edital (`nao_iniciado`, `estudando`, `revisar`, `dominado`) e `fora_do_edital` |
| `estudo_cronograma` | blocos do plano. Replanejar apaga só os **não feitos** e grava de novo |
| `estudo_respostas` | uma linha por tentativa (histórico completo para reincidência): `correta` é calculada no servidor, `classificacao`, `tempo_seg`, `contexto` (`treino`, `revisao`, `simulado`, `migrado`) |
| `estudo_eventos` | fases do concurso. Só a publicação do edital tem data (20/11/2026, "previsto") |
| `estudo_cartoes` | estado dos cartões. Os 25 migrados tinham SM-2; ao revisar, ganham `etapa` (escada 1/3/7/15/30) e `due` em ms. Texto em `content/estudos/cartoes.json` (1.213 cartões dos 7 baralhos antigos, só no servidor) |
| `estudo_revisao` | agenda dos artigos (`item_id` = `art:<ref da questão>`, `etapa`, `vence_em`, `historico`) |
| `estudo_pomodoros` | blocos de foco: `data`, `minutos_efetivos`, `pausas` |
| `estudo_simulados` | `origem` (`site`/`externo`), `tipo` (`lei_seca`/`simuladao`/`outro`), `status` (`em_andamento`/`entregue`), `questoes[]`, `itens` (por questão: alternativa, tempo, correta, classificação, `resposta_id`), `acertos`, `total`, `duracao_seg`, `limite_seg`. Entregue no site não se apaga (as respostas já foram gravadas) |

Migrations: `estudos_onda1_edital_cronograma`, `estudos_onda2_respostas_eventos_cartoes`, `estudos_onda4_revisao_pomodoro` e `estudos_onda5_simulados`.

## 6. Migração da plataforma antiga (14/11/2026)

- Backup completo do banco do Artifact em `CONCURSO PGE-MA/backup-plataforma-2026-11-14/` (34 documentos).
- 8 questões viraram 12 tentativas em `estudo_respostas` (`contexto = 'migrado'`). Tipos antigos convertidos: nao_sei → conteudo, nao_lembro → esquecimento, confundi → confusao, li_errado → atencao, pegadinha → pegadinha, seguro → seguro, chute → chute. "O que eu entendi" e "por quê" foram para `nota`.
- 25 flashcards foram para `estudo_cartoes` com o estado original.
- Se ela continuar respondendo no Artifact antes de trocar de vez, refazer a migração só das tentativas novas (comparar pelo horário).

## 7. Regras de cálculo

- **Acerto firme**: acerto que não foi chute nem dúvida. O mapa de fraquezas usa só esse.
- **Tema crítico**: 2 ou mais tentativas sem acerto firme no mesmo tema nos últimos 45 dias.
- **Próxima melhor ação**: tema crítico > 6 ou mais blocos atrasados > próximo bloco de hoje > montar plano > questões mistas.
- **Progresso do edital**: estudando 35%, precisa revisar 70%, dominado 100%.
- **Cronograma**: revisão diária (~15% do dia), Português todo dia, Raciocínio Lógico e Informática em dias alternados, cultura do MA no sábado, discursiva no domingo, teoria de 50 min com questões de 25 min na ordem das fases, lei seca a cada 3 dias, sobra vira questões mistas, depois da teoria tudo vira questões e simulados.

## 7b. Cadernos e Banca FCC (etapa 3a, branch `feat/estudos-cadernos`)

- **Cadernos** (`/admin/estudos/cadernos` e `/cadernos/[materia]`): um JSON por matéria em `content/estudos/cadernos/<id>.json`, registrado em `lib/db-estudos-cadernos.ts` (`CADERNOS`). Tipos em `lib/estudos-cadernos.ts`.
- **Como escrever aula (pedido dela)**: cadeia lógica com início, meio e fim. Cada seção tem `etapa`: `origem` (de onde vem), `regra` (como funciona), `excecao` (exceções e divergências), `banca` (como a FCC cobra). Lei seca literal em bloco `lei` (conferida com o texto vigente por script) ou, se pesado, bloco `leia` ("Leia agora: arts. X a Y"). Material raso ela chama de "fraco".
- **Blocos** (`components/estudos/CadernoBlocos.tsx`): texto, lei, leia, nota (pegadinha, atenção, macete, hipótese), juris, tabela, matriz, virar (cartas), passos (animação com o sparkle como token), alternar, vf, escada, abrir. Todos respeitam movimento reduzido.
- **Progresso**: `estudo_aulas`. Marcar aula como estudada leva o tópico do edital ligado a pelo menos "estudando".
- **Caderno de erros por matéria**: `cadernoDeErros()` em `lib/estudos-desempenho.ts` (uma linha por questão com erro ou acerto sem firmeza; "superado" se a última tentativa foi acerto firme).
- **Banca FCC** (`/admin/estudos/banca`, tabela `estudo_tec`): dois tipos sempre separados. `incidencia` = quantas questões FCC existem por assunto no filtro do TEC (o que cai mais e menos). `resolucao` = os resultados dela. Colagem aceita "assunto ; questões ; acertos", "x de y" e "%".
- Gerador do caderno de Administrativo: o `cad_b2.py` antigo (aulas 1 a 7) ficou no scratchpad temporário. A aula 8 foi feita com um script que **edita o B2.json existente** (troca só a aula pelo id e acrescenta questões), conferindo cada citação contra o texto vigente. Siga esse modelo nas próximas aulas. Aulas prontas: B2-a01 a B2-a17, B2-a13b e B2-a15b (organização administrativa completa, princípios, poderes, atos, processo administrativo, licitações I e II, contratos, serviços públicos, concessões/PPPs, agentes públicos e responsabilidade civil). 5 aulas "a montar", 24 no total. `numero` é só exibição e é recalculado pela posição; o progresso usa o id. Questões do caderno: `adm-cad-01` a `36` no banco. Os geradores ficam em `CONCURSO PGE-MA/geradores/`.
- Bloco `matriz`: os rótulos "Típica/Atípica" e o botão "Destacar só as típicas" estão fixos no código (foram feitos para a aula de separação de Poderes). Para outra matéria, use `vf` ou torne os rótulos configuráveis antes.
- Migration: `estudos_onda3_cadernos_tec`.

## 7c. Laboratório de erros (etapa 3b, 15/11/2026)

- Rota `/admin/estudos/laboratorio` (link na barra lateral). Cálculo puro em `lib/estudos-laboratorio.ts`, tela em `app/(admin)/admin/estudos/laboratorio/page.tsx`, partes interativas em `components/estudos/LaboratorioClient.tsx` (árvore, ajuste de níveis, copiar resumo).
- Filtros por URL: `periodo` (45 padrão, 90, tudo) e `materia`. Entram as questões respondidas no período, mas o nível usa o histórico inteiro da questão.
- **Erro** = tentativa que não é acerto firme (erro, chute ou dúvida). **Superado** = última tentativa foi acerto firme. **Repetido** = N ou mais falhas na mesma questão (padrão 2). **Tempo até corrigir** = dias do primeiro erro até o acerto firme que encerrou a última falha.
- **Índice de domínio, 7 níveis (aprovados por ela em 15/11):** 0 Não visto, 1 Contato (aula estudada, sem questão), 2 Errando (última tentativa não firme), 3 Oscilando (firme depois de erro, uma vez), 4 Acerto firme, 5 Consolidado (N acertos firmes seguidos em dias diferentes, padrão 2), 6 Dominado (consolidado e firme D dias depois, padrão 30). Árvore matéria → tema → questão; tema e matéria = média dos níveis das questões respondidas, arredondada para baixo.
- Configuração em `estudo_config`, chave `laboratorio` (`acertosConsolidar`, `diasDominado`, `vezesReincidencia`), API `PUT /api/admin/estudos/laboratorio`. Sem migration nova.
- "Copiar resumo dos meus erros" gera texto para o Projeto do tutor no claude.ai, com enunciado curto, anotação dela e pedido de aula em cadeia.
- `NIVEL_COR` fica no lib (não no arquivo "use client"), porque a página do servidor também usa.

## 7d. Desafios (15/11/2026, branch `feat/estudos-desafios`, sem commit)

- Rota `/admin/estudos/desafios`. Banco `content/estudos/desafios.json` (629 itens, só no servidor), gerado por `CONCURSO PGE-MA/geradores/gerar_desafios.py` a partir de `03 Leis atualizadas/` (Lei 9.784, 8.429, 14.133, CF, Constituição MA, CPC, CC, LINDB, CTN, 6.830). Lei 6.107 ficou fora (texto só até 2015).
- Tipos: `lacuna` (4 opções) e `pegadinha` (certo/errado, ~40% literal). Gabarito só no servidor: `POST /api/admin/estudos/desafios` corrige.
- Estado em `estudo_config`, chave `desafios` (`dias[data] = {acertos,total}`, `vistos[id] = {ult,ok,vezes}`). Sem migration. Sequência = dias seguidos com 10 ou mais respondidos.
- Rodada: até 3 errados antigos, depois inéditos, depois acertados há mais tempo, misturando matérias. `?r=` dá mais rodadas, `?materia=` filtra.
- Jurisprudência: campo `juris` (`texto`, `fonte`, `data`) vazio por enquanto. Preencher só com fonte conferida.
- Falta: teste no navegador logado e apagar a chave `desafios` de `estudo_config` depois do teste.

## 8. Roteiro

1. Etapa 1 (feita): Início, Edital, Cronograma.
2. Etapa 2 (feita): barras separadas, visual com sparkle, questões com tempo e classificação, migração, calendário do concurso.
3. Etapa 3 (feita, 3a e 3b): laboratório de erros (reincidência, erros superados, tempo até corrigir, botão "copiar resumo dos meus erros" para o tutor) e índice de domínio configurável com árvore de 7 níveis.
4. Etapa 4 (feita, 15/11/2026, branch `feat/estudos-revisao`): aba Revisão em `/admin/estudos/revisao`. Lógica em `lib/estudos-revisao.ts`. Questões: agenda calculada das respostas (etapa = acertos firmes depois da última falha; chute e dúvida contam como falha). Artigos: a `fonte` das questões erradas; erro novo zera a etapa. Cartões: vencidos + 10 novos por dia alternando baralhos. Questão aberta com `?revisao=1` grava `contexto = revisao` e volta para a fila. Pomodoro 50/10 grava só o tempo efetivo. Melhoria pendente: os números do topo só atualizam ao recarregar a página.
4b. Etapa 4b (feita, 15/11/2026, branch `feat/estudos-simulados`): aba Simulados em `/admin/estudos/simulados`. Ao entregar, o servidor corrige e grava uma resposta por questão (`contexto = simulado`; motivo padrão: errada = conteúdo, em branco = estratégia, certa = segurança), editável no relatório. Evolução semanal agrupa por semana de segunda a domingo.
5. Etapa 5: biblioteca (PDFs no Storage com busca por texto e página, lei grifada, jurisprudência com fonte e data, questões comentadas, mapas, etiquetas, pesquisa global). Antes: conferir o limite de armazenamento do plano Supabase. Marca d'água com dados pessoais das apostilas nunca pode aparecer.
6. Etapa 6: banca FCC (cadastro de provas reais) e prontidão.
7. Etapa 7: redação e discursivas.
8. Etapa 8: RPG (XP, níveis, missões, loja só de itens visuais).
9. Etapa 9 (opcional e paga): IA dentro do site, com camada que aceita qualquer provedor, chave só no servidor, teto mensal. A assinatura do Claude dela **não** dá acesso à API. O tutor sem custo extra é um Projeto no claude.ai (instruções em `CONCURSO PGE-MA/tutor/INSTRUCOES-PROJETO-OPERACAO-APROVACAO.md`).

## 9. Como testar

`npx eslint .` e `npm run build` limpos, depois o fluxo no navegador local logada. Qualquer resposta, bloco ou evento de teste gravado no Supabase de produção deve ser apagado depois (ela não usa banco separado de teste).
