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
- **Capa Customizada por Contexto Real (Zero Padrão Engessado):** Gerar uma arte de capa de álbum quadrada (1:1) baseada rigorosamente no **cenário, pessoas, tom e tema do diálogo real**.
- **Flexibilidade Visual Total:** Proibido forçar estilo "corporativo/firma de advocacia" para tudo. A estética deve respirar a energia do tópico e a idade/perfil do aluno (ex: *lifestyle jovem em cafeteria ensolarada*, *viagens e aeroportos*, *entrevistas tech*, *conversas casuais de rua*, *humor e cotidiano*, estilo capa de podcast contemporâneo do Spotify/Apple Music).
- **Otimização iOS/Android (Lock Screen):** Otimizar a imagem com `sips` para **512x512 pixels (<90 KB)** para garantir exibição imediata e sem falhas na tela bloqueada do iPhone (MediaSession API).
- **Armazenamento:** Salvar em `assets/images/cover-[aluno]-[slug].jpg` e apontar o campo `coverImage` no arquivo de dados do aluno (`treino/data/[aluno].js`).

---

## 5. Proibição de Switch Automático de Janela (Foco no Antigravity)
- **PROIBIÇÃO ABSOLUTA de executar comandos `open` que roubem o foco ou forcem a abertura do Chrome/Safari.**
- Manter o usuário focado no ambiente do Antigravity. Todas as atualizações, builds e testes devem ocorrer em segundo plano.
- Fornecer links markdown clicáveis no chat para que o usuário decida quando abrir.

---

## 6. Diretrizes Técnicas e Pedagógicas do TTS Studio & Player Interativo
Qualquer episódio criado ou modificado deve seguir rigorosamente estas 5 leis permanentes:

1. **Distinção Rígida de Formato (Solo vs Diálogo):**
   - **Apresentação / Keynote / Discurso (Solo):** Usar **APENAS 1 VOZ** (Single Speaker, ex: `Puck` ou `Charon`). Proibido inventar diálogos ou inserir o Professor Leo interrompendo a fala do aluno.
   - **Diálogo / Conversação Real (Dual Speaker):** Usar **EXATAMENTE 2 VOZES** distintas (ex: `Leo:Charon` + `Student:Puck` ou `Person A` + `Person B`).
2. **Padrão de Áudio Obrigatório (MP3 Puro 128kbps):**
   - Todo áudio sintetizado ou gravado DEVE ser codificado em **MP3 puro (LAME 128 kbps / 24kHz ou 44.1kHz)**.
   - **Proibido usar AAC/M4A sem tabela de frames**, pois quebra o seek no navegador e impede o loop de frases.
3. **Interatividades do Player (`treino/player.html`):**
   - **Seek Instantâneo:** Tocar em qualquer frase do texto DEVE mover o áudio para `sentence.start` e iniciar o play imediatamente.
   - **Loop Contínuo:** O botão `🔁 Loop` em cada card DEVE repetir a frase selecionada infinitamente entre `sentence.start` e `sentence.end`.
4. **Sincronização Obrigatória com Google Cloud Firestore:**
   - Ao publicar ou atualizar faixas, sincronizar imediatamente o documento em `students/{studentId}/tracks/{trackId}` no Firestore.
5. **Barra de Episódios Mobile-First:**
   - Manter as pílulas de seleção de faixas ultracompactas, com nomes limpos (sem prefixos repetitivos), scroll horizontal suave e zero artefatos vazios.

---

## 7. Diretriz de Criação de Posts a partir de Vídeos do YouTube (Vídeo Oficial vs. Inspiração Editorial com Capa IA)
Sempre que um link de vídeo do YouTube for fornecido para criação de novo artigo no Blog:
1. **Modo Vídeo Oficial do Professor Leo (Com Embed):**
   - Utilizar fachada interativa do player do YouTube (`playPostVideo`).
   - Usar a thumbnail em alta definição do YouTube (`maxresdefault.jpg` ou `hqdefault.jpg`).
   - `hasVideoEmbed: true`.
2. **Modo Inspiração Editorial / Vídeo de Terceiros (Sem Embed de Vídeo):**
   - O agente estuda o vídeo/transcrição de referência, extrai as sacadas didáticas e recria o artigo completo (+5.000 caracteres) sob a ótica e metodologia única do Professor Leonardo Leite.
   - **PROIBIDO embedar o player de vídeo de terceiros** no artigo.
   - **Geração Obrigatória de Capa Editorial de Arte com IA:** O agente gera uma ilustração ou arte editorial cinematográfica 16:9 personalizada sobre o tema do artigo usando `generate_image`, salva em `assets/images/cover-[slug].jpg` e a insere no topo do artigo.
   - `hasVideoEmbed: false`.

---

---

## 9. Arquitetura Macro de Armazenamento, Nuvem & Segurança (Zero Mídia Pesada no Git)
Para proteger o repositório contra inchaço (bloat), limites de banda do GitHub e pirataria de conteúdo proprietário/pago do ecossistema:
1. **Separação Rígida de Camadas:**
   - **Git / GitHub Pages:** Apenas código-fonte da aplicação (HTML, CSS, JS, regras e ícones leves <100KB).
   - **Google Cloud Storage & Firebase Storage (`agoraeufalo-3463a.firebasestorage.app`):** Armazenamento seguro de TODOS os vídeos de alta definição (`.mp4`), áudios gerados pelo TTS Studio, masterclasses, gravações de alunos e apostilas/PDFs de produtos pagos.
   - **Google Cloud Firestore:** Metadados, sessões de treino, permissões de acesso e leads.
2. **Upload e Distribuição de Vídeos e Áudios:**
   - Todo arquivo de vídeo e áudio do English Personal Training Player, cursos internos e áreas fechadas DEVE ser hospedado no **Firebase Storage / Google Cloud Storage**.
   - As interfaces (`tts-studio.html`, `admin-publico.html`, portal de membros) devem realizar o upload direto para o bucket da nuvem (`aefCloudSync.uploadMediaToStorage`), obtendo a URL segura da nuvem em vez de salvar arquivos pesados na árvore do Git.
3. **Proteção de Conteúdo Pago:**
   - Qualquer conteúdo exclusivo de alunos da Mentoria VIP, Magic Stories Club ou Cursos é protegido por regras de autenticação do Firebase e nunca exposto em repositório público.

---

## 10. Manutenção Obrigatória do Mapa de Interfaces (`INTERFACES.md`)
Sempre que qualquer nova interface, landing page, artigo de blog, player de aluno ou painel administrativo for criado, editado em sua URL ou removido do projeto:
- O agente DEVE atualizar imediatamente o arquivo **`INTERFACES.md`** na raiz do projeto com o nome da interface, URL de produção, link relativo local e uma breve descrição objetiva de sua função.

---

## 11. Fidelidade Rigorosa a Schemas e Proibição Absoluta de Condensação (Zero Dumb Down)
Sempre que um documento de especificação técnica, modelo de dados ou arquitetura TypeScript/Firestore for fornecido pelo usuário:
1. **Proibição Total de Achatamento (No Flattening):** O agente é expressamente PROIBIDO de condensar ou omitir camadas hierárquicas (ex: transformar uma arquitetura de 3 níveis `Cursos ➔ Módulos ➔ Aulas` em apenas 2 níveis `Cursos ➔ Aulas`). Toda hierarquia descrita deve existir integralmente nas interfaces de gestão e no banco de dados.
2. **Conformidade Campo a Campo (1:1):** Todos os campos especificados nas interfaces (`videoUrl`, `audioUrl`, `pdfUrl`, `artworkUrl`, `hasTrainingTrack`, `order`, `durationSeconds`, `goldenTip`, etc.) devem ser implementados sem omissões arbitrárias.
3. **Auditoria Pré-Execução:** Antes de gerar código sobre um schema complexo, o agente deve validar mentalmente o mapeamento completo dos níveis para garantir que nenhuma estrutura seja deixada de fora.

---

## 12. Política de Deploy: Automático por Padrão com Kill-Switch Obrigatório
- **Padrão (Default):** O agente realiza o build (`npm run build`) e o deploy (`git push origin main`) automaticamente ao concluir as entregas solicitadas, garantindo que o usuário não precise se preocupar em executar comandos manuais.
- **Trava de Segurança Obrigatória (Kill-Switch):** Se em QUALQUER momento o usuário incluir termos como *"no deploy"*, *"não faça deploy"*, *"não suba para produção"*, *"apenas local"* ou *"não dê push"*, o agente é terminantemente PROIBIDO de executar `git push`, mantendo todas as alterações estritamente no ambiente de desenvolvimento local até que uma autorização explícita seja dada.



