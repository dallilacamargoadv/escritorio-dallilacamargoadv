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

5. **Onda 2 — implementada e testada localmente, ainda NÃO commitada nem deployada** (ver seção 8, é o item mais importante para retomar):
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

## 8. 🔴 Estado atual em aberto (prioridade da próxima sessão)

**O código local está à frente do que está commitado.** Último commit em produção: `595a93d` (Onda 1, já deployada). Tudo da Onda 2 (seção 6, item 5) está **implementado, testado localmente, com lint/build limpos — mas não commitado, não pushado, não deployado**. `git status` na raiz do projeto mostra a lista exata de arquivos modificados/novos.

**Antes de fazer qualquer commit desta Onda 2**, ela precisa de autorização explícita da cliente (padrão da sessão toda) — pergunte primeiro.

**Passo manual da cliente, necessário antes do cron de Notificações funcionar em produção** (não posso fazer isso por ela, não tenho permissão para criar variáveis de ambiente): adicionar no Vercel, além do que já existe, duas variáveis novas:
- `CRON_SECRET` (qualquer valor aleatório — protege o endpoint `/api/cron/notificacoes` de ser chamado por qualquer um)
- `SUPABASE_SERVICE_ROLE_KEY` (a chave *service role*, não a anon/publishable — pegar em Supabase → Settings → API. É secreta, nunca deve ir para `NEXT_PUBLIC_*`)

**Pedido em aberto, ainda não iniciado**: a cliente quer uma **visão dedicada no admin para clientes/contratos com `tipo = 'recorrente'`** (ver seção 6, item 7 — o campo já existe, só falta a tela/filtro). Foi o último pedido antes desta sessão ser encerrada por limite de contexto.

**Também em aberto, aprovado mas não implementado**: a reestruturação completa da sidebar que a cliente confirmou via mockup visual (Jurídico dividido por área + Casos geral, grupo Site com Leads/Blog/Páginas SEO/Glossário/FAQs, grupo Plataforma com Controle de Acesso/Notificações/Relatórios/Configurações, grupo Finanças, grupo Prazos próprio). Isso é MUITO trabalho (8 módulos novos, a maioria ainda nem desenhada em detalhe) — a cliente pediu pra priorizar "Prazos" e "Assessoria Recorrente" primeiro; o segundo item mudou de escopo (não é mais área pública, é a visão de CRM do parágrafo acima). **Prazos (Agenda)** ainda não tem nem uma conversa de design nesta sessão além da menção original nas 14 fases — precisa ser desenhado do zero (frentes de agenda, o que conta como "prazo", como se relaciona com Casos/Contratos/Leads) antes de implementar.

**Arquivo de plano** em `/Users/dallilacamargo/.claude/plans/binary-herding-tiger.md` está **desatualizado** — contém o plano da Assessoria Recorrente que foi revertida. Ignorar ou sobrescrever no próximo ciclo de planejamento.

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
