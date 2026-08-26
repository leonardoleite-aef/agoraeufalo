# 🏛️ Especificação Técnica & Arquitetura: Área de Membros & Integrações
**Ecossistema AgoraEuFalo • Professor Leonardo Leite**  
*Documento Executivo de Engenharia: Portal de Membros, Automação de Matrículas e Conexão com Training Player*

---

## 🧭 1. Visão Geral do Sistema

A **Área de Membros (Portal do Aluno)** é o ambiente central autenticado do ecossistema AgoraEuFalo, projetado para consumo de masterclasses, cursos completos, apostilas em PDF e envio tático de conteúdos práticos para o aplicativo de bolso (**English Personal Training Player**).

---

## 🔐 2. Fluxo de Matrícula, Autenticação & E-mail de Boas-Vindas

O ecossistema adota uma abordagem de fricção zero. O aluno nunca precisa recriar conta ou redefinir senhas desnecessárias se já interagiu com o site ou com o player aberto.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             ORIGENS DE MATRÍCULA                            │
├──────────────────────────────────────┬──────────────────────────────────────┤
│  A. Webhook Hotmart                  │  B. Matrícula Manual no CRM          │
│     (Aprovação de Compra Instantânea)│     (admin.html pelo Prof. Leo)      │
└──────────────────────────────────────┴──────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MOTOR DE PROCESSAMENTO & PERSISTÊNCIA                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. Firestore Update: Atualiza ou cria o documento em 'users/{uid}'         │
│     • Inserção do ID do curso no array 'enrolledProducts'                   │
│     • Atualização do plano/tier ('vip', 'club_anual', 'lifetime')           │
│                                                                             │
│  2. Disparo Automático Transacional (E-mail de Boas-Vindas):                 │
│     • Dispara e-mail de boas-vindas acolhedor do Prof. Leo                  │
│     • Contém Magic Link direto para login com 1 toque no portal             │
│     • Orientações sobre o Portal e o Personal Training Player               │
│                                                                             │
│  3. Liberação Instantânea no Portal:                                        │
│     • Acesso imediato liberado em agoraeufalo.com.br/portal.html            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Regras de Negócio do Fluxo de Entrada:
1. **Identificação do Usuário:** Busca pelo e-mail do comprador no Firebase Auth / Firestore. Se já existir (por exemplo, lead capturado no Player Aberto ou no E-book), apenas adiciona o novo curso ao array `enrolledProducts`.
2. **Novo Aluno:** Se o e-mail não existir, provisiona o usuário no Firebase Auth sem senha (via Magic Link) e cria o documento base no Firestore.
3. **E-mail de Boas-Vindas Automático (*Anyway*):** Independentemente de ser um aluno novo ou recorrente, a aprovação do curso sempre dispara o e-mail transacional com o link de acesso direto (*Magic Link*) e instruções pedagógicas.

---

## 🏛️ 3. Arquitetura da Área de Membros (`portal.html`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PORTAL DE MEMBROS (ÁREA DO ALUNO)                     │
│                        URL: agoraeufalo.com.br/portal.html                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. Autenticação & Acesso                                                   │
│     • Firebase Auth (Google Sign-In / Email+Senha / Magic Link)             │
│     • Validação imediata de 'enrolledProducts' no Firestore                 │
│                                                                             │
│  2. Visualização dos Cursos (Dashboard)                                     │
│     • Grade de produtos matriculados (Projeto AEF 2026, Magic Stories, etc.)│
│     • Métricas de engajamento (Streak de dias ativos, Minutos de treino)    │
│                                                                             │
│  3. Player da Aula (Imersão Teórica & Prática)                              │
│     • Vídeo Masterclass (MP4 via Google Cloud Storage)                      │
│     • Áudio com suporte a MediaSession (reprodução com tela bloqueada)      │
│     • Download de apostilas e PDFs diagramados                              │
│                                                                             │
│  4. Ponte com o Training Player de Bolso (Dual-Playlist)                    │
│     • Botão tático: "📌 Enviar para Meu Training Player"                    │
│     • Sincroniza a trilha de Sound-Chunks direto para 'Meu Laboratório'     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ 4. Modelagem de Dados no Google Cloud Firestore

```typescript
// ==========================================
// 1. USUÁRIO & PERMISSÕES (users/{uid})
// ==========================================
interface UserDocument {
  uid: string;
  email: string;
  name: string;
  phone?: string;
  tier: "free" | "vip" | "club" | "lifetime";
  enrolledProducts: string[];     // ["projeto-aef-2026", "magic-stories-club"]
  savedTrainingTracks: string[];  // Tracks favoritadas para o Training Player
  stats: {
    streakDays: number;
    totalListeningMinutes: number;
    lastTrainedAt: string;
  };
  welcomeEmailSentAt?: string;    // Timestamp do último e-mail de boas-vindas
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 2. CATÁLOGO DE CURSOS (courses/{courseId})
// ==========================================
interface CourseDocument {
  courseId: string;              // ex: "projeto-aef-2026"
  title: string;
  slug: string;
  description: string;
  coverImageUrl: string;
  tierRequired: string;          // "vip" | "club_anual" | "lifetime"
  totalModules: number;
  published: boolean;
  createdAt: string;
}

// ==========================================
// 3. MÓDULOS DO CURSO (courses/{courseId}/modules/{moduleId})
// ==========================================
interface ModuleDocument {
  moduleId: string;             // ex: "ciclo-01-fundamentos"
  title: string;
  order: number;
  description?: string;
  published: boolean;
}

// ==========================================
// 4. AULAS & CONTEÚDOS (courses/{courseId}/modules/{moduleId}/lessons/{lessonId})
// ==========================================
interface LessonDocument {
  lessonId: string;             // ex: "aula-01-reflexo-oral"
  moduleId: string;
  courseId: string;
  title: string;
  order: number;
  description: string;
  videoUrl?: string;            // Cloud Storage (MP4)
  audioUrl: string;             // Cloud Storage (MP3 puro 128kbps)
  durationSeconds: number;
  artworkUrl: string;           // Imagem para MediaSession / Lock Screen
  pdfUrl?: string;              // Apostila diagramada em PDF
  hasTrainingTrack: boolean;
  trainingTrackId?: string;     // ID da faixa de repetição no player
}
```

---

## ⚡ 5. Regras de Infraestrutura & Segurança

1. **Zero Mídia no Git:** Repositório leve (< 100 KB). Vídeos MP4, áudios MP3 e PDFs residem exclusivamente em `agoraeufalo-3463a.firebasestorage.app`.
2. **Disparo de E-mails Transacionais:** Integrado via Cloud Functions / API do Firebase Auth (`sendSignInLinkToEmail`) ou serviço SMTP/SendGrid conectado ao webhook da Hotmart e ao CRM do `admin.html`.
3. **Background Play & MediaSession:** Aulas de áudio e vídeo suportam reprodução contínua com celular bloqueado, fones Bluetooth, Apple AirPlay e Google Cast.
