# Handoff — Site institucional Dallila Camargo I Advocacia

> Documento de continuidade de sessão. Cole este arquivo (ou peça para o Claude ler `HANDOFF.md` na raiz do projeto) no início de uma nova conversa para retomar exatamente de onde paramos, sem precisar reprocessar todo o histórico anterior.

## 1. Quem é a cliente e o que é o projeto

**Dallila Camargo** — advogada sócia única, especialista em **Direito Digital**, OAB/PA nº 36.762, sediada em Redenção/PA, atendimento 100% remoto em todo o Brasil. O projeto é o site institucional completo do escritório (landing pages de captação + blog + painel administrativo), construído do zero nesta sessão de trabalho com Claude Code.

- **Repositório**: `github.com/dallilacamargoadv/escritorio-dallilacamargoadv` (público)
- **Deploy**: Vercel, projeto `escritorio-dallilacamargoadv` (`prj_oWeeWYZYerDMaefVIbBbtGhaqZVD`, team `team_AUWkl211AzsfpkSeCj38JNhY`)
- **URL de produção**: `https://escritorio-dallilacamargoadv.vercel.app` (domínio próprio `dallilacamargoadv.com.br` ainda não configurado)
- **Banco de dados**: Supabase, projeto `zojcjeinftoscpmkwtdi`, região `sa-east-1`
- **Diretório local do projeto**: `/Users/dallilacamargo/Documents/CLAUDE CODE - ESTRUTURACAO/escritorio-dallilacamargoadv`

## 2. Stack técnica

- **Next.js 16.2.10** (App Router, Turbopack) — atenção: breaking changes vs. Next.js "clássico" que o modelo conhece por treinamento. `middleware.ts` virou **`proxy.ts`** (export `proxy`, não `middleware`), `params`/`searchParams` são `Promise` (sempre `await`), tipos ajudantes `PageProps<'/rota/[id]'>` e `RouteContext<'/rota/[id]'>` gerados automaticamente. Há um `AGENTS.md` no repo avisando disso — sempre checar `node_modules/next/dist/docs/` antes de usar uma API que "parece familiar".
- **React 19.2**, **Tailwind CSS v4** (config via `@theme inline` em `app/globals.css`, não há `tailwind.config.ts`)
- **Supabase**: Postgres com RLS + Supabase Auth (login do admin) + `@supabase/ssr` para client de servidor com cookies
- **GSAP + ScrollTrigger** para a animação de scroll "3 Passos Iniciais" / "Etapas"
- **Recharts** para os gráficos do admin, **lucide-react** para ícones, **xlsx** (SheetJS) para exportação, **next-mdx-remote/rsc** para renderizar o conteúdo dos posts do blog (que agora vem do banco, não de arquivos)
- **Vercel Cron** ainda não usado (cogitado para lembretes de prazo em fase futura)

## 3. Identidade visual (brand book)

- **Cores** (dark theme, default): `--bg: #2a070c` (vinho porto), `--bg-alt: #380b12`, `--surface: #3f0e17`, `--gold: #9f8e87` (dourado do tema escuro), `--gold-bright: #c9bba8`, `--wine: #b5495a`, `--ink: #ddc8b3` (texto principal), `--ink-dim: #9f8e87`. Tokens fixos de marca: `--brand-dourado-latao: #c9a227`, `--brand-bordo-assinatura: #7a2430`.
- **Light theme**: `--bg: #ddc8b3`, `--ink: #2a070c`, `--gold: #6e5c53`, etc. — trocado via `data-theme="light"|"dark"` no `<html>`, com fallback por `prefers-color-scheme`.
- **Cores semânticas** (separadas do accent dourado): `--success`, `--warning`, `--error` (mapeadas em `@theme inline` como `text-success`, `border-error`, etc.)
- **Tipografia**: **Fraunces** (display/serif, itálico usado para dar ênfase em palavras-chave — ex. `<em className="italic text-gold">Direito Digital</em>`), **Inter** (corpo/sans), **JetBrains Mono** (rótulos "eyebrow" em caixa alta com tracking, dados tabulares). Classe utilitária `.font-eyebrow` já pronta.
- **Logo**: abelha/mariposa dourada. Padrão "assinatura de e-mail" (componente `components/ui/Logo.tsx`): abelha + "Dallila Camargo" em itálico Fraunces + "Advogada · OAB/PA Nº 36.762" em mono caps — usado no Header do site público e agora também no painel admin (login + sidebar).
- **Textura de grain**: `.site-noise` (SVG turbulence, opacity 0.06, `mix-blend-mode: soft-light`, `z-index: 40`), só no site público.
- **Efeito de cursor**: `components/CursorGlow.tsx` — glow sutil (radial-gradient `rgba(201,187,168,0.18)`) que segue o mouse via `mousemove`, `mix-blend-mode: soft-light`, desativado em touch (`pointer: coarse`) e com `prefers-reduced-motion`.

## 4. Estrutura de rotas atual

**Site público** (grupo de rotas `app/(site)/`, layout com Header + Footer + CookieConsentBanner + CursorGlow + grain):
- `/` — Home (Hero com vídeo de fundo, Áreas de Atuação, 3 Passos Iniciais, Fundamentos do Escritório, A Fundadora, Conteúdo Recente condicional, Fechamento)
- `/sobre` — Sobre o Escritório, 3 Passos Iniciais, A Fundadora, Fechamento (mesmas seções também aparecem na Home, por pedido explícito da cliente)
- `/contato` — hub de triagem com os 5 cards de área, cada um linkando para `/[área]#formulario`
- `/contratos`, `/propriedade-intelectual`, `/contas-e-plataformas`, `/golpes-virtuais`, `/assessoria-estrategica` — as 5 landing pages de área, cada uma com: Hero, Nossa Atuação (4 cards), Etapas (scroll GSAP com 3 passos específicos da área), Pontos que Merecem Atenção (5 itens), Nota técnica (base legal), formulário multi-step
- `/blog`, `/blog/[slug]`, `/blog/categoria/[categoria]` — blog, agora **alimentado pelo Supabase** (não mais por arquivos `.mdx`)
- `/politica-de-privacidade`, `/termos-de-uso`
- `/robots.ts`, `/sitemap.ts` (dinâmico, inclui posts do blog)

**Painel admin** (grupo `app/(admin)/`, protegido por `proxy.ts`):
- `/login` — Supabase Auth (e-mail/senha)
- `/admin` — Visão Geral: KPIs (leads na semana, aguardando contato, % SLA cumprido) + lista de leads recentes
- `/admin/leads` — dashboard completo de leads (antiga página `/admin`): 3 gráficos (Recharts), filtros (busca, área, status, UTMs), tabela com paginação, modal de detalhes/notas/status, exportação CSV/XLSX
- `/admin/blog`, `/admin/blog/novo`, `/admin/blog/[id]` — CRUD completo de posts do blog

**API routes**:
- `/api/{contratos|propriedade-intelectual|contas-e-plataformas|golpes-virtuais|assessoria-estrategica}-leads` — recebem os formulários públicos
- `/api/admin/leads/export` — CSV/XLSX
- `/api/admin/leads/[id]/status` (PATCH) — muda status do lead
- `/api/admin/leads/[id]/notes` (GET/POST) — notas internas
- `/api/admin/posts` (GET/POST), `/api/admin/posts/[id]` (GET/PATCH/DELETE) — CRUD do blog

## 5. Banco de dados (Supabase — projeto `zojcjeinftoscpmkwtdi`)

### Tabela `leads`
Campos originais: `id, created_at, form_type (enum lead_form_type: contratos|propriedade_intelectual|contas_e_plataformas|golpes_virtuais|assessoria_estrategica), scope_key, name, email, whatsapp, answers (jsonb), utms (jsonb), metadata (jsonb), duplicate_of`.
Campos adicionados nesta sessão (CRM Fase 1): `status (enum lead_status: novo|em_contato|qualificado|proposta|cliente|perdido, default 'novo'), sla_due_at (timestamptz), first_contacted_at (timestamptz)`.
Dedup: índices únicos em `lower(email), scope_key` e `whatsapp, scope_key` — insert duplicado retorna `{duplicate: true}` em vez de erro (código Postgres `23505`).
RLS: `INSERT` liberado para `anon`; `SELECT/UPDATE/DELETE` só para `authenticated`.

### Tabela `lead_notes` (nova)
`id, lead_id (FK leads), author_id (FK auth.users), body, next_action_at, created_at`. RLS: tudo restrito a `authenticated`.

### Tabela `posts` (nova — substituiu os arquivos `.mdx`)
`id, slug (unique), title, subtitle, category (text, valores = `BLOG_CATEGORIES` de `lib/blog.ts`), content (markdown/MDX), faq (jsonb), published (boolean, default false), date, updated_at, created_at`.
RLS: `anon` só enxerga `published = true`; `authenticated` enxerga e edita tudo.

## 6. Cronologia do que foi feito (resumo por marco)

1. **Build inicial completo** (Fases 0–10 do plano original): scaffolding Next.js, schema Supabase, sistema de UI (`Button`, `EnclosureNested`, `SectionEyebrow`, `Icon`), Header/Footer, Home, as landing pages (originalmente 3: Conta Hackeada, Contratos, Propriedade Intelectual), `/contato`, infraestrutura do blog em MDX (sem posts), páginas legais (Política de Privacidade a partir de PDF fornecido, Termos de Uso redigido do zero), SEO técnico (robots.txt com allowlist de bots de IA, sitemap, JSON-LD, llms.txt), painel admin básico (login, tabela de leads, 3 gráficos, export CSV/XLSX). Deploy inicial no Vercel após resolver: autenticação GitHub via PAT, e um bug de Framework Preset "Other" em vez de "Next.js" causando 404 em produção.

2. **Iteração — grain, animação, tema**: textura de grain sitewide, seção "3 Passos Iniciais" com animação GSAP ScrollTrigger (círculo central + 3 arcos preenchendo), reposicionada para logo após Áreas de Atuação, accordion mobile para Missão/Visão/Valores (desktop intocado), toggle de tema claro/escuro (criado do zero, com card expandido nos primeiros 4s). Bug crítico resolvido: scroll autônomo da página ao carregar (causado por conflito entre scroll-anchoring nativo do browser e o pin do GSAP ScrollTrigger) — fix foi `overflow-anchor: none` no `html`.

3. **Iteração — reestruturação para 5 áreas**: de 3 para 5 áreas de atuação (Contratos Digitais, Propriedade Intelectual, Contas e Plataformas, Golpes Virtuais, Assessoria Estratégica), com migração de enum no Postgres, 3 formulários novos, header/footer/logo redesenhados (assinatura de e-mail), Home reescrita (Hero mais estreito, Fundamentos do Escritório, A Fundadora), `PointsOfAttention` (Pontos que Merecem Atenção) em cada área, fechamento simplificado. Depois disso, `/sobre` foi criada como página dedicada, e "Sobre o Escritório"/"3 Passos Iniciais"/"A Fundadora" foram movidos pra lá — mas a cliente pediu para manter "3 Passos Iniciais" e "A Fundadora" **também** na Home (estão nos dois lugares hoje).

4. **Iteração — vídeo, admin, ajustes finos**: vídeo de fundo na Hero (convertido de HEVC/.mov para H.264/.mp4 via `avconvert`, com overlay `bg-bg/70`). Diagnóstico e correção do 500 em produção no `/admin` (env vars do Supabase nunca haviam sido configuradas no Vercel — **isso voltou a ser problema, ver seção 8**). Restyle completo do painel admin com a identidade da marca (antes era neutro grafite/branco, decisão original do projeto). Mensagem de agradecimento padronizada nos 5 formulários. Efeito de luz no cursor, grain mais fino, cards de Fundamentos com hover-expand no desktop (mantendo tap no mobile). Seta discreta nos cards clicáveis de Áreas de Atuação. Toggle de tema movido do canto flutuante da tela para dentro do Header (o admin manteve a versão flutuante). Novos textos de Hero/subtítulo da Home (2 rodadas de ajuste de copy).

5. **Plano de evolução do painel (Legal Ops)**: a cliente pediu, atuando eu como "especialista sênior em Legal Ops", um plano completo de evolução do admin. Entrei em Plan Mode, mapeei um roadmap de 10 fases (CRM essencial → navegação modular → gestão de casos → agenda/prazos → documentos → automação de comunicação → equipe/permissões → auditoria/LGPD → analytics avançado → portal do cliente), priorizado por impacto x esforço. A cliente aprovou o plano com foco em implementar só a Fase 1 primeiro.

6. **Implementação da Fase 1 + extras** (commit `58380ff` em diante): status do lead (pipeline), notas internas, indicador de SLA — tudo testado direto no Supabase de produção (e limpo depois). Na sequência, a cliente comparou o resultado com um material de outra fonte (prints de um spec bem mais ambicioso — CRM completo, contratos com assinatura eletrônica, faturamento, portal do cliente, múltiplos papéis) e ficou insatisfeita com o tamanho da entrega. Alinhamos via `AskUserQuestion`: manter o roadmap incremental, mas **antecipar** 3 itens: barra lateral (Fase 2), notificação de novo lead, e publicação do blog pelo painel (que nunca tinha sido planejada em nenhuma fase). Isso virou o commit `1475f9c`: barra lateral com Visão Geral/Leads/Blog, KPIs, badge de leads aguardando contato, e migração completa do blog de arquivos `.mdx` para o Supabase com CRUD pelo painel.

7. **Bug de build + variáveis de ambiente (situação atual, ver seção 8)**.

## 7. Padrões e convenções importantes do código

- **`useSyncExternalStore`** é o padrão usado sempre que um valor depende de `window`/`localStorage`/`matchMedia` (tema, `prefers-reduced-motion`, etc.), para evitar mismatch de hidratação SSR/client. **Nunca** usar `useState` + `useEffect` pra isso.
- **ESLint `react-hooks/set-state-in-effect`** é estrito neste template — proíbe chamar `setState` de forma síncrona direto no corpo de um `useEffect`. Sempre que aparecer, resolver com `useSyncExternalStore`, callback assíncrono (`setTimeout`), ou derivando o valor no render em vez de guardar em state.
- **`RouteContext<'/api/rota/[id]'>`** é o tipo correto pra `params` em route handlers (`app/api/.../route.ts`) no Next 16 — sempre `const { id } = await ctx.params`.
- **`PageProps<'/rota/[id]'>`** é o tipo correto pra páginas (`page.tsx`) com parâmetros dinâmicos.
- Todas as tabelas novas no Supabase seguem o padrão: RLS habilitado, policy de leitura pública restrita ao necessário (`published = true`, por ex.), CRUD completo só pra `authenticated`.
- Os labels/cores compartilhados do admin (nome das áreas, nome/cor dos status de lead) ficam centralizados em `lib/admin-labels.ts` — evitar duplicar esses `Record<>` em componentes.
- Cliente Supabase anônimo reutilizável (sem depender de cookies de request) está em `lib/supabase/anon.ts` — **obrigatório** usar esse em qualquer código que rode em `generateStaticParams` ou em contexto de build, porque `lib/supabase/server.ts` (baseado em `cookies()`) só funciona dentro de uma requisição real.
- `getAllPosts()`/`getPostBySlug()` em `lib/blog.ts` têm `try/catch` que devolve `[]`/`null` em vez de propagar erro — decisão deliberada pra não derrubar o build inteiro se o Supabase estiver inacessível no momento do build (ver seção 8, foi exatamente esse bug que motivou a mudança).
- Nunca commitar/pushar sem pedir permissão explícita antes — esse padrão foi seguido a risca a sessão toda (a cliente sempre confirma com "Sim"/"Pode preparar" antes de cada commit+push).
- Verificação padrão antes de qualquer commit: `npx eslint .` e `npm run build` limpos, mais teste manual no browser local (`http://localhost:3000`), às vezes com escrita/leitura real no Supabase de produção (sempre limpando os dados de teste depois).

## 8. ✅ RESOLVIDO (2026-07-15) — problema de produção que estava em aberto

Causa raiz real: os valores de `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` salvos no Vercel estavam incorretos/vazios (havia inclusive duas variáveis-lixo nomeadas literalmente `Key` e `Value`, sobra de um preenchimento errado — sinal de que o valor real pode ter ido parar no campo errado). Não era problema de cache de build, embora tenhamos testado essa hipótese primeiro. Corrigido reeditando as duas variáveis com os valores corretos obtidos direto do Supabase (`get_project_url`/`get_publishable_keys`) e fazendo um redeploy sem cache. Confirmado: `/`, `/admin`, `/login`, `/blog` retornam 200 e não há mais erros de runtime.

<details>
<summary>Histórico do diagnóstico (mantido para referência)</summary>

### 🔴 PROBLEMA ATUAL EM ABERTO (prioridade da próxima sessão) — texto original, já resolvido acima

**Sintoma**: em produção (`https://escritorio-dallilacamargoadv.vercel.app`), as rotas `/admin`, `/login` e `/api/admin/*` retornam **500**. A causa raiz, confirmada nos logs do Vercel (`get_runtime_errors`), é:

```
Error running the exported Web Handler: Error: Your project's URL and Key are required to create a Supabase client!
```

Esse erro acontece dentro do `proxy.ts` (middleware, roda em Edge Runtime, protege `/admin/:path*`, `/login`, `/api/admin/:path*`) porque `process.env.NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` não estão chegando até ele.

**O que já foi tentado**:
1. Orientei a cliente a adicionar as 3 variáveis (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`) em Vercel → Settings → Environment Variables, marcando Production/Preview/Development.
2. Ela confirmou que adicionou e fez um **Redeploy** manual (Deployments → "..." → Redeploy). Isso gerou um novo deployment (`dpl_4V8BPhwuBMojppM2VU8yrsfmWrXw`, commit `002844c`, `state: READY`).
3. Mesmo assim, o erro **persiste** nesse novo deployment — confirmado tanto no middleware quanto (achado tardio, ver correção abaixo) na própria função Node normal.

**Correção de diagnóstico**: eu inicialmente disse à cliente que "`/blog` já está funcionando (200)", concluindo erroneamente que as env vars tinham pegado só pro middleware não. **Isso estava errado.** Reexaminando os logs depois, o mesmo erro (`supabaseUrl is required`) apareceu também associado à rota `/blog`, no mesmo deployment novo — só não derrubou a página porque `getAllPosts()` em `lib/blog.ts` tem um `try/catch` que devolve `[]` silenciosamente (proteção que eu mesmo adicionei no commit `002844c` para não travar o *build*, mas que também mascara o problema em *runtime*). Ou seja: **as variáveis de ambiente não estão disponíveis em nenhum contexto desse deployment**, não é um problema isolado do Edge Runtime/middleware.

**Hipóteses mais prováveis** (nenhuma confirmada ainda — faltou a cliente mandar o screenshot da tela de env vars do Vercel antes da sessão acabar):
- Uma das 3 variáveis não ficou com a caixinha **Production** marcada (só Preview/Development, por exemplo)
- Erro de digitação no nome da chave (tem que ser exatamente `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`)
- Espaço em branco colado junto com o valor
- As variáveis foram salvas em um **Environment** errado dentro do Vercel (ex.: só num "Preview" específico, ou associadas à branch errada)
- Pouco provável, mas possível: o botão "Save" de alguma delas não foi de fato confirmado

**Próximo passo imediato**: pedir para a cliente mandar um screenshot de Vercel → Settings → Environment Variables (a lista completa, com as colunas de ambiente visíveis) para diagnosticar visualmente. Depois de corrigido, fazer mais um Redeploy e validar com:
```bash
curl -s -o /dev/null -w "%{http_code}\n" https://escritorio-dallilacamargoadv.vercel.app/admin
curl -s -o /dev/null -w "%{http_code}\n" https://escritorio-dallilacamargoadv.vercel.app/login
```
Ambos devem virar `200` (ou redirect esperado), não `500`. Também vale checar `get_runtime_errors` (MCP Vercel) pra confirmar que o erro de `supabaseUrl is required` parou de aparecer.

**Não é um problema de código** — o app já foi validado localmente (com `.env.local`) e até com uma simulação deliberada de ausência das variáveis (`env -u NEXT_PUBLIC_SUPABASE_URL -u NEXT_PUBLIC_SUPABASE_ANON_KEY npm run build`), confirmando que o build sempre completa. O problema é 100% de configuração no painel do Vercel.

</details>

## 9. Outras coisas pendentes / não feitas ainda

- Domínio próprio `dallilacamargoadv.com.br` ainda não configurado no Vercel (site está só no `.vercel.app`)
- Categoria do blog "Conta Hackeada e Golpes Digitais" ainda existe em `lib/blog.ts` (`BLOG_CATEGORIES`) mas não corresponde a nenhuma área de atuação atual (foi renomeada pra "Golpes Virtuais" nas áreas, mas a categoria do blog não foi atualizada) — vale perguntar à cliente se quer ajustar
- Fases 2 (parcialmente feita — só a barra lateral, faltam os módulos "Casos"/"Agenda"/"Documentos"/"Relatórios" mencionados nela) a 10 do roadmap de Legal Ops seguem como plano futuro, sem implementação
- Nenhum post real foi publicado no blog ainda (só um post de teste, criado e removido durante a verificação)
- A cliente ainda não criou uma segunda conta de usuário no Supabase Auth (arquitetura já suporta via campo `assigned_to` preparado, mas RBAC de verdade é a Fase 7, não implementada)

## 10. Como retomar

Ao começar a nova conversa, o Claude deve:
1. Ler este arquivo primeiro.
2. Resolver o problema da seção 8 (variáveis de ambiente no Vercel) como prioridade — é o único bloqueador de produção.
3. Depois disso, seguir o roadmap de Legal Ops (seção 6.5 / plano salvo em `/Users/dallilacamargo/.claude/plans/binary-kindling-falcon.md`) só se a cliente pedir explicitamente — não presumir que ela quer continuar implementando fases sem perguntar.
