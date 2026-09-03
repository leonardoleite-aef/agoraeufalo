# 🏛️ REGRAS PERMANENTES DO PROJETO AGORAEUFALO
**Ecossistema Digital & Plataforma SaaS EdTech — Professor Leonardo Leite**

Este arquivo define as diretrizes institucionais, padrões de design, matriz pedagógica e o fluxo automatizado de produção de conteúdo e software do ecossistema **AgoraEuFalo**.
Qualquer assistente ou agente de IA deve seguir estas regras rigorosamente em qualquer sessão presente ou futura.

---

## 1. Identidade, Persona e Tom de Voz do Professor Leo Leite
- **Quem é:** Professor Leonardo Leite — mais de 35 anos de sala de aula e vivência diária da língua inglesa.
- **Tom de voz:** Autêntico, direto, acolhedor, espirituoso, sagaz, sem jargões corporativos e sem atalhos mágicos de internet.
- **Princípio Pedagógico:** *"Inglês não é matéria de escola para passar em prova; inglês é experiência viva. Repetir a experiência da mesma história até a fala virar reflexo."*
- **Fidelidade 100% (Zero Alucinação):** Usar estritamente as histórias, personagens, vocabulário, diálogos e exercícios presentes no roteiro/transcrição fornecido pelo usuário.

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

## 3. As 6 Atividades Canônicas do Método Magic Stories (Manifesto Pedagógico & Regras Mecânicas)
Todas as aulas e treinos do ecossistema seguem rigorosamente a estrutura pedagógica e o design de cards padronizado em todas as abas:

1. **`1. Listen & Read (LR)` (Entrada & Imersão Auditiva Real):**
   - **O Propósito Canônico:** *"Todo mundo pensa que Escutar e Ler é para checar se entendeu. Grande ilusão! Ao ler e ouvir ao mesmo tempo, o cérebro foca na escrita e desliga os ouvidos. Listen & Read serve para você mudar o foco: observar com extrema atenção muito mais PELOS OUVIDOS do que pelos olhos, sentindo a diferença brutal entre a grafia e o som real. Escutar e ler uma única vez não funciona: a escuta precisa virar reflexo!"*
   - Cada card contém uma frase/turno completo. Em diálogos, indica o locutor (`speaker`).
   - **Sem tradução na tela.** Mecânica: Áudio contínuo, play/pause com 1 toque no card e auto-scroll suave.
2. **`2. Vocabulary Session (VOC)` (Matriz de Chunks & Ativação de Vocabulário):**
   - **O Propósito Canônico:** *"Aqui é o momento de ter 100% de certeza do contexto da história. Mas zero neurose: você NÃO vai decorar nada aqui agora. O cérebro armazena no vocabulário passivo. Vocabulário ativo é aquele que sai no piloto automático, e a ativação real só acontece no treino prático. Garanta a compreensão da história para seguir focado 100% no inglês."*
   - O mesmo texto de Listen & Read, mas **COM Tradução em Português Falado Brasileiro Real (`spokenTranslation`)** visível no card.
   - Matriz de Chunks Sonoros com **botões individuais de áudio (`▶`)** para fixar a melodia isolada.
3. **`3. Listen & Answer (LA)` (Reflexo & Velocidade de Resposta no Diálogo):**
   - **O Propósito Canônico:** *"Primeira arena de escuta e fala ativa. Zero obrigação de falar imediatamente: se quiser escutar calado nas primeiras vezes, tudo bem! O objetivo não é provar que você decorou a história, mas treinar velocidade e automação de diálogo em bate-pronto. Responda curto, do jeito que souber ou diga 'I don't know' / 'I don't understand'. O que vale é o reflexo imediato!"*
   - **Regra Estrita de Magic Stories (Zero Respostas Reveladas):** **NÃO MOSTRAR AS RESPOSTAS!** Tanto na apostila/PDF de treino (Páginas 5 e 6) quanto na Sala de Aula, exibir apenas a **Pergunta** com linhas pautadas/espaço em branco para resposta manual ou reflexo oral. A resposta pronta é proibida para eliminar muletas visuais.
   - Cards intercalados no Player: Pergunta no áudio com micro-pausa de 2 a 4 segundos antes da confirmação.
4. **`4. Look & Retell (LRT)` + AI Speech Coach (Produção Própria & Speaking Ativo):**
   - **O Propósito Canônico:** *"Mesma filosofia: sem forçar e sem prova de memória. É o treino para falar do que você já sabe com o inglês que você tem HOJE, no Agora. A cada repetição diária seu reconto se torna mais rico e espontâneo."*
   - **Zero áudio prévio e zero auto-scroll.** 100% Speaking autônomo. Microfone radiante grava o reconto e o `AI Speech Coach` avalia a compreensibilidade (*O Teste do Gringo* de 0 a 10).
   - **Fidelidade 100% às Perguntas de LA (Zero Perguntas Inventadas):** As perguntas-guia visuais de Look & Retell **SÃO EXATAMENTE AS MESMAS PERGUNTAS DE LISTEN & ANSWER (LA)**. Proibição absoluta de inventar perguntas acadêmicas ou artificiais como *"Describe..."*, *"Tell me about..."* ou expressões que ninguém usa na vida real como *"What is her profession?"*. Usar exclusivamente o inglês falado natural do dia a dia (*"What does she do for a living?"* / *"What does she do?"*).
5. **`5. Listen & Ask (LASK)` (Desafio de Formulação Rápida de Perguntas):**
   - **O Propósito Canônico:** *"Quem lidera e mantém conversas vivas em inglês é quem sabe perguntar com rapidez e ritmo. Ao ouvir uma frase afirmativa/negativa, o cérebro é provocado a formular a pergunta correspondente de imediato. Se travar, ouça a gravação e aplique na próxima repetição!"*
   - **Regra Estrita de Magic Stories (Zero Perguntas Reveladas):** **NÃO MOSTRAR AS PERGUNTAS!** Tanto na apostila/PDF (Página 7) quanto na Sala de Aula, exibir apenas a **Frase Estímulo (Negação/Afirmação)** e a linha para formulação da pergunta. A pergunta pronta nunca é revelada previamente para forçar o cérebro a formular a pergunta no reflexo.
6. **`6. Pronunciation & Connected Speech (PRO)` (Musicalidade, Boca & Ritmo Mecânico):**
   - **O Propósito Canônico:** *"Treino 100% mecânico de moldar a musculatura da boca, entonação e ligação entre as palavras (Connected Speech). Ouvir e repetir com cadência até a boca acostumar a falar conectado e sem tropeçar."*
   - **Regra Estrita de Magic Stories (Texto Completo de LR + Linking Sounds):** A Página 8 do PDF e a Sala de Aula devem conter **O TEXTO COMPLETO DO LISTEN & READ (LR)** com as marcações visuais de conexões consoante-vogal (*Linking Sounds*) em destaque azul cobalto, chave fonética das reduções principais, treino de repetição em loop contínuo (`🔂`) e a **Sacada de Ouro do Professor Leo** em destaque monumental âmbar.
   - *Nota de Escopo:* As regras de ocultação de respostas em LA, ocultação de perguntas em LASK e texto integral com linking em PRO aplicam-se **estritamente às Magic Stories**.

---

## 4. O Squad Unificado de Agentes de IA
A criação e manutenção de conteúdo são executadas por um squad especializado de 7 subagentes:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                         SQUAD DE AGENTES AGORAEUFALO                                    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. Leo-Content-Writer: Redação de histórias, dramaturgia vocal (injeção de pausas      │
│    dramáticas, risadas, suspiros e tags de atuação Gemini TTS) e roteiros das 6 etapas │
│ 2. Leo-Vocab-Session-Architect: Dissecação de vocabulário, Tradução Falada Real,       │
│    matriz de Sound Chunks acústicos, curiosidades gramaticais sem jargões ("O         │
│    Sentimento da Estrutura") e exemplos de aplicação na vida real.                      │
│ 3. Visual-Artwork-Artist: Capas 16:9 (Blog/LMS) e 1:1 512x512 <90KB (Player).          │
│ 4. Player-Audio-Engine: Síntese Gemini TTS (Dual/Single), MP3 128k e timestamps reais. │
│ 5. Editorial-PDF-Engine: Compilação de Livros Impressos & Apostilas Interativas A4    │
│    (ReportLab) no Sistema Canônico dos 3 Arquétipos em 8 Páginas (Fontes 15 a 17pt):   │
│    - P1: Arquétipo 1 (Module Divider / Capa Deep Navy, 01/02 Watermark, Arte & Sinopse)│
│    - P2: Arquétipo 2 (Content & Insights: Listen & Read com fonte confortável 15-17pt) │
│    - P3 & P4: Arquétipo 2 (Vocabulary Session: Tradução Real, Chunks & Curiosidades)   │
│    - P5 a P8: Arquétipo 3 (Practice Workbook: LA sem respostas, LRT, LASK sem          │
│      perguntas, PRO com texto completo de LR e Sacada de Ouro do Leo)                  │
│ 6. Look-Retell-AI-Coach: Avaliação de áudio 0-10, diagnóstico de engasgos e feedback. │
│ 7. Tier-Platform-Distributor: Distribuição Firestore (Free, Cursos, VIP) e Git Deploy. │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.1. O Pipeline Canônico de Produção de Magic Stories & Livros Impressos (End-to-End):
Sempre que um novo conteúdo, aula de curso ou Magic Story for criado a partir de um vídeo do YouTube, áudio MP3 ou texto base, o squad executa este fluxo industrial obrigatório:

- **Etapa A (Curadoria de Densidade & Corte):** Extrair a transcrição completa e selecionar o trecho de maior potência comunicativa e narrativa.
- **Etapa B (Redação da Magic Story & Áudio LR):** Escrever a história narrada ou diálogo vivo com dramaturgia vocal de modo que **CADA FRASE SEJA 100% UTILIZÁVEL** para as etapas de LA, LRT e LASK. Respeitar rigorosamente a duração: **mínimo de 1min10s (01:10) e máximo de 2min00s (02:00)** ➔ Síntese Gemini TTS (Dual/Single) MP3 128k ➔ Gera faixa de **`1. Listen & Read (LR)`** com timestamps milimétricos e **Página 2 do PDF** com fonte confortável de **15 a 17pt**.
- **Etapa C (Explainer Didático & Vocabulary Session com o Leo-Vocab-Session-Architect):** Criar texto e áudio explicativo no estilo Google NotebookLM / Podcasting do Leo ➔ Tradução Falada Real + Matriz de Chunks Sonoros + Curiosidades Gramaticais sem Jargões ("O Sentimento da Estrutura") + Exemplos de Aplicação no Cotidiano ➔ Gera as **Páginas 3 e 4 do PDF (VOC)** e 4 cards em cascata na Sala de Aula e aba VOC do Player.
- **Etapa D (Listen & Answer - Cobertura Literal 100% da História):** Criar **quantas perguntas forem necessárias para cobrir literalmente toda a história**. Esta dissecação exaustiva define a quantidade total de perguntas e respostas trabalhadas no módulo. **Proibição Absoluta de Limite Artificial e de Spoilers:** Proibido limitar perguntas e proibido mostrar as respostas no PDF/tela ➔ Síntese Gemini TTS com micro-pausas de 2 a 4 segundos ➔ Gera as **Páginas 5 e 6 do PDF (LA/LRT)** com linhas pautadas para escrita manual.
- **Etapa E (Look & Retell + AI Speech Coach):** Organizar as perguntas-guia visuais (**que são obrigatoriamente as mesmas perguntas trabalhadas no Listen & Answer**) e espaço de palavras-chave (*Keywords*) ➔ Configurar o prompt de inteligibilidade comunicativa (*O Teste do Gringo 0-10*) ➔ Palco de gravação no Player.
- **Etapa F (Listen & Ask - Desafio de Perguntas sem Spoilers):** Criar frases de estímulo (afirmativas/negativas) com espaço pautado para o aluno formular a pergunta no reflexo (**sem mostrar a pergunta pronta impressa**) ➔ Síntese Gemini TTS ➔ Gera a **Página 7 do PDF (LASK)**.
- **Etapa G (Pronunciation & Connected Speech com Texto Integral):** Inserir **o texto integral da história (LR)** com as marcações visuais de conexões consoante-vogal (*Linking Sounds*), chave fonética e ações em cadeia usando o áudio da história (LR) com cortes por sentença, pausas automáticas e botão de loop (`🔂`) ➔ Redigir a Sacada de Ouro do Leo ➔ Gera a **Página 8 do PDF (PRO)**.
- **Etapa H (Compilação do Livro Impresso no Padrão dos 3 Arquétipos — SEM LIMITE ARTIFICIAL DE PÁGINAS):**
  * **REGRA ABSOLUTA DE EXTENSÃO:** **NÃO EXISTE LIMITE DE NÚMERO DE PÁGINAS.** Tudo o que tiver de ser dito, escrito, trabalhado e mostrado DEVE ir para o PDF sem qualquer preocupação com número fixo de páginas. Se o módulo exigir 30 páginas, serão 30 páginas; se exigir 4 páginas completas, so be it! O critério mandatório é: **TODAS AS PÁGINAS DEVEM ESTAR COM MAIS DE 70% DE PREENCHIMENTO VISUAL/PEDAGÓGICO ÚTIL** (sem páginas vazias, órfãs ou comprimidas artificialmente).
  * Compilar o PDF Oficial em `Material-PDF/[codigo]_[slug]_Apostila_Oficial.pdf` (ReportLab) estruturado nos 3 Arquétipos com fontes confortáveis e generosas:
    - **Capa (Deep Navy / Arquétipo 1):** Título generoso, ficha técnica, sinopse contextual e arte oficial.
    - **Listen & Read (Arquétipo 2):** Texto da História com fonte grande e confortável (15 a 17pt, leading relaxado), tradução / quick tips e boxes explicativos.
    - **Vocabulary Session (Arquétipo 2):** Tradução Falada Real, Matriz de Chunks, Deep Dive de estruturas sem jargões e exemplos de vida real ocupando quantas páginas forem necessárias com densidade >70%.
    - **Practice Workbook (Arquétipo 3):** Listen & Answer completo com espaço pautado (sem respostas impressas), Look & Retell + AI Coach, Listen & Ask completo com espaço pautado (sem perguntas impressas), Pronunciation Practice com texto integral/linking e a Sacada de Ouro monumental do Leo.
  * Suporte oficial sempre via `selexenglish@gmail.com`.

---

## 5. As 6 Tarefas Obrigatórias ao Publicar Artigo no Blog
Sempre que um novo artigo for solicitado, execute o pipeline em lote único:

1. **Artigo HTML Completo (+5.000 caracteres):** Criar em `blog/[slug].html` com caixas didáticas claras, SEO Schema JSON-LD, OpenGraph, `#duvidas-box` e `#projeto-2026`.
2. **Sincronização no Feed Principal:** Inserir no topo de `defaultPublishedSeed` em `blog/index.html`.
3. **Sincronização na Biblioteca do CMS:** Inserir objeto completo com `bodyHtml` em `INITIAL_LIBRARY` em `blog-panel.html`.
4. **Geração da Apostila em PDF Diagramada:** Compilar PDF A4 em `Material-PDF/[slug].pdf` (ReportLab) com proteção anti-órfão (`break-after: avoid`) e anti-corte (`break-inside: avoid`).
5. **Registro de SEO & Sitemap:** Adicionar a URL canônica em `sitemap.xml`.
6. **Build & Deploy Git:** Executar `npm run build` e enviar para a branch `main` (`git push origin main`).

---

## 6. A Fábrica de Cursos & A Matriz Canônica dos 5 Elementos da Masterclass
A área de membros opera com conexão bidirecional perfeita entre teoria e treino prático. Toda aula no Course Studio e na Sala de Aula é estruturada rigorosamente sobre **5 Elementos Canônicos**:

1. **🎬 Elemento 1 — Vídeo Masterclass (.MP4):** Exposição audiovisual da aula com thumbnail 16:9 em alta resolução.
2. **📄 Elemento 2 — Apostila Oficial Diagramada (.PDF):** Material A4 para download imediato do aluno.
3. **🖼️ Elemento 3 — Kit Visual de Capas:** Capa quadrada 1:1 (`artworkUrl`) e miniatura 16:9 (`thumbnailUrl`).
4. **💡 Elemento 4 — Sacada de Ouro do Professor Leo:** O insight transformador de mais de 35 anos de sala de aula em destaque âmbar.
5. **📝 Elemento 5 — Área Didática de Texto / HTML Editável (`processedContentHtml`):** Espaço nobre editável diretamente no Course Studio e renderizado com tipografia de luxo logo abaixo do vídeo na Sala de Aula (`sala-de-aula.html`). Utilizado para notas de aula, tabelas de vocabulário, roteiro formatado, avisos e blocos didáticos claros (`bg-amber-50`).

### 6.1. Integração Fluida (Sala de Aula ⇄ Player ⇄ Vitrine de Cursos):
1. **Na Sala de Aula (`sala-de-aula.html`):** O aluno assiste à masterclass, estuda o texto didático (Elemento 5), lê a Sacada de Ouro e baixa a apostila em PDF.
2. **Na Vitrine do Curso (`curso.html`):** O aluno visualiza a grade completa de módulos e o acordeão de aulas com as miniaturas 16:9 oficiais de cada aula (`thumbnailUrl`), duração exata e status de conclusão.
3. **O Botão de Prática Ativa (*📌 Enviar para Training Player*):** Abre com 1 toque o Player na faixa exata da aula para os exercícios de *Listen & Read*, *Listen & Answer*, *Look & Retell* e *Pronúncia*.
4. **Botão de Retorno no Player:** Permite voltar diretamente para a lição ativa da Sala de Aula.
5. **Conformidade de Schema (1:1):** Cada aula no Firestore (`courses/{courseId}/modules/{moduleId}/lessons/{lessonId}`) e nas matrizes locais contém os campos `hasTrainingTrack: true`, `trainingTrackId`, `thumbnailUrl`, `processedContentHtml` e `goldenTip`. **Proibição de Thumbnails Mockados:** É terminantemente obrigatório vincular as miniaturas 16:9 geradas de cada aula na esteira de produção.

---

## 7. Arquitetura de Tiers no Google Cloud Firestore (Single Source of Truth)
O banco de dados Firestore é a **fonte única da verdade**, eliminando bifurcações ou arquivos estáticos legados:

- **Tier 1: Aluno Free 🌱 (Público / Lead):**
  - Acesso à aba **💡 Sugestões do Leo** (`suggestions/{trackId}`) e aulas abertas dos cursos.
  - Degustação de **1 treino próprio do YouTube** em **🧪 Minhas Coisas** (`users/{uid}/custom_tracks/`).
- **Tier 2: Membros de Cursos / Club 🎓:**
  - Acesso às **💡 Sugestões do Leo**, todos os treinos das aulas matriculadas em **🎓 Meus Cursos** (`users/{uid}/course_tracks/`) e treinos ilimitados em **🧪 Minhas Coisas**.
- **Tier 3: Mentoria VIP Individual 👑:**
  - Acesso total e irrestrito + aba exclusiva **👑 Mentoria VIP** (`students/{menteeSlug}/tracks/{trackId}`) com prescrições e gravações individuais 1 a 1 do Professor Leo.

---

## 8. Diretrizes de Áudio (Gemini TTS & MP3 128kbps Puro)
1. **Padrão Dual Speaker:** Diálogos e conversas reais usam **EXATAMENTE 2 VOZES** distintas (ex: `Rodrigo:Aoede` + `Liam:Puck` ou `Leo:Charon` + `Student:Puck`).
2. **Padrão Single Speaker:** Monólogos, chunks e explicações usam **APENAS 1 VOZ**.
3. **Codificação Obrigatória:** Todo áudio é exportado em **MP3 puro (LAME 128 kbps / 24kHz ou 44.1kHz)**. Proibido AAC sem tabela de frames para garantir o seek milissegundo a milissegundo.
4. **Interatividade no Player:**
   - **Play/Pause por Toque:** 1º toque move para `sentence.start` e inicia o play; 2º toque no mesmo card pausa.
   - **Repetição Contínua (`🔂`):** Trava a frase em repetição contínua entre `start` e `end`.
   - **Tradução Falada Real:** A linha secundária exibe exclusivamente o Português Falado Brasileiro Real (`spokenTranslation`), sendo proibido exibir notas técnicas (`notes`) abaixo da frase.

---

## 9. Diretriz de Criação de Capas e Mídias Visuais
- **Unicidade de Imagem por Módulo & Consulta Prévia Obrigatória:**
  - Cada Módulo / Magic Story deve ter uma imagem **completamente diferente e única**, 100% contextualizada com o enredo, personagens e tom da história.
  - **Consulta Prévia Obrigatória:** No processo de criação de qualquer novo módulo, o agente deve **SEMPRE perguntar ao Professor Leo se ele possui uma foto/imagem própria ou uma imagem de sua preferência** antes de gerar ou selecionar a arte.
- **Capa de Artigo de Blog (16:9):** Arte cinematográfica e editorial de alto impacto gerada via `generate_image`, salva em `assets/images/cover-[slug].jpg`.
- **Capa de Treino do Aluno / Player (1:1):** Arte quadrada baseada no contexto real do diálogo. **Otimizada obrigatoriamente com `sips` para 512x512 pixels (<90 KB)** para suporte imediato à tela de bloqueio do iOS/Android via MediaSession API. Salva em `assets/images/cover-[aluno/tema]-[slug].jpg`.
- **Kit de Capas 16:9 das Vídeo-Aulas (Cinema LMS Poster Frame):** Para cada Módulo / Magic Story, gerar o kit oficial de 6 capas 16:9 (1920x1080 <180KB) correspondentes às 6 atividades com a diferenciação cromática oficial:
  1. `LR`: Azul Cobalto Real (`#1A56DB`) 🎧
  2. `VOC`: Verde Esmeralda (`#047857`) 📖
  3. `LA`: Ocre Dourado / Âmbar (`#D97706`) ⚡
  4. `LRT`: Coral / Rubi Quente (`#E11D48`) 🎙️
  5. `LASK`: Índigo / Violeta (`#6366F1`) ❓
  6. `PRO`: Teal / Ciano Elétrico (`#0D9488`) 🎵
  Salvas em `assets/images/thumbs/[modulo_id]/thumb_[modulo_id]_[atividade].jpg`.

---

## 10. Arquitetura Macro de Armazenamento & Nuvem (Zero Mídia Pesada no Git)
1. **Separação Rígida de Camadas:**
   - **Git / GitHub Pages:** Apenas código-fonte da aplicação (HTML, CSS, JS, regras e ícones leves <100KB).
   - **Google Cloud Storage & Firebase Storage (`agoraeufalo-3463a.firebasestorage.app`):** Armazenamento de TODOS os vídeos (`.mp4`), áudios gerados pelo TTS Studio (`.mp3`), masterclasses e apostilas em PDF.
   - **Google Cloud Firestore:** Metadados, sessões de treino, permissões de acesso e CRM de alunos.

---

## 11. Manutenção Obrigatória do Mapa de Interfaces (`INTERFACES.md`)
Sempre que qualquer nova interface, página, artigo de blog, player ou módulo administrativo for criado, editado ou removido, o arquivo **`INTERFACES.md`** deve ser atualizado imediatamente.

---

## 12. Fidelidade Rigorosa a Schemas e Proibição de Condensação (Zero Dumb Down)
- Proibição absoluta de achatamento (*no flattening*): A hierarquia `Cursos ➔ Módulos ➔ Aulas` e `Alunos ➔ Tracks ➔ Sentences` deve existir integralmente no Firestore e nas interfaces.
- Todos os campos especificados (`videoUrl`, `audioUrl`, `pdfUrl`, `artworkUrl`, `hasTrainingTrack`, `spokenTranslation`, `goldenTip`, etc.) devem ser implementados sem omissões.

---

## 13. Proibição de Switch Automático de Janela (Foco no Antigravity)
- **PROIBIÇÃO ABSOLUTA de executar comandos `open` que roubem o foco ou forcem a abertura do navegador.**
- Todo build, teste e verificação ocorre em segundo plano. Links markdown clicáveis são fornecidos para o usuário abrir quando desejar.

---

## 14. Política de Deploy: Proibição de Deploy Espontâneo & Relatório Prévio Obrigatório
- **ZERO DEPLOYS ESPONTÂNEOS:** O agente está TERMINANTEMENTE PROIBIDO de executar `git push` ou deploy em produção sem antes:
  1. Apresentar relatório completo detalhando quais arquivos foram modificados, quais arquivos foram expurgados/deletados e a comprovação de ausência de dados mockados;
  2. Receber a aprovação expressa e inequívoca do usuário para o envio.
- **Limpeza Prévia Rigorosa (Zero Lixo de Teste):** Antes de qualquer proposta de deploy, todo e qualquer mock, arquivo de teste temporário ou dado estático hardcoded deve ser 100% expurgado, operando com a fonte real do Firestore e `registry.js`.

---

### 15. Proibição Absoluta de Dados Fake Hardcoded (Zero Mockup em Produção)
- É terminantemente proibido deixar frases, links ou cards hardcoded nas páginas finais (ex: "bilingual sentences" estáticos ou links fictícios).
- Toda a interface deve ser alimentada dinamicamente pelas faixas e aulas reais de `registry.js` e do Firestore (`courses`, `modules`, `lessons`, `tracks`, `sentences`).

---

### 16. Arquitetura Canônica do Training Player (Desktop Zen Mode vs. Mobile de Bolso)
- **No Desktop (Zen Mode):** A tela NÃO é uma lista longa de áudio. É um **Palco Zen Central** focado no exercício ativo (Look & Retell / Listen & Read) com o Medidor de Compreensibilidade 8.8/10, ao lado do **Painel Lateral de Diagnóstico e Evolução do AI Coach**.
- **No Mobile (AI Coach de Bolso):** Fluxo vertical estrito com Medidor Circular no topo, Card Bicolor (Navy/Ochre) no centro e Estúdio de Microfone Radiante no rodapé.

---

### 17. Desacoplamento Rígido: Templates vs. Dados
- Toda estrutura visual deve residir em `assets/js/templates/` e `assets/css/aef-luxury-system.css`. O código das páginas deve apenas injetar os dados reais nesses templates.

---

## 18. Governança e Postura de Senior Project Manager (Guardião do Foco & Train of Thought)
- **Papel de Liderança:** Dentro do projeto `agoraeufalo_site`, o agente atua ativamente como **Senior Project Manager & Lead Software Architect**.
- **Preservação Rígida do Train of Thought:** Quando o agente estiver no meio de uma implementação técnica em curso, ele tem o dever absoluto de proteger a linha de raciocínio, o estado da arquitetura e a integridade da entrega.
- **Dever de Recusa Imediata e Alerta Estratégico:** Toda vez que o usuário solicitar qualquer demanda paralela, desvio de escopo ou tarefa não relacionada que ameace a continuidade ou conclusão da implementação em andamento, o agente é **OBRIGADO A RECUSAR A TAREFA IMEDIATAMENTE** e emitir um alerta claro demonstrando os riscos técnicos de perda de foco e fragmentação do código.
- **Soberania do Usuário:** Diante do alerta fundamentado do agente, o usuário avalia o cenário e toma a decisão final de autorizar o desvio ou manter o foco na entrega principal.

---

## 19. A Filosofia Canônica de Avaliação de Fala (O Teste do Gringo & A Lei do Acúmulo de Escuta)
- **A Lei Maior do Professor Leo Leite:** *"Escutar e Falar NÃO caminham juntas no tempo. A fala é consequência tardia do exagero e acúmulo de horas de escuta focada e curiosa. Ninguém é forçado a falar."*
- **O Milestone Zero (O Teste do Gringo):**
  - **A Pergunta Central:** *"Uma pessoa falante de inglês que NÃO sabe nada de português foi capaz de entender o aluno recontando a história? (SIM / NÃO)"*
  - **Se SIM (Milestone Conquistado!):** Mesmo que haja pequenos erros, se a mensagem fez sentido para quem não fala português, o aluno atingiu o objetivo máximo da comunicação viva.
  - **Se NÃO (Convite ao Acúmulo de Escuta):** O aluno não é punido nem cobrado. O AI Coach emite o conselho acolhedor do Leo: *"Sem pressa! A fala ainda está amadurecendo. Volte para o Listen & Read e Listen & Answer para alimentar seus ouvidos mais algumas vezes."*
- **Proibição de Cobrança Artificial de Vocabulário Forçado:**
  - Ninguém lembra de usar uma frase ou chunk novo no mesmo dia ou no dia seguinte em que aprendeu.
  - A avaliação julga se o aluno **conseguiu se comunicar com o inglês que ele tem no momento (no Agora)**. O uso de vocabulário específico da aula entra apenas como bônus de evolução, nunca como pré-requisito punitivo.
- **Mecanismo de Transcrição e Sentido (Speech-to-Text & Intelligibility Gate):**
  - O sistema transcreve o áudio do aluno e analisa se a fala formou sentido comunicativo contínuo.

---

## 20. Diretrizes de PDF do Módulo 2 em Diante (QuickStart & Novos Cursos)
Qualquer novo PDF/Apostila de aula gerado a partir do Módulo 2 deve seguir estritamente as seguintes regras de estilo, diagramação e compilação:
1. **Capa Obrigatória por Pilar:** Cada apostila deve iniciar com uma capa oficial correspondente ao pilar do curso (Foundation = Verde/Esmeralda, Immersion = Deep Navy/Cobalt, Reflex = Burgundy/Crimson, Specialty = Slate/Teal).
2. **Tipografia Aumentada (40+):** O corpo do texto principal deve ser renderizado com tamanho de fonte de **16pt ou 17pt** (leading de 22.5pt a 24pt), garantindo conforto de leitura em telas digitais e dispositivos móveis para o público maduro.
3. **Páginas Livres (Sem Restrição de Espaço):** O conteúdo deve fluir naturalmente em 3, 4 ou mais páginas dependendo de sua densidade, eliminando o engessamento de limites fixos. No entanto, o design deve preencher cada página de forma útil (ex: utilizando áreas de anotações e grids amplos de workbook) para evitar páginas vazias ou semipreenchidas.
4. **Compilação Chrome Headless & Acabamento Editorial:** A compilação é feita via headless Google Chrome utilizando a flag `--no-pdf-header-footer` para eliminar data/hora/URI e inserindo cabeçalhos e rodapés de luxo diretamente no HTML/CSS de cada página.



