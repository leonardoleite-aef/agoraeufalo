/**
 * =========================================================================
 * AgoraEuFalo • Módulo de Integração Hotmart Send (Gate Free Leads)
 * =========================================================================
 * Endpoint: https://handler.send.hotmart.com/convert/o4TQeL4
 * Token: 7d71287b-b314-4223-8295-037bce8c9fe5
 * Tag: portal_aef
 * =========================================================================
 */

(function () {
  const HOTMART_SEND_FREE_CONFIG = {
    endpoint: "https://handler.send.hotmart.com/convert/o4TQeL4",
    token: "7d71287b-b314-4223-8295-037bce8c9fe5",
    tag: "portal_aef",
    storageKey: "aef_free_lead_unlocked"
  };

  /**
   * Submete o lead gratuito para o Hotmart Send e sincroniza com o Firestore
   * @param {string} name Nome do aluno
   * @param {string} email E-mail do aluno
   * @param {string} phone WhatsApp / Telefone (Opcional)
   * @param {string} source Origem da captura (ex: 'portal_aef', 'player_publico')
   * @returns {Promise<{success: boolean, lead: object}>}
   */
  async function submitFreeLead(name, email, phone = "", source = "portal_aef") {
    const cleanName = (name || "").trim();
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPhone = (phone || "").trim();
    const nowIso = new Date().toISOString();

    const leadRecord = {
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone || "Não informado",
      whatsapp: cleanPhone || "Não informado",
      source: source,
      tag: HOTMART_SEND_FREE_CONFIG.tag,
      capturedAt: nowIso
    };

    // 1. Disparo para o Handler do Hotmart Send (FormData + no-cors)
    try {
      const formData = new FormData();
      formData.append("token", HOTMART_SEND_FREE_CONFIG.token);
      formData.append("name", cleanName);
      formData.append("email", cleanEmail);
      if (cleanPhone) {
        formData.append("phone", cleanPhone);
        formData.append("whatsapp", cleanPhone);
      }

      await fetch(HOTMART_SEND_FREE_CONFIG.endpoint, {
        method: "POST",
        mode: "no-cors",
        body: formData
      });
    } catch (sendErr) {
      console.warn("Hotmart Send dispatch warning (proceeding):", sendErr);
    }

    // 2. Sincronização Redundante com o Firestore (Coleção 'leads')
    try {
      const firestorePayload = {
        fields: {
          name: { stringValue: cleanName },
          email: { stringValue: cleanEmail },
          whatsapp: { stringValue: cleanPhone || "Não informado" },
          source: { stringValue: source },
          tag: { stringValue: HOTMART_SEND_FREE_CONFIG.tag },
          createdAt: { stringValue: nowIso }
        }
      };

      fetch("https://firestore.googleapis.com/v1/projects/agoraeufalo-3463a/databases/(default)/documents/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(firestorePayload)
      }).catch(() => {});
    } catch (fsErr) {
      console.warn("Firestore sync warning:", fsErr);
    }

    // 3. Persistência Local (Desbloqueio Imediato)
    try {
      localStorage.setItem(HOTMART_SEND_FREE_CONFIG.storageKey, JSON.stringify(leadRecord));
      localStorage.setItem("aef_public_lead", JSON.stringify(leadRecord));
      localStorage.setItem("aef_user_email", cleanEmail);
    } catch (e) {}

    return { success: true, lead: leadRecord };
  }

  /**
   * Verifica se o usuário atual já destravou o acesso gratuito
   * @returns {boolean}
   */
  function isFreeLeadUnlocked() {
    try {
      return !!(
        localStorage.getItem(HOTMART_SEND_FREE_CONFIG.storageKey) ||
        localStorage.getItem("aef_public_lead") ||
        localStorage.getItem("aef_user_email")
      );
    } catch (e) {
      return false;
    }
  }

  /**
   * Retorna os dados do lead desbloqueado
   * @returns {object|null}
   */
  function getUnlockedLeadData() {
    try {
      const raw = localStorage.getItem(HOTMART_SEND_FREE_CONFIG.storageKey) || localStorage.getItem("aef_public_lead");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  // Exportação Global para o Ecossistema AEF
  window.AEFHotmartSend = {
    config: HOTMART_SEND_FREE_CONFIG,
    submitFreeLead,
    isFreeLeadUnlocked,
    getUnlockedLeadData
  };
})();
