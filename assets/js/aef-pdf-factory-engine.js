/**
 * AgoraEuFalo - PDF Factory Studio Engine & State Manager
 * Professor Leonardo Leite
 * 
 * Comprehensive block-based document engine for:
 * 1. Legacy PDF Ingestion (PDF.js text extraction + heuristic parsing)
 * 2. Modular Page & Block Architecture (11 pedagogical block types)
 * 3. Exact 85% Ideal Density Meter per A4 Page
 * 4. 6 Official Color Palettes (Amber, Cobalt, Emerald, Ruby, Indigo, Slate, Custom)
 * 5. 100% Real & Scannable QR Codes for Training Player
 * 6. Cloud Vault (Firestore `pdf_recipes` & Local Backup Storage)
 * 7. Instant Print/Export & Course Registry Linking
 */

(function (window) {
  'use strict';

  // 1. Official Color Palettes in Stock
  const PALETTES = {
    amber: {
      id: 'amber',
      name: 'Âmbar Real / Ouro Master',
      primary: '#C68A36',
      primaryDark: '#B45309',
      primaryLight: '#FFFBEB',
      border: '#FDE68A',
      badgeBg: '#FEF3C7',
      badgeText: '#92400E',
      headerBg: 'linear-gradient(135deg, #C68A36, #0A192F)',
      dotColor: '#C68A36'
    },
    cobalt: {
      id: 'cobalt',
      name: 'Azul Cobalto (Fundamentos)',
      primary: '#1A56DB',
      primaryDark: '#1E40AF',
      primaryLight: '#EFF6FF',
      border: '#BFDBFE',
      badgeBg: '#DBEAFE',
      badgeText: '#1E40AF',
      headerBg: 'linear-gradient(135deg, #1A56DB, #0A192F)',
      dotColor: '#1A56DB'
    },
    emerald: {
      id: 'emerald',
      name: 'Verde Esmeralda (Vocabulário)',
      primary: '#047857',
      primaryDark: '#065F46',
      primaryLight: '#ECFDF5',
      border: '#A7F3D0',
      badgeBg: '#D1FAE5',
      badgeText: '#065F46',
      headerBg: 'linear-gradient(135deg, #047857, #0A192F)',
      dotColor: '#047857'
    },
    ruby: {
      id: 'ruby',
      name: 'Rubi Quente / Coral (Speaking)',
      primary: '#E11D48',
      primaryDark: '#BE123C',
      primaryLight: '#FFF1F2',
      border: '#FECDD3',
      badgeBg: '#FFE4E6',
      badgeText: '#9F1239',
      headerBg: 'linear-gradient(135deg, #E11D48, #0A192F)',
      dotColor: '#E11D48'
    },
    indigo: {
      id: 'indigo',
      name: 'Índigo Violeta (Questions)',
      primary: '#6366F1',
      primaryDark: '#4338CA',
      primaryLight: '#EEF2FF',
      border: '#C7D2FE',
      badgeBg: '#E0E7FF',
      badgeText: '#3730A3',
      headerBg: 'linear-gradient(135deg, #6366F1, #0A192F)',
      dotColor: '#6366F1'
    },
    slate: {
      id: 'slate',
      name: 'Deep Slate (Executivo)',
      primary: '#1E293B',
      primaryDark: '#0F172A',
      primaryLight: '#F8FAFC',
      border: '#E2E8F0',
      badgeBg: '#F1F5F9',
      badgeText: '#1E293B',
      headerBg: 'linear-gradient(135deg, #1E293B, #0A192F)',
      dotColor: '#475569'
    }
  };

  // Block definitions and metadata
  const BLOCK_TYPES = {
    cover: {
      id: 'cover',
      name: 'Capa Deep Navy (Arquétipo 1)',
      icon: 'sparkles',
      category: 'Estrutura',
      defaultWeight: 100,
      defaultData: () => ({
        tag: '✦ AgoraEuFalo • Professor Leonardo Leite',
        courseTitle: 'English QuickStart • Fundamentos da Fala',
        moduleTitle: 'Módulo 1 • O Núcleo da Frase',
        lessonTitle: 'Aula 1.2 • O Rei dos Verbos (To Be)',
        watermark: '01/02',
        synopsis: 'Aprenda a dominar o uso natural das estruturas fundamentais e automatize suas respostas até a fala virar reflexo.',
        stats: 'Duração: 14 min • 12 Chunks Sonoros • Treino Completo LA/LRT',
        artworkUrl: 'assets/images/cover-default-aef.jpg'
      })
    },
    header_banner: {
      id: 'header_banner',
      name: 'Cabeçalho da Lição',
      icon: 'bookmark',
      category: 'Estrutura',
      defaultWeight: 18,
      defaultData: () => ({
        tag: '✦ AgoraEuFalo • Professor Leonardo Leite',
        courseTitle: 'English QuickStart',
        lessonTitle: 'Aula 1.2 • O Rei dos Verbos'
      })
    },
    listen_read: {
      id: 'listen_read',
      name: 'Listen & Read (LR)',
      icon: 'headphones',
      category: 'História & Entrada',
      defaultWeight: 45,
      defaultData: () => ({
        title: 'Listen & Read • Imersão Auditiva Real',
        instruction: 'Observe muito mais PELOS OUVIDOS do que pelos olhos. Sinta a melodia natural e a cadência da frase.',
        sentences: [
          { speaker: 'Leo', en: 'Rodrigo was at the office yesterday morning.', pt: '' },
          { speaker: 'Leo', en: 'He was trying to finish the quarterly report before noon.', pt: '' },
          { speaker: 'Leo', en: 'Were they ready for the big meeting with the client?', pt: '' },
          { speaker: 'Leo', en: 'Yes, they were completely prepared and confident.', pt: '' }
        ]
      })
    },
    vocab_chunks: {
      id: 'vocab_chunks',
      name: 'Vocabulary Session & Chunks',
      icon: 'book-open',
      category: 'Vocabulário',
      defaultWeight: 45,
      defaultData: () => ({
        title: 'Vocabulary Session • Matriz de Chunks Sonoros',
        instruction: 'Vocabulário ativo é aquele que sai no piloto automático. Fixe os blocos inteiros com sua tradução falada real.',
        chunks: [
          { en: 'I was there yesterday', pt: 'Eu tava lá ontem', soundTag: 'Passado' },
          { en: 'She was about to leave', pt: 'Ela tava quase saindo', soundTag: 'Conexão' },
          { en: 'We were talking about you', pt: 'A gente tava falando de você', soundTag: 'Conversa' },
          { en: 'Were they ready?', pt: 'Eles tavam prontos?', soundTag: 'Pergunta' }
        ]
      })
    },
    listen_answer: {
      id: 'listen_answer',
      name: 'Listen & Answer (LA)',
      icon: 'zap',
      category: 'Treino Ativo',
      defaultWeight: 45,
      defaultData: () => ({
        title: 'Listen & Answer • Velocidade de Resposta no Diálogo',
        instruction: 'Responda curto e rápido no reflexo. Proibido respostas prontas: use o espaço pautado para praticar.',
        questions: [
          'Where was Rodrigo yesterday morning?',
          'What was he trying to finish before noon?',
          'Were they ready for the client meeting?',
          'How did they feel about the presentation?'
        ],
        showLines: true
      })
    },
    look_retell: {
      id: 'look_retell',
      name: 'Look & Retell (LRT)',
      icon: 'mic',
      category: 'Treino Ativo',
      defaultWeight: 40,
      defaultData: () => ({
        title: 'Look & Retell + AI Coach • Produção Própria',
        instruction: 'Reconte a história com o seu inglês de hoje. Use as perguntas-guia e as palavras-chave como mapa mental.',
        prompts: [
          'Who was at the office and what was he doing?',
          'What were they preparing for?',
          'What was the final outcome?'
        ],
        keywords: ['yesterday morning', 'quarterly report', 'client meeting', 'confident']
      })
    },
    listen_ask: {
      id: 'listen_ask',
      name: 'Listen & Ask (LASK)',
      icon: 'help-circle',
      category: 'Treino Ativo',
      defaultWeight: 40,
      defaultData: () => ({
        title: 'Listen & Ask • Formulação Rápida de Perguntas',
        instruction: 'Ao ouvir o estímulo afirmativo ou negativo, formule de imediato a pergunta correspondente.',
        items: [
          { statement: 'Rodrigo was at the office yesterday.', prompt: 'Pergunte onde ele estava ontem:' },
          { statement: 'They were preparing the quarterly report.', prompt: 'Pergunte o que eles estavam preparando:' },
          { statement: 'The meeting was very successful.', prompt: 'Pergunte como foi a reunião:' }
        ],
        showLines: true
      })
    },
    connected_speech: {
      id: 'connected_speech',
      name: 'Connected Speech & Pronúncia (PRO)',
      icon: 'music',
      category: 'Musicalidade',
      defaultWeight: 40,
      defaultData: () => ({
        title: 'Pronunciation & Connected Speech • Ritmo Mecânico',
        instruction: 'Treine as conexões consoante-vogal em azul cobalto. Fale sem tropeçar até soar natural.',
        content: 'Rodrigo <span class="linking">was_at</span> the office yesterday morning. He <span class="linking">was_about_to</span> leave when the phone rang.',
        tips: [
          'was at ➔ pronuncia-se /wə-zæt/ conectado sem pausa',
          'about to ➔ o /t/ faz ponte suave com o /t/ seguinte'
        ]
      })
    },
    golden_tip: {
      id: 'golden_tip',
      name: 'Sacada de Ouro do Leo',
      icon: 'lightbulb',
      category: 'Pedagógico',
      defaultWeight: 20,
      defaultData: () => ({
        title: 'Sacada de Ouro do Professor Leo',
        content: 'Não tente traduzir palavra por palavra: was e were são o sentimento da frase! Sinta quem está falando antes de pensar em gramática.'
      })
    },
    explainer: {
      id: 'explainer',
      name: 'Conceito Central / Explainer',
      icon: 'file-text',
      category: 'Pedagógico',
      defaultWeight: 25,
      defaultData: () => ({
        title: 'Conceito Central da Aula',
        content: 'O verbo To Be no passado expressa tanto o estado permanente quanto a continuidade de uma ação no momento em que ela acontecia.'
      })
    },
    handwriting_lines: {
      id: 'handwriting_lines',
      name: 'Pautas de Caligrafia / Anotações',
      icon: 'edit-3',
      category: 'Prática Manual',
      defaultWeight: 20,
      defaultData: () => ({
        title: 'Suas Anotações de Treino Oral & Reflexo',
        lineCount: 4
      })
    },
    qr_code: {
      id: 'qr_code',
      name: 'QR Code Interativo do Player',
      icon: 'qr-code',
      category: 'Multimídia',
      defaultWeight: 15,
      defaultData: () => ({
        title: 'Toque o Áudio Desta Aula no Celular',
        subtitle: 'Aponte a câmera para abrir o Training Player diretamente nesta lição.',
        targetUrl: 'https://agoraeufalo.com.br/player.html'
      })
    }
  };

  class AEFPdfFactoryEngine {
    constructor() {
      this.palettes = PALETTES;
      this.blockTypes = BLOCK_TYPES;
      this.IDEAL_DENSITY = 85;

      this.state = {
        activeRecipeId: null,
        title: 'Apostila Oficial',
        subtitle: 'Material Pedagógico de Apoio',
        courseId: 'english-quickstart',
        moduleId: 'eqs-m1',
        lessonId: 'eqs12',
        paletteId: 'amber',
        customHex: '#C68A36',
        fontSize: '15pt',
        showFooter: true,
        templateType: 'generic',
        status: 'testing',
        pages: [
          {
            id: 'page_1',
            number: 1,
            blocks: [
              { id: 'b_header', type: 'header_banner', data: BLOCK_TYPES.header_banner.defaultData() },
              { id: 'b_explainer', type: 'explainer', data: BLOCK_TYPES.explainer.defaultData() },
              { id: 'b_chunks', type: 'vocab_chunks', data: BLOCK_TYPES.vocab_chunks.defaultData() },
              { id: 'b_golden', type: 'golden_tip', data: BLOCK_TYPES.golden_tip.defaultData() }
            ]
          },
          {
            id: 'page_2',
            number: 2,
            blocks: [
              { id: 'b_la', type: 'listen_answer', data: BLOCK_TYPES.listen_answer.defaultData() },
              { id: 'b_lines', type: 'handwriting_lines', data: BLOCK_TYPES.handwriting_lines.defaultData() },
              { id: 'b_qr', type: 'qr_code', data: BLOCK_TYPES.qr_code.defaultData() }
            ]
          }
        ]
      };

      this.listeners = [];
    }

    subscribe(callback) {
      this.listeners.push(callback);
    }

    notify() {
      this.listeners.forEach(cb => cb(this.state));
    }

    // ==========================================
    // PALETTE RESOLVER
    // ==========================================
    getPalette() {
      if (this.state.paletteId === 'custom') {
        const hex = this.state.customHex || '#C68A36';
        return {
          id: 'custom',
          name: 'Customizada',
          primary: hex,
          primaryDark: hex,
          primaryLight: '#FAF8F5',
          border: '#EAE5DC',
          badgeBg: '#F3EFEA',
          badgeText: '#1E293B',
          headerBg: `linear-gradient(135deg, ${hex}, #0A192F)`,
          dotColor: hex
        };
      }
      return this.palettes[this.state.paletteId] || this.palettes.amber;
    }

    setPalette(paletteId, customHex = null) {
      this.state.paletteId = paletteId;
      if (customHex) this.state.customHex = customHex;
      this.notify();
    }

    // ==========================================
    // DENSITY CALCULATOR (TARGET: 85%)
    // ==========================================
    calculatePageDensity(pageIndex) {
      const page = this.state.pages[pageIndex];
      if (!page || !page.blocks || page.blocks.length === 0) return 0;

      let totalWeight = 0;
      page.blocks.forEach(block => {
        const def = this.blockTypes[block.type];
        if (!def) return;

        let weight = def.defaultWeight;

        if (block.type === 'listen_read') {
          const sentences = block.data.sentences || [];
          weight = 15 + sentences.length * 8;
        } else if (block.type === 'vocab_chunks') {
          const chunks = block.data.chunks || [];
          weight = 15 + chunks.length * 7;
        } else if (block.type === 'listen_answer') {
          const questions = block.data.questions || [];
          weight = 15 + questions.length * (block.data.showLines ? 12 : 6);
        } else if (block.type === 'listen_ask') {
          const items = block.data.items || [];
          weight = 15 + items.length * (block.data.showLines ? 14 : 7);
        } else if (block.type === 'handwriting_lines') {
          weight = 8 + (block.data.lineCount || 4) * 4;
        } else if (block.type === 'explainer') {
          const text = block.data.content || '';
          weight = 12 + Math.min(40, Math.floor(text.length / 50) * 4);
        }

        totalWeight += weight;
      });

      const fontMultiplier = this.state.fontSize === '17pt' ? 1.15 : (this.state.fontSize === '16pt' ? 1.08 : 1.0);
      const density = Math.round(totalWeight * fontMultiplier);
      return Math.min(130, density);
    }

    getDensityEvaluation(density) {
      if (density >= 80 && density <= 90) {
        return {
          status: 'ideal',
          label: 'Densidade Ideal (85%)',
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/20 border-emerald-500/40',
          badge: 'bg-emerald-500 text-slate-950 font-black',
          icon: 'check-circle-2',
          tip: 'Distribuição visual e pedagógica perfeita.'
        };
      } else if (density > 90 && density <= 98) {
        return {
          status: 'high',
          label: 'Preenchimento Alto',
          color: 'text-amber-400',
          bg: 'bg-amber-500/20 border-amber-500/40',
          badge: 'bg-amber-500 text-slate-950 font-bold',
          icon: 'alert-triangle',
          tip: 'Muito próximo do limite. Verifique se não haverá quebra de página.'
        };
      } else if (density > 98) {
        return {
          status: 'overflow',
          label: 'Risco de Transbordamento',
          color: 'text-rose-400',
          bg: 'bg-rose-500/20 border-rose-500/40',
          badge: 'bg-rose-500 text-white font-bold',
          icon: 'alert-octagon',
          tip: 'Atenção: o conteúdo provavelmente vai vazar para a próxima folha. Mova um bloco para a página seguinte.'
        };
      } else if (density >= 65 && density < 80) {
        return {
          status: 'moderate',
          label: 'Preenchimento Médio',
          color: 'text-sky-400',
          bg: 'bg-sky-500/20 border-sky-500/40',
          badge: 'bg-sky-500 text-slate-950 font-bold',
          icon: 'info',
          tip: 'Abaixo da meta de 85%. Sugestão: adicione mais chunks, exercícios ou aumente a fonte.'
        };
      } else {
        return {
          status: 'low',
          label: 'Preenchimento Baixo (<65%)',
          color: 'text-slate-400',
          bg: 'bg-slate-500/20 border-slate-500/40',
          badge: 'bg-slate-500 text-white font-bold',
          icon: 'minimize-2',
          tip: 'Página quase vazia. Adicione blocos para atingir mais de 70-85% de ocupação útil.'
        };
      }
    }

    // ==========================================
    // PAGE & BLOCK OPERATIONS
    // ==========================================
    addPage() {
      const newPageNum = this.state.pages.length + 1;
      this.state.pages.push({
        id: `page_${Date.now()}`,
        number: newPageNum,
        blocks: []
      });
      this.renumberPages();
      this.notify();
      return this.state.pages.length - 1;
    }

    movePage(fromIndex, toIndex) {
      if (fromIndex < 0 || fromIndex >= this.state.pages.length) return fromIndex;
      if (toIndex < 0 || toIndex >= this.state.pages.length) return fromIndex;
      if (fromIndex === toIndex) return fromIndex;

      const [page] = this.state.pages.splice(fromIndex, 1);
      this.state.pages.splice(toIndex, 0, page);
      this.renumberPages();
      this.notify();
      return toIndex;
    }

    removePage(pageIndex) {
      if (this.state.pages.length <= 1) {
        alert("A apostila precisa ter pelo menos 1 página.");
        return;
      }
      this.state.pages.splice(pageIndex, 1);
      this.renumberPages();
      this.notify();
    }

    renumberPages() {
      this.state.pages.forEach((p, idx) => {
        p.number = idx + 1;
      });
    }

    addBlock(pageIndex, blockType) {
      const page = this.state.pages[pageIndex];
      if (!page) return;

      const def = this.blockTypes[blockType];
      if (!def) return;

      const blockData = def.defaultData();

      // Herda automaticamente o link da aula vinculada se houver
      const activeLessonUrl = this.state.linkedLessonData?.trainingUrl || this.state.playerTrackUrl;
      if (activeLessonUrl) {
        if (blockType === 'qr_code') {
          blockData.targetUrl = activeLessonUrl;
          if (this.state.linkedLessonData?.title) {
            blockData.subtitle = `Aponte a câmera para abrir o treino da aula "${this.state.linkedLessonData.title}".`;
          }
        } else {
          blockData.cornerQrUrl = activeLessonUrl;
        }
      }

      const newBlock = {
        id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        type: blockType,
        data: blockData
      };

      page.blocks.push(newBlock);
      this.notify();
      return newBlock;
    }

    applyLinkedLessonToAllQrCodes(lessonInfo) {
      if (!lessonInfo) return;
      const targetUrl = lessonInfo.trainingUrl || lessonInfo.targetUrl || 'https://agoraeufalo.com.br/player.html';
      const lessonTitle = lessonInfo.title || lessonInfo.lessonTitle || '';

      this.state.linkedLessonData = {
        courseId: lessonInfo.courseId || this.state.courseId,
        moduleId: lessonInfo.moduleId || this.state.moduleId,
        lessonId: lessonInfo.lessonId || this.state.lessonId,
        title: lessonTitle,
        trainingUrl: targetUrl
      };
      this.state.playerTrackUrl = targetUrl;

      // Atualiza TODOS os blocos de TODAS as páginas (QR Code dedicados e QR Codes de Canto)
      this.state.pages.forEach(pg => {
        (pg.blocks || []).forEach(blk => {
          if (blk.type === 'qr_code') {
            blk.data.targetUrl = targetUrl;
            if (lessonTitle) {
              blk.data.subtitle = `Aponte a câmera do celular para ouvir a lição "${lessonTitle}" e treinar a fala ativa.`;
            }
          } else {
            // QR Codes de canto presentes nos blocos pedagógicos
            blk.data.cornerQrUrl = targetUrl;
          }
        });
      });

      this.notify();
    }

    updateBlockData(pageIndex, blockId, newData) {
      const page = this.state.pages[pageIndex];
      if (!page) return;
      const block = page.blocks.find(b => b.id === blockId);
      if (block) {
        block.data = { ...block.data, ...newData };
        this.notify();
      }
    }

    removeBlock(pageIndex, blockId) {
      const page = this.state.pages[pageIndex];
      if (!page) return;
      page.blocks = page.blocks.filter(b => b.id !== blockId);
      this.notify();
    }

    moveBlock(pageIndex, blockId, direction) {
      const page = this.state.pages[pageIndex];
      if (!page) return;
      const idx = page.blocks.findIndex(b => b.id === blockId);
      if (idx === -1) return;

      if (direction === 'up' && idx > 0) {
        const temp = page.blocks[idx - 1];
        page.blocks[idx - 1] = page.blocks[idx];
        page.blocks[idx] = temp;
      } else if (direction === 'down' && idx < page.blocks.length - 1) {
        const temp = page.blocks[idx + 1];
        page.blocks[idx + 1] = page.blocks[idx];
        page.blocks[idx] = temp;
      }
      this.notify();
    }

    moveBlockToPage(fromPageIndex, blockId, toPageIndex) {
      const fromPage = this.state.pages[fromPageIndex];
      const toPage = this.state.pages[toPageIndex];
      if (!fromPage || !toPage) return;

      const idx = fromPage.blocks.findIndex(b => b.id === blockId);
      if (idx === -1) return;

      const [block] = fromPage.blocks.splice(idx, 1);
      toPage.blocks.push(block);
      this.notify();
    }

    duplicateBlock(pageIndex, blockId) {
      const page = this.state.pages[pageIndex];
      if (!page) return;
      const block = page.blocks.find(b => b.id === blockId);
      if (!block) return;

      const clone = {
        id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        type: block.type,
        data: JSON.parse(JSON.stringify(block.data))
      };

      const idx = page.blocks.findIndex(b => b.id === blockId);
      page.blocks.splice(idx + 1, 0, clone);
      this.notify();
    }

    // ==========================================
    // CANONICAL PRESETS LOADER
    // ==========================================
    loadTemplate(templateId) {
      if (templateId === 'magic_story') {
        this.state.templateType = 'magic_story';
        this.state.paletteId = 'amber';
        this.state.fontSize = '16pt';
        this.state.pages = [
          // P1: Cover Archetype 1
          {
            id: 'p1_cover',
            number: 1,
            blocks: [{
              id: 'b_ms_cov',
              type: 'cover',
              data: {
                tag: '✦ MAGIC STORIES • SÉRIE OFICIAL 2026',
                courseTitle: 'Magic Story 01',
                moduleTitle: 'Fundamentos de Conversação Real',
                lessonTitle: 'Grazi Wants to Change Her Routine',
                watermark: 'MS • 01',
                synopsis: 'Acompanhe a jornada da Grazi em busca de novos hábitos. Treine seu ouvido, ative seus reflexos de resposta e domine as conexões sonoras naturais do inglês cotidiano.',
                stats: '8 Atividades Canônicas • 14 Chunks Vivos • Treino de Reflexo LA/LRT',
                artworkUrl: 'assets/images/cover-default-aef.jpg'
              }
            }]
          },
          // P2: Listen & Read
          {
            id: 'p2_lr',
            number: 2,
            blocks: [
              { id: 'b_ms_h2', type: 'header_banner', data: { tag: '✦ Magic Stories • Treino Auditivo', courseTitle: 'MS 01 • Grazi Routine', lessonTitle: '1. Listen & Read (LR)' } },
              {
                id: 'b_ms_lr',
                type: 'listen_read',
                data: {
                  title: 'Listen & Read • Imersão Auditiva Real',
                  instruction: 'Observe muito mais PELOS OUVIDOS do que pelos olhos. Sinta a melodia natural e a cadência da frase.',
                  sentences: [
                    { speaker: 'Leo', en: 'Grazi wakes up at six in the morning every single day.', pt: '' },
                    { speaker: 'Leo', en: 'She works as an executive at a large technology company.', pt: '' },
                    { speaker: 'Leo', en: 'She is completely exhausted because she works twelve hours a day.', pt: '' },
                    { speaker: 'Leo', en: 'She wants to change her routine and live a healthier life.', pt: '' }
                  ]
                }
              },
              {
                id: 'b_ms_gold2',
                type: 'golden_tip',
                data: {
                  title: 'Sacada de Ouro do Professor Leo',
                  content: 'Escutar e ler uma única vez não funciona: o cérebro desliga os ouvidos para focar nos olhos. Repita até a escuta virar reflexo!'
                }
              }
            ]
          },
          // P3: Vocabulary Session
          {
            id: 'p3_voc',
            number: 3,
            blocks: [
              { id: 'b_ms_h3', type: 'header_banner', data: { tag: '✦ Magic Stories • Vocabulário Ativo', courseTitle: 'MS 01 • Grazi Routine', lessonTitle: '2. Vocabulary Session (VOC)' } },
              {
                id: 'b_ms_voc',
                type: 'vocab_chunks',
                data: {
                  title: 'Vocabulary Session • Matriz de Chunks Sonoros',
                  instruction: 'Vocabulário ativo é aquele que sai no piloto automático. Fixe os blocos inteiros com sua tradução falada real.',
                  chunks: [
                    { en: 'every single day', pt: 'todo santo dia', soundTag: 'Rotina' },
                    { en: 'works as an executive', pt: 'trabalha como executiva', soundTag: 'Profissão' },
                    { en: 'completely exhausted', pt: 'completamente exausta / morta', soundTag: 'Estado' },
                    { en: 'wants to change her routine', pt: 'quer mudar de rotina', soundTag: 'Desejo' }
                  ]
                }
              }
            ]
          },
          // P4: Listen & Answer
          {
            id: 'p4_la',
            number: 4,
            blocks: [
              { id: 'b_ms_h4', type: 'header_banner', data: { tag: '✦ Magic Stories • Reflexo de Fala', courseTitle: 'MS 01 • Grazi Routine', lessonTitle: '3. Listen & Answer (LA)' } },
              {
                id: 'b_ms_la',
                type: 'listen_answer',
                data: {
                  title: 'Listen & Answer • Velocidade de Resposta no Diálogo',
                  instruction: 'Responda no reflexo imediato. Sem respostas prontas para eliminar muletas visuais.',
                  questions: [
                    'What time does Grazi wake up every single day?',
                    'What does she do for a living?',
                    'Why is she completely exhausted?',
                    'What does she want to do about her routine?'
                  ],
                  showLines: true
                }
              }
            ]
          },
          // P5: Look & Retell + Listen & Ask
          {
            id: 'p5_lrt_lask',
            number: 5,
            blocks: [
              { id: 'b_ms_h5', type: 'header_banner', data: { tag: '✦ Magic Stories • Fala Ativa & Formulação', courseTitle: 'MS 01 • Grazi Routine', lessonTitle: '4. Look & Retell & 5. Listen & Ask' } },
              {
                id: 'b_ms_lrt',
                type: 'look_retell',
                data: {
                  title: 'Look & Retell • Produção Própria',
                  instruction: 'Reconte com o seu inglês de hoje. Responda oralmente no seu próprio ritmo.',
                  prompts: ['What time does Grazi wake up?', 'What does she do?', 'Why is she exhausted?'],
                  keywords: ['six in the morning', 'executive', 'exhausted', 'change routine']
                }
              },
              {
                id: 'b_ms_lask',
                type: 'listen_ask',
                data: {
                  title: 'Listen & Ask • Desafio de Perguntas',
                  instruction: 'Ouça o estímulo e formule a pergunta correspondente no reflexo.',
                  items: [
                    { statement: 'Grazi wakes up at six in the morning.', prompt: 'Pergunte a que horas ela acorda:' },
                    { statement: 'She works twelve hours a day.', prompt: 'Pergunte quantas horas ela trabalha:' }
                  ],
                  showLines: true
                }
              }
            ]
          },
          // P6: Connected Speech & Sacada de Ouro
          {
            id: 'p6_pro',
            number: 6,
            blocks: [
              { id: 'b_ms_h6', type: 'header_banner', data: { tag: '✦ Magic Stories • Musicalidade & Fechamento', courseTitle: 'MS 01 • Grazi Routine', lessonTitle: '6. Connected Speech & Sacada Final' } },
              {
                id: 'b_ms_conn',
                type: 'connected_speech',
                data: {
                  title: 'Pronunciation & Connected Speech • Ritmo Mecânico',
                  instruction: 'Treine a musculatura da boca e as ligações sonoras em destaque.',
                  content: 'Grazi <span class="linking">wakes_up_at</span> six in the morning. She works <span class="linking">as_an</span> executive.',
                  tips: [
                    'wakes up at ➔ pronuncia-se /weɪk-sʌ-pæt/ conectado sem trancos',
                    'as an ➔ o /z/ conecta direto na vogal /æ/'
                  ]
                }
              },
              {
                id: 'b_ms_gold_fin',
                type: 'golden_tip',
                data: {
                  title: 'Sacada de Ouro do Professor Leo',
                  content: 'Inglês não se decora em regras gramaticais: inglês se assimila repetindo a melodia da história até a fala fluir sem tradução mental!'
                }
              },
              { id: 'b_ms_qr', type: 'qr_code', data: { title: 'Toque o Áudio Desta Aula no Celular', subtitle: 'Aponte a câmera para treinar a pronúncia desta lição no Training Player.', targetUrl: 'https://agoraeufalo.com.br/player.html?course=ms-legacy&lesson=ms001' } }
            ]
          }
        ];
      } else if (templateId === 'quick_course') {
        this.state.templateType = 'quick_course';
        this.state.paletteId = 'cobalt';
        this.state.fontSize = '15pt';
        this.state.pages = [
          {
            id: 'p1_quick',
            number: 1,
            blocks: [
              { id: 'b_q_h', type: 'header_banner', data: { tag: '✦ English QuickStart • Guia de Estrutura', courseTitle: 'English QuickStart', lessonTitle: 'Aula 1.2 • O Rei dos Verbos (To Be)' } },
              { id: 'b_q_exp', type: 'explainer', data: { title: 'Conceito Central da Aula', content: 'O verbo To Be (am, is, are / was, were) expressa identidade, estado e presença. Em inglês, toda frase precisa obrigatoriamente de um sujeito explícito!' } },
              { id: 'b_q_voc', type: 'vocab_chunks', data: BLOCK_TYPES.vocab_chunks.defaultData() },
              { id: 'b_q_gold', type: 'golden_tip', data: BLOCK_TYPES.golden_tip.defaultData() }
            ]
          },
          {
            id: 'p2_quick',
            number: 2,
            blocks: [
              { id: 'b_q_la', type: 'listen_answer', data: BLOCK_TYPES.listen_answer.defaultData() },
              { id: 'b_q_lines', type: 'handwriting_lines', data: { title: 'Anotações & Exemplos Pessoais', lineCount: 5 } },
              { id: 'b_q_qr', type: 'qr_code', data: { title: 'Treine a Fala Ativa no Celular', subtitle: 'Aponte a câmera para abrir o Training Player diretamente nesta lição.', targetUrl: 'https://agoraeufalo.com.br/player.html?course=english-quickstart&lesson=eqs12' } }
            ]
          }
        ];
      }
      this.renumberPages();
      this.notify();
    }

    // ==========================================
    // LEGACY PDF & TEXT HEURISTIC PARSER
    // ==========================================
    parseRawTextToBlocks(rawText) {
      const text = (rawText || '').trim();
      if (!text) return;

      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      const parsedBlocks = [];

      let currentMode = 'general';
      let currentLines = [];
      let extractedTitle = '';
      let extractedSubtitle = '';
      let lrSentencesMaster = [];

      const flushCurrent = () => {
        if (currentLines.length === 0) return;

        if (currentMode === 'lr') {
          // Extração e organização inteligente de parágrafos contextuais da história
          const rawSentences = currentLines.map(l => {
            // Só considera locutor se começar com letra, tiver apenas caracteres alfabéticos/espaços (ex: 'Leo:', 'Grazi:', 'Attendant:')
            // e NÃO for horário ou número (ex: '7:30', '08:00', '1:')
            const speakerMatch = l.match(/^([A-Za-zÀ-ÿ\s]{2,15}):\s+(.*)$/);
            if (speakerMatch) {
              return { speaker: speakerMatch[1].trim(), en: speakerMatch[2].trim() };
            }
            return { speaker: '', en: l };
          });

          // Armazena as sentenças de LR para que o bloco PRO possa repeti-las fielmente
          lrSentencesMaster = rawSentences.map(s => (s.speaker ? `${s.speaker}: ${s.en}` : s.en));

          // Agrupamento Inteligente em Parágrafos (Mudança de tema, falas isoladas e quebra de fluxo)
          const paragraphs = [];
          let currentPara = [];

          rawSentences.forEach((s, idx) => {
            const text = s.en;
            const isDialogue = !!s.speaker;
            const startsNewContext = /^(every day|then,|in the evening|in the morning|at night|meanwhile|suddenly|the question is:|one day|on monday|after that)/i.test(text);

            if (isDialogue) {
              // Diálogo/fala fica isolada em parágrafo próprio
              if (currentPara.length > 0) {
                paragraphs.push(currentPara);
                currentPara = [];
              }
              paragraphs.push([s]);
            } else if (startsNewContext && currentPara.length > 0) {
              paragraphs.push(currentPara);
              currentPara = [s];
            } else {
              currentPara.push(s);
              // Limite confortável de 3 a 4 frases por parágrafo
              if (currentPara.length >= 4) {
                paragraphs.push(currentPara);
                currentPara = [];
              }
            }
          });
          if (currentPara.length > 0) paragraphs.push(currentPara);

          // Paginação inteligente de LR: se tiver até 15 frases, cabe perfeitamente em 1 folha A4 com fonte confortável
          const totalSentencesCount = rawSentences.length;
          const CHUNK_SIZE_LR = 15;

          if (totalSentencesCount <= CHUNK_SIZE_LR) {
            parsedBlocks.push({
              id: `b_lr_${Date.now()}_${Math.random().toString(36).substr(2, 3)}`,
              type: 'listen_read',
              data: {
                title: 'Listen & Read • Imersão Auditiva Real',
                instruction: 'Observe pelos ouvidos. Sinta a cadência natural e o fluxo da história.',
                paragraphs,
                sentences: rawSentences,
                forceNewPage: true
              }
            });
          } else {
            // Divide os parágrafos em partes equilibradas para páginas separadas
            let runningCount = 0;
            let currentPartParas = [];
            let partIndex = 1;

            paragraphs.forEach(para => {
              currentPartParas.push(para);
              runningCount += para.length;

              if (runningCount >= CHUNK_SIZE_LR) {
                parsedBlocks.push({
                  id: `b_lr_${Date.now()}_${partIndex}_${Math.random().toString(36).substr(2, 3)}`,
                  type: 'listen_read',
                  data: {
                    title: `Listen & Read • Imersão Auditiva Real (Parte ${partIndex})`,
                    instruction: 'Observe pelos ouvidos. Sinta a cadência natural e o fluxo da história.',
                    paragraphs: currentPartParas,
                    sentences: currentPartParas.flat(),
                    forceNewPage: true
                  }
                });
                partIndex++;
                currentPartParas = [];
                runningCount = 0;
              }
            });

            if (currentPartParas.length > 0) {
              parsedBlocks.push({
                id: `b_lr_${Date.now()}_${partIndex}_${Math.random().toString(36).substr(2, 3)}`,
                type: 'listen_read',
                data: {
                  title: `Listen & Read • Imersão Auditiva Real (Parte ${partIndex})`,
                  instruction: 'Observe pelos ouvidos. Sinta a cadência natural e o fluxo da história.',
                  paragraphs: currentPartParas,
                  sentences: currentPartParas.flat(),
                  forceNewPage: true
                }
              });
            }
          }
        } else if (currentMode === 'chunks') {
          const rawChunks = currentLines.map(l => {
            if (l.includes('->') || l.includes(' - ') || l.includes('=')) {
              const parts = l.split(/->|-|=/);
              return { en: parts[0].trim(), pt: (parts[1] || '').trim(), soundTag: 'Chunk' };
            }
            return { en: l, pt: '', soundTag: 'Expressão' };
          }).filter(c => c.en.length > 0);

          // Grid de 2 colunas acomoda até 16 chunks por página de forma densa e elegante
          const CHUNK_SIZE_VOC = 16;
          for (let i = 0; i < rawChunks.length; i += CHUNK_SIZE_VOC) {
            const chunkItems = rawChunks.slice(i, i + CHUNK_SIZE_VOC);
            const partNum = Math.floor(i / CHUNK_SIZE_VOC) + 1;
            const totalParts = Math.ceil(rawChunks.length / CHUNK_SIZE_VOC);
            const partSuffix = totalParts > 1 ? ` (Parte ${partNum} de ${totalParts})` : '';

            parsedBlocks.push({
              id: `b_voc_${Date.now()}_${partNum}_${Math.random().toString(36).substr(2, 3)}`,
              type: 'vocab_chunks',
              data: {
                title: `Vocabulary Session • Chunks Sonoros${partSuffix}`,
                instruction: 'Fixe os blocos inteiros com sua tradução falada real.',
                chunks: chunkItems,
                forceNewPage: true
              }
            });
          }
        } else if (currentMode === 'la') {
          const rawQuestions = currentLines.map(l => l.replace(/^[0-9]+[\.\)\-]\s*/, '')).filter(Boolean);
          // Máximo de 10 perguntas por bloco/folha para densidade visual perfeita
          const CHUNK_SIZE = 10;
          for (let i = 0; i < rawQuestions.length; i += CHUNK_SIZE) {
            const chunkQuestions = rawQuestions.slice(i, i + CHUNK_SIZE);
            const partNum = Math.floor(i / CHUNK_SIZE) + 1;
            const totalParts = Math.ceil(rawQuestions.length / CHUNK_SIZE);
            const partSuffix = totalParts > 1 ? ` (Parte ${partNum} de ${totalParts})` : '';

            parsedBlocks.push({
              id: `b_la_${Date.now()}_${partNum}_${Math.random().toString(36).substr(2, 3)}`,
              type: 'listen_answer',
              data: {
                title: `Listen & Answer • Velocidade de Resposta${partSuffix}`,
                instruction: 'Responda no reflexo imediato. Sem respostas prontas: use as linhas para fixação manual.',
                questions: chunkQuestions,
                showLines: true,
                forceNewPage: true
              }
            });
          }
        } else if (currentMode === 'lrt') {
          const rawPrompts = [];
          const rawKeywords = [];

          currentLines.forEach(l => {
            const lowerL = l.toLowerCase();
            if (lowerL.startsWith('keywords:') || lowerL.startsWith('palavras-chave:')) {
              const kwText = l.replace(/^(keywords|palavras-chave):\s*/i, '');
              rawKeywords.push(...kwText.split(',').map(s => s.trim()).filter(Boolean));
            } else {
              const cleaned = l.replace(/^[0-9]+[\.\)\-]\s*/, '').trim();
              if (cleaned) rawPrompts.push(cleaned);
            }
          });

          // Máximo de 10 prompts por bloco/folha
          const CHUNK_SIZE = 10;
          for (let i = 0; i < (rawPrompts.length || 1); i += CHUNK_SIZE) {
            const chunkPrompts = rawPrompts.slice(i, i + CHUNK_SIZE);
            const partNum = Math.floor(i / CHUNK_SIZE) + 1;
            const totalParts = Math.ceil((rawPrompts.length || 1) / CHUNK_SIZE);
            const partSuffix = totalParts > 1 ? ` (Parte ${partNum} de ${totalParts})` : '';

            parsedBlocks.push({
              id: `b_lrt_${Date.now()}_${partNum}_${Math.random().toString(36).substr(2, 3)}`,
              type: 'look_retell',
              data: {
                title: `Look & Retell + AI Coach • Produção Própria${partSuffix}`,
                instruction: 'Reconte a história com o seu inglês de hoje. Use as perguntas-guia como mapa mental de fala.',
                prompts: chunkPrompts,
                keywords: rawKeywords,
                forceNewPage: true
              }
            });
          }
        } else if (currentMode === 'lask') {
          const rawItems = currentLines.map(l => {
            if (l.includes('->') || l.includes(' - ')) {
              const parts = l.split(/->| - /);
              return { statement: parts[0].trim(), prompt: (parts[1] || '').trim() };
            }
            return { statement: l, prompt: 'Pergunte no reflexo:' };
          }).filter(it => it.statement.length > 0);

          // Máximo de 10 estímulos por bloco/folha
          const CHUNK_SIZE = 10;
          for (let i = 0; i < rawItems.length; i += CHUNK_SIZE) {
            const chunkItems = rawItems.slice(i, i + CHUNK_SIZE);
            const partNum = Math.floor(i / CHUNK_SIZE) + 1;
            const totalParts = Math.ceil(rawItems.length / CHUNK_SIZE);
            const partSuffix = totalParts > 1 ? ` (Parte ${partNum} de ${totalParts})` : '';

            parsedBlocks.push({
              id: `b_lask_${Date.now()}_${partNum}_${Math.random().toString(36).substr(2, 3)}`,
              type: 'listen_ask',
              data: {
                title: `Listen & Ask • Desafio de Perguntas${partSuffix}`,
                instruction: 'Ao ouvir o estímulo afirmativo ou negativo, formule de imediato a pergunta correspondente.',
                items: chunkItems,
                showLines: true,
                forceNewPage: true
              }
            });
          }
        } else if (currentMode === 'pro') {
          const tips = [];
          const contentLines = [];
          currentLines.forEach(l => {
            if (l.includes('➔') || l.includes('->')) {
              tips.push(l);
            } else {
              contentLines.push(l);
            }
          });

          // Regra Canônica: O bloco PRO deve repetir as frases do LR (uma frase abaixo da outra),
          // respeitando o limite de até 10 frases por folha
          const baseSentences = (lrSentencesMaster && lrSentencesMaster.length > 0)
            ? lrSentencesMaster
            : (contentLines.length > 0 ? contentLines : ['Pratique a pronúncia das frases da história.']);

          const CHUNK_SIZE_PRO = 10;
          for (let i = 0; i < baseSentences.length; i += CHUNK_SIZE_PRO) {
            const chunkSentences = baseSentences.slice(i, i + CHUNK_SIZE_PRO);
            const partNum = Math.floor(i / CHUNK_SIZE_PRO) + 1;
            const totalParts = Math.ceil(baseSentences.length / CHUNK_SIZE_PRO);
            const partSuffix = totalParts > 1 ? ` (Parte ${partNum} de ${totalParts})` : '';

            parsedBlocks.push({
              id: `b_pro_${Date.now()}_${partNum}_${Math.random().toString(36).substr(2, 3)}`,
              type: 'connected_speech',
              data: {
                title: `Pronunciation & Connected Speech • Ritmo Mecânico${partSuffix}`,
                instruction: 'Treine as conexões sonoras naturais e reduções da fala da vida real. Repita em voz alta.',
                sentences: chunkSentences,
                content: chunkSentences.join('\n'),
                tips: (i === 0 && tips.length > 0) ? tips : (tips.length > 0 ? tips.slice(0, 3) : [
                  'Fale no mesmo andamento da gravação.',
                  'Conecte o som final da consoante com a vogal seguinte.'
                ]),
                forceNewPage: true
              }
            });
          }
        } else if (currentMode === 'gold') {
          parsedBlocks.push({
            id: `b_gold_${Date.now()}_${Math.random().toString(36).substr(2, 3)}`,
            type: 'golden_tip',
            data: {
              title: 'Sacada de Ouro do Professor Leo',
              content: currentLines.join(' '),
              forceNewPage: false
            }
          });
        } else {
          // Se for linha de título/subtítulo solta no texto
          const joined = currentLines.join(' ');
          if (!joined.toLowerCase().startsWith('titulo:') && !joined.toLowerCase().startsWith('subtitulo:')) {
            parsedBlocks.push({
              id: `b_exp_${Date.now()}_${Math.random().toString(36).substr(2, 3)}`,
              type: 'explainer',
              data: {
                title: 'Conceito & Roteiro da Aula',
                content: currentLines.join('\n\n')
              }
            });
          }
        }
        currentLines = [];
      };

      lines.forEach(rawLine => {
        const line = rawLine.trim();
        if (!line) return;
        
        // Ignora imagens e links brutos do drive que não devem virar texto pedagógico
        if (line.startsWith('![') || line.startsWith('[Movie') || line.startsWith('[Video') || line.startsWith('[7_Pronunciation') || line.startsWith('[Podcast')) {
          return;
        }

        const lower = line.toLowerCase().replace(/^[#\*\-]+\s*/, '');

        if (lower.startsWith('titulo:') || lower.startsWith('title:')) {
          flushCurrent();
          extractedTitle = line.replace(/^[#\*\-\s]*(titulo|title):\s*/i, '').trim();
          this.state.title = extractedTitle;
          return;
        } else if (lower.startsWith('subtitulo:') || lower.startsWith('subtitle:')) {
          flushCurrent();
          extractedSubtitle = line.replace(/^[#\*\-\s]*(subtitulo|subtitle):\s*/i, '').trim();
          this.state.subtitle = extractedSubtitle;
          return;
        }

        if (lower.startsWith('section 1') || lower.startsWith('listen & read') || lower.startsWith('listen and read') || lower.startsWith('história') || lower.startsWith('story:')) {
          flushCurrent();
          currentMode = 'lr';
        } else if (lower.startsWith('section 2') || lower.startsWith('vocabulary') || lower.startsWith('chunks:') || lower.startsWith('vocabulário:')) {
          flushCurrent();
          currentMode = 'chunks';
        } else if (lower.startsWith('section 3') || lower.startsWith('listen & answer') || lower.startsWith('listen and answer') || lower.startsWith('perguntas:') || lower.startsWith('questions:')) {
          flushCurrent();
          currentMode = 'la';
        } else if (lower.startsWith('section 4') || lower.startsWith('look & retell') || lower.startsWith('look and retell') || lower.startsWith('reconto')) {
          flushCurrent();
          currentMode = 'lrt';
        } else if (lower.startsWith('section 5') || lower.startsWith('listen & ask') || lower.startsWith('listen and ask') || lower.startsWith('desafio de perguntas')) {
          flushCurrent();
          currentMode = 'lask';
        } else if (lower.startsWith('section 6') || lower.startsWith('pronúncia') || lower.startsWith('pronunciation') || lower.startsWith('connected speech') || lower.startsWith('dicas fonéticas:')) {
          flushCurrent();
          currentMode = 'pro';
        } else if (lower.startsWith('sacada de ouro') || lower.startsWith('golden tip')) {
          flushCurrent();
          currentMode = 'gold';
        } else {
          // Se for linha de tabela Markdown (| Chunks | Desc | Tradução |)
          if (line.startsWith('|') && line.endsWith('|')) {
            const parts = line.split('|').map(p => p.trim()).filter(Boolean);
            if (parts.length >= 2 && !parts[0].includes('---') && !parts[0].toLowerCase().includes('phrases') && !parts[0].toLowerCase().includes('question')) {
              if (currentMode === 'chunks') {
                const en = parts[0].replace(/\*/g, '');
                const pt = (parts[parts.length - 1] || '').replace(/\*/g, '');
                currentLines.push(`${en} - ${pt}`);
                return;
              } else if (currentMode === 'la') {
                const q = parts[0].replace(/\*/g, '');
                if (q.length > 3) currentLines.push(q);
                return;
              }
            } else {
              return;
            }
          }
          currentLines.push(line);
        }
      });
      flushCurrent();

      this.distributeBlocksIntoPages(parsedBlocks, extractedTitle, extractedSubtitle);
      this.notify();
    }

    distributeBlocksIntoPages(blocksList, customTitle = '', customSubtitle = '') {
      const pages = [];
      const title = customTitle || this.state.title || 'Apostila Oficial';
      const subtitle = customSubtitle || this.state.subtitle || 'Material Didático de Apoio';

      // PÁGINA 1: Capa Oficial Deep Navy (Arquétipo 1)
      const msMatch = title.match(/MS\s*0*(\d+)/i);
      const watermarkText = msMatch ? `MS • ${msMatch[1].padStart(2, '0')}` : 'AEF • 2026';

      pages.push({
        id: 'page_1',
        number: 1,
        blocks: [{
          id: 'b_cov_auto',
          type: 'cover',
          data: {
            tag: '✦ MAGIC STORIES • SÉRIE OFICIAL 2026',
            courseTitle: subtitle || 'Magic Stories Legacy • Acervo Clássico',
            moduleTitle: '', // Limpo para não embolar na mesma linha do curso
            lessonTitle: title, // O TÍTULO REAL DA AULA É O H1 MONUMENTAL!
            watermark: watermarkText,
            synopsis: `Material oficial de acompanhamento e fixação mecânica da lição ${title}. Listen & Read, Chunks Vivos, Bate-pronto de Perguntas e Conexões Sonoras.`,
            stats: 'Treino Completo de 6 Atividades • Método AgoraEuFalo',
            artworkUrl: 'assets/images/cover-default-aef.jpg'
          }
        }]
      });

      // PÁGINAS SEGUINTES: Distribuição inteligente com cabeçalho sincronizado
      let currentPage = {
        id: `page_2`,
        number: 2,
        blocks: [
          { id: 'b_hdr_auto_2', type: 'header_banner', data: { tag: '✦ AgoraEuFalo • Treino Prático', courseTitle: subtitle, lessonTitle: title } }
        ]
      };

      let currentWeight = 18;

      blocksList.forEach(block => {
        const def = this.blockTypes[block.type];
        const weight = def ? def.defaultWeight : 30;
        const wantsNewPage = block.data && block.data.forceNewPage && currentPage.blocks.length > 1;

        if (wantsNewPage || (currentWeight + weight > 90)) {
          pages.push(currentPage);
          currentPage = {
            id: `page_${pages.length + 1}`,
            number: pages.length + 1,
            blocks: [
              { id: `b_hdr_auto_${pages.length + 1}`, type: 'header_banner', data: { tag: '✦ AgoraEuFalo • Treino Prático', courseTitle: subtitle, lessonTitle: title } }
            ]
          };
          currentWeight = 18;
        }

        currentPage.blocks.push(block);
        currentWeight += weight;
      });

      pages.push(currentPage);
      this.state.pages = pages;
      this.renumberPages();
    }

    // ==========================================
    // CLOUD VAULT: FIRESTORE & LOCALSTORAGE
    // ==========================================
    async saveToCloudVault(projectName, status = 'testing', notes = '') {
      const recipeId = this.state.activeRecipeId || `recipe_${Date.now()}`;
      const payload = {
        id: recipeId,
        title: projectName || this.state.title || 'Apostila Sem Título',
        subtitle: this.state.subtitle || '',
        templateType: this.state.templateType || 'generic',
        courseId: this.state.courseId || '',
        moduleId: this.state.moduleId || '',
        lessonId: this.state.lessonId || '',
        linkedLessonData: this.state.linkedLessonData || null,
        playerTrackUrl: this.state.playerTrackUrl || '',
        paletteId: this.state.paletteId || 'amber',
        customHex: this.state.customHex || '#C68A36',
        fontSize: this.state.fontSize || '15pt',
        showFooter: this.state.showFooter !== false,
        status: status,
        notes: notes,
        pageCount: this.state.pages.length,
        pages: this.state.pages,
        updatedAt: new Date().toISOString(),
        createdAt: this.state.createdAt || new Date().toISOString(),
        author: 'Professor Leonardo Leite'
      };

      try {
        const localVault = JSON.parse(localStorage.getItem('aef_pdf_vault') || '{}');
        localVault[recipeId] = payload;
        localStorage.setItem('aef_pdf_vault', JSON.stringify(localVault));
      } catch (e) {
        console.warn("Erro ao salvar no LocalStorage:", e);
      }

      if (window.aefCloudSync) {
        try {
          await window.aefCloudSync.init();
          if (window.aefCloudSync.db) {
            await window.aefCloudSync.db.collection('pdf_recipes').doc(recipeId).set(payload, { merge: true });
          }
        } catch (err) {
          console.warn("Aviso Firestore Sync:", err);
        }
      }

      this.state.activeRecipeId = recipeId;
      this.state.status = status;
      this.notify();
      return payload;
    }

    async fetchCloudVaultRecipes() {
      const recipes = [];
      const seenIds = new Set();

      if (window.aefCloudSync) {
        try {
          await window.aefCloudSync.init();
          if (window.aefCloudSync.db) {
            const snap = await window.aefCloudSync.db.collection('pdf_recipes').orderBy('updatedAt', 'desc').get();
            snap.forEach(doc => {
              const data = doc.data();
              recipes.push(data);
              seenIds.add(data.id);
            });
          }
        } catch (err) {
          console.warn("Aviso ao buscar do Firestore:", err);
        }
      }

      try {
        const localVault = JSON.parse(localStorage.getItem('aef_pdf_vault') || '{}');
        Object.keys(localVault).forEach(id => {
          if (!seenIds.has(id)) {
            recipes.push(localVault[id]);
          }
        });
      } catch (e) {}

      recipes.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
      return recipes;
    }

    loadRecipe(recipeData) {
      if (!recipeData || !recipeData.pages) return;
      
      const loadedPages = JSON.parse(JSON.stringify(recipeData.pages));
      const loadedTitle = (recipeData.title || '').toLowerCase();
      
      // Auto-higienização: se a receita salva tiver um QR code com o link antigo do eqs12, mas a apostila for de outro módulo (ex: MS005), corrige
      loadedPages.forEach(pg => {
        (pg.blocks || []).forEach(blk => {
          if (blk.type === 'qr_code') {
            const currentUrl = blk.data?.targetUrl || '';
            if (currentUrl.includes('course=english-quickstart&lesson=eqs12') && !loadedTitle.includes('quickstart') && !loadedTitle.includes('eqs')) {
              // Se for um módulo Magic Stories (ex: MS005)
              const msMatch = (recipeData.title || '').match(/MS\s*0*(\d+)/i);
              if (msMatch) {
                const msNum = msMatch[1].padStart(3, '0');
                blk.data.targetUrl = `https://agoraeufalo.com.br/player.html?trackId=ms_ms${msNum}`;
              } else {
                blk.data.targetUrl = 'https://agoraeufalo.com.br/player.html';
              }
            }
          }
        });
      });

      this.state = {
        activeRecipeId: recipeData.id,
        title: recipeData.title || 'Apostila',
        subtitle: recipeData.subtitle || '',
        courseId: recipeData.courseId || (recipeData.templateType === 'magic_story' ? 'ms-legacy' : 'generic'),
        moduleId: recipeData.moduleId || '',
        lessonId: recipeData.lessonId || '',
        linkedLessonData: recipeData.linkedLessonData || null,
        playerTrackUrl: recipeData.playerTrackUrl || '',
        paletteId: recipeData.paletteId || 'amber',
        customHex: recipeData.customHex || '#C68A36',
        fontSize: recipeData.fontSize || '15pt',
        showFooter: recipeData.showFooter !== false,
        templateType: recipeData.templateType || 'generic',
        status: recipeData.status || 'testing',
        pages: loadedPages
      };
      if (recipeData.linkedLessonData) {
        this.applyLinkedLessonToAllQrCodes(recipeData.linkedLessonData);
      }
      this.renumberPages();
      this.notify();
    }

    async deleteCloudRecipe(recipeId) {
      try {
        const localVault = JSON.parse(localStorage.getItem('aef_pdf_vault') || '{}');
        delete localVault[recipeId];
        localStorage.setItem('aef_pdf_vault', JSON.stringify(localVault));
      } catch (e) {}

      if (window.aefCloudSync) {
        try {
          await window.aefCloudSync.init();
          if (window.aefCloudSync.db) {
            await window.aefCloudSync.db.collection('pdf_recipes').doc(recipeId).delete();
          }
        } catch (err) {
          console.warn("Erro ao deletar no Firestore:", err);
        }
      }

      if (this.state.activeRecipeId === recipeId) {
        this.state.activeRecipeId = null;
      }
      this.notify();
    }

    // ==========================================
    // HTML RENDERING ENGINE (A4 PRINT & CANVAS)
    // ==========================================
    generateCompleteHtml(forPrint = false) {
      const pal = this.getPalette();
      const fontSize = this.state.fontSize || '15pt';

      const renderCornerQr = (d) => {
        if (!d || !d.showCornerQr) return '';
        const url = d.cornerQrUrl || this.state.linkedLessonData?.trainingUrl || this.state.playerTrackUrl || 'https://agoraeufalo.com.br/player.html';
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(url)}&margin=1&color=0A192F`;
        return `
          <div class="block-corner-qr" style="position:absolute; top:8px; right:8px; z-index:5; text-align:center; background:#FFFFFF; padding:3px; border-radius:6px; border:1px solid rgba(0,0,0,0.1); box-shadow:0 1px 3px rgba(0,0,0,0.06);">
            <a href="${url}" target="_blank" style="display:block; text-decoration:none;">
              <img src="${qrUrl}" alt="QR" width="48" height="48" style="display:block; border-radius:3px;" crossorigin="anonymous">
              <span style="display:block; font-size:5.5pt; font-weight:800; color:#0A192F; margin-top:2px; text-transform:uppercase; letter-spacing:0.3px;">Áudio / Treino</span>
            </a>
          </div>
        `;
      };

      const renderBlock = (block) => {
        const d = block.data || {};
        const pal = this.palettes[this.state.paletteId] || this.palettes.amber;
        const cornerQrHtml = renderCornerQr(d);

        switch (block.type) {
          case 'cover':
            return `
              <div class="aef-cover-archetype">
                <div class="cover-watermark">${d.watermark || '01/02'}</div>
                <div>
                  <div class="cover-tag">${d.tag || '✦ MAGIC STORIES • SÉRIE OFICIAL 2026'}</div>
                  ${d.courseTitle ? `<div class="cover-course">${d.courseTitle}</div>` : ''}
                  <h1 class="cover-lesson-title">${d.lessonTitle || 'Título da Aula'}</h1>
                </div>
                <div class="cover-card">
                  <div class="cover-synopsis-label">SINOPSE PEDAGÓGICA & TREINO DE FALA:</div>
                  <div class="cover-synopsis-text">${d.synopsis || 'Sinopse não cadastrada.'}</div>
                  <div class="cover-stats">${d.stats || 'Apostila Oficial de Treino Prático • AgoraEuFalo'}</div>
                </div>
                <div class="cover-footer">✦ AgoraEuFalo • Professor Leonardo Leite • selexenglish@gmail.com</div>
              </div>
            `;

          case 'header_banner':
            return `
              <div class="aef-header-banner" style="background:none; border-bottom:2px solid ${pal.primary}; border-radius:0; padding:0 0 8px 0; margin-bottom:12px; display:flex; justify-content:space-between; align-items:flex-end;">
                <div>
                  <div class="hdr-tag" style="color:${pal.primary}; font-size:7.5pt; font-weight:900; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:2px;">${d.tag || '✦ AGORAEUFALO • TREINO PRÁTICO'}</div>
                  <div class="hdr-title" style="font-size:12pt; font-weight:800; color:#0F172A; margin:0;">${d.lessonTitle || ''} <span style="font-weight:400; color:#64748B; font-size:10pt;">${d.courseTitle ? `• ${d.courseTitle}` : ''}</span></div>
                </div>
                ${cornerQrHtml}
              </div>
            `;

          case 'listen_read':
            let lrBodyHtml = '';
            if (d.paragraphs && d.paragraphs.length > 0) {
              lrBodyHtml = d.paragraphs.map(para => {
                const paraSentences = para.map(s => {
                  const speaker = s.speaker ? `<span class="speaker-tag" style="color:${pal.primary}; font-weight:800;">${s.speaker}:</span> ` : '';
                  return `${speaker}${s.en || s}`;
                }).join(' ');
                return `<p class="lr-paragraph" style="margin-bottom:12px; line-height:1.65; font-size:1.05em; color:#0F172A;">${paraSentences}</p>`;
              }).join('');
            } else {
              lrBodyHtml = (d.sentences || []).map(s => {
                const speaker = s.speaker ? `<span class="speaker-tag" style="color:${pal.primary}; font-weight:800;">${s.speaker}:</span> ` : '';
                return `<div class="lr-sentence" style="margin-bottom:8px; line-height:1.5;">${speaker}${s.en || s}</div>`;
              }).join('');
            }
            return `
              <div class="aef-box lr-box" style="border-left-color:${pal.primary}; position:relative;">
                ${cornerQrHtml}
                <div class="box-title" style="color:${pal.primary};">
                  <span>🎧 ${d.title || 'Listen & Read'}</span>
                </div>
                ${d.instruction ? `<div class="box-instruction">${d.instruction}</div>` : ''}
                <div class="lr-content" style="padding-top:4px;">${lrBodyHtml}</div>
              </div>
            `;

          case 'vocab_chunks':
            const cList = (d.chunks || []).map(c => `
              <div class="chunk-card" style="background:#FFFFFF; border:1px solid #EAE5DC; border-radius:8px; padding:7px 10px; display:flex; flex-direction:column; justify-content:center;">
                <div class="chunk-en" style="font-weight:800; color:#0A192F; font-size:1.02em; line-height:1.25;">${c.en || c}</div>
                ${c.pt ? `<div class="chunk-pt" style="color:${pal.primary}; font-size:9pt; font-style:italic; font-weight:600; margin-top:3px; line-height:1.2;">➔ ${c.pt}</div>` : ''}
              </div>
            `).join('');
            return `
              <div class="aef-box vocab-box" style="border-left-color:${pal.primary}; position:relative;">
                ${cornerQrHtml}
                <div class="box-title" style="color:${pal.primary};">
                  <span>📖 ${d.title || 'Vocabulary Session'}</span>
                </div>
                ${d.instruction ? `<div class="box-instruction">${d.instruction}</div>` : ''}
                <div class="chunks-grid" style="display:grid; grid-template-columns:repeat(2, 1fr); gap:8px;">${cList}</div>
              </div>
            `;

          case 'listen_answer':
            const qList = (d.questions || []).map((q, i) => `
              <div class="la-question-item">
                <div class="la-question-text"><span class="q-num">${i + 1}.</span> ${q}</div>
                ${d.showLines ? `
                  <div class="handwriting-line" style="border-color:${pal.dotColor};"></div>
                  <div class="handwriting-line secondary" style="border-color:#EAE5DC;"></div>
                ` : ''}
              </div>
            `).join('');
            return `
              <div class="aef-box la-box" style="border-left-color:${pal.primary}; position:relative;">
                ${cornerQrHtml}
                <div class="box-title" style="color:${pal.primary};">
                  <span>⚡ ${d.title || 'Listen & Answer'}</span>
                </div>
                ${d.instruction ? `<div class="box-instruction">${d.instruction}</div>` : ''}
                <div class="la-list">${qList}</div>
              </div>
            `;

          case 'look_retell':
            const pList = (d.prompts || []).map((p, i) => `<li><span class="prompt-num" style="font-weight:700; color:${pal.primary};">${i + 1}.</span> ${p}</li>`).join('');
            const kwList = (d.keywords || []).map(k => `<span class="kw-badge">${k}</span>`).join('');
            return `
              <div class="aef-box lrt-box" style="border-left-color:${pal.primary}; position:relative;">
                ${cornerQrHtml}
                <div class="box-title" style="color:${pal.primary};">
                  <span>🎙️ ${d.title || 'Look & Retell + AI Coach'}</span>
                </div>
                ${d.instruction ? `<div class="box-instruction">${d.instruction}</div>` : ''}
                <ul class="lrt-prompts" style="list-style:none; padding-left:0;">${pList}</ul>
                ${(d.keywords || []).length > 0 ? `
                  <div class="lrt-kw-box">
                    <span class="kw-label">Keywords / Palavras-Chave:</span>
                    <div class="kw-container">${kwList}</div>
                  </div>
                ` : ''}
              </div>
            `;

          case 'listen_ask':
            const askList = (d.items || []).map((item, i) => `
              <div class="lask-item">
                <div class="lask-statement"><b>${i + 1}. Estímulo:</b> "${item.statement}"</div>
                <div class="lask-prompt">${item.prompt}</div>
                ${d.showLines ? `
                  <div class="handwriting-line" style="border-color:${pal.dotColor};"></div>
                ` : ''}
              </div>
            `).join('');
            return `
              <div class="aef-box lask-box" style="border-left-color:${pal.primary}; position:relative;">
                ${cornerQrHtml}
                <div class="box-title" style="color:${pal.primary};">
                  <span>❓ ${d.title || 'Listen & Ask'}</span>
                </div>
                ${d.instruction ? `<div class="box-instruction">${d.instruction}</div>` : ''}
                <div class="lask-list">${askList}</div>
              </div>
            `;

          case 'connected_speech':
            const tList = (d.tips || []).map(t => `<li>${t}</li>`).join('');
            let proSentencesHtml = '';
            if (d.sentences && d.sentences.length > 0) {
              proSentencesHtml = d.sentences.map((sent, i) => `
                <div class="pro-sentence-item" style="padding:6px 0; border-bottom:1px dashed #E2E8F0; font-size:1em; font-weight:600; color:#0F172A; display:flex; gap:8px;">
                  <span style="color:${pal.primary}; font-weight:800; min-width:20px;">${i + 1}.</span>
                  <span>${sent}</span>
                </div>
              `).join('');
            } else if (d.content) {
              proSentencesHtml = `<div class="conn-text-box">${d.content}</div>`;
            }

            return `
              <div class="aef-box conn-box" style="border-left-color:${pal.primary}; position:relative;">
                ${cornerQrHtml}
                <div class="box-title" style="color:${pal.primary};">
                  <span>🎵 ${d.title || 'Connected Speech & Pronúncia'}</span>
                </div>
                ${d.instruction ? `<div class="box-instruction">${d.instruction}</div>` : ''}
                <div class="pro-sentences-list" style="margin-bottom:12px;">${proSentencesHtml}</div>
                ${tList ? `<div style="margin-top:10px; padding-top:8px; border-top:1.5px solid #EAE5DC;"><span style="font-size:8.5pt; font-weight:800; text-transform:uppercase; color:${pal.primaryDark}; display:block; margin-bottom:4px;">✦ Dicas de Conexão & Redução:</span><ul class="conn-tips" style="margin:0; padding-left:18px;">${tList}</ul></div>` : ''}
              </div>
            `;

          case 'golden_tip':
            return `
              <div class="aef-golden-box" style="position:relative;">
                ${cornerQrHtml}
                <div class="golden-title">💡 ${d.title || 'Sacada de Ouro do Professor Leo'}</div>
                <div class="golden-content">"${d.content || ''}"</div>
              </div>
            `;

          case 'explainer':
            return `
              <div class="aef-box explainer-box" style="border-left-color:${pal.primary}; position:relative;">
                ${cornerQrHtml}
                <div class="box-title" style="color:${pal.primary};">
                  <span>✦ ${d.title || 'Conceito Central'}</span>
                </div>
                <div class="explainer-content">${d.content || ''}</div>
              </div>
            `;

          case 'handwriting_lines':
            let linesHtml = '';
            for (let i = 0; i < (d.lineCount || 4); i++) {
              linesHtml += `<div class="handwriting-line" style="border-color:${pal.dotColor}; height:24px; margin-bottom:8px;"></div>`;
            }
            return `
              <div class="aef-box lines-box" style="border-left-color:${pal.primary}; position:relative;">
                ${cornerQrHtml}
                <div class="box-title" style="color:${pal.primary};">
                  <span>📝 ${d.title || 'Anotações de Treino Oral'}</span>
                </div>
                <div class="lines-container" style="padding-top:10px;">${linesHtml}</div>
              </div>
            `;

          case 'qr_code':
            // 100% Real & Scannable QR Code URL
            const targetUrl = d.targetUrl || this.state.linkedLessonData?.trainingUrl || this.state.playerTrackUrl || 'https://agoraeufalo.com.br/player.html';
            const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(targetUrl)}&margin=2&color=0A192F`;
            
            return `
              <div class="aef-qr-box" style="border-color:${pal.border}; background:${pal.primaryLight};">
                <div class="qr-info">
                  <div class="qr-title" style="color:${pal.primaryDark};">📱 ${d.title || 'Treino Interativo no Training Player'}</div>
                  <div class="qr-sub">${d.subtitle || 'Aponte a câmera do celular para ouvir a lição e treinar a fala ativa.'}</div>
                  <div class="qr-action-row" style="margin-top:6px;">
                    <a href="${targetUrl}" target="_blank" class="qr-click-btn" style="background:${pal.primary}; color:#FFFFFF; text-decoration:none; display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:6px; font-size:8pt; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; box-shadow:0 1px 2px rgba(0,0,0,0.1);">
                      <span>▶ Abrir no Training Player</span>
                    </a>
                    <span style="font-size:7.5pt; color:#64748B; font-weight:600; margin-left:6px;">(ou clique para abrir na sua tela)</span>
                  </div>
                </div>
                <div class="qr-img-wrapper" style="background:#FFFFFF; padding:4px; border-radius:8px; border:1.5px solid ${pal.border}; shrink-0;">
                  <a href="${targetUrl}" target="_blank" title="Clique para abrir no Player">
                    <img src="${qrImageUrl}" alt="QR Code" width="68" height="68" style="display:block; border-radius:4px;" crossorigin="anonymous">
                  </a>
                </div>
              </div>
            `;

          default:
            return '';
        }
      };

      const pagesHtml = this.state.pages.map((page, idx) => {
        const blocksContent = page.blocks.map(renderBlock).join('');
        const isCoverPage = idx === 0 && page.blocks.some(b => b.type === 'cover');
        return `
          <div class="aef-a4-page ${forPrint ? 'page-print' : ''} ${isCoverPage ? 'page-cover' : ''}" data-page="${idx + 1}" ${isCoverPage ? 'style="padding:0; background:transparent; box-shadow:none;"' : ''}>
            <div class="a4-inner-content">
              ${blocksContent}
            </div>
            ${(this.state.showFooter && !isCoverPage) ? `
              <div class="a4-running-footer">
                <span class="f-left">✦ AgoraEuFalo • Professor Leonardo Leite</span>
                <span class="f-mid">selexenglish@gmail.com</span>
                <span class="f-right">Página ${page.number} de ${this.state.pages.length}</span>
              </div>
            ` : ''}
          </div>
        `;
      }).join('');

      return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${this.state.title} • Apostila Oficial | AgoraEuFalo</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;900&display=swap');

    @page {
      size: A4 portrait;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      margin: 0;
      padding: 0;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0F172A;
      background: ${forPrint ? '#FFFFFF' : '#0B0F17'};
      font-size: ${fontSize};
      line-height: 1.5;
    }

    /* A4 Page Container */
    .aef-a4-page {
      width: 210mm;
      min-height: 297mm;
      max-height: ${forPrint ? '297mm' : 'none'};
      box-sizing: border-box;
      background: #FFFFFF;
      margin: ${forPrint ? '0' : '20px auto'};
      padding: ${forPrint ? '12mm 14mm 10mm 14mm' : '14mm 16mm 12mm 16mm'};
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-inside: avoid;
      break-inside: avoid;
      page-break-after: always;
      break-after: page;
      box-shadow: ${forPrint ? 'none' : '0 20px 40px rgba(0,0,0,0.5)'};
      border-radius: ${forPrint ? '0' : '8px'};
      overflow: hidden;
    }

    @media print {
      body {
        background: #FFFFFF !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .aef-a4-page {
        margin: 0 !important;
        width: 210mm !important;
        height: 297mm !important;
        max-height: 297mm !important;
        page-break-after: always !important;
        break-after: page !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        box-shadow: none !important;
        border-radius: 0 !important;
      }
    }

    .a4-inner-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    /* Running Footer */
    .a4-running-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #E2E8F0;
      padding-top: 8px;
      margin-top: 14px;
      font-size: 8.5pt;
      font-weight: 700;
      color: #64748B;
      page-break-inside: avoid;
    }

    /* Archetype 1: Deep Navy Cover */
    .aef-cover-archetype {
      background: linear-gradient(145deg, #0A192F 0%, #060D17 100%);
      color: #FFFFFF;
      border-radius: 18px;
      padding: 36px 30px;
      min-height: 255mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
      border: 2px solid rgba(198, 138, 54, 0.4);
      page-break-inside: avoid;
    }
    .cover-watermark {
      position: absolute;
      right: 15px;
      bottom: 5px;
      font-size: 105pt;
      font-weight: 900;
      color: rgba(255, 255, 255, 0.09);
      letter-spacing: -2px;
      line-height: 1;
      user-select: none;
      pointer-events: none;
      font-family: 'Playfair Display', serif;
      z-index: 1;
    }
    .cover-tag {
      font-size: 9pt;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #F59E0B;
    }
    .cover-course {
      font-size: 13pt;
      font-weight: 700;
      color: #E2E8F0;
      margin-top: 6px;
    }
    .cover-lesson-title {
      font-size: 26pt;
      font-weight: 900;
      color: #FFFFFF;
      line-height: 1.2;
      margin: 12px 0 24px 0;
      font-family: 'Playfair Display', serif;
    }
    .cover-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1.5px solid rgba(255, 255, 255, 0.12);
      border-radius: 14px;
      padding: 22px 24px;
      margin-bottom: 20px;
      backdrop-blur: 10px;
    }
    .cover-synopsis-label {
      font-size: 9.5pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #FDE68A;
      margin-bottom: 8px;
    }
    .cover-synopsis-text {
      font-size: 13pt;
      line-height: 1.6;
      color: #F1F5F9;
      font-weight: 500;
    }
    .cover-stats {
      margin-top: 14px;
      font-size: 9pt;
      font-weight: 800;
      color: #60A5FA;
      border-top: 1px dashed rgba(255,255,255,0.15);
      padding-top: 10px;
    }
    .cover-footer {
      font-size: 8.5pt;
      font-weight: 700;
      color: rgba(255,255,255,0.5);
      text-align: center;
      border-top: 1px solid rgba(255,255,255,0.1);
      padding-top: 12px;
    }

    /* Header Banner */
    .aef-header-banner {
      color: #FFFFFF;
      border-radius: 12px;
      padding: 14px 18px;
      margin-bottom: 6px;
      page-break-inside: avoid;
    }
    .hdr-tag {
      font-size: 7.5pt;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #FDE68A;
      margin-bottom: 2px;
    }
    .hdr-course {
      font-size: 10pt;
      font-weight: 700;
      opacity: 0.9;
    }
    .hdr-title {
      font-size: 15pt;
      font-weight: 900;
      margin: 2px 0 0 0;
      line-height: 1.2;
    }

    /* Pedagogical Boxes */
    .aef-box {
      background: #FAF8F5;
      border: 1.5px solid #EAE5DC;
      border-left: 5px solid ${pal.primary};
      border-radius: 12px;
      padding: 14px 18px;
      page-break-inside: avoid;
    }
    .box-title {
      font-size: 10.5pt;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .box-instruction {
      font-size: 9.5pt;
      color: #475569;
      font-style: italic;
      margin-bottom: 10px;
      border-bottom: 1px dashed #E2E8F0;
      padding-bottom: 6px;
    }

    /* Listen & Read */
    .lr-sentence-row {
      margin-bottom: 8px;
      display: flex;
      gap: 8px;
    }
    .lr-speaker {
      font-weight: 900;
      color: ${pal.primaryDark};
      min-width: 45px;
    }
    .lr-en {
      font-weight: 600;
      color: #0F172A;
      font-size: 1.05em;
    }

    /* Chunks Grid */
    .chunks-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
    }
    .chunk-card {
      background: #FFFFFF;
      border: 1.2px solid #EAE5DC;
      border-radius: 9px;
      padding: 8px 12px;
    }
    .chunk-en-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2px;
    }
    .chunk-en {
      font-weight: 800;
      color: #0A192F;
      font-size: 1.05em;
    }
    .chunk-tag {
      font-size: 7.5pt;
      font-weight: 800;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: 9999px;
    }
    .chunk-pt {
      font-size: 9.5pt;
      color: #047857;
      font-style: italic;
      font-weight: 600;
    }

    /* Listen & Answer */
    .la-question-item {
      margin-bottom: 12px;
    }
    .la-question-text {
      font-weight: 800;
      color: #0F172A;
      margin-bottom: 6px;
      font-size: 1.02em;
    }
    .q-num {
      color: ${pal.primary};
      font-weight: 900;
    }
    .handwriting-line {
      border-bottom: 1.5px dashed;
      height: 18px;
      margin-bottom: 4px;
    }

    /* Look & Retell */
    .lrt-prompts {
      margin: 0 0 10px 18px;
      padding: 0;
      color: #1E293B;
      font-weight: 600;
    }
    .lrt-prompts li { margin-bottom: 4px; }
    .lrt-kw-box {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 8px 12px;
    }
    .kw-label {
      font-size: 8pt;
      font-weight: 800;
      text-transform: uppercase;
      color: #64748B;
      display: block;
      margin-bottom: 4px;
    }
    .kw-container {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .kw-badge {
      background: #EFF6FF;
      color: #1E40AF;
      border: 1px solid #BFDBFE;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 9pt;
      font-weight: 700;
    }

    /* Listen & Ask */
    .lask-item {
      margin-bottom: 12px;
    }
    .lask-statement {
      font-size: 1.02em;
      color: #0F172A;
      margin-bottom: 2px;
    }
    .lask-prompt {
      font-size: 9pt;
      color: #475569;
      font-style: italic;
      font-weight: 600;
      margin-bottom: 4px;
    }

    /* Connected Speech */
    .conn-text-box {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 1.08em;
      line-height: 1.7;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .linking {
      color: #1A56DB;
      text-decoration: underline wavy #3B82F6;
      font-weight: 800;
    }
    .conn-tips {
      margin: 0 0 0 18px;
      padding: 0;
      font-size: 9.5pt;
      color: #047857;
      font-style: italic;
      font-weight: 600;
    }

    /* Golden Tip */
    .aef-golden-box {
      background: #FFFBEB;
      border: 2px solid #F59E0B;
      border-radius: 12px;
      padding: 14px 18px;
      page-break-inside: avoid;
    }
    .golden-title {
      font-size: 10pt;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #B45309;
      margin-bottom: 4px;
    }
    .golden-content {
      font-size: 1.05em;
      font-style: italic;
      color: #78350F;
      font-weight: 600;
      line-height: 1.5;
    }

    /* QR Code Interactive */
    .aef-qr-box {
      border: 1.5px solid;
      border-radius: 12px;
      padding: 10px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      page-break-inside: avoid;
    }
    .qr-title {
      font-size: 9.5pt;
      font-weight: 800;
      text-transform: uppercase;
    }
    .qr-sub {
      font-size: 8.5pt;
      color: #475569;
      margin-top: 2px;
    }
  </style>
</head>
<body>
  ${pagesHtml}
</body>
</html>`;
    }

    print() {
      const html = this.generateCompleteHtml(true);
      const printWindow = window.open('', '_blank', 'width=900,height=1000');
      if (!printWindow) {
        alert("Permita popups para abrir a janela de impressão da apostila em PDF.");
        return;
      }
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 600);
    }
  }

  // Global Singleton Export
  window.AEFPdfFactoryEngine = new AEFPdfFactoryEngine();
})(window);
