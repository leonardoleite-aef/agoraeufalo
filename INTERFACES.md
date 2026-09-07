# 🌐 Mapa Mestre de Interfaces e Links • AgoraEuFalo
**Professor Leonardo Leite • Ecossistema Digital EdTech**

Este documento é o inventário oficial de todas as interfaces ativas, interativas e administrativas do ecossistema **AgoraEuFalo**.

> 🔄 **Regra de Manutenção:** Este arquivo é atualizado automaticamente sempre que uma interface for criada, modificada ou removida.

---

## 🌐 Arquitetura Oficial dos 3 Domínios

| Domínio | Função Estratégica | Autenticação / Acesso |
| :--- | :--- | :--- |
| **`https://agoraeufalo.com.br`** | **Site Público, Blog & Landing Pages** | Público (visitantes, leads, SEO, indexado no Google) |
| **`https://app.agoraeufalo.com.br`** | **Área do Aluno (SaaS EdTech)** | Alunos matriculados (Free, Club, Mentorados VIP) |
| **`https://admin.agoraeufalo.com.br`** | **Backoffice Master do Leo** | Restrito / Blindado (Google Auth da Conta Mestre `selexenglish@gmail.com`) |

---

## 🏛️ 1. Páginas Principais & Flagship (Públicas • `agoraeufalo.com.br`)

| Interface | URL Produção | Arquivo Local | Descrição |
| :--- | :--- | :--- | :--- |
| **Página Principal (Home)** | [agoraeufalo.com.br](https://agoraeufalo.com.br/) | [`index.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/index.html) | Portal institucional oficial com apresentação da metodologia, cursos e blog. |
| **Nova Homepage Flagship (Em Validação)** | [agoraeufalo.com.br/nova-home.html](https://agoraeufalo.com.br/nova-home.html) | [`nova-home.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/nova-home.html) | Nova experiência cinemática Dual-Contrast com Hero Deep Navy e seções didáticas claras. |
| **Projeto AEF 2026** | [agoraeufalo.com.br/projeto-aef.html](https://agoraeufalo.com.br/projeto-aef.html) | [`projeto-aef.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/projeto-aef.html) | Página oficial de vendas e matrícula da turma 2026. |
| **Mentoria VIP** | [agoraeufalo.com.br/mentoria.html](https://agoraeufalo.com.br/mentoria.html) | [`mentoria.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/mentoria.html) | Página do programa de Mentoria Individual e Acompanhamento Direto com o Prof. Leo. |
| **Guia Definitivo Magic Stories** | [agoraeufalo.com.br/guia-magic-stories.html](https://agoraeufalo.com.br/guia-magic-stories.html) | [`guia-magic-stories.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/guia-magic-stories.html) | Masterclass e guia completo com Diagrama Hexagonal e treino prático com o Leo Gringo. |
| **Canal de Contato** | [agoraeufalo.com.br/contato.html](https://agoraeufalo.com.br/contato.html) | [`contato.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/contato.html) | Formulário de contato direto e link para o WhatsApp do Professor Leo. |
| **Landing Page do E-book** | [agoraeufalo.com.br/ebook.html](https://agoraeufalo.com.br/ebook.html) | [`ebook.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/ebook.html) | Página de apresentação e download do livro *Agora Eu Falo Inglês!*. |
| **Leitor Web Interativo** | [agoraeufalo.com.br/ler-livro.html](https://agoraeufalo.com.br/ler-livro.html) | [`ler-livro.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/ler-livro.html) | Leitor online elegante com modo sépia/escuro e download de PDF na nuvem. |

---

## 🛠️ 2. Painéis Administrativos & Estúdios Master (`admin.agoraeufalo.com.br`)

| Interface | URL Produção | Arquivo Local | Descrição |
| :--- | :--- | :--- | :--- |
| **Admin Command Hub (Painel Central)** | [admin.agoraeufalo.com.br](https://admin.agoraeufalo.com.br/) | [`admin.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/admin.html) | Hub mestre de comando do Professor Leo estruturado em 6 blocos estratégicos com navegação unificada `aef-admin-nav.js`. |
| **Login Administrativo Master** | [admin.agoraeufalo.com.br/admin-login.html](https://admin.agoraeufalo.com.br/admin-login.html) | [`admin-login.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/admin-login.html) | Tela de autenticação exclusiva e blindada para o Professor Leo (`noindex, nofollow`) com login Google 1-clique. |
| **CRM de Alunos & Tiers (RBAC)** | [admin.agoraeufalo.com.br/admin-alunos.html](https://admin.agoraeufalo.com.br/admin-alunos.html) | [`admin-alunos.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/admin-alunos.html) | CRM em tempo real conectado ao Firestore, filtros por curso/origem, ordenação, paginação, exportação CSV e exclusão com 2FA. |
| **Course Studio (Fábrica de Cursos)** | [admin.agoraeufalo.com.br/admin-cursos.html](https://admin.agoraeufalo.com.br/admin-cursos.html) | [`admin-cursos.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/admin-cursos.html) | Estúdio 3-níveis de criação e gestão dinâmica de cursos, módulos e aulas integradas com sincronização bidirecional Firestore. |
| **Departamento de Vendas (Checkouts)** | [admin.agoraeufalo.com.br/admin-vendas.html](https://admin.agoraeufalo.com.br/admin-vendas.html) | [`admin-vendas.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/admin-vendas.html) | Gestão de ofertas comerciais, precificação Hotmart, links de checkout, triagem WhatsApp e gerador de páginas. |
| **Webhooks & Automação** | [admin.agoraeufalo.com.br/admin-webhooks.html](https://admin.agoraeufalo.com.br/admin-webhooks.html) | [`admin-webhooks.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/admin-webhooks.html) | Monitoramento de webhooks da Hotmart, simulações de compra e automação de e-mails transacionais. |
| **PDF Factory Studio** | [admin.agoraeufalo.com.br/admin-pdf-factory.html](https://admin.agoraeufalo.com.br/admin-pdf-factory.html) | [`admin-pdf-factory.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/admin-pdf-factory.html) | Laboratório editorial e construtor modular de apostilas em PDF nos 3 Arquétipos com ingestão de PDF.js e medidor de densidade. |
| **Fábrica de Marketing & Blocks** | [admin.agoraeufalo.com.br/admin-marketing.html](https://admin.agoraeufalo.com.br/admin-marketing.html) | [`admin-marketing.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/admin-marketing.html) | Fábrica criativa de peças de marketing (modais de paywall, cards in-feed, banners) conectados aos Tiers. |
| **TTS Voice Studio** | [admin.agoraeufalo.com.br/tts-studio.html](https://admin.agoraeufalo.com.br/tts-studio.html) | [`tts-studio.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/tts-studio.html) | Estúdio de síntese de voz Gemini TTS (Dual/Single Speaker), encoder MP3 128k e exportação de áudios. |
| **Blog Panel (CMS)** | [admin.agoraeufalo.com.br/blog-panel.html](https://admin.agoraeufalo.com.br/blog-panel.html) | [`blog-panel.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/blog-panel.html) | Editor e gerenciador de postagens do blog com pré-visualização em tempo real e sincronização de feeds. |
| **SEO Manager** | [admin.agoraeufalo.com.br/seo-manager.html](https://admin.agoraeufalo.com.br/seo-manager.html) | [`seo-manager.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/seo-manager.html) | Painel de monitoramento de metadados, indexação e tags OpenGraph. |
| **Gestão do Player Público (Sunset)** | [admin-publico.html](https://admin.agoraeufalo.com.br/admin-publico.html) | [`admin-publico.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/admin-publico.html) | Rota descontinuada com redirecionamento automático para `admin-alunos.html`. |

---

## 🎓 3. Área de Membros & Alunos (`app.agoraeufalo.com.br`)

| Interface | URL Produção | Arquivo Local | Descrição |
| :--- | :--- | :--- | :--- |
| **Dashboard do Aluno (Portal)** | [app.agoraeufalo.com.br](https://app.agoraeufalo.com.br/) | [`portal.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/portal.html) | Portal do aluno com Hero MasterClass em Midnight Navy, telemetria de listening time, streak e catálogo de cursos. |
| **Sala de Aula (Imersão MasterClass)** | [app.agoraeufalo.com.br/sala-de-aula.html](https://app.agoraeufalo.com.br/sala-de-aula.html) | [`sala-de-aula.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/sala-de-aula.html) | Sala de aula com vídeo player, conteúdo didático formatado, Sacada de Ouro, PDFs e botão *Enviar para Training Player*. |
| **Vitrine do Curso (Acordeão de Aulas)** | [app.agoraeufalo.com.br/curso.html](https://app.agoraeufalo.com.br/curso.html) | [`curso.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/curso.html) | Grade de módulos com miniaturas 16:9 de cada aula, durações e status de conclusão. |
| **Training Player Universal** | [app.agoraeufalo.com.br/treino/player.html](https://app.agoraeufalo.com.br/treino/player.html) | [`treino/player.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/treino/player.html) | Player de áudio puro universal estilo Spotify com as 6 arenas de treino auditivo e oral. |
| **Login do Aluno** | [app.agoraeufalo.com.br/login.html](https://app.agoraeufalo.com.br/login.html) | [`login.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/login.html) | Tela de autenticação com Magic Link, Google Auth e e-mail/senha. |
| **Cadastro de Novo Aluno** | [app.agoraeufalo.com.br/cadastro.html](https://app.agoraeufalo.com.br/cadastro.html) | [`cadastro.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/cadastro.html) | Onboarding gratuito com criação de conta instantânea. |
| **Resgate & Migração de Alunos** | [app.agoraeufalo.com.br/migracao/index.html](https://app.agoraeufalo.com.br/migracao/index.html) | [`migracao/index.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/migracao/index.html) | Canal de resgate e ativação instantânea com 1 clique para alunos legados. |

---

## 📰 4. Blog & Artigos Didáticos (`agoraeufalo.com.br/blog/`)

| Interface | URL Produção | Arquivo Local | Descrição |
| :--- | :--- | :--- | :--- |
| **Feed Principal do Blog** | [agoraeufalo.com.br/blog/index.html](https://agoraeufalo.com.br/blog/index.html) | [`blog/index.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/blog/index.html) | Acervo completo de artigos com filtros de categorias e busca dinâmica. |
| **Post: Falar com Personalidade** | [agoraeufalo.com.br/blog/como-falar-ingles-com-personalidade.html](https://agoraeufalo.com.br/blog/como-falar-ingles-com-personalidade.html) | [`blog/como-falar-ingles-com-personalidade.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/blog/como-falar-ingles-com-personalidade.html) | Artigo prático com áudio embutido sobre expressividade e entonação. |
| **Post: 3 Erros que Travam** | [agoraeufalo.com.br/blog/evite-esses-3-erros-que-travam-seu-ingles.html](https://agoraeufalo.com.br/blog/evite-esses-3-erros-que-travam-seu-ingles.html) | [`blog/evite-esses-3-erros-que-travam-seu-ingles.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/blog/evite-esses-3-erros-que-travam-seu-ingles.html) | Desconstrução dos bloqueios mentais e tradução palavra por palavra. |
| **Post: Expandir Vocabulário** | [agoraeufalo.com.br/blog/expandindo-seu-vocabulario-em-ingles-sem-esquecer.html](https://agoraeufalo.com.br/blog/expandindo-seu-vocabulario-em-ingles-sem-esquecer.html) | [`blog/expandindo-seu-vocabulario-em-ingles-sem-esquecer.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/blog/expandindo-seu-vocabulario-em-ingles-sem-esquecer.html) | Como reter expressões sem listas decoradas com repetição ativa. |
| **Post: Magic Story 01 (Grazi)** | [agoraeufalo.com.br/blog/magic-story-01-historia-da-grazi-treino-reflexo.html](https://agoraeufalo.com.br/blog/magic-story-01-historia-da-grazi-treino-reflexo.html) | [`blog/magic-story-01-historia-da-grazi-treino-reflexo.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/blog/magic-story-01-historia-da-grazi-treino-reflexo.html) | Mini-história de treino auditivo de reflexo com áudio Dual Speaker. |
| **Post: Magic Story 02 (Tom)** | [agoraeufalo.com.br/blog/magic-story-02-historia-do-tom-present-perfect.html](https://agoraeufalo.com.br/blog/magic-story-02-historia-do-tom-present-perfect.html) | [`blog/magic-story-02-historia-do-tom-present-perfect.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/blog/magic-story-02-historia-do-tom-present-perfect.html) | Mini-história com foco no uso natural do Present Perfect. |
| **Post: Treino Rápido de Ouvido** | [agoraeufalo.com.br/blog/como-treinar-o-ouvido-para-entender-ingles-rapido.html](https://agoraeufalo.com.br/blog/como-treinar-o-ouvido-para-entender-ingles-rapido.html) | [`blog/como-treinar-o-ouvido-para-entender-ingles-rapido.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/blog/como-treinar-o-ouvido-para-entender-ingles-rapido.html) | Técnicas para decodificar fala rápida e conexões sonoras de nativos. |

---

## 👑 5. Espaços de Mentoria VIP (`curso.html?curso=mentoria-[slug]`)

| Mentorado VIP | URL Vitrine do Curso | URL Sala de Aula Master | E-mail Cadastrado |
| :--- | :--- | :--- | :--- |
| **André Barrote** | [curso.html?curso=mentoria-andre](https://app.agoraeufalo.com.br/curso.html?curso=mentoria-andre) | [sala-de-aula.html?curso=mentoria-andre](https://app.agoraeufalo.com.br/sala-de-aula.html?curso=mentoria-andre) | `andrebarrote1992@gmail.com` |
| **Estêvão Pinheiro** | [curso.html?curso=mentoria-estevao](https://app.agoraeufalo.com.br/curso.html?curso=mentoria-estevao) | [sala-de-aula.html?curso=mentoria-estevao](https://app.agoraeufalo.com.br/sala-de-aula.html?curso=mentoria-estevao) | `estevaopin@gmail.com` |
| **Thomas** | [curso.html?curso=mentoria-thomas](https://app.agoraeufalo.com.br/curso.html?curso=mentoria-thomas) | [sala-de-aula.html?curso=mentoria-thomas](https://app.agoraeufalo.com.br/sala-de-aula.html?curso=mentoria-thomas) | `thomas@agoraeufalo.com.br` |
| **Matheus** | [curso.html?curso=mentoria-matheus](https://app.agoraeufalo.com.br/curso.html?curso=mentoria-matheus) | [sala-de-aula.html?curso=mentoria-matheus](https://app.agoraeufalo.com.br/sala-de-aula.html?curso=mentoria-matheus) | `matheus@agoraeufalo.com.br` |
