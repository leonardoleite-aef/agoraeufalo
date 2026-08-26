# 🏛️ Master Blueprint & Plano de Implementação: Ecossistema AgoraEuFalo
**Professor Leonardo Leite • Método AgoraEuFalo & Magic Stories**  
*Documento Executivo de Arquitetura de Software, UX/UI e Engenharia de Dados*

---

## 🧭 1. Visão Geral & Filosofia do Ecossistema

O ecossistema **AgoraEuFalo** foi concebido para resolver o maior gargalo no aprendizado de inglês de adultos brasileiros: a transição da teoria passiva para o **reflexo oral automático (Connected Speech & Sound-Chunks)**.

A arquitetura desacopla a plataforma em dois polos complementares:
1. **O Hub Central (Portal de Cursos & Masterclasses):** Ambiente de imersão teórica, vídeo-aulas, apostilas diagramadas e gestão de produtos.
2. **O Treinador Tático (English Personal Training Player):** Aplicativo de bolso ultraleve, mobile-first, sem atrito ou burocracia, projetado para repetição muscular com tela bloqueada, fone de ouvido, AirPlay e CarPlay.

---

## 🏛️ 2. Arquitetura de Infraestrutura (Regra de Ouro Cloud)

Para manter a segurança dos materiais e a agilidade nos deploys contínuos, vigora a seguinte regra de infraestrutura:

```
[ARQUITETURA MACRO AEF: Git = Apenas Código | Mídia = Firebase Storage | Dados = Firestore]
```

* **Repositório Git:** Apenas código-fonte (HTML, CSS, JavaScript, TypeScript, regras), pesando < 100 KB por release. Zero binários locais.
* **Google Cloud Storage (`agoraeufalo-3463a.firebasestorage.app`):** Repositório de 100% dos arquivos de mídia pesada:
  * Vídeos MP4 das masterclasses e aulas.
  * Áudios MP3 puros (128 kbps LAME) sintetizados via Neural Gemini TTS Studio.
  * Livros digitais e apostilas diagramadas em PDF.
* **Google Cloud Firestore:** Banco de dados NoSQL para metadados, permissões de acesso (RBAC), leads do Lead Gate e transcrições sincronizadas em micro-blocos sonoros.

---

## 🎧 3. Evolução do Tier 2: Diagnóstico "Como É" vs. "Como Deve Ser"

O núcleo de prática ativa (English Personal Training Player) evolui de um reprodutor unidirecional para um ecossistema dinâmico de **Dual-Playlist (Dupla Trilha)**:

```
ESTADO ATUAL (Como É)                     ESTADO ALVO (Como Deve Ser)
┌───────────────────────────────┐         ┌──────────────────────────────────────────┐
│  Playlist Única Estática      │         │  Dual-Playlist em Abas Dinâmicas         │
│  (Apenas o que o Leo cadastra)│  ====>  │  [ 🎯 Prescrição Leo ] [ ⚡ Meu Lab ]    │
│  - Sem importação do aluno    │         │  - Treinos VIP         - Aulas do Portal │
│  - Desacoplado do Portal/YT   │         │  - Áudios de Estúdio   - Vídeos YouTube  │
└───────────────────────────────┘         └──────────────────────────────────────────┘
```

### 📊 Matriz Comparativa Detalhada

| Dimensão | Como É (Arquitetura Atual) | Como Deve Ser (Proposta de Evolução) | Motivo da Mudança / Ganho Pedagógico |
| :--- | :--- | :--- | :--- |
| **Origem dos Conteúdos** | **Unidirecional:** O aluno apenas consome faixas cadastradas diretamente no Firestore/JSON pelo Professor Leo. | **Bidirecional:** Trilha 1 (Prescrita pelo Leo) + Trilha 2 (Alimentada pelo aluno via Portal ou link do YouTube). | Combina o rigor do direcionamento do mentor com a autonomia do aluno em treinar temas do seu interesse real. |
| **Integração com Cursos** | **Isolada:** O Player funciona em URL separada (`/treino/player.html?aluno=x`) sem sincronização direta com as aulas do portal. | **Integrada:** Aulas do Portal e episódios de *Magic Stories* ganham o botão *"📌 Enviar para Meu Player de Bolso"*. | Elimina o atrito de ter que logar na área de membros completa apenas para escutar o treino no trânsito ou academia. |
| **Fábrica On-Demand (YouTube)** | **Manual no Studio:** Extração e divisão em chunks precisam de intervenção no Command Center (`admin.html`). | **Self-Service Inteligente:** O aluno cola um link do YouTube; o pipeline de estúdio transcreve e fatia em chunks de 1.5 a 4s. | Transforma qualquer conteúdo da internet em material de treino muscular com a metodologia AgoraEuFalo. |
| **Interface & Navegação** | **Lista linear única:** Todas as sessões do aluno ficam empilhadas em uma só tela. | **Duas Abas Superiores Segmentadas:**<br>• Aba 1: `🎯 Prescrição do Leo`<br>• Aba 2: `⚡ Meu Laboratório` | Organização mental: separa tarefas prescritas VIP de pesquisas e estudos livres do aluno. |
| **Controles Móveis (Ergonomia)** | Controles clássicos no corpo da página e integração básica com MediaSession. | **Floating Thumb Zone:** Barra inferior translúcida fixa com botões ampliados de `Play`, `Loop 🔁` e `Seek`. | Facilita a operação com uma só mão durante caminhadas, treinos físicos ou no trânsito. |
| **Persistência Firestore** | Subcoleções individuais estáticas (`students/{id}/tracks/*`). | **Duas coleções desacopladas:** `tracks/{trackId}` (oficiais) e `users/{uid}/custom_tracks/{id}` (do aluno). | Isolamento de permissões: segurança para as faixas institucionais e liberdade para o laboratório pessoal. |

---

## 🔍 4. O Que Fica Intacto (Fundação Técnica Consolidada)

1. **Metodologia Sound-Chunks:** Divisão do áudio em micro-blocos sonoros de 1.5 a 4 segundos com **Seek Instantâneo** ao tocar em qualquer frase do Karaokê.
2. **Mecânica de Repetição:** O **Modo Loop (`🔁`)** de frase infinita e o **Modo Direção (`🚗 Driving Mode`)** com tipografia gigante de alto contraste.
3. **Background Audio & AirPlay:** Suporte nativo à API `MediaSession` do navegador para exibição de capa 1:1, título da lição e controles na tela de bloqueio do celular, fones Bluetooth e central multimídia.

---

## 🗄️ 5. Esquema Completo de Dados (Google Cloud Firestore)

### 1. Catálogo de Cursos & Módulos (`courses/{courseId}`)
```typescript
interface CourseDocument {
  courseId: string;           // ex: "projeto-aef-2026", "magic-stories-club"
  title: string;
  slug: string;
  description: string;
  coverImageUrl: string;
  tierRequired: string;       // "vip" | "club_anual" | "lifetime"
  totalModules: number;
  published: boolean;
  createdAt: string;
}

interface ModuleDocument {
  moduleId: string;          // ex: "ciclo-01-fundamentos"
  title: string;
  order: number;
  description?: string;
  published: boolean;
}

interface LessonDocument {
  lessonId: string;          // ex: "aula-01-reflexo-oral"
  moduleId: string;
  courseId: string;
  title: string;
  order: number;
  description: string;
  
  // Mídias no Firebase Storage
  videoUrl?: string;         // Stream MP4 na nuvem
  audioUrl: string;          // Áudio puro MP3 128kbps (Compatível com MediaSession)
  durationSeconds: number;
  artworkUrl: string;        // Capa para a tela de bloqueio do smartphone
  pdfUrl?: string;           // Apostila diagramada em PDF
  
  // Conexão direta com o Player
  hasTrainingTrack: boolean;
  trainingTrackId?: string;  // ID da trilha caso contenha karaokê/loop
}
```

### 2. Trilha 1: Faixas Prescritas pelo Mentor (`tracks/{trackId}`)
```typescript
interface AssignedTrack {
  id: string;                    // ex: "oxford-presentation-casual"
  title: string;
  assignedTo: string[];          // ["estevao"], ["thomas"] ou ["turma_2026", "public"]
  audioUrl: string;              // gs://.../audios/prescricao_01.mp3
  videoUrl?: string;             // Vídeo MP4 opcional
  coverImage: string;
  duration: string;
  sentences: Array<{
    id: number;
    start: number;
    end: number;
    text: string;
    notes?: string;              // Dicas fonéticas do Professor Leo
  }>;
  type: "assigned_by_mentor";
  status: "active" | "archived";
  createdAt: string;
}
```

### 3. Trilha 2: Laboratório Pessoal do Aluno (`users/{uid}/custom_tracks/{trackId}`)
```typescript
interface StudentCustomTrack {
  id: string;
  uid: string;
  title: string;
  sourceType: "course_lesson" | "youtube_import" | "magic_story";
  sourceUrl?: string;            // URL original do YouTube ou ID da aula
  audioUrl: string;              // Áudio processado salvo no Cloud Storage
  coverImage: string;
  duration: string;
  sentences: Array<{
    id: number;
    start: number;
    end: number;
    text: string;
  }>;
  status: "processing" | "ready"; // Feedback visual durante fatiamento em chunks
  createdAt: string;
}
```

### 4. Perfil & Métricas do Aluno (`users/{uid}`)
```typescript
interface UserDocument {
  uid: string;
  email: string;
  name: string;
  tier: "free" | "vip" | "club" | "lifetime";
  enrolledProducts: string[];    // ["projeto-aef-2026", "mentoria_vip_spoken"]
  savedTrainingTracks: string[]; // IDs de tracks favoritadas para acesso rápido
  stats: {
    streakDays: number;
    totalListeningMinutes: number;
    lastTrainedAt: string;
  };
  createdAt: string;
}
```

---

## 🚀 6. Roadmap de Execução no Antigravity

1. **Módulo A: Dual-Playlist UI no Player (`treino/player.html`)**
   * Implementação das abas `🎯 Prescrição do Leo` e `⚡ Meu Laboratório`.
   * Barra flutuante inferior (*Floating Thumb Zone*) com botões táteis ampliados.
2. **Módulo B: Área de Cursos & Masterclasses (`portal/index.html`)**
   * Consumo de módulos e aulas a partir do Firestore (`courses/{id}/modules/{id}/lessons`).
   * Adição do botão *"📌 Enviar para Meu Player"* em cada aula.
3. **Módulo C: Pipeline On-Demand (Importação YouTube ➔ Chunks)**
   * Integração do extrator de áudio com transcrição temporal e salvamento no Cloud Storage.
4. **Módulo D: Gestor de Conteúdos no `admin.html`**
   * Upload de masterclasses e distribuição de treinos prescritos por aluno ou turma.
