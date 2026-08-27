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

## 3. As 6 Atividades Canônicas do Método Magic Stories
Todas as aulas e treinos do ecossistema seguem rigorosamente a estrutura pedagógica de 6 etapas:

1. **`1. Listen & Read` (Entrada & Imersão Auditiva):**
   - Áudio de estúdio Dual Speaker com karaokê interativo milimétrico (Play/Pause por toque).
   - Linha secundária obrigatória com **Tradução em Português Falado Brasileiro Real (`spokenTranslation`)**.
2. **`2. Vocabulary Session` (Matriz de Chunks Sonoros):**
   - Explicação contextual de collocations e expressões em blocos acústicos.
   - Apresentação em cards visuais claros (`bg-amber-50`) e compilação em **Apostila diagramada em PDF A4**.
   - *Sem tradução literal palavra por palavra.*
3. **`3. Listen & Answer` (Reflexo & Velocidade de Resposta):**
   - Template Call & Response: Pergunta rápida do Leo ➔ **micro-pausa cronometrada de 2 a 4 segundos** para o aluno responder em voz alta ➔ Resposta padrão imediata do Leo para validação auditiva.
   - *Sem necessidade de tradução em português na tela.*
4. **`4. Look & Retell` + AI Speech Coach (Produção Própria & Speaking Ativo):**
   - **Zero listening prévio do aluno. 100% Speaking autônomo.**
   - O aluno visualiza apenas as **perguntas-guia visuais** na tela e clica no microfone para recontar a história com suas próprias palavras.
   - O agente **`Look-Retell-AI-Coach`** avalia o áudio:
     - Atribui **Score de Compreensibilidade de 0 a 10** (foco em ser compreendido por nativos, sem rigor gramatical punitivo).
     - Mapeia o ponto exato da história onde o aluno se embolou ou hesitou.
     - Entrega feedback caloroso no tom do Professor Leo incentivando a repetição.
5. **`5. Listen & Ask` (Desafio de Formulação de Perguntas):**
   - O Leo faz uma afirmação sonora ➔ micro-pausa para o aluno formular a pergunta correspondente ➔ Leo confirma a pergunta correta.
6. **`6. Pronunciation & Connected Speech` (Musicalidade & Ritmo):**
   - Treino cirúrgico de reduções acústicas (*gonna, wanna, coulda, drop de 't'/'d'*, conexões consoante-vogal) com botão de repetição contínua (`🔂`).

---

## 4. O Squad Unificado de Agentes de IA
A criação e manutenção de conteúdo são executadas por um squad especializado de 6 subagentes:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                         SQUAD DE AGENTES AGORAEUFALO                                    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. Leo-Content-Writer: Redação de histórias, roteiros das 6 etapas e tradução falada.   │
│ 2. Visual-Artwork-Artist: Capas 16:9 (Blog) e 1:1 512x512 <90KB (Player/Lockscreen).   │
│ 3. Player-Audio-Engine: Síntese Gemini TTS (Dual/Single), MP3 128k e timestamps reais. │
│ 4. Editorial-PDF-Engine: Compilação de apostilas A4 Diagramadas (ReportLab) anti-corte. │
│ 5. Look-Retell-AI-Coach: Avaliação de áudio 0-10, diagnóstico de engasgos e feedback. │
│ 6. Tier-Platform-Distributor: Distribuição Firestore (Free, Cursos, VIP) e Git Deploy. │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

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

## 6. A Fábrica de Cursos & Integração Fluida (Sala de Aula ⇄ Player)
A área de membros opera com conexão bidirecional perfeita entre teoria e treino prático:

1. **Na Sala de Aula (`sala-de-aula.html`):** O aluno assiste à masterclass, estuda os chunks claros, lê a Sacada de Ouro e baixa a apostila em PDF.
2. **O Botão de Prática Ativa (*📌 Enviar para Training Player*):** Abre com 1 toque o Player na faixa exata da aula para os exercícios de *Listen & Read*, *Listen & Answer*, *Look & Retell* e *Pronúncia*.
3. **Botão de Retorno no Player:** Permite voltar diretamente para a lição ativa da Sala de Aula.
4. **Conformidade de Schema (1:1):** Cada aula no Firestore (`courses/{courseId}/modules/{moduleId}/lessons/{lessonId}`) contém os campos `hasTrainingTrack: true` e `trainingTrackId`.

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
- **Capa de Artigo de Blog (16:9):** Arte cinematográfica e editorial de alto impacto gerada via `generate_image`, salva em `assets/images/cover-[slug].jpg`.
- **Capa de Treino do Aluno / Player (1:1):** Arte quadrada baseada no contexto real do diálogo. **Otimizada obrigatoriamente com `sips` para 512x512 pixels (<90 KB)** para suporte imediato à tela de bloqueio do iOS/Android via MediaSession API. Salva em `assets/images/cover-[aluno/tema]-[slug].jpg`.

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

## 14. Política de Deploy: Automático por Padrão com Kill-Switch Obrigatório
- **Padrão (Default):** O agente realiza o build (`npm run build`) e o deploy (`git push origin main`) automaticamente ao concluir as entregas solicitadas.
- **Kill-Switch Obrigatório:** Se o usuário incluir termos como *"no deploy"*, *"não faça deploy"*, *"não suba para produção"*, *"apenas local"* ou *"não dê push"*, o agente é terminantemente PROIBIDO de executar `git push`.
