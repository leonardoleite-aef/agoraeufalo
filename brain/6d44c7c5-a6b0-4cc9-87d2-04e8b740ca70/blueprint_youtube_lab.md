# Blueprint Arquitetural: Ecossistema YouTube Lab (Content-First)

Este documento define a arquitetura técnica, fluxo de dados e interface do usuário para a integração do conteúdo do YouTube dentro da plataforma AgoraEuFalo, seguindo a abordagem Híbrida (Opção B).

## 1. Estrutura de Dados (Single Source of Truth)

Toda a gestão de conteúdo do YouTube Lab será centralizada no **Google Cloud Firestore**. A homepage e a página de conteúdo lerão desta fonte.

**Coleção:** `youtube_archive`
**Document ID:** `videoId` (ex: `puJ2EskHXj4`)

**Schema do Documento:**
```json
{
  "videoId": "puJ2EskHXj4",
  "title": "Como emendar as palavras em inglês (Connected Speech)",
  "description": "Nesta aula, desconstruímos o bloqueio sonoro de frases rápidas...",
  "thumbnailUrl": "https://i.ytimg.com/vi/puJ2EskHXj4/hqdefault.jpg",
  "publishedAt": "2026-10-01T12:00:00Z",
  "status": "active", // active | draft
  "featuredOnHome": true, // Controla se aparece na vitrine da index
  "materials": {
    "hasPdf": true,
    "pdfUrl": "https://storage.googleapis.com/.../aula_connected_speech.pdf",
    "hasAudio": true,
    "audioUrl": "https://storage.googleapis.com/.../aula_connected_speech.mp3"
  },
  "referenceClass": {
    "hasReference": true,
    "courseId": "magic-stories",
    "lessonId": "ms012",
    "buttonLabel": "Acessar Magic Story 012"
  }
}
```

---

## 2. Interface Administrativa (Criação e Edição)

Para garantir que a plataforma seja "100% dinâmica" onde importa, criaremos um painel dedicado no Admin.

**Rota do Painel:** `admin/youtube-lab-manager.html`

**Funcionalidades do Painel:**
1. **Adição Rápida:** Um campo simples: *"Cole a URL do YouTube"*. O painel extrai automaticamente o `videoId`, `title` e a `thumbnail`.
2. **Gestão de Materiais:** Upload de arquivos (PDF e MP3) diretamente para o Storage da plataforma (ou colagem de URLs externas).
3. **Vínculo com a Plataforma (Referência Cruzada):** Campos para selecionar se este vídeo está atrelado a alguma aula oficial da plataforma (seleção de Curso e Aula). Isso gera a ponte pedagógica.
4. **Controle de Vitrine:** Um *toggle switch* (chave seletora) chamado "Destacar na Homepage". Apenas vídeos com esta flag ativa serão renderizados na `index.html`.
5. **Listagem e Edição:** Uma tabela listando todos os vídeos do acervo, permitindo alterar a descrição ou inativar o vídeo instantaneamente.

---

## 3. O Ponto de Consumo: `youtube-lab.html`

Esta página se consolida como uma nova **Estação de Experiência** no ecossistema. Ela deve ser facilmente acessível através de pontos estratégicos de entrada:
1. **Público Externo (Visitantes):** Via vitrine na `index.html` (após criarem a conta gratuita).
2. **Alunos Ativos (Logados):** Via card de destaque no `portal.html` (Dashboard) e um link fixo no menu lateral da Área de Membros ("🎬 YouTube Archive").

Diferente de uma página de vendas direta, o foco visual aqui é na retenção, distribuição de arquivos e imersão.

**Arquitetura Visual da Página:**
*   **Header Padrão da Plataforma:** Focado na navegação do aluno.
*   **Stage Principal (16:9):** O player nativo do YouTube embarcado em alta resolução (sem distrações laterais).
*   **Content Meta:** Título e descrição do vídeo em tipografia confortável (Conforto 40+).
*   **Painel de Materiais (Downloads):** 
    *   Um bloco visual claro (`bg-amber-50`) exibindo o material de apoio da aula.
    *   Botões de alto contraste: `[ Baixar PDF da Aula ]` e `[ Baixar MP3 Isolado ]`.
*   **A Ponte de Referência (Cross-link):** Se o documento possuir o objeto `referenceClass`, um botão (ex: `[ Acessar Magic Story 012 ]`) será exibido.
    *   *A Lógica (O Pulo do Gato):* O botão simplesmente redireciona o aluno para a aula real da plataforma (ex: `sala-de-aula.html?curso=magic-stories&aula=ms012`). 
    *   A responsabilidade de barrar ou liberar o acesso fica 100% nas mãos do **access-engine** nativo da `sala-de-aula.html`. Se o usuário tem o produto, a aula abre. Se não tem, o *paywall* bloqueia e vende o curso, preservando a inteligência central do sistema sem duplicar regras.
*   **Sidebar / Up Next:** Uma coluna lateral sugerindo outros vídeos do acervo do YouTube Lab.

**Lógica de Roteamento:**
A página lerá a URL (ex: `youtube-lab.html?v=puJ2EskHXj4`), consultará o Firestore e renderizará o conteúdo do `videoId` correspondente. Se o ID não existir, exibe um state de "Vídeo não encontrado".

---

## 4. O Fluxo de Entrada Híbrido (Homepage)

A `index.html` (e atual `index-lab.html`) permanecerá estática em seu core de SEO, mas a seção do YouTube funcionará assim:

1. **Injeção Dinâmica:** Um script no final da página faz um fetch: `db.collection('youtube_archive').where('featuredOnHome', '==', true).limit(3)`.
2. **Renderização:** O Javascript substitui o container de loading pelos cards (Thumbnails + Título + Badges "PDF/Áudio").
3. **Proteção de Paywall (Lead Generation):**
   *   O sistema verifica localmente (`localStorage / aefPortalAuth`) se há um usuário válido.
   *   **Se LOGADO:** O link do card é puro: `href="youtube-lab.html?v={videoId}"`.
   *   **Se VISITANTE:** O link intercepta o clique, abre um Modal de Cadastro super rápido com a mensagem: *"Para acessar os PDFs e Áudios completos deste vídeo, crie seu acesso gratuito"*. Após o submit com sucesso, a sessão é criada e o redirect ocorre para `youtube-lab.html?v={videoId}`.

## Resumo Operacional
Ao finalizar esta arquitetura:
1. O SEO estrutural estará protegido.
2. Você controlará o que aparece na vitrine da Home com 1 clique no painel Admin.
3. A experiência do usuário será centrada no conteúdo (Netflix-style), com funil de conversão acontecendo naturalmente ao exigir login grátis para acessar os PDFs.
