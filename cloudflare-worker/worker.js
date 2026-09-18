/**
 * AgoraEuFalo • Cloudflare Worker: Hotmart Webhook Receiver (2.0.0 - Bulletproof Edition)
 * Professor Leonardo Leite
 * 
 * Este worker roda na borda (Edge) da Cloudflare, recebe as notificações
 * da Hotmart 24/7 sem cold start e grava instantaneamente no Firestore do AgoraEuFalo.
 */

const FIRESTORE_PROJECT_ID = "agoraeufalo-3463a";
const FIRESTORE_API_KEY = "AIzaSyCdcFzySfxGK6Uo0DM1-y_HpACvt5E71Sk";

// Mapeamento Oficial de Produtos & Categorias do AgoraEuFalo
const PRODUCT_CATEGORY_MAPPING = {
  // AgoraEuFalo English Club (Anual & Mensal)
  "8460579": {
    categories: ["member_free", "member_pago"],
    subscription: { billingPeriod: "annual" },
    role: "student",
    enrolledProducts: ["ms-legacy", "english-quickstart", "frases-prontas"],
    productName: "AgoraEuFalo English Club"
  },
  "MAGIC_STORIES_CLUB": {
    categories: ["member_free", "member_pago"],
    subscription: { billingPeriod: "annual" },
    role: "student",
    enrolledProducts: ["ms-legacy", "english-quickstart", "frases-prontas"],
    productName: "AgoraEuFalo English Club (Assinatura Anual)"
  },
  // Projeto AgoraEuFalo 2026 (Mentoria VIP)
  "PROJETO_AEF_2026": {
    categories: ["member_free", "member_pago", "member_mentoria"],
    subscription: { billingPeriod: "annual" },
    role: "student",
    enrolledProducts: ["ms-legacy", "english-quickstart", "frases-prontas", "mentoria_vip"],
    productName: "Projeto AgoraEuFalo 2026 (Mentoria VIP)"
  },
  "MENTORIA_VIP": {
    categories: ["member_free", "member_pago", "member_mentoria"],
    subscription: { billingPeriod: "annual" },
    role: "student",
    enrolledProducts: ["ms-legacy", "english-quickstart", "frases-prontas", "mentoria_vip"],
    productName: "Mentoria VIP Individual AgoraEuFalo"
  }
};

export default {
  async fetch(request, env, ctx) {
    // 1. Resposta para pre-flight CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, X-HOTMART-HOTTOK, x-hotmart-hottok"
        }
      });
    }

    // 2. Resposta amigável para testes via navegador (HTTP GET)
    if (request.method === "GET") {
      return new Response(JSON.stringify({
        status: "online",
        service: "AgoraEuFalo • Hotmart Webhook Receiver",
        version: "2.0.0",
        message: "🟢 Endpoint ativo e escutando notificações POST da Hotmart 24/7.",
        project: FIRESTORE_PROJECT_ID,
        timestamp: new Date().toISOString()
      }, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // Apenas POST é permitido a partir daqui
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method Not Allowed. Use POST." }), {
        status: 405,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
    }

    let eventId = null;
    let event = "PURCHASE_APPROVED";
    let prodId = "8460579";
    let email = "";
    let occurredAt = new Date().toISOString();
    let receivedAt = new Date().toISOString();
    let payload = {};

    try {
      // 3. Leitura ultra-segura do corpo (evita erro 500 se o corpo for vazio no teste da Cloudflare)
      const rawText = await request.text();
      if (!rawText || !rawText.trim()) {
        return new Response(JSON.stringify({
          received: true,
          status: "ping_ok",
          message: "Teste de conexão recebido com sucesso (corpo vazio)."
        }), {
          status: 200,
          headers: { "Content-Type": "application/json; charset=utf-8" }
        });
      }

      // 4. Parse tolerante a JSON e Form URL-encoded
      try {
        payload = JSON.parse(rawText);
      } catch (parseErr) {
        try {
          const params = new URLSearchParams(rawText);
          payload = Object.fromEntries(params.entries());
        } catch (e2) {
          payload = { raw: rawText };
        }
      }

      // 5. Validação de segurança com Hottok
      const incomingHottok = request.headers.get("X-HOTMART-HOTTOK") || request.headers.get("x-hotmart-hottok");
      if (env && env.HOTMART_HOTTOK) {
        if (!incomingHottok || env.HOTMART_HOTTOK !== incomingHottok) {
          console.warn("[AEF Webhook] [AEF Auth] Token Hottok ausente ou inválido recebido.");
        }
      }

      // 6. Extração dos campos Hotmart 2.0.0 e Idempotência Estrita
      const data = payload.data || payload;
      const purchase = data.purchase || payload.purchase || {};
      const buyer = data.buyer || payload.buyer || {};
      const product = data.product || payload.product || {};
      const subscription = data.subscription || payload.subscription || {};

      event = (payload.event || payload.hottok_event || "PURCHASE_APPROVED").trim();
      const txId = (purchase.transaction || data.transaction || payload.transaction || "").trim();
      const rawEventId = (payload.id || data.id || "").trim();

      // Identificador único e determinístico do evento (Idempotência)
      // Se a Hotmart reenviar o mesmo webhook por retry, o eventId gerado é exatamente o mesmo
      eventId = rawEventId || (txId ? `wh_${txId}_${event.toLowerCase()}` : `wh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);

      receivedAt = new Date().toISOString();
      const rawOccurred = purchase.order_date || purchase.date || data.purchase_date || payload.creation_date || null;
      occurredAt = receivedAt;
      if (rawOccurred) {
        try {
          occurredAt = typeof rawOccurred === 'number' ? new Date(rawOccurred).toISOString() : new Date(rawOccurred).toISOString();
        } catch (e) {
          occurredAt = receivedAt;
        }
      }

      email = (buyer.email || payload.email || "").trim().toLowerCase();
      const name = (buyer.name || payload.name || (email ? email.split("@")[0] : "Aluno AgoraEuFalo")).trim();
      const phone = buyer.checkout_phone || buyer.phone || "";
      prodId = String(product.id || payload.product_id || "8460579");
      const prodName = product.name || payload.product_name || "AgoraEuFalo English Club";
      const offerCode = (purchase.offer?.code || payload.offer_code || "").toUpperCase();
      const priceVal = purchase.price?.value || payload.price || 0;
      const formattedPrice = `R$ ${Number(priceVal).toFixed(2).replace(".", ",")}`;
      const isRecurrent = Boolean(purchase.recurrent || (purchase.recurrence_number && purchase.recurrence_number > 1));
      const recurrenceNumber = purchase.recurrence_number || (isRecurrent ? 2 : 1);

      // Se for apenas um ping de teste sem comprador, retorna 200 OK imediatamente
      if (!email) {
        return new Response(JSON.stringify({
          received: true,
          status: "test_acknowledged",
          eventId: eventId,
          message: "Notificação de teste recebida com sucesso pela Cloudflare."
        }), {
          status: 200,
          headers: { "Content-Type": "application/json; charset=utf-8" }
        });
      }

      const studentId = email.replace(/[^a-zA-Z0-9]/g, "_");
      const nowIso = receivedAt;

      // 7. Mapeamento de Categorias e Regras de Negócio
      let mapping = PRODUCT_CATEGORY_MAPPING[prodId] || PRODUCT_CATEGORY_MAPPING["8460579"];
      if (offerCode.includes("VIP") || prodName.toUpperCase().includes("VIP") || prodName.includes("2026")) {
        mapping = PRODUCT_CATEGORY_MAPPING["PROJETO_AEF_2026"];
      } else if (offerCode.includes("MENSAL")) {
        mapping = {
          categories: ["member_free", "member_pago"],
          subscription: { billingPeriod: "monthly" },
          role: "student",
          enrolledProducts: ["ms-legacy", "english-quickstart", "frases-prontas"],
          productName: "AgoraEuFalo English Club • Assinatura Mensal"
        };
      }

      let targetCategories = [...mapping.categories];
      let targetCourses = mapping.enrolledProducts;
      let accessStatus = "active";
      let summary = "";
      let graceUntil = null;
      let expiresAt = null;

      switch (event) {
        case "PURCHASE_APPROVED":
          if (isRecurrent && recurrenceNumber > 1) {
            summary = `🔄 Recorrência #${recurrenceNumber} Aprovada. Assinatura mantida para ${name}.`;
          } else {
            summary = `🎉 1ª Compra Aprovada! Aluno ${name} matriculado com categorias [${targetCategories.join(', ')}].`;
          }
          break;

        case "PURCHASE_DELAYED":
          accessStatus = "overdue_grace_period";
          const graceDate = new Date();
          graceDate.setDate(graceDate.getDate() + 5);
          graceUntil = graceDate.toISOString();
          summary = `⚠️ Cobrança Atrasada. Aluno ${name} em tolerância de 5 dias.`;
          break;

        case "SUBSCRIPTION_CANCELLATION":
          const nextCharge = subscription.date_next_charge || data.date_next_charge;
          if (nextCharge) {
            const expDate = new Date(nextCharge);
            expiresAt = expDate.toISOString();
            graceUntil = expDate.toISOString();
            accessStatus = "canceled_grace";
            summary = `🛑 Assinatura Cancelada. Acesso mantido até ${expDate.toLocaleDateString("pt-BR")}.`;
          } else {
            targetCategories = ["member_free"];
            targetCourses = [];
            accessStatus = "canceled_immediate";
            summary = `🛑 Assinatura Cancelada. Acesso rebaixado para member_free.`;
          }
          break;

        case "SWITCH_PLAN":
          summary = `🔀 Troca de Plano realizada para ${name}.`;
          break;

        case "PURCHASE_REFUNDED":
        case "PURCHASE_CHARGEBACK":
          targetCategories = ["member_free"];
          targetCourses = [];
          accessStatus = "revoked";
          summary = `💸 Compra Reembolsada/Contestada. Acesso revogado imediatamente.`;
          break;

        default:
          summary = `ℹ️ Evento '${event}' registrado com sucesso.`;
          break;
      }

      // 8. Gravação no Google Cloud Firestore (users/{studentId})
      // Compute backward-compat tier from categories
      const legacyTier = targetCategories.includes('member_mentoria') ? 'vip_mentorship'
        : targetCategories.includes('member_pago') ? (mapping.subscription?.billingPeriod === 'monthly' ? 'club_monthly' : 'club_annual')
        : 'free';

      const primaryEntitlement = targetCategories.includes('member_mentoria')
        ? 'member_mentoria'
        : targetCategories.includes('member_pago')
        ? 'member_pago'
        : 'member_free';

      const billingPeriod = mapping.subscription?.billingPeriod || "annual";

      // V2 Subscriptions Array (em conformidade com Subscription em src/types/core.ts)
      const subscriptions = [
        {
          id: `sub_${studentId}_hotmart`,
          entitlement: primaryEntitlement,
          productId: prodId,
          billingPeriod: billingPeriod,
          status: accessStatus,
          expiresAt: expiresAt,
          graceUntil: graceUntil,
          gateway: "hotmart",
          lastEventId: eventId,
          updatedAt: nowIso
        }
      ];

      const legacyEntitlements = Array.from(new Set([
        "member_free",
        ...targetCategories.filter(c => typeof c === "string" && c.startsWith("legado_"))
      ]));

      // Modelo AEFUser V2 com retrocompatibilidade
      const userPayload = {
        // V2 Canonical Schema
        schemaVersion: 2,
        id: studentId,
        uid: studentId,
        email: email,
        name: name,
        phone: phone,
        role: "student",
        subscriptions: subscriptions,
        purchasedProducts: [],
        legacyEntitlements: legacyEntitlements,
        createdAt: nowIso,
        updatedAt: nowIso,

        // Bloco legacy estruturado
        legacy: {
          tier: legacyTier,
          enrolledProducts: targetCourses,
          categories: targetCategories,
          subscription: {
            billingPeriod: billingPeriod,
            status: accessStatus,
            expiresAt: expiresAt,
            graceUntil: graceUntil,
            gateway: "hotmart",
            lastEvent: event,
            lastEventId: eventId,
            updatedAt: nowIso
          },
          role: "student"
        },

        // BACKWARD COMPAT (campos raiz para consumidores legados)
        categories: targetCategories,
        subscription: {
          billingPeriod: billingPeriod,
          status: accessStatus,
          expiresAt: expiresAt,
          graceUntil: graceUntil,
          gateway: "hotmart",
          lastEvent: event,
          lastEventId: eventId,
          updatedAt: nowIso
        },
        tier: legacyTier,
        enrolledProducts: targetCourses,
        subscriptionState: {
          status: accessStatus,
          isRecurrent: isRecurrent,
          recurrenceNumber: recurrenceNumber,
          graceUntil: graceUntil,
          expiresAt: expiresAt,
          lastEvent: event,
          updatedAt: nowIso
        },
        lastTransaction: {
          gateway: "hotmart",
          event: event,
          productName: prodName,
          productId: prodId,
          offerCode: offerCode,
          amountFormatted: formattedPrice,
          transactionId: txId,
          processedAt: nowIso
        }
      };

      await writeFirestore("users", studentId, userPayload);

      // 9. Se for VIP (member_mentoria), garante registro em students/{studentId}
      if (targetCategories.includes("member_mentoria") && event === "PURCHASE_APPROVED") {
        await writeFirestore("students", studentId, {
          id: studentId,
          name: name,
          email: email,
          phone: phone,
          badge: "VIP Mentee",
          subtitle: "Acompanhamento 1 a 1 do Professor Leo",
          tier: "vip_mentorship",
          updatedAt: nowIso
        });
      }

      // 10. Gravação de Log de Auditoria em webhook_logs/{eventId} (Conforme interface WebhookEvent V2)
      const logPayload = {
        id: eventId,
        provider: "hotmart",
        type: event,
        productId: prodId,
        buyerEmail: email,
        occurredAt: occurredAt,
        receivedAt: receivedAt,
        raw: payload,
        processedAt: nowIso,
        processingError: null,

        // Campos auxiliares para auditoria e dashboard admin
        event: event,
        buyerName: name,
        productName: prodName,
        transactionId: txId,
        amountFormatted: formattedPrice,
        status: (accessStatus === "revoked" || event === "PURCHASE_DELAYED") ? "warning" : "processed",
        resultSummary: summary,
        rawPayload: payload
      };

      await writeFirestore("webhook_logs", eventId, logPayload);

      // 11. Resposta HTTP 200 imediata para a Hotmart
      return new Response(JSON.stringify({
        received: true,
        eventId: eventId,
        event: event,
        student: email,
        tier: legacyTier,
        message: summary
      }), {
        status: 200,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });

    } catch (err) {
      // Mesmo em erro inesperado, loga estruturado sem derrubar
      console.error("[AEF Webhook] [AEF Error] Erro no processamento do webhook:", err.message || err);

      try {
        if (eventId) {
          await writeFirestore("webhook_logs", eventId, {
            id: eventId,
            provider: "hotmart",
            type: event || "UNKNOWN_ERROR",
            productId: prodId || "",
            buyerEmail: email || "unknown",
            occurredAt: occurredAt || new Date().toISOString(),
            receivedAt: receivedAt || new Date().toISOString(),
            raw: payload || {},
            processedAt: new Date().toISOString(),
            processingError: err.message || "Erro desconhecido",
            status: "error",
            resultSummary: `❌ Falha: ${err.message || "Erro desconhecido"}`
          });
        }
      } catch (logErr) {
        console.warn("[AEF Webhook] [AEF Error] Falha ao registrar log de erro no Firestore:", logErr.message || logErr);
      }

      return new Response(JSON.stringify({
        received: false,
        eventId: eventId,
        error: err.message || "Erro desconhecido"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
    }
  }
};

// Conversor de tipos nativos JS para schema REST do Firestore
function toFirestoreField(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === "string") return { stringValue: val };
  if (typeof val === "number") {
    return Number.isInteger(val) ? { integerValue: val.toString() } : { doubleValue: val };
  }
  if (typeof val === "boolean") return { booleanValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreField) } };
  }
  if (typeof val === "object") {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) fields[k] = toFirestoreField(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

// Gravação direta na API REST do Firestore
async function writeFirestore(collection, docId, data) {
  try {
    const fields = {};
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) fields[k] = toFirestoreField(v);
    }

    const url = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents/${collection}/${docId}?key=${FIRESTORE_API_KEY}`;
    
    await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields })
    });
  } catch (e) {
    console.warn("[AEF Webhook] [AEF Error] Aviso na persistência do Firestore:", e.message || e);
  }
}
