# 🗺️ MAPA OFICIAL DO ECOSSISTEMA AGORAEUFALO
**Plataforma SaaS EdTech & Ecossistema Digital — Professor Leonardo Leite**
*Documento Mestre de Navegação, Roteamento e Estrutura Arquitetural (Single Source of Truth)*

---

## 🧭 1. Visão Macro das 4 Áreas do Ecossistema

O ecossistema **AgoraEuFalo** foi desenhado com separação rígida de responsabilidades em **4 Áreas Principais**, com rotas claras, sem links fictícios ou âncoras cegas:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   ECOSSISTEMA DIGITAL AGORAEUFALO                              │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                │
│  🏛️ ÁREA 1: INSTITUCIONAL & CAPTAÇÃO (Público, Visitante & Leads)                              │
│  ├── Início (Landing Page Principal) ─────────► index.html                                     │
│  ├── Blog & Artigos Didáticos ────────────────► blog/index.html & blog/[slug].html             │
│  ├── Guia Definitivo do Método ───────────────► guia-magic-stories.html                        │
│  ├── Matrícula Projeto AEF 2026 ──────────────► projeto-aef.html                               │
│  ├── Contato & WhatsApp do Leo ───────────────► contato.html                                   │
│  └── Login / Criar Conta Gratuita ────────────► login.html / cadastro.html                     │
│                                                                                                │
│  🎓 ÁREA 2: PORTAL DO ALUNO & AMBIENTE DE ESTUDO (Membros Matriculados)                        │
│  ├── Dashboard Geral do Aluno ────────────────► portal.html                                    │
│  ├── Vitrine de Módulos do Curso ─────────────► curso.html?curso=ms-legacy                     │
│  ├── Sala de Aula Masterclass (Vídeo + PDF) ──► sala-de-aula.html?curso=ms-legacy&aula=...     │
│  └── Banco de Repertório & Flashcards ────────► repertorio.html                                │
│                                                                                                │
│  🎧 ÁREA 3: TRAINING PLAYER (Palco Zen de Fala, Escuta Ativa & Modo Avião)                    │
│  ├── 💡 Sugestões do Leo (Free Plan 🌱) ──────► player.html (Ambiente 'public')                │
│  ├── 🎓 Magic Stories (Módulos de Curso 🎓) ──► player.html (Ambiente 'course')                │
│  ├── 👑 Mentoria VIP Individual (1 a 1 👑) ───► player.html?aluno=[slug] (Ambiente 'vip')      │
│  ├── 🧪 Minhas Coisas (Laboratório Lab 🧪) ───► player.html (Ambiente 'custom')                │
│  └── ✈️ In-Flight Offline Sync (Modo Avião) ──► CacheStorage + IndexedDB (Offline 100%)       │
│                                                                                                │
│  ⚙️ ÁREA 4: BACKOFFICE & ESTÚDIO DE PRODUÇÃO (Exclusivo do Professor Leo)                     │
│  ├── Course Studio (Gestor de Cursos/Aulas) ──► admin-cursos.html                              │
│  ├── CRM de Alunos & Prescrições VIP ─────────► admin-alunos.html                              │
│  ├── Gemini TTS Voice Studio ─────────────────► tts-studio.html                                │
│  └── Painel CMS de Publicação do Blog ────────► blog-panel.html                                │
│                                                                                                │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏛️ 2. Mapa Detalhado de Telas, Parâmetros e Funções

### Área 1: Institucional, Blog & Captação Pública

| Tela | Arquivo / Rota | Acesso | O que faz nesta tela? | Menu Superior |
| :--- | :--- | :--- | :--- | :--- |
| **Início (Landing Page)** | [`index.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/index.html) | Aberto | Apresentação institucional dos 35 anos de método do Leo, vídeo manifesto, depoimentos reais, FAQ e botão de matrícula. | Início, Blog, Guia Definitivo, Projeto AEF, Contato + *Garantir Vaga*. |
| **Blog Oficial** | [`blog/index.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/blog/index.html) | Aberto | Feed de artigos didáticos, análises de inglês falado do dia a dia e sacadas pedagógicas. | Início, Blog, Guia Definitivo, Projeto AEF, Contato. |
| **Artigo de Conteúdo** | `blog/[slug].html` | Aberto | Artigo com player de vídeo do YouTube em alta definição, blocos didáticos claros, `#duvidas-box`, `#projeto-2026` e download de apostila. | Início, Blog, Guia Definitivo, Projeto AEF, Contato. |
| **Guia Definitivo** | [`guia-magic-stories.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/guia-magic-stories.html) | Aberto | Manifesto das 6 atividades canônicas, neurociência da fala no reflexo e download de e-book. | Início, Blog, Guia Definitivo, Projeto AEF, Contato. |
| **Projeto AEF 2026** | [`projeto-aef.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/projeto-aef.html) | Aberto | Página oficial de vendas da Mentoria e Formação Completa 2026 com link direto para WhatsApp e checkout. | Início, Blog, Guia Definitivo, Projeto AEF, Contato. |
| **Contato** | [`contato.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/contato.html) | Aberto | Formulário de suporte oficial (`selexenglish@gmail.com`) e botão direto para o WhatsApp do Professor Leo. | Início, Blog, Guia Definitivo, Projeto AEF, Contato. |
| **Login** | [`login.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/login.html) | Aberto | Autenticação por e-mail/senha ou Google Auth para entrar no Portal do Aluno. | Botão de retorno ao site. |
| **Cadastro** | [`cadastro.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/cadastro.html) | Aberto | Registro de novo lead/aluno para liberação do Plano Gratuito (Tier 1 🌱). | Botão de retorno ao site. |

---

### Área 2: Portal do Aluno & Sala de Aula

| Tela | Arquivo / Rota | Parâmetros Suportados | O que faz nesta tela? |
| :--- | :--- | :--- | :--- |
| **1. Dashboard do Membro** | [`portal.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/portal.html) | N/A | **Hub Diário:** Indicador de ofensiva diária (streak), tempo de escuta acumulado, card da *Prática Ativa de Hoje* e lista dos cursos matriculados. |
| **2. Vitrine de Módulos** | [`curso.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/curso.html) | `?curso=ms-legacy` | **Grade Curricular:** Visualização de todos os módulos (MS001, MS002, MS003), acordeão de aulas com as **miniaturas 16:9 oficiais**, duração, status de conclusão e botão para abrir a aula. |
| **3. Sala de Aula Masterclass** | [`sala-de-aula.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/sala-de-aula.html) | `?curso=ms-legacy&modulo=ms003-saturday-morning&aula=ms003-lr` | **Estudo Teórico & Materiais:** Player de vídeo 16:9, download do PDF oficial de 8 páginas da lição, chunks em destaque, Sacada de Ouro do Leo e botão *📌 Enviar para Training Player*. |
| **4. Repertório de Frases** | [`repertorio.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/repertorio.html) | N/A | **Banco de Chunks & Flashcards:** Modo de memorização ativa e revisão espaçada de frases prontas para reuniões, apresentações e viagens. |

---

### Área 3: Training Player (Spoken Reflex Studio & Modo Avião)

**Arquivo Central:** [`treino/player.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/treino/player.html) (Acessível também via rota raiz `player.html`)

#### Os 4 Ambientes / Categorias do Player:
1. **💡 Sugestões do Leo (`public` / Free Plan 🌱):** Faixa de treino aberta demonstrativa (*Conversational Clarity & Small Talk*) para alunos cadastrados.
2. **🎓 Magic Stories (`course` / Cursos 🎓):** As faixas oficiais dos módulos dos cursos matriculados (MS001 Graziella, MS002 Tom CEO, MS003 Saturday Morning).
3. **👑 Mentoria VIP (`vip` / Alunos Particulares 👑):** Acesso 1 a 1 para mentorados individuais (`?aluno=andre`, `?aluno=estevao`, `?aluno=thomas`, `?aluno=matheus`) com as gravações sob medida do Leo.
4. **🧪 Minhas Coisas (`custom` / Laboratório do Aluno 🧪):** Estúdio onde o aluno cola um link do YouTube, faz upload de MP3 próprio ou cola um texto em inglês para criar seu treino personalizado.

#### As 6 Atividades Canônicas no Palco Zen:
1. **`1. Listen & Read (LR)`:** Entrada auditiva real sem tradução, com auto-scroll suave e play/pause por frase.
2. **`2. Vocabulary Session (VOC)`:** Texto com Tradução Falada Real (`spokenTranslation`) + matriz de sound chunks isolados com áudios `▶`.
3. **`3. Listen & Answer (LA)`:** Treino de reflexo rápido bate-pronto **SEM respostas reveladas** na tela.
4. **`4. Look & Retell (LRT)`:** Palco de gravação autônoma com AI Speech Coach (*O Teste do Gringo 0 a 10*).
5. **`5. Listen & Ask (LASK)`:** Formulação imediata de perguntas **SEM perguntas prontas reveladas**.
6. **`6. Pronunciation & Connected Speech (PRO)`:** Texto integral de LR com *linking sounds*, chave fonética e botão de repetição em loop contínuo (`🔂`).

#### ✈️ Tecnologia de Treino no Voo (In-Flight Offline Mode):
* **Botão Topo Direito:** `[ ✈️ Modo Avião ]`
* **Mecânica:** Download em lote de toda a playlist do aluno (áudios MP3 128k, textos, timestamps) para o banco **IndexedDB + Cache Storage via Service Worker (`sw.js`)**.
* **Resultado:** O aluno pode desligar a internet no voo e treinar todas as faixas da playlist 100% offline.

---

### Área 4: Backoffice & Ferramentas de Produção (Professor Leo)

| Ferramenta | Arquivo / Rota | Função no Ecossistema |
| :--- | :--- | :--- |
| **Course Studio** | [`admin-cursos.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/admin-cursos.html) | Criação de cursos, adição de módulos, upload de metadados de vídeo-aulas e vinculação de faixas do Training Player. |
| **CRM de Alunos** | [`admin-alunos.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/admin-alunos.html) | Gestão de alunos cadastrados, liberação de planos (Free, Curso, VIP) e prescrição de treinos individuais. |
| **Gemini TTS Studio** | [`tts-studio.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/tts-studio.html) | Estúdio de inteligência artificial vocal para síntese de áudios em MP3 128k (Dual Speaker e Single Speaker) com dramaturgia vocal. |
| **Painel CMS do Blog** | [`blog-panel.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/blog-panel.html) | Editor de artigos, controle de rascunhos, geração de PDF diagramado e publicação em lote. |

---

## 🧹 3. Tabela de Higienização: Telas Oficiais vs. Arquivos Legados Descartados

Para garantir que ninguém se perca no projeto, a tabela abaixo documenta a relação entre arquivos antigos e suas telas canônicas oficiais:

| Arquivo Legado / Antigo | Situação | Tela Canônica Oficial |
| :--- | :--- | :--- |
| `home.html` | Descartado (cópia antiga) | [`index.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/index.html) |
| `projeto2026.html` | Descartado (versão sem o design system) | [`projeto-aef.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/projeto-aef.html) |
| `magic-stories.html` | Descartado (substituído pelo Guia e Vitrine) | [`guia-magic-stories.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/guia-magic-stories.html) |
| `frases-prontas.html` | Descartado | [`repertorio.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/repertorio.html) |
| `personal-trainer.html` / `treinador.html` | Descartado (protótipos antigos do player) | [`player.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/player.html) |
| `portal/index.html` | Redirecionamento legado | [`portal.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/portal.html) |
| `admin.html` / `treino/admin.html` | Descartado | [`admin-cursos.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/admin-cursos.html) & [`admin-alunos.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/admin-alunos.html) |

---

## 🔗 4. Matriz de Conexão Fluida entre Telas

```
                     ┌───────────────────────────┐
                     │   1. DASHBOARD DO ALUNO   │
                     │       (portal.html)       │
                     └─────────────┬─────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                                         ▼
   ┌──────────────────────┐                  ┌──────────────────────┐
   │  2. VITRINE DO CURSO │                  │  4. TRAINING PLAYER  │
   │     (curso.html)     │◄────────────────►│     (player.html)    │
   └──────────┬───────────┘                  └──────────▲───────────┘
              │                                         │
              ▼                                         │
   ┌──────────────────────┐                             │
   │   3. SALA DE AULA    │─────────────────────────────┘
   │ (sala-de-aula.html)  │ (Botão 📌 Enviar para Training Player)
   └──────────────────────┘
```

1. **Dashboard (`portal.html`) ➔ Vitrine (`curso.html`):** O aluno escolhe o curso que deseja estudar.
2. **Vitrine (`curso.html`) ➔ Sala de Aula (`sala-de-aula.html`):** O aluno assiste à masterclass teórica e baixa o PDF oficial.
3. **Sala de Aula (`sala-de-aula.html`) ➔ Training Player (`player.html`):** O botão *📌 Enviar para Training Player* abre o player já na faixa e atividade exata da aula.
4. **Training Player (`player.html`) ➔ Sala de Aula (`sala-de-aula.html`):** O botão *⬅ Sala de Aula* no topo do Player permite retornar à lição a qualquer momento.

---
*Este documento é a referência canônica do ecossistema AgoraEuFalo. Qualquer nova interface ou módulo deve ser registrado aqui imediatamente.*
