# 🏛️ MANUAL DO USUÁRIO ADMIN & GUIA OPERACIONAL
**Painel Administrativo & Gestão do Ecossistema — AgoraEuFalo**
*Professor Leonardo Leite & Equipe*

---

## 🌟 Seja Muito Bem-Vindo ao Seu Centro de Comando!

Este manual foi escrito especialmente para você, **Professor Leo**, e para qualquer membro da sua equipe que for operar a plataforma no dia a dia.

Aqui você não precisa entender de programação nem de linhas de comando. Este guia foi desenhado em formato de **Jornadas Práticas Passo a Passo**, mostrando onde clicar, o que preencher e como utilizar cada um dos 10 superpoderes do seu painel administrativo em `admin.agoraeufalo.com.br`.

---

# 📑 ÍNDICE DE JORNADAS OPERACIONAIS

1. [O Hub Central do Admin (`admin.html`)](#1-o-hub-central-do-admin)
2. [Jornada 1: Criando e Gerenciando Cursos e Módulos (Course Studio)](#2-jornada-1-criando-e-gerenciando-cursos-e-módulos)
3. [Jornada 2: Cadastrando uma Aula Completa (A Matriz dos 5 Elementos)](#3-jornada-2-cadastrando-uma-aula-completa)
4. [Jornada 3: Criando Quizzes de Escuta & Compreensão (Quiz Studio)](#4-jornada-3-criando-quizzes-de-escuta--compreensão)
5. [Jornada 4: Sintetizando Áudios de Alta Fidelidade no Gemini TTS Studio](#5-jornada-4-sintetizando-áudios-no-gemini-tts-studio)
6. [Jornada 5: Gerando Apostilas Diagramadas em PDF (PDF Factory)](#6-jornada-5-gerando-apostilas-diagramadas-em-pdf)
7. [Jornada 6: Gestão de Alunos, Matrículas e Mentoria VIP (CRM Alunos)](#7-jornada-6-gestão-de-alunos-matrículas-e-mentoria-vip)
8. [Jornada 7: Gerenciando Vendas, Checkouts e Webhooks (Hotmart & Stripe)](#8-jornada-7-gerenciando-vendas-checkouts-e-webhooks)
9. [Jornada 8: Criando Banners & Blocos de Marketing (Block Engine)](#9-jornada-8-criando-banners--blocos-de-marketing)
10. [Jornada 9: Publicando Artigos no Blog e Otimizando SEO](#10-jornada-9-publicando-artigos-no-blog-e-otimizando-seo)
11. [Guia de Primeiros Socorros & Dicas de Uso no Celular](#11-guia-de-primeiros-socorros--dicas-de-uso-no-celular)

---

# 1. O Hub Central do Admin

Ao acessar **`admin.agoraeufalo.com.br`** (ou `admin.html`), você é recebido pelo seu painel central unificado com acesso direto aos 11 estúdios:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AGORAEUFALO ADMIN MASTER                        │
├────────────────────────────────────────────────────────────────────────┤
│ 1. 🎓 Course Studio      ➔ Criação e edição da grade de cursos e aulas │
│ 2. 🎯 Quiz Studio        ➔ Fábrica de testes de escuta e compreensão   │
│ 3. 👥 CRM de Alunos       ➔ Gestão de alunos, tiers e mentoria VIP     │
│ 4. 💳 Vendas & Checkouts  ➔ Links de checkout Hotmart e Stripe         │
│ 5. ⚡ Webhooks Monitor    ➔ Simulador e auditoria de compras em tempo  │
│ 6. 🎨 Marketing Engine    ➔ Banners, caixas didáticas e CTAs           │
│ 7. 📄 PDF Factory         ➔ Fábrica de apostilas A4 luxuosas           │
│ 8. 🎙️ Gemini TTS Studio   ➔ Gravação de áudios com vozes de IA         │
│ 9. ✍️ Blog CMS Panel      ➔ Redação e publicação de artigos longos     │
│ 10. 🔍 SEO Manager        ➔ Indexação no Google e meta tags OpenGraph  │
│ 11. 🚪 Ver Como Aluno     ➔ Atalho para entrar na sala como estudante  │
└────────────────────────────────────────────────────────────────────────┘
```

---

# 2. Jornada 1: Criando e Gerenciando Cursos e Módulos

**Painel:** `admin-cursos.html` (Acesso rápido: `/cursos`)

```mermaid
flowchart LR
    A[Selecione o Curso no Topo] --> B[Visualize a Árvore de Módulos]
    B --> C[Clique em '+ Novo Módulo']
    C --> D[Digite o Título e a Ordem]
    D --> E[Módulo Pronto para Receber Aulas!]
```

### 🚀 Passo a Passo:
1. **Selecionar Curso:** No menu superior do Course Studio, selecione o curso que deseja editar (ex: *Dates and Times*, *Magic Stories Legacy*, *Mentoria André*).
2. **Criar Novo Módulo:** Na coluna esquerda (Árvore de Conteúdo), clique no botão **`+ Novo Módulo`**.
3. **Preencher Ficha do Módulo:**
   - **Título do Módulo:** Ex: `CICLO 02 • As Horas em Inglês`.
   - **Ordem de Exibição:** `1`, `2`, `3`...
   - **Degustação Grátis (🌱 Free Tier):** Marque esta opção se este módulo for aberto para leads e visitantes gratuitos experimentarem o método.
4. **Salvar:** Clique em **`Salvar Alterações`**.

---

# 3. Jornada 2: Cadastrando uma Aula Completa

**Painel:** `admin-cursos.html` ➔ Selecione a aula no menu esquerdo.

Toda Masterclass no ecossistema AgoraEuFalo opera sobre a **Matriz dos 5 Elementos Canônicos**:

```
┌────────────────────────────────────────────────────────────────────────┐
│               A MATRIZ DOS 5 ELEMENTOS DA MASTERCLASS                  │
├────────────────────────────────────────────────────────────────────────┤
│ 🎬 1. Vídeo Masterclass (.MP4 ou YouTube)                              │
│ 📄 2. Apostila Diagramada (.PDF)                                       │
│ 🖼️ 3. Miniatura 16:9 & Capa 1:1 Oficial                                │
│ 💡 4. Sacada de Ouro do Professor Leo                                  │
│ 📝 5. Área Didática de Texto / HTML Formatado (processedContentHtml)   │
└────────────────────────────────────────────────────────────────────────┘
```

### 🚀 Passo a Passo de Preenchimento:
1. **Título da Aula:** Digite um título claro e direto (ex: `HORAS - Como Dizer as Horas em Inglês`).
2. **Duração:** Ex: `05:12`.
3. **Vídeo (.MP4 ou YouTube):** Cole a URL do vídeo armazenado no Firebase Storage ou o link direto do YouTube.
4. **Áudio (.MP3):** Cole a URL do áudio MP3 128k correspondente.
5. **🖼️ Kit Visual da Aula (Miniatura 16:9 + Capa 1:1) — Sem Mocks:**
   - **Geração Automática com IA (1 Clique):** Clique no botão **`[ 🎨 Gerar Kit Visual com IA ]`**. A IA (Google Imagen) lê o título da aula, o contexto do curso e a Sacada de Ouro para gerar simultaneamente:
     - **Miniatura 16:9:** Frame cinematográfico 35mm para o player de vídeo e listagem de aulas no acordeão.
     - **Capa 1:1 Quadrada:** Arte 3D Glassmorphism Apple EdTech para o Training Player e portal de áudio.
     - Ambas as imagens são automaticamente salvas no Google Cloud Storage e vinculadas à aula.
   - **Upload Manual de Foto Própria:** Caso queira usar imagem própria ou foto de gravação, passe o mouse sobre a caixa da imagem e clique em **`[ Subir Foto ]`** (16:9) ou **`[ Subir Capa ]`** (1:1).
   - **Edição Avançada de URLs:** Clique em *"Editar URLs de imagem manualmente ▾"* se preferir colar links diretos de CDN ou repositório.
   - **Exclusão Rápida:** Ao passar o mouse sobre o preview ativo, o ícone de lixeira vermelha permite remover o arquivo do Cloud Storage e desvincular da aula instantaneamente.
6. **Apostila PDF (`pdfUrl`):** Insira o caminho do PDF oficial (ex: `Material-PDF/DTC_1_1_Horas_em_Ingles.pdf`) ou faça upload direto.
7. **💡 Sacada de Ouro do Leo:** Digite o insight mestre que o aluno não pode esquecer (ex: *"Em inglês, você sempre diz o que já passou ou o que falta para a hora seguinte. Ex: a quarter past five."*).
8. **📝 Área Didática de Texto (`processedContentHtml`):** Digite ou cole o roteiro formatado, tabelas de sons e vocabulário com fundos claros (`bg-amber-50`).
9. **📌 Botão 'Enviar para o Player':** Marque a caixa `Vincular ao Training Player` e informe o ID da faixa auditiva.
10. **Publicar:** Clique no botão verde **`Salvar e Publicar Aula`**. A alteração entra no ar imediatamente!

---

# 4. Jornada 3: Criando Quizzes de Escuta & Compreensão (Quiz Studio)

**Painel:** `admin-quiz.html` (Acesso rápido: `/quiz`)

O **Quiz Studio** é o laboratório onde você cria, testa e gerencia testes interativos de áudio e leitura para treinar o reflexo auditivo e a compreensão imediata dos alunos.

```
┌────────────────────────────────────────────────────────────────────────┐
│               OS 3 ARQUÉTIPOS PEDAGÓGICOS DE QUIZZES                   │
├────────────────────────────────────────────────────────────────────────┤
│ 🎧 1. Compreensão de Diálogo (Áudio) ➔ Perguntas sobre conversas reais │
│ 🔢 2. Discriminação Sonora & Chunks  ➔ Foco na melodia e conectores    │
│ 📝 3. Quiz Tradicional (100% Texto)  ➔ Sentimento da estrutura/leitura │
└────────────────────────────────────────────────────────────────────────┘
```

### 🚀 Passo a Passo para Criar ou Editar um Quiz:

1. **Configuração da Chave Gemini TTS (1-Clique):**
   - No cabeçalho do Quiz Studio, clique no botão **`🔑 Chave Gemini`**.
   - Cole sua API Key do Google AI Studio e clique em **`Salvar Chave`**. O botão ficará verde com o selo *"Gemini Conectada"*.

2. **Selecionar ou Criar Novo Quiz:**
   - Para editar um quiz existente: selecione no menu suspenso (ex: *Grazi Wants to Change* ou *Reconhecendo Horas DTC*).
   - Para criar do zero: clique no botão **`+ Novo Quiz`** e defina o título, a categoria (ex: *Magic Stories*, *Dates & Times*, *English QuickStart*) e a nota de corte (ex: `70%`).

3. **Adicionar e Configurar Questões:**
   - Clique em **`+ Adicionar Questão`**.
   - Escolha o **Tipo da Questão**:
     - *🎧 Compreensão de Diálogo (Áudio)*
     - *🔢 Discriminação Sonora (Áudio)*
     - *🧩 Complete o Chunk (Áudio)*
     - *📝 Quiz Tradicional (100% Texto)*
   - Digite o **Enunciado da Pergunta** (ex: *"Ouça o áudio e responda: A que horas vai começar a reunião?"*).

4. **Sintetizar o Áudio da Questão (Gemini TTS):**
   - No campo **Roteiro / Fala em Inglês**, digite o diálogo ou frase.
   - *Suporte a Locutor Único (Single):* Digite a frase direta (ex: `The flight leaves at half past eight in the morning.`).
   - *Suporte a Diálogo (Dual Speaker):* Digite identificando os personagens por linha:
     ```text
     Rodrigo: Hello, my dear friend! What time is our meeting today?
     Liam: It is at a quarter to five in the afternoon!
     ```
   - Escolha a voz principal (*Aoede*, *Puck*, *Charon/Leo*, *Kore*, *Fenrir*) e clique em **`🎙️ Sintetizar com Gemini TTS`**.
   - Em 2 segundos, o áudio é sintetizado e pronto para audição com o botão **`Ouvir`**!
   - *(Opcional)* Se você já gravou um arquivo MP3, pode colar a URL direta no campo de áudio.

5. **Cadastrar Alternativas de Resposta:**
   - Preencha as alternativas (A, B, C, D).
   - Marque a bolinha (**Radio button**) da alternativa correta.

6. **Pedagogia do Leo (Feedback Imediato):**
   - **💡 Sacada de Ouro do Leo (Ao Acertar):** O elogio e a explicação prática do bloco sonoro (ex: *"Em inglês falado real, 'a quarter to five' significa 15 minutos que faltam para as 5, ou seja, 4h45 da tarde!"*).
   - **🎧 Dica de Escuta (Ao Errar):** Dica acolhedora para o aluno reescutar prestando atenção no som certo (ex: *"Preste atenção na palavra 'TO' no áudio."*).

7. **Simulador Interativo ao Vivo (Coluna Direita):**
   - À medida que você edita, o simulador à direita reproduz exatamente a experiência do aluno.
   - Clique em **`Ouvir Áudio da Questão`** para testar a reprodução do som.
   - Clique em uma alternativa e em **`Verificar Resposta`** para ver o feedback visual e a Sacada de Ouro.

8. **Salvar no Banco:**
   - Clique em **`💾 Salvar Quiz no Banco`**. O quiz é persistido e fica disponível imediatamente em todo o ecossistema.

---

### 🔗 Como Vincular um Quiz a uma Aula no Course Studio:

1. Abra o **Course Studio** (`admin-cursos.html` ou `/cursos`).
2. Selecione o curso, módulo e a aula que deseja transformar em quiz.
3. No topo da ficha da aula, na seção **Tipo de Conteúdo**, selecione a opção:
   - **`🎯 Quiz de Escuta & Compreensão`** (em vez de *🎬 Masterclass com Vídeo/Áudio*).
4. No campo **Banco de Quizzes Cadastrados**, escolha o quiz que você preparou no Quiz Studio.
5. Clique em **`Salvar e Publicar Aula`**.
6. *Resultado:* Na **Sala de Aula do Aluno** (`sala-de-aula.html`), essa aula será renderizada como uma arena interativa de quiz com áudio, barra de progresso, feedback em tempo real e cálculo de precisão auditiva!

---

# 5. Jornada 4: Sintetizando Áudios no Gemini TTS Studio

**Painel:** `tts-studio.html` (Acesso rápido: `/tts`)

Quando você não tiver tempo de gravar uma explicação ou diálogo em estúdio com microfone, utilize o **Gemini Multi-Speaker TTS** com fidelidade humana de 128 kbps.

### 🚀 Como Criar Áudios com 2 Vozes (Dual Speaker):
1. **Título do Áudio:** Digite o nome da faixa (ex: `DTC 01 • Grazi Diálogo de Horas`).
2. **Caixa de Roteiro:** Digite a conversa no formato de locutores:
   ```text
   Rodrigo: Hello, my dear friend! What time is the meeting?
   Liam: It is at a quarter to three in the afternoon!
   Rodrigo: Perfect, see you there!
   ```
3. **Seleção de Vozes:**
   - Locutor 1: `Rodrigo` (Voz: *Aoede*)
   - Locutor 2: `Liam` (Voz: *Puck*)
4. **Gerar Áudio:** Clique em **`Gerar Áudio com IA`**.
5. **Ouvir & Baixar:** Dê play para conferir a naturalidade e clique em **`Baixar MP3 (128 kbps)`** para vincular à sua aula.

---

# 6. Jornada 5: Gerando Apostilas Diagramadas em PDF

**Painel:** `admin-pdf-factory.html` (Acesso rápido: `/pdf-factory`)

A **PDF Factory** transforma o conteúdo de qualquer aula em uma apostila de luxo com tipografia relaxada de **15pt a 17pt** para conforto visual de adultos e idosos.

### 🚀 Passo a Passo:
1. **Importar Dados da Aula:** Selecione o curso e a aula desejada no seletor do topo.
2. **Preview Visual:** O canvas central carrega automaticamente:
   - Capa Deep Navy institucional.
   - Texto de Listen & Read sem poluição visual.
   - Matriz de Sound Chunks e Deep Dive sem jargões gramaticais.
   - Workbook com linhas pautadas para escrita manual.
   - Sacada de Ouro em destaque monumental âmbar.
3. **Ajuste Fino:** Se desejar editar qualquer parágrafo antes de gerar o PDF, faça o ajuste diretamente nas caixas de texto.
4. **Gerar PDF Oficial:** Clique no botão azul **`Compilar Apostila A4 em PDF`**. O arquivo é baixado instantaneamente no seu computador e salvo na pasta `Material-PDF/`.

---

# 7. Jornada 6: Gestão de Alunos, Matrículas e Mentoria VIP

**Painel:** `admin-alunos.html` (Acesso rápido: `/alunos`)

```mermaid
flowchart TD
    A[Busque o Aluno por Nome ou E-mail] --> B[Abra o Card do Aluno]
    B --> C{O que deseja fazer?}
    C -->|Alterar Nível| D[Trocar Tier: Free / Club / VIP]
    C -->|Matricular em Curso| E[Adicionar Curso na Lista de Acesso]
    C -->|Mentoria Individual| F[Vincular Sala VIP 1 a 1 com Google Meet]
    D & E & F --> G[Clique em 'Salvar Perfil']
```

### 💡 Gerenciando um Aluno de Mentoria VIP Individual:
1. Localize o aluno pelo campo de busca (ex: `André`).
2. Mude o Tier para **`👑 Mentoria VIP Individual`**.
3. No campo **Link do Google Meet**, cole o link da sala fixa de vocês (ex: `https://meet.google.com/kvu-upgw-osv`).
4. Clique em **`Salvar`**.
5. *Resultado:* Quando o André entrar no portal dele, ele verá o card dourado de Mentoria VIP com botão de entrada direta no Google Meet e seu curso personalizado!

---

# 8. Jornada 7: Gerenciando Vendas, Checkouts e Webhooks

**Painéis:** `admin-vendas.html` (`/vendas`) & `admin-webhooks.html` (`/webhooks`)

### 🛒 A Regra de Ouro dos Checkouts:
- **Hotmart (Primário):** Processa assinaturas em Reais (BRL), PIX, boleto e cartão em até 12x.
- **Stripe (Fallback Global):** Processa vendas internacionais em Dólar (USD) e Euro (EUR).

### ⚡ Como Testar se uma Venda Está Liberando o Acesso Automaticamente:
1. Acesse o **Simulador de Webhooks** em `admin-webhooks.html`.
2. No menu suspenso, escolha o evento: `Hotmart: Assinatura Aprovada (PURCHASE_APPROVED)`.
3. Digite um e-mail de teste (ex: `aluno.teste@gmail.com`) e o produto `AgoraEuFalo Club`.
4. Clique em **`Disparar Simulação de Webhook`**.
5. O sistema processará a notificação e liberará a matrícula do aluno no Firestore em menos de 1 segundo!

---

# 9. Jornada 8: Criando Banners & Blocos de Marketing

**Painel:** `admin-marketing.html` (Acesso rápido: `/marketing`)

O **Marketing Block Engine** permite criar caixas de destaque, avisos de matrículas e caixas de dúvidas do Leo para espalhar pelo site sem precisar mexer em código.

### 🚀 Como Criar um Bloco de Conversão:
1. Clique em **`+ Criar Novo Bloco`**.
2. Defina a Tag / Identificador (ex: `banner-matriculas-2026`).
3. Escolha o Estilo Visual:
   - *Deep Navy Nobre* (Fundo escuro e botões dourados).
   - *Calm Amber* (Fundo claro amadeirado de alto contraste).
4. Digite a chamada e o link do checkout da Hotmart.
5. Clique em **`Salvar Bloco`**. Ele já estará disponível para ser inserido em qualquer artigo do blog ou lição.

---

# 10. Jornada 9: Publicando Artigos no Blog e Otimizando SEO

**Painéis:** `blog-panel.html` (`/blog`) & `seo-manager.html` (`/seo`)

Toda publicação de artigo no blog segue a regra institucional de **+5.000 caracteres**, caixas didáticas claras e proteção de SEO.

### 🚀 As 4 Etapas de Publicação do Artigo:
1. **Redação no Blog Panel:** Digite o título, sinopse, capa 16:9 e cole o texto formatado no editor.
2. **Componentes Obrigatórios:** Certifique-se de incluir a caixa de dúvidas do Leo (`#duvidas-box`) e o card do Projeto 2026 (`#projeto-2026`).
3. **Gerar PDF do Post:** Clique em **`Gerar Versão em PDF para Download`**.
4. **Auditoria de SEO:** Abra o `seo-manager.html`, confira se a meta tag de compartilhamento no WhatsApp/Google está com a imagem correta e clique em **`Sincronizar Sitemap.xml`**.

---

# 11. Guia de Primeiros Socorros & Dicas de Uso no Celular

### ❓ "Fiz uma alteração em uma aula ou quiz mas o aluno diz que não atualizou no celular dele. O que fazer?"
1. **Cache do Navegador:** O navegador do aluno pode ter guardado a página antiga na memória. Peça para ele fechar a aba e reabrir, ou dar um toque no botão de recarregar (`Cmd + Shift + R` no computador ou puxar para baixo no celular).
2. **Validação no Admin:** Entre em `admin-cursos.html`, selecione a aula e confirme se o status está como **`Publicada`** (verde) e não **`Rascunho`** (cinza).

### 📱 Como Usar o Painel Admin no Celular (iPhone / Android):
- Todos os 11 painéis foram desenhados com tecnologia responsiva.
- No celular, você pode:
  - Criar e testar quizzes ouvindo os áudios diretamente no Safari/Chrome móvel.
  - Mudar o tier de um aluno no WhatsApp em 10 segundos pelo CRM.
  - Alterar o link do Google Meet antes da aula de Mentoria.
  - Ver as notificações de vendas do dia no painel de Vendas.

---

**Fim do Documento 2 • Manual Operacional do Professor Leo Leite**
