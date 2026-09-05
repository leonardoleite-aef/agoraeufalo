/**
 * AgoraEuFalo • Webhook Handler & Automatic Student Enrollment (Enterprise Edition)
 * Professor Leonardo Leite
 * 
 * Processes incoming webhooks from Hotmart (Webhook 2.0.0) and Stripe,
 * manages the complete student lifecycle (approval, recurrence, delayed payment grace periods,
 * subscription cancellation with date_next_charge retention, refunds, chargebacks, and plan switches),
 * syncs to Google Cloud Firestore (collections 'users', 'students', 'webhook_logs') and caches locally.
 */

(function (window) {
  'use strict';

  const PRODUCT_TIER_MAPPING = {
    // Hotmart Product IDs & Slugs
    '8460579': {
      tier: 'club_annual',
      role: 'student',
      enrolledProducts: ['ms-legacy', 'english-quickstart', 'frases-prontas'],
      productName: 'Magic Stories Club'
    },
    'MAGIC_STORIES_CLUB': {
      tier: 'club_annual',
      role: 'student',
      enrolledProducts: ['ms-legacy', 'english-quickstart', 'frases-prontas'],
      productName: 'Magic Stories Club (Assinatura Anual)'
    },
    'MS_CLUB_ANUAL': {
      tier: 'club_annual',
      role: 'student',
      enrolledProducts: ['ms-legacy', 'english-quickstart', 'frases-prontas'],
      productName: 'Magic Stories Club • Assinatura Anual'
    },
    'MS_CLUB_MENSAL': {
      tier: 'club_monthly',
      role: 'student',
      enrolledProducts: ['ms-legacy', 'english-quickstart', 'frases-prontas'],
      productName: 'Magic Stories Club • Assinatura Mensal'
    },
    'PROJETO_AEF_2026': {
      tier: 'vip_mentorship',
      role: 'student',
      enrolledProducts: ['ms-legacy', 'english-quickstart', 'frases-prontas', 'all_access_master', 'mentoria_vip'],
      productName: 'Projeto AgoraEuFalo 2026 (Mentoria VIP + Formação Completa)'
    },
    'MENTORIA_VIP': {
      tier: 'vip_mentorship',
      role: 'student',
      enrolledProducts: ['ms-legacy', 'english-quickstart', 'frases-prontas', 'all_access_master', 'mentoria_vip'],
      productName: 'Mentoria VIP Individual AgoraEuFalo'
    },
    'MS_LEGACY': {
      tier: 'course_member',
      role: 'student',
      enrolledProducts: ['ms-legacy'],
      productName: 'Magic Stories Legacy • O Acervo Clássico'
    },
    'ENGLISH_QUICKSTART': {
      tier: 'course_member',
      role: 'student',
      enrolledProducts: ['english-quickstart'],
      productName: 'English QuickStart • Fundamentos da Fala'
    },
    'FRASES_PRONTAS': {
      tier: 'course_member',
      role: 'student',
      enrolledProducts: ['frases-prontas'],
      productName: 'Frases Prontas • Automação Oral'
    }
  };

  class AEFWebhookHandler {
    constructor() {
      this.db = null;
      this.logsCacheKey = 'aef_webhook_logs_cache_v2';
    }

    async init() {
      if (window.aefCloudSync) {
        await window.aefCloudSync.init();
        this.db = window.firebase ? window.firebase.firestore() : null;
      }
    }

    /**
     * Identifies mapping from product name or code
     */
    resolveProductTier(productIdentifier, offerCode = '') {
      if (offerCode) {
        const off = String(offerCode).toUpperCase();
        if (off.includes('MENSAL')) return PRODUCT_TIER_MAPPING['MS_CLUB_MENSAL'];
        if (off.includes('ANUAL') || off.includes('MGWNAB3H')) return PRODUCT_TIER_MAPPING['MS_CLUB_ANUAL'];
        if (off.includes('VIP') || off.includes('2026')) return PRODUCT_TIER_MAPPING['PROJETO_AEF_2026'];
      }

      if (!productIdentifier) return PRODUCT_TIER_MAPPING['8460579'];
      const clean = String(productIdentifier).toUpperCase().replace(/[^A-Z0-9_]/g, '_');

      for (const [key, mapping] of Object.entries(PRODUCT_TIER_MAPPING)) {
        if (clean.includes(key) || key.includes(clean)) {
          return mapping;
        }
      }

      if (clean.includes('VIP') || clean.includes('MENTORIA') || clean.includes('2026')) {
        return PRODUCT_TIER_MAPPING['PROJETO_AEF_2026'];
      }
      if (clean.includes('MENSAL')) {
        return PRODUCT_TIER_MAPPING['MS_CLUB_MENSAL'];
      }
      if (clean.includes('CLUB') || clean.includes('ANUAL') || clean.includes('MAGIC') || clean.includes('8460579')) {
        return PRODUCT_TIER_MAPPING['MS_CLUB_ANUAL'];
      }

      return PRODUCT_TIER_MAPPING['8460579'];
    }

    /**
     * Saves a webhook log entry to Firestore and localStorage
     */
    async saveWebhookLog(logEntry) {
      // 1. Local Cache
      try {
        const currentLogs = this.getLocalWebhookLogs();
        const filtered = currentLogs.filter(l => l.id !== logEntry.id);
        filtered.unshift(logEntry);
        const trimmed = filtered.slice(0, 100);
        localStorage.setItem(this.logsCacheKey, JSON.stringify(trimmed));
      } catch (e) {
        console.warn('⚠️ [AEFWebhook] Falha ao salvar log no localStorage:', e);
      }

      // 2. Firestore Collection 'webhook_logs'
      try {
        await this.init();
        if (this.db) {
          await this.db.collection('webhook_logs').doc(logEntry.id).set(logEntry, { merge: true });
          console.log(`✅ [AEFWebhook] Log persistido no Firestore: webhook_logs/${logEntry.id}`);
        } else {
          // REST Fallback
          const payload = {
            fields: {
              id: { stringValue: logEntry.id },
              event: { stringValue: logEntry.event },
              provider: { stringValue: logEntry.provider || 'hotmart' },
              buyerEmail: { stringValue: logEntry.buyerEmail || '' },
              buyerName: { stringValue: logEntry.buyerName || '' },
              productName: { stringValue: logEntry.productName || '' },
              amountFormatted: { stringValue: logEntry.amountFormatted || 'R$ 0,00' },
              status: { stringValue: logEntry.status || 'processed' },
              resultSummary: { stringValue: logEntry.resultSummary || '' },
              processedAt: { stringValue: logEntry.processedAt || new Date().toISOString() }
            }
          };
          fetch(`https://firestore.googleapis.com/v1/projects/agoraeufalo-3463a/databases/(default)/documents/webhook_logs/${logEntry.id}?key=AIzaSyCdcFzySfxGK6Uo0DM1-y_HpACvt5E71Sk`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }).catch(() => {});
        }
      } catch (dbErr) {
        console.warn('⚠️ [AEFWebhook] Falha ao persistir log no Firestore:', dbErr);
      }
    }

    /**
     * Gets local cached webhook logs
     */
    getLocalWebhookLogs() {
      try {
        const raw = localStorage.getItem(this.logsCacheKey);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    }

    /**
     * Fetches all webhook logs from Firestore
     */
    async fetchRemoteLogs(limitCount = 50) {
      await this.init();
      const remoteLogs = [];

      try {
        if (this.db) {
          const snapshot = await this.db.collection('webhook_logs')
            .orderBy('processedAt', 'desc')
            .limit(limitCount)
            .get();

          snapshot.forEach(doc => {
            remoteLogs.push(doc.data());
          });
        }
      } catch (err) {
        console.warn('⚠️ [AEFWebhook] Aviso ao buscar logs via SDK:', err);
      }

      // REST Fallback caso o SDK esteja ocioso ou sem índice
      if (remoteLogs.length === 0) {
        try {
          const res = await fetch(`https://firestore.googleapis.com/v1/projects/agoraeufalo-3463a/databases/(default)/documents/webhook_logs?key=AIzaSyCdcFzySfxGK6Uo0DM1-y_HpACvt5E71Sk`);
          if (res.ok) {
            const data = await res.json();
            const docs = data.documents || [];
            docs.forEach(d => {
              const f = d.fields || {};
              const obj = {};
              for (const [k, v] of Object.entries(f)) {
                if (v.stringValue !== undefined) obj[k] = v.stringValue;
                else if (v.integerValue !== undefined) obj[k] = parseInt(v.integerValue, 10);
                else if (v.doubleValue !== undefined) obj[k] = v.doubleValue;
                else if (v.booleanValue !== undefined) obj[k] = v.booleanValue;
              }
              if (obj.id) remoteLogs.push(obj);
            });
          }
        } catch (restErr) {
          console.warn('⚠️ [AEFWebhook] REST fallback error:', restErr);
        }
      }

      // Mescla com logs locais
      const local = this.getLocalWebhookLogs();
      const map = new Map();
      [...remoteLogs, ...local].forEach(item => {
        if (item && item.id && !map.has(item.id)) {
          map.set(item.id, item);
        }
      });

      const merged = Array.from(map.values()).sort((a, b) => {
        return new Date(b.processedAt || 0) - new Date(a.processedAt || 0);
      });

      try {
        localStorage.setItem(this.logsCacheKey, JSON.stringify(merged.slice(0, 100)));
      } catch (e) {}

      return merged;
    }

    /**
     * Processes Hotmart Webhook Payload (Version 2.0.0 Specification)
     */
    async processHotmartWebhook(payload) {
      await this.init();
      console.log('📦 [AEFWebhook] Processando Webhook Hotmart 2.0.0:', payload);

      const eventId = payload.id || `wh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const event = (payload.event || payload.hottok_event || 'PURCHASE_APPROVED').trim();
      const data = payload.data || payload;
      const buyer = data.buyer || payload.buyer || {};
      const product = data.product || payload.product || {};
      const purchase = data.purchase || payload.purchase || {};
      const subscription = data.subscription || payload.subscription || {};

      const email = (buyer.email || payload.email || '').trim().toLowerCase();
      const name = (buyer.name || payload.name || email.split('@')[0] || 'Aluno AgoraEuFalo').trim();
      const phone = buyer.checkout_phone || buyer.phone || payload.phone || '';
      const prodName = product.name || payload.product_name || 'Magic Stories Club';
      const prodId = product.id || payload.product_id || '8460579';
      const offerCode = purchase.offer?.code || payload.offer_code || '';
      const transactionId = purchase.transaction || data.transaction || `tx_${Date.now()}`;
      
      const priceVal = purchase.price?.value || payload.price || 0;
      const currency = purchase.price?.currency_code || 'BRL';
      const formattedPrice = currency === 'BRL' ? `R$ ${Number(priceVal).toFixed(2).replace('.', ',')}` : `${currency} ${priceVal}`;
      const isRecurrent = Boolean(purchase.recurrent || (purchase.recurrence_number && purchase.recurrence_number > 1));
      const recurrenceNumber = purchase.recurrence_number || (isRecurrent ? 2 : 1);

      if (!email) {
        const errorMsg = 'E-mail do comprador não encontrado no payload do webhook.';
        const errLog = {
          id: eventId,
          event: event,
          provider: 'hotmart',
          buyerEmail: 'desconhecido',
          buyerName: 'Desconhecido',
          productName: prodName,
          amountFormatted: formattedPrice,
          status: 'error',
          resultSummary: `❌ Falha: ${errorMsg}`,
          rawPayload: payload,
          processedAt: new Date().toISOString()
        };
        await this.saveWebhookLog(errLog);
        throw new Error(errorMsg);
      }

      const studentId = email.replace(/[^a-zA-Z0-9]/g, '_');
      const nowIso = new Date().toISOString();

      // Resolve Offer e Mapeamento de Tiers
      let matchedOffer = null;
      if (window.aefOffersEngine) {
        matchedOffer = await window.aefOffersEngine.matchOfferByCodeOrName(offerCode || prodName);
      }

      const baseMapping = matchedOffer ? {
        tier: matchedOffer.grantedTier || 'club_annual',
        role: 'student',
        enrolledProducts: matchedOffer.grantedCourses || ['ms-legacy', 'english-quickstart', 'frases-prontas'],
        productName: matchedOffer.title || prodName
      } : this.resolveProductTier(prodName || prodId, offerCode);

      // Tratamento Específico de Cada Evento
      let targetTier = baseMapping.tier;
      let targetCourses = baseMapping.enrolledProducts;
      let accessStatus = 'active';
      let resultSummary = '';
      let logStatus = 'processed';
      let graceUntil = null;
      let expiresAt = null;

      switch (event) {
        case 'PURCHASE_APPROVED':
          if (isRecurrent && recurrenceNumber > 1) {
            resultSummary = `🔄 Recorrência #${recurrenceNumber} Aprovada. Assinatura mantida como '${targetTier}' para ${name}.`;
          } else {
            resultSummary = `🎉 1ª Compra Aprovada! Aluno ${name} matriculado como '${targetTier}' com ${targetCourses.length} cursos liberados.`;
          }
          accessStatus = 'active';
          break;

        case 'PURCHASE_DELAYED':
          accessStatus = 'overdue_grace_period';
          const graceDate = new Date();
          graceDate.setDate(graceDate.getDate() + 5);
          graceUntil = graceDate.toISOString();
          resultSummary = `⚠️ Cobrança Atrasada (PURCHASE_DELAYED). Aluno ${name} em período de tolerância até ${graceDate.toLocaleDateString('pt-BR')}.`;
          logStatus = 'warning';
          break;

        case 'SUBSCRIPTION_CANCELLATION':
          const nextCharge = subscription.date_next_charge || data.date_next_charge;
          if (nextCharge) {
            const expDate = new Date(typeof nextCharge === 'number' ? nextCharge : nextCharge);
            expiresAt = expDate.toISOString();
            accessStatus = 'canceled_grace';
            resultSummary = `🛑 Assinatura Cancelada pelo Aluno. Acesso mantido até o fim do ciclo pago (${expDate.toLocaleDateString('pt-BR')}).`;
          } else {
            targetTier = 'free';
            targetCourses = [];
            accessStatus = 'canceled_immediate';
            resultSummary = `🛑 Assinatura Cancelada (Sem data futura). Acesso rebaixado para Tier 'free'.`;
          }
          logStatus = 'warning';
          break;

        case 'SWITCH_PLAN':
          resultSummary = `🔀 Troca de Plano efetuada para ${name}. Novo Tier ativo: '${targetTier}'.`;
          accessStatus = 'active';
          break;

        case 'PURCHASE_REFUNDED':
          targetTier = 'free';
          targetCourses = [];
          accessStatus = 'refunded';
          resultSummary = `💸 Reembolso Efetuado. Acesso de ${name} revogado imediatamente (Tier 'free').`;
          logStatus = 'warning';
          break;

        case 'PURCHASE_CHARGEBACK':
          targetTier = 'free';
          targetCourses = [];
          accessStatus = 'chargeback_blocked';
          resultSummary = `🚨 Chargeback Contestação de Compra! Acesso de ${name} bloqueado imediatamente.`;
          logStatus = 'error';
          break;

        case 'PURCHASE_BILLET_PRINTED':
          accessStatus = 'waiting_payment';
          resultSummary = `📄 Boleto Bancário Gerado para ${name} (${formattedPrice}). Aguardando compensação.`;
          logStatus = 'processed';
          break;

        case 'PURCHASE_CANCELED':
        case 'PURCHASE_EXPIRED':
          accessStatus = 'expired';
          resultSummary = `⏳ Pedido expirado ou cancelado antes do pagamento para ${name}.`;
          logStatus = 'warning';
          break;

        default:
          resultSummary = `ℹ️ Evento '${event}' registrado para ${name}.`;
          break;
      }

      // Monta o Registro do Usuário
      const userRecord = {
        uid: studentId,
        email: email,
        name: name,
        phone: phone,
        tier: targetTier,
        role: 'student',
        enrolledProducts: targetCourses,
        subscriptionState: {
          status: accessStatus,
          isRecurrent: isRecurrent,
          recurrenceNumber: recurrenceNumber,
          subscriberCode: subscription.subscriber_code || subscription.code || null,
          graceUntil: graceUntil,
          expiresAt: expiresAt,
          lastEvent: event,
          updatedAt: nowIso
        },
        lastTransaction: {
          gateway: 'hotmart',
          event: event,
          productName: prodName,
          productId: prodId,
          offerCode: offerCode,
          amount: priceVal,
          formattedPrice: formattedPrice,
          transactionId: transactionId,
          processedAt: nowIso
        },
        updatedAt: nowIso
      };

      // 1. Sincroniza usuário no Firestore ('users/{studentId}')
      try {
        if (this.db) {
          await this.db.collection('users').doc(studentId).set(userRecord, { merge: true });
        } else {
          // REST Fallback
          await fetch(`https://firestore.googleapis.com/v1/projects/agoraeufalo-3463a/databases/(default)/documents/users/${studentId}?key=AIzaSyCdcFzySfxGK6Uo0DM1-y_HpACvt5E71Sk`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fields: {
                uid: { stringValue: userRecord.uid },
                email: { stringValue: userRecord.email },
                name: { stringValue: userRecord.name },
                phone: { stringValue: userRecord.phone },
                tier: { stringValue: userRecord.tier },
                role: { stringValue: userRecord.role },
                updatedAt: { stringValue: nowIso }
              }
            })
          });
        }
      } catch (dbErr) {
        console.warn('⚠️ [AEFWebhook] Erro ao sincronizar documento de usuário:', dbErr);
      }

      // 2. Se for Mentoria VIP e aprovado, sincroniza em 'students/{studentId}'
      if (targetTier === 'vip_mentorship' && event === 'PURCHASE_APPROVED') {
        try {
          const menteeDoc = {
            id: studentId,
            name: name,
            email: email,
            phone: phone,
            badge: 'VIP Mentee',
            subtitle: 'Acompanhamento 1 a 1 do Professor Leo',
            tier: 'vip_mentorship',
            updatedAt: nowIso
          };
          if (this.db) {
            await this.db.collection('students').doc(studentId).set(menteeDoc, { merge: true });
          }
        } catch (e) {}
      }

      // 3. Monta e Salva o Log de Auditoria
      const logEntry = {
        id: eventId,
        event: event,
        provider: 'hotmart',
        buyerEmail: email,
        buyerName: name,
        productName: prodName,
        productId: prodId,
        transactionId: transactionId,
        amountFormatted: formattedPrice,
        status: logStatus,
        resultSummary: resultSummary,
        rawPayload: payload,
        processedAt: nowIso
      };

      await this.saveWebhookLog(logEntry);

      // 4. Disparo Sistêmico de E-mail via aefEmailEngine (Brevo / Firestore Queue)
      try {
        if (window.aefEmailEngine && typeof window.aefEmailEngine.sendTransactionalEmail === 'function') {
          const magicLinkUrl = `https://agoraeufalo.com.br/portal.html?email=${encodeURIComponent(email)}&welcome=true`;

          if (event === 'PURCHASE_APPROVED') {
            await window.aefEmailEngine.sendTransactionalEmail({
              templateId: !isRecurrent ? 'E1_WELCOME_ONBOARDING' : 'E4_PURCHASE_CONFIRMED',
              toEmail: email,
              toName: name,
              params: {
                magicLink: magicLinkUrl,
                productName: baseMapping.productName,
                platform: payload.id && String(payload.id).startsWith('stripe_') ? 'Stripe' : 'Hotmart'
              }
            });
          } else if (event === 'SWITCH_PLAN') {
            await window.aefEmailEngine.sendTransactionalEmail({
              templateId: 'E5_PLAN_CHANGED',
              toEmail: email,
              toName: name,
              params: {
                newPlanName: targetTier,
                magicLink: magicLinkUrl
              }
            });
          } else if (event === 'SUBSCRIPTION_CANCELLATION' || event === 'PURCHASE_DELAYED' || event === 'PURCHASE_REFUNDED') {
            await window.aefEmailEngine.sendTransactionalEmail({
              templateId: 'E6_SUSPENSION_CANCELLATION',
              toEmail: email,
              toName: name,
              params: {
                reason: resultSummary,
                recoveryUrl: 'https://agoraeufalo.com.br/precos.html'
              }
            });
          }
        }
      } catch (mailErr) {
        console.warn('⚠️ [AEFWebhook] Falha no disparo do e-mail sistêmico:', mailErr);
      }

      return {
        success: true,
        eventId: eventId,
        event: event,
        studentId: studentId,
        tier: targetTier,
        enrolledProducts: targetCourses,
        accessStatus: accessStatus,
        summary: resultSummary,
        logEntry: logEntry
      };
    }

    /**
     * Processes Stripe Webhook Payload
     */
    async processStripeWebhook(eventPayload) {
      console.log('💳 [AEFWebhook] Processando Webhook Stripe:', eventPayload);
      const eventType = eventPayload.type || 'checkout.session.completed';
      const session = eventPayload.data?.object || eventPayload;

      const customerEmail = (session.customer_details?.email || session.customer_email || session.email || '').trim().toLowerCase();
      const customerName = (session.customer_details?.name || session.name || customerEmail.split('@')[0] || 'Aluno AgoraEuFalo').trim();
      const lineItems = session.line_items?.data || [];
      const prodDescription = lineItems[0]?.description || (session.amount_total > 50000 ? 'PROJETO_AEF_2026' : 'MAGIC_STORIES_CLUB');

      let mappedEvent = 'PURCHASE_APPROVED';
      if (eventType.includes('deleted') || eventType.includes('canceled')) {
        mappedEvent = 'SUBSCRIPTION_CANCELLATION';
      } else if (eventType.includes('payment_failed')) {
        mappedEvent = 'PURCHASE_DELAYED';
      }

      const adaptedPayload = {
        id: eventPayload.id || `stripe_${Date.now()}`,
        event: mappedEvent,
        version: "2.0.0",
        buyer: {
          email: customerEmail,
          name: customerName
        },
        product: {
          name: prodDescription,
          id: prodDescription.includes('VIP') ? 'PROJETO_AEF_2026' : '8460579'
        },
        purchase: {
          transaction: session.id || session.payment_intent || `stripe_${Date.now()}`,
          price: {
            value: (session.amount_total || 0) / 100,
            currency_code: (session.currency || 'brl').toUpperCase()
          }
        }
      };

      return await this.processHotmartWebhook(adaptedPayload);
    }
  }

  window.aefWebhookHandler = new AEFWebhookHandler();
})(window);
