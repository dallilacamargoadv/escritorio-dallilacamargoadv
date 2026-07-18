# Handoff — Site institucional + Sistema Operacional Jurídico, Dallila Camargo I Advocacia

> Documento de continuidade de sessão. Cole este arquivo (ou peça para o Claude ler `HANDOFF.md` na raiz do projeto) no início de uma nova conversa para retomar exatamente de onde paramos, sem precisar reprocessar todo o histórico anterior.

## 1. Quem é a cliente e o que é o projeto

**Dallila Camargo** — advogada sócia única, especialista em **Direito Digital**, OAB/PA nº 36.762, sediada em Redenção/PA, atendimento 100% remoto em todo o Brasil. O projeto começou como o site institucional (landing pages + blog) e evoluiu, dentro desta mesma sessão, para um **sistema operacional de escritório** completo (CRM, gestão de casos/contratos, financeiro, notificações) — a cliente pediu explicitamente para o painel deixar de ser "um formulário de captação bonito" e virar uma ferramenta de operação real do escritório.

- **Repositório**: `github.com/dallilacamargoadv/escritorio-dallilacamargoadv` (público)
- **Deploy**: Vercel, projeto `escritorio-dallilacamargoadv` (`prj_oWeeWYZYerDMaefVIbBbtGhaqZVD`, team `team_AUWkl211AzsfpkSeCj38JNhY`)
- **URL de produção**: `https://escritorio-dallilacamargoadv.vercel.app` (domínio próprio `dallilacamargoadv.com.br` ainda não configurado)
- **Banco de dados**: Supabase, projeto `zojcjeinftoscpmkwtdi`, região `sa-east-1`
- **Diretório local do projeto**: `/Users/dallilacamargo/Documents/CLAUDE CODE - ESTRUTURACAO/escritorio-dallilacamargoadv`

## 2. Stack técnica

- **Next.js 16.2.10** (App Router, Turbopack) — breaking changes vs. Next.js "clássico": `proxy.ts` (não `middleware.ts`, export `proxy`), `params`/`searchParams` são `Promise` (sempre `await`), tipos `PageProps<'/rota/[id]'>` e `RouteContext<'/rota/[id]'>` gerados automaticamente. Há um `AGENTS.md` no repo avisando disso.
- **React 19.2**, **Tailwind CSS v4** (`@theme inline` em `app/globals.css`, sem `tailwind.config.ts`)
- **Supabase**: Postgres com RLS + Supabase Auth + `@supabase/ssr`. Cliente de service role (`lib/supabase/service.ts`, novo nesta sessão) para contextos sem sessão de usuário (o cron de notificações).
- **GSAP + ScrollTrigger**, **Recharts**, **lucide-react**, **xlsx**, **next-mdx-remote/rsc** (blog)
- **Vercel Cron** — agora em uso (`vercel.json`, novo nesta sessão): `/api/cron/notificacoes`, 1x/dia às 11h UTC (~8h em Redenção/PA)

## 3. Identidade visual (brand book) — inalterada nesta sessão

Dark theme default (`--bg: #2a070c`, `--gold: #9f8e87`, `--wine: #b5495a`, `--ink: #ddc8b3`), light theme via `data-theme`. Tipografia: **Fraunces** (display/serif), **Inter** (corpo), **JetBrains Mono** (eyebrow/dados tabulares). Logo abelha/mariposa dourada (`components/ui/Logo.tsx`). Ver `app/globals.css` para os tokens completos — nada disso mudou nesta sessão, só foi reaproveitado.

## 4. Estrutura de rotas atual

**Site público** (`app/(site)/`): `/`, `/sobre`, `/contato`, as **5 áreas** (`/contratos`, `/propriedade-intelectual`, `/contas-e-plataformas`, `/golpes-virtuais`, `/assessoria-estrategica`), `/blog`, `/blog/[slug]`, `/blog/categoria/[categoria]`, páginas legais. **Continuam sendo 5 áreas** — uma 6ª área ("Assessoria Recorrente") foi construída e depois **totalmente revertida** nesta sessão (ver seção 6, item 5). O único resquício é um valor de enum órfão e inofensivo no Postgres (`assessoria_recorrente` em `lead_form_type`, sem nenhum lead usando).

O rodapé de artigos do blog (`app/(site)/blog/[slug]/page.tsx`) foi reescrito nesta sessão: removido o link "entre em contato" do aviso de fechamento, por questão de conformidade com o Provimento 205/2021 da OAB (captação de clientela). O texto agora só menciona a área de atuação do escritório, sem CTA direto.

**Painel admin** (`app/(admin)/`, protegido por `proxy.ts`) — cresceu muito nesta sessão:

```
/admin                      Visão Geral (KPIs + sino de notificações no canto superior direito)
/admin/leads                 Dashboard de leads (já existia)
/admin/clientes, /novo, /[id], /[id]/editar      NOVO — cadastro de clientes
/admin/casos, /novo, /[id]                        NOVO — casos jurídicos + frentes (ver seção 5)
/admin/contratos, /novo, /[id]                     NOVO — contratos (projeto/recorrente)
/admin/financeiro, /novo, /[id], /[id]/recibo      NOVO — lançamentos financeiros + recibo imprimível
/admin/notificacoes                                 NOVO — central de notificações
/admin/blog/*                                        já existia
```

**API routes novas** (todas em `app/api/admin/` ou `app/api/cron/`):
`clientes`, `clientes/[id]`, `contratos`, `contratos/[id]`, `casos`, `casos/[id]`, `casos/[id]/frentes`, `casos/[id]/frentes/[frenteId]`, `financeiro`, `financeiro/[id]`, `notificacoes`, `notificacoes/[id]`, `cron/notificacoes`.

## 5. Banco de dados (Supabase — projeto `zojcjeinftoscpmkwtdi`)

Tabelas de antes da sessão: `leads`, `lead_notes`, `posts` (sem mudança de schema nesta sessão, exceto o enum `lead_form_type` que ganhou e depois manteve um valor órfão `assessoria_recorrente`).

**Tabelas novas desta sessão** (todas com RLS: `select/insert/update` restritos a `authenticated`, nunca `anon`):

- **`clientes`**: `id, lead_id (nullable, FK leads), tipo_pessoa (pf|pj), nome_razao_social, documento, email, whatsapp, endereco (jsonb), area_origem (lead_form_type, nullable), created_at`. Nasce de um Lead convertido (preserva `lead_id`) ou é criado direto (indicação).
- **`contratos`**: `id, cliente_id (FK, restrict), tipo (projeto|recorrente), status (rascunho|enviado|assinado|encerrado|cancelado), valor, periodicidade (texto livre), assinado_em, created_at`. `assinado_em` é auto-carimbado na primeira vez que o status vira `assinado`.
- **`casos`**: `id, contrato_id (FK, restrict — obrigatório: só existe caso com contrato assinado, regra de negócio confirmada com a cliente), area (lead_form_type), titulo, status (aberto|em_andamento|aguardando_cliente|concluido|arquivado), aberto_em, encerrado_em`.
- **`caso_frentes`** (novo): `id, caso_id (FK, cascade), tipo (extrajudicial|judicial|administrativo), orgao (texto livre, ex. "INPI"/"TJPA"), numero_processo, status (aberta|em_andamento|concluida|arquivada), aberta_em, encerrada_em`. Um Caso pode ter **múltiplas frentes simultâneas ou sequenciais** (confirmado com a cliente — ex.: processo no INPI rodando junto com uma ação judicial do mesmo caso).
- **`financeiro_lancamentos`**: `id, contrato_id (FK, restrict), cliente_id (FK, restrict — redundante de propósito, evita join), descricao, valor, vencimento, status (pendente|pago), pago_em, grupo_id (nullable, uuid — marca lançamentos criados juntos num lote parcelado/recorrente)`. "Atrasado" é **calculado na tela** (pendente + vencimento no passado), não é um status guardado.
- **`notificacoes`**: `id, tipo (lead_sla|financeiro_vencimento|blog_rascunho), titulo, lead_id/financeiro_id/post_id (FKs nullable, múltiplas — nunca polimorfismo genérico, é o princípio arquitetural repetido em todo o sistema), lida, created_at`.

**Princípio de schema repetido em todo o sistema**: sempre que uma entidade precisa referenciar "uma de várias outras tabelas", usa **múltiplas FKs nullable** (uma coluna por tabela-alvo possível), nunca uma coluna genérica tipo `entidade_tipo`/`entidade_id`. Mantém integridade referencial de verdade e RLS simples.

## 6. Cronologia desta sessão (mais recente por último)

1. **Resolvido o bug de produção do handoff anterior** (Supabase env vars): a causa raiz real era o *valor* de `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` estar incorreto no Vercel (havia até duas variáveis-lixo nomeadas literalmente `Key`/`Value`, sinal de preenchimento errado) — não era cache de build, embora essa hipótese tenha sido testada primeiro. Corrigido colando os valores certos (obtidos via MCP do Supabase) e redeploy sem cache. `/admin`, `/login`, `/blog` voltaram a 200.

2. **Arquitetura em 14 fases** (conversa, sem código): a cliente pediu um desenho completo de "sistema operacional jurídico" — Dashboard, CRM (Leads/Clientes), Casos, Contratos, Documentos, Agenda, Financeiro, Blog, Usuários/Permissões, Notificações, Configurações, Auditoria, Roadmap. Aprovado fase a fase. Documento visual publicado como Artifact. Esse desenho é a referência de fundo para tudo que veio depois, mas **a implementação seguiu por ondas priorizadas pela cliente, não pela ordem das 14 fases**.

3. **Onda 1 — Clientes, Contratos, Casos** (commit `595a93d`, **já no ar em produção**): ciclo de vida completo Lead → Cliente → Contrato → Caso. Conversão de Lead em Cliente (botão no modal do lead, preserva `lead_id`, nunca duplica cadastro). Regra de negócio: Caso só existe com Contrato assinado. Sidebar reorganizada em grupos (Operação/Jurídico/Negócio/Sistema, versão inicial). Testado localmente e em produção, deploy confirmado com `200` em todas as rotas.

4. **Feedback da cliente sobre a Onda 1** → gerou a **Onda 2**: faltava filtro por área em Clientes/Casos (só existia um `<select>` escondido em Casos); Casos precisavam de "frentes" (extrajudicial/judicial/administrativo/INPI, simultâneas ou sequenciais — confirmado que varia caso a caso); Financeiro e Notificações foram adiantadas na frente de Agenda/Documentos (que ficaram para depois, por pedido explícito da cliente).

5. **Onda 2 — implementada, testada localmente e commitada** (commit `78deeee`, **ainda NÃO pushada nem deployada** — ver seção 8):
   - **Frentes de caso** (`caso_frentes`) — seção dentro da página de cada Caso.
   - **Pílulas de filtro de área** (`AreaFilterPills.tsx`) em Clientes (por áreas dos casos já atendidos, não a área de origem do lead) e Casos.
   - **Financeiro completo**: lista, lançamento único, **parcelado e recorrente em lote** (pedido extra da cliente — form gera N lançamentos mensais de uma vez, com `grupo_id` compartilhado), recibo imprimível com a identidade visual (`window.print()`, sem dependência de PDF nova). **Um bug de fuso horário foi encontrado e corrigido durante o teste**: o cálculo de "+N meses" usava `setMonth`/`getMonth` (fuso local do servidor) em vez de `setUTCMonth`/`getUTCMonth`, fazendo a última parcela de um lote cair um dia depois do esperado — corrigido em `app/api/admin/financeiro/route.ts`.
   - **Notificações**: sino com badge na sidebar + preview das últimas 4 na Visão Geral (canto superior direito, "Ver todas" → `/admin/notificacoes`) + página completa + motor de regras via `app/api/cron/notificacoes/route.ts` (protegido por `CRON_SECRET`, usa `lib/supabase/service.ts` com a service role key pra escrever sem sessão de usuário).
   - **Sidebar** ganhou os grupos Financeiro (dentro de Negócio) e Sistema/Notificações.
   - **Blog**: removido o CTA "entre em contato" do rodapé do artigo (ver seção 4).

6. **Tentativa de 6ª área "Assessoria Recorrente" — construída e depois totalmente revertida** na mesma sessão. A cliente pediu inicialmente uma nova área pública (landing + formulário + entrada no enum), fizemos a entrevista de copy completa (adaptando a skill `landing-page-advogados-tlbc`), implementamos tudo (página, formulário multi-step, API route, entrada em `lib/site-data.ts`/`lib/area-content.ts`/`lib/admin-labels.ts`), testamos em produção local com sucesso — e então a cliente percebeu que **não precisava disso como área pública** (já é coberta pela área "Assessoria Estratégica" existente); o que ela realmente queria era só uma forma de identificar esses clientes **dentro do CRM**. Tudo foi revertido (arquivos deletados, entradas removidas dos arrays/labels). **Único resquício**: o enum `lead_form_type` no Postgres ganhou o valor `assessoria_recorrente` via `ALTER TYPE ... ADD VALUE`, que não tem como ser removido sem recriar o tipo inteiro — foi deixado órfão de propósito, é inofensivo (não aparece em nenhum lugar da UI, nenhum lead usa).

7. **Descoberta importante, ainda não resolvida**: `contratos.tipo` já suporta `"recorrente"` desde a Onda 1 (`ContratoTipo = "projeto" | "recorrente"`, com label em `lib/admin-labels.ts`). Ou seja, o conceito de "cliente com assessoria recorrente" **já existe no schema** — só falta a **visão dedicada** no admin (uma tela ou filtro que mostre só clientes/contratos com `tipo = 'recorrente'`). Esse é o próximo pedido da cliente, ainda não iniciado.

## 7. Padrões e convenções importantes do código

- **`useSyncExternalStore`** para qualquer valor dependente de `window`/`localStorage`/`matchMedia`. Nunca `useState`+`useEffect` pra isso.
- **ESLint `react-hooks/purity`** (apareceu nesta sessão, além do já conhecido `set-state-in-effect`): proíbe chamar funções impuras (`Date.now()`, `Math.random()`) **diretamente dentro do corpo de um componente/hook** durante a renderização. A correção é extrair a lógica pra uma função auxiliar de módulo (não-componente, sem PascalCase) — ex.: `lib/financeiro-utils.ts::isLancamentoAtrasado()`, chamada de dentro do componente em vez de calcular inline. Isso já existia implicitamente em `getSlaState()` de `AdminDashboard.tsx` (por isso aquele nunca deu erro), só ficou explícito agora.
- **Fronteira Server/Client**: cuidado ao importar de um arquivo `lib/db-*.ts` (que usa `lib/supabase/server.ts`, que usa `next/headers`) dentro de um Client Component — mesmo que você só use um `import type`, se o **mesmo import também trouxer uma função/valor real** daquele módulo, o bundler tenta empacotar o arquivo inteiro (incluindo `next/headers`) pro browser, e o build quebra. Solução: extrair funções puras usadas por Client Components para um arquivo separado sem imports de servidor (ex.: `lib/financeiro-utils.ts`), e importar o *tipo* via `import type` do arquivo original (isso é seguro, é apagado em tempo de compilação).
- **`RouteContext<'/api/rota/[id]'>`** pra `params` em route handlers; **`PageProps<'/rota/[id]'>`** pra páginas — sempre `await`.
- **RLS**: todas as tabelas novas seguem authenticated-only (nunca anon), diferente de `leads` que aceita insert anônimo do site público.
- **FKs múltiplas nullable em vez de polimorfismo genérico** — repetido em Documentos (conceitual), Agenda (conceitual), e já implementado em `notificacoes`. É a assinatura arquitetural do sistema.
- **`on delete restrict` vs `cascade`**: `casos→contratos`, `contratos→clientes`, `financeiro_lancamentos→contratos/clientes` são `restrict` (apagar o "pai" não pode apagar silenciosamente o "filho" que tem valor jurídico/financeiro próprio). `caso_frentes→casos` é `cascade` (frente não tem sentido sem o caso).
- **Padrão de arquivo por entidade**: `lib/db-<entidade>.ts` (interfaces + `getAll`/`getById`/`create`/`update`, cliente Supabase de servidor) + `app/api/admin/<entidade>/route.ts` (GET lista, POST cria) + `.../[id]/route.ts` (GET um, PATCH atualiza) + componente de lista (`"use client"`, recebe `initial<Entidade>s`) + componente de formulário único que serve create *e* edit (prop opcional `entidade?`, branch `entidade ? PATCH : POST`) + páginas Server Component finas que só buscam dado e fazem `redirect("/login")` no catch.
- **Labels/cores compartilhados do admin** ficam centralizados em `lib/admin-labels.ts` — nunca duplicar esses `Record<>` em componentes. Onde antes havia lista hardcoded de áreas duplicada em 3+ lugares (`AdminDashboard.tsx`, `app/api/admin/casos/*`), foi refatorado pra ler de `FORM_TYPE_LABELS` dinamicamente — só editar em um lugar (`lib/admin-labels.ts` e `lib/site-data.ts`) quando uma área mudar no futuro.
- **`lib/site-data.ts::SERVICE_AREAS`** é a fonte única das 5 áreas públicas — Home, `/contato`, Header, Footer e `sitemap.ts` leem dinamicamente dali. Só `lib/db-leads.ts::LeadFormType` (o tipo TS) e `lib/admin-labels.ts::FORM_TYPE_LABELS` (os labels) precisam de edição manual se uma área for adicionada/removida de verdade.
- **Recibo em PDF sem biblioteca nova**: página HTML normal estilizada com os tokens de marca + `@media print` + botão que chama `window.print()`. O navegador salva como PDF nativamente.
- **Cron do Vercel**: 1x/dia (não a cada minuto) — bate com o plano Hobby e com a "jornada diária" real da cliente (ela confere o painel de manhã, não em tempo real).
- Nunca commitar/pushar sem pedir permissão explícita antes — seguido à risca a sessão toda.
- Verificação padrão antes de qualquer commit: `npx eslint .` e `npm run build` limpos, teste manual no browser local, às vezes com escrita/leitura real no Supabase de produção (sempre limpando os dados de teste depois via `execute_sql`).

## 8-B. Sessão seguinte: sidebar ajustada + tela Recorrentes implementada (ainda não commitada)

Continuação da sessão anterior. A cliente refinou a reestruturação de sidebar aprovada (seção 8/9 abaixo, ainda desatualizadas nesse ponto): **Financeiro é uma categoria à parte** (dinheiro, valores, vencimento, atraso) e **Contratos deveria sair de Jurídico e entrar em Financeiro**, já que um contrato é fundamentalmente sobre valor/periodicidade. Jurídico, no desenho final, será organizado pelas 5 áreas reais do site (`lib/site-data.ts::SERVICE_AREAS`), não por "Contratos" como item único — isso ainda não foi implementado (ver nota de escopo abaixo).

Duas revisões de mockup de sidebar foram aprovadas nesta sessão (Artifact "Proposta de Sidebar — Painel Admin", atualizado in-place, revisão 2 confirmada com "ISSSOOOOO, ficou show!"). A cliente escolheu meio-termo de escopo: **implementar agora só o necessário para a tela Recorrentes existir**, deixando a divisão de Jurídico por área, o grupo Site (Páginas SEO/Glossário/FAQs) e Prazos para depois.

**Implementado e testado localmente nesta sessão (lint + build limpos, testado no browser local com escrita/leitura real no Supabase depois limpa via `execute_sql`):**

- **`components/admin/AdminSidebar.tsx`**: grupo "Jurídico" removido (só tinha Contratos). Grupo "Negócio" virou **"Finanças"**, contendo Contratos (movido), **Recorrentes (novo)**, Financeiro. Blog moveu de Negócio para o grupo Sistema (ao lado de Notificações), já que Blog não é financeiro nem jurídico.
- **Tela nova `/admin/recorrentes`** (`app/(admin)/admin/recorrentes/page.tsx` + `components/admin/RecorrentesAdminList.tsx`): filtra `contratos.tipo = 'recorrente'`, cruza com `financeiro_lancamentos` para achar o próximo vencimento pendente por contrato (destacado em vermelho se atrasado, via `isLancamentoAtrasado` já existente), conta casos vinculados. 3 KPIs no topo (MRR ativo em R$, clientes ativos, aguardando assinatura) + pills de filtro por status do contrato + tabela. Reaproveita exatamente os padrões visuais de `ContratosAdminList`/`FinanceiroAdminList` (nenhum componente/estilo novo inventado).
- Nenhuma migração de banco foi necessária — `contratos.tipo = 'recorrente'` já existia desde a Onda 1.

**Commitado (`6dc9a0a`), pushado e deployado em produção nesta sessão** — build Vercel `READY`. Autorização explícita da cliente foi dada ("sim, faça o commit" / "sim" para push+deploy).

## 8-C. Mesma sessão, passo seguinte: Jurídico dividido pelas 5 áreas — implementado, ainda não commitado

Depois do deploy de 8-B, a cliente escolheu esse item como próximo passo (das opções: Jurídico por área / desenhar Prazos / outra coisa).

**Implementado e testado localmente (lint + build limpos, testado no browser local via navegação direta por URL — ver nota de ferramenta abaixo):**

- **`components/admin/AdminSidebar.tsx`**: grupo Jurídico agora tem Clientes, Casos, e — abaixo, como sub-itens sem ícone, indentados — as 5 áreas puxadas dinamicamente de `lib/site-data.ts::SERVICE_AREAS` (`menuLabel`/`formType`), cada uma linkando para `/admin/casos?area=<formType>`.
- **Novo `components/admin/JuridicoAreaSubnav.tsx`**: isola o único trecho que precisa de `useSearchParams()` (para destacar a área ativa). Isso foi necessário porque colocar `useSearchParams()` direto em `AdminSidebar` (renderizado em todo layout `/admin/*`) quebrava o build com `useSearchParams() should be wrapped in a suspense boundary` especificamente na página `/admin/blog` — corrigido isolando o hook num componente-folha envolto em `<Suspense fallback={null}>`, conforme a própria doc do Next.js em `node_modules/next/dist/docs`.
- **`app/(admin)/admin/casos/page.tsx`**: agora lê `searchParams: Promise<{ area?: string }>` (padrão `await`, igual ao já usado em `/blog`) e passa `initialArea` pro componente de lista. Precisou de **`key={area ?? "all"}`** no `<CasosAdminList>` — sem isso, clicar em um link de área diferente não reseta o filtro, porque o `useState(initialArea)` só usa o valor inicial no primeiro mount, não em re-renders com prop nova. Confirmado via teste: sem a key, o pill de área ficava preso em "Todas"; com a key, sincroniza certinho.
- `components/admin/CasosAdminList.tsx`: prop `initialArea` opcional, vira o valor inicial do filtro de área.
- Nenhuma migração de banco, nenhuma tabela nova.

**Nota de ferramenta**: a verificação final no browser local usou navegação direta por URL (`/admin/casos?area=...`) em vez de clique nos links da sidebar, porque os cliques via automação erraram coordenadas (problema da ferramenta de automação, não do app) e um deles acabou clicando "Sair" sem querer — a sessão de login local foi encerrada como efeito colateral inofensivo (não afeta produção, não requer ação da cliente). A navegação direta por URL já confirmou que tanto o destaque da área ativa na sidebar quanto o pill de filtro pré-selecionado na tela de Casos funcionam corretamente.

**Commitado (`07c3279`), pushado e deployado em produção nesta sessão** — build Vercel `READY`.

**Escopo ainda adiado por pedido da cliente** (não implementar sem novo pedido):
- Grupo "Site" (Páginas SEO, Glossário, FAQs), grupo "Plataforma" (Controle de Acesso, Relatórios, Configurações) — nenhum desenhado em detalhe ainda além do mockup de alto nível.
- **Nota de visão de futuro da cliente, capturada mas não desenhada**: cada área jurídica tem uma dinâmica de atendimento própria — ela deu o exemplo de "Contratos Digitais" tendo um kanban interno (Cliente → Análise → Elaboração → Envio → Reanálise). Isso é sobre a tela de **Casos filtrada por área**, não sobre Contratos. Não desenhar nem implementar sem pedido explícito — a cliente foi clara que não é para agora.

## 8-D. Mesma sessão, passo seguinte: módulo de Prazos — implementado, testado, ainda não commitado

Depois do deploy de 8-C, a cliente escolheu "Prazos/Agenda" como próximo passo. Antes de codar, entrevista estruturada + mockup (Artifact "Módulo de Prazos", aprovado com "Ok"):

- **O que conta como "prazo"**: os 3 tipos — processual/administrativo (vinculado a uma frente), compromisso (reunião/audiência, com horário), tarefa (lembrete geral sem prazo legal formal). Confirmado pela cliente, multi-select.
- **Sem cálculo de dias úteis**: ela digita a data final já calculada (mais simples, decisão dela — não construir regra de contagem de prazo processual/feriado forense).
- **Visualização**: lista ordenada por data (não calendário) — mesmo padrão do resto do admin.

**Implementado, testado localmente com dado real no Supabase (inserido e depois limpo via `execute_sql`), lint + build limpos:**

- **Migração `create_prazos_table`**: enums `prazo_tipo` (processual/compromisso/tarefa) e `prazo_status` (pendente/concluido/cancelado); tabela `prazos` com `data` (date), `hora` (time, nullable — só relevante pra compromisso), e **3 FKs nullable** `caso_frente_id`/`caso_id`/`cliente_id` (`on delete cascade`, mesmo princípio arquitetural do resto do sistema — um prazo pode ser avulso ou vinculado a exatamente um desses). RLS idêntico ao padrão authenticated-only já usado em todas as outras tabelas (os avisos do `get_advisors` sobre `USING (true)` são os mesmos que já existem em `casos`/`contratos`/etc., não é regressão).
- **`lib/db-prazos.ts`**: CRUD completo. `updatePrazo` auto-carimba `concluido_em` na primeira vez que o status vira `concluido` (mesmo padrão de `assinado_em` em Contratos e `encerrado_em` em Casos/Frentes). `getUrgentPrazosCount()` conta pendentes com `data <= hoje+7` (atrasados + próximos 7 dias juntos) — vira o badge da sidebar.
- **`lib/prazos-utils.ts`**: `isPrazoAtrasado`/`isPrazoProximo`, sem imports de servidor, mesmo padrão de `financeiro-utils.ts`.
- **`lib/db-frentes.ts`**: `getAllFrentes` ganhou parâmetro `casoId` opcional (antes era obrigatório) — sem quebrar nenhum chamador existente — pra poder buscar todas as frentes do sistema de uma vez (necessário pra resolver o texto "Vinculado a" na lista de Prazos e popular o select de frentes no formulário).
- **Tela `/admin/prazos`** (`PrazosAdminList.tsx`): 3 KPIs (atrasados, próximos 7 dias, pendentes no total) + pills de tipo + select de status + tabela com coluna "Vinculado a" que resolve o nome do caso/frente/cliente. Segue exatamente o padrão visual de `ContratosAdminList`/`FinanceiroAdminList`.
- **Formulário `/admin/prazos/novo` e `/admin/prazos/[id]`** (`PrazoForm.tsx`, padrão idêntico a `CasoForm.tsx`): campo "Vincular a" com um select de tipo de vínculo (nenhum/cliente/caso/frente) que troca dinamicamente as opções do select seguinte.
- **Sidebar**: novo grupo "Prazos" no topo (antes de Jurídico), com badge de contagem urgente. Precisou de nova prop `urgentPrazosCount` em `AdminSidebar`, calculada em `app/(admin)/admin/layout.tsx` via `getUrgentPrazosCount()`.
- Testado ponta a ponta no browser local: criação via formulário (com vínculo a cliente), edição pra "Concluído" (confirmado `concluido_em` carimbado no Postgres), lista com os 3 tipos, estilo de atrasado em vermelho, badge da sidebar atualizando.

**Ainda não commitado, não pushado** — pedir autorização antes de commitar, como sempre.

**Deixado de fora desta rodada, por decisão explícita** (ver mockup): notificação de prazo próximo estendendo o cron já existente (`app/api/cron/notificacoes/route.ts`) — o campo está pronto pra isso (`getUrgentPrazosCount` já existe), mas não foi pedido.

## 8-E. Mesma sessão: painel de referência externo (imagem) → notificações arquiváveis + nova Visão Geral com 12 KPIs

A cliente colou um print de um dashboard de outra ferramenta (tema claro, genérico) pedindo "algo como" aquilo, mais um Kanban de Leads de 17 colunas (16 dela + "Perdido", sugestão minha aprovada) e arquivamento de notificações. Dado o tamanho, foi sequenciado como **C → A → B**: (C) Notificações, (A) Visão Geral, (B) Kanban de Leads — B ainda não iniciado, é o maior e mais arriscado dos três (troca o enum de status do lead inteiro, precisa de lib de drag-and-drop nova, e um motor de avanço automático por dias).

**(C) Notificações arquiváveis — implementado, testado, sem migração** (o campo `lida` já existia):
- `components/admin/NotificacoesList.tsx`: duas abas, "Ativas" (lida=false, com botão de check pra arquivar) e "Arquivo" (lida=true, somente leitura). Arquivar uma notificação não apaga nada, só sai da aba Ativas.
- `app/(admin)/admin/page.tsx`: a prévia de notificações no canto superior direito agora só mostra as não-lidas (antes mostrava as 4 mais recentes independente do status).

**(A) Nova Visão Geral com 12 KPIs em 3 blocos (Financeiro/Operação/Funil) — implementado, testado com dado real, sem migração**:
- Todo o dado já existia nas tabelas de Contratos/Financeiro/Clientes/Casos/Prazos/Leads — nenhuma tabela nova.
- **Financeiro**: MRR (mês corrente, soma de contratos recorrentes assinados), Inadimplência (soma + contagem de lançamentos vencidos, reusa `isLancamentoAtrasado`), Receita (30D, lançamentos pagos nos últimos 30 dias por `pago_em`), SLA cumprido (30D, mesma lógica de SLA de lead já existente, mas agora escopada a leads criados nos últimos 30 dias em vez de todos os leads já criados).
- **Operação**: Clientes ativos (tem ≥1 contrato assinado), Contratos ativos (+ quantos recorrentes têm o lançamento pendente mais próximo vencendo nos próximos 30 dias — mesma lógica de "próximo vencimento" já usada em Recorrentes), Casos em aberto (aberto+em_andamento+aguardando_cliente, sem alegar SLA porque Casos não tem SLA calculado), Prazos (30D, pendentes vencendo em até 30 dias — **generalizado pra todas as áreas**, não só Propriedade Intelectual como na imagem de referência, porque não fazia sentido restringir só a uma área nas outras métricas operacionais).
- **Funil (7 dias)**: Leads (7D) + conversões nos últimos 30 dias (calculado via `clientes.lead_id is not null and clientes.created_at` dentro da janela — não existe timestamp de conversão dedicado, essa é a aproximação), mais uma contagem de leads dos últimos 7 dias por cada uma das 5 áreas reais (a imagem de referência só mostrava 3 áreas de um negócio diferente).
- **Novo `components/admin/DashboardAutoRefresh.tsx`**: client component que chama `router.refresh()` a cada 30 minutos (`setInterval` num `useEffect`), igual ao rodapé "refresh automático a cada 30min" da imagem de referência. O timestamp "atualizado em" é formatado explicitamente em `America/Belem` (fuso da cliente), não UTC.
- **"Atividade recente" (log tipo "Sistema criou Lead X") ficou de fora por decisão explícita da cliente** — precisaria de uma tabela de auditoria nova instrumentada em todo `create`/`update`/`delete` do sistema, escopo grande, tratado como próximo item depois do Kanban de Leads.
- Testado com dado real no Supabase (cliente, 2 contratos recorrentes, lançamentos pago/vencido/a vencer, caso, prazo, cliente convertido de lead) confirmando cada um dos 12 números bate — depois tudo limpo via `execute_sql`.

**(C) e (A) commitados (`d69e788`), pushados e deployados em produção** — build Vercel `READY`, autorização dada pela cliente.

## 8-F. Mesma sessão, passo seguinte: (B) Kanban de Leads com 17 colunas — implementado e testado, ainda não commitado

Mockup aprovado ("Ok perfeito") mostrando as 17 colunas, toggle Kanban/Lista preservando a tabela existente, e as decisões de congelamento/F8 confirmadas na rodada anterior (ver 8-E). Implementação completa:

**Migração `migrate_lead_status_to_kanban_stages`** (Supabase): enum `lead_status` recriado do zero (só havia 1 lead real no banco, `perdido` — migração de baixíssimo risco) com as 17 colunas + `cliente` (18 valores no total; `cliente` fica fora do Kanban de propósito). Mapeamento do enum antigo: `novo→leads`, `em_contato→contactados`, `qualificado→em_andamento`, `proposta→proposta_enviada`, `cliente`/`perdido` sem mudança de nome. **Faltava uma policy de RLS** — só `anon` podia inserir em `leads` (via formulário público), então o cadastro manual (autenticado) falhava com 401 até eu adicionar `authenticated can insert leads` numa segunda migração.

**`lib/db-admin.ts`**: `LeadStatus` com as 18 opções. `updateLeadStatus`/`getNewLeadsCount` atualizados de `"novo"` pra `"leads"`. Nova `createLeadManual()` pro cadastro manual (usa `addBusinessDays` igual o insert público, mas com `scope_key: "manual"` e client autenticado em vez do anônimo).

**`lib/leads-cadencia.ts`** (novo, sem dependência de servidor — mesmo padrão de `financeiro-utils.ts`/`prazos-utils.ts`): `CADENCIA_STATUSES` (as 8 colunas F) e `STATUS_CONGELADOS` (as que o motor automático nunca toca) vivem aqui, não em `db-admin.ts` — colocá-las lá quebrava o build porque um Client Component (`LeadsKanbanBoard`) importando qualquer valor real de `db-admin.ts` puxa o módulo inteiro, incluindo `next/headers` via `lib/supabase/server.ts`. `computeCadenciaStatus(dias)` mapeia dias-desde-contato pro degrau certo (1→F1, 2→F2, 3→F3, 5→F4, 7→F5, 10→F6, 12→F7, 15→F8), testado isoladamente com `tsx` pra todos os valores de fronteira.

**`app/api/cron/leads-cadencia/route.ts`** (novo, protegido por `CRON_SECRET`, mesmo padrão do cron de notificações): busca todo lead com `first_contacted_at` preenchido, pula os que estão em status congelado, recalcula o degrau e atualiza se mudou. Agendado em `vercel.json` às 11h05 UTC (5 min depois do cron de notificações, pra não rodar junto). **Não consegui testar a chamada HTTP completa localmente** — falta a `SUPABASE_SERVICE_ROLE_KEY` (nem localmente, nem em produção ainda, é a mesma pendência já registrada na seção 8 sobre o cron de notificações) — testei a lógica pura (`computeCadenciaStatus`) isolada com `tsx` em vez disso, e confirmei que o endpoint de status (`PATCH /api/admin/leads/[id]/status`, o mesmo que o cron chama) carimba `first_contacted_at` corretamente.

**`components/admin/LeadsKanbanBoard.tsx`** (novo, usa `@dnd-kit/core` + `@dnd-kit/utilities` — dependências novas no projeto; `@dnd-kit/sortable` foi instalado por engano e removido de novo, o board não precisa de reordenação dentro da coluna): 17 colunas, drag-and-drop entre elas chama `PATCH /api/admin/leads/[id]/status`, atualização otimista no estado local. Cliente convertido (`status === "cliente"`) é filtrado e nunca aparece no board. Clicar num card abre o mesmo `LeadDetailModal` já usado na Lista.
- **Renderizado via `next/dynamic` com `ssr: false`** em `components/admin/LeadsPageClient.tsx` — `@dnd-kit` gera ids internos de acessibilidade (`aria-describedby="DndDescribedBy-N"`) a partir de um contador que diverge entre o processo de servidor e o cliente, causando um warning de hydration mismatch inofensivo mas evitável só desativando SSR pra esse componente.

**`components/admin/NovoLeadModal.tsx`** (novo): formulário mínimo (nome, e-mail, WhatsApp, área) que cria o lead direto na coluna "Leads" via `POST /api/admin/leads`.

**`components/admin/LeadsPageClient.tsx`** (novo): toggle Kanban/Lista. A Lista é o `AdminDashboard.tsx` de sempre — **removi o wrapper `<div className="mx-auto max-w-7xl...">` e o `<h1>Leads</h1>` duplicado dele**, já que agora o cabeçalho da página vive só no `LeadsPageClient`. **Limitação aceita conscientemente**: Kanban e Lista mantêm cada um seu próprio estado local (`useState(initialLeads)`), sem sincronização ao vivo entre eles — igual o resto do painel já se comporta (ex.: badges da sidebar), uma troca de aba só reflete mudança feita na outra aba depois de um reload completo da página. Pra uma usuária solo isso não deve ser um problema na prática.

**Testado ponta a ponta com dado real** (cliente + lead de teste, limpos depois via `execute_sql`): cadastro manual funcionando (incluindo a correção da policy de RLS), avanço de status via API confirmado com `first_contacted_at` carimbado, board renderizando as 17 colunas com o lead real (`perdido`) na coluna certa, aba Lista sem regressão visual. **O drag-and-drop em si não foi testado via automação do navegador** (a ferramenta de clique/arrastar não simula um gesto de mouse contínuo o bastante pro `@dnd-kit` trocar de coluna — tentei duas vezes, o item sempre voltava pra coluna de origem) — validei a peça que realmente importa (a chamada à API que o drag dispara) diretamente. Vale a cliente confirmar o arrastar-e-soltar de verdade assim que testar.

**Ainda não commitado, não pushado** — pedir autorização antes de commitar, como sempre.

## 9. Preferências da cliente importantes para a próxima sessão

- **"Quero sempre que você me mostre antes"** — pedido explícito: para qualquer mudança estrutural ou visual (reorganização de menu, nova tela, mudança de layout), apresentar um mockup/visualização (Artifact) **antes** de escrever código, não só descrever em texto. Mudanças pequenas e bem especificadas (um campo novo num formulário já existente, por exemplo) não precisam desse tratamento — usar julgamento.
- A cliente é bem direta ao dar feedback e não hesita em pedir para desfazer algo (aconteceu com a Assessoria Recorrente) — trate isso como normal, sem fricção, principalmente quando nada foi commitado ainda.
- Prefere que decisões de copy jurídica/institucional sejam extraídas dela via pergunta estruturada, não inventadas — daí o uso adaptado da skill `landing-page-advogados-tlbc` mesmo fora do fluxo original dela (site novo → 1 área nova num site existente).
- Atenção a compliance da OAB (Provimento 205/2021) em qualquer copy pública nova — evitar qualquer linguagem que soe como captação direta/indireta de cliente.

## 10. Como retomar

1. Ler este arquivo primeiro.
2. Confirmar com a cliente se quer commitar/pushar a Onda 2 (código já pronto e testado localmente) antes de seguir com trabalho novo.
3. Perguntar se o próximo passo é: (a) a visão de "clientes com assessoria recorrente" no CRM (pedido mais recente, provavelmente pequeno), ou (b) começar o design de Prazos/Agenda, ou (c) outra coisa.
4. Não presumir a ordem — a cliente muda de prioridade com frequência nesta sessão, e isso é esperado.
