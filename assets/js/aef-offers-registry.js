/**
 * AgoraEuFalo • Commercial Offers & Products Registry (Single Source of Truth)
 * Professor Leonardo Leite
 * 
 * Biblioteca unificada de ofertas comerciais para o Departamento de Vendas.
 * Gerencia preços, parcelamento, links de checkout da Hotmart, triagem no WhatsApp,
 * regras de escassez, entitlements (tiers concedidos) e sincronização com Google Cloud Firestore.
 */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'aef_offers_registry_cache_v3';

  // Sementes Canônicas Oficiais dos Produtos AgoraEuFalo
  const CANONICAL_OFFERS_SEED = [
    {
      id: "ms-club-anual",
      title: "Magic Stories Club • Assinatura Anual (Plano Oficial)",
      slug: "ms-club-anual",
      productId: "ms-club",
      productTitle: "Magic Stories Club",
      badge: "PLANO OFICIAL",
      status: "active",
      provider: "hotmart",
      isPendingHotmartLink: true,
      checkoutUrl: "https://pay.hotmart.com/OFFER_MS_CLUB_ANUAL",
      whatsappNumber: "+55 11 99616-0910",
      whatsappPrefillText: "Olá Professor Leo! Quero tirar uma dúvida sobre a matrícula no Magic Stories Club Anual.",
      grantedTier: "club_annual",
      grantedCourses: ["ms-legacy", "english-quickstart", "frases-prontas"],
      accessDuration: {
        type: "months",
        value: 12,
        isLifetime: false
      },
      pricing: {
        billingType: "subscription",
        regularPrice: 997.00,
        offerPrice: 497.00,
        currency: "BRL",
        installmentsText: "12x de R$ 49,70",
        trialMode: "none",
        trialDays: 0
      },
      scarcity: {
        hasCountdown: false,
        expiresAt: null,
        countdownMinutes: null,
        redirectOnExpireUrl: "",
        spotsLeft: null
      },
      hotmartSetupSpec: {
        suggestedProductName: "AgoraEuFalo • Magic Stories Club (Anual)",
        format: "Assinatura Anual (Recorrência a cada 12 meses)",
        suggestedOfferCode: "CLUB_ANUAL_2026",
        regularPriceFormatted: "R$ 997,00",
        offerPriceFormatted: "R$ 497,00",
        installmentsFormatted: "12x de R$ 49,70",
        recommendedTracking: "src=portal_free&sck=club_anual",
        notes: "Acesso total a todas as Magic Stories clássicas, Spoken Reflex Studio, áudios MP3 e apostilas oficiais diagramadas em PDF."
      },
      createdAt: "2026-09-01T00:00:00.000Z",
      updatedAt: "2026-09-03T22:00:00.000Z"
    },
    {
      id: "ms-club-mensal",
      title: "Magic Stories Club • Assinatura Mensal",
      slug: "ms-club-mensal",
      productId: "ms-club",
      productTitle: "Magic Stories Club",
      badge: "RECORRÊNCIA MENSAL",
      status: "active",
      provider: "hotmart",
      isPendingHotmartLink: true,
      checkoutUrl: "https://pay.hotmart.com/OFFER_MS_CLUB_MENSAL",
      whatsappNumber: "+55 11 99616-0910",
      whatsappPrefillText: "Olá Professor Leo! Gostaria de saber mais sobre a assinatura mensal do Magic Stories Club.",
      grantedTier: "club_monthly",
      grantedCourses: ["ms-legacy", "english-quickstart", "frases-prontas"],
      accessDuration: {
        type: "months",
        value: 1,
        isLifetime: false
      },
      pricing: {
        billingType: "subscription",
        regularPrice: 79.00,
        offerPrice: 59.00,
        currency: "BRL",
        installmentsText: "R$ 59,00 por mês",
        trialMode: "none",
        trialDays: 0
      },
      scarcity: {
        hasCountdown: false,
        expiresAt: null,
        countdownMinutes: null,
        redirectOnExpireUrl: "",
        spotsLeft: null
      },
      hotmartSetupSpec: {
        suggestedProductName: "AgoraEuFalo • Magic Stories Club (Mensal)",
        format: "Assinatura Mensal (Cobrança recorrente todo mês)",
        suggestedOfferCode: "CLUB_MENSAL_59",
        regularPriceFormatted: "R$ 79,00/mês",
        offerPriceFormatted: "R$ 59,00/mês",
        installmentsFormatted: "R$ 59,00/mês (Cancele quando quiser)",
        recommendedTracking: "src=player_modal&sck=club_mensal",
        notes: "Flexibilidade total para o aluno treinar sem compromisso de fidelidade anual."
      },
      createdAt: "2026-09-01T00:00:00.000Z",
      updatedAt: "2026-09-03T22:00:00.000Z"
    },
    {
      id: "eqs-completo",
      title: "English QuickStart Completo • Fundamentos da Fala",
      slug: "eqs-completo",
      productId: "english-quickstart",
      productTitle: "English QuickStart",
      badge: "CURSO COMPLETO",
      status: "active",
      provider: "hotmart",
      isPendingHotmartLink: true,
      checkoutUrl: "https://pay.hotmart.com/OFFER_EQS_COMPLETO",
      whatsappNumber: "+55 11 99616-0910",
      whatsappPrefillText: "Olá Professor Leo! Quero destravar todas as aulas do English QuickStart.",
      grantedTier: "course_member",
      grantedCourses: ["english-quickstart"],
      accessDuration: {
        type: "months",
        value: 12,
        isLifetime: false
      },
      pricing: {
        billingType: "one_time",
        regularPrice: 397.00,
        offerPrice: 197.00,
        currency: "BRL",
        installmentsText: "12x de R$ 19,70",
        trialMode: "none",
        trialDays: 0
      },
      scarcity: {
        hasCountdown: false,
        expiresAt: null,
        countdownMinutes: null,
        redirectOnExpireUrl: "",
        spotsLeft: null
      },
      hotmartSetupSpec: {
        suggestedProductName: "English QuickStart • Fundamentos da Fala",
        format: "Curso Online (Pagamento Único com Acesso por 1 Ano)",
        suggestedOfferCode: "EQS_COMPLETO_197",
        regularPriceFormatted: "R$ 397,00",
        offerPriceFormatted: "R$ 197,00",
        installmentsFormatted: "12x de R$ 19,70",
        recommendedTracking: "src=eqs_aula_lock&sck=eqs_completo",
        notes: "Libera todos os 5 módulos do English QuickStart + Módulo Bônus de Past, Present & Future."
      },
      createdAt: "2026-09-01T00:00:00.000Z",
      updatedAt: "2026-09-03T22:00:00.000Z"
    },
    {
      id: "frases-prontas-vitalicio",
      title: "Frases Prontas • Automação Oral (Acesso Vitalício)",
      slug: "frases-prontas-vitalicio",
      productId: "frases-prontas",
      productTitle: "Frases Prontas",
      badge: "VITALÍCIO",
      status: "active",
      provider: "hotmart",
      isPendingHotmartLink: true,
      checkoutUrl: "https://pay.hotmart.com/OFFER_FP_VITALICIO",
      whatsappNumber: "+55 11 99616-0910",
      whatsappPrefillText: "Olá Professor Leo! Gostaria de adquirir o curso Frases Prontas no plano vitalício.",
      grantedTier: "course_member",
      grantedCourses: ["frases-prontas"],
      accessDuration: {
        type: "months",
        value: 999,
        isLifetime: true
      },
      pricing: {
        billingType: "one_time",
        regularPrice: 597.00,
        offerPrice: 297.00,
        currency: "BRL",
        installmentsText: "12x de R$ 29,70",
        trialMode: "none",
        trialDays: 0
      },
      scarcity: {
        hasCountdown: false,
        expiresAt: null,
        countdownMinutes: null,
        redirectOnExpireUrl: "",
        spotsLeft: null
      },
      hotmartSetupSpec: {
        suggestedProductName: "Frases Prontas • Automação Oral e Reflexos",
        format: "Curso Online (Pagamento Único Vitalício)",
        suggestedOfferCode: "FP_VITALICIO_297",
        regularPriceFormatted: "R$ 597,00",
        offerPriceFormatted: "R$ 297,00",
        installmentsFormatted: "12x de R$ 29,70",
        recommendedTracking: "src=portal_infeed&sck=fp_vitalicio",
        notes: "Treinamento intensivo de blocos de conversação para eliminar a tradução mental na hora de falar."
      },
      createdAt: "2026-09-01T00:00:00.000Z",
      updatedAt: "2026-09-03T22:00:00.000Z"
    },
    {
      id: "frases-prontas-oto",
      title: "Frases Prontas • One-Time-Offer (Oferta Relâmpago de Checkout)",
      slug: "frases-prontas-oto",
      productId: "frases-prontas",
      productTitle: "Frases Prontas",
      badge: "⚡ OTO RELÂMPAGO",
      status: "active",
      provider: "hotmart",
      isPendingHotmartLink: true,
      checkoutUrl: "https://pay.hotmart.com/OFFER_FP_OTO_97",
      whatsappNumber: "+55 11 99616-0910",
      whatsappPrefillText: "Olá Leo! Vi a oferta relâmpago do Frases Prontas por R$ 97 e quero confirmar minha vaga.",
      grantedTier: "course_member",
      grantedCourses: ["frases-prontas"],
      accessDuration: {
        type: "months",
        value: 12,
        isLifetime: false
      },
      pricing: {
        billingType: "one_time",
        regularPrice: 297.00,
        offerPrice: 97.00,
        currency: "BRL",
        installmentsText: "R$ 97,00 à vista",
        trialMode: "none",
        trialDays: 0
      },
      scarcity: {
        hasCountdown: true,
        expiresAt: null,
        countdownMinutes: 15,
        redirectOnExpireUrl: "curso.html?curso=frases-prontas",
        spotsLeft: 12
      },
      hotmartSetupSpec: {
        suggestedProductName: "Frases Prontas • Acesso Promocional 1 Ano (OTO)",
        format: "Order Bump / OTO de Checkout",
        suggestedOfferCode: "FP_OTO_97",
        regularPriceFormatted: "R$ 297,00",
        offerPriceFormatted: "R$ 97,00",
        installmentsFormatted: "R$ 97,00 à vista",
        recommendedTracking: "src=oto_popup&sck=fp_oto_97",
        notes: "Oferta exclusiva de transbordo e conversão imediata para quem acabou de entrar como lead ou aluno de outro curso."
      },
      createdAt: "2026-09-01T00:00:00.000Z",
      updatedAt: "2026-09-03T22:00:00.000Z"
    },
    {
      id: "mentoria-vip-semestral",
      title: "Mentoria VIP Individual 1 a 1 • 6 Meses com Prof. Leo Leite",
      slug: "mentoria-vip-semestral",
      productId: "mentoria-vip",
      productTitle: "Mentoria VIP Individual",
      badge: "👑 MENTORIA EXCLUSIVA",
      status: "active",
      provider: "whatsapp",
      isPendingHotmartLink: false,
      checkoutUrl: "https://pay.hotmart.com/OFFER_MENTORIA_VIP_2026",
      whatsappNumber: "+55 11 99616-0910",
      whatsappPrefillText: "Olá Professor Leo! Quero aplicar para a Mentoria VIP Individual 1 a 1 de 6 meses. Gostaria de entender o processo de triagem e vagas disponíveis.",
      grantedTier: "vip",
      grantedCourses: ["ms-legacy", "english-quickstart", "frases-prontas"],
      accessDuration: {
        type: "months",
        value: 6,
        isLifetime: false
      },
      pricing: {
        billingType: "one_time",
        regularPrice: 4500.00,
        offerPrice: 3500.00,
        currency: "BRL",
        installmentsText: "12x de R$ 350,00 ou R$ 3.500 à vista",
        trialMode: "none",
        trialDays: 0
      },
      scarcity: {
        hasCountdown: false,
        expiresAt: null,
        countdownMinutes: null,
        redirectOnExpireUrl: "",
        spotsLeft: 3
      },
      hotmartSetupSpec: {
        suggestedProductName: "Mentoria VIP Individual AgoraEuFalo (6 Meses)",
        format: "Serviço de Mentoria / Ensino Individual",
        suggestedOfferCode: "MENTORIA_VIP_3500",
        regularPriceFormatted: "R$ 4.500,00",
        offerPriceFormatted: "R$ 3.500,00",
        installmentsFormatted: "12x de R$ 350,00",
        recommendedTracking: "src=whatsapp_triage&sck=mentoria_vip",
        notes: "Triagem obrigatória via WhatsApp antes do envio do checkout. O aluno recebe trilhas 100% personalizadas gravadas pelo Leo."
      },
      createdAt: "2026-09-01T00:00:00.000Z",
      updatedAt: "2026-09-03T22:00:00.000Z"
    },
    {
      id: "all-access-lifetime",
      title: "Membro Fundador AgoraEuFalo • Acesso Total Vitalício",
      slug: "all-access-lifetime",
      productId: "all-access-lifetime",
      productTitle: "Membro Fundador (All-Access)",
      badge: "💎 ACESSO VITALÍCIO TOTAL",
      status: "active",
      provider: "hotmart",
      isPendingHotmartLink: true,
      checkoutUrl: "https://pay.hotmart.com/OFFER_ALL_ACCESS_LIFETIME",
      whatsappNumber: "+55 11 99616-0910",
      whatsappPrefillText: "Olá Leo! Tenho interesse no Plano Fundador Vitalício Total do AgoraEuFalo.",
      grantedTier: "club_annual",
      grantedCourses: ["ms-legacy", "english-quickstart", "frases-prontas"],
      accessDuration: {
        type: "months",
        value: 999,
        isLifetime: true
      },
      pricing: {
        billingType: "one_time",
        regularPrice: 2997.00,
        offerPrice: 1497.00,
        currency: "BRL",
        installmentsText: "12x de R$ 149,70",
        trialMode: "none",
        trialDays: 0
      },
      scarcity: {
        hasCountdown: false,
        expiresAt: null,
        countdownMinutes: null,
        redirectOnExpireUrl: "",
        spotsLeft: 5
      },
      hotmartSetupSpec: {
        suggestedProductName: "Membro Fundador AgoraEuFalo (Vitalício Total)",
        format: "Pagamento Único Vitalício",
        suggestedOfferCode: "ALL_ACCESS_1497",
        regularPriceFormatted: "R$ 2.997,00",
        offerPriceFormatted: "R$ 1.497,00",
        installmentsFormatted: "12x de R$ 149,70",
        recommendedTracking: "src=portal_banner&sck=all_access_lifetime",
        notes: "Acesso permanente a todos os cursos presentes e futuros da plataforma, atualizações vitalícias e comunidade VIP."
      },
      createdAt: "2026-09-01T00:00:00.000Z",
      updatedAt: "2026-09-03T22:00:00.000Z"
    },
    {
      id: "trial-7-dias-gratis",
      title: "Degustação 7 Dias Grátis • Magic Stories Club",
      slug: "trial-7-dias-gratis",
      productId: "ms-club",
      productTitle: "Magic Stories Club",
      badge: "🎁 7 DIAS GRÁTIS",
      status: "active",
      provider: "hotmart",
      isPendingHotmartLink: true,
      checkoutUrl: "https://pay.hotmart.com/OFFER_TRIAL_7D_CLUB",
      whatsappNumber: "+55 11 99616-0910",
      whatsappPrefillText: "Olá Leo! Ativei meu trial de 7 dias grátis e queria tirar uma dúvida.",
      grantedTier: "club_annual",
      grantedCourses: ["ms-legacy", "english-quickstart", "frases-prontas"],
      accessDuration: {
        type: "months",
        value: 1,
        isLifetime: false
      },
      pricing: {
        billingType: "subscription",
        regularPrice: 59.00,
        offerPrice: 59.00,
        currency: "BRL",
        installmentsText: "R$ 59,00/mês após os 7 dias grátis",
        trialMode: "free_trial",
        trialDays: 7
      },
      scarcity: {
        hasCountdown: false,
        expiresAt: null,
        countdownMinutes: null,
        redirectOnExpireUrl: "",
        spotsLeft: null
      },
      hotmartSetupSpec: {
        suggestedProductName: "Magic Stories Club • Período de Testes 7 Dias",
        format: "Assinatura com Período de Teste Gratuito",
        suggestedOfferCode: "TRIAL_7D_FREE",
        regularPriceFormatted: "R$ 59,00/mês",
        offerPriceFormatted: "Grátis por 7 dias",
        installmentsFormatted: "R$ 59,00/mês a partir do 8º dia",
        recommendedTracking: "src=degustacao_modal&sck=trial_7d",
        notes: "Permite ao aluno experimentar sem risco o ecossistema completo por 7 dias."
      },
      createdAt: "2026-09-01T00:00:00.000Z",
      updatedAt: "2026-09-03T22:00:00.000Z"
    },
    {
      id: "migracao-resgate-gratis",
      title: "Resgate de Boas-Vindas • Ativação Gratuita para Alunos Antigos (First Steps)",
      slug: "migracao-resgate-gratis",
      productId: "first-steps",
      productTitle: "Resgate de Boas-Vindas (First Steps)",
      category: "migration",
      badge: "🎁 RESGATE 100% GRÁTIS",
      status: "active",
      provider: "hotmart",
      isPendingHotmartLink: false,
      checkoutUrl: "migracao/index.html?oferta=migracao-resgate-gratis",
      whatsappNumber: "+55 11 99616-0910",
      whatsappPrefillText: "Olá Professor Leo! Fui aluno de turmas anteriores e gostaria de resgatar meu acesso gratuito ao First Steps na nova plataforma.",
      grantedTier: "free",
      grantedCourses: ["first-steps", "english-quickstart"],
      accessDuration: {
        type: "months",
        value: 12,
        isLifetime: false
      },
      pricing: {
        billingType: "free",
        regularPrice: 397.00,
        offerPrice: 0.00,
        currency: "BRL",
        installmentsText: "100% Gratuito para Ex-Alunos",
        trialMode: "none",
        trialDays: 0
      },
      scarcity: {
        hasCountdown: false,
        expiresAt: null,
        countdownMinutes: null,
        redirectOnExpireUrl: "",
        spotsLeft: null
      },
      hotmartSetupSpec: {
        suggestedProductName: "Resgate de Boas-Vindas AgoraEuFalo (First Steps)",
        format: "Ativação Gratuita / Degustação de Luxo",
        suggestedOfferCode: "RESGATE_GRATIS_2026",
        regularPriceFormatted: "R$ 397,00",
        offerPriceFormatted: "R$ 0,00 (Gratuito)",
        installmentsFormatted: "Presente do Leo",
        recommendedTracking: "src=email_resgate&sck=resgate_gratis",
        notes: "Acesso de presente aos alunos históricos. Libera o curso First Steps mantendo o perfil no Tier Free para receber ofertas do Club."
      },
      createdAt: "2026-09-04T00:00:00.000Z",
      updatedAt: "2026-09-04T00:00:00.000Z"
    },
    {
      id: "migracao-upgrade-club",
      title: "Upgrade de Fidelidade • Transição com Crédito para o Club Anual",
      slug: "migracao-upgrade-club",
      productId: "ms-club",
      productTitle: "Magic Stories Club (Upgrade Exclusivo)",
      category: "migration",
      badge: "🚀 UPGRADE FIDELIDADE",
      status: "active",
      provider: "hotmart",
      isPendingHotmartLink: true,
      checkoutUrl: "https://pay.hotmart.com/OFFER_MIGRACAO_CLUB_297",
      whatsappNumber: "+55 11 99616-0910",
      whatsappPrefillText: "Olá Professor Leo! Quero fazer o upgrade com desconto de ex-aluno para o Magic Stories Club Anual por R$ 297.",
      grantedTier: "club_annual",
      grantedCourses: ["ms-legacy", "english-quickstart", "frases-prontas"],
      accessDuration: {
        type: "months",
        value: 12,
        isLifetime: false
      },
      pricing: {
        billingType: "subscription",
        regularPrice: 497.00,
        offerPrice: 297.00,
        currency: "BRL",
        installmentsText: "12x de R$ 29,70 ou R$ 297 à vista",
        trialMode: "none",
        trialDays: 0
      },
      scarcity: {
        hasCountdown: false,
        expiresAt: null,
        countdownMinutes: null,
        redirectOnExpireUrl: "",
        spotsLeft: 25
      },
      hotmartSetupSpec: {
        suggestedProductName: "Magic Stories Club Anual • Upgrade Alunos Anteriores",
        format: "Assinatura Anual com Desconto Especial de Migração",
        suggestedOfferCode: "MIGRACAO_CLUB_297",
        regularPriceFormatted: "R$ 497,00",
        offerPriceFormatted: "R$ 297,00",
        installmentsFormatted: "12x de R$ 29,70",
        recommendedTracking: "src=migracao_upgrade&sck=upgrade_club_297",
        notes: "Oferta fechada com link não listado publicamente. O valor investido em cursos passados é abatido como crédito para a anuidade do Club."
      },
      createdAt: "2026-09-04T00:00:00.000Z",
      updatedAt: "2026-09-04T00:00:00.000Z"
    },
    {
      id: "migracao-membro-historico",
      title: "Plano Membro Histórico • Transição para o Vitalício Total",
      slug: "migracao-membro-historico",
      productId: "all-access-lifetime",
      productTitle: "Membro Histórico Vitalício (All-Access Total)",
      category: "migration",
      badge: "💎 MEMBRO HISTÓRICO",
      status: "active",
      provider: "hotmart",
      isPendingHotmartLink: true,
      checkoutUrl: "https://pay.hotmart.com/OFFER_MIGRACAO_HISTORICO_997",
      whatsappNumber: "+55 11 99616-0910",
      whatsappPrefillText: "Olá Leo! Sou ex-aluno de turmas históricas e quero garantir a vaga de Membro Vitalício Total por R$ 997.",
      grantedTier: "club_annual",
      grantedCourses: ["ms-legacy", "english-quickstart", "frases-prontas"],
      accessDuration: {
        type: "months",
        value: 999,
        isLifetime: true
      },
      pricing: {
        billingType: "one_time",
        regularPrice: 2997.00,
        offerPrice: 997.00,
        currency: "BRL",
        installmentsText: "12x de R$ 99,70 ou R$ 997 à vista",
        trialMode: "none",
        trialDays: 0
      },
      scarcity: {
        hasCountdown: false,
        expiresAt: null,
        countdownMinutes: null,
        redirectOnExpireUrl: "",
        spotsLeft: 10
      },
      hotmartSetupSpec: {
        suggestedProductName: "Membro Histórico AgoraEuFalo • Vitalício All-Access",
        format: "Pagamento Único Vitalício com Desconto de Transição",
        suggestedOfferCode: "HISTORICO_VITALICIO_997",
        regularPriceFormatted: "R$ 2.997,00",
        offerPriceFormatted: "R$ 997,00",
        installmentsFormatted: "12x de R$ 99,70",
        recommendedTracking: "src=migracao_historico&sck=historico_997",
        notes: "Oferta restrita de alto ticket para reativação definitiva de fãs e alunos veteranos do método."
      },
      createdAt: "2026-09-04T00:00:00.000Z",
      updatedAt: "2026-09-04T00:00:00.000Z"
    }
  ];

  class AEFOffersRegistry {
    constructor() {
      this.offers = [];
      this.initialized = false;
      this.db = null;
    }

    /**
     * Inicializa a biblioteca carregando do cache local e em seguida tentando Firestore
     */
    async init() {
      if (this.initialized) return this.offers;

      // 1. Carrega do localStorage de imediato (zero latência)
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.offers = parsed;
          }
        }
      } catch (e) {
        console.warn("[AEFOffersRegistry] Falha ao ler cache local:", e);
      }

      // Se não havia cache local, usa semente canônica
      if (!this.offers || this.offers.length === 0) {
        this.offers = JSON.parse(JSON.stringify(CANONICAL_OFFERS_SEED));
        this.saveToLocalCache();
      }

      // 2. Conecta ao Firebase se disponível
      if (window.aefCloudSync) {
        try {
          await window.aefCloudSync.init();
          this.db = window.firebase ? window.firebase.firestore() : null;
        } catch (e) {
          console.warn("[AEFOffersRegistry] Cloud sync não inicializou:", e);
        }
      }

      // 3. Busca atualizações do Firestore em background
      await this.syncFromFirestore();

      this.initialized = true;
      return this.offers;
    }

    saveToLocalCache() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.offers));
      } catch (e) {
        console.warn("[AEFOffersRegistry] Falha ao salvar no cache local:", e);
      }
    }

    async syncFromFirestore() {
      try {
        if (this.db) {
          const snap = await this.db.collection('offers').orderBy('createdAt', 'desc').get();
          if (!snap.empty) {
            const remoteOffers = [];
            snap.forEach(doc => {
              remoteOffers.push({ id: doc.id, ...doc.data() });
            });
            if (remoteOffers.length > 0) {
              this.offers = remoteOffers;
              this.saveToLocalCache();
              return remoteOffers;
            }
          }
        } else {
          // REST API Fallback
          const res = await fetch("https://firestore.googleapis.com/v1/projects/agoraeufalo-3463a/databases/(default)/documents/offers");
          if (res.ok) {
            const data = await res.json();
            if (data && data.documents && data.documents.length > 0) {
              const remoteOffers = data.documents.map(doc => this.parseFirestoreDocument(doc));
              if (remoteOffers.length > 0) {
                this.offers = remoteOffers;
                this.saveToLocalCache();
                return remoteOffers;
              }
            }
          }
        }
      } catch (err) {
        // Silencioso se offline, mantém os dados locais/seed
      }
      return this.offers;
    }

    /**
     * Retorna todas as ofertas cadastradas
     */
    async getAllOffers(filters = {}) {
      if (!this.initialized) await this.init();

      let list = [...this.offers];

      if (filters.status) {
        list = list.filter(o => o.status === filters.status);
      }
      if (filters.productId) {
        list = list.filter(o => o.productId === filters.productId);
      }
      if (filters.provider) {
        list = list.filter(o => o.provider === filters.provider);
      }
      if (filters.pendingHotmartOnly) {
        list = list.filter(o => o.isPendingHotmartLink || !o.checkoutUrl || o.checkoutUrl.includes('OFFER_'));
      }
      if (filters.term) {
        const q = filters.term.toLowerCase().trim();
        list = list.filter(o => 
          (o.title && o.title.toLowerCase().includes(q)) ||
          (o.slug && o.slug.toLowerCase().includes(q)) ||
          (o.productTitle && o.productTitle.toLowerCase().includes(q)) ||
          (o.hotmartSetupSpec?.suggestedOfferCode && o.hotmartSetupSpec.suggestedOfferCode.toLowerCase().includes(q))
        );
      }

      return list;
    }

    /**
     * Retorna uma oferta pelo ID
     */
    async getOfferById(id) {
      if (!this.initialized) await this.init();
      return this.offers.find(o => o.id === id) || null;
    }

    /**
     * Retorna as ofertas de um produto específico
     */
    async getOffersByProduct(productId) {
      if (!this.initialized) await this.init();
      return this.offers.filter(o => o.productId === productId && o.status === 'active');
    }

    /**
     * Salva ou atualiza uma oferta
     */
    async saveOffer(offerData) {
      if (!this.initialized) await this.init();

      const id = offerData.id || offerData.slug || `offer_${Date.now()}`;
      offerData.id = id;
      offerData.updatedAt = new Date().toISOString();
      if (!offerData.createdAt) offerData.createdAt = offerData.updatedAt;

      // Normaliza status de link pendente da Hotmart
      if (offerData.provider === 'hotmart') {
        offerData.isPendingHotmartLink = !offerData.checkoutUrl || 
          offerData.checkoutUrl.includes('OFFER_') || 
          offerData.checkoutUrl.trim() === '';
      } else {
        offerData.isPendingHotmartLink = false;
      }

      // Atualiza localmente
      const idx = this.offers.findIndex(o => o.id === id);
      if (idx >= 0) {
        this.offers[idx] = { ...this.offers[idx], ...offerData };
      } else {
        this.offers.unshift(offerData);
      }
      this.saveToLocalCache();

      // Persiste no Firestore
      try {
        if (this.db) {
          await this.db.collection('offers').doc(id).set(offerData, { merge: true });
        } else {
          const url = `https://firestore.googleapis.com/v1/projects/agoraeufalo-3463a/databases/(default)/documents/offers/${id}`;
          const fields = this.formatFirestoreFields(offerData);
          await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fields })
          });
        }
      } catch (err) {
        console.warn("[AEFOffersRegistry] Aviso: Salvo localmente, erro ao persistir remoto:", err);
      }

      return offerData;
    }

    /**
     * Alterna o status (active / paused / archived)
     */
    async toggleOfferStatus(id, newStatus = null) {
      if (!this.initialized) await this.init();
      const offer = this.offers.find(o => o.id === id);
      if (!offer) throw new Error(`Oferta ${id} não encontrada.`);

      if (!newStatus) {
        newStatus = (offer.status === 'active') ? 'paused' : 'active';
      }

      offer.status = newStatus;
      offer.updatedAt = new Date().toISOString();
      this.saveToLocalCache();

      try {
        if (this.db) {
          await this.db.collection('offers').doc(id).update({ status: newStatus, updatedAt: offer.updatedAt });
        }
      } catch (e) {}

      return offer;
    }

    /**
     * Duplica uma oferta existente para rápida criação de nova campanha
     */
    async duplicateOffer(id, newTitleSuffix = " (Cópia Promocional)") {
      if (!this.initialized) await this.init();
      const original = this.offers.find(o => o.id === id);
      if (!original) throw new Error(`Oferta original ${id} não encontrada.`);

      const timestamp = Date.now().toString().slice(-4);
      const copy = JSON.parse(JSON.stringify(original));
      copy.id = `${original.id}_copy_${timestamp}`;
      copy.slug = `${original.slug}-copy-${timestamp}`;
      copy.title = `${original.title}${newTitleSuffix}`;
      copy.badge = "NOVA OFERTA";
      copy.status = "paused"; // Começa pausada por segurança
      copy.isPendingHotmartLink = true;
      if (copy.hotmartSetupSpec) {
        copy.hotmartSetupSpec.suggestedOfferCode = `${copy.hotmartSetupSpec.suggestedOfferCode}_${timestamp}`;
      }
      copy.createdAt = new Date().toISOString();
      copy.updatedAt = copy.createdAt;

      return await this.saveOffer(copy);
    }

    /**
     * Exclui uma oferta
     */
    async deleteOffer(id) {
      if (!this.initialized) await this.init();
      this.offers = this.offers.filter(o => o.id !== id);
      this.saveToLocalCache();

      try {
        if (this.db) {
          await this.db.collection('offers').doc(id).delete();
        } else {
          await fetch(`https://firestore.googleapis.com/v1/projects/agoraeufalo-3463a/databases/(default)/documents/offers/${id}`, {
            method: 'DELETE'
          });
        }
      } catch (e) {}

      return true;
    }

    /**
     * Gera a URL final com parâmetros de rastreamento SRC / SCK
     */
    generateTrackingUrl(offerOrId, source = 'portal_free', campaign = '') {
      const offer = typeof offerOrId === 'string' ? this.offers.find(o => o.id === offerOrId) : offerOrId;
      if (!offer) return '#';

      if (offer.provider === 'whatsapp') {
        const phone = (offer.whatsappNumber || '5511996160910').replace(/\D/g, '');
        const text = encodeURIComponent(offer.whatsappPrefillText || 'Olá Professor Leo!');
        return `https://wa.me/${phone}?text=${text}`;
      }

      const baseUrl = offer.checkoutUrl || 'https://pay.hotmart.com';
      try {
        const url = new URL(baseUrl);
        url.searchParams.set('src', source);
        if (campaign) url.searchParams.set('sck', campaign);
        return url.toString();
      } catch (e) {
        const sep = baseUrl.includes('?') ? '&' : '?';
        return `${baseUrl}${sep}src=${encodeURIComponent(source)}${campaign ? '&sck=' + encodeURIComponent(campaign) : ''}`;
      }
    }

    /**
     * Retorna a especificação técnica pronta para o Professor Leo copiar e colar na Hotmart
     */
    getHotmartSetupSpec(id) {
      const offer = this.offers.find(o => o.id === id);
      if (!offer) return null;

      const spec = offer.hotmartSetupSpec || {};
      return {
        productName: spec.suggestedProductName || offer.productTitle,
        offerCode: spec.suggestedOfferCode || offer.id.toUpperCase(),
        format: spec.format || (offer.pricing?.billingType === 'subscription' ? 'Assinatura' : 'Pagamento Único'),
        regularPrice: spec.regularPriceFormatted || `R$ ${offer.pricing?.regularPrice || '0,00'}`,
        offerPrice: spec.offerPriceFormatted || `R$ ${offer.pricing?.offerPrice || '0,00'}`,
        installments: spec.installmentsFormatted || offer.pricing?.installmentsText || '',
        trackingHint: spec.recommendedTracking || `src=portal&sck=${offer.id}`,
        notes: spec.notes || ''
      };
    }

    // Conversor auxiliar Firestore REST
    parseFirestoreDocument(doc) {
      const f = doc.fields || {};
      const id = f.id?.stringValue || doc.name.split("/").pop();
      return {
        id: id,
        title: f.title?.stringValue || id,
        slug: f.slug?.stringValue || id,
        productId: f.productId?.stringValue || "ms-club",
        productTitle: f.productTitle?.stringValue || "Magic Stories Club",
        badge: f.badge?.stringValue || "OFERTA",
        status: f.status?.stringValue || "active",
        provider: f.provider?.stringValue || "hotmart",
        isPendingHotmartLink: f.isPendingHotmartLink?.booleanValue ?? true,
        checkoutUrl: f.checkoutUrl?.stringValue || "",
        whatsappNumber: f.whatsappNumber?.stringValue || "+55 11 99616-0910",
        whatsappPrefillText: f.whatsappPrefillText?.stringValue || "",
        grantedTier: f.grantedTier?.stringValue || "club_annual",
        grantedCourses: f.grantedCourses?.arrayValue?.values?.map(v => v.stringValue) || [],
        accessDuration: {
          type: f.accessDuration?.mapValue?.fields?.type?.stringValue || "months",
          value: parseInt(f.accessDuration?.mapValue?.fields?.value?.integerValue || "12"),
          isLifetime: f.accessDuration?.mapValue?.fields?.isLifetime?.booleanValue || false
        },
        pricing: {
          billingType: f.pricing?.mapValue?.fields?.billingType?.stringValue || "subscription",
          regularPrice: parseFloat(f.pricing?.mapValue?.fields?.regularPrice?.doubleValue || "497"),
          offerPrice: parseFloat(f.pricing?.mapValue?.fields?.offerPrice?.doubleValue || "497"),
          currency: f.pricing?.mapValue?.fields?.currency?.stringValue || "BRL",
          installmentsText: f.pricing?.mapValue?.fields?.installmentsText?.stringValue || "",
          trialMode: f.pricing?.mapValue?.fields?.trialMode?.stringValue || "none",
          trialDays: parseInt(f.pricing?.mapValue?.fields?.trialDays?.integerValue || "0")
        },
        scarcity: {
          hasCountdown: f.scarcity?.mapValue?.fields?.hasCountdown?.booleanValue || false,
          expiresAt: f.scarcity?.mapValue?.fields?.expiresAt?.stringValue || null,
          countdownMinutes: parseInt(f.scarcity?.mapValue?.fields?.countdownMinutes?.integerValue || "0") || null,
          redirectOnExpireUrl: f.scarcity?.mapValue?.fields?.redirectOnExpireUrl?.stringValue || "",
          spotsLeft: parseInt(f.scarcity?.mapValue?.fields?.spotsLeft?.integerValue || "0") || null
        },
        hotmartSetupSpec: {
          suggestedProductName: f.hotmartSetupSpec?.mapValue?.fields?.suggestedProductName?.stringValue || "",
          format: f.hotmartSetupSpec?.mapValue?.fields?.format?.stringValue || "",
          suggestedOfferCode: f.hotmartSetupSpec?.mapValue?.fields?.suggestedOfferCode?.stringValue || "",
          regularPriceFormatted: f.hotmartSetupSpec?.mapValue?.fields?.regularPriceFormatted?.stringValue || "",
          offerPriceFormatted: f.hotmartSetupSpec?.mapValue?.fields?.offerPriceFormatted?.stringValue || "",
          installmentsFormatted: f.hotmartSetupSpec?.mapValue?.fields?.installmentsFormatted?.stringValue || "",
          recommendedTracking: f.hotmartSetupSpec?.mapValue?.fields?.recommendedTracking?.stringValue || "",
          notes: f.hotmartSetupSpec?.mapValue?.fields?.notes?.stringValue || ""
        },
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
  window.AEFOffersRegistry = AEFOffersRegistry;
  window.aefOffersRegistry = new AEFOffersRegistry();

  // Compatibilidade com código legado que consumia aefOffersEngine
  if (!window.aefOffersEngine) {
    window.aefOffersEngine = {
      getAllOffers: () => window.aefOffersRegistry.getAllOffers(),
      saveOffer: (data) => window.aefOffersRegistry.saveOffer(data),
      deleteOffer: (id) => window.aefOffersRegistry.deleteOffer(id)
    };
  }

})(window);
