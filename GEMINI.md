# 🏛️ REGRAS PERMANENTES DO PROJETO AGORAEUFALO

Este arquivo define as diretrizes institucionais, padrões de design e o fluxo obrigatório de automação do site **AgoraEuFalo** (Professor Leonardo Leite).
Qualquer assistente de IA deve seguir estas regras rigorosamente em qualquer sessão presente ou futura.

---

## 1. Identidade, Persona e Tom de Voz do Professor Leo Leite
- **Quem é:** Professor Leonardo Leite — mais de 35 anos de sala de aula e vivência diária da língua inglesa.
- **Tom de voz:** Autêntico, direto, acolhedor, espirituoso, sagaz, sem jargões corporativos e sem atalhos mágicos de internet.
- **Princípio Pedagógico:** *"Inglês não é matéria de escola para passar em prova; inglês é experiência viva. Repetir a experiência da mesma história até a fala virar reflexo."*
- **Fidelidade 100% (Zero Alucinação):** Usar estritamente as histórias, personagens, vocabulário e exercícios presentes no roteiro/transcrição fornecido pelo usuário.

---

## 2. Padrão Visual e Regras de Design
- **Proibição Absoluta de Caixas Escuras em Conteúdo Didático:** 
  - Todos os blocos pedagógicos (Key Takeaways, Texto da História, Chunks Grid, Listen & Answer, Look & Retell, Pronunciation Practice e Sacada de Ouro) devem ter **fundos claros de alto contraste** (`bg-amber-50/80`, `bg-white`, `border-2 border-amber-200`, `text-slate-900`, `text-amber-950`).
- **Navegação (Header):**
  - Links oficiais permitidos no menu superior: *Início*, *Blog*, *Guia Definitivo*, *Projeto AEF*, *Contato* e o botão *Garantir Vaga 2026*.
  - **NÃO adicionar "Magic Stories" no menu de navegação.**
- **Player de Vídeo do YouTube:**
  - Utilizar fachada interativa com thumbnail em alta definição e reprodução no clique (`playPostVideo`).
  - Extrair o ID do YouTube com **sensibilidade exata a maiúsculas/minúsculas** (atenção a `O` maiúsculo vs. `0` zero).
- **Componentes Oficiais Obrigatórios em Todo Artigo:**
  - `#duvidas-box`: Avatar do Professor Leo com selo online verde, badge *"💬 Resposta Direta do Leo"*, formulário via `formsubmit.co/ajax/selexenglish@gmail.com` e botão direto para WhatsApp.
  - `#projeto-2026`: Card institucional azul-marinho com selo oficial, lista de benefícios e botão de matrícula para `projeto-aef.html` + WhatsApp.
  - Barra Social com botão de compartilhamento no WhatsApp e os 3 cards oficiais (YouTube, Instagram, Substack).

---

## 3. As 6 Tarefas Obrigatórias ao Receber Ordem de Artigo do Blog
Sempre que o usuário enviar um prompt baseado no **Template Mestre do Google Docs**, execute o pipeline completo abaixo em lote único:

1. **Artigo HTML Completo (+5.000 caracteres):**
   - Criar o arquivo em `blog/[slug].html` com todos os blocos pedagógicos, SEO Schema JSON-LD, OpenGraph e interatividades.
2. **Sincronização no Feed Principal do Blog:**
   - Adicionar o novo post no topo do array `defaultPublishedSeed` em `blog/index.html`.
3. **Sincronização na Biblioteca do Blog Panel:**
   - Adicionar o objeto do post com o **texto integral completo (`bodyHtml`)**, takeaways, vídeo e golden tip no array `INITIAL_LIBRARY` em `blog-panel.html`.
4. **Geração da Apostila em PDF Diagramada:**
   - Compilar o PDF com padrão editorial A4, logo AgoraEuFalo, caixas claras de chunks e CTA final do Projeto 2026.
    - **Controle Rigoroso de Diagramação e Tipografia:**
      - **Fontes Amplas e Confortáveis:** Manter corpo de texto em `10.5pt`, entrelinha `1.6`, títulos em `20pt`/`13.5pt` e caixas em `9.5pt`–`10pt`. Nunca encolher a fonte para caber em menos páginas; permitir que o conteúdo se espalhe naturalmente pelas páginas necessárias.
      - **Proteção Anti-Órfão:** Aplicar `break-after: avoid;` / `page-break-after: avoid;` em todos os cabeçalhos (`h1, h2, h3, h4`).
      - **Proteção Anti-Corte:** Aplicar `break-inside: avoid;` / `page-break-inside: avoid;` em caixas de história, chunks, exercícios e CTA do Projeto 2026.
      - Configurar numeração de página no rodapé (`Página X de Y`) e margens elegantes (15mm).
   - Salvar na pasta `Material-PDF/[slug].pdf`.
5. **Registro de SEO & Sitemap:**
   - Adicionar a nova URL no arquivo `sitemap.xml`.
6. **Build & Deploy Git:**
   - Executar `npm run build` e enviar as alterações para a branch `main` (`git push origin main`).

---

## 4. Diretriz de Criação de Capas para Episódios de Treino dos Alunos
Sempre que um novo áudio/episódio for adicionado para qualquer aluno da Mentoria VIP:
- **Capa Customizada por Contexto:** Gerar uma arte de capa de álbum quadrada (1:1) baseada rigorosamente no **título**, **texto/diálogo** e **contexto pedagógico** daquela sessão específica.
- **Identidade Visual:** Fundo azul-marinho profundo (`#0A192F`), detalhes dourados, estética executiva *AgoraEuFalo Masterclass Audio Album*.
- **Otimização iOS/Android (Lock Screen):** Otimizar a imagem com `sips` para **512x512 pixels (<90 KB)** para garantir exibição imediata e sem falhas na tela bloqueada do iPhone (MediaSession API).
- **Armazenamento:** Salvar em `assets/images/cover-[aluno]-[slug].jpg` e apontar o campo `coverImage` no arquivo de dados do aluno (`treino/data/[aluno].js`).

