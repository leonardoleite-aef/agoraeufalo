# 🎧 Dossiê de Engenharia & UX • Tier 2: English Personal Training Player
**Projeto AgoraEuFalo • Professor Leonardo Leite**  
*Documento Técnico de Referência para Auditoria de UX/UI e Melhoria da Experiência do Aluno*

---

## 🧭 1. Visão Geral do Produto & Princípio Pedagógico

O **Tier 2** é o núcleo de prática ativa do ecossistema AgoraEuFalo. Diferente de plataformas de idiomas passivas (que tratam inglês como matéria teórica), o **English Personal Training Player** funciona como um **treinador muscular de reflexo oral**.

### 🎯 O Desafio Pedagógico Resolvido:
- Alunos intermediários e avançados costumam "travar" não por falta de vocabulário, mas por falta de **automatismo motor e velocidade de decodificação sonora**.
- O Player decompõe o diálogo ou discurso em **Sound-Chunks (micro-blocos de sentido de 1.5 a 4 segundos)**, permitindo repetição cirúrgica com retorno auditivo imediato.

---

## 🏗️ 2. Arquitetura Funcional do Tier 2

```mermaid
graph TD
    A[Aluno Acessa Link/QR Code] --> B{Tipo de Acesso?}
    B -->|Lead Aberto / Tráfego| C[personal-trainer.html]
    C -->|Preenche Nome + Zap| D[treino/player.html?aluno=public]
    B -->|Mentorado VIP| E[treino/player.html?aluno=estevao]
    
    subgraph Core Player Engine [treino/player.html]
        F[Audio/Video Engine]
        G[Karaokê Sound-Chunks Synchronizer]
        H[Loop Infinito de Frases 🔁]
        I[Driving Mode - Botões Gigantes]
        J[MediaSession API - Tela de Bloqueio iOS/Android]
    end
    
    D --> Core Player Engine
    E --> Core Player Engine
    
    subgraph Data & Cloud Layer
        K[(Google Cloud Firestore)]
        L[(Firebase Storage - MP3/MP4)]
        M[IndexedDB / Local Cache]
    end
    
    Core Player Engine <--> K
    Core Player Engine <--> L
    Core Player Engine <--> M
```

---

## 📱 3. Os 6 Pilares de Experiência do Aluno (UX Ativa)

1. **Karaokê com Seek Instantâneo (Toque = Play Imediato):**
   - Tocar em qualquer card de frase no texto move a reprodução milimétrica para `sentence.start` e inicia o play imediatamente.
   - O card ativo ganha destaque visual imediato (`bg-amber-100`, borda âmbar dourada, fonte encorpada) com auto-scroll suave para manter a frase sempre no centro da visão.

2. **Loop Contínuo de Frases (`🔁 Loop Mode`):**
   - Ao ativar o botão `🔁 Loop` em qualquer frase, o player isola o trecho e repete continuamente entre `start` e `end`.
   - Permite que o aluno treine a musculatura da boca e a conexão sonora (*connected speech*) 10x a 20x seguidas sem precisar rebobinar manualmente.

3. **Modo Direção / Hands-Free (`🚗 Driving Mode`):**
   - Transforma a interface em botões gigantes de toque rápido para alunos que treinam no carro, na academia ou caminhando.
   - Exibe a frase atual em tipografia gigante de altíssimo contraste.

4. **Regulador de Velocidade Dinâmica com Preservação de Pitch:**
   - Opções de reprodução: `0.75x`, `0.9x`, `1.0x`, `1.25x`, `1.5x`.
   - Utiliza processamento nativo de áudio do navegador para não distorcer o tom da voz do professor.

5. **Integração com a Tela Bloqueada do iPhone/Android (`MediaSession API`):**
   - Exibe a capa personalizada 1:1, título do treino e controles de Avançar/Retroceder/Play/Pause direto na tela bloqueada do celular e na central multimídia do carro via Bluetooth/CarPlay.

6. **Dual Media Mode (Áudio MP3 + Vídeo MP4 na Nuvem):**
   - Alternância fluida entre modo somente áudio (foco na audição) e modo vídeo sincronizado (para observar expressão facial e articulação).

---

## 🗂️ 4. Mapa de Arquivos do Tier 2

| Arquivo | Localização no Repositório | Função Principal |
| :--- | :--- | :--- |
| **Player Principal** | [`treino/player.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/treino/player.html) | Interface interativa de áudio, karaokê, loop e sincronização em tempo real. |
| **Landing Page & Lead Gate** | [`personal-trainer.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/personal-trainer.html) | Página de apresentação com bloqueio inteligente de captura de leads. |
| **Hub de Áudio & Cache** | [`assets/js/aef-audio-hub.js`](file:///Users/macbookpro/Desktop/agoraeufalo_site/assets/js/aef-audio-hub.js) | Sincronizador de tracks locais, Firestore e IndexedDB. |
| **Nuvem & Sincronização** | [`assets/js/aef-cloud-sync.js`](file:///Users/macbookpro/Desktop/agoraeufalo_site/assets/js/aef-cloud-sync.js) | Conexão REST com Google Cloud Firestore e Firebase Storage. |
| **Datasets de Exemplo** | `treino/data/public.js`, `estevao.js`, `thomas.js` | Estrutura de dados com timestamps de sentenças, durações e capas. |

---

## 🔍 5. Estrutura do Objeto de Dados de um Treino (`Track Schema`)

```javascript
{
  id: "track_spoken_reflex_01",
  title: "Oxford Presentation & Connected Speech",
  duration: "03:45",
  coverImage: "https://firebasestorage.googleapis.com/.../cover.jpg",
  audioUrl: "https://firebasestorage.googleapis.com/.../audio.mp3",
  videoUrl: "https://firebasestorage.googleapis.com/.../video.mp4", // Opcional
  summary: "Treino de cadência, redução de 'going to -> gonna' e pausas estratégicas.",
  goldenTip: "Preste atenção como o som final de consoante se conecta à vogal seguinte.",
  status: "active", // "active" | "archived"
  assignedTo: ["public"], // ou ["estevao", "thomas"]
  sentences: [
    {
      id: 1,
      start: 0.00,
      end: 3.42,
      text: "Good morning everyone, thank you for being here today.",
      notes: "Speaker: Leo"
    },
    {
      id: 2,
      start: 3.45,
      end: 7.10,
      text: "Today I'm going to share the three fundamental pillars of fluent communication.",
      notes: "Speaker: Leo"
    }
  ]
}
```

---

## 💡 6. Perguntas Guia para o Analista de UX / Produto

Para direcionar a análise do seu analista de produto, aqui estão os pontos estratégicos mais ricos para otimização:

1. **Micro-Interações & Feedback Háptico:**
   - Seria interessante adicionar vibração leve no celular ao trocar de frase ou ao atingir 5 repetições de loop?
2. **Gamificação & Contador de Repetições (Streak):**
   - Exibir um contador discreto: *"Você repetiu esta frase 7 vezes! Reflexo consolidado!"* para estimular a fixação motora.
3. **Gravador de Voz Comparativo (Voice Mirroring):**
   - Um botão de microfone onde o aluno grava a própria fala logo após a frase de referência e escuta as duas em sequência.
4. **Ergonomia do Polegar no Mobile (Thumb Zone):**
   - Avaliar a posição da barra flutuante de controles (`Play`, `Loop`, `Next`, `Speed`) para garantir uso com uma só mão em telas grandes.
5. **Transição de Faixas e Playlists:**
   - Adicionar auto-avanço opcional com intervalo de 2 segundos de silêncio para reflexão entre faixas.
