# 🌐 Mapa Mestre de Interfaces e Links • AgoraEuFalo

Este documento é o inventário oficial de todas as interfaces ativas, interativas e administrativas do ecossistema **AgoraEuFalo** (Professor Leonardo Leite).

> 🔄 **Regra de Manutenção:** Este arquivo é atualizado automaticamente sempre que uma interface for criada, modificada ou removida.

---

## 🏛️ 1. Páginas Principais & Flagship (Públicas)

| Interface | URL Produção | Arquivo Local | Descrição |
| :--- | :--- | :--- | :--- |
| **Página Principal (Home)** | [agoraeufalo.com.br](https://agoraeufalo.com.br/) | [`index.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/index.html) | Portal institucional oficial com apresentação da metodologia, cursos e blog. |
| **Nova Homepage Flagship (Em Validação)** | [agoraeufalo.com.br/nova-home.html](https://agoraeufalo.com.br/nova-home.html) | [`nova-home.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/nova-home.html) | Nova experiência cinemática Dual-Contrast (Hero Deep Navy com iPhone Titanium interativo de 1 toque, Seções Didáticas em fundo claro alto contraste, As 6 Atividades do Método, Desktop vs Mobile, Quem é o Leo, Depoimentos e Onboarding com transição cinemática contínua). |
| **Projeto AEF 2026** | [agoraeufalo.com.br/projeto-aef.html](https://agoraeufalo.com.br/projeto-aef.html) | [`projeto-aef.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/projeto-aef.html) | Página oficial de vendas e matrícula da turma 2026. |
| **Mentoria VIP** | [agoraeufalo.com.br/mentoria.html](https://agoraeufalo.com.br/mentoria.html) | [`mentoria.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/mentoria.html) | Página do programa de Mentoria Individual e Acompanhamento Direto com o Prof. Leo. |
| **Guia Definitivo Magic Stories** | [agoraeufalo.com.br/guia-magic-stories.html](https://agoraeufalo.com.br/guia-magic-stories.html) | [`guia-magic-stories.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/guia-magic-stories.html) | Masterclass e guia completo com Diagrama Hexagonal e treino prático com o Leo Gringo. |
| **Portal de Membros (Área do Aluno)** | [agoraeufalo.com.br/portal.html](https://agoraeufalo.com.br/portal.html) | [`portal.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/portal.html) | Dashboard Editorial Prestige 1:1 com Hero MasterClass em Midnight Navy, navegação vertical, áudio visualizer, sentenças bilíngues e agenda de aulas ao vivo. |
| **Canal de Contato** | [agoraeufalo.com.br/contato.html](https://agoraeufalo.com.br/contato.html) | [`contato.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/contato.html) | Formulário de contato direto e link para o WhatsApp do Professor Leo. |

---

## 🎙️ 2. Player Universal AgoraEuFalo (Escutar no Celular / On the Go)

| Interface | URL Produção | Arquivo Local | Descrição |
| :--- | :--- | :--- | :--- |
| **Player Universal AEF (Single Source of Truth)** | [agoraeufalo.com.br/treino/player.html](https://agoraeufalo.com.br/treino/player.html) | [`treino/player.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/treino/player.html) | Player de áudio puro universal estilo Apple Music / Spotify com seletor de Cursos (*Magic Stories*, *English QuickStart*), Novidades, Mentoria VIP e Minhas Coisas, letra sincronizada deslizante, controle de velocidade (0.75x a 1.5x), continuous play, motor de controle de acesso por Tier (Paywall Modal para Aluno Free vs Club vs VIP), telemetria contínua de Listening Time integrada ao `aefLearningTracker` e **Sincronização Dinâmica em Nuvem com o Firestore** (reconciliação de áudios, letras, ordens canônicas, expurgo de aulas excluídas no Course Studio e atualização reativa cross-tab instantânea). |
| **Magic Stories Alias Redirect** | [agoraeufalo.com.br/treino/magic-stories.html](https://agoraeufalo.com.br/treino/magic-stories.html) | [`treino/magic-stories.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/treino/magic-stories.html) | Redirecionamento suave e transparente para `player.html?curso=ms-legacy`. |
| **Player Root SaaS** | [agoraeufalo.com.br/player.html](https://agoraeufalo.com.br/player.html) | [`player.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/player.html) | Ponto de entrada com Smart Welcome redirecionando para `treino/player.html`. |

---

## 📚 3. Livro Digital & Leitores Web

| Interface | URL Produção | Arquivo Local | Descrição |
| :--- | :--- | :--- | :--- |
| **Landing Page do E-book** | [agoraeufalo.com.br/ebook.html](https://agoraeufalo.com.br/ebook.html) | [`ebook.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/ebook.html) | Página de apresentação e download do livro *Agora Eu Falo Inglês!*. |
| **Leitor Web Interativo** | [agoraeufalo.com.br/ler-livro.html](https://agoraeufalo.com.br/ler-livro.html) | [`ler-livro.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/ler-livro.html) | Leitor online elegante com modo sépia/escuro e download de PDF na nuvem. |
| **Leitor E-book (Alias)** | [agoraeufalo.com.br/leitor-ebook.html](https://agoraeufalo.com.br/leitor-ebook.html) | [`leitor-ebook.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/leitor-ebook.html) | Interface secundária de leitura digital. |

---

## 📰 4. Blog & Artigos Didáticos

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

## 🛠️ 5. Painéis Administrativos & Estúdios de Produção (Área do Professor)

| Interface | URL Produção | Arquivo Local | Descrição |
| :--- | :--- | :--- | :--- |
| **Admin Command Hub (Painel Central)** | [agoraeufalo.com.br/admin.html](https://agoraeufalo.com.br/admin.html) | [`admin.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/admin.html) | Hub mestre de comando do Professor Leo estruturado em 6 blocos estratégicos: Pessoas (CRM/Tiers), Cursos, Marketing (Ofertas/LPs), Comunicação (Send/WhatsApp), Vendas (Checkouts/Migração) e Site-Blog AEF & SEO. |
| **PDF Factory Studio (Laboratório de PDFs)** | [agoraeufalo.com.br/admin-pdf-factory.html](https://agoraeufalo.com.br/admin-pdf-factory.html) | [`admin-pdf-factory.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/admin-pdf-factory.html) | Laboratório editorial e construtor modular de apostilas em PDF com ingestão inteligente de PDFs legados (PDF.js), edição em blocos por página A4, medidor de densidade ideal de 85%, paletas temáticas oficiais e vinculação direta com cursos e aulas. |
| **Fábrica de Marketing & Building Blocks** | [agoraeufalo.com.br/admin-marketing.html](https://agoraeufalo.com.br/admin-marketing.html) | [`admin-marketing.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/admin-marketing.html) | Fábrica criativa de peças de marketing (modais de paywall, cards in-feed, banners flutuantes de topo). Possui seletor dinâmico conectado à base de Vendas e segmentação precisa por Tiers de alunos. |
| **Departamento de Vendas (Ofertas & Checkouts)** | [agoraeufalo.com.br/admin-vendas.html](https://agoraeufalo.com.br/admin-vendas.html) | [`admin-vendas.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/admin-vendas.html) | Gestão central de ofertas comerciais, precificação, parcelamento, links diretos de checkout Hotmart, triagem no WhatsApp, regras de escassez (OTO) e assistente de cadastro para a Hotmart com cópia em 1 clique. |
| **Gestor de Ofertas & Trials (Legado / Redirect)** | [agoraeufalo.com.br/admin-ofertas.html](https://agoraeufalo.com.br/admin-ofertas.html) | [`admin-ofertas.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/admin-ofertas.html) | Rota legada de ofertas com redirecionamento automático para o novo Departamento de Vendas (`admin-vendas.html`). |
| **Course Studio (Gestor de Cursos)** | [agoraeufalo.com.br/admin-cursos.html](https://agoraeufalo.com.br/admin-cursos.html) | [`admin-cursos.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/admin-cursos.html) | Estúdio 3-níveis de criação e gestão dinâmica de cursos, módulos (MS001 a MS030+) e aulas integradas com sincronização bidirecional resiliente ao Firestore (SDK + REST fallback) e expurgo automático de itens excluídos. |
| **CRM de Alunos & Tiers (RBAC)** | [agoraeufalo.com.br/admin-alunos.html](https://agoraeufalo.com.br/admin-alunos.html) | [`admin-alunos.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/admin-alunos.html) | CRM de alunos em tempo real conectado ao Firestore, gestão de Tiers (Free, Club, VIP, Admin God Mode), prescrições de áudio 1 a 1 e permissões de equipe. |
| **TTS Studio (Fábrica de Áudios)** | [agoraeufalo.com.br/tts-studio.html](https://agoraeufalo.com.br/tts-studio.html) | [`tts-studio.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/tts-studio.html) | Estúdio Gemini TTS com templates das 6 etapas Magic Stories, alinhamento fonético STT e roteamento por 3 Tiers. |
| **Gestão do Player Público & Leads** | [agoraeufalo.com.br/admin-publico.html](https://agoraeufalo.com.br/admin-publico.html) | [`admin-publico.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/admin-publico.html) | CRM de Leads capturados no Lead Gate, upload de vídeos na nuvem e publicação de faixas. |
| **Blog Panel (CMS)** | [agoraeufalo.com.br/blog-panel.html](https://agoraeufalo.com.br/blog-panel.html) | [`blog-panel.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/blog-panel.html) | Editor e gerenciador de postagens do blog com pré-visualização em tempo real. |
| **SEO Manager** | [agoraeufalo.com.br/seo-manager.html](https://agoraeufalo.com.br/seo-manager.html) | [`seo-manager.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/seo-manager.html) | Painel de monitoramento de metadados, indexação e tags OpenGraph. |

---

## 🔒 6. Área de Membros, Acesso & Páginas Legais

| Interface | URL Produção | Arquivo Local | Descrição |
| :--- | :--- | :--- | :--- |
| **Canal de Resgate & Migração de Alunos** | [agoraeufalo.com.br/migracao/index.html](https://agoraeufalo.com.br/migracao/index.html) | [`migracao/index.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/migracao/index.html) | Página personalizada de boas-vindas do Professor Leo e ativação instantânea com 1 clique para alunos legados da Hotmart. |
| **Dashboard do Aluno (Portal Central)** | [agoraeufalo.com.br/portal.html](https://agoraeufalo.com.br/portal.html) | [`portal.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/portal.html) | Centro de comando do aluno com telemetria de listening time, streak, catálogo dos 3 cursos oficiais e vitrine. |
| **Entrada no Curso (Vitrine & Acordeão de Módulos)** | [agoraeufalo.com.br/curso.html](https://agoraeufalo.com.br/curso.html) | [`curso.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/curso.html) | Vitrine do curso estilo Hotmart Club / MasterClass com capa do curso, acordeão de módulos, miniaturas 16:9 oficiais de cada aula (`thumbnailUrl`), durações e links diretos para a Sala de Aula e Training Player. |
| **Sala de Aula (Imersão Desktop Fullscreen)** | [agoraeufalo.com.br/sala-de-aula.html](https://agoraeufalo.com.br/sala-de-aula.html) | [`sala-de-aula.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/sala-de-aula.html) | Sala de aula com vídeo stage, chunks, Sacada de Ouro, PDFs e botão de 1-toque para treino prático no Training Player. |
| **Cadastro Gratuito (Novo Aluno)** | [agoraeufalo.com.br/cadastro.html](https://agoraeufalo.com.br/cadastro.html) | [`cadastro.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/cadastro.html) | Página dedicada de cadastro gratuito com Magic Link e Google Auth. |
| **Login do Portal** | [agoraeufalo.com.br/login.html](https://agoraeufalo.com.br/login.html) | [`login.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/login.html) | Tela de autenticação e acesso às áreas fechadas. |
| **Página de Confirmação (Obrigado)** | [agoraeufalo.com.br/obrigado.html](https://agoraeufalo.com.br/obrigado.html) | [`obrigado.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/obrigado.html) | Página de confirmação de cadastro de lead e entrega de material. |
| **Política de Privacidade** | [agoraeufalo.com.br/politica-de-privacidade.html](https://agoraeufalo.com.br/politica-de-privacidade.html) | [`politica-de-privacidade.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/politica-de-privacidade.html) | Termos de conformidade com a LGPD e privacidade de dados. |
| **Termos de Uso** | [agoraeufalo.com.br/termos-de-uso.html](https://agoraeufalo.com.br/termos-de-uso.html) | [`termos-de-uso.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/termos-de-uso.html) | Condições gerais de uso do site e serviços educacionais. |

---

## 🎨 7. Templates Modulares & Design System Core (`assets/js/templates/`)

| Módulo de Template | Arquivo Local | Descrição |
| :--- | :--- | :--- |
| **AEF Editorial Prestige Template** | [`assets/js/templates/aef-template-editorial.js`](file:///Users/macbookpro/Desktop/agoraeufalo_site/assets/js/templates/aef-template-editorial.js) | Renderizador do Hero MasterClass 16:9 em Midnight Navy, Acordeão de Módulos e telemetria de progresso do Portal. |
| **AEF Player Zen Template** | [`assets/js/templates/aef-template-player-zen.js`](file:///Users/macbookpro/Desktop/agoraeufalo_site/assets/js/templates/aef-template-player-zen.js) | Renderizador do Palco Zen de Cartão Único, Medidor Circular AI Coach (8.8/10), Cards Unificados de Alto Contraste, Relatório de Fala e Matriz de Chunks. |
| **AEF Master Luxury CSS** | [`assets/css/aef-luxury-system.css`](file:///Users/macbookpro/Desktop/agoraeufalo_site/assets/css/aef-luxury-system.css) | Folha de estilos unificada do Luxury Editorial Prestige Design System do AgoraEuFalo. |

---

## 📑 8. Livros Impressos, Apostilas & Materiais Didáticos em PDF (`Material-PDF/`)

| Material PDF | Arquivo Local | Descrição |
| :--- | :--- | :--- |
| **Livro Oficial MS001 (Grazi)** | [`Material-PDF/MS001_Grazi_wants_to_change_Apostila_Oficial.pdf`](file:///Users/macbookpro/Desktop/agoraeufalo_site/Material-PDF/MS001_Grazi_wants_to_change_Apostila_Oficial.pdf) | **Template Canônico dos 3 Arquétipos (Fontes 15 a 17pt):**<br/>• **Arquétipo 1 (Capa Deep Navy):** Fundo Solid Deep Navy, arte 1:1, ficha técnica e sinopse.<br/>• **Arquétipo 2 (Content & VOC):** História da Grazi em 16.5pt, Tradução Falada Real, análise contextual e chunks funcionais.<br/>• **Arquétipo 3 (Practice Workbook):** LA sem respostas impressas, Look & Retell com perguntas-guia, LASK sem perguntas reveladas e PRO com texto integral de LR com linking sounds e Sacada de Ouro. |
| **Livro Oficial MS002 (Tom)** | [`Material-PDF/MS002_Tom_workaholic_CEO_Apostila_Oficial.pdf`](file:///Users/macbookpro/Desktop/agoraeufalo_site/Material-PDF/MS002_Tom_workaholic_CEO_Apostila_Oficial.pdf) | **Template Canônico dos 3 Arquétipos (Fontes 15 a 17pt):**<br/>• **Arquétipo 1 (Capa Deep Navy):** Fundo Solid Deep Navy, foto 1:1, ficha técnica e sinopse.<br/>• **Arquétipo 2 (Content & VOC):** História do Tom em 16.5pt, rotina de CEO, Tradução Falada Real e pílulas com "O Sentimento da Estrutura" sem jargões.<br/>• **Arquétipo 3 (Practice Workbook):** LA sem respostas impressas, Look & Retell com perguntas-guia, LASK sem perguntas reveladas e PRO com texto integral de LR com linking sounds e Sacada de Ouro. |
| **Livro Oficial MS003 (Saturday Morning)** | [`Material-PDF/MS003_Saturday_Morning_Apostila_Oficial.pdf`](file:///Users/macbookpro/Desktop/agoraeufalo_site/Material-PDF/MS003_Saturday_Morning_Apostila_Oficial.pdf) | **Template Canônico dos 3 Arquétipos (Fontes 15 a 17pt):**<br/>• **Arquétipo 1 (Capa Deep Navy):** Fundo Solid Deep Navy, arte 1:1, ficha técnica e sinopse.<br/>• **Arquétipo 2 (Content & VOC):** Manhã de sábado em Brasília em 16.5pt, café em família, Tradução Falada Real e Deep Dive de estações e clima.<br/>• **Arquétipo 3 (Practice Workbook):** LA sem respostas impressas, Look & Retell com perguntas-guia, LASK sem perguntas reveladas e PRO com texto integral de LR com linking sounds e Sacada de Ouro. |
| **Guia Definitivo Magic Stories** | [`Material-PDF/guia-magic-stories.pdf`](file:///Users/macbookpro/Desktop/agoraeufalo_site/Material-PDF/guia-magic-stories.pdf) | Apostila completa do Guia Definitivo do Método Magic Stories. |
| **EQS 1.1: Os Pronomes Sujeito** | [`Material-PDF/EQS_1_1_Pronomes_Pessoais.pdf`](file:///Users/macbookpro/Desktop/agoraeufalo_site/Material-PDF/EQS_1_1_Pronomes_Pessoais.pdf) | Apostila do Módulo 1 Aula 1.1 da trilha Foundation (Pronomes Pessoais e IT curinga). |
| **EQS 1.2: To Be (Afirmativa)** | [`Material-PDF/EQS_1_2_O_Rei_dos_Verbos_To_Be_Afirmativa.pdf`](file:///Users/macbookpro/Desktop/agoraeufalo_site/Material-PDF/EQS_1_2_O_Rei_dos_Verbos_To_Be_Afirmativa.pdf) | Apostila do Módulo 1 Aula 1.2 da trilha Foundation (To Be Afirmativa, Ser vs Estar). |
| **EQS 1.3: To Be (Negativa)** | [`Material-PDF/EQS_1_3_O_Rei_dos_Verbos_To_Be_Negativa.pdf`](file:///Users/macbookpro/Desktop/agoraeufalo_site/Material-PDF/EQS_1_3_O_Rei_dos_Verbos_To_Be_Negativa.pdf) | Apostila do Módulo 1 Aula 1.3 da trilha Foundation (To Be Negativa, Isn't e Aren't). |
| **EQS 1.4: Adjetivos Essenciais** | [`Material-PDF/EQS_1_4_Adjetivos_Essenciais.pdf`](file:///Users/macbookpro/Desktop/agoraeufalo_site/Material-PDF/EQS_1_4_Adjetivos_Essenciais.pdf) | Apostila do Módulo 1 Aula 1.4 da trilha Foundation (Adjetivos invariáveis, ordem e posições). |

---

## 🖼️ 9. Kits de Capas 16:9 & Miniaturas de Vídeo-Aulas (`assets/images/thumbs/`)

| Módulo / História | Pasta Local | Arquivos de Capa (16:9) |
| :--- | :--- | :--- |
| **MS001: Graziella** | [`assets/images/thumbs/ms001/`](file:///Users/macbookpro/Desktop/agoraeufalo_site/assets/images/thumbs/ms001/) | • `thumb_ms001_lr.jpg` (Aula 01 • Listen & Read - Cobalto)<br/>• `thumb_ms001_voc.jpg` (Aula 02 • Vocabulary - Esmeralda)<br/>• `thumb_ms001_la.jpg` (Aula 03 • Listen & Answer - Âmbar)<br/>• `thumb_ms001_lrt.jpg` (Aula 04 • Look & Retell - Rubi)<br/>• `thumb_ms001_lask.jpg` (Aula 05 • Listen & Ask - Índigo)<br/>• `thumb_ms001_pro.jpg` (Aula 06 • Pronunciation - Teal) |
| **MS002: Tom (CEO)** | [`assets/images/thumbs/ms002/`](file:///Users/macbookpro/Desktop/agoraeufalo_site/assets/images/thumbs/ms002/) | • `thumb_ms002_lr.jpg` (Aula 01 • Listen & Read - Cobalto)<br/>• `thumb_ms002_voc.jpg` (Aula 02 • Vocabulary - Esmeralda)<br/>• `thumb_ms002_la.jpg` (Aula 03 • Listen & Answer - Âmbar)<br/>• `thumb_ms002_lrt.jpg` (Aula 04 • Look & Retell - Rubi)<br/>• `thumb_ms002_lask.jpg` (Aula 05 • Listen & Ask - Índigo)<br/>• `thumb_ms002_pro.jpg` (Aula 06 • Pronunciation - Teal) |
| **MS003: Saturday Morning** | [`assets/images/thumbs/ms003/`](file:///Users/macbookpro/Desktop/agoraeufalo_site/assets/images/thumbs/ms003/) | • `thumb_ms003_lr.jpg` (Aula 01 • Listen & Read - Cobalto)<br/>• `thumb_ms003_voc.jpg` (Aula 02 • Vocabulary - Esmeralda)<br/>• `thumb_ms003_la.jpg` (Aula 03 • Listen & Answer - Âmbar)<br/>• `thumb_ms003_lrt.jpg` (Aula 04 • Look & Retell - Rubi)<br/>• `thumb_ms003_lask.jpg` (Aula 05 • Listen & Ask - Índigo)<br/>• `thumb_ms003_pro.jpg` (Aula 06 • Pronunciation - Teal) |
| **EQS Módulo 1: Foundation** | [`assets/images/thumbs/eqs/`](file:///Users/macbookpro/Desktop/agoraeufalo_site/assets/images/thumbs/eqs/) | • `thumb_eqs_1_1.jpg` (Aula 1.1 • Pronomes Sujeito - Esmeralda)<br/>• `thumb_eqs_1_2.jpg` (Aula 1.2 • To Be Afirmativa - Cobalto)<br/>• `thumb_eqs_1_3.jpg` (Aula 1.3 • To Be Negativa - Âmbar)<br/>• `thumb_eqs_1_4.jpg` (Aula 1.4 • Adjetivos Essenciais - Rubi) |
| **Mentoria VIP: André Barrote** | [`assets/images/thumbs/andre/`](file:///Users/macbookpro/Desktop/agoraeufalo_site/assets/images/thumbs/andre/) | • `cover-andre-barrote.jpg` (Capa Oficial do Curso & Mentoria VIP)<br/>• `thumb_welcome.jpg` (Miniatura 16:9 do Módulo 01 • Welcome André!) |

---

## 👑 10. Espaços de Mentoria VIP & Salas de Aula Master (`curso.html?curso=mentoria-[slug]`)

| Mentorado VIP | URL Vitrine do Curso | URL Sala de Aula Master | E-mail Cadastrado |
| :--- | :--- | :--- | :--- |
| **André Barrote** | [curso.html?curso=mentoria-andre](curso.html?curso=mentoria-andre) | [sala-de-aula.html?curso=mentoria-andre](sala-de-aula.html?curso=mentoria-andre) | `andrebarrote1992@gmail.com` |
| **Estêvão Pinheiro** | [curso.html?curso=mentoria-estevao](curso.html?curso=mentoria-estevao) | [sala-de-aula.html?curso=mentoria-estevao](sala-de-aula.html?curso=mentoria-estevao) | `estevaopin@gmail.com` |
| **Thomas** | [curso.html?curso=mentoria-thomas](curso.html?curso=mentoria-thomas) | [sala-de-aula.html?curso=mentoria-thomas](sala-de-aula.html?curso=mentoria-thomas) | `thomas@agoraeufalo.com.br` |
| **Matheus** | [curso.html?curso=mentoria-matheus](curso.html?curso=mentoria-matheus) | [sala-de-aula.html?curso=mentoria-matheus](sala-de-aula.html?curso=mentoria-matheus) | `matheus@agoraeufalo.com.br` |
