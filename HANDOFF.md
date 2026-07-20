# Handoff — Site institucional + Sistema Operacional Jurídico, Dallila Camargo I Advocacia

> Documento de continuidade de sessão. Cole este arquivo (ou peça para o Claude ler `HANDOFF.md` na raiz do projeto) no início de uma nova conversa para retomar exatamente de onde paramos, sem precisar reprocessar todo o histórico anterior. **Atualizado em 2026-07-20**, ao final de uma sessão que implementou a Onda 3 do roadmap de CRM jurídico (Serviços enriquecidos) — o texto abaixo é o estado atual, não uma narrativa cronológica completa (essa fica resumida na seção 9, se precisar).

## 1. Quem é a cliente e o que é o projeto

**Dallila Camargo** — advogada sócia única, especialista em **Direito Digital**, OAB/PA nº 36.762, sediada em Redenção/PA, atendimento 100% remoto em todo o Brasil. Está em **transição de carreira** e ainda tem processos de outras áreas (fora as 5 atuais) na base — vale lembrar disso ao lidar com categorização de casos antigos. O projeto é ao mesmo tempo (a) o site institucional público (landing pages + blog) e (b) um **sistema operacional de escritório** completo (CRM, gestão de casos/contratos, financeiro, notificações, analytics) — ela pediu explicitamente para o painel deixar de ser "um formulário de captação bonito" e virar ferramenta de operação real, e mais recentemente trouxe um pedido grande pra evoluir isso pra um CRM jurídico de verdade (ver seção 8.5).

- **Repositório**: `github.com/dallilacamargoadv/escritorio-dallilacamargoadv` (público)
- **Deploy**: Vercel, projeto `escritorio-dallilacamargoadv` (`prj_oWeeWYZYerDMaefVIbBbtGhaqZVD`, team `team_AUWkl211AzsfpkSeCj38JNhY`)
- **URL de produção**: **domínio próprio já conectado e funcionando** — `dallilacamargoadv.com.br` e `www.dallilacamargoadv.com.br` (DNS no Cloudflare, CNAME apontando pra Vercel, "Somente DNS"/sem proxy — ver seção 8.6 pra detalhes de como isso foi resolvido). URLs `*.vercel.app` continuam funcionando também.
- **Banco de dados**: Supabase, projeto `zojcjeinftoscpmkwtdi`, região `sa-east-1`
- **Diretório local do projeto**: `/Users/dallilacamargo/Documents/CLAUDE CODE - ESTRUTURACAO/escritorio-dallilacamargoadv`
- **Fuso horário do negócio**: `America/Belem` (UTC-3 fixo, Brasil não tem mais horário de verão) — usado em qualquer cálculo de data/hora que precise refletir "o dia da cliente", nunca UTC puro.

## 2. Stack técnica

- **Next.js 16.2.10** (App Router, Turbopack) — breaking changes vs. Next.js "clássico": `proxy.ts` (não `middleware.ts`, export `proxy`), `params`/`searchParams` são `Promise` (sempre `await`), tipos `PageProps<'/rota/[id]'>` e `RouteContext<'/rota/[id]'>` gerados automaticamente, `themeColor` mora em `export const viewport` (não em `metadata`). Há um `AGENTS.md` no repo avisando disso — **leia antes de mexer em rotas**.
- **React 19.2**, **Tailwind CSS v4** (`@theme inline` em `app/globals.css`, sem `tailwind.config.ts`)
- **Supabase**: Postgres com RLS + Supabase Auth + `@supabase/ssr`. Cliente de service role (`lib/supabase/service.ts`) para contextos sem sessão de usuário (os crons). **Supabase Storage em uso** desde esta sessão (bucket `documentos`, ver seção 5).
- **GSAP + ScrollTrigger**, **Recharts**, **lucide-react**, **xlsx**, **next-mdx-remote/rsc** (blog, ainda textarea puro — ver seção 8.5 onda 6), **@dnd-kit/core + @dnd-kit/utilities** (Kanban de Leads e agora também Kanban de Atividades — `@dnd-kit/sortable` NÃO é usado, foi instalado por engano e removido)
- **Vercel Cron** (`vercel.json`): `/api/cron/notificacoes` (11h UTC) e `/api/cron/leads-cadencia` (11h05 UTC) — ambos 1x/dia, bate com o plano Hobby e com a rotina real da cliente (confere o painel de manhã).
- **PWA** (só o painel `/admin`, nunca o site público) — ver seção 8.4.

## 3. Identidade visual (brand book)

Dark theme default (`--bg: #2a070c`, `--gold: #9f8e87`, `--wine: #b5495a`, `--ink: #ddc8b3`), light theme via `data-theme`. Tipografia: **Fraunces** (display/serif), **Inter** (corpo), **JetBrains Mono** (eyebrow/dados tabulares). Logo abelha/mariposa dourada (`components/ui/Logo.tsx`, arquivo fonte `public/logo-abelha.png`).

**Paleta categórica de gráficos**: `app/globals.css` define `--chart-1`..`--chart-6` (fixas entre temas, não trocam com light/dark) mapeadas em `lib/admin-labels.ts::FORM_TYPE_CHART_COLORS` pras 5 áreas + `CHART_COLOR_OUTROS` pro resto. Construída e **validada com o script de acessibilidade da skill `dataviz`** (contraste + separação por daltonismo contra os dois fundos da marca) — não escolhida no olho. Ordem fixa: Contratos Digitais → Propriedade Intelectual → Contas e Plataformas → Golpes Virtuais → Assessoria Estratégica → Outros. **Ao adicionar um gráfico novo com múltiplas séries, reusar essa paleta em vez de inventar cores.**

**Padrão de gráfico com Recharts**: `components/admin/LeadCharts.tsx` é a referência original (BarChart horizontal, PieChart/donut, AreaChart). `components/admin/OverviewCharts.tsx` estendeu o padrão com `RadialBarChart` (gauge de percentual, ex.: SLA cumprido). Sempre dentro de `ResponsiveContainer`, cores via CSS vars, `Tooltip contentStyle` com o mesmo objeto de estilo (`background: var(--surface)`, `border: 1px solid var(--hairline-strong)`, `fontSize: 12`, `color: var(--ink)`).

Ver `app/globals.css` para os tokens completos.

## 4. Estrutura de rotas atual

**Site público** (`app/(site)/`): `/`, `/sobre`, `/contato`, as **5 áreas** (`/contratos`, `/propriedade-intelectual`, `/contas-e-plataformas`, `/golpes-virtuais`, `/assessoria-estrategica`), `/blog`, `/blog/[slug]`, `/blog/categoria/[categoria]`, páginas legais. `lib/site-data.ts::SERVICE_AREAS` é a fonte única dessas 5 áreas. Rodapé de artigos do blog não tem CTA de contato direto (conformidade Provimento 205/2021 da OAB). **Sem nenhum traço de PWA** (manifest/service worker) — confirmado deliberadamente, ver seção 8.4.

**Painel admin** (`app/(admin)/`, protegido por `proxy.ts`, **é um PWA instalável** — ver seção 8.4):

```
/admin                             Visão Geral — 12 KPIs clicáveis (drill-down em modal) em 3 blocos
                                    (Financeiro/Operação/Funil), Operação e Funil com alternância
                                    Cards/Gráfico, filtro de período, notificações, refresh 30min
/admin/leads                       Toggle Kanban (17 colunas) / Lista, com filtro de período
/admin/analise-aprofundada         Tráfego/UTMs/canais/geografia/comportamento dos leads
/admin/atividades, /novo, /[id]    RENOMEADO de "Prazos" nesta sessão — toggle Lista/Kanban/Agenda,
                                    ver seção 8.5 onda 2
/admin/agenda                      NOVO — item próprio na sidebar, fora de Atividades. Só os 3 tipos
                                    audiência/reunião com cliente/prazo de peça, calendário sempre no
                                    topo + Kanban sempre visível embaixo (sem alternância). Audiência
                                    tem cor de alerta fixa (--audiencia) em qualquer lista/coluna,
                                    ver seção 8.5 "Reorganização adiantada"
/admin/clientes, /novo, /[id], /[id]/editar
/admin/casos, /novo, /[id]         + frentes (judicial/extrajudicial/administrativo), filtro de
                                    período, cada frente com toggle "visível pro cliente",
                                    documentos anexados (onda 1), campos processuais completos +
                                    prioridade/SLA/categoria/responsável + segredo de justiça +
                                    consulta ao Comunica PJe + Anamnese Jurídica (onda 3)
/admin/casos/[id]/relatorio        Relatório interno do caso (print-first, tudo)
/admin/casos/[id]/relatorio-cliente Relatório curado pro cliente (só o marcado como visível)
/admin/relatorios                  Lista de casos com link direto pros dois relatórios
/admin/contratos, /novo, /[id]     (tipo projeto|recorrente)
/admin/recorrentes                 Visão dedicada de contratos recorrentes (MRR, vencimentos)
/admin/financeiro                  Régua de KPIs, Receita x Despesa, Projeções, Análise financeira,
                                    categorias editáveis — ver seção 8.3 (Fases 1 e 2, ambas concluídas)
/admin/financeiro/novo, /[id], /[id]/recibo
/admin/metas                       Painel de Metas, 5 tiers de faturamento fixos
/admin/links                       Hub de Links (grupos + bookmarks com preview embutido)
/admin/notificacoes                Abas Ativas/Arquivo (arquivar não apaga, só sai da lista)
/admin/blog/*
```

**Sidebar** (`components/admin/AdminSidebar.tsx`), grupos e ordem atual:
- **Operação**: Visão Geral, Leads, Análise Aprofundada
- **Atividades** (renomeado de "Prazos" nesta sessão): Atividades (badge = atrasadas + próximas 7 dias), ícone `ListChecks`
- **Jurídico**: Clientes, Casos, Relatórios, + sub-itens das 5 áreas reais (linkam pra `/admin/casos?area=<formType>`, via `JuridicoAreaSubnav.tsx`)
- **Finanças**: Contratos, Recorrentes, Financeiro, Metas
- **Sistema**: Blog, Links, Notificações (badge = não lidas)
- Rodapé da sidebar: botão **"Instalar app"** (só aparece quando aplicável — ver seção 8.4) + "Sair"

**API routes** (`app/api/admin/*` e `app/api/cron/*`): `clientes`, `clientes/[id]`, `contratos`, `contratos/[id]`, `casos`, `casos/[id]`, `casos/[id]/frentes`, `casos/[id]/frentes/[frenteId]`, `casos/[id]/frentes/[frenteId]/visibilidade`, `financeiro`, `financeiro/[id]`, `financeiro/[id]/cancelar`, `despesas`, `despesas/[id]`, `despesa-categorias`, `despesa-categorias/[id]`, `despesa-categorias/[id]/subcategorias`, `despesa-categorias/[id]/subcategorias/[subId]`, `documentos`, `documentos/[id]`, `documentos/[id]/download` (onda 1), `casos/[id]/historico` (NOVO, onda 3 — só GET/POST, sem rota de PATCH/DELETE de propósito), `atividades`, `atividades/[id]` (RENOMEADO de `prazos`, onda 2), `link-grupos`, `link-grupos/[id]`, `links`, `links/[id]`, `links/metadata`, `notificacoes`, `notificacoes/[id]`, `leads` (POST cadastro manual), `leads/[id]/status`, `leads/[id]/notes`, `leads/export`, `cron/notificacoes`, `cron/leads-cadencia`.

**Arquivos PWA** (só afetam `/admin`, ver seção 8.4): `public/manifest-admin.webmanifest`, `public/sw-admin.js`, `public/icons/*.png`.

## 5. Banco de dados (Supabase — projeto `zojcjeinftoscpmkwtdi`)

**Princípio de schema repetido em todo o sistema**: sempre que uma entidade precisa referenciar "uma de várias outras tabelas", usa **múltiplas FKs nullable** (uma coluna por tabela-alvo possível), nunca uma coluna genérica tipo `entidade_tipo`/`entidade_id`. Repetido em `notificacoes`, `atividades`.

- **`leads`**: `id, created_at, form_type (enum lead_form_type), scope_key, name, email, whatsapp, answers (jsonb), utms (jsonb), metadata (jsonb), duplicate_of, status (enum lead_status), sla_due_at, first_contacted_at`. RLS: `anon` insert (form público), `authenticated` select/insert/update/delete. **Atenção**: `answers`/`utms`/`metadata` **já são exibidos** no `LeadDetailModal.tsx` (seções "Respostas", "Origem (UTMs)", geolocalização/dispositivo) — se a cliente disser que não consegue ver isso, é discoverability, não ausência (ver seção 8.5 pra contexto).
  - **`status` (enum `lead_status`)**: `leads, contactados, em_andamento, proposta_enviada, link_enviado, f1_01_dia..f8_15_dias, grupo_criado, reuniao_agendada, salesfarming, perdido, cliente` (18 valores). F1-F8 avançam automaticamente via cron. **Não existe** campo de origem/canal (site vs. Instagram/WhatsApp/indicação) — cadastro manual sempre grava `metadata.origem = "cadastro_manual"` fixo, sem diferenciar canal. Isso é trabalho pendente (seção 8.5, onda 5).
- **`lead_notes`**: notas internas por lead.
- **`clientes`**: `id, lead_id (nullable, FK leads), tipo_pessoa (pf|pj), nome_razao_social, documento, email, whatsapp, endereco (jsonb), area_origem (lead_form_type, nullable), created_at`.
- **`contratos`**: `id, cliente_id (FK, restrict), tipo (projeto|recorrente), status (rascunho|enviado|assinado|encerrado|cancelado), valor, periodicidade (texto livre), assinado_em, created_at`.
- **`casos`**: `id, contrato_id (FK, restrict — só existe caso com contrato assinado), area (lead_form_type), titulo, status (aberto|em_andamento|aguardando_cliente|concluido|arquivado), aberto_em, encerrado_em, prioridade (enum caso_prioridade: baixa|media|alta|urgente, default media, NOVO onda 3), sla_horas (int nullable, prazo em horas pra próxima ação, NOVO onda 3), categoria (text nullable, subcategoria livre dentro da área, NOVO onda 3), responsavel (text nullable, sem tabela de usuários — single user hoje, NOVO onda 3)`.
- **`caso_frentes`**: `id, caso_id (FK, cascade), tipo (extrajudicial|judicial|administrativo), orgao, numero_processo, status (aberta|em_andamento|concluida|arquivada), aberta_em, encerrada_em, visivel_cliente (boolean, default true)`. **Onda 3 adicionou** (todos nullable, só preenchidos quando `tipo = judicial` — a UI só mostra a seção nesse caso): `tribunal, vara, comarca, classe_processual, assunto, polo_ativo, polo_passivo, valor_causa (numeric), data_distribuicao (date), ultima_movimentacao (text), ultima_movimentacao_em (date), etiquetas (text[], default '{}')`. Mais `segredo_justica (boolean, not null default false)` — vira só um selo visual (🔒) nas telas internas, **não esconde nada automaticamente** (decisão explícita da cliente — o que já é mostrado/escondido do cliente continua controlado só por `visivel_cliente`).
- **`caso_historico`** (NOVA, onda 3 — "Anamnese Jurídica"): `id, caso_id (FK casos, cascade), texto (text), autor (text, default 'Dallila Camargo' — sem tabela de usuários), created_at, retifica_id (uuid, nullable, self-referencing, NOVO entrega 2)`. **Append-only por design**: RLS só tem policy de `select` e `insert`, **sem `update`/`delete`** — imutabilidade garantida no próprio banco, não só escondida na UI. Na tela (`CasoTimeline.tsx`, dentro da linha do tempo do caso — `CasoAnamnese.tsx` foi removido, ver seção 8.7), a entrada mais antiga de cada caso é rotulada "Anamnese" (computado por ordem cronológica, não é uma coluna `tipo`) e as seguintes "Atualização". Correção de erro entra como entrada nova, nunca edita a anterior. **"Cancelar" uma entrada** = inserir uma nova entrada com `retifica_id` apontando pra ela — original fica riscada + selo "Cancelada" na UI, retificação aparece atachada logo abaixo.
- **`documentos`** (NOVA, onda 1 desta sessão): `id, caso_id (FK casos, cascade), nome_arquivo (text), storage_path (text), tamanho (int, bytes), tipo_mime (text), descricao (text, nullable), created_at, marco_cliente (text, nullable, NOVO entrega 2 — quando setado, vira uma linha na seção "Marcos" do relatório do cliente)`. RLS `authenticated`-only. Arquivo de verdade mora no **Supabase Storage, bucket `documentos`** (privado, `public: false`), path `casos/{caso_id}/{uuid}-{nome_arquivo}`. Download via signed URL (`createSignedUrl`, expira em 60s, gerada sob demanda pela API, nunca guardada). Upload limitado a 20MB. Essa é a **primeira e única tabela que usa Supabase Storage no projeto até agora** — qualquer feature futura que precise de arquivo (imagem de blog, anexo de etapa de fluxo) deve reaproveitar esse mesmo bucket com um novo prefixo de path, não criar bucket novo sem necessidade clara.
- **`financeiro_lancamentos`**: `id, contrato_id (FK, restrict), cliente_id (FK, restrict), descricao, valor, vencimento, status (enum financeiro_status: pendente|pago|cancelado), pago_em, grupo_id`. "Atrasado" é **calculado na tela** (`lib/financeiro-utils.ts::isLancamentoAtrasado`), não é status guardado.
- **`atividades`** (RENOMEADA de `prazos`, via `alter table prazos rename to atividades` — sem perda de dado): `id, tipo (enum atividade_tipo: processual|compromisso|tarefa|documento_pendente|tarefa_delegada|checklist_diario|audiencia|reuniao_cliente|peca_prazo — os 3 últimos NOVOS, "Reorganização adiantada"), titulo, data, hora (nullable), caso_frente_id/caso_id/cliente_id (3 FKs nullable, cascade), status (enum atividade_status: pendente|concluido|cancelado), concluido_em, visivel_cliente (boolean, default true), created_at`. Tem política de DELETE. Nos relatórios de caso (`CasoRelatorio.tsx`), a seção que lista essas atividades **continua rotulada "Prazos"** de propósito — é terminologia jurídica específica pra um relatório formal, decisão deliberada, não inconsistência. **`audiencia`/`reuniao_cliente`/`peca_prazo` alimentam só a tela `/admin/agenda`** (nova, separada) — `/admin/atividades` continua mostrando tudo, os 9 tipos, sem perder nada.
- **`notificacoes`**: `id, tipo (lead_sla|financeiro_vencimento|blog_rascunho), titulo, lead_id/financeiro_id/post_id (FKs nullable), lida, created_at`.
- **`posts`**: blog. Editor ainda é `<textarea>` puro de Markdown, sem upload de imagem — pendente, seção 8.5 onda 6.
- **`link_grupos`**: `id, titulo, posicao, created_at`.
- **`links`**: `id, grupo_id (FK, cascade), titulo, url, tipo (enum: google_docs|google_sheets|google_slides|youtube|pdf|generico, auto-detectado por regex), posicao, created_at`.
- **`despesas`**: `id, categoria (text livre, guarda o `nome` de uma linha de `despesa_categorias`), subcategoria (text, nullable, idem `despesa_subcategorias`), descricao, fornecedor (text, nullable), valor, vencimento (date), pago_em (timestamptz, nullable), status (enum despesa_status: a_pagar|pago|cancelado), forma_pagamento (text, nullable), recorrencia (enum despesa_recorrencia: nenhuma|mensal|trimestral|semestral|anual), centro_custo (text, nullable), observacoes (text, nullable), grupo_id (uuid, nullable, reservado), created_at`. "Vencida"/"próxima" calculada na tela (`lib/financeiro-utils.ts::isDespesaVencida`/`isDespesaProxima`).
- **`despesa_categorias`**: `id, nome (text, unique), posicao (int), created_at`. Editável pelo painel (modal "Gerenciar categorias" em `/admin/financeiro`).
- **`despesa_subcategorias`**: `id, categoria_id (FK despesa_categorias, cascade), nome (text), posicao (int), created_at`, `unique(categoria_id, nome)`.

**RLS**: todas as tabelas de negócio são **`authenticated`-only** pra select/insert/update/delete — **nunca** `auth.uid() = user_id` (uma usuária só, não é multi-tenant). Exceções: `leads` aceita `insert` de `anon` (form público); bucket `documentos` no Storage segue a mesma regra via `storage.objects` policies filtradas por `bucket_id = 'documentos'`.

**Enum órfão inofensivo**: `lead_form_type` tem um valor `assessoria_recorrente` que sobrou de uma tentativa revertida de 6ª área pública — não vale a pena remover.

**Sem migrations locais**: todo schema é aplicado direto no Supabase remoto via MCP (`apply_migration`/`execute_sql`), não existe pasta `supabase/migrations` versionada no repo. Pra saber o schema atual, sempre consultar o banco (`list_tables`, `execute_sql` em `information_schema`), nunca assumir pelo que está documentado aqui sem checar se mudou.

## 6. Padrões e convenções importantes do código

- **`useSyncExternalStore`** para qualquer valor dependente de `window`/`localStorage`/`matchMedia`/eventos globais (ex.: `beforeinstallprompt`). Nunca `useState`+`useEffect` pra isso. Ver `ThemeToggle.tsx` (original) e `lib/pwa-install.ts` (novo, mesma receita: `subscribe` ouvindo um evento customizado disparado manualmente, `getSnapshot` lendo o estado real).
- **ESLint `react-hooks/purity`**: proíbe chamar funções impuras (`Date.now()`, `Math.random()`) ou mutar variável diretamente no corpo de um componente/página durante a renderização — isso vale também pra Server Components (páginas `page.tsx`), não só Client Components. Correção: extrair pra função auxiliar de módulo (não-componente) e chamar de dentro. Exemplos: `isLancamentoAtrasado`/`isDespesaVencida`/`isDespesaProxima`/`isAtividadeAtrasada`/`isAtividadeProxima`, `computeDonutSegments` em `lib/analytics.ts`.
- **Fronteira Server/Client**: importar de um `lib/db-*.ts` (usa `next/headers`) num Client Component só é seguro com `import type` **puro**. Arquivos sem import de servidor pra reusar em ambos os lados: `lib/financeiro-utils.ts`, `lib/atividades-utils.ts` (renomeado de `prazos-utils.ts`, ganhou `todayBelemDateString`/`addDaysToDateString`/`colunaDaAtividade`), `lib/analytics.ts`, `lib/date-range.ts`, `lib/overview-kpis.ts`, `lib/metas.ts`, `lib/financeiro-fase1.ts`, `lib/financeiro-projecoes.ts`, `lib/financeiro-insights.ts`, `lib/categoria-sugestao.ts`, `lib/link-tipo.ts`, `lib/despesas-categorias.ts`, `lib/pwa-install.ts`.
- **Comparação de data como string, não `Date`, pra bucket/agrupamento**: quando só importa "antes/igual/depois" de um `date` do Postgres (formato `YYYY-MM-DD`), comparar as **strings diretamente** (`"2026-07-15" < "2026-07-19"`) em vez de converter pra `Date` — evita de vez o pitfall de fuso horário de `new Date("YYYY-MM-DD")` (interpretado como meia-noite UTC). Usado em `lib/atividades-utils.ts::colunaDaAtividade` pro Kanban/Agenda de Atividades. Pra aritmética de dias (somar/subtrair), só aí usar `Date.UTC(ano, mes, dia)` com componentes explícitos, nunca parsing de string solta.
- **Calendário/agenda sem biblioteca nova**: `components/admin/AtividadesAgenda.tsx` é só matemática de data (grid de 7 colunas, `getUTCDay()`/`getUTCDate()` com `Date.UTC` explícito) — não adicionar `date-fns`/`react-big-calendar`/etc. pra isso, o padrão do projeto é preferir zero-dependência quando dá.
- **Kanban por "bucket" calculado (não por campo de status arrastável)**: `components/admin/AtividadesKanban.tsx` tem colunas que são na verdade grupos calculados por data (Atrasadas/Vencem hoje/Vencendo/Próximos dias) + uma coluna real de status (Concluídas). Arrastar só é significativo entrando/saindo de "Concluídas" (muda `status`); arrastar entre as colunas de data é ignorado de propósito (não faz sentido mudar uma data arrastando visualmente) — o card simplesmente "volta" pro lugar calculado certo porque nada no dado mudou. Usa `@dnd-kit` no mesmo padrão de `LeadsKanbanBoard.tsx` (`DndContext` + `useDroppable`/`useDraggable`), só que o `onDragEnd` decide se a transição é válida antes de fazer o PATCH.
- **`useSearchParams()` em Client Component num layout amplo** quebra o build de prerender. Solução: isolar num componente-folha + `<Suspense fallback={null}>` (ver `JuridicoAreaSubnav.tsx`).
- **`@dnd-kit` + SSR**: hydration mismatch inofensivo pelos ids de acessibilidade. Solução: `next/dynamic(..., { ssr: false })` a partir de um Client Component pai.
- **Timezone**: sempre `America/Belem` explícito, nunca `new Date()` cru. Cuidado com `new Date("YYYY-MM-DD")` — ver o item de comparação por string acima.
- **`RouteContext<'/api/rota/[id]'>`** pra `params` em route handlers; **`PageProps<'/rota/[id]'>`** pra páginas — sempre `await`.
- **FKs múltiplas nullable em vez de polimorfismo genérico**.
- **`on delete restrict` vs `cascade`**: "pai tem valor jurídico/financeiro próprio" → `restrict`. "Filho não faz sentido sem o pai" → `cascade`. `documentos.caso_id` é `cascade` (documento não existe sem o caso).
- **Padrão de arquivo por entidade**: `lib/db-<entidade>.ts` + `app/api/admin/<entidade>/route.ts` + `.../[id]/route.ts` + componente de lista (`"use client"`) + formulário único create/edit + página Server Component fina.
- **Labels/cores compartilhados** em `lib/admin-labels.ts` — nunca duplicar `Record<>` em componentes.
- **Filtro de período reutilizável**: `lib/date-range.ts` + `components/admin/DateRangeFilter.tsx`. **Não é usado** na régua de KPIs do Financeiro, no Painel de Metas, nem na Central de Atividades — esses são sempre "instante atual" (mês corrente vs. anterior, ou hoje/7 dias/etc.), padrão diferente e deliberado.
- **Drill-down por modal**: `components/admin/QuickViewModal.tsx` — padrão pra "card clicável → lista filtrada → linha leva pra página completa". Usado na Visão Geral (`AdminOverviewClient.tsx`).
- **Nunca aninhar `<button>` dentro de `<button>`/`<a>`**: HTML inválido, hydration error.
- **CSP em `next.config.ts`**: qualquer embed/recurso externo novo precisa entrar em `img-src`/`frame-src`/`manifest-src`/etc. Já libera `img.youtube.com`, `docs.google.com`/`youtube.com`, e (novo, PWA) `manifest-src 'self'`.
- **Recibo em PDF / Relatório de caso, sem biblioteca nova**: página HTML estilizada com os tokens de marca + `window.print()`.
- **Upload de arquivo em Route Handler**: `request.formData()` (Web API padrão, sem lib extra) pra multipart — ver `app/api/admin/documentos/route.ts`. Upload em si vai direto pro Supabase Storage a partir do cliente Supabase de servidor (`lib/supabase/server.ts`, autenticado via cookie de sessão), sem passar por service role.
- **Escopo de PWA só numa parte do app**: Next não permite manifest por segmento via convenção de arquivo (`app/manifest.ts` é sempre global) — a solução é um `.webmanifest` estático em `public/` + `metadata.manifest` (string, vira `<link rel="manifest">`) declarado só no `layout.tsx` do segmento que deve ser instalável (`app/(admin)/admin/layout.tsx`), nunca no layout raiz. Mesmo raciocínio pro Service Worker: registra via `useEffect` num componente montado só dentro desse layout, nunca globalmente. Ver seção 8.4 pra detalhes completos.
- Nunca commitar/pushar/deployar sem pedir permissão explícita antes — **cada vez**, mesmo em sequência.
- Verificação padrão antes de qualquer commit: `npx eslint .` e `npm run build` limpos, teste manual no browser local com escrita/leitura real no Supabase (**sempre limpando os dados de teste depois via `execute_sql`**).
- **Ferramenta de automação de browser**:
  - Tem dificuldade com drag-and-drop de verdade (gesto de mouse). Pra validar lógica de Kanban/drag: chamar a API diretamente via `fetch` (`javascript_tool`) simulando o que o `onDragEnd` faria, e conferir que os cards recalculam de coluna certo depois — validado com sucesso pro Kanban de Atividades nesta sessão.
  - `.blur()` sintético via `javascript_tool` **não dispara o evento `focusout`** que React escuta pra `onBlur` nesse ambiente (`document.activeElement` muda, evento não é despachado). Usar `el.dispatchEvent(new FocusEvent('focusout', { bubbles: true }))` em vez de `el.blur()`.
  - Ao setar valor de `<input>`/`<select>` via JS pra simular digitação, usar sempre o setter nativo (`Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set`) + `dispatchEvent(new Event('input', { bubbles: true }))` — atribuir `.value =` direto não é percebido pelo React (controlled input).
  - Checks feitos rápido demais depois de um clique que dispara `fetch`/re-render às vezes leem o DOM antes do React atualizar — se um teste "falhar" de forma que não bate com o código, tentar de novo com um pequeno delay (`setTimeout`) antes de concluir que é bug de verdade.
  - Console do browser acumula erros **antigos** de estados intermediários de edição (import quebrado no meio de um refactor, por exemplo) — sempre checar se o erro reportado é realmente do estado atual do código (ex.: rodar `npm run build` de novo) antes de investigar como bug novo.
- **Tabelas largas** (`overflow-x-auto`): preferir `javascript_tool` pra localizar/clicar botões em vez de scrollar (scroll horizontal da automação é limitado).
- **Deploy da Vercel pode travar em "Initializing" sem log nenhum** por alguns minutos, mesmo com o código 100% correto (já validado local antes) — não é bug do projeto, é enfileiramento/instabilidade pontual do lado da Vercel. Confirmado nesta sessão: dois deploys consecutivos (push original + redeploy manual) travaram, e o **primeiro** deles eventualmente foi pra `READY` sozinho. Se acontecer de novo: não é preciso investigar o código, só esperar ou checar `status.vercel.com`/uso de build minutes da conta.

## 7. Estado atual em produção

**Commitado/pushado/em produção (Vercel, `READY`)** até o commit `b640cfb`. Domínio próprio `dallilacamargoadv.com.br` confirmado ativo e servindo o deployment mais recente. Em ordem cronológica (sessões recentes):

- Financeiro Fase 1 (`d82fb72`) e Fase 2 completa — Projeções (`ae11eec`), Análise financeira + categorias editáveis + sugestão automática (`10af2c6`).
- HANDOFF.md consolidado (`d1b4243`).
- **PWA do painel admin** (`82a0e85`) — ver seção 8.4.
- **Onda 1 do roadmap de CRM jurídico: Storage + Documentos do caso** (`35d015f`) — ver seção 8.5.
- **Onda 2: rename Prazos→Atividades + Central de Atividades + Kanban + Agenda + exclusão** (`b640cfb`) — ver seção 8.5.

**⚠️ Pendente de commit**: a **Onda 3 (Serviços enriquecidos)** já está implementada e testada nesta sessão (migração aplicada no Supabase, código, eslint/build limpos), mas **ainda não foi commitada nem pushada** — faltava decidir com a cliente. Ver seção 8.5 pro detalhe completo do que foi feito.

**Arquivo estranho, sem decisão**: `components/admin/AdminSidebar 2.tsx` (untracked, provável duplicata de conflito do iCloud Drive) — ainda sem decisão da cliente. Não mexer sem perguntar de novo. Achado também nesta sessão: `.git/refs/heads/main 2` (mesma família de arquivo duplicado do iCloud) — também não mexido, só registrado.

**Duas variáveis de ambiente pendentes no Vercel** (só a cliente pode configurar): `CRON_SECRET` e `SUPABASE_SERVICE_ROLE_KEY`. Ainda não confirmado se ela configurou — perguntar se for relevante.

## 8. Pedidos grandes — estado por item

### 8.1–8.3 (fila original de 6 itens, drill-down da Visão Geral, Financeiro Fases 1 e 2) — **TODOS CONCLUÍDOS**

Detalhes preservados apenas em histórico do git (mensagens de commit já contam a história completa: `67e1325`, `28368ee`, `72898c3`, `b617284`, `337de88`, `49532fc`, `d82fb72`, `ae11eec`, `10af2c6`). Resumo: filtros de período, relatórios de caso (interno/cliente), Painel de Metas, Hub de Links, drill-down + gráficos na Visão Geral, Financeiro remodelado com Projeções/Insights/categorias editáveis/sugestão automática. Nenhum desses tem pendência aberta.

### 8.4 PWA do painel admin — **CONCLUÍDO** (`82a0e85`)

Pedido: instalar o painel (não o site público) como app no desktop/celular, com ícone próprio, splash, modo standalone.

- **Manifest** (`public/manifest-admin.webmanifest`): nome, ícones, `start_url`/`scope` = `/admin`, `display: standalone`, cores da marca. Linkado só via `metadata.manifest` no `app/(admin)/admin/layout.tsx` (não no layout raiz) — confirmado em teste que o site público e `/login` não recebem nenhum traço de PWA.
- **Ícones**: gerados via Python/PIL a partir do `logo-abelha.png` já existente, compostos sobre o fundo vinho da marca (`#2a070c`): 192, 512, 512 maskable (logo menor, mais padding, pra sobreviver a máscaras circulares/squircle), apple-touch-icon 180x180.
- **Service Worker** (`public/sw-admin.js`): só cacheia `/_next/static/*` e `/icons/*` (stale-while-revalidate). Nenhuma chamada de API ou Supabase passa pelo cache — testado em build de produção, cache só tinha os 21 arquivos estáticos esperados. Registro só roda em produção (`process.env.NODE_ENV === "production"`, gate em `ServiceWorkerRegister.tsx`) pra não atrapalhar o dev.
- **Botão "Instalar app"** na sidebar + banner dispensável no topo (`InstallAppButton.tsx`/`InstallBanner.tsx`), via `useSyncExternalStore` ouvindo `beforeinstallprompt` (`lib/pwa-install.ts`). Escondem sozinhos em modo standalone (`display-mode: standalone` via `matchMedia`, e `navigator.standalone` no iOS).
- **iOS Safari** (nunca dispara `beforeinstallprompt`): detecção por user-agent mostra instrução manual — "Toque em compartilhar e selecione Adicionar à Tela de Início".
- CSP (`next.config.ts`) ganhou `manifest-src 'self';`.

Sem pendência aberta nessa frente.

### 8.5 CRM jurídico — roadmap grande em andamento (ondas 1 e 2 concluídas)

**Contexto**: a cliente trouxe um pedido muito denso pedindo praticamente uma reformulação de arquitetura — controle judicial completo (CNJ, tribunal, vara, polo ativo/passivo, fase processual, integração pra puxar movimentação), fluxo de etapas customizável por categoria de serviço (judicial vs. extrajudicial, cada um com etapas diferentes), um "Centro de Atividades" separado de Casos, melhoria de Leads (separar origem, ver respostas do formulário, funil de vendas), blog com rich-text/imagem, páginas de SEO e Configurações, financeiro pessoal, e a ideia de reorganizar tudo em torno de 3 entidades: **Clientes / Serviços / Atividades**.

**Antes de codar qualquer coisa**, foi feito um diagnóstico crítico completo (analisando o código de verdade, não supondo) e apresentado como documento — validou a intuição das 3 entidades (é o caminho certo, "Serviços" é evolução de `caso_frentes`, não substituição), e corrigiu duas percepções erradas da cliente: **o recibo de pagamento já existe** (`/admin/financeiro/[id]/recibo`) e **as respostas do lead/UTMs já aparecem** no modal de detalhe — os dois eram problema de descoberta, não ausência.

**Decisões confirmadas pela cliente** (importante não re-perguntar):
- **Integração de tribunal**: usar a opção gratuita, mas **não o DataJud** — a cliente testou e prefere o **Comunica PJe** (CNJ), que traz informação mais completa. API pública confirmada nesta sessão: `https://comunicaapi.pje.jus.br/api/v1/comunicacao?numeroProcesso=<só dígitos>`, sem chave/autenticação, retorna JSON (`items[]` com `data_disponibilizacao`, `siglaTribunal`, `tipoComunicacao`, `nomeOrgao`, `texto` em HTML). Testado ao vivo com um processo real, funcionou. Ainda não implementado (onda 8) — quando for construído, usar essa API via cron (padrão igual aos crons existentes), não o DataJud.
- **Financeiro pessoal**: **tabelas fisicamente separadas** das do escritório, nunca uma coluna `escopo` numa tabela só — ela foi explícita que não quer misturar de jeito nenhum, nem na Visão Geral. Ainda não implementado (onda 7).
- **Portal do cliente (login)**: **fora de escopo por enquanto** — ela prefere continuar mandando relatório manualmente. Não incluir em nenhuma onda a menos que ela peça de novo.
- **Minutas/templates de documento**: em vez de gerar documento automaticamente, ela só quer um **link pra uma pasta do Google Drive** (que ainda não existe) — hoje já dá pra fazer isso manualmente no Hub de Links (`/admin/links`, criar grupo "Minutas"); quando a onda 4 (motor de fluxo) for construída, adicionar um campo de link de minutas por categoria/template pra ficar contextual na tela do caso.
- **Atividades no lugar de Prazos**: confirmado e já entregue (onda 2) — não é uma tela nova, é o mesmo conceito renomeado e expandido.

**Roadmap de 8 ondas** (ordem por dependência técnica, não necessariamente teor de urgência):

1. ✅ **Storage** — fundação de arquivo, destrava blog/anexos futuros.
2. ✅ **Atividades** — substitui Prazos, vira central operacional.
3. ✅ **Serviços enriquecidos** — campos judiciais completos + prioridade/SLA/categoria/responsável em `casos`/`caso_frentes`, segredo de justiça, consulta ao Comunica PJe, Anamnese Jurídica. Ver seção abaixo.
4. ✅ **Motor de fluxo** — entregue adiantado dentro da "reorganização adiantada" (seção 8.7, entrega 3): etapas por categoria (`fluxo_templates`/`fluxo_etapas_template`/`frente_etapas`) + checklist + anexo por etapa. **Ainda faltam** dessa onda original: link de minutas por etapa, alerta de SLA por etapa, cobrança por hora — não pedidos explicitamente na reorganização adiantada, avaliar se ainda fazem sentido.
5. ⏳ **Leads**: campo `origem` (site|instagram|linkedin|whatsapp|indicacao|organico|outro), Kanban separado pros canais fora do site (o de 17 colunas com cadência F1-F8 continua exclusivo pra `origem = site`), funil de vendas agregado.
6. ⏳ **Blog rich-text + SEO + Configurações** — editor Tiptap (ou similar) no lugar do textarea, upload de imagem via o bucket `documentos` já existente, tela de meta title/description por página, hub de configurações unificado (hoje espalhado: categorias de despesa tem modal próprio, por exemplo).
7. ⏳ **Financeiro pessoal** — tabelas espelhadas e separadas (ver decisão acima).
8. ⏳ **Integração com Comunica PJe** — última onda, puxa movimentação automaticamente a partir do número do processo (a cliente decidiu trocar o DataJud pelo Comunica PJe nesta sessão — ver decisão acima e API confirmada). Depende só de implementação.

#### Onda 1 — Storage e Documentos do caso (`35d015f`) — **CONCLUÍDA**

Bucket privado `documentos` no Supabase Storage (RLS `authenticated`-only) + tabela `documentos` (ver seção 5). Seção "Documentos" na tela de cada caso (`components/admin/CasoDocumentos.tsx`): upload até 20MB com descrição opcional, download via link assinado (expira em 60s), exclusão remove tabela e Storage juntos. Testado ciclo completo (upload → download com conteúdo batendo → exclusão) antes do commit.

#### Onda 2 — Atividades: rename + Central + Kanban + Agenda + exclusão (`b640cfb`) — **CONCLUÍDA**

- **Rename** `prazos`→`atividades` no banco (`alter table ... rename to`, tabela e os dois enums `prazo_tipo`/`prazo_status`→`atividade_tipo`/`atividade_status`) e em todo o código (rotas, componentes, sidebar, KPI da Visão Geral). 3 tipos novos: `documento_pendente`, `tarefa_delegada`, `checklist_diario`.
- **Central de atividades**: a tela agora agrega, além das atividades reais, sinais calculados de outras tabelas — despesas vencendo (via `isDespesaProxima`) e casos com status `aguardando_cliente` — sem duplicar dado, mesmo princípio já usado em `notificacoes`.
- **Kanban por urgência** (`AtividadesKanban.tsx`): 5 colunas — Atrasadas / Vencem hoje / Vencendo (7d) / Próximos dias / Concluídas. Ver padrão em seção 6 ("Kanban por bucket calculado").
- **Agenda mensal** (`AtividadesAgenda.tsx`): calendário simples sem lib nova, chips coloridos por urgência por dia, navegação mês anterior/próximo.
- **Exclusão de atividade**: nova política de DELETE no banco (não existia), botão "excluir" na lista e na tela de edição.

Tudo testado com dados variados (atrasada/hoje/vencendo/futura/concluída) direto no Supabase antes do commit, dados de teste sempre limpos depois.

#### Onda 3 — Serviços enriquecidos (ainda não commitada) — **CONCLUÍDA**

Migração `onda3_servicos_enriquecidos` aplicada no Supabase. Detalhes de schema na seção 5 (`casos`, `caso_frentes`, `caso_historico`).

- **Prioridade/SLA/categoria/responsável em `casos`**: pills de prioridade (baixa/média/alta/urgente, cores via `CASO_PRIORIDADE_COLORS`) no `CasoForm.tsx`, coluna nova na lista (`CasosAdminList.tsx`).
- **Campos processuais em `caso_frentes`**: `CasoFrentes.tsx` só mostra o bloco de campos judiciais (tribunal, vara, comarca, classe processual, assunto, polos, valor da causa, data de distribuição, última movimentação, etiquetas) quando `tipo === "judicial"` — mesmo princípio de "seção condicional" já usado em Onda 3 da Anamnese.
- **Segredo de Justiça**: checkbox no formulário da frente, vira selo 🔒 na listagem. Só etiqueta visual, de propósito — não esconde nada automaticamente (decisão explícita da cliente, ver seção 8.5).
- **Consulta ao Comunica PJe**: botão/link que abre `https://comunica.pje.jus.br/consulta?numeroProcesso=<número sem pontuação>` em nova aba — atalho manual, sem gravar nada de volta no sistema. Parâmetro de URL descoberto testando o site ao vivo nesta sessão (não documentado publicamente em lugar óbvio). Aparece tanto no formulário de nova frente quanto na listagem de frentes já salvas.
- **Anamnese Jurídica** (`caso_historico`, `CasoAnamnese.tsx`): timeline append-only por caso — ver seção 5 pro detalhe de RLS sem update/delete. Primeira entrada = "Anamnese" (rótulo computado, não é coluna), demais = "Atualização". Sem botão de editar/excluir na UI de propósito.
- **Onda 8 (fora de escopo desta sessão, só decisão registrada)**: cliente decidiu usar o **Comunica PJe** em vez do DataJud pra puxar movimentação automática — ver decisão + API confirmada na seção 8.5.

Testado via SQL direto no Supabase (não deu pra testar clicando na UI — sessão não tinha as credenciais de login da cliente): criada uma cadeia completa cliente→contrato→caso→frente judicial→2 entradas de histórico, todos os campos novos gravaram e leram certo, cascade de exclusão (`caso_frentes`/`caso_historico` ao apagar `casos`) confirmado, política de RLS do `caso_historico` confirmada como só `select`+`insert`. Dados de teste todos limpos depois. `npx eslint .` e `npm run build` limpos. **Commitado, pushado e em produção** — a cliente testou na UI depois e reportou dois problemas separados, ver seção 8.7.

### 8.6 Domínio próprio conectado (fora do roadmap de ondas, resolvido em paralelo)

A cliente comprou `dallilacamargoadv.com.br` e pediu ajuda pra conectar na Vercel. Como o DNS é gerenciado no **Cloudflare** (não dá pra mexer via ferramenta nenhuma deste projeto — é conta pessoal dela), foi um processo guiado por print: criar dois registros CNAME (`@` → o host que a Vercel pediu, `www` → `cname.vercel-dns.com.`), e o pulo do gato foi **desligar o proxy do Cloudflare** (nuvem laranja → cinza, "Somente DNS") nos dois — a Vercel avisa que proxy de terceiro na frente atrapalha a proteção de DDoS própria dela (mascara o IP real do visitante). Confirmado funcionando: os dois domínios aparecem com certificado válido e servindo o deployment mais recente.

### 8.7 Bugs de contrato (achados testando a Onda 3) + Reorganização adiantada (Agenda/tela do caso/Motor de Fluxo)

**Dois bugs reais em `Contratos`, achados pela cliente testando em produção, ambos corrigidos e no ar:**
1. O campo Status só aparecia no formulário **depois** de salvar o contrato uma primeira vez — todo contrato nascia Rascunho e exigia reabrir pra editar. Corrigido: Status aparece já na criação (`ContratoForm.tsx`), e `createContrato` (`lib/db-contratos.ts`) grava `assinado_em` se já nascer assinado.
2. **Bug mais sério**: mesmo com o Status visível e escolhido como "Assinado", a rota `POST /api/admin/contratos` ignorava completamente o campo e gravava sempre `"rascunho"` — um hardcode esquecido que sobrou de antes da correção #1. Foi o motivo real dos contratos de teste da cliente ficarem travados. Corrigido, com teste de verdade confirmando a gravação.
3. **Periodicidade** deixou de ser texto livre e virou seleção (à vista, mensal, 2x/3x/4x/6x/12x + "Outro...").

**Reorganização adiantada**: a cliente trouxe, numa mensagem densa, um pedido de puxar pra agora partes da Onda 4 (Motor de Fluxo) que estavam planejadas pra mais tarde — ela decidiu isso ativamente pra não ter que refazer trabalho depois. Diagnosticado como 3 entregas separadas, com decisões já confirmadas por ela via pergunta estruturada:
- **Histórico do caso**: vai virar uma única linha do tempo (não abas separadas) misturando Anamnese + Atividades do caso + atualizações do CNJ/Comunica PJe + peças, por data.
- **Motor de Fluxo**: confirmado como etapas pré-configuradas por categoria (ex.: Notificação extrajudicial → Petição inicial → Audiência → Sentença), com checklist/anexo por etapa.
- **Agenda**: vira item próprio na sidebar (fora de Atividades) — confirmado.
- **Ordem de entrega**: 1) Agenda independente, 2) tela do caso reorganizada, 3) Motor de Fluxo — do mais isolado/rápido pro mais complexo (motor de fluxo mexe em schema novo de etapas).

**Entrega 1 — Agenda independente — CONCLUÍDA** (mockup aprovado antes de codar, como sempre):
- `atividade_tipo` ganhou 3 valores novos: `audiencia`, `reuniao_cliente`, `peca_prazo` (`lib/atividades-utils.ts::AGENDA_TIPOS`). **Nada foi removido de Atividades** — a tela `/admin/atividades` continua mostrando os 9 tipos normalmente, badge de urgência incluso.
- **`/admin/agenda`** (nova, sidebar): calendário **sempre no topo** + Kanban **sempre visível embaixo**, sem alternância/toggle (pedido explícito da cliente na segunda rodada — a primeira versão do mockup tinha toggle, ela pediu pra tirar). Reaproveita `AtividadesAgenda.tsx`/`AtividadesKanban.tsx` direto, só filtrando pros 3 tipos novos (`AgendaClient.tsx`).
- **Audiência tem cor de alerta própria e fixa** (`--audiencia`, token novo em `app/globals.css`, independe de tema — vermelho vivo `#ff4d4d` no escuro / `#d1272a` no claro): sempre nessa cor em qualquer lista/coluna/bucket de urgência, nunca junto com o esquema de cor por urgência do resto do painel. Vale também dentro da tela normal de Atividades (`isAudiencia()` em `atividades-utils.ts`), não só na Agenda — pedido da cliente foi "não posso perder isso", então o destaque precisa aparecer em qualquer lugar que a audiência apareça.
- Badge da Agenda na sidebar usa essa mesma cor de alerta (`--audiencia`), diferente do badge dourado padrão dos outros itens — `getUrgentAudienciasCount()` conta só audiências pendentes atrasadas ou nos próximos 7 dias.
- Atalhos "+ Audiência" / "+ Reunião com cliente" / "+ Prazo de peça" na Agenda levam pro formulário de atividade já existente (`AtividadeForm.tsx`), agora aceitando `tipoInicial` via query string (`?tipo=audiencia&voltar=agenda`) — sem formulário novo duplicado.
- Testado via SQL direto (insert de audiência de teste, contagem do badge, delete depois) — mesma limitação de sessão sem login pra clicar na UI de verdade.

**Entrega 2 — Tela do caso reorganizada — CONCLUÍDA** (mockup aprovado antes de codar):
- `CasoAnamnese.tsx` e `CasoDocumentos.tsx` foram **removidos** — substituídos por **`CasoTimeline.tsx`**, que mescla Anamnese + Atividades concluídas do caso + Documentos anexados numa única linha do tempo, mais recente primeiro, com filtro por tipo (Tudo/Anamnese/Atividades/Documentos) e um composer só (texto ou anexar arquivo). Atividades do caso usam `getAtividadesByCaso` (já existia) filtradas por `status === "concluido"` — pendentes/futuras não aparecem aqui, ficam em Atividades/Agenda.
- `CasoFrentes.tsx` (dados processuais) virou recolhível via `CollapsibleSection.tsx` (novo, wrapper genérico `<details>`/`<summary>`, reaproveitável em outras telas se precisar).
- **Retificação de Anamnese** (pedido da cliente depois de ver a tela pronta): `caso_historico` ganhou `retifica_id` (nullable, self-referencing). Não existe UPDATE/DELETE em `caso_historico` (RLS só tem select+insert, de propósito, onda 3) — "cancelar" uma entrada é inserir uma **nova** entrada com `retifica_id` apontando pra qual está corrigindo. Na UI, a entrada original aparece riscada + selo "Cancelada", e a retificação é renderizada logo abaixo dela (não segue a ordem cronológica geral — fica atachada visualmente ao que retifica). Botão "Cancelar / retificar" só aparece em entradas ainda não retificadas.
- **Marcos no relatório do cliente** (mesmo pedido): `documentos` ganhou `marco_cliente` (text, nullable) — ao anexar um arquivo na linha do tempo, checkbox "Marcar como marco pro relatório do cliente" + campo de nome (ex.: "Petição inicial protocolada"). `CasoRelatorio.tsx` (variant `cliente`) monta uma seção **"Marcos"** combinando 4 fontes, ordenada por data: `caso.aberto_em` ("Atendimento"), `contrato.assinado_em` quando `status === "assinado"` ("Contrato fechado"), cada `financeiro_lancamentos` pago do contrato ("Pagamento confirmado — `<descrição>`"), e os documentos com `marco_cliente` setado. A seção **"Prazos" saiu do relatório do cliente** (mostrava só datas/status técnicos, confuso pro cliente) — **continua existindo normalmente no relatório interno**. `lib/db-caso-relatorio.ts` agora busca `documentos` também.
- Testado via SQL direto (cadeia completa cliente→contrato→caso→documento marco→lançamento pago→retificação de entrada), incluindo o cenário dos 4 marcos juntos com datas corretas em ordem. `npx eslint .` e `npm run build` limpos.

**Entrega 3 — Motor de Fluxo — CONCLUÍDA** (mockup aprovado antes de codar):
- **3 tabelas novas**: `fluxo_templates` (`area` + `tipo_frente`, unique juntos — um modelo por combinação), `fluxo_etapas_template` (etapas do modelo: nome, ordem, `checklist text[]`), `frente_etapas` (etapas de verdade dentro de um caso: `caso_frente_id`, nome, ordem, `status` `pendente|concluida`, `concluida_em`, `checklist_texto`/`checklist_marcados` (int[] de índices), `documento_id` opcional). RLS `authenticated`-only (`for all`, sem granularidade fina — diferente do padrão select+insert do `caso_historico`, aqui não tem motivo de imutabilidade).
- **Cópia automática**: ao criar uma frente (`POST /api/admin/casos/[id]/frentes`), se existir um `fluxo_templates` pra `área do caso + tipo da frente`, as etapas do modelo são copiadas pra `frente_etapas` (`lib/db-frente-etapas.ts::copiarEtapasDoTemplate`). Sem modelo cadastrado = frente nasce sem etapas, normal, nada quebra (decisão confirmada). **Editar etapas de um caso nunca muda o modelo** — são tabelas desacopladas depois da cópia; se quiser que uma etapa nova vire padrão, edita direto em `/admin/fluxos`.
- **Ordem livre**: não existe trava sequencial — qualquer etapa pode ser marcada concluída a qualquer momento, decisão confirmada (processos reais nem sempre seguem a ordem à risca).
- **Etapa concluída gera sozinha uma entrada na Anamnese**: `setFrenteEtapaStatus` chama `createHistoricoEntry(casoId, "Etapa concluída: <nome>", null)` — aparece na linha do tempo do caso sem precisar escrever nada, sem precisar `CasoTimeline.tsx` saber que `frente_etapas` existe (integração via o histórico compartilhado, não um 4º tipo na timeline).
- **UI**: dentro de `CasoFrentes.tsx`, cada frente ganhou um botão (ícone `ListChecks`) que expande `FrenteEtapasStepper.tsx` (busca client-side ao expandir) — checkbox de conclusão, checklist por etapa, upload de peça vinculado à etapa (reaproveita `POST /api/admin/documentos`, depois faz `PATCH` na etapa com o `documento_id`), "+ Nova etapa" pra adicionar solta. Nova tela **`/admin/fluxos`** (sidebar, grupo Jurídico) pra cadastrar/editar os modelos por área+tipo.
- Testado via SQL direto (modelo com 2 etapas, uma com checklist → cópia pra frente de teste → checklist marcado → etapa concluída → entrada correspondente no histórico), cascade de exclusão confirmado (`fluxo_templates`→`fluxo_etapas_template`, `caso_frentes`→`frente_etapas`). `npx eslint .` e `npm run build` limpos (um build falhou por instabilidade pontual buscando fonte do Google Fonts — não é bug do código, refazer resolve).

## 9. Cronologia resumida (mais recente por último) — visão de alto nível

1. Site institucional completo + CRM básico de leads (sessões anteriores).
2. Arquitetura em 14 fases desenhada com a cliente — referência de fundo antiga; **não existe documento com a lista completa em lugar nenhum** (confirmado buscando no histórico do git) — só existiu em conversa, tratar com cautela se ela se referir a isso.
3–10. Ondas Lead→Cliente→Contrato→Caso, Frentes, Financeiro, Notificações, sidebar reorganizada, Recorrentes, 5 áreas reais, Prazos (hoje Atividades), Notificações arquiváveis + Visão Geral 12 KPIs, Kanban de Leads.
11. Fila de 6 itens grandes — **concluída**.
12. Drill-down + gráficos na Visão Geral — **concluído**.
13. Financeiro Fase 1 — **concluído**.
14. Financeiro Fase 2 — **concluído**.
15. **PWA do painel admin** — **concluído** (seção 8.4).
16. **Domínio próprio conectado** (Cloudflare + Vercel) — **concluído** (seção 8.6).
17. **Diagnóstico crítico + roadmap de CRM jurídico definido em 8 ondas** — ondas 1 (Storage/Documentos) e 2 (Atividades: rename/Central/Kanban/Agenda/exclusão) **concluídas**; ondas 3–8 pendentes (seção 8.5).

## 10. Preferências e padrões de trabalho da cliente

- **"Quero sempre que você me mostre antes"** — mockup/Artifact antes de qualquer mudança estrutural ou visual. Mudanças pequenas e bem especificadas não precisam. Confirmado repetidamente, inclusive nesta sessão pro Kanban/Agenda de Atividades e pro PWA (mockup visual mesmo sendo puramente técnico/infra).
- **É direta e não hesita em pedir ajuste** pós-entrega, mesmo depois de aprovar mockup. Tratar como normal, sem fricção. Exemplo desta sessão: pediu exclusão de atividades e Kanban/Agenda como adendo à Onda 2, depois de eu já ter perguntado se queria seguir pra próxima onda.
- **Traz briefings às vezes claramente adaptados de outro contexto/projeto** — ela mesma autoriza confiar no raciocínio sobre a arquitetura real do app em vez do texto literal, mas sempre **traduzir e confirmar o escopo antes de codar**. O pedido do CRM jurídico grande desta sessão é o exemplo mais recente e mais denso disso — pedia até schema com nomenclatura genérica de SaaS, traduzido pro que já existia no projeto.
- **Pedidos grandes devem ser fatiados**: propor fases/escopo reduzido via `AskUserQuestion` com opção recomendada. Ela sempre aceitou quando bem justificado, inclusive o roadmap de 8 ondas inteiro.
- **Decisões de arquitetura com implicação de custo ou dado sensível são dela, não minha**: ela decidiu explicitamente sobre integração de tribunal (gratuita) e financeiro pessoal (tabelas separadas) — não presumir esse tipo de decisão sozinho no futuro, mas também não ter medo de recomendar uma opção clara com justificativa técnica (ela responde bem a isso).
- Prefere que decisões de copy jurídica/institucional sejam extraídas dela via pergunta estruturada, não inventadas.
- Atenção a compliance da OAB (Provimento 205/2021) em qualquer copy pública nova.
- Muda de prioridade com frequência — sempre perguntar qual o próximo passo em vez de presumir.
- **Sempre pede confirmação explícita antes de cada commit e de cada push/deploy**, mesmo em sequência. Confirmado à risca durante toda a sessão, incluindo quando o deploy da Vercel travou e precisou de redeploy manual.
- **Quando algo trava fora do meu controle (ex.: fila da Vercel)**, ela prefere ser informada com clareza do que é e não é problema do código, e decidir junto se vale esperar ou agir — não gosta de ficar no escuro sobre o que está acontecendo.

## 11. Como retomar

1. Ler este arquivo primeiro (auto-suficiente).
2. **Próximo passo mais provável**: as 3 entregas da reorganização adiantada (Agenda independente, tela do caso com linha do tempo, Motor de Fluxo — seção 8.7) e a Onda 3 original já foram feitas. **Verificar se a última entrega (Motor de Fluxo) já foi commitada/pushada** antes de assumir que está em produção (pode ter ficado pendente de confirmação no fim da sessão). Depois disso, **perguntar o que ela quer a seguir** — não presumir próxima onda, ela muda de prioridade com frequência. Candidatos naturais: completar o resto da Onda 4 original (minutas/SLA por etapa/cobrança por hora, ver seção 8.5), ou seguir pras Ondas 5-8 do roadmap original.
3. Se for continuar a reorganização adiantada ou o roadmap de ondas: reler a seção 8.5 e a 8.7 inteiras antes de começar (têm as decisões já confirmadas — não re-perguntar sobre financeiro pessoal/portal do cliente/minutas/fonte de integração de tribunal (Comunica PJe, não DataJud)/layout da linha do tempo do caso/estrutura do Motor de Fluxo/Agenda separada).
4. Não tocar em `components/admin/AdminSidebar 2.tsx` nem `.git/refs/heads/main 2` (arquivos estranhos, sem decisão) nem em `HANDOFF.md`-adjacent sem perguntar.
5. Verificação padrão antes de qualquer commit: `npx eslint .` + `npm run build` limpos + teste manual no browser com dado real no Supabase (sempre limpar depois).
6. Ver seção 6 pras notas de teste via automação de browser (drag-and-drop, `onBlur`, inputs controlados, cache de console) antes de gastar tempo debugando algo que pode ser só limitação da ferramenta.
7. Se o deploy da Vercel travar em "Initializing": não é o código, ver nota no fim da seção 6 — esperar ou checar a conta da cliente, nunca assumir que preciso corrigir algo.
