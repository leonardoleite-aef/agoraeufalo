# 🗺️ ROADMAP DE ENGENHARIA & EVOLUÇÃO — AGORAEUFALO

Este documento registra os marcos arquiteturais, funcionalidades planejadas e débitos técnicos priorizados para o ecossistema digital **AgoraEuFalo**.

---

## 📌 1. Backlog Prioritário & Automação de Infraestrutura

### [ROADMAP-01] Esteira Local Autônoma no Painel Admin (`admin-cursos.html`)
- **Status:** ⏳ Planejado / Na Fila
- **Objetivo:** Permitir upload e processamento de novos módulos diretamente pela interface web do Admin, com **zero consumo de tokens de IA externa (Antigravity)**.
- **Arquitetura Técnica:**
  - Micro-servidor local em Python/Node (`server_esteira.py` escutando em `http://localhost:3000/api/process-module`).
  - Campo no `admin-cursos.html`: Caminho absoluto da pasta (ex: `/Users/macbookpro/Downloads/MS_MIGRACAO/MSxxx`).
  - Barra de progresso visual em tempo real no navegador:
    1. Geração de Capas 16:9 + Capa 1:1 (`Pillow`)
    2. Cópia e Upload de PDF (`Firebase Storage`)
    3. Extração de MP3 128k (`PyAV`)
    4. Transcrição & Timestamps Karaokê (`Faster-Whisper` CPU/INT8 local)
    5. Upload de MP4s, MP3s e Thumbs (`Firebase Storage`)
    6. Injeção direta no Firestore e nos arquivos locais (`sala-de-aula.html`, `curso.html`, `treino/data/magic-stories.js`)
  - Botão "Finalizar" com recarregamento dinâmico da coluna de módulos.

### [ROADMAP-02] Pipeline de Migração de Todas as Magic Stories Legadas (MS001 a MS030)
- **Status:** 🚀 Em Andamento (MS001 a MS012 concluídos com sucesso!)
- **Próximos:** MS013 a MS030.

---

## 📌 2. Lembretes Técnicos & Marcos Anteriores

1. **Apostilas em PDF (Módulo 2 em Diante)**:
   - Fontes confortáveis (15 a 17pt) para público maduro.
   - Padrão 3 Arquétipos, sem limite artificial de páginas (densidade > 70%).
   - Compilação via ReportLab / Chrome Headless.
2. **Single Source of Truth no Firestore**:
   - Manter sincronia total entre Firestore (`courses`, `modules`, `lessons`, `tracks`) e os catálogos locais.
   - Proibição estrita de dados fake/mockados em produção.
3. **Training Player (Zen Mode vs. Mobile de Bolso)**:
   - Palco Zen no Desktop com AI Speech Coach e Medidor de Compreensibilidade (*O Teste do Gringo*).
   - Card Bicolor no mobile com gravação e diagnóstico de ritmo.
