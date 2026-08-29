/**
 * AgoraEuFalo • Webhook Handler & Automatic Student Enrollment
 * Professor Leonardo Leite
 * 
 * Processes incoming webhooks from Hotmart and Stripe, creates or updates
 * student records in Google Cloud Firestore, assigns access tiers, unlocks courses,
 * and triggers transactional welcome emails with Magic Link.
 */

(function (window) {
  'use strict';

  const PRODUCT_TIER_MAPPING = {
    // Hotmart Product IDs & Slugs
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
    'MAGIC_STORIES_CLUB': {
      tier: 'club_annual',
      role: 'student',
      enrolledProducts: ['ms-legacy', 'english-quickstart', 'frases-prontas'],
      productName: 'Magic Stories Club (Assinatura Anual)'
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
    resolveProductTier(productIdentifier) {
      if (!productIdentifier) return PRODUCT_TIER_MAPPING['MAGIC_STORIES_CLUB'];
      const clean = productIdentifier.toString().toUpperCase().replace(/[^A-Z0-9_]/g, '_');

      for (const [key, mapping] of Object.entries(PRODUCT_TIER_MAPPING)) {
        if (clean.includes(key) || key.includes(clean)) {
          return mapping;
        }
      }

      if (clean.includes('VIP') || clean.includes('MENTORIA') || clean.includes('2026')) {
        return PRODUCT_TIER_MAPPING['PROJETO_AEF_2026'];
      }
      if (clean.includes('CLUB') || clean.includes('ANUAL') || clean.includes('MAGIC')) {
        return PRODUCT_TIER_MAPPING['MAGIC_STORIES_CLUB'];
      }

      return PRODUCT_TIER_MAPPING['MAGIC_STORIES_CLUB'];
    }

    /**
     * Processes Hotmart Webhook Payload
     */
    async processHotmartWebhook(payload) {
      await this.init();
      console.log('📦 [AEFWebhook] Processando Webhook Hotmart:', payload);

      const event = payload.event || payload.hottok_event || 'PURCHASE_APPROVED';
      const data = payload.data || payload;
      const buyer = data.buyer || payload.buyer || {};
      const product = data.product || payload.product || {};
      const purchase = data.purchase || payload.purchase || {};

      const email = (buyer.email || payload.email || '').trim().toLowerCase();
      const name = (buyer.name || payload.name || email.split('@')[0] || 'Aluno AgoraEuFalo').trim();
      const phone = buyer.checkout_phone || buyer.phone || payload.phone || '';
      const prodName = product.name || payload.product_name || 'Magic Stories Club';
      const prodId = product.id || payload.product_id || 'MAGIC_STORIES_CLUB';

      if (!email) {
        throw new Error('E-mail do comprador não encontrado no payload do webhook.');
      }

      // Check if cancellation or refund
      const isCancellation = event === 'PURCHASE_CANCELED' || 
                             event === 'PURCHASE_REFUNDED' || 
                             event === 'PURCHASE_CHARGEBACK' || 
                             event === 'SUBSCRIPTION_CANCELLATION';

      const mapping = this.resolveProductTier(prodName || prodId);

      const studentId = email.replace(/[^a-zA-Z0-9]/g, '_');
      const nowIso = new Date().toISOString();

      const userRecord = {
        uid: studentId,
        email: email,
        name: name,
        phone: phone,
        tier: isCancellation ? 'free' : mapping.tier,
        role: 'student',
        enrolledProducts: isCancellation ? [] : mapping.enrolledProducts,
        lastTransaction: {
          gateway: 'hotmart',
          event: event,
          productName: prodName,
          transactionId: purchase.transaction || data.transaction || `tx_${Date.now()}`,
          processedAt: nowIso
        },
        updatedAt: nowIso
      };

      // 1. Sincroniza documento no Firestore (Coleção 'users')
      try {
        if (this.db) {
          await this.db.collection('users').doc(studentId).set(userRecord, { merge: true });
        } else {
          // REST Fallback
          await fetch(`https://firestore.googleapis.com/v1/projects/agoraeufalo-3463a/databases/(default)/documents/users/${studentId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fields: {
                uid: { stringValue: userRecord.uid },
                email: { stringValue: userRecord.email },
                name: { stringValue: userRecord.name },
                tier: { stringValue: userRecord.tier },
                role: { stringValue: userRecord.role },
                updatedAt: { stringValue: nowIso }
              }
            })
          });
        }
      } catch (dbErr) {
        console.warn('⚠️ [AEFWebhook] Aviso na persistência do Firestore:', dbErr);
      }

      // 2. Se for Mentoria VIP, cria registro em 'students'
      if (!isCancellation && mapping.tier === 'vip_mentorship') {
        try {
          const menteeDoc = {
            id: studentId,
            name: name,
            email: email,
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

      // 3. Disparo de E-mail de Boas-Vindas com Magic Link
      if (!isCancellation) {
        const magicLinkUrl = `https://agoraeufalo.com.br/portal.html?email=${encodeURIComponent(email)}&welcome=true`;
        
        try {
          if (window.aefCloudSync && typeof window.aefCloudSync.sendTransactionalEmail === 'function') {
            await window.aefCloudSync.sendTransactionalEmail('hotmart_welcome', {
              email: email,
              name: name,
              subject: `🎉 Bem-vindo ao AgoraEuFalo! Seu acesso ao ${mapping.productName} está liberado`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; background: #FFFDF9; border: 1px solid #EAE5DC; border-radius: 16px;">
                  <h2 style="color: #0A192F;">Olá, ${name}!</h2>
                  <p style="color: #4A453E; line-height: 1.6;">Sua matrícula no <strong>${mapping.productName}</strong> foi confirmada com sucesso pelo Professor Leonardo Leite!</p>
                  <p style="color: #4A453E; line-height: 1.6;">Você já pode acessar seu Portal do Aluno e começar seus treinos práticos de reflexo oral:</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${magicLinkUrl}" style="background: #C68A36; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">Acessar Meu Portal do Aluno ➔</a>
                  </div>
                  <p style="color: #7A7369; font-size: 12px;">Se precisar de qualquer suporte, envie um WhatsApp direto para o Leo ou responda a este e-mail.</p>
                </div>
              `
            });
          }
        } catch (mailErr) {
          console.warn('⚠️ [AEFWebhook] Falha no disparo de e-mail:', mailErr);
        }
      }

      return {
        success: true,
        user: userRecord,
        mapping: mapping,
        isCancellation: isCancellation
      };
    }

    /**
     * Processes Stripe Webhook Payload (Checkout Session Completed)
     */
    async processStripeWebhook(eventPayload) {
      console.log('💳 [AEFWebhook] Processando Webhook Stripe:', eventPayload);
      const eventType = eventPayload.type || 'checkout.session.completed';
      const session = eventPayload.data?.object || eventPayload;

      const customerEmail = (session.customer_details?.email || session.customer_email || session.email || '').trim().toLowerCase();
      const customerName = (session.customer_details?.name || session.name || customerEmail.split('@')[0] || 'Aluno AgoraEuFalo').trim();
      const lineItems = session.line_items?.data || [];
      const prodDescription = lineItems[0]?.description || session.amount_total > 50000 ? 'PROJETO_AEF_2026' : 'MAGIC_STORIES_CLUB';

      const adaptedPayload = {
        event: eventType.includes('deleted') || eventType.includes('canceled') ? 'SUBSCRIPTION_CANCELLATION' : 'PURCHASE_APPROVED',
        email: customerEmail,
        name: customerName,
        product_name: prodDescription,
        purchase: {
          transaction: session.id || session.payment_intent || `stripe_${Date.now()}`
        }
      };

      return await this.processHotmartWebhook(adaptedPayload);
    }
  }

  window.aefWebhookHandler = new AEFWebhookHandler();
})(window);
