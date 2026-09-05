/**
 * AgoraEuFalo • Cloudflare Worker: Hotmart Webhook Receiver (2.0.0 - Bulletproof Edition)
 * Professor Leonardo Leite
 * 
 * Este worker roda na borda (Edge) da Cloudflare, recebe as notificações
 * da Hotmart 24/7 sem cold start e grava instantaneamente no Firestore do AgoraEuFalo.
 */

const FIRESTORE_PROJECT_ID = "agoraeufalo-3463a";
const FIRESTORE_API_KEY = "AIzaSyCdcFzySfxGK6Uo0DM1-y_HpACvt5E71Sk";

// Mapeamento Oficial de Produtos & Tiers do AgoraEuFalo
const PRODUCT_TIER_MAPPING = {
  // Magic Stories Club (Anual & Mensal)
  "8460579": {
    tier: "club_annual",
    role: "student",
    enrolledProducts: ["ms-legacy", "english-quickstart", "frases-prontas"],
    productName: "Magic Stories Club"
  },
  "MAGIC_STORIES_CLUB": {
    tier: "club_annual",
    role: "student",
    enrolledProducts: ["ms-legacy", "english-quickstart", "frases-prontas"],
    productName: "Magic Stories Club (Assinatura Anual)"
  },
  // Projeto AgoraEuFalo 2026 (Mentoria VIP)
  "PROJETO_AEF_2026": {
    tier: "vip_mentorship",
    role: "student",
    enrolledProducts: ["ms-legacy", "english-quickstart", "frases-prontas", "all_access_master", "mentoria_vip"],
    productName: "Projeto AgoraEuFalo 2026 (Mentoria VIP)"
  },
  "MENTORIA_VIP": {
    tier: "vip_mentorship",
    role: "student",
    enrolledProducts: ["ms-legacy", "english-quickstart", "frases-prontas", "all_access_master", "mentoria_vip"],
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
      let payload = {};
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

      // 5. Validação opcional de segurança com Hottok
      const incomingHottok = request.headers.get("X-HOTMART-HOTTOK") || request.headers.get("x-hotmart-hottok");
      if (env && env.HOTMART_HOTTOK && incomingHottok) {
        if (env.HOTMART_HOTTOK !== incomingHottok) {
          console.warn("⚠️ Hottok inválido recebido:", incomingHottok);
        }
      }

      // 6. Extração dos campos Hotmart 2.0.0
      const event = (payload.event || payload.hottok_event || "PURCHASE_APPROVED").trim();
      const eventId = payload.id || `wh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const data = payload.data || payload;

      const buyer = data.buyer || payload.buyer || {};
      const product = data.product || payload.product || {};
      const purchase = data.purchase || payload.purchase || {};
      const subscription = data.subscription || payload.subscription || {};

      const email = (buyer.email || payload.email || "").trim().toLowerCase();
      const name = (buyer.name || payload.name || (email ? email.split("@")[0] : "Aluno AgoraEuFalo")).trim();
      const phone = buyer.checkout_phone || buyer.phone || "";
      const prodId = String(product.id || payload.product_id || "8460579");
      const prodName = product.name || payload.product_name || "Magic Stories Club";
      const offerCode = (purchase.offer?.code || payload.offer_code || "").toUpperCase();
      const txId = purchase.transaction || data.transaction || `tx_${Date.now()}`;
      const priceVal = purchase.price?.value || payload.price || 0;
      const formattedPrice = `R$ ${Number(priceVal).toFixed(2).replace(".", ",")}`;
      const isRecurrent = Boolean(purchase.recurrent || (purchase.recurrence_number && purchase.recurrence_number > 1));
      const recurrenceNumber = purchase.recurrence_number || (isRecurrent ? 2 : 1);

      // Se for apenas um ping de teste sem comprador, retorna 200 OK imediatamente
      if (!email) {
        return new Response(JSON.stringify({
          received: true,
          status: "test_acknowledged",
          message: "Notificação de teste recebida com sucesso pela Cloudflare."
        }), {
          status: 200,
          headers: { "Content-Type": "application/json; charset=utf-8" }
        });
      }

      const studentId = email.replace(/[^a-zA-Z0-9]/g, "_");
      const nowIso = new Date().toISOString();

      // 7. Mapeamento de Tiers e Regras de Negócio
      let mapping = PRODUCT_TIER_MAPPING[prodId] || PRODUCT_TIER_MAPPING["8460579"];
      if (offerCode.includes("VIP") || prodName.toUpperCase().includes("VIP") || prodName.includes("2026")) {
        mapping = PRODUCT_TIER_MAPPING["PROJETO_AEF_2026"];
      } else if (offerCode.includes("MENSAL")) {
        mapping = {
          tier: "club_monthly",
          role: "student",
          enrolledProducts: ["ms-legacy", "english-quickstart", "frases-prontas"],
          productName: "Magic Stories Club • Assinatura Mensal"
        };
      }

      let targetTier = mapping.tier;
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
            summary = `🎉 1ª Compra Aprovada! Aluno ${name} matriculado como '${targetTier}'.`;
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
            accessStatus = "canceled_grace";
            summary = `🛑 Assinatura Cancelada. Acesso mantido até ${expDate.toLocaleDateString("pt-BR")}.`;
          } else {
            targetTier = "free";
            targetCourses = [];
            accessStatus = "canceled_immediate";
            summary = `🛑 Assinatura Cancelada. Acesso rebaixado para Tier 'free'.`;
          }
          break;

        case "SWITCH_PLAN":
          summary = `🔀 Troca de Plano realizada para ${name}.`;
          break;

        case "PURCHASE_REFUNDED":
        case "PURCHASE_CHARGEBACK":
          targetTier = "free";
          targetCourses = [];
          accessStatus = "revoked";
          summary = `💸 Compra Reembolsada/Contestada. Acesso revogado imediatamente.`;
          break;

        default:
          summary = `ℹ️ Evento '${event}' registrado com sucesso.`;
          break;
      }

      // 8. Gravação no Google Cloud Firestore (users/{studentId})
      const userPayload = {
        uid: studentId,
        email: email,
        name: name,
        phone: phone,
        tier: targetTier,
        role: "student",
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
        },
        updatedAt: nowIso
      };

      await writeFirestore("users", studentId, userPayload);

      // 9. Se for VIP, garante registro em students/{studentId}
      if (targetTier === "vip_mentorship" && event === "PURCHASE_APPROVED") {
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

      // 10. Gravação de Log de Auditoria em webhook_logs/{eventId}
      const logPayload = {
        id: eventId,
        event: event,
        provider: "hotmart",
        buyerEmail: email,
        buyerName: name,
        productName: prodName,
        productId: prodId,
        transactionId: txId,
        amountFormatted: formattedPrice,
        status: (accessStatus === "revoked" || event === "PURCHASE_DELAYED") ? "warning" : "processed",
        resultSummary: summary,
        rawPayload: payload,
        processedAt: nowIso
      };

      await writeFirestore("webhook_logs", eventId, logPayload);

      // 11. Resposta HTTP 200 imediata para a Hotmart
      return new Response(JSON.stringify({
        received: true,
        eventId: eventId,
        event: event,
        student: email,
        tier: targetTier,
        message: summary
      }), {
        status: 200,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });

    } catch (err) {
      // Mesmo em erro inesperado, loga e responde com detalhes claros sem derrubar
      console.error("❌ Erro no processamento do webhook:", err);
      return new Response(JSON.stringify({
        received: false,
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
    console.warn("⚠️ Aviso na persistência do Firestore:", e);
  }
}
