/**
 * AgoraEuFalo • Offers & Entitlements Engine
 * Professor Leonardo Leite
 * 
 * Gerencia a matriz dinâmica de ofertas, regras de acesso (Entitlements),
 * cálculo milimétrico dos 2 tipos de Trials (Free Trial vs. Test-Drive),
 * campanhas de migração e persistência no Google Cloud Firestore.
 */

(function (window) {
  'use strict';

  const DEFAULT_OFFERS = [
    {
      id: "plano-anual-aef-2026",
      title: "AgoraEuFalo Club 2026 • Assinatura Anual",
      slug: "plano-anual-2026",
      badge: "PLANO OFICIAL",
      status: "active",
      grantedCourses: ["ms-legacy", "english-quickstart", "frases-prontas"],
      grantedTier: "club_annual",
      showOnCatalog: true,
      accessDuration: {
        type: "months",
        value: 12,
        isLifetime: false
      },
      pricing: {
        billingType: "subscription",
        trialMode: "none",
        trialDays: 0,
        currency: "BRL",
        fullPrice: 997.00,
        offerPrice: 497.00,
        installments: "12x de R$ 49,90",
        paymentMethods: ["credit_card", "pix", "boleto"],
        checkoutUrl: "https://pay.hotmart.com/OFFER_ANUAL_2026"
      },
      campaignExpiry: {
        hasExpiry: false,
        expiresAt: null,
        maxSpots: null
      },
      salesPageData: {
        targetAudience: "Quem quer destravar a fala e treinar reflexos diários sem decoreba de regras",
        mainHeadline: "Pare de estudar regras. Repita a experiência até a fala virar reflexo.",
        differentials: [
          "Acesso completo ao acervo Magic Stories e cursos oficiais",
          "Treino prático ilimitado no Spoken Reflex Studio",
          "Modo Avião no Training Player para treinar 100% offline",
          "Treino de fala ativa e reconto no Training Player",
          "Apostilas oficiais diagramadas em PDF A4",
          "Canal direto de dúvidas com o Professor Leo"
        ],
        hasVideo: false,
        videoEmbedUrl: "",
        generatedPageUrl: "ofertas/plano-anual-2026.html"
      },
      hotmartData: {
        productId: "HOTMART_PROD_CLUB",
        offerCode: "CLUB_ANUAL_2026"
      },
      createdAt: new Date().toISOString()
    },
    {
      id: "trial-7-dias-gratis",
      title: "Degustação 7 Dias Grátis • Magic Stories Club",
      slug: "trial-7-dias-gratis",
      badge: "7 DIAS GRÁTIS",
      status: "active",
      grantedCourses: ["ms-legacy", "english-quickstart", "frases-prontas"],
      grantedTier: "club_annual",
      showOnCatalog: true,
      accessDuration: {
        type: "months",
        value: 1,
        isLifetime: false
      },
      pricing: {
        billingType: "subscription",
        trialMode: "free_trial", // 1. Grátis: 1ª cobrança após 7 dias; próximas cobradas no dia da 1ª cobrança
        trialDays: 7,
        currency: "BRL",
        fullPrice: 49.90,
        offerPrice: 49.90,
        installments: "R$ 49,90/mês após os 7 dias",
        paymentMethods: ["credit_card"],
        checkoutUrl: "https://pay.hotmart.com/OFFER_TRIAL_7D"
      },
      campaignExpiry: {
        hasExpiry: false,
        expiresAt: null,
        maxSpots: null
      },
      salesPageData: {
        targetAudience: "Quem deseja experimentar o método na prática sem nenhum risco",
        mainHeadline: "Experimente 7 dias grátis. Sinta a fala virar reflexo já na primeira história.",
        differentials: [
          "7 dias de acesso total e irrestrito a todos os treinos",
          "Cancele a qualquer momento com 1 clique antes do 7º dia",
          "AI Speech Coach e Training Player liberados"
        ],
        hasVideo: false,
        videoEmbedUrl: "",
        generatedPageUrl: "ofertas/trial-7-dias-gratis.html"
      },
      hotmartData: {
        productId: "HOTMART_PROD_CLUB",
        offerCode: "TRIAL_7D_FREE"
      },
      createdAt: new Date().toISOString()
    },
    {
      id: "migracao-first-steps-6m",
      title: "Resgate Exclusivo Alunos First Steps • 6 Meses Presente",
      slug: "migracao-first-steps",
      badge: "EXCLUSIVO LEGACY",
      status: "active",
      isMigrationClaim: true,
      grantedCourses: ["english-quickstart"],
      grantedTier: "course_member",
      showOnCatalog: false,
      accessDuration: {
        type: "months",
        value: 6,
        isLifetime: false
      },
      pricing: {
        billingType: "free",
        trialMode: "none",
        trialDays: 0,
        currency: "BRL",
        fullPrice: 0.00,
        offerPrice: 0.00,
        installments: "100% Gratuito (Presente do Leo)",
        paymentMethods: [],
        checkoutUrl: ""
      },
      campaignExpiry: {
        hasExpiry: false,
        expiresAt: null,
        maxSpots: null
      },
      salesPageData: {
        targetAudience: "Alunos que estudaram no curso clássico First Steps há anos",
        mainHeadline: "Bem-vindo de volta! 6 meses de presente para você reativar seu inglês.",
        differentials: [
          "Acesso completo ao novo English QuickStart",
          "Training Player com áudios de estúdio e repetição em loop",
          "Sem necessidade de cartão de crédito para ativação"
        ],
        hasVideo: false,
        videoEmbedUrl: "",
        generatedPageUrl: "migracao/first-steps.html"
      },
      hotmartData: {
        productId: "LEGACY_FIRST_STEPS",
        offerCode: "FIRST_STEPS_GIFT_6M"
      },
      createdAt: new Date().toISOString()
    }
  ];

  class AEFOffersEngine {
    constructor() {
      this.db = null;
      this.cachedOffers = null;
    }

    async init() {
      if (window.aefCloudSync) {
        await window.aefCloudSync.init();
        this.db = window.firebase ? window.firebase.firestore() : null;
      }
    }

    /**
     * Retorna todas as ofertas cadastradas (Firestore com fallback para DEFAULT_OFFERS)
     */
    async getAllOffers() {
      await this.init();
      try {
        if (this.db) {
          const snap = await this.db.collection('offers').orderBy('createdAt', 'desc').get();
          if (!snap.empty) {
            const list = [];
            snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
            this.cachedOffers = list;
            return list;
          }
        } else {
          // REST API Fetch
          const res = await fetch("https://firestore.googleapis.com/v1/projects/agoraeufalo-3463a/databases/(default)/documents/offers");
          if (res.ok) {
            const data = await res.json();
            if (data && data.documents && data.documents.length > 0) {
              const list = data.documents.map(doc => {
                const f = doc.fields || {};
                const id = f.id?.stringValue || doc.name.split("/").pop();
                return {
                  id: id,
                  title: f.title?.stringValue || id,
                  slug: f.slug?.stringValue || id,
                  badge: f.badge?.stringValue || "OFERTA",
                  status: f.status?.stringValue || "active",
                  isMigrationClaim: f.isMigrationClaim?.booleanValue || false,
                  grantedTier: f.grantedTier?.stringValue || "club_annual",
                  grantedCourses: f.grantedCourses?.arrayValue?.values?.map(v => v.stringValue) || ["ms-legacy"],
                  accessDuration: {
                    type: f.accessDuration?.mapValue?.fields?.type?.stringValue || "months",
                    value: parseInt(f.accessDuration?.mapValue?.fields?.value?.integerValue || "12"),
                    isLifetime: f.accessDuration?.mapValue?.fields?.isLifetime?.booleanValue || false
                  },
                  pricing: {
                    billingType: f.pricing?.mapValue?.fields?.billingType?.stringValue || "subscription",
                    trialMode: f.pricing?.mapValue?.fields?.trialMode?.stringValue || "none",
                    trialDays: parseInt(f.pricing?.mapValue?.fields?.trialDays?.integerValue || "0"),
                    fullPrice: parseFloat(f.pricing?.mapValue?.fields?.fullPrice?.doubleValue || "497"),
                    offerPrice: parseFloat(f.pricing?.mapValue?.fields?.offerPrice?.doubleValue || "497"),
                    installments: f.pricing?.mapValue?.fields?.installments?.stringValue || "",
                    checkoutUrl: f.pricing?.mapValue?.fields?.checkoutUrl?.stringValue || ""
                  },
                  salesPageData: {
                    targetAudience: f.salesPageData?.mapValue?.fields?.targetAudience?.stringValue || "",
                    mainHeadline: f.salesPageData?.mapValue?.fields?.mainHeadline?.stringValue || "",
                    differentials: f.salesPageData?.mapValue?.fields?.differentials?.arrayValue?.values?.map(v => v.stringValue) || [],
                    hasVideo: f.salesPageData?.mapValue?.fields?.hasVideo?.booleanValue || false,
                    videoEmbedUrl: f.salesPageData?.mapValue?.fields?.videoEmbedUrl?.stringValue || "",
                    generatedPageUrl: f.salesPageData?.mapValue?.fields?.generatedPageUrl?.stringValue || ""
                  },
                  hotmartData: {
                    productId: f.hotmartData?.mapValue?.fields?.productId?.stringValue || "",
                    offerCode: f.hotmartData?.mapValue?.fields?.offerCode?.stringValue || ""
                  },
                  createdAt: f.createdAt?.stringValue || new Date().toISOString()
                };
              });
              this.cachedOffers = list;
              return list;
            }
          }
        }
      } catch (err) {
        console.warn("Using default fallback offers:", err);
      }

      this.cachedOffers = DEFAULT_OFFERS;
      return DEFAULT_OFFERS;
    }

    /**
     * Salva ou atualiza uma oferta no Firestore
     */
    async saveOffer(offerData) {
      await this.init();
      const offerId = offerData.id || offerData.slug || `offer_${Date.now()}`;
      offerData.id = offerId;
      offerData.updatedAt = new Date().toISOString();
      if (!offerData.createdAt) offerData.createdAt = offerData.updatedAt;

      try {
        if (this.db) {
          await this.db.collection('offers').doc(offerId).set(offerData, { merge: true });
        } else {
          // REST Fallback
          const url = `https://firestore.googleapis.com/v1/projects/agoraeufalo-3463a/databases/(default)/documents/offers/${offerId}`;
          const fields = this.formatFirestoreFields(offerData);
          await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fields })
          });
        }
        return { success: true, offer: offerData };
      } catch (err) {
        console.error("Erro ao salvar oferta no Firestore:", err);
        throw err;
      }
    }

    /**
     * Deleta uma oferta no Firestore
     */
    async deleteOffer(offerId) {
      await this.init();
      if (this.db) {
        await this.db.collection('offers').doc(offerId).delete();
      } else {
        await fetch(`https://firestore.googleapis.com/v1/projects/agoraeufalo-3463a/databases/(default)/documents/offers/${offerId}`, {
          method: 'DELETE'
        });
      }
      return { success: true };
    }

    /**
     * Cálculo de Datas & Ciclos conforme o tipo de Período de Testes (Trial Grátis vs Test-Drive)
     */
    calculateAccessDates(offer, purchaseDate = new Date()) {
      const pDate = new Date(purchaseDate);
      const trialMode = offer.pricing?.trialMode || 'none';
      const trialDays = offer.pricing?.trialDays || 0;
      
      let trialEndsAt = null;
      let firstBillingDate = null;
      let nextRecurrenceAnchorDay = pDate.getDate(); // Padrão Test-drive
      let accessExpiresAt = null;

      // 1. TRIAL GRÁTIS:
      // O cliente não paga pelo período de teste. A 1ª cobrança ocorre ao final do prazo definido (D+trialDays).
      // As próximas recorrências ocorrem no dia do primeiro pagamento.
      if (trialMode === 'free_trial' && trialDays > 0) {
        const trialEnd = new Date(pDate);
        trialEnd.setDate(trialEnd.getDate() + trialDays);
        trialEndsAt = trialEnd.toISOString();
        firstBillingDate = trialEnd.toISOString();
        nextRecurrenceAnchorDay = trialEnd.getDate(); // Ancorado no dia do 1º pagamento
      }

      // 2. TEST-DRIVE:
      // A primeira cobrança é feita após o prazo do test-drive (D+trialDays).
      // As próximas recorrências são cobradas no dia da compra do test-drive (ancorado em pDate).
      else if (trialMode === 'test_drive' && trialDays > 0) {
        const trialEnd = new Date(pDate);
        trialEnd.setDate(trialEnd.getDate() + trialDays);
        trialEndsAt = trialEnd.toISOString();
        firstBillingDate = trialEnd.toISOString();
        nextRecurrenceAnchorDay = pDate.getDate(); // Ancorado no dia da compra
      }

      // 3. CÁLCULO DA EXPIRAÇÃO DO ACESSO (Duração do Contrato/Plano)
      if (offer.accessDuration?.isLifetime) {
        accessExpiresAt = null; // Vitalício
      } else {
        const durationType = offer.accessDuration?.type || 'months';
        const durationVal = offer.accessDuration?.value || 12;
        const expDate = new Date(pDate);

        if (durationType === 'days') {
          expDate.setDate(expDate.getDate() + durationVal + (trialDays || 0));
        } else if (durationType === 'months') {
          expDate.setMonth(expDate.getMonth() + durationVal);
          if (trialDays > 0) expDate.setDate(expDate.getDate() + trialDays);
        } else if (durationType === 'years') {
          expDate.setFullYear(expDate.getFullYear() + durationVal);
          if (trialDays > 0) expDate.setDate(expDate.getDate() + trialDays);
        }
        accessExpiresAt = expDate.toISOString();
      }

      return {
        purchaseDate: pDate.toISOString(),
        trialMode: trialMode,
        trialDays: trialDays,
        trialEndsAt: trialEndsAt,
        firstBillingDate: firstBillingDate,
        nextRecurrenceAnchorDay: nextRecurrenceAnchorDay,
        accessExpiresAt: accessExpiresAt,
        isLifetime: offer.accessDuration?.isLifetime || false
      };
    }

    /**
     * Localiza a melhor oferta para um determinado código de produto Hotmart ou Stripe
     */
    async matchOfferByCodeOrName(codeOrName) {
      const offers = await this.getAllOffers();
      if (!codeOrName) return offers[0];

      const clean = codeOrName.toString().toUpperCase().trim();
      return offers.find(o => 
        (o.hotmartData?.offerCode && o.hotmartData.offerCode.toUpperCase() === clean) ||
        (o.hotmartData?.productId && o.hotmartData.productId.toUpperCase() === clean) ||
        (o.slug && o.slug.toUpperCase() === clean) ||
        (o.id && o.id.toUpperCase() === clean) ||
        (o.title && o.title.toUpperCase().includes(clean))
      ) || offers[0];
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

  window.aefOffersEngine = new AEFOffersEngine();
})(window);
