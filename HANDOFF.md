# Handoff — Site institucional + Sistema Operacional Jurídico, Dallila Camargo I Advocacia

> Documento de continuidade de sessão. Cole este arquivo (ou peça para o Claude ler `HANDOFF.md` na raiz do projeto) no início de uma nova conversa para retomar exatamente de onde paramos, sem precisar reprocessar todo o histórico anterior. **Consolidado em 2026-07-18** a partir de uma sessão muito longa — o texto abaixo é o estado atual, não uma narrativa cronológica completa (essa fica resumida na seção 9, se precisar).

## 1. Quem é a cliente e o que é o projeto

**Dallila Camargo** — advogada sócia única, especialista em **Direito Digital**, OAB/PA nº 36.762, sediada em Redenção/PA, atendimento 100% remoto em todo o Brasil. O projeto é ao mesmo tempo (a) o site institucional público (landing pages + blog) e (b) um **sistema operacional de escritório** completo (CRM, gestão de casos/contratos, financeiro, notificações, analytics) — ela pediu explicitamente para o painel deixar de ser "um formulário de captação bonito" e virar uma ferramenta de operação real do escritório.

- **Repositório**: `github.com/dallilacamargoadv/escritorio-dallilacamargoadv` (público)
- **Deploy**: Vercel, projeto `escritorio-dallilacamargoadv` (`prj_oWeeWYZYerDMaefVIbBbtGhaqZVD`, team `team_AUWkl211AzsfpkSeCj38JNhY`)
- **URL de produção**: `https://escritorio-dallilacamargoadv.vercel.app` (domínio próprio `dallilacamargoadv.com.br` ainda não configurado)
- **Banco de dados**: Supabase, projeto `zojcjeinftoscpmkwtdi`, região `sa-east-1`
- **Diretório local do projeto**: `/Users/dallilacamargo/Documents/CLAUDE CODE - ESTRUTURACAO/escritorio-dallilacamargoadv`
- **Fuso horário do negócio**: `America/Belem` (UTC-3 fixo, Brasil não tem mais horário de verão) — usado em qualquer cálculo de data/hora que precise refletir "o dia da cliente", nunca UTC puro.

## 2. Stack técnica

- **Next.js 16.2.10** (App Router, Turbopack) — breaking changes vs. Next.js "clássico": `proxy.ts` (não `middleware.ts`, export `proxy`), `params`/`searchParams` são `Promise` (sempre `await`), tipos `PageProps<'/rota/[id]'>` e `RouteContext<'/rota/[id]'>` gerados automaticamente. Há um `AGENTS.md` no repo avisando disso — **leia antes de mexer em rotas**.
- **React 19.2**, **Tailwind CSS v4** (`@theme inline` em `app/globals.css`, sem `tailwind.config.ts`)
- **Supabase**: Postgres com RLS + Supabase Auth + `@supabase/ssr`. Cliente de service role (`lib/supabase/service.ts`) para contextos sem sessão de usuário (os crons).
- **GSAP + ScrollTrigger**, **Recharts**, **lucide-react**, **xlsx**, **next-mdx-remote/rsc** (blog), **@dnd-kit/core + @dnd-kit/utilities** (Kanban de Leads — `@dnd-kit/sortable` NÃO é usado, foi instalado por engano e removido)
- **Vercel Cron** (`vercel.json`): `/api/cron/notificacoes` (11h UTC) e `/api/cron/leads-cadencia` (11h05 UTC) — ambos 1x/dia, bate com o plano Hobby e com a rotina real da cliente (confere o painel de manhã).

## 3. Identidade visual (brand book)

Dark theme default (`--bg: #2a070c`, `--gold: #9f8e87`, `--wine: #b5495a`, `--ink: #ddc8b3`), light theme via `data-theme`. Tipografia: **Fraunces** (display/serif), **Inter** (corpo), **JetBrains Mono** (eyebrow/dados tabulares). Logo abelha/mariposa dourada (`components/ui/Logo.tsx`).

**Paleta categórica de gráficos**: `app/globals.css` define `--chart-1`..`--chart-6` (fixas entre temas, não trocam com light/dark) mapeadas em `lib/admin-labels.ts::FORM_TYPE_CHART_COLORS` pras 5 áreas + `CHART_COLOR_OUTROS` pro resto. Construída e **validada com o script de acessibilidade da skill `dataviz`** (contraste + separação por daltonismo contra os dois fundos da marca) — não escolhida no olho. Ordem fixa: Contratos Digitais → Propriedade Intelectual → Contas e Plataformas → Golpes Virtuais → Assessoria Estratégica → Outros. **Ao adicionar um gráfico novo com múltiplas séries, reusar essa paleta em vez de inventar cores.**

**Padrão de gráfico com Recharts**: `components/admin/LeadCharts.tsx` é a referência original (BarChart horizontal, PieChart/donut, AreaChart). `components/admin/OverviewCharts.tsx` estendeu o padrão com `RadialBarChart` (gauge de percentual, ex.: SLA cumprido). Sempre dentro de `ResponsiveContainer`, cores via CSS vars, `Tooltip contentStyle` com o mesmo objeto de estilo (`background: var(--surface)`, `border: 1px solid var(--hairline-strong)`, `fontSize: 12`, `color: var(--ink)`).

Ver `app/globals.css` para os tokens completos.

## 4. Estrutura de rotas atual

**Site público** (`app/(site)/`): `/`, `/sobre`, `/contato`, as **5 áreas** (`/contratos`, `/propriedade-intelectual`, `/contas-e-plataformas`, `/golpes-virtuais`, `/assessoria-estrategica`), `/blog`, `/blog/[slug]`, `/blog/categoria/[categoria]`, páginas legais. `lib/site-data.ts::SERVICE_AREAS` é a fonte única dessas 5 áreas. Rodapé de artigos do blog não tem CTA de contato direto (conformidade Provimento 205/2021 da OAB).

**Painel admin** (`app/(admin)/`, protegido por `proxy.ts`):

```
/admin                             Visão Geral — 12 KPIs clicáveis (drill-down em modal) em 3 blocos
                                    (Financeiro/Operação/Funil), Operação e Funil com alternância
                                    Cards/Gráfico, filtro de período, notificações, refresh 30min
/admin/leads                       Toggle Kanban (17 colunas) / Lista, com filtro de período
/admin/analise-aprofundada         Tráfego/UTMs/canais/geografia/comportamento dos leads
/admin/prazos, /novo, /[id]        Prazos (processual/compromisso/tarefa), filtro de período
/admin/clientes, /novo, /[id], /[id]/editar
/admin/casos, /novo, /[id]         + frentes (judicial/extrajudicial/administrativo), filtro de
                                    período, cada frente com toggle "visível pro cliente"
/admin/casos/[id]/relatorio        NOVO — relatório interno do caso (print-first, tudo)
/admin/casos/[id]/relatorio-cliente NOVO — relatório curado pro cliente (só o marcado como visível)
/admin/relatorios                  NOVO — lista de casos com link direto pros dois relatórios
/admin/contratos, /novo, /[id]     (tipo projeto|recorrente)
/admin/recorrentes                 Visão dedicada de contratos recorrentes (MRR, vencimentos)
/admin/financeiro                  REMODELADO — ver seção 8, item "Financeiro Fase 1"
/admin/financeiro/novo, /[id], /[id]/recibo
/admin/metas                       NOVO — Painel de Metas, 5 tiers de faturamento fixos
/admin/links                       NOVO — Hub de Links (grupos + bookmarks com preview embutido)
/admin/notificacoes                Abas Ativas/Arquivo (arquivar não apaga, só sai da lista)
/admin/blog/*
```

**Sidebar** (`components/admin/AdminSidebar.tsx`), grupos e ordem atual:
- **Operação**: Visão Geral, Leads, Análise Aprofundada
- **Prazos**: Prazos (badge = atrasados + próximos 7 dias)
- **Jurídico**: Clientes, Casos, Relatórios, + sub-itens das 5 áreas reais (linkam pra `/admin/casos?area=<formType>`, via `JuridicoAreaSubnav.tsx`)
- **Finanças**: Contratos, Recorrentes, Financeiro, Metas
- **Sistema**: Blog, Links, Notificações (badge = não lidas)

**API routes** (`app/api/admin/*` e `app/api/cron/*`): `clientes`, `clientes/[id]`, `contratos`, `contratos/[id]`, `casos`, `casos/[id]`, `casos/[id]/frentes`, `casos/[id]/frentes/[frenteId]`, `casos/[id]/frentes/[frenteId]/visibilidade` (toggle visível-pro-cliente), `financeiro`, `financeiro/[id]`, `financeiro/[id]/cancelar` (NOVO), `despesas`, `despesas/[id]` (NOVO), `link-grupos`, `link-grupos/[id]` (NOVO), `links`, `links/[id]`, `links/metadata` (busca título da URL) (NOVO), `notificacoes`, `notificacoes/[id]`, `prazos`, `prazos/[id]`, `leads` (POST cadastro manual), `leads/[id]/status`, `leads/[id]/notes`, `leads/export`, `cron/notificacoes`, `cron/leads-cadencia`.

## 5. Banco de dados (Supabase — projeto `zojcjeinftoscpmkwtdi`)

**Princípio de schema repetido em todo o sistema**: sempre que uma entidade precisa referenciar "uma de várias outras tabelas", usa **múltiplas FKs nullable** (uma coluna por tabela-alvo possível), nunca uma coluna genérica tipo `entidade_tipo`/`entidade_id`. Repetido em `notificacoes`, `prazos`.

- **`leads`**: `id, created_at, form_type (enum lead_form_type), scope_key, name, email, whatsapp, answers (jsonb), utms (jsonb), metadata (jsonb), duplicate_of, status (enum lead_status), sla_due_at, first_contacted_at`. RLS: `anon` insert (form público), `authenticated` select/insert/update/delete.
  - **`status` (enum `lead_status`)**: `leads, contactados, em_andamento, proposta_enviada, link_enviado, f1_01_dia..f8_15_dias, grupo_criado, reuniao_agendada, salesfarming, perdido, cliente` (18 valores). F1-F8 avançam automaticamente via cron (`app/api/cron/leads-cadencia/route.ts`).
- **`lead_notes`**: notas internas por lead.
- **`clientes`**: `id, lead_id (nullable, FK leads), tipo_pessoa (pf|pj), nome_razao_social, documento, email, whatsapp, endereco (jsonb), area_origem (lead_form_type, nullable), created_at`.
- **`contratos`**: `id, cliente_id (FK, restrict), tipo (projeto|recorrente), status (rascunho|enviado|assinado|encerrado|cancelado), valor, periodicidade (texto livre), assinado_em, created_at`.
- **`casos`**: `id, contrato_id (FK, restrict — só existe caso com contrato assinado), area (lead_form_type), titulo, status (aberto|em_andamento|aguardando_cliente|concluido|arquivado), aberto_em, encerrado_em`.
- **`caso_frentes`**: `id, caso_id (FK, cascade), tipo (extrajudicial|judicial|administrativo), orgao, numero_processo, status (aberta|em_andamento|concluida|arquivada), aberta_em, encerrada_em, visivel_cliente (boolean, default true — NOVO)`.
- **`financeiro_lancamentos`**: `id, contrato_id (FK, restrict), cliente_id (FK, restrict), descricao, valor, vencimento, status (enum financeiro_status: pendente|pago|**cancelado** — NOVO valor adicionado via `alter type ... add value`), pago_em, grupo_id`. "Atrasado" é **calculado na tela** (`lib/financeiro-utils.ts::isLancamentoAtrasado`), não é status guardado.
- **`prazos`**: `id, tipo (processual|compromisso|tarefa), titulo, data, hora (nullable), caso_frente_id/caso_id/cliente_id (3 FKs nullable, cascade), status (pendente|concluido|cancelado), concluido_em, visivel_cliente (boolean, default true — NOVO)`.
- **`notificacoes`**: `id, tipo (lead_sla|financeiro_vencimento|blog_rascunho), titulo, lead_id/financeiro_id/post_id (FKs nullable), lida, created_at`.
- **`posts`**: blog.
- **`link_grupos`** (NOVA): `id, titulo, posicao, created_at`.
- **`links`** (NOVA): `id, grupo_id (FK, cascade), titulo, url, tipo (enum: google_docs|google_sheets|google_slides|youtube|pdf|generico, auto-detectado por regex na URL ao criar), posicao, created_at`.
- **`despesas`** (NOVA): `id, categoria (text, taxonomia fixa em `lib/despesas-categorias.ts`, ~11 categorias × subcategorias, não é CHECK constraint no banco — flexível de propósito), subcategoria (text, nullable), descricao, fornecedor (text, nullable), valor, vencimento (date), pago_em (timestamptz, nullable), status (enum despesa_status: a_pagar|pago|cancelado), forma_pagamento (text, nullable), recorrencia (enum despesa_recorrencia: nenhuma|mensal|trimestral|semestral|anual), centro_custo (text, nullable), observacoes (text, nullable), grupo_id (uuid, nullable — reservado pra uso futuro), created_at`. "Vencida" é calculada na tela (`lib/financeiro-utils.ts::isDespesaVencida`), mesmo princípio da `financeiro_lancamentos`.

**RLS**: todas as tabelas de negócio (incluindo as 3 novas: `link_grupos`, `links`, `despesas`) são **`authenticated`-only** pra select/insert/update/delete — **nunca** `auth.uid() = user_id` (esse projeto tem uma única usuária, não é multi-tenant; esse ponto já foi mal-sugerido uma vez num briefing externo e corrigido conscientemente, ver seção 8). Exceção de sempre: `leads` aceita `insert` de `anon` também (form público).

**Enum órfão inofensivo**: `lead_form_type` tem um valor `assessoria_recorrente` que sobrou de uma tentativa revertida de 6ª área pública — não vale a pena remover.

## 6. Padrões e convenções importantes do código

- **`useSyncExternalStore`** para qualquer valor dependente de `window`/`localStorage`/`matchMedia`. Nunca `useState`+`useEffect` pra isso.
- **ESLint `react-hooks/purity`**: proíbe chamar funções impuras (`Date.now()`, `Math.random()`) ou mutar variável diretamente no corpo de um componente durante a renderização. Correção: extrair pra função auxiliar de módulo (não-componente) e chamar de dentro. Exemplos: `isLancamentoAtrasado`/`isDespesaVencida`/`isPrazoAtrasado`, `computeDonutSegments` em `lib/analytics.ts`.
- **Fronteira Server/Client**: importar de um `lib/db-*.ts` (usa `next/headers`) num Client Component só é seguro com `import type` **puro** (nenhum valor real do mesmo import) — o bundler erasa tipos automaticamente. Se precisar de uma função pura também, ela tem que morar num arquivo sem import de servidor (`lib/financeiro-utils.ts`, `lib/prazos-utils.ts`, `lib/analytics.ts`, `lib/date-range.ts`, `lib/overview-kpis.ts`, `lib/metas.ts`, `lib/financeiro-fase1.ts`, `lib/link-tipo.ts`, `lib/despesas-categorias.ts`).
- **`useSearchParams()` em Client Component num layout amplo** quebra o build de prerender. Solução: isolar num componente-folha + `<Suspense fallback={null}>` (ver `JuridicoAreaSubnav.tsx`).
- **`@dnd-kit` + SSR**: hydration mismatch inofensivo pelos ids de acessibilidade. Solução: `next/dynamic(..., { ssr: false })` a partir de um Client Component pai.
- **Timezone**: sempre `America/Belem` explícito, nunca `new Date()` cru. Cuidado com `new Date("YYYY-MM-DD")` (interpretado como meia-noite UTC) — reconstruir com offset explícito `` `${dataStr}T00:00:00-03:00` ``.
- **`RouteContext<'/api/rota/[id]'>`** pra `params` em route handlers; **`PageProps<'/rota/[id]'>`** pra páginas — sempre `await`.
- **FKs múltiplas nullable em vez de polimorfismo genérico**.
- **`on delete restrict` vs `cascade`**: "pai tem valor jurídico/financeiro próprio" → `restrict`. "Filho não faz sentido sem o pai" → `cascade`.
- **Padrão de arquivo por entidade**: `lib/db-<entidade>.ts` + `app/api/admin/<entidade>/route.ts` + `.../[id]/route.ts` + componente de lista (`"use client"`) + formulário único create/edit + página Server Component fina.
- **Labels/cores compartilhados** em `lib/admin-labels.ts` — nunca duplicar `Record<>` em componentes.
- **Filtro de período reutilizável**: `lib/date-range.ts` + `components/admin/DateRangeFilter.tsx` — usado em Leads/Casos/Prazos/Financeiro/Análise Aprofundada. **Não é usado** na régua de KPIs do Financeiro nem no Painel de Metas — esses dois são sempre "mês corrente vs. mês anterior" (bucket por mês, ver `lib/metas.ts` e `lib/financeiro-fase1.ts`), um padrão diferente e deliberado.
- **Drill-down por modal**: `components/admin/QuickViewModal.tsx` (genérico: `QuickViewModal` + `QuickViewRow` + `QuickViewEmpty`) é o padrão pra "card clicável → lista filtrada → linha leva pra página completa ou abre outro modal". Usado hoje só na Visão Geral (`AdminOverviewClient.tsx`); reaproveitar em vez de criar modal novo se surgir outro drill-down. Segue o mesmo estilo visual do `LeadDetailModal.tsx` (`fixed inset-0 z-50 bg-black/70`, painel `border-hairline bg-surface`, `role="dialog"`).
- **Bug real já corrigido — nunca aninhar `<button>` dentro de `<button>`/`<a>`**: HTML inválido, causa hydration error e cliques inconsistentes/perdidos no React (aconteceu no Hub de Links, card de link clicável com botão de excluir dentro). Sempre estruturar como elementos irmãos dentro de um `<div>` `position:relative`, nunca aninhados.
- **CSP em `next.config.ts`**: qualquer embed externo novo (iframe, `<img>` de domínio de terceiro) precisa entrar explicitamente em `img-src`/`frame-src` da Content-Security-Policy, senão funciona em dev e quebra silenciosamente em produção. Já tem `img.youtube.com` (thumbnail) e `docs.google.com`/`youtube.com` (embed) liberados pro Hub de Links.
- **Recibo em PDF / Relatório de caso, sem biblioteca nova**: página HTML estilizada com os tokens de marca + `window.print()`, sem CSS de impressão especial (`print:hidden` no Tailwind pra esconder sidebar/chrome). Mesmo princípio nos dois relatórios de caso.
- Nunca commitar/pushar/deployar sem pedir permissão explícita antes — **cada vez**, mesmo em sequência, mesmo que o passo anterior tenha sido aprovado segundos atrás.
- Verificação padrão antes de qualquer commit: `npx eslint .` e `npm run build` limpos, teste manual no browser local com escrita/leitura real no Supabase (inserindo dado de teste variado, conferindo os números na tela, **sempre limpando os dados de teste depois via `execute_sql`**). Esse hábito já pegou bugs reais (fuso horário em parcelamento financeiro e em volume semanal do analytics) e confirmou cálculos complexos (régua financeira, projeção de metas).
- **Ferramenta de automação de browser** tem dificuldade com drag-and-drop e às vezes fica instável quando duas sessões editam o mesmo dev server ao mesmo tempo (HMR concorrente pode fazer cliques "sumirem"). Nesses casos: (a) teste a chamada de API diretamente via `javascript_tool` com `fetch(...)` em vez de insistir no clique, ou (b) use `document.querySelectorAll` + `.click()` via `javascript_tool` pra disparar o handler React direto, contornando problemas de scroll/posição do elemento. Ambos validados nesta sessão com sucesso.
- **Tabelas largas** (`overflow-x-auto`): a ferramenta de scroll horizontal da automação de browser é limitada (`scroll_amount` máximo 10) — pode não revelar colunas de ação à direita. Prefira `javascript_tool` pra localizar/clicar botões dentro de uma tabela larga em vez de tentar scrollar até lá.

## 7. Estado atual em produção

**Tudo commitado, pushado e em produção (Vercel, `READY`)** até o commit `d82fb72`. Isso inclui, em ordem cronológica desta sessão longa:
- Kanban de Leads (17 colunas) + cadência automática — já estava em produção antes desta sessão.
- Análise Aprofundada (`78dfaa7`).
- **Item 1** — Filtros de período clicáveis em Leads/Casos/Prazos/Financeiro/Visão Geral (`67e1325`).
- **Item 2** — Relatórios de caso interno + cliente, com controle de visibilidade por frente/prazo (`28368ee`), mais a tela "Relatórios" na sidebar pra escolher o caso primeiro (`72898c3`, pedido depois que ela testou e achou difícil de achar).
- **Item 3** — Painel de Metas, 5 tiers fixos R$20k/30k/40k/60k/80k (`b617284`).
- **Item 4** — Hub de Links (`337de88`).
- Drill-down por modal + gráficos (donut/barra/gauge) nos 12 KPIs da Visão Geral (`49532fc`).
- Financeiro remodelado, Fase 1 — despesas, régua de KPIs, Receita x Despesa, tabela unificada (`d82fb72`).

**Arquivo estranho, sem decisão**: `components/admin/AdminSidebar 2.tsx` (untracked, provável duplicata de conflito do iCloud Drive) — já foi apontado pra cliente, ela ainda não decidiu se apaga. Não mexer sem perguntar de novo.

**Duas variáveis de ambiente pendentes no Vercel** (só a cliente pode configurar):
- `CRON_SECRET` (protege os dois endpoints de cron)
- `SUPABASE_SERVICE_ROLE_KEY` (Settings → API, secreta, nunca em `NEXT_PUBLIC_*`)

Sem essas duas, os crons diários não funcionam em produção — o resto do painel funciona normal. **Ainda não confirmado se ela configurou** — perguntar se for relevante (ex.: se notificações de vencimento não estiverem chegando).

## 8. Pedidos grandes — estado por item

### 8.1 Fila original de 6 itens (sequenciada 6→1→2→3→4) — **TODOS CONCLUÍDOS**

1. ✅ Filtros de período — `lib/date-range.ts` + `DateRangeFilter.tsx`, aplicado em Leads/Casos/Prazos/Financeiro/Visão Geral.
2. ✅ Relatórios de caso — dois relatórios por caso (interno completo / cliente curado), toggle "visível pro cliente" por frente e por prazo, tela "Relatórios" na sidebar pra escolher o caso primeiro.
3. ✅ Painel de Metas — 5 tiers fixos, faturamento pago do mês corrente, histórico de 6 meses.
4. ✅ Hub de Links — grupos + links com preview embutido (Google Docs/Sheets/Slides/YouTube), auto-save, detecção automática de tipo e busca de título.
5. ✅ Captura de dados ocultos do lead — já estava pronto antes desta sessão.
6. ✅ Análise Aprofundada — tráfego/canais/geografia/comportamento.

### 8.2 Drill-down + gráficos na Visão Geral — **CONCLUÍDO**

Pedido novo, veio depois da fila original: "ao clicar em qualquer card, abrir modal com os itens; clicar num item abre o detalhe" + "adicionar gráficos (tabela/pizza/barra/gauge) onde fizer sentido". Escopo **combinado e reduzido** antes de codar (ela confirmou todas as opções recomendadas):
- Só a Visão Geral por enquanto (não o painel inteiro).
- Modais são visualização rápida — não substituem as páginas completas de edição já existentes.
- Gráficos só na Visão Geral primeiro (Funil → donut, Operação → barra, SLA → gauge; Financeiro fica só como cards, escalas de R$ muito diferentes pra um gráfico comparativo).

Entregue: `QuickViewModal.tsx` (genérico), `OverviewCharts.tsx` (donut/barra/gauge via Recharts), `lib/overview-kpis.ts` estendido pra expor as listas por trás de cada contagem, `AdminOverviewClient.tsx` reescrito.

### 8.3 Financeiro remodelado — **FASE 1 CONCLUÍDA, FASE 2 PENDENTE**

Pedido veio como um briefing muito denso (19 seções, com schema Supabase completo sugerido) — **claramente adaptado de outro projeto/contexto SaaS multi-tenant**, precisou de tradução arquitetural cuidadosa antes de implementar, não implementação literal. Duas decisões críticas tomadas **antes de codar**, com autorização explícita dela pra eu corrigir o que estivesse errado:

- **RLS**: o texto sugeria `auth.uid() = user_id` (modelo multi-tenant). **Errado pra esse projeto** — uma usuária só, todas as outras tabelas já usam `authenticated`-only. Segui o padrão do resto do sistema.
- **Schema**: o texto sugeria criar `financial_transactions` + `invoices` do zero, o que teria **fragmentado** os dados financeiros de tudo que já lê `financeiro_lancamentos` (Contratos, Recorrentes, Metas, drill-down da Visão Geral, Relatórios de caso). Em vez disso: **reaproveitei** `financeiro_lancamentos` como base de receita/fatura (só ganhou o status `cancelado` a mais) e criei **só o que era genuinamente novo**: a tabela `despesas`.

**Fase 1 (entregue, commit `d82fb72`)**:
- Tabela `despesas` nova + status `cancelado` em `financeiro_lancamentos`.
- Categorias/subcategorias de despesa **fixas no código** (`lib/despesas-categorias.ts`), não uma tabela editável pelo painel — decisão consciente de escopo.
- `FinanceiroDashboard.tsx` (substituiu `FinanceiroAdminList.tsx`, que foi apagado por ficar órfão): banner de alertas de vencimento, 6 KPIs com comparativo vs. mês anterior (Receita/Despesas/Resultado líquido/Em aberto/Inadimplência/Projeção), bloco Receita x Despesa, tabela unificada (receita + despesa) com filtros, empty state melhorado.
- Botão único "Novo lançamento" → modal de escolha Receita/Despesa (Receita leva pro formulário que já existia; Despesa abre `DespesaModal.tsx` novo).
- Despesa: editar/marcar pago/excluir inline na tabela. Receita: continua indo pra página de detalhe já existente, que ganhou a ação "Cancelar lançamento".

**Fase 2 — NÃO iniciada, é o próximo passo natural se ela quiser continuar no Financeiro**:
- Projeções trimestrais/semestrais/anuais (a lógica proposta no briefing original é simples — receitas recorrentes + faturas abertas + média histórica — dá pra seguir ela quase literalmente quando chegar a hora).
- Bloco "Análise financeira" / insights (maior categoria de despesa, cliente com maior receita, alertas de benchmark tipo "despesas consumiram X% da receita").
- Categorias de despesa editáveis pelo painel (hoje fixas no código).
- Sugestão automática de categoria ao digitar a descrição da despesa.

## 9. Cronologia resumida (mais recente por último) — visão de alto nível

1. Site institucional completo + CRM básico de leads (sessões anteriores).
2. Arquitetura em 14 fases desenhada com a cliente — referência de fundo, implementação seguiu por ondas priorizadas por ela.
3. **Onda 1**: ciclo Lead→Cliente→Contrato→Caso.
4. **Onda 2**: Frentes de caso, Financeiro completo, Notificações + cron diário.
5. Tentativa de 6ª área pública revertida na mesma sessão (resquício: enum órfão inofensivo).
6. Sidebar reorganizada + tela Recorrentes.
7. Jurídico dividido pelas 5 áreas reais.
8. Módulo de Prazos do zero.
9. Notificações arquiváveis + Visão Geral com 12 KPIs.
10. Kanban de Leads (17 colunas) + cadência automática.
11. Fila de 6 itens grandes — **todos concluídos** (seção 8.1).
12. Drill-down por modal + gráficos na Visão Geral (seção 8.2) — **concluído**.
13. Financeiro remodelado, Fase 1 (seção 8.3) — **concluído**, Fase 2 pendente.

## 10. Preferências e padrões de trabalho da cliente

- **"Quero sempre que você me mostre antes"** — mockup/Artifact antes de qualquer mudança estrutural ou visual. Mudanças pequenas e bem especificadas não precisam. Confirmado repetidamente durante toda a sessão — nunca pular esse passo em telas novas ou reformulações grandes.
- **É direta e não hesita em pedir ajuste**, inclusive depois de aprovar um mockup e ver a coisa implementada — ex.: aprovou o desenho dos Relatórios de caso, mas depois de usar pediu um ponto de entrada mais fácil (tela "Relatórios" na sidebar). Tratar pedidos de ajuste pós-entrega como normais, sem fricção.
- **Traz briefings às vezes claramente adaptados de outro contexto/projeto** (a fila original de 6 itens, e principalmente o briefing do Financeiro com schema multi-tenant sugerido). Ela mesma já disse explicitamente pra eu confiar no meu raciocínio sobre a arquitetura real do app mais do que no texto literal dela nesses casos — mas sempre **traduzir e confirmar o escopo antes de codar**, nunca implementar literalmente sem checar contra o que já existe.
- **Pedidos grandes devem ser fatiados**: quando o pedido é denso (muitas seções, muitos componentes), propor fases/escopo reduzido via `AskUserQuestion` com opção recomendada, em vez de tentar entregar tudo de uma vez. Ela sempre aceitou a fase reduzida quando bem justificada.
- Prefere que decisões de copy jurídica/institucional sejam extraídas dela via pergunta estruturada, não inventadas.
- Atenção a compliance da OAB (Provimento 205/2021) em qualquer copy pública nova.
- Muda de prioridade com frequência — sempre perguntar qual o próximo passo em vez de presumir.
- **Sempre pede confirmação explícita antes de cada commit e de cada push/deploy**, mesmo em sequência — nunca presumir aprovação prévia se estende ao próximo passo. Confirmado à risca a sessão toda.

## 11. Como retomar

1. Ler este arquivo primeiro (auto-suficiente).
2. Confirmar com a cliente qual é o próximo passo — as opções mais prováveis:
   - **Financeiro Fase 2** (projeções, insights, categorias editáveis, sugestão automática) — próximo passo natural do que acabou de ser entregue.
   - Ajuste em algo já entregue.
   - Uma ideia nova.
3. Se for Fase 2 do Financeiro: reaproveitar `lib/financeiro-fase1.ts` (já tem o padrão de bucket por mês em `America/Belem`) e o padrão de `lib/metas.ts` pra projeções; mockup antes de codar, como sempre.
4. Não tocar em `components/admin/AdminSidebar 2.tsx` (arquivo estranho, sem decisão) nem em `HANDOFF.md`-adjacent sem perguntar.
5. Verificação padrão antes de qualquer commit: `npx eslint .` + `npm run build` limpos + teste manual no browser com dado real no Supabase (sempre limpar depois).
