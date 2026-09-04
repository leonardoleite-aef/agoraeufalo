/**
 * AgoraEuFalo • Dynamic Marketing Block Engine & Delivery System
 * Professor Leonardo Leite
 * 
 * Motor autônomo de entrega contextual de blocos de marketing (Modais, Cards In-Feed, Banners).
 * Conecta peças criativas às Ofertas Comerciais cadastradas no Departamento de Vendas (aef-offers-registry.js),
 * aplicando segmentação rigorosa por Tiers de usuário (Free, Club, VIP, Unauthenticated).
 */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'aef_marketing_blocks_cache_v3';

  // Sementes Canônicas de Blocos de Marketing
  const CANONICAL_BLOCKS_SEED = [
    {
      id: "modal-paywall-ms-club",
      title: "Modal de Bloqueio • Assine o Magic Stories Club",
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
        headline: "Destrave as 6 Atividades do Magic Stories Club",
        subhead: "Treine no carro, academia e caminhada sem telas ligadas. O método prático para transformar o inglês em reflexo natural.",
        bodyHtml: `
          <ul class="space-y-2 text-xs text-slate-300">
            <li class="flex items-center gap-2"><span class="text-amber-400 font-bold">✓</span> Acesso total a todas as Magic Stories clássicas</li>
            <li class="flex items-center gap-2"><span class="text-amber-400 font-bold">✓</span> Áudios de estúdio Dual-Speaker com seek milimétrico</li>
            <li class="flex items-center gap-2"><span class="text-amber-400 font-bold">✓</span> Repetição contínua em loop e Modo Bolso / Lockscreen</li>
            <li class="flex items-center gap-2"><span class="text-amber-400 font-bold">✓</span> Apostilas diagramadas de 8 páginas em PDF A4</li>
          </ul>
        `,
        mediaType: "image",
        mediaUrl: "assets/images/cover-magic-stories-legacy.jpg",
        ctaText: "Garantir Minha Vaga no Club",
        ctaSecondaryText: "Continuar Treinando no QuickStart Grátis"
      },
      status: "active",
      createdAt: "2026-09-01T00:00:00.000Z",
      updatedAt: "2026-09-03T22:00:00.000Z"
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
      status: "active",
      createdAt: "2026-09-01T00:00:00.000Z",
      updatedAt: "2026-09-03T22:00:00.000Z"
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
      status: "active",
      createdAt: "2026-09-01T00:00:00.000Z",
      updatedAt: "2026-09-03T22:00:00.000Z"
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
      updatedAt: "2026-09-03T22:00:00.000Z"
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
        headline: "Abata o Valor do Seu Curso Anterior no Magic Stories Club",
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
      status: "active",
      createdAt: "2026-09-04T00:00:00.000Z",
      updatedAt: "2026-09-04T00:00:00.000Z"
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

      // 1. Lê do localStorage de imediato
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.blocks = parsed;
          }
        }
      } catch (e) {
        console.warn("[AEFBlockEngine] Falha ao ler cache local:", e);
      }

      if (!this.blocks || this.blocks.length === 0) {
        this.blocks = JSON.parse(JSON.stringify(CANONICAL_BLOCKS_SEED));
        this.saveToLocalCache();
      } else {
        // Garante que novos blocos canônicos da seed sejam mesclados no cache existente
        let addedNew = false;
        CANONICAL_BLOCKS_SEED.forEach(seed => {
          if (!this.blocks.some(b => b.id === seed.id)) {
            this.blocks.push(JSON.parse(JSON.stringify(seed)));
            addedNew = true;
          }
        });
        if (addedNew) this.saveToLocalCache();
      }

      // 2. Conecta ao Firebase se disponível
      if (window.aefCloudSync) {
        try {
          await window.aefCloudSync.init();
          this.db = window.firebase ? window.firebase.firestore() : null;
        } catch (e) {}
      }

      // 3. Sincroniza em background
      await this.syncFromFirestore();

      // 4. Garante que o registro de ofertas esteja pronto
      if (window.aefOffersRegistry) {
        await window.aefOffersRegistry.init();
      }

      this.initialized = true;
      return this.blocks;
    }

    saveToLocalCache() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.blocks));
      } catch (e) {}
    }

    async syncFromFirestore() {
      try {
        if (this.db) {
          const snap = await this.db.collection('marketing_blocks').orderBy('createdAt', 'desc').get();
          if (!snap.empty) {
            const list = [];
            snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
            if (list.length > 0) {
              this.blocks = list;
              this.saveToLocalCache();
              return list;
            }
          }
        } else {
          // REST Fallback
          const res = await fetch("https://firestore.googleapis.com/v1/projects/agoraeufalo-3463a/databases/(default)/documents/marketing_blocks");
          if (res.ok) {
            const data = await res.json();
            if (data && data.documents && data.documents.length > 0) {
              const list = data.documents.map(doc => this.parseFirestoreDocument(doc));
              if (list.length > 0) {
                this.blocks = list;
                this.saveToLocalCache();
                return list;
              }
            }
          }
        }
      } catch (e) {}
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

      // Ordena por prioridade descendente
      candidates.sort((a, b) => (b.placement?.priority || 50) - (a.placement?.priority || 50));
      return candidates[0];
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
              <a href="${ctaUrl}" target="_blank" class="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg hover:shadow-amber-500/20 flex items-center gap-2 active:scale-95 cursor-pointer">
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
            <a href="${ctaUrl}" target="_blank" class="px-3.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-900 text-white font-black text-[11px] uppercase tracking-wider transition shrink-0 shadow-sm flex items-center gap-1 cursor-pointer">
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
  }

  // Exportação Global
  window.AEFBlockEngine = AEFBlockEngine;
  window.aefBlockEngine = new AEFBlockEngine();

  // Auto-renderiza quando a página carregar
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => window.aefBlockEngine.renderAllSlots());
    } else {
      window.aefBlockEngine.renderAllSlots();
    }
  }

})(window);
