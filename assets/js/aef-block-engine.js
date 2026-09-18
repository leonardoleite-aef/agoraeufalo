/**
 * AgoraEuFalo • Dynamic Marketing Block Engine & Delivery System
 * Professor Leonardo Leite
 * 
 * Motor autônomo de entrega contextual de blocos de marketing (Modais, Cards In-Feed, Banners).
 * Conecta peças criativas às Ofertas Comerciais cadastradas no Departamento de Vendas (aef-offers-registry.js),
 * aplicando segmentação rigorosa por Tiers de usuário (Free, Club, VIP, Unauthenticated).
 */

(function (root) {
  'use strict';

  const window = root || (typeof globalThis !== 'undefined' ? globalThis : {});

  const STORAGE_KEY = 'aef_marketing_blocks_cache_v4';

  // Sementes Canônicas de Blocos de Marketing
  const CANONICAL_BLOCKS_SEED = [
    {
      id: "card-infeed-ms-club",
      title: "Card In-Feed • AgoraEuFalo Club (Magic Stories)",
      format: "card_infeed",
      attachedOfferId: "ms-club-anual",
      placement: {
        slotId: "portal_courses_infeed",
        priority: 100
      },
      targeting: {
        targetTiers: ["free", "unauthenticated"],
        excludeTiers: ["club_annual", "club_monthly", "vip"],
        excludeIfEnrolledProduct: "ms-club"
      },
      content: {
        badgeText: "✨ ASSINATURA AGORAEUFALO CLUB",
        headline: "AgoraEuFalo Club • O Método Magic Stories para Falar no Reflexo",
        subhead: "Destrave o acervo completo das 30 Magic Stories clássicas narradas pelo Professor Leo Leite e parceiros nativos.",
        bodyHtml: `
          <ul class="space-y-2 text-xs text-slate-300 mb-3">
            <li class="flex items-center gap-2"><span class="text-amber-400 font-bold">✓</span> <span><strong>30 Magic Stories Clássicas:</strong> Histórias completas gravadas em estúdio com o Professor Leo e falantes nativos.</span></li>
            <li class="flex items-center gap-2"><span class="text-amber-400 font-bold">✓</span> <span><strong>As 6 Atividades Canônicas:</strong> Listen & Read, Vocab Session, Listen & Answer, Look & Retell, Listen & Ask e Pronúncia.</span></li>
            <li class="flex items-center gap-2"><span class="text-amber-400 font-bold">✓</span> <span><strong>Training Player Profissional:</strong> Repetição em loop (🔂), seek milissegundo e modo fone de ouvido para treinar onde quiser.</span></li>
            <li class="flex items-center gap-2"><span class="text-amber-400 font-bold">✓</span> <span><strong>Apostilas Oficiais Diagramadas:</strong> PDFs em alta resolução para acompanhamento e escrita manual.</span></li>
          </ul>
        `,
        mediaType: "image",
        mediaUrl: "assets/images/cover-magic-stories-cinema.jpg?v=20260905",
        ctaText: "Garantir Minha Vaga no Club",
        ctaSecondaryText: "12x no cartão ou à vista no PIX • Garantia incondicional de 7 dias"
      },
      status: "active",
      createdAt: "2026-09-05T00:00:00.000Z",
      updatedAt: "2026-09-05T12:00:00.000Z"
    },
    {
      id: "modal-paywall-ms-club",
      title: "Modal de Bloqueio • Assine o AgoraEuFalo Club",
      format: "modal_paywall",
      attachedOfferId: "ms-club-anual",
      placement: {
        slotId: "player_restricted_modal",
        priority: 100
      },
      targeting: {
        targetTiers: ["free", "unauthenticated"],
        excludeTiers: ["club_annual", "club_monthly", "vip"],
        excludeIfEnrolledProduct: "ms-club"
      },
      content: {
        badgeText: "CONTEÚDO EXCLUSIVO DO CLUB",
        headline: "Destrave as 30 Magic Stories do AgoraEuFalo Club",
        subhead: "Treine no carro, academia e caminhada sem telas ligadas. O método prático para transformar o inglês em reflexo natural.",
        bodyHtml: `
          <ul class="space-y-2 text-xs text-slate-300">
            <li class="flex items-center gap-2"><span class="text-amber-400 font-bold">✓</span> Acesso total a todas as 30 Magic Stories clássicas</li>
            <li class="flex items-center gap-2"><span class="text-amber-400 font-bold">✓</span> Áudios de estúdio Dual-Speaker com seek milimétrico</li>
            <li class="flex items-center gap-2"><span class="text-amber-400 font-bold">✓</span> Repetição contínua em loop e Modo Bolso / Lockscreen</li>
            <li class="flex items-center gap-2"><span class="text-amber-400 font-bold">✓</span> Apostilas oficiais diagramadas em PDF A4</li>
          </ul>
        `,
        mediaType: "image",
        mediaUrl: "assets/images/cover-magic-stories-legacy.jpg",
        ctaText: "Garantir Minha Vaga no Club",
        ctaSecondaryText: "Continuar Treinando no QuickStart Grátis"
      },
      status: "active",
      createdAt: "2026-09-01T00:00:00.000Z",
      updatedAt: "2026-09-05T12:00:00.000Z"
    },
    {
      id: "card-infeed-frases-prontas",
      title: "Card In-Feed • Curso Frases Prontas",
      format: "card_infeed",
      attachedOfferId: "frases-prontas-vitalicio",
      placement: {
        slotId: "portal_courses_infeed",
        priority: 85
      },
      targeting: {
        targetTiers: ["free", "club_annual", "club_monthly"],
        excludeTiers: ["vip"],
        excludeIfEnrolledProduct: "frases-prontas"
      },
      content: {
        badgeText: "🔥 AUTOMAÇÃO ORAL",
        headline: "Curso Frases Prontas • Pare de Traduzir Mentalmente",
        subhead: "Elimine a gagueira e fale no reflexo com os blocos canônicos de conversa da vida real.",
        bodyHtml: `
          <p class="text-xs text-slate-300 leading-relaxed mb-3">
            Domine as combinações fixas que falantes nativos usam todos os dias sem pensar em regras gramaticais. Ideal para quem já entende inglês escrito mas trava na hora de falar.
          </p>
        `,
        mediaType: "image",
        mediaUrl: "assets/images/cover-frases-prontas.jpg",
        ctaText: "Garantir Acesso Vitalício",
        ctaSecondaryText: "Ver Grade do Curso"
      },
      status: "paused",
      createdAt: "2026-09-01T00:00:00.000Z",
      updatedAt: "2026-09-05T12:00:00.000Z"
    },
    {
      id: "banner-mentoria-vip-club",
      title: "Banner In-Feed • Mentoria VIP Individual 1 a 1",
      format: "card_infeed",
      attachedOfferId: "mentoria-vip-semestral",
      placement: {
        slotId: "portal_hero_below",
        priority: 90
      },
      targeting: {
        targetTiers: ["club_annual", "club_monthly"],
        excludeTiers: ["vip", "free"],
        excludeIfEnrolledProduct: "mentoria-vip"
      },
      content: {
        badgeText: "👑 VAGAS SELETIVAS",
        headline: "Quer Acompanhamento Direto com o Professor Leo?",
        subhead: "Acelere sua fala com prescrições de áudio gravadas individualmente para as suas situações reais de conversa e trabalho.",
        bodyHtml: `
          <p class="text-xs text-slate-300 leading-relaxed mb-3">
            Apenas 3 vagas abertas no semestre. Encontro e triagem de nível realizados diretamente via WhatsApp antes de qualquer matrícula.
          </p>
        `,
        mediaType: "none",
        mediaUrl: "",
        ctaText: "Aplicar para Mentoria VIP no WhatsApp",
        ctaSecondaryText: "Como Funciona a Mentoria"
      },
      status: "paused",
      createdAt: "2026-09-01T00:00:00.000Z",
      updatedAt: "2026-09-05T12:00:00.000Z"
    },
    {
      id: "banner-top-desconto-relampago",
      title: "Top Bar • Oferta Relâmpago Frases Prontas OTO",
      format: "banner_top",
      attachedOfferId: "frases-prontas-oto",
      placement: {
        slotId: "global_top_bar",
        priority: 70
      },
      targeting: {
        targetTiers: ["free", "course_member"],
        excludeTiers: ["vip"],
        excludeIfEnrolledProduct: "frases-prontas"
      },
      content: {
        badgeText: "⚡ OFERTA RELÂMPAGO",
        headline: "Frases Prontas com 67% de Desconto por apenas R$ 97 à vista!",
        subhead: "Oferta por tempo limitado para acelerar sua automação de diálogo.",
        ctaText: "Aproveitar Desconto",
        ctaSecondaryText: ""
      },
      status: "paused",
      createdAt: "2026-09-01T00:00:00.000Z",
      updatedAt: "2026-09-05T12:00:00.000Z"
    },
    {
      id: "card-infeed-migracao-club",
      title: "Card In-Feed • Upgrade de Aluno Antigo para o Club",
      format: "card_infeed",
      attachedOfferId: "migracao-upgrade-club",
      placement: {
        slotId: "portal_courses_infeed",
        priority: 95
      },
      targeting: {
        targetTiers: ["free", "course_member"],
        excludeTiers: ["club_annual", "club_monthly", "vip"],
        excludeIfEnrolledProduct: "ms-club",
        requireEnrolledProduct: "first-steps"
      },
      content: {
        badgeText: "🚀 CRÉDITO DE FIDELIDADE",
        headline: "Abata o Valor do Seu Curso Anterior no AgoraEuFalo English Club",
        subhead: "Você já investiu na sua evolução com o Professor Leo. Reconhecemos a sua jornada dando crédito para migrar para o Club Anual por apenas R$ 297.",
        bodyHtml: `
          <ul class="space-y-2 text-xs text-slate-300 mb-3">
            <li class="flex items-center gap-2"><span class="text-amber-400 font-bold">✓</span> Acesso completo ao acervo clássico das 30 Magic Stories</li>
            <li class="flex items-center gap-2"><span class="text-amber-400 font-bold">✓</span> Training Player com áudios em loop e modo fone de ouvido</li>
            <li class="flex items-center gap-2"><span class="text-amber-400 font-bold">✓</span> R$ 200 de desconto de transição exclusivo para ex-alunos</li>
          </ul>
        `,
        mediaType: "image",
        mediaUrl: "assets/images/cover-magic-stories-legacy.jpg",
        ctaText: "Garantir Upgrade por R$ 297",
        ctaSecondaryText: "Tirar Dúvida no WhatsApp"
      },
      status: "paused",
      createdAt: "2026-09-04T00:00:00.000Z",
      updatedAt: "2026-09-05T12:00:00.000Z"
    },
    {
      id: "teaser-hero-spoken-reflex",
      title: "Hero Teaser • Spoken Reflex Studio (Smartphone Interativo)",
      format: "hero_teaser",
      attachedOfferId: "trial-7-dias-gratis",
      placement: {
        slotId: "homepage_hero_teaser",
        priority: 100
      },
      targeting: {
        targetTiers: [], // vazio = visível para todos os visitantes e tiers (inclusive admin)
        excludeTiers: []
      },
      content: {
        badgeText: "🎧 ÁUDIO DEMONSTRATIVO ATIVO",
        headline: "Spoken Reflex Session • Welcome",
        subhead: "Professor Leo Leite & Native Partner",
        mediaUrl: "assets/images/cover-public-spoken-reflex.jpg",
        audioUrl: "assets/audio/public/public_spoken_reflex_session01.mp3",
        durationText: "0:45",
        transcriptPreview: "Inglês não é matéria de prova. Ouça a melodia e deixe a fala virar reflexo."
      },
      status: "active",
      createdAt: "2026-09-04T00:00:00.000Z",
      updatedAt: "2026-09-04T00:00:00.000Z"
    }
  ];

  class AEFBlockEngine {
    constructor() {
      this.blocks = [];
      this.initialized = false;
      this.db = null;
    }

    /**
     * Inicializa a coleção de blocos a partir de cache local e Firestore
     */
    async init() {
      if (this.initialized) return this.blocks;

      // 1. Inicia sempre com o mapa da semente canônica oficial
      const blockMap = new Map();
      CANONICAL_BLOCKS_SEED.forEach(seed => {
        blockMap.set(seed.id, JSON.parse(JSON.stringify(seed)));
      });

      // 2. Lê do localStorage e mescla (preserva edições locais sem apagar sementes)
      try {
        if (typeof localStorage !== 'undefined') {
          const cached = localStorage.getItem(STORAGE_KEY);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              parsed.forEach(item => {
                if (item && item.id) {
                  const existing = blockMap.get(item.id) || {};
                  blockMap.set(item.id, { ...existing, ...item });
                }
              });
            }
          }
        }
      } catch (e) {
        console.warn("[AEFBlockEngine] Falha ao ler cache local:", e);
      }

      this.blocks = Array.from(blockMap.values());
      this.saveToLocalCache();

      // 3. Conecta ao Firebase se disponível
      if (window.aefCloudSync) {
        try {
          await window.aefCloudSync.init();
          this.db = window.firebase ? window.firebase.firestore() : null;
        } catch (e) {}
      }

      // 4. Sincroniza em background
      await this.syncFromFirestore();

      // 5. Garante que o registro de ofertas esteja pronto
      if (window.aefOffersRegistry) {
        await window.aefOffersRegistry.init();
      }

      this.initialized = true;
      return this.blocks;
    }

    saveToLocalCache() {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.blocks));
        }
      } catch (e) {}
    }

    async syncFromFirestore() {
      try {
        let cloudList = [];
        if (this.db) {
          const snap = await this.db.collection('marketing_blocks').get();
          if (!snap.empty) {
            snap.forEach(doc => cloudList.push({ id: doc.id, ...doc.data() }));
          }
        } else {
          // REST Fallback
          const res = await fetch("https://firestore.googleapis.com/v1/projects/agoraeufalo-3463a/databases/(default)/documents/marketing_blocks");
          if (res.ok) {
            const data = await res.json();
            if (data && data.documents && data.documents.length > 0) {
              cloudList = data.documents.map(doc => this.parseFirestoreDocument(doc));
            }
          }
        }

        if (cloudList.length > 0) {
          const blockMap = new Map();
          this.blocks.forEach(b => blockMap.set(b.id, b));
          cloudList.forEach(cb => {
            if (cb && cb.id) {
              const existing = blockMap.get(cb.id) || {};
              blockMap.set(cb.id, { ...existing, ...cb });
            }
          });
          this.blocks = Array.from(blockMap.values());
          this.saveToLocalCache();
        }
      } catch (e) {}
      return this.blocks;
    }

    /**
     * Restaura a coleção com as sementes canônicas originais
     */
    async restoreCanonicalSeed() {
      const blockMap = new Map();
      CANONICAL_BLOCKS_SEED.forEach(seed => {
        blockMap.set(seed.id, JSON.parse(JSON.stringify(seed)));
      });
      this.blocks = Array.from(blockMap.values());
      this.saveToLocalCache();
      return this.blocks;
    }

    /**
     * Retorna todos os blocos de marketing cadastrados
     */
    async getAllBlocks(filters = {}) {
      if (!this.initialized) await this.init();
      let list = [...this.blocks];

      if (filters.status) {
        list = list.filter(b => b.status === filters.status);
      }
      if (filters.format) {
        list = list.filter(b => b.format === filters.format);
      }
      if (filters.slotId) {
        list = list.filter(b => b.placement?.slotId === filters.slotId);
      }
      if (filters.term) {
        const q = filters.term.toLowerCase().trim();
        list = list.filter(b => 
          (b.title && b.title.toLowerCase().includes(q)) ||
          (b.content?.headline && b.content.headline.toLowerCase().includes(q)) ||
          (b.attachedOfferId && b.attachedOfferId.toLowerCase().includes(q))
        );
      }
      return list;
    }

    /**
     * Retorna um bloco pelo ID
     */
    async getBlockById(id) {
      if (!this.initialized) await this.init();
      return this.blocks.find(b => b.id === id) || null;
    }

    /**
     * Salva ou atualiza um bloco de marketing
     */
    async saveBlock(blockData) {
      if (!this.initialized) await this.init();

      const id = blockData.id || `block_${Date.now()}`;
      blockData.id = id;
      blockData.updatedAt = new Date().toISOString();
      if (!blockData.createdAt) blockData.createdAt = blockData.updatedAt;

      const idx = this.blocks.findIndex(b => b.id === id);
      if (idx >= 0) {
        this.blocks[idx] = { ...this.blocks[idx], ...blockData };
      } else {
        this.blocks.unshift(blockData);
      }
      this.saveToLocalCache();

      try {
        if (this.db) {
          await this.db.collection('marketing_blocks').doc(id).set(blockData, { merge: true });
        } else {
          const url = `https://firestore.googleapis.com/v1/projects/agoraeufalo-3463a/databases/(default)/documents/marketing_blocks/${id}`;
          const fields = this.formatFirestoreFields(blockData);
          await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fields })
          });
        }
      } catch (err) {
        console.warn("[AEFBlockEngine] Salvo localmente com aviso de nuvem:", err);
      }

      return blockData;
    }

    /**
     * Alterna o status (active / paused)
     */
    async toggleBlockStatus(id, newStatus = null) {
      if (!this.initialized) await this.init();
      const block = this.blocks.find(b => b.id === id);
      if (!block) throw new Error(`Bloco ${id} não encontrado.`);

      if (!newStatus) {
        newStatus = (block.status === 'active') ? 'paused' : 'active';
      }

      block.status = newStatus;
      block.updatedAt = new Date().toISOString();
      this.saveToLocalCache();

      try {
        if (this.db) {
          await this.db.collection('marketing_blocks').doc(id).update({ status: newStatus, updatedAt: block.updatedAt });
        }
      } catch (e) {}

      return block;
    }

    /**
     * Duplica um bloco para novas variações de campanha
     */
    async duplicateBlock(id) {
      if (!this.initialized) await this.init();
      const orig = this.blocks.find(b => b.id === id);
      if (!orig) throw new Error(`Bloco original ${id} não encontrado.`);

      const copy = JSON.parse(JSON.stringify(orig));
      const suffix = Date.now().toString().slice(-4);
      copy.id = `${orig.id}_copy_${suffix}`;
      copy.title = `${orig.title} (Cópia ${suffix})`;
      copy.status = "paused";
      copy.createdAt = new Date().toISOString();
      copy.updatedAt = copy.createdAt;

      return await this.saveBlock(copy);
    }

    /**
     * Exclui um bloco
     */
    async deleteBlock(id) {
      if (!this.initialized) await this.init();
      this.blocks = this.blocks.filter(b => b.id !== id);
      this.saveToLocalCache();

      try {
        if (this.db) {
          await this.db.collection('marketing_blocks').doc(id).delete();
        } else {
          await fetch(`https://firestore.googleapis.com/v1/projects/agoraeufalo-3463a/databases/(default)/documents/marketing_blocks/${id}`, {
            method: 'DELETE'
          });
        }
      } catch (e) {}

      return true;
    }

    // =========================================================================
    // MOTOR DE INJEÇÃO CONTEXTUAL (FRONT-END)
    // =========================================================================

    /**
     * Identifica o melhor bloco ativo para um determinado slot e tier de usuário
     */
    async findBestBlockForSlot(slotId, userTier = null, userEnrolled = []) {
      if (!this.initialized) await this.init();

      if (!userTier) {
        userTier = (window.aefPortalAuth && typeof window.aefPortalAuth.getActiveTier === 'function')
          ? window.aefPortalAuth.getActiveTier()
          : (localStorage.getItem('aef_user_tier') || 'free');
      }

      // Procura blocos ativos correspondentes ao slot
      const candidates = this.blocks.filter(b => {
        if (b.status !== 'active') return false;
        if (b.placement?.slotId !== slotId) return false;

        // Regras de público-alvo (Tiers)
        const targetTiers = b.targeting?.targetTiers || [];
        const excludeTiers = b.targeting?.excludeTiers || [];

        // Se o usuário está na lista de exclusão, barra
        if (excludeTiers.includes(userTier)) return false;

        // Se há alvos específicos e o usuário não está neles, barra
        if (targetTiers.length > 0 && !targetTiers.includes(userTier)) return false;

        // Exclusão por produto já matriculado
        const excludeProd = b.targeting?.excludeIfEnrolledProduct;
        if (excludeProd && userEnrolled.includes(excludeProd)) return false;

        // Exigência de produto matriculado específico (ex: ex-aluno do 'first-steps')
        const requireProd = b.targeting?.requireEnrolledProduct;
        if (requireProd && !userEnrolled.includes(requireProd)) return false;

        return true;
      });

      if (candidates.length === 0) return null;

      // Validação estrita de Oferta Comercial Ativa e Regra Canônica do Free Tier
      const validCandidates = [];
      const isFreeTier = userTier === 'free' || userTier === 'unauthenticated';

      for (const b of candidates) {
        if (b.attachedOfferId && window.aefOffersRegistry) {
          const offer = await window.aefOffersRegistry.getOfferById(b.attachedOfferId);
          // Se a oferta não existir ou estiver pausada/inativa, descarta o bloco
          if (!offer || offer.status !== 'active') {
            continue;
          }
          // Regra Inegociável AgoraEuFalo: No Free Tier, a ÚNICA oferta autorizada a rodar
          // em marketing é a Assinatura do AgoraEuFalo Club (Magic Stories)
          if (isFreeTier && offer.productId !== 'ms-club') {
            continue;
          }
        }
        validCandidates.push(b);
      }

      if (validCandidates.length === 0) return null;

      // Ordena por prioridade descendente
      validCandidates.sort((a, b) => (b.placement?.priority || 50) - (a.placement?.priority || 50));
      return validCandidates[0];
    }

    /**
     * Renderiza todos os slots [data-aef-slot] presentes na página atual
     */
    async renderAllSlots(customTier = null, customEnrolled = null) {
      await this.init();

      const slots = document.querySelectorAll('[data-aef-slot]');
      if (!slots || slots.length === 0) return;

      const userTier = customTier || (
        (window.aefPortalAuth && typeof window.aefPortalAuth.getActiveTier === 'function')
          ? window.aefPortalAuth.getActiveTier()
          : (localStorage.getItem('aef_user_tier') || 'free')
      );

      const userEnrolled = customEnrolled || (
        (window.aefPortalAuth && typeof window.aefPortalAuth.getEnrolledProducts === 'function')
          ? window.aefPortalAuth.getEnrolledProducts()
          : ((window.aefPortalAuth && window.aefPortalAuth.currentProfile?.enrolledProducts) || JSON.parse(localStorage.getItem('aef_enrolled_products') || '[]'))
      );

      for (const slotEl of slots) {
        const slotId = slotEl.getAttribute('data-aef-slot');
        if (!slotId) continue;

        const bestBlock = await this.findBestBlockForSlot(slotId, userTier, userEnrolled);
        if (bestBlock) {
          await this.renderBlockIntoElement(slotEl, bestBlock, slotId);
        } else {
          // Se o slot possui conteúdo estático padrão (ex: hero teaser do smartphone), nunca apaga o HTML!
          if (slotId !== 'homepage_hero_teaser' && !slotEl.hasAttribute('data-aef-keep-fallback')) {
            slotEl.innerHTML = '';
            slotEl.classList.add('hidden');
          }
        }
      }

      if (window.lucide) window.lucide.createIcons();
    }

    /**
     * Renderiza o HTML do bloco dentro de um elemento container
     */
    async renderBlockIntoElement(containerEl, block, slotId = 'portal') {
      let offer = null;
      if (block.attachedOfferId && window.aefOffersRegistry) {
        offer = await window.aefOffersRegistry.getOfferById(block.attachedOfferId);
      }

      // Gera a URL do CTA com tracking
      const ctaUrl = offer 
        ? window.aefOffersRegistry.generateTrackingUrl(offer, slotId, block.id)
        : '#';

      const installmentsText = offer?.pricing?.installmentsText || '';
      const offerPriceText = offer ? `R$ ${(offer.pricing?.offerPrice || 0).toFixed(2).replace('.', ',')}` : '';

      containerEl.classList.remove('hidden');

      // 1. FORMATO: CARD IN-FEED
      if (block.format === 'card_infeed') {
        containerEl.innerHTML = `
          <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A192F] via-[#112240] to-[#0A192F] border-2 border-amber-500/40 p-6 sm:p-8 shadow-2xl text-white my-6 group">
            <div class="absolute -right-20 -bottom-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              
              <div class="space-y-3 flex-1">
                <div class="flex items-center gap-2">
                  <span class="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-mono font-black text-[10px] uppercase tracking-wider shadow-sm">
                    ${block.content?.badgeText || 'OFERTA ESPECIAL'}
                  </span>
                  ${offer ? `
                    <span class="text-xs font-bold text-amber-300 font-mono">
                      ${installmentsText || offerPriceText}
                    </span>
                  ` : ''}
                </div>

                <h3 class="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                  ${block.content?.headline || ''}
                </h3>

                <p class="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  ${block.content?.subhead || ''}
                </p>

                ${block.content?.bodyHtml ? `
                  <div class="pt-1 text-slate-300">${block.content.bodyHtml}</div>
                ` : ''}
              </div>

              ${block.content?.mediaUrl ? `
                <div class="w-full md:w-44 h-44 shrink-0 rounded-2xl overflow-hidden border border-white/20 shadow-lg self-center">
                  <img src="${block.content.mediaUrl}" alt="${block.content.headline}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
                </div>
              ` : ''}

            </div>

            <div class="relative z-10 pt-4 mt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <a href="${ctaUrl}" data-open-checkout="true" data-checkout-url="${ctaUrl}" target="_blank" class="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg hover:shadow-amber-500/20 flex items-center gap-2 active:scale-95 cursor-pointer">
                <span>${block.content?.ctaText || 'Garantir Acesso Agora'}</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </a>

              ${block.content?.ctaSecondaryText ? `
                <span class="text-xs text-slate-400 font-medium">
                  ${block.content.ctaSecondaryText}
                </span>
              ` : ''}
            </div>
          </div>
        `;
      }

      // 2. FORMATO: BANNER TOP
      else if (block.format === 'banner_top') {
        containerEl.innerHTML = `
          <aside class="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 font-bold text-xs py-2.5 px-4 shadow-md flex items-center justify-between gap-3 sticky top-0 z-50">
            <div class="flex items-center gap-2 max-w-4xl truncate mx-auto">
              <span class="px-2 py-0.5 rounded bg-slate-950 text-amber-300 text-[10px] font-black uppercase tracking-wider shrink-0">
                ${block.content?.badgeText || 'OFERTA'}
              </span>
              <span class="truncate">${block.content?.headline}</span>
              ${offer ? `<strong class="hidden sm:inline font-black underline">${installmentsText}</strong>` : ''}
            </div>
            <a href="${ctaUrl}" data-open-checkout="true" data-checkout-url="${ctaUrl}" target="_blank" class="px-3.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-900 text-white font-black text-[11px] uppercase tracking-wider transition shrink-0 shadow-sm flex items-center gap-1 cursor-pointer">
              <span>${block.content?.ctaText || 'Ver Oferta'}</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </a>
          </aside>
        `;
      }

      // 3. FORMATO: MODAL DE PAYWALL (Para o Player ou Sala de Aula)
      else if (block.format === 'modal_paywall') {
        // Se existe o modal padrão do player `#player-lock-modal`, injeta os dados nele!
        const badgeEl = document.getElementById('lock-modal-badge');
        const titleEl = document.getElementById('lock-modal-title');
        const descEl = document.getElementById('lock-modal-desc');
        const ctaPrimary = document.getElementById('lock-modal-cta-primary');
        const ctaText = document.getElementById('lock-modal-cta-text');

        if (badgeEl && block.content?.badgeText) badgeEl.innerText = block.content.badgeText;
        if (titleEl && block.content?.headline) titleEl.innerText = block.content.headline;
        if (descEl) descEl.innerHTML = block.content?.subhead || block.content?.bodyHtml || '';
        if (ctaPrimary) ctaPrimary.href = ctaUrl;
        if (ctaText && block.content?.ctaText) ctaText.innerText = block.content.ctaText;
      }

      // 4. FORMATO: HERO TEASER (Smartphone Interativo na Homepage)
      else if (block.format === 'hero_teaser') {
        const badgeEl = document.getElementById('hero-teaser-badge');
        const titleEl = document.getElementById('hero-teaser-title');
        const authorEl = document.getElementById('hero-teaser-author');
        const coverEl = document.getElementById('hero-teaser-cover');
        const audioEl = document.getElementById('hero-teaser-audio');
        const transcriptEl = document.getElementById('hero-teaser-transcript');
        const durationEl = document.getElementById('hero-teaser-duration');

        if (badgeEl && block.content?.badgeText) badgeEl.innerText = block.content.badgeText;
        if (titleEl && block.content?.headline) titleEl.innerText = block.content.headline;
        if (authorEl && block.content?.subhead) authorEl.innerText = block.content.subhead;
        if (coverEl && block.content?.mediaUrl) coverEl.src = block.content.mediaUrl;
        if (audioEl && block.content?.audioUrl) {
          if (audioEl.src !== block.content.audioUrl && !audioEl.src.endsWith(block.content.audioUrl)) {
            audioEl.src = block.content.audioUrl;
            audioEl.load();
          }
        }
        if (transcriptEl && block.content?.transcriptPreview) transcriptEl.innerText = block.content.transcriptPreview;
        if (durationEl && block.content?.durationText) durationEl.innerText = block.content.durationText;
      }
    }

    // Helper Firestore
    parseFirestoreDocument(doc) {
      const f = doc.fields || {};
      const id = f.id?.stringValue || doc.name.split("/").pop();
      return {
        id: id,
        title: f.title?.stringValue || id,
        format: f.format?.stringValue || "card_infeed",
        attachedOfferId: f.attachedOfferId?.stringValue || "",
        placement: {
          slotId: f.placement?.mapValue?.fields?.slotId?.stringValue || "portal_courses_infeed",
          priority: parseInt(f.placement?.mapValue?.fields?.priority?.integerValue || "50")
        },
        targeting: {
          targetTiers: f.targeting?.mapValue?.fields?.targetTiers?.arrayValue?.values?.map(v => v.stringValue) || [],
          excludeTiers: f.targeting?.mapValue?.fields?.excludeTiers?.arrayValue?.values?.map(v => v.stringValue) || [],
          excludeIfEnrolledProduct: f.targeting?.mapValue?.fields?.excludeIfEnrolledProduct?.stringValue || ""
        },
        content: {
          badgeText: f.content?.mapValue?.fields?.badgeText?.stringValue || "",
          headline: f.content?.mapValue?.fields?.headline?.stringValue || "",
          subhead: f.content?.mapValue?.fields?.subhead?.stringValue || "",
          bodyHtml: f.content?.mapValue?.fields?.bodyHtml?.stringValue || "",
          mediaType: f.content?.mapValue?.fields?.mediaType?.stringValue || "none",
          mediaUrl: f.content?.mapValue?.fields?.mediaUrl?.stringValue || "",
          ctaText: f.content?.mapValue?.fields?.ctaText?.stringValue || "Aproveitar Agora",
          ctaSecondaryText: f.content?.mapValue?.fields?.ctaSecondaryText?.stringValue || ""
        },
        status: f.status?.stringValue || "active",
        createdAt: f.createdAt?.stringValue || new Date().toISOString(),
        updatedAt: f.updatedAt?.stringValue || new Date().toISOString()
      };
    }

    formatFirestoreFields(data) {
      const fields = {};
      for (const [key, val] of Object.entries(data)) {
        if (val === null || val === undefined) continue;
        if (typeof val === 'string') fields[key] = { stringValue: val };
        else if (typeof val === 'number') fields[key] = Number.isInteger(val) ? { integerValue: val.toString() } : { doubleValue: val };
        else if (typeof val === 'boolean') fields[key] = { booleanValue: val };
        else if (Array.isArray(val)) {
          fields[key] = { arrayValue: { values: val.map(item => ({ stringValue: String(item) })) } };
        } else if (typeof val === 'object') {
          fields[key] = { mapValue: { fields: this.formatFirestoreFields(val) } };
        }
      }
      return fields;
    }

    // =========================================================================
    // MOTOR PEDAGÓGICO CANÔNICO & ADAPTADOR DE FORMATOS
    // =========================================================================

    /**
     * Analisa o conteúdo pedagógico recebido (seja JSON canônico estruturado ou string legada)
     * e retorna um array normalizado de blocos didáticos canônicos.
     * Emite aviso explícito caso o fallback de regex/tags seja acionado.
     */
    parsePedagogicalContent(content, options = {}) {
      if (!content) return [];

      // 1. Caso já seja um array de blocos estruturados
      if (Array.isArray(content)) {
        return content;
      }

      // 2. Se for um objeto com campo 'blocks'
      if (typeof content === 'object' && Array.isArray(content.blocks)) {
        return content.blocks;
      }

      // 3. Se for string, verifica se é JSON serializado
      if (typeof content === 'string') {
        const trimmed = content.trim();
        if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
              // Verifica se os itens possuem o campo 'type' de blocos canônicos
              const isCanonical = parsed.some(b => b && typeof b.type === 'string');
              if (isCanonical) {
                return parsed;
              }
            }
            if (parsed && Array.isArray(parsed.blocks)) {
              return parsed.blocks;
            }
          } catch (e) {
            // Não é JSON válido, prossegue para o parser de fallback
          }
        }

        // 4. Fallback: Parsing de tags de texto legado ([LR], [VOC], [LA], [Q], etc.)
        const contextName = options.context || options.lessonTitle || options.id || 'conteúdo didático';
        console.warn('[AEF Pedagogical Engine] Usando parser legado de tags para: ' + contextName);
        return this.parseLegacyTags(trimmed);
      }

      return [];
    }

    /**
     * Converte texto com tags legadas em blocos pedagógicos estruturados (alias compatível com lesson-schema)
     */
    parseLegacyPedagogicalText(rawText, options = {}) {
      return this.parsePedagogicalContent(rawText, options);
    }

    /**
     * Parser de fallback para converter textos legados com marcadores em blocos estruturados (Modo Fail-Closed)
     */
    parseLegacyTags(rawText, options = {}) {
      if (!rawText) return [];
      const text = rawText.trim();
      if (!text) return [];

      const ANSWER_LEAK_REGEX = /(?:^|\s)(?:\[(?:A|Ans|Answer|Resposta|Resp|Gabarito)\]|\(?(?:A|Ans|Answer|Resposta|Resp|Gabarito)\)?\s*[:\-])/i;
      const QUESTION_LEAK_REGEX = /(?:^|\s)(?:\[(?:Q|Quest|Question|Pergunta|Perg|P|Ask)\]|\(?(?:Q|Quest|Question|Pergunta|Perg|P|Ask)\)?\s*[:\-])/i;

      // Tokenização estrita: captura tags completas [TAG] e tags malformadas sem fechamento [TAG
      const tagRegex = /\[(INTRO|LR|VOC|LA|Q|LRT|LASK|PRO|QR_CODE)(\]|(?=[\s\n\r\t:;.,]|$))/gi;
      const matches = [];
      let m;

      while ((m = tagRegex.exec(text)) !== null) {
        let normalizedType = m[1].toUpperCase();
        if (normalizedType === 'Q') normalizedType = 'LA';
        const isClosed = m[2] === ']';
        matches.push({
          tag: isClosed ? `[${m[1].toUpperCase()}]` : `[${m[1].toUpperCase()}`,
          type: normalizedType,
          index: m.index,
          isMalformed: !isClosed,
          tagLength: m[0].length
        });
      }

      if (matches.length === 0) {
        if (ANSWER_LEAK_REGEX.test(text) || QUESTION_LEAK_REGEX.test(text)) {
          console.warn('[AEF Pedagogical Engine] Texto sem tags contém formato de gabarito/resposta. Acionando proteção fail-closed.');
          return [{
            type: 'LA',
            tag: '[LA]',
            failClosed: true,
            warningNotice: 'Texto com formato de perguntas/respostas sem delimitação canônica. Bloco isolado para proteção do gabarito.',
            drills: [{
              negativeContext: 'Conteúdo em proteção pedagógica.',
              questionVariations: ['[Modo Seguro Ativado • Zero Respostas Reveladas]'],
              answerVariations: []
            }]
          }];
        }

        const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
        return [{
          type: 'LR',
          tag: '[LR]',
          paragraphs: paragraphs.length > 0 ? paragraphs : [text]
        }];
      }

      const blocks = [];

      for (let i = 0; i < matches.length; i++) {
        const current = matches[i];
        const startIndex = current.index + current.tagLength;
        const endIndex = i + 1 < matches.length ? matches[i + 1].index : text.length;
        let content = text.slice(startIndex, endIndex).trim();

        switch (current.type) {
          case 'INTRO': {
            const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
            let focus = '';
            const keyChunks = [];
            const grammarPoints = [];
            const recommendations = [];
            const roadblocks = [];
            let currentSection = 'focus';

            for (const line of lines) {
              if (/^\[(LA|LASK|Q|VOC|PRO)/i.test(line) || ANSWER_LEAK_REGEX.test(line)) {
                continue;
              }

              const lower = line.toLowerCase();
              if (lower.startsWith('chunks:') || lower.startsWith('key chunks:')) {
                currentSection = 'chunks';
                continue;
              }
              if (lower.startsWith('grammar:') || lower.startsWith('pontos gramaticais:')) {
                currentSection = 'grammar';
                continue;
              }
              if (lower.startsWith('recommendations:') || lower.startsWith('recomendações:')) {
                currentSection = 'recommendations';
                continue;
              }
              if (lower.startsWith('roadblocks:') || lower.startsWith('dificuldades:')) {
                currentSection = 'roadblocks';
                continue;
              }

              const clean = line.replace(/^[\*\•\-\d+\.]\s*/, '').trim();
              if (!clean) continue;

              if (currentSection === 'focus') focus = focus ? `${focus} ${clean}` : clean;
              else if (currentSection === 'chunks') keyChunks.push(clean);
              else if (currentSection === 'grammar') grammarPoints.push(clean);
              else if (currentSection === 'recommendations') recommendations.push(clean);
              else if (currentSection === 'roadblocks') roadblocks.push(clean);
            }

            blocks.push({
              type: 'INTRO',
              tag: '[INTRO]',
              focus: focus || 'Visão geral da lição.',
              keyChunks,
              grammarPoints,
              recommendations,
              roadblocks
            });
            break;
          }

          case 'LR': {
            const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
            const cleanLines = lines.filter(l => !/^\[(LA|LASK|Q|VOC|PRO)/i.test(l) && !ANSWER_LEAK_REGEX.test(l));
            const cleanContent = cleanLines.join('\n');
            const paragraphs = cleanContent.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
            blocks.push({
              type: 'LR',
              tag: '[LR]',
              paragraphs: paragraphs.length > 0 ? paragraphs : (cleanLines.length > 0 ? cleanLines : ['Narrativa didática.'])
            });
            break;
          }

          case 'VOC': {
            const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
            const items = [];
            const storyTranslation = [];

            for (const line of lines) {
              if (/^\[(LA|LASK|Q|LR|INTRO|PRO)/i.test(line) || ANSWER_LEAK_REGEX.test(line) || QUESTION_LEAK_REGEX.test(line)) {
                continue;
              }

              if (line.startsWith('TRADUÇÃO:') || line.startsWith('STORY:')) {
                storyTranslation.push(line.replace(/^(TRADUÇÃO|STORY):\s*/i, '').trim());
                continue;
              }
              const clean = line.replace(/^[\*\•\-\d+\.]\s*/, '').trim();
              const sepMatch = clean.match(/^(.*?)\s*[-–—:]\s*(.*)$/);
              if (sepMatch) {
                let target = sepMatch[1].trim();
                let remainder = sepMatch[2].trim();
                let grammarNote;
                const noteMatch = remainder.match(/\((.*?)\)$/);
                if (noteMatch) {
                  grammarNote = noteMatch[1].trim();
                  remainder = remainder.replace(/\((.*?)\)$/, '').trim();
                }
                items.push({
                  type: 'chunk',
                  target,
                  spokenTranslation: remainder || undefined,
                  grammarNote
                });
              } else if (clean) {
                items.push({ type: 'general', target: clean });
              }
            }

            blocks.push({
              type: 'VOC',
              tag: '[VOC]',
              items: items.length > 0 ? items : [{ type: 'general', target: content }],
              storyTranslation: storyTranslation.length > 0 ? storyTranslation : undefined
            });
            break;
          }

          case 'LA': {
            if (current.isMalformed) {
              console.warn('[AEF Pedagogical Engine] Tag [LA malformada sem fechamento. Acionando proteção fail-closed.');
              blocks.push({
                type: 'LA',
                tag: '[LA]',
                failClosed: true,
                warningNotice: 'Tag [LA malformada ou sem fechamento. Bloco isolado para proteção do gabarito.',
                drills: [{
                  negativeContext: 'Conteúdo em proteção pedagógica.',
                  questionVariations: ['[Modo Seguro Ativado • Zero Respostas Reveladas]'],
                  answerVariations: []
                }]
              });
              break;
            }

            const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
            const drills = [];
            let currentQuestion = '';
            let currentAnswers = [];
            let currentContext = '';
            let hasAmbiguityOrLeak = false;

            if (/\[(INTRO|LR|VOC|LA|Q|LRT|LASK|PRO|QR_CODE)/i.test(content)) {
              hasAmbiguityOrLeak = true;
            }

            for (const line of lines) {
              const inlineSplit = line.match(/^(.*?)\s+(?:\[(?:A|Ans|Answer|Resposta|Resp|Gabarito)\]|\(?(?:A|Ans|Answer|Resposta|Resp|Gabarito)\)?\s*[:\-])\s*(.*)$/i);
              if (inlineSplit) {
                if (currentQuestion) {
                  drills.push({
                    negativeContext: currentContext || currentQuestion,
                    questionVariations: [currentQuestion],
                    answerVariations: currentAnswers.length > 0 ? currentAnswers : ['Yes/No response']
                  });
                  currentAnswers = [];
                  currentContext = '';
                }
                const cleanQ = inlineSplit[1].replace(/^(?:\[(?:Q|Quest|Question|Pergunta|Perg|P|Ask)\]|\(?(?:Q|Quest|Question|Pergunta|Perg|P|Ask)\)?\s*[:\-]?|\d+[\.\)])\s*/i, '').trim();
                const cleanA = inlineSplit[2].trim();
                if (ANSWER_LEAK_REGEX.test(cleanQ)) {
                  hasAmbiguityOrLeak = true;
                }
                drills.push({
                  negativeContext: cleanQ,
                  questionVariations: [cleanQ],
                  answerVariations: cleanA ? [cleanA] : ['Yes/No response']
                });
                currentQuestion = '';
                continue;
              }

              const qMatch = line.match(/^(?:\[(?:Q|Quest|Question|Pergunta|Perg|P|Ask)\]|\(?(?:Q|Quest|Question|Pergunta|Perg|P|Ask)\)?\s*[:\-]?|\d+[\.\)])\s*(.*)$/i);
              const aMatch = line.match(/^(?:\[(?:A|Ans|Answer|Resposta|Resp|Gabarito)\]|\(?(?:A|Ans|Answer|Resposta|Resp|Gabarito)\)?\s*[:\-]?)\s*(.*)$/i);
              const cMatch = line.match(/^(?:Context|Cenário|Stimulus)\s*[:\-]?\s*(.*)$/i);

              if (cMatch) {
                currentContext = cMatch[1].trim();
              } else if (qMatch) {
                if (currentQuestion) {
                  drills.push({
                    negativeContext: currentContext || currentQuestion,
                    questionVariations: [currentQuestion],
                    answerVariations: currentAnswers.length > 0 ? currentAnswers : ['Yes/No']
                  });
                  currentAnswers = [];
                  currentContext = '';
                }
                currentQuestion = qMatch[1].trim();
                if (ANSWER_LEAK_REGEX.test(currentQuestion)) {
                  hasAmbiguityOrLeak = true;
                }
              } else if (aMatch) {
                currentAnswers.push(aMatch[1].trim());
              } else if (line.endsWith('?')) {
                if (currentQuestion) {
                  drills.push({
                    negativeContext: currentContext || currentQuestion,
                    questionVariations: [currentQuestion],
                    answerVariations: currentAnswers.length > 0 ? currentAnswers : ['Yes/No']
                  });
                  currentAnswers = [];
                  currentContext = '';
                }
                currentQuestion = line;
              } else if (currentQuestion) {
                currentAnswers.push(line);
              } else {
                if (ANSWER_LEAK_REGEX.test(line)) {
                  hasAmbiguityOrLeak = true;
                }
              }
            }

            if (currentQuestion) {
              drills.push({
                negativeContext: currentContext || currentQuestion,
                questionVariations: [currentQuestion],
                answerVariations: currentAnswers.length > 0 ? currentAnswers : ['Yes/No']
              });
            }

            const anyQuestionHasLeak = drills.some(d =>
              (d.questionVariations || []).some(q => ANSWER_LEAK_REGEX.test(q)) ||
              ANSWER_LEAK_REGEX.test(d.negativeContext || '')
            );

            if (hasAmbiguityOrLeak || anyQuestionHasLeak || drills.length === 0) {
              console.warn('[AEF Pedagogical Engine] Bloco LA com ambiguidade ou risco de vazamento de resposta. Acionando proteção fail-closed.');
              blocks.push({
                type: 'LA',
                tag: '[LA]',
                failClosed: true,
                warningNotice: 'Estrutura de perguntas e respostas ambígua. Bloco isolado para proteger o reflexo do aluno e evitar spoilers do gabarito.',
                drills: [{
                  negativeContext: 'Conteúdo em proteção pedagógica.',
                  questionVariations: ['[Modo Seguro Ativado • Zero Respostas Reveladas]'],
                  answerVariations: []
                }]
              });
            } else {
              blocks.push({
                type: 'LA',
                tag: '[LA]',
                drills
              });
            }
            break;
          }

          case 'LRT': {
            const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
            const guideQuestions = lines.map(l => l.replace(/^[\*\•\-\d+\.]\s*/, '').trim()).filter(Boolean);
            blocks.push({
              type: 'LRT',
              tag: '[LRT]',
              guideQuestions: guideQuestions.length > 0 ? guideQuestions : [content]
            });
            break;
          }

          case 'LASK': {
            if (current.isMalformed) {
              console.warn('[AEF Pedagogical Engine] Tag [LASK malformada sem fechamento. Acionando proteção fail-closed.');
              blocks.push({
                type: 'LASK',
                tag: '[LASK]',
                failClosed: true,
                warningNotice: 'Tag [LASK malformada ou sem fechamento. Bloco isolado para evitar vazamento prévio de perguntas.',
                drills: [{
                  negativeContext: 'Conteúdo em proteção pedagógica.',
                  questionVariations: ['[Modo Seguro Ativado • Zero Perguntas Reveladas]'],
                  answerVariations: []
                }]
              });
              break;
            }

            const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
            const drills = [];
            let hasAmbiguityOrLeak = false;

            if (/\[(INTRO|LR|VOC|LA|Q|LRT|LASK|PRO|QR_CODE)/i.test(content)) {
              hasAmbiguityOrLeak = true;
            }

            for (const line of lines) {
              const clean = line.replace(/^[\*\•\-\d+\.]\s*/, '').trim();
              const arrowMatch = clean.match(/^(.*?)\s*(?:->|➔|=>|:\s*pergunta:)\s*(.*)$/i);
              if (arrowMatch) {
                const stimulus = arrowMatch[1].trim();
                const question = arrowMatch[2].trim();
                if (QUESTION_LEAK_REGEX.test(stimulus) || stimulus.endsWith('?')) {
                  hasAmbiguityOrLeak = true;
                }
                drills.push({
                  negativeContext: stimulus,
                  questionVariations: [question],
                  answerVariations: []
                });
              } else if (clean) {
                if (clean.includes('?') || QUESTION_LEAK_REGEX.test(clean)) {
                  hasAmbiguityOrLeak = true;
                } else {
                  drills.push({
                    negativeContext: clean,
                    questionVariations: ['Ask question about stimulus'],
                    answerVariations: []
                  });
                }
              }
            }

            const anyStimulusHasLeak = drills.some(d =>
              QUESTION_LEAK_REGEX.test(d.negativeContext || '') ||
              (d.negativeContext || '').includes('?')
            );

            if (hasAmbiguityOrLeak || anyStimulusHasLeak || drills.length === 0) {
              console.warn('[AEF Pedagogical Engine] Bloco LASK com ambiguidade ou pergunta vazada no estímulo. Acionando proteção fail-closed.');
              blocks.push({
                type: 'LASK',
                tag: '[LASK]',
                failClosed: true,
                warningNotice: 'Estrutura de formulação de perguntas ambígua. Bloco isolado para proteger a regra de zero perguntas reveladas.',
                drills: [{
                  negativeContext: 'Conteúdo em proteção pedagógica.',
                  questionVariations: ['[Modo Seguro Ativado • Zero Perguntas Reveladas]'],
                  answerVariations: []
                }]
              });
            } else {
              blocks.push({
                type: 'LASK',
                tag: '[LASK]',
                drills
              });
            }
            break;
          }

          case 'PRO': {
            const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
            const fullTextWithLinking = [];
            let goldenTip = '';
            for (const line of lines) {
              if (/^\[(LA|LASK|Q|VOC)/i.test(line) || ANSWER_LEAK_REGEX.test(line)) {
                continue;
              }
              const tipMatch = line.match(/^(?:Sacada de Ouro|Golden Tip|Dica de Ouro)\s*[:\-]?\s*(.*)$/i);
              if (tipMatch) goldenTip = tipMatch[1].trim();
              else if (goldenTip) goldenTip += ` ${line}`;
              else fullTextWithLinking.push(line);
            }
            blocks.push({
              type: 'PRO',
              tag: '[PRO]',
              fullTextWithLinking: fullTextWithLinking.length > 0 ? fullTextWithLinking : [content],
              goldenTip: goldenTip || 'Conecte os sons consonantais na vogal seguinte para fluência contínua.'
            });
            break;
          }

          case 'QR_CODE': {
            const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
            let url = 'https://agoraeufalo.com.br';
            let instruction = 'Escaneie para acessar o Training Player';
            for (const line of lines) {
              if (/^https?:\/\//i.test(line)) url = line.trim();
              else instruction = line.replace(/^[\*\•\-]\s*/, '').trim();
            }
            blocks.push({
              type: 'QR_CODE',
              tag: '[QR_CODE]',
              url,
              instruction
            });
            break;
          }
        }
      }

      return blocks;
    }

    /**
     * Renderiza o fluxo completo de blocos didáticos em HTML no padrão Calm EdTech
     */
    renderPedagogicalBlocks(content, options = {}) {
      const blocks = this.parsePedagogicalContent(content, options);
      if (!blocks || blocks.length === 0) return '';

      const theme = options.themeId || 'amber';
      const rendered = blocks.map((b, idx) => this.renderPedagogicalBlock(b, theme, { ...options, index: idx })).join('\n');
      return `<div class="pedagogical-content-stream space-y-6 max-w-4xl mx-auto">${rendered}</div>`;
    }

    /**
     * Alias de compatibilidade para renderizar conteúdo pedagógico completo
     */
    renderPedagogicalContent(content, options = {}) {
      return this.renderPedagogicalBlocks(content, options);
    }


    /**
     * Renderiza um bloco didático individual em HTML de alto contraste
     */
    renderPedagogicalBlock(block, theme = 'amber', options = {}) {
      if (!block || !block.type) return '';

      switch (block.type) {
        case 'INTRO':
          return this.renderIntroBlock(block, theme);
        case 'LR':
          return this.renderLRBlock(block, theme);
        case 'VOC':
          return this.renderVocBlock(block, theme);
        case 'LA':
          return this.renderLABlock(block, theme);
        case 'LRT':
          return this.renderLRTBlock(block, theme);
        case 'LASK':
          return this.renderLASKBlock(block, theme);
        case 'PRO':
          return this.renderProBlock(block, theme);
        case 'QR_CODE':
          return this.renderQRCodeBlock(block, theme);
        default:
          return '';
      }
    }

    renderIntroBlock(block, theme) {
      const chunksHtml = (block.keyChunks || []).map(c => `<li class="flex items-start gap-2"><span class="text-amber-600 font-bold">•</span><span>${c}</span></li>`).join('');
      const grammarHtml = (block.grammarPoints || []).map(g => `<li class="flex items-start gap-2"><span class="text-amber-600 font-bold">•</span><span>${g}</span></li>`).join('');
      const recsHtml = (block.recommendations || []).map(r => `<li class="flex items-start gap-2"><span class="text-emerald-600 font-bold">✓</span><span>${r}</span></li>`).join('');
      const roadblocksHtml = (block.roadblocks || []).map(rb => `<li class="flex items-start gap-2"><span class="text-amber-700 font-bold">!</span><span>${rb}</span></li>`).join('');

      return `
        <div class="pedagogical-block intro-block bg-white border-2 border-amber-200 rounded-3xl p-6 sm:p-8 shadow-sm text-slate-900 mb-6">
          <div class="flex items-center gap-2 mb-4">
            <span class="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs uppercase tracking-wider">
              ✦ Visão Geral & Foco da Lição
            </span>
          </div>
          ${block.focus ? `
            <div class="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 mb-6">
              <p class="text-sm font-semibold text-amber-950 leading-relaxed">${block.focus}</p>
            </div>
          ` : ''}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            ${chunksHtml ? `<div class="p-4 rounded-xl bg-slate-50 border border-slate-200"><h4 class="font-bold text-slate-800 uppercase tracking-wide text-xs mb-2">Key Chunks</h4><ul class="space-y-1.5">${chunksHtml}</ul></div>` : ''}
            ${grammarHtml ? `<div class="p-4 rounded-xl bg-slate-50 border border-slate-200"><h4 class="font-bold text-slate-800 uppercase tracking-wide text-xs mb-2">Sentimento da Estrutura</h4><ul class="space-y-1.5">${grammarHtml}</ul></div>` : ''}
            ${recsHtml ? `<div class="p-4 rounded-xl bg-slate-50 border border-slate-200"><h4 class="font-bold text-slate-800 uppercase tracking-wide text-xs mb-2">Recomendações</h4><ul class="space-y-1.5">${recsHtml}</ul></div>` : ''}
            ${roadblocksHtml ? `<div class="p-4 rounded-xl bg-slate-50 border border-slate-200"><h4 class="font-bold text-slate-800 uppercase tracking-wide text-xs mb-2">Atenção ao Ponto Crítico</h4><ul class="space-y-1.5">${roadblocksHtml}</ul></div>` : ''}
          </div>
        </div>
      `;
    }

    renderLRBlock(block, theme) {
      const paragraphsHtml = (block.paragraphs || []).map(p => `
        <p class="text-base sm:text-[17px] text-slate-900 leading-relaxed font-medium mb-3">${p}</p>
      `).join('');

      return `
        <div class="pedagogical-block lr-block bg-amber-50/70 border-2 border-amber-200 rounded-3xl p-6 sm:p-8 shadow-sm text-slate-900 mb-6">
          <div class="flex items-center justify-between gap-3 mb-5 border-b border-amber-200/60 pb-3">
            <span class="px-3.5 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider">
              1. Listen & Read (LR)
            </span>
            <span class="text-xs text-amber-900 font-semibold italic">Foco 100% auditivo • Sem tradução na tela</span>
          </div>
          <div class="lr-content space-y-3">
            ${paragraphsHtml}
          </div>
        </div>
      `;
    }

    renderVocBlock(block, theme) {
      const itemsHtml = (block.items || []).map(item => `
        <div class="p-3.5 rounded-2xl bg-white border border-amber-200/80 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="font-bold text-slate-900 text-sm sm:text-base">${item.target}</span>
            <button class="w-6 h-6 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-800 flex items-center justify-center text-xs transition" title="Ouvir chunk">▶</button>
          </div>
          ${item.spokenTranslation ? `<div class="text-xs text-amber-950 font-medium">${item.spokenTranslation}</div>` : ''}
          ${item.grammarNote ? `<div class="text-[11px] text-slate-500 italic mt-1">${item.grammarNote}</div>` : ''}
        </div>
      `).join('');

      return `
        <div class="pedagogical-block voc-block bg-amber-50/50 border-2 border-amber-200 rounded-3xl p-6 sm:p-8 shadow-sm text-slate-900 mb-6">
          <div class="flex items-center justify-between gap-3 mb-5 border-b border-amber-200/60 pb-3">
            <span class="px-3.5 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider">
              2. Vocabulary Session (VOC)
            </span>
            <span class="text-xs text-amber-900 font-semibold italic">Matriz de Chunks & Português Falado Real</span>
          </div>
          ${block.storyTranslation && block.storyTranslation.length > 0 ? `
            <div class="mb-5 p-4 rounded-2xl bg-white/90 border border-amber-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <strong class="text-amber-950 block mb-1">Contexto Geral da História:</strong>
              ${block.storyTranslation.join('<br>')}
            </div>
          ` : ''}
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${itemsHtml}
          </div>
        </div>
      `;
    }

    renderLABlock(block, theme) {
      if (block && block.failClosed) {
        return this.renderFailClosedBlock('LA', block.warningNotice);
      }

      const drills = (block && block.drills && block.drills.length > 0)
        ? block.drills
        : (Array.isArray(block?.questions) ? block.questions.map(q => ({ negativeContext: q, questionVariations: [q] })) : []);

      const ANSWER_LEAK_REGEX = /(?:^|\s)(?:\[(?:A|Ans|Answer|Resposta|Resp|Gabarito)\]|\(?(?:A|Ans|Answer|Resposta|Resp|Gabarito)\)?\s*[:\-])/i;
      const hasLeak = drills.some(d =>
        (d.questionVariations || []).some(q => ANSWER_LEAK_REGEX.test(q)) ||
        ANSWER_LEAK_REGEX.test(d.negativeContext || '')
      );
      if (hasLeak) {
        return this.renderFailClosedBlock('LA', 'Proteção ativa: indicador de resposta detectado no enunciado.');
      }

      // Regra Estrita Canônica: Zero respostas reveladas na tela do aluno!
      const drillsHtml = drills.map((d, idx) => {
        const question = d.questionVariations?.[0] || d.negativeContext || 'Question';
        return `
          <div class="py-3 border-b border-amber-200/50 last:border-0">
            <div class="flex items-start gap-2.5">
              <span class="font-bold text-amber-800 text-sm w-6 shrink-0">${idx + 1}.</span>
              <div class="flex-1">
                <p class="text-sm sm:text-base font-semibold text-slate-900 leading-snug">${question}</p>
                <div class="h-6 border-b border-dashed border-slate-300 mt-2"></div>
              </div>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="pedagogical-block la-block bg-white border-2 border-amber-200 rounded-3xl p-6 sm:p-8 shadow-sm text-slate-900 mb-6">
          <div class="flex items-center justify-between gap-3 mb-5 border-b border-amber-200/60 pb-3">
            <span class="px-3.5 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider">
              3. Listen & Answer (LA)
            </span>
            <span class="text-xs text-amber-900 font-semibold italic">Reflexo imediato • Zero respostas reveladas</span>
          </div>
          <div class="space-y-1">
            ${drillsHtml}
          </div>
        </div>
      `;
    }

    renderLRTBlock(block, theme) {
      const questionsHtml = (block.guideQuestions || []).map((q, idx) => `
        <li class="flex items-start gap-2 py-1.5 text-sm sm:text-base text-slate-900 font-medium">
          <span class="text-amber-800 font-bold">${idx + 1}.</span>
          <span>${q}</span>
        </li>
      `).join('');

      return `
        <div class="pedagogical-block lrt-block bg-white border-2 border-amber-200 rounded-3xl p-6 sm:p-8 shadow-sm text-slate-900 mb-6">
          <div class="flex items-center justify-between gap-3 mb-5 border-b border-amber-200/60 pb-3">
            <span class="px-3.5 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider">
              4. Look & Retell (LRT)
            </span>
            <span class="text-xs text-amber-900 font-semibold italic">Speaking ativo guiado pelas perguntas de LA</span>
          </div>
          <p class="text-xs text-slate-600 mb-3 italic">Reconte a história com suas próprias palavras utilizando as perguntas como roteiro mental:</p>
          <ul class="space-y-1">
            ${questionsHtml}
          </ul>
        </div>
      `;
    }

    renderLASKBlock(block, theme) {
      if (block && block.failClosed) {
        return this.renderFailClosedBlock('LASK', block.warningNotice);
      }

      const drills = (block && block.drills && block.drills.length > 0)
        ? block.drills
        : (Array.isArray(block?.prompts) ? block.prompts.map(p => ({ negativeContext: p })) : []);

      const QUESTION_LEAK_REGEX = /(?:^|\s)(?:\[(?:Q|Quest|Question|Pergunta|Perg|P|Ask)\]|\(?(?:Q|Quest|Question|Pergunta|Perg|P|Ask)\)?\s*[:\-])/i;
      const hasLeak = drills.some(d =>
        QUESTION_LEAK_REGEX.test(d.negativeContext || '') ||
        (d.negativeContext || '').trim().endsWith('?')
      );
      if (hasLeak) {
        return this.renderFailClosedBlock('LASK', 'Proteção ativa: pergunta detectada no estímulo.');
      }

      // Regra Estrita Canônica: Zero perguntas reveladas na tela do aluno!
      const drillsHtml = drills.map((d, idx) => {
        const stimulus = d.negativeContext || 'Stimulus';
        return `
          <div class="py-3 border-b border-amber-200/50 last:border-0">
            <div class="flex items-start gap-2.5">
              <span class="font-bold text-amber-800 text-sm w-6 shrink-0">${idx + 1}.</span>
              <div class="flex-1">
                <p class="text-sm sm:text-base font-semibold text-slate-900 leading-snug">${stimulus}</p>
                <div class="h-6 border-b border-dashed border-slate-300 mt-2"></div>
              </div>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="pedagogical-block lask-block bg-white border-2 border-amber-200 rounded-3xl p-6 sm:p-8 shadow-sm text-slate-900 mb-6">
          <div class="flex items-center justify-between gap-3 mb-5 border-b border-amber-200/60 pb-3">
            <span class="px-3.5 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider">
              5. Listen & Ask (LASK)
            </span>
            <span class="text-xs text-amber-900 font-semibold italic">Formulação no reflexo • Zero perguntas reveladas</span>
          </div>
          <p class="text-xs text-slate-600 mb-3 italic">Leia a afirmação/negação e formule a pergunta correspondente no reflexo:</p>
          <div class="space-y-1">
            ${drillsHtml}
          </div>
        </div>
      `;
    }

    /**
     * Renderiza o card seguro de aviso didático em modo Fail-Closed (Calm EdTech)
     */
    renderFailClosedBlock(blockType, customNotice) {
      const isLA = blockType === 'LA';
      const badge = isLA ? '3. Listen & Answer (LA) • Proteção Ativa' : '5. Listen & Ask (LASK) • Proteção Ativa';
      const invariantTitle = isLA ? 'Zero respostas reveladas na tela' : 'Zero perguntas reveladas previamente';
      const defaultNotice = isLA
        ? 'Para garantir o princípio inegociável de reflexo auditivo e evitar spoilers do gabarito (Zero respostas reveladas), a renderização automática deste exercício foi suspensa devido a inconsistências na formatação de origem. O áudio do exercício pode ser praticado diretamente no Training Player.'
        : 'Para garantir que nenhuma pergunta seja revelada previamente (Zero perguntas reveladas) e manter o desafio de formulação rápida no reflexo, a renderização deste bloco foi isolada preventivamente. Pratique a escuta ativa no Training Player.';
      const notice = customNotice || defaultNotice;

      return `
        <div class="pedagogical-block fail-closed-block bg-amber-50/80 border-2 border-amber-300 rounded-3xl p-6 sm:p-8 shadow-sm text-slate-900 mb-6" data-fail-closed="${blockType}">
          <div class="flex items-center justify-between gap-3 mb-4 border-b border-amber-200/80 pb-3">
            <span class="px-3.5 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span>🔒</span> ${badge}
            </span>
            <span class="text-xs text-amber-900 font-bold italic">${invariantTitle}</span>
          </div>
          <div class="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs">
            <div class="flex items-start gap-3">
              <span class="text-xl shrink-0">🛡️</span>
              <div>
                <h4 class="font-bold text-amber-950 text-sm mb-1">Aviso Didático: Conteúdo em Proteção Pedagógica (Modo Fail-Closed Ativado)</h4>
                <p class="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">${notice}</p>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    renderProBlock(block, theme) {
      const sentencesHtml = (block.fullTextWithLinking || []).map(s => `
        <p class="text-base sm:text-[17px] text-slate-900 leading-relaxed font-medium mb-3">${s}</p>
      `).join('');

      return `
        <div class="pedagogical-block pro-block bg-white border-2 border-amber-200 rounded-3xl p-6 sm:p-8 shadow-sm text-slate-900 mb-6">
          <div class="flex items-center justify-between gap-3 mb-5 border-b border-amber-200/60 pb-3">
            <span class="px-3.5 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider">
              6. Pronunciation & Connected Speech (PRO)
            </span>
            <span class="text-xs text-amber-900 font-semibold italic">Texto completo com marcações sonoras e linking</span>
          </div>
          <div class="pro-content space-y-3 mb-6">
            ${sentencesHtml}
          </div>
          ${block.goldenTip ? `
            <div class="golden-tip-box bg-amber-100/90 border-2 border-amber-400 rounded-2xl p-5 shadow-xs">
              <div class="font-serif font-black text-amber-900 text-xs sm:text-sm uppercase tracking-wider mb-1.5 flex items-center gap-2">
                <span>💡</span> SACADA DE OURO DO PROFESSOR LEO
              </div>
              <p class="text-xs sm:text-sm text-amber-950 leading-relaxed font-medium">
                ${block.goldenTip}
              </p>
            </div>
          ` : ''}
        </div>
      `;
    }

    renderQRCodeBlock(block, theme) {
      return `
        <div class="pedagogical-block qr-block bg-white border-2 border-amber-200 rounded-2xl p-6 text-center shadow-xs my-6">
          <p class="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">${block.instruction || 'Escaneie para acessar o conteúdo'}</p>
          <a href="${block.url}" target="_blank" class="inline-block text-xs text-amber-700 underline font-mono break-all">${block.url}</a>
        </div>
      `;
    }
  }

  // Exportação Global
  const aefBlockEngineInstance = new AEFBlockEngine();
  const aefPedagogicalEngineInstance = {
    parse: (content, opt) => aefBlockEngineInstance.parsePedagogicalContent(content, opt),
    parseLegacyPedagogicalText: (content, opt) => aefBlockEngineInstance.parseLegacyPedagogicalText(content, opt),
    render: (content, opt) => aefBlockEngineInstance.renderPedagogicalBlocks(content, opt),
    renderBlock: (block, theme, opt) => aefBlockEngineInstance.renderPedagogicalBlock(block, theme, opt),
    renderFailClosedBlock: (type, notice) => aefBlockEngineInstance.renderFailClosedBlock(type, notice)
  };

  if (typeof root !== 'undefined') {
    root.AEFBlockEngine = AEFBlockEngine;
    root.aefBlockEngine = aefBlockEngineInstance;
    root.AEFPedagogicalEngine = AEFBlockEngine;
    root.aefPedagogicalEngine = aefPedagogicalEngineInstance;
  }

  // Auto-renderiza slots de marketing quando a página carregar no navegador
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => aefBlockEngineInstance.renderAllSlots());
    } else {
      aefBlockEngineInstance.renderAllSlots();
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      AEFBlockEngine,
      aefBlockEngine: aefBlockEngineInstance,
      AEFPedagogicalEngine: AEFBlockEngine,
      aefPedagogicalEngine: aefPedagogicalEngineInstance
    };
  }

})(typeof window !== 'undefined' ? window : globalThis);
