# 🌐 Mapa Mestre de Interfaces e Links • AgoraEuFalo
**Professor Leonardo Leite • Ecossistema Digital EdTech**

Este documento é o inventário oficial de todas as interfaces ativas, interativas e administrativas do ecossistema **AgoraEuFalo**.

> 🔄 **Regra de Manutenção:** Este arquivo é a fonte única de URLs oficiais e reflete a arquitetura pura dos 3 domínios em produção na Edge da Cloudflare.

---

## 🌐 Arquitetura Oficial dos 3 Domínios

| Domínio | Função Estratégica | Autenticação / Acesso |
| :--- | :--- | :--- |
| **`https://agoraeufalo.com.br`** | **Site Público, Blog & Landing Pages** | Público (visitantes, leads, SEO, indexado no Google) |
| **`https://app.agoraeufalo.com.br`** | **Área do Aluno (SaaS EdTech)** | Alunos matriculados (Free, Club, Mentorados VIP) |
| **`https://admin.agoraeufalo.com.br`** | **Backoffice Master do Leo** | Restrito / Blindado (Google Auth da Conta Mestre `selexenglish@gmail.com`) |

---

## 🛠️ 1. Painéis Administrativos & Estúdios Master (`admin.agoraeufalo.com.br`)

| Interface | URL Produção | Arquivo Local | Descrição |
| :--- | :--- | :--- | :--- |
| **Admin Command Hub (Painel Central)** | [admin.agoraeufalo.com.br/](https://admin.agoraeufalo.com.br/) | [`admin.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/admin.html) | Hub mestre de comando do Professor Leo estruturado em 6 blocos estratégicos com navegação unificada `aef-admin-nav.js`. |
| **Login Administrativo Master** | [admin.agoraeufalo.com.br/login](https://admin.agoraeufalo.com.br/login) | [`admin-login.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/admin-login.html) | Tela de autenticação exclusiva e blindada para o Professor Leo (`noindex, nofollow`) com login Google 1-clique. |
| **CRM de Alunos & Tiers (RBAC)** | [admin.agoraeufalo.com.br/alunos](https://admin.agoraeufalo.com.br/alunos) | [`admin-alunos.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/admin-alunos.html) | CRM em tempo real conectado ao Firestore, filtros por curso/origem, ordenação, paginação, exportação CSV e exclusão com 2FA. |
| **Course Studio (Fábrica de Cursos)** | [admin.agoraeufalo.com.br/cursos](https://admin.agoraeufalo.com.br/cursos) | [`admin-cursos.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/admin-cursos.html) | Estúdio 3-níveis de criação e gestão de cursos, módulos e aulas com Visual Kit Studio (geração Imagen 16:9 + 1:1, previews em tempo real e upload direto), transcrição e sincronização Firestore. |
| **Departamento de Vendas (Checkouts)** | [admin.agoraeufalo.com.br/vendas](https://admin.agoraeufalo.com.br/vendas) | [`admin-vendas.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/admin-vendas.html) | Gestão de ofertas comerciais, precificação Hotmart, links de checkout, triagem WhatsApp e gerador de páginas. |
| **Webhooks & Automação** | [admin.agoraeufalo.com.br/webhooks](https://admin.agoraeufalo.com.br/webhooks) | [`admin-webhooks.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/admin-webhooks.html) | Monitoramento de webhooks da Hotmart, simulações de compra e automação de e-mails transacionais. |
| **PDF Factory Studio** | [admin.agoraeufalo.com.br/pdf-factory](https://admin.agoraeufalo.com.br/pdf-factory) | [`admin-pdf-factory.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/admin-pdf-factory.html) | Laboratório editorial e construtor modular de apostilas em PDF nos 3 Arquétipos com ingestão de PDF.js e medidor de densidade. |
| **Quiz Studio (Testes de Escuta)** | [admin.agoraeufalo.com.br/quiz](https://admin.agoraeufalo.com.br/quiz) | [`admin-quiz.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/admin-quiz.html) | Fábrica de testes de escuta e compreensão auditiva com síntese Gemini TTS in-browser, simulador interativo e banco de quizzes. |
| **Fábrica de Marketing & Blocks** | [admin.agoraeufalo.com.br/marketing](https://admin.agoraeufalo.com.br/marketing) | [`admin-marketing.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/admin-marketing.html) | Fábrica criativa de peças de marketing (modais de paywall, cards in-feed, banners) conectados aos Tiers. |
| **TTS Voice Studio** | [admin.agoraeufalo.com.br/tts](https://admin.agoraeufalo.com.br/tts) | [`tts-studio.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/tts-studio.html) | Estúdio de síntese de voz Gemini TTS (Dual/Single Speaker), encoder MP3 128k e exportação de áudios. |
| **Blog Panel (CMS)** | [admin.agoraeufalo.com.br/blog](https://admin.agoraeufalo.com.br/blog) | [`blog-panel.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/blog-panel.html) | Editor e gerenciador de postagens do blog com pré-visualização em tempo real e sincronização de feeds. |
| **SEO Manager** | [admin.agoraeufalo.com.br/seo](https://admin.agoraeufalo.com.br/seo) | [`seo-manager.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/seo-manager.html) | Painel de monitoramento de metadados, indexação e tags OpenGraph. |

---

## 🎓 2. Área de Membros & Alunos (`app.agoraeufalo.com.br`)

| Interface | URL Produção | Arquivo Local | Descrição |
| :--- | :--- | :--- | :--- |
| **Dashboard do Aluno (Portal)** | [app.agoraeufalo.com.br/](https://app.agoraeufalo.com.br/) | [`portal.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/portal.html) | Portal do aluno com Hero MasterClass em Midnight Navy, telemetria de listening time, streak e catálogo de cursos. |
| **Sala de Aula (Imersão MasterClass)** | [app.agoraeufalo.com.br/sala](https://app.agoraeufalo.com.br/sala) | [`sala-de-aula.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/sala-de-aula.html) | Sala de aula com vídeo player, conteúdo didático formatado, Sacada de Ouro, PDFs e botão *Enviar para Training Player*. |
| **Vitrine do Curso (Acordeão de Aulas)** | [app.agoraeufalo.com.br/curso](https://app.agoraeufalo.com.br/curso) | [`curso.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/curso.html) | Grade de módulos com miniaturas 16:9 de cada aula, durações e status de conclusão. |
| **Training Player Universal** | [app.agoraeufalo.com.br/player](https://app.agoraeufalo.com.br/player) | [`treino/player.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/treino/player.html) | Player de áudio puro universal estilo Spotify com as 6 arenas de treino auditivo e oral. |
| **Login do Aluno** | [app.agoraeufalo.com.br/login](https://app.agoraeufalo.com.br/login) | [`login.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/login.html) | Tela de autenticação com Magic Link, Google Auth e e-mail/senha. |
| **Cadastro de Novo Aluno** | [app.agoraeufalo.com.br/cadastro](https://app.agoraeufalo.com.br/cadastro) | [`cadastro.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/cadastro.html) | Onboarding gratuito com criação de conta instantânea. |
| **Resgate & Migração de Alunos** | [app.agoraeufalo.com.br/migracao](https://app.agoraeufalo.com.br/migracao) | [`migracao/index.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/migracao/index.html) | Canal de resgate e ativação instantânea com 1 clique para alunos legados. |

---

## 🏛️ 3. Páginas Principais & Flagship (Públicas • `agoraeufalo.com.br`)

| Interface | URL Produção | Arquivo Local | Descrição |
| :--- | :--- | :--- | :--- |
| **Página Principal (Home)** | [agoraeufalo.com.br/](https://agoraeufalo.com.br/) | [`index.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/index.html) | Portal institucional oficial com apresentação da metodologia, cursos e blog. |
| **Projeto AEF 2026** | [agoraeufalo.com.br/projeto-aef](https://agoraeufalo.com.br/projeto-aef) | [`projeto-aef.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/projeto-aef.html) | Página oficial de vendas e matrícula da turma 2026. |
| **Planos & Assinatura Club** | [agoraeufalo.com.br/precos](https://agoraeufalo.com.br/precos) | [`precos.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/precos.html) | Página de planos e preços oficiais de assinatura do AgoraEuFalo Club. |
| **Guia Definitivo Magic Stories** | [agoraeufalo.com.br/guia-magic-stories](https://agoraeufalo.com.br/guia-magic-stories) | [`guia-magic-stories.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/guia-magic-stories.html) | Masterclass e guia completo com Diagrama Hexagonal e treino prático com o Leo Gringo. |
| **Landing Page do E-book** | [agoraeufalo.com.br/ebook](https://agoraeufalo.com.br/ebook) | [`ebook.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/ebook.html) | Página de apresentação e download do livro *Agora Eu Falo Inglês!*. |
| **Canal de Contato** | [agoraeufalo.com.br/contato](https://agoraeufalo.com.br/contato) | [`contato.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/contato.html) | Formulário de contato direto e link para o WhatsApp do Professor Leo. |

---

## 👑 4. Espaços de Mentoria VIP (`app.agoraeufalo.com.br`)

| Mentorado VIP | URL Vitrine do Curso | URL Sala de Aula Master | E-mail Cadastrado |
| :--- | :--- | :--- | :--- |
| **André Barrote** | [app.agoraeufalo.com.br/curso?curso=mentoria-andre](https://app.agoraeufalo.com.br/curso?curso=mentoria-andre) | [app.agoraeufalo.com.br/sala?curso=mentoria-andre](https://app.agoraeufalo.com.br/sala?curso=mentoria-andre) | `andrebarrote1992@gmail.com` |
| **Estêvão Pinheiro** | [app.agoraeufalo.com.br/curso?curso=mentoria-estevao](https://app.agoraeufalo.com.br/curso?curso=mentoria-estevao) | [app.agoraeufalo.com.br/sala?curso=mentoria-estevao](https://app.agoraeufalo.com.br/sala?curso=mentoria-estevao) | `estevaopin@gmail.com` |
| **Thomas** | [app.agoraeufalo.com.br/curso?curso=mentoria-thomas](https://app.agoraeufalo.com.br/curso?curso=mentoria-thomas) | [app.agoraeufalo.com.br/sala?curso=mentoria-thomas](https://app.agoraeufalo.com.br/sala?curso=mentoria-thomas) | `thomas@agoraeufalo.com.br` |
| **Matheus** | [app.agoraeufalo.com.br/curso?curso=mentoria-matheus](https://app.agoraeufalo.com.br/curso?curso=mentoria-matheus) | [app.agoraeufalo.com.br/sala?curso=mentoria-matheus](https://app.agoraeufalo.com.br/sala?curso=mentoria-matheus) | `matheus@agoraeufalo.com.br` |

---

## 📰 5. Blog & Artigos Didáticos (`agoraeufalo.com.br/blog/`)

| Interface | URL Produção | Arquivo Local | Descrição |
| :--- | :--- | :--- | :--- |
| **Feed Principal do Blog** | [agoraeufalo.com.br/blog/](https://agoraeufalo.com.br/blog/) | [`blog/index.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/blog/index.html) | Acervo completo de artigos com filtros de categorias e busca dinâmica. |
| **Post: Falar com Personalidade** | [agoraeufalo.com.br/blog/como-falar-ingles-com-personalidade](https://agoraeufalo.com.br/blog/como-falar-ingles-com-personalidade.html) | [`blog/como-falar-ingles-com-personalidade.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/blog/como-falar-ingles-com-personalidade.html) | Artigo prático com áudio embutido sobre expressividade e entonação. |
| **Post: 3 Erros que Travam** | [agoraeufalo.com.br/blog/evite-esses-3-erros-que-travam-seu-ingles](https://agoraeufalo.com.br/blog/evite-esses-3-erros-que-travam-seu-ingles.html) | [`blog/evite-esses-3-erros-que-travam-seu-ingles.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/blog/evite-esses-3-erros-que-travam-seu-ingles.html) | Desconstrução dos bloqueios mentais e tradução palavra por palavra. |
| **Post: Expandir Vocabulário** | [agoraeufalo.com.br/blog/expandindo-seu-vocabulario-em-ingles-sem-esquecer](https://agoraeufalo.com.br/blog/expandindo-seu-vocabulario-em-ingles-sem-esquecer.html) | [`blog/expandindo-seu-vocabulario-em-ingles-sem-esquecer.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/blog/expandindo-seu-vocabulario-em-ingles-sem-esquecer.html) | Como reter expressões sem listas decoradas com repetição ativa. |
| **Post: Magic Story 01 (Grazi)** | [agoraeufalo.com.br/blog/magic-story-01-historia-da-grazi-treino-reflexo](https://agoraeufalo.com.br/blog/magic-story-01-historia-da-grazi-treino-reflexo.html) | [`blog/magic-story-01-historia-da-grazi-treino-reflexo.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/blog/magic-story-01-historia-da-grazi-treino-reflexo.html) | Mini-história de treino auditivo de reflexo com áudio Dual Speaker. |
| **Post: Magic Story 02 (Tom)** | [agoraeufalo.com.br/blog/magic-story-02-historia-do-tom-present-perfect](https://agoraeufalo.com.br/blog/magic-story-02-historia-do-tom-present-perfect.html) | [`blog/magic-story-02-historia-do-tom-present-perfect.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/blog/magic-story-02-historia-do-tom-present-perfect.html) | Mini-história com foco no uso natural do Present Perfect. |
| **Post: Treino Rápido de Ouvido** | [agoraeufalo.com.br/blog/como-treinar-o-ouvido-para-entender-ingles-rapido](https://agoraeufalo.com.br/blog/como-treinar-o-ouvido-para-entender-ingles-rapido.html) | [`blog/como-treinar-o-ouvido-para-entender-ingles-rapido.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/blog/como-treinar-o-ouvido-para-entender-ingles-rapido.html) | Técnicas para decodificar fala rápida e conexões sonoras de nativos. |

