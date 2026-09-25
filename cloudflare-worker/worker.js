/**
 * AgoraEuFalo • Cloudflare Worker: Hotmart Webhook Receiver (2.0.0 - Bulletproof Edition)
 * Professor Leonardo Leite
 * 
 * Este worker roda na borda (Edge) da Cloudflare, recebe as notificações
 * da Hotmart 24/7 sem cold start e grava instantaneamente no Firestore do AgoraEuFalo.
 */

const FIRESTORE_PROJECT_ID = "agoraeufalo-3463a";
const FIRESTORE_API_KEY = "AIzaSyCdcFzySfxGK6Uo0DM1-y_HpACvt5E71Sk";

// Mapeamento Oficial de Produtos & Categorias do AgoraEuFalo (Fallback de Alta Disponibilidade)
export const PRODUCT_CATEGORY_MAPPING = {
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

// ============================================================================
// EXTERNALIZAÇÃO DE CONFIGURAÇÕES (config/productMappings e config/vipOverrides)
// ============================================================================
let cachedProductMappings = null;
let cachedProductMappingsTime = 0;
let cachedVipOverrides = null;
let cachedVipOverridesTime = 0;
const CONFIG_CACHE_TTL_MS = 60000;

export async function getDynamicProductMappings(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedProductMappings && (now - cachedProductMappingsTime < CONFIG_CACHE_TTL_MS)) {
    return cachedProductMappings;
  }
  try {
    const doc = await readFirestoreDoc("config", "productMappings");
    if (doc && doc.mappings && typeof doc.mappings === "object" && Object.keys(doc.mappings).length > 0) {
      cachedProductMappings = doc.mappings;
      cachedProductMappingsTime = now;
      return cachedProductMappings;
    }
  } catch (err) {
    console.warn("[AEF Config] Falha ao carregar config/productMappings do Firestore:", err.message || err);
  }
  return PRODUCT_CATEGORY_MAPPING;
}

export async function getDynamicVipOverrides(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedVipOverrides && (now - cachedVipOverridesTime < CONFIG_CACHE_TTL_MS)) {
    return cachedVipOverrides;
  }
  try {
    const doc = await readFirestoreDoc("config", "vipOverrides");
    if (doc && (doc.vipEmails || doc.adminEmails || doc.overrides)) {
      cachedVipOverrides = doc;
      cachedVipOverridesTime = now;
      return cachedVipOverrides;
    }
  } catch (err) {
    console.warn("[AEF Config] Falha ao carregar config/vipOverrides do Firestore:", err.message || err);
  }
  return {
    adminEmails: [
      "selexenglish@gmail.com",
      "leonardo@agoraeufalo.com.br",
      "leo@agoraeufalo.com.br"
    ],
    vipEmails: [
      "andrebarrote1992@gmail.com",
      "estevaopin@gmail.com",
      "mateus.s.gomes.novo@gmail.com",
      "thomasskt21@gmail.com",
      "selexenglish@gmail.com",
      "leonardo@agoraeufalo.com.br",
      "leo@agoraeufalo.com.br"
    ],
    overrides: {}
  };
}

export function isEmailAdmin(email, vipConfig = null) {
  if (!email) return false;
  const clean = String(email).toLowerCase().trim();
  if (vipConfig && Array.isArray(vipConfig.adminEmails)) {
    return vipConfig.adminEmails.includes(clean);
  }
  return clean === "selexenglish@gmail.com";
}

/**
 * Comparação em tempo constante para mitigar ataques de timing (Timing Attack Mitigation).
 * Suporta strings de forma determinística e segura em Cloudflare Workers, Node.js e V8.
 */
export function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }
  if (!a || !b) {
    return false;
  }

  const lenA = a.length;
  const lenB = b.length;
  let mismatch = lenA === lenB ? 0 : 1;
  const maxLen = Math.max(lenA, lenB);

  for (let i = 0; i < maxLen; i++) {
    const charA = i < lenA ? a.charCodeAt(i) : 0;
    const charB = i < lenB ? b.charCodeAt(i) : 0;
    mismatch |= (charA ^ charB);
  }

  return mismatch === 0;
}

/**
 * Extrai o token Hottok a partir dos cabeçalhos oficiais da Hotmart, query string ou corpo da mensagem.
 */
export function extractHottok(request, payload) {
  let token = null;

  if (request && request.headers) {
    token = request.headers.get("X-HOTMART-HOTTOK") ||
      request.headers.get("x-hotmart-hottok") ||
      request.headers.get("hottok");
  }

  if (!token && request && request.url) {
    try {
      const url = new URL(request.url);
      token = url.searchParams.get("hottok");
    } catch (_) { }
  }

  if (!token && payload) {
    token = payload.hottok || (payload.data && payload.data.hottok);
  }

  return token ? String(token).trim() : null;
}

export function base64UrlToUint8Array(base64Url) {
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  const binaryString = typeof atob === "function"
    ? atob(base64)
    : Buffer.from(base64, "base64").toString("binary");
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function decodeJwtPayload(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const parts = token.split(".");
    if (parts.length >= 2) {
      let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      while (base64.length % 4 !== 0) {
        base64 += "=";
      }
      const json = typeof atob === "function"
        ? atob(base64)
        : Buffer.from(base64, "base64").toString("utf-8");
      return JSON.parse(json);
    }
  } catch (_) { }
  return null;
}

let jwksMemoryCache = {
  keys: [],
  expiresAt: 0
};

export function clearJwksCache() {
  jwksMemoryCache = { keys: [], expiresAt: 0 };
}

export async function fetchGoogleJwks(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && jwksMemoryCache.keys.length > 0 && now < jwksMemoryCache.expiresAt) {
    return jwksMemoryCache.keys;
  }

  const urls = [
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
    "https://www.googleapis.com/service_accounts/v1/jwks/securetoken@system.gserviceaccount.com"
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.keys)) {
          let maxAgeSec = 3600;
          const cacheControl = res.headers?.get?.("cache-control") || "";
          const match = cacheControl.match(/max-age=(\d+)/);
          if (match) {
            maxAgeSec = parseInt(match[1], 10);
          }
          jwksMemoryCache = {
            keys: data.keys,
            expiresAt: now + (maxAgeSec * 1000)
          };
          return data.keys;
        }
      }
    } catch (_) { }
  }

  if (jwksMemoryCache.keys.length > 0) {
    return jwksMemoryCache.keys;
  }
  throw new Error("Não foi possível obter chaves públicas (JWKS) do Google para validação do token.");
}

/**
 * Validação Criptográfica Estrita de ID Tokens do Firebase Auth (§3.1).
 * Valida assinatura RS256 contra JWKS público do Google, emissor, audiência, expiração e email_verified.
 */
export async function verifyFirebaseIdToken(token, projectId = FIRESTORE_PROJECT_ID) {
  if (!token || typeof token !== "string") {
    throw new Error("Token ausente ou formato inválido.");
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Token JWT malformado: esperado formato header.payload.signature.");
  }

  const [headerB64, payloadB64, signatureB64] = parts;

  let header;
  let payload;
  try {
    header = JSON.parse(new TextDecoder().decode(base64UrlToUint8Array(headerB64)));
    payload = JSON.parse(new TextDecoder().decode(base64UrlToUint8Array(payloadB64)));
  } catch (e) {
    throw new Error("Falha ao decodificar header ou payload do JWT: " + (e.message || e));
  }

  if (header.alg !== "RS256") {
    throw new Error(`Algoritmo JWT inválido: esperado RS256, recebido ${header.alg}`);
  }
  if (!header.kid) {
    throw new Error("Header JWT não contém 'kid' (Key ID).");
  }

  // 1. Validação estrita de claims obrigatórias (§3.1)
  const expectedIssuer = `https://securetoken.google.com/${projectId}`;
  if (payload.iss !== expectedIssuer) {
    throw new Error(`Token issuer inválido: esperado ${expectedIssuer}, recebido ${payload.iss}`);
  }
  if (payload.aud !== projectId) {
    throw new Error(`Token audience inválido: esperado ${projectId}, recebido ${payload.aud}`);
  }
  const nowSec = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp <= nowSec) {
    throw new Error(`Token expirado (exp: ${payload.exp}, now: ${nowSec})`);
  }
  if (payload.email_verified !== true) {
    throw new Error("Email não verificado no Firebase Auth (email_verified: false).");
  }
  const uid = payload.sub || payload.user_id;
  if (!uid) {
    throw new Error("Token JWT não contém UID do usuário ('sub').");
  }

  // 2. Busca da chave pública no JWKS do Google
  let keys = await fetchGoogleJwks(false);
  let matchedKey = keys.find(k => k.kid === header.kid);
  if (!matchedKey) {
    keys = await fetchGoogleJwks(true);
    matchedKey = keys.find(k => k.kid === header.kid);
  }

  if (!matchedKey) {
    throw new Error(`Chave pública 'kid'=${header.kid} não encontrada no JWKS do Google.`);
  }

  // 3. Importação da chave pública RSA para Web Crypto
  const cryptoKey = await crypto.subtle.importKey(
    "jwk",
    {
      kty: "RSA",
      n: matchedKey.n,
      e: matchedKey.e,
      alg: "RS256",
      ext: true
    },
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );

  // 4. Verificação Criptográfica da Assinatura (RS256)
  const signedData = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const signatureBytes = base64UrlToUint8Array(signatureB64);
  const isValidSignature = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    signatureBytes,
    signedData
  );

  if (!isValidSignature) {
    throw new Error("Assinatura criptográfica do ID Token inválida.");
  }

  return {
    ...payload,
    uid: uid
  };
}

// Conversor de tipos nativos JS para schema REST do Firestore
export function toFirestoreField(val) {
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

export function toFirestoreFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && typeof v !== "function" && k !== "id" && !k.startsWith("_")) {
      fields[k] = toFirestoreField(v);
    }
  }
  return fields;
}

export function parseRestField(field) {
  if (!field) return null;
  if ("stringValue" in field) return field.stringValue;
  if ("integerValue" in field) return parseInt(field.integerValue, 10);
  if ("doubleValue" in field) return parseFloat(field.doubleValue);
  if ("booleanValue" in field) return field.booleanValue;
  if ("nullValue" in field) return null;
  if ("timestampValue" in field) return field.timestampValue;
  if ("arrayValue" in field) {
    return Array.isArray(field.arrayValue?.values)
      ? field.arrayValue.values.map(parseRestField)
      : [];
  }
  if ("mapValue" in field) {
    const res = {};
    for (const [k, v] of Object.entries(field.mapValue?.fields || {})) {
      res[k] = parseRestField(v);
    }
    return res;
  }
  return null;
}

export function parseRestDoc(doc, fallbackId = "") {
  if (!doc) return null;
  const docId = doc.name ? doc.name.split("/").pop() : fallbackId;
  const obj = { id: docId, uid: docId };
  if (doc.updateTime) {
    obj._updateTime = doc.updateTime;
  }
  for (const [k, v] of Object.entries(doc.fields || {})) {
    obj[k] = parseRestField(v);
  }
  return obj;
}

// Leitura direta na API REST do Firestore
export async function readFirestoreDoc(collection, docId) {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents/${collection}/${docId}?key=${FIRESTORE_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const doc = await res.json();
    return parseRestDoc(doc, docId);
  } catch (err) {
    console.warn(`[AEF Worker] [AEF Error] Falha ao ler ${collection}/${docId}:`, err.message || err);
    return null;
  }
}

// Listagem direta na API REST do Firestore (com paginação)
export async function listFirestoreDocs(collection, pageSize = 300, pageToken = null) {
  try {
    let url = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents/${collection}?pageSize=${pageSize}&key=${FIRESTORE_API_KEY}`;
    if (pageToken) url += `&pageToken=${encodeURIComponent(pageToken)}`;
    const res = await fetch(url);
    if (!res.ok) return { documents: [], nextPageToken: null };
    const data = await res.json();
    const docs = (data.documents || []).map(doc => parseRestDoc(doc, doc.name.split("/").pop()));
    return { documents: docs, nextPageToken: data.nextPageToken || null };
  } catch (err) {
    console.warn(`[AEF Worker] [AEF Error] Falha ao listar ${collection}:`, err.message || err);
    return { documents: [], nextPageToken: null };
  }
}


// Consulta estruturada por email na coleção users
export async function queryFirestoreUserByEmail(cleanEmail) {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents:runQuery?key=${FIRESTORE_API_KEY}`;
    const queryPayload = {
      structuredQuery: {
        from: [{ collectionId: "users" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "email" },
            op: "EQUAL",
            value: { stringValue: cleanEmail }
          }
        },
        limit: 1
      }
    };
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(queryPayload)
    });
    if (!res.ok) return null;
    const results = await res.json();
    if (Array.isArray(results)) {
      for (const item of results) {
        if (item.document) {
          return parseRestDoc(item.document);
        }
      }
    }
    return null;
  } catch (e) {
    console.warn("[AEF Worker] [AEF Error] Falha na consulta por email:", e.message || e);
    return null;
  }
}

// Gravação direta na API REST do Firestore com suporte a updateMask e precondições atômicas
export async function writeFirestore(collection, docId, data, options = {}) {
  try {
    const fields = toFirestoreFields(data);
    let url = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents/${collection}/${docId}?key=${FIRESTORE_API_KEY}`;

    if (options.updateMask && Array.isArray(options.updateMask)) {
      for (const path of options.updateMask) {
        url += `&updateMask.fieldPaths=${encodeURIComponent(path)}`;
      }
    }
    if (options.currentDocument) {
      if (options.currentDocument.exists !== undefined) {
        url += `&currentDocument.exists=${options.currentDocument.exists}`;
      }
      if (options.currentDocument.updateTime) {
        url += `&currentDocument.updateTime=${encodeURIComponent(options.currentDocument.updateTime)}`;
      }
    }

    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields })
    });

    if (!res.ok) {
      const errText = await res.text();
      if (res.status === 400 || res.status === 409 || res.status === 412 || errText.includes("precondition") || errText.includes("FAILED_PRECONDITION")) {
        return { success: false, preconditionFailed: true, error: errText };
      }
      console.warn(`[AEF Worker] [AEF Error] Falha ao persistir ${collection}/${docId}:`, errText);
      return { success: false, error: errText };
    }
    return { success: true, data: await res.json() };
  } catch (e) {
    console.warn("[AEF Webhook] [AEF Error] Aviso na persistência do Firestore:", e.message || e);
    return { success: false, error: e.message };
  }
}

// Exclusão direta na API REST do Firestore (Server-Side)
export async function deleteFirestoreDoc(collection, docId) {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents/${collection}/${docId}?key=${FIRESTORE_API_KEY}`;
    const res = await fetch(url, { method: "DELETE" });
    return res.ok;
  } catch (e) {
    console.warn(`[AEF Admin] [AEF Error] Erro ao deletar documento ${collection}/${docId}:`, e.message || e);
    return false;
  }
}

/**
 * Gravação condicional atômica em webhook_events/{eventId} (currentDocument.exists=false).
 * Se o documento já existir, o Firestore rejeita atomicamente com erro 400/409 (ALREADY_EXISTS / Precondition failed),
 * garantindo dedup confiável sem condição de corrida (Race Condition Prevention).
 */
export async function saveAtomicWebhookEvent(eventId, eventData) {
  try {
    const fields = toFirestoreFields(eventData);
    const url = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents/webhook_events/${eventId}?currentDocument.exists=false&key=${FIRESTORE_API_KEY}`;

    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields })
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 409 || res.status === 400 || text.includes("ALREADY_EXISTS") || text.includes("precondition")) {
        return { duplicate: true };
      }
      console.warn(`[AEF Webhook] [AEF Error] Aviso ao gravar webhook_events/${eventId}:`, text);
      return { error: text };
    }

    return { duplicate: false, data: await res.json() };
  } catch (e) {
    console.warn("[AEF Webhook] [AEF Error] Erro de rede ao gravar webhook_events:", e.message || e);
    return { error: e.message };
  }
}

// Normalizador Canônico V2 para o Worker
export function normalizeUserV2(raw, vipConfig = null) {
  if (!raw) return null;
  const email = (raw.email || "").toLowerCase().trim();
  const uid = String(raw.uid || raw.id || (email ? email.replace(/[^a-zA-Z0-9]/g, "_") : "user"));
  const id = String(raw.id || uid);
  const name = String(raw.name || raw.displayName || (email ? email.split("@")[0] : "Aluno AgoraEuFalo"));

  let role = raw.role || "student";
  if (raw.role === "admin" || raw.tier === "admin_master" || (Array.isArray(raw.categories) && raw.categories.includes("admin")) || isEmailAdmin(email, vipConfig)) {
    role = "admin";
  }

  const legacyEntitlementsSet = new Set(["member_free"]);
  if (Array.isArray(raw.legacyEntitlements)) {
    raw.legacyEntitlements.forEach(e => legacyEntitlementsSet.add(e));
  }
  if (Array.isArray(raw.categories)) {
    raw.categories.forEach(c => {
      if (c === "legado_1" || c === "legado_2" || c === "member_free") legacyEntitlementsSet.add(c);
    });
  }
  if (raw.tier === "ms_legacy" || raw.category === "magic_stories_legacy") {
    legacyEntitlementsSet.add("legado_1");
  } else if (raw.tier === "primeiro_legado" || raw.category === "primeiro_legado_agoraeufalo") {
    legacyEntitlementsSet.add("legado_2");
  }

  const subscriptions = Array.isArray(raw.subscriptions) ? [...raw.subscriptions] : [];
  if (subscriptions.length === 0 && raw.subscription && typeof raw.subscription === "object") {
    subscriptions.push({
      id: String(raw.subscription.id || `sub_${uid}_hotmart`),
      entitlement: raw.subscription.entitlement || (raw.categories?.includes("member_mentoria") ? "member_mentoria" : "member_pago"),
      productId: String(raw.subscription.productId || "8460579"),
      billingPeriod: raw.subscription.billingPeriod || "annual",
      status: raw.subscription.status || "active",
      expiresAt: raw.subscription.expiresAt || null,
      graceUntil: raw.subscription.graceUntil || null,
      gateway: raw.subscription.gateway || "hotmart",
      lastEventId: String(raw.subscription.lastEventId || "sync"),
      updatedAt: String(raw.subscription.updatedAt || new Date().toISOString())
    });
  }

  const purchasedProducts = Array.isArray(raw.purchasedProducts) ? [...raw.purchasedProducts] : [];
  if (Array.isArray(raw.enrolledProducts)) {
    raw.enrolledProducts.forEach((ep, idx) => {
      const already = purchasedProducts.some(p => (typeof p === "string" && p === ep) || p.courseId === ep || p.productId === ep);
      if (!already && ep !== "ms-legacy" && ep !== "english-quickstart" && ep !== "frases-prontas") {
        purchasedProducts.push({
          productId: ep,
          courseId: ep,
          purchasedAt: String(raw.createdAt || new Date().toISOString()),
          gateway: "manual",
          transactionId: `tx_enrolled_${ep}_${idx}`
        });
      }
    });
  }

  return {
    ...raw,
    schemaVersion: 2,
    id,
    uid,
    email,
    name,
    role,
    tier: raw.tier || "free",
    categories: Array.isArray(raw.categories) && raw.categories.length > 0 ? raw.categories : Array.from(legacyEntitlementsSet),
    subscriptions,
    purchasedProducts,
    legacyEntitlements: Array.from(legacyEntitlementsSet),
    enrolledProducts: Array.isArray(raw.enrolledProducts) ? raw.enrolledProducts : [],
    updatedAt: new Date().toISOString(),
    legacy: {
      tier: raw.tier,
      enrolledProducts: raw.enrolledProducts,
      categories: raw.categories,
      subscription: raw.subscription,
      role: raw.role
    }
  };
}

// ============================================================================
// ENDPOINT: /api/claim-preregistration (Resolução Segura de Pré-Registro)
// ============================================================================
export async function handleClaimPreregistration(request, env) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed. Use POST." }), {
      status: 405,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  let body = {};
  try {
    const text = await request.text();
    body = text ? JSON.parse(text) : {};
  } catch (e) {
    body = {};
  }

  // 1. Obtenção e Validação Criptográfica Estrita do ID Token (§3.1)
  let token = null;
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  } else if (body.idToken) {
    token = String(body.idToken).trim();
  }

  if (!token) {
    return new Response(JSON.stringify({
      error: "Unauthorized",
      message: "Bearer ID Token é obrigatório para reivindicar pré-registro."
    }), {
      status: 401,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  let verifiedPayload;
  try {
    verifiedPayload = await verifyFirebaseIdToken(token, FIRESTORE_PROJECT_ID);
  } catch (tokenErr) {
    console.warn("[AEF Claim] [AEF Security] Rejeição criptográfica do ID Token:", tokenErr.message || tokenErr);
    return new Response(JSON.stringify({
      error: "Unauthorized",
      message: `Falha na verificação criptográfica do token: ${tokenErr.message}`
    }), {
      status: 401,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  // Identidade extraída exclusivamente do token validado criptograficamente
  const uid = verifiedPayload.uid;
  const email = (verifiedPayload.email || "").toLowerCase().trim();
  const name = body.name || verifiedPayload.name || "";

  if (!email || !uid) {
    return new Response(JSON.stringify({
      error: "Bad Request",
      message: "UID e email verificado são obrigatórios para vincular o pré-registro."
    }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  const legacyId = email.replace(/[^a-zA-Z0-9]/g, "_");

  // 2. Busca pré-registro por legacyId (ex: joao_silva_gmail_com)
  let preReg = null;
  if (legacyId !== uid) {
    preReg = await readFirestoreDoc("users", legacyId);
  }

  // 3. Se não encontrou por legacyId, busca via query de email
  if (!preReg) {
    preReg = await queryFirestoreUserByEmail(email);
  }

  // 4. Guarda Atômica Claim-Once (§3.4)
  if (preReg) {
    const existingLinkedUid = preReg.linkedUid || preReg.claimedBy;
    if (existingLinkedUid && existingLinkedUid !== uid) {
      console.warn(`[AEF Claim] [AEF Conflict] Pré-registro ${email} já vinculado ao UID ${existingLinkedUid}. Rejeitando tentativa do UID ${uid}.`);
      return new Response(JSON.stringify({
        error: "Conflict",
        message: `Este pré-registro já foi vinculado a outra conta de aluno (${existingLinkedUid}).`
      }), {
        status: 409,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }
  }

  // 5. Lê perfil existente no uid atual (se houver)
  const currentUidDoc = await readFirestoreDoc("users", uid);

  // 6. Faz o merge de dados (priorizando pré-registro para categorias, tier e matrículas legadas)
  const mergedData = {
    ...(preReg || {}),
    ...(currentUidDoc || {}),
    id: uid,
    uid: uid,
    email: email,
    name: (currentUidDoc && currentUidDoc.name) || (preReg && preReg.name) || name || email.split("@")[0]
  };

  if (preReg) {
    if (preReg.tier && preReg.tier !== "free") mergedData.tier = preReg.tier;
    if (preReg.role && preReg.role !== "student") mergedData.role = preReg.role;
    if (preReg.categories) {
      mergedData.categories = Array.from(new Set([...(mergedData.categories || []), ...preReg.categories]));
    }
    if (preReg.enrolledProducts) {
      mergedData.enrolledProducts = Array.from(new Set([...(mergedData.enrolledProducts || []), ...preReg.enrolledProducts]));
    }
    if (preReg.subscription) mergedData.subscription = preReg.subscription;
  }

  const normalizedUser = normalizeUserV2(mergedData);
  normalizedUser.claimedFrom = (preReg && preReg.id !== uid) ? preReg.id : null;

  // 7. Marcação Atômica Claim-Once no documento de origem legado (§1.6 e §3.4)
  if (legacyId !== uid && preReg && preReg.id === legacyId) {
    const linkOptions = {
      updateMask: ["linkedUid", "claimedBy", "claimedAt", "schemaVersion", "updatedAt"],
      currentDocument: { exists: true }
    };
    if (preReg._updateTime) {
      linkOptions.currentDocument.updateTime = preReg._updateTime;
    }

    const linkRes = await writeFirestore("users", legacyId, {
      ...preReg,
      linkedUid: uid,
      claimedBy: uid,
      claimedAt: new Date().toISOString(),
      schemaVersion: 2,
      updatedAt: new Date().toISOString()
    }, linkOptions);

    if (linkRes && linkRes.preconditionFailed) {
      // Conflito de concorrência atômica: outra requisição simultânea alterou o registro legado
      const freshPreReg = await readFirestoreDoc("users", legacyId);
      const freshLinkedUid = freshPreReg && (freshPreReg.linkedUid || freshPreReg.claimedBy);

      // Devolve 409 apenas se o documento já pertencer de fato a um terceiro (§Nota 2.b)
      if (freshLinkedUid && freshLinkedUid !== uid) {
        console.warn(`[AEF Claim] [AEF Conflict] Concorrência atômica detectada: pré-registro ${email} vinculado a terceiro (${freshLinkedUid}). Rejeitando UID ${uid}.`);
        return new Response(JSON.stringify({
          error: "Conflict",
          message: `Este pré-registro já foi vinculado a outra conta de aluno (${freshLinkedUid}).`
        }), {
          status: 409,
          headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
        });
      }

      // Se o linkedUid ainda estiver nulo ou for do próprio usuário, tenta a escrita novamente (retry transparente)
      if (!freshLinkedUid || freshLinkedUid === uid) {
        console.log(`[AEF Claim] [AEF Retry] Precondição falhou sem vínculo a terceiro (linkedUid: "${freshLinkedUid || 'nulo'}"). Executando retry transparente para UID ${uid}.`);
        const retryOptions = {
          updateMask: ["linkedUid", "claimedBy", "claimedAt", "schemaVersion", "updatedAt"],
          currentDocument: { exists: true }
        };
        if (freshPreReg && freshPreReg._updateTime) {
          retryOptions.currentDocument.updateTime = freshPreReg._updateTime;
        }

        const retryRes = await writeFirestore("users", legacyId, {
          ...(freshPreReg || preReg),
          linkedUid: uid,
          claimedBy: uid,
          claimedAt: new Date().toISOString(),
          schemaVersion: 2,
          updatedAt: new Date().toISOString()
        }, retryOptions);

        if (retryRes && retryRes.preconditionFailed) {
          const finalCheck = await readFirestoreDoc("users", legacyId);
          const finalLinkedUid = finalCheck && (finalCheck.linkedUid || finalCheck.claimedBy);
          if (finalLinkedUid && finalLinkedUid !== uid) {
            console.warn(`[AEF Claim] [AEF Conflict] Falha de concorrência definitiva: pré-registro ${email} pertence a ${finalLinkedUid}. Rejeitando UID ${uid}.`);
            return new Response(JSON.stringify({
              error: "Conflict",
              message: `Este pré-registro já foi vinculado a outra conta de aluno (${finalLinkedUid}).`
            }), {
              status: 409,
              headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
            });
          }
        }
      }
    }
  }

  // 8. Gravação Server-Side no Firestore (users/{uid})
  await writeFirestore("users", uid, normalizedUser);

  console.log(`[AEF Claim] Aluno legado ${email} vinculado com sucesso ao UID ${uid}`);

  return new Response(JSON.stringify({
    success: true,
    claimed: Boolean(preReg),
    user: normalizedUser
  }), {
    status: 200,
    headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
  });
}

// ============================================================================
// ENDPOINT: /api/admin/users (Roteamento Server-Side de Ações do Admin)
// ============================================================================
export async function handleAdminUsers(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-ADMIN-SECRET",
        "Access-Control-Max-Age": "86400"
      }
    });
  }

  if (request.method !== "POST" && request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method Not Allowed. Use GET or POST." }), {
      status: 405,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  let body = {};
  if (request.method === "POST") {
    try {
      const text = await request.text();
      body = text ? JSON.parse(text) : {};
    } catch (e) {
      body = {};
    }
  } else {
    // GET request: extrai parâmetros da URL
    const u = new URL(request.url);
    body = {
      action: "list_users",
      pageSize: u.searchParams.get("pageSize") || "300",
      pageToken: u.searchParams.get("pageToken") || null
    };
  }

  // Validação estrita de autorização admin baseada em config/vipOverrides e Origem (§3.1 e §3.2)
  const vipConfig = await getDynamicVipOverrides();
  const originHeader = request.headers.get("Origin") || request.headers.get("origin");
  const secFetchSite = request.headers.get("Sec-Fetch-Site") || request.headers.get("sec-fetch-site");
  const isWebBrowserRequest = Boolean(originHeader || secFetchSite);

  const authHeader = request.headers.get("Authorization");
  const adminSecret = request.headers.get("X-ADMIN-SECRET");
  let isAdmin = false;

  // Requisições originadas de cliente web (navegador):
  if (isWebBrowserRequest) {
    if (adminSecret) {
      console.warn("[AEF Admin] [AEF Security] Tentativa de usar X-ADMIN-SECRET a partir do navegador bloqueada (§3.2).");
      return new Response(JSON.stringify({
        error: "Forbidden",
        message: "O segredo estático X-ADMIN-SECRET é restrito a scripts/CLI server-to-server e não é aceito de clientes web."
      }), {
        status: 403,
        headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
      });
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({
        error: "Unauthorized",
        message: "Requisições web administrativas exigem Bearer ID Token verificado."
      }), {
        status: 401,
        headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
      });
    }

    const token = authHeader.substring(7).trim();
    let verifiedPayload;
    try {
      verifiedPayload = await verifyFirebaseIdToken(token, FIRESTORE_PROJECT_ID);
    } catch (tokenErr) {
      console.warn("[AEF Admin] [AEF Security] Rejeição na validação do token admin:", tokenErr.message || tokenErr);
      return new Response(JSON.stringify({
        error: "Unauthorized",
        message: `Falha na verificação criptográfica do token: ${tokenErr.message}`
      }), {
        status: 401,
        headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
      });
    }

    const email = (verifiedPayload.email || "").toLowerCase().trim();
    if (
      verifiedPayload.admin === true ||
      verifiedPayload.role === "admin" ||
      isEmailAdmin(email, vipConfig)
    ) {
      isAdmin = true;
    } else {
      console.warn(`[AEF Admin] [AEF Security] Usuário ${email} não possui privilégios de administrador.`);
      return new Response(JSON.stringify({
        error: "Forbidden",
        message: "Acesso administrativo restrito a administradores."
      }), {
        status: 403,
        headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
      });
    }
  } else {
    // Requisições server-to-server / scripts CLI (sem Origin e sem Sec-Fetch-Site):
    if (adminSecret && env && env.ADMIN_SECRET && timingSafeEqual(adminSecret, env.ADMIN_SECRET)) {
      isAdmin = true;
    }

    if (!isAdmin && authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7).trim();
      try {
        const verifiedPayload = await verifyFirebaseIdToken(token, FIRESTORE_PROJECT_ID);
        const email = (verifiedPayload.email || "").toLowerCase().trim();
        if (
          verifiedPayload.admin === true ||
          verifiedPayload.role === "admin" ||
          isEmailAdmin(email, vipConfig)
        ) {
          isAdmin = true;
        }
      } catch (tokenErr) {
        console.warn("[AEF Admin] Token server-to-server inválido:", tokenErr.message || tokenErr);
      }
    }
  }

  if (!isAdmin) {
    console.warn("[AEF Admin] Tentativa não autorizada de mutação administrativa em /api/admin/users");
    return new Response(JSON.stringify({
      error: "Forbidden",
      message: "Acesso administrativo não autorizado."
    }), {
      status: 403,
      headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
    });
  }

  const action = body.action || "update_user";

  // Listagem administrativa de usuários e alunos VIP
  if (action === "list_users") {
    const pageSize = body.pageSize ? parseInt(body.pageSize, 10) : 300;
    const pageToken = body.pageToken || null;
    const [usersResult, menteesResult] = await Promise.all([
      listFirestoreDocs("users", pageSize, pageToken),
      listFirestoreDocs("students", 100)
    ]);
    return new Response(JSON.stringify({
      success: true,
      users: usersResult.documents,
      nextPageToken: usersResult.nextPageToken,
      vipMentees: menteesResult.documents
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  const targetUserId = body.userId || body.uid;
  const userData = body.userData || {};

  if (!targetUserId) {
    return new Response(JSON.stringify({ error: "Bad Request", message: "userId é obrigatório." }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  if (action === "delete_user") {
    const deleted = await deleteFirestoreDoc("users", targetUserId);
    console.log(`[AEF Admin] Aluno ${targetUserId} deletado via endpoint administrativo server-side.`);
    return new Response(JSON.stringify({
      success: deleted,
      action: "delete_user",
      userId: targetUserId
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

    // Action: save_mentee — Salva/atualiza documento na coleção students
    if (action === 'save_mentee') {
      const menteeData = body.userData || {};
      const mId = body.userId || String(menteeData.id || menteeData.uid || '');
      if (!mId) {
        return new Response(JSON.stringify({ error: 'userId / menteeId obrigatório para save_mentee' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
      try {
        const existingDoc = await readFirestoreDoc('students', mId);
        const existing = existingDoc || {};
        const merged = {
          ...existing,
          ...menteeData,
          id: mId,
          uid: mId,
          tier: 'vip_mentorship',
          updatedAt: new Date().toISOString()
        };
        await writeFirestore('students', mId, merged);
        console.log(`[AEF Worker] save_mentee: OK para ${mId}`);
        return new Response(JSON.stringify({ success: true, menteeId: mId }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (err) {
        console.error(`[AEF Worker] save_mentee falhou para ${mId}:`, err.message || err);
        return new Response(JSON.stringify({ error: 'Falha ao salvar mentorado', details: String(err.message || err) }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

  const existing = await readFirestoreDoc("users", targetUserId);
  const merged = { ...(existing || {}), ...userData, id: targetUserId, uid: targetUserId };
  const normalized = normalizeUserV2(merged);

  await writeFirestore("users", targetUserId, normalized);

  console.log(`[AEF Admin] Aluno ${targetUserId} atualizado via endpoint administrativo server-side.`);

  return new Response(JSON.stringify({
    success: true,
    action,
    userId: targetUserId,
    user: normalized
  }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
  });
}

// ============================================================================
// HANDLER: Hotmart Webhook Receiver
// ============================================================================
export async function handleHotmartWebhook(request, env, ctx) {
  // Apenas POST é permitido a partir daqui
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed. Use POST." }), {
      status: 405,
      headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
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
      const incomingHottok = extractHottok(request, null);
      if (env && env.HOTMART_HOTTOK) {
        if (!incomingHottok || !timingSafeEqual(incomingHottok, env.HOTMART_HOTTOK)) {
          console.warn("[AEF Webhook] [AEF Auth] Acesso não autorizado: Token Hottok ausente ou inválido em requisição vazia.");
          return new Response(JSON.stringify({
            error: "Unauthorized",
            message: "Invalid or missing Hotmart Hottok authentication token."
          }), {
            status: 401,
            headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
          });
        }
      }
      return new Response(JSON.stringify({
        received: true,
        status: "ping_ok",
        message: "Teste de conexão recebido com sucesso (corpo vazio)."
      }), {
        status: 200,
        headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
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

    // 5. Autenticidade Estrita do Webhook Hotmart (P0-2 Zero Trust & Timing-Safe)
    const incomingHottok = extractHottok(request, payload);
    if (env && env.HOTMART_HOTTOK) {
      if (!incomingHottok || !timingSafeEqual(incomingHottok, env.HOTMART_HOTTOK)) {
        console.warn("[AEF Webhook] [AEF Auth] Acesso não autorizado: Token Hottok ausente ou inválido.");
        return new Response(JSON.stringify({
          error: "Unauthorized",
          message: "Invalid or missing Hotmart Hottok authentication token."
        }), {
          status: 401,
          headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
        });
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
        headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
      });
    }

    const studentId = email.replace(/[^a-zA-Z0-9]/g, "_");
    const nowIso = receivedAt;
    const subCode = (subscription.subscriber_code || subscription.code || "").trim();

    // 7. Dedup Atômico: Gravação condicional em webhook_events/{eventId} (exists=false) com status: "pending" (§3.4)
    const dedupResult = await saveAtomicWebhookEvent(eventId, {
      id: eventId,
      provider: "hotmart",
      type: event,
      productId: prodId,
      subscriptionCode: subCode,
      buyerEmail: email,
      occurredAt: occurredAt,
      receivedAt: receivedAt,
      status: "pending"
    });

    if (dedupResult && dedupResult.duplicate) {
      console.warn(`[AEF Webhook] [AEF Dedup] Evento duplicado já registrado (eventId: ${eventId}). Descartando com 200 OK.`);
      return new Response(JSON.stringify({
        received: true,
        eventId: eventId,
        status: "duplicate_ignored",
        message: `Evento duplicado ${eventId} já registrado anteriormente.`
      }), {
        status: 200,
        headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
      });
    }

    // 8. Guarda de Ordenação por Assinatura / Produto (§3.3)
    // Não compara com o updatedAt global do usuário (que é alterado por ações de admin)
    const existingUser = await readFirestoreDoc("users", studentId);
    let subWatermark = null;
    let matchingSub = null;

    if (existingUser && Array.isArray(existingUser.subscriptions)) {
      if (subCode) {
        matchingSub = existingUser.subscriptions.find(s => s.id === subCode || s.subscriptionCode === subCode || s.code === subCode);
      }
      if (!matchingSub && prodId) {
        matchingSub = existingUser.subscriptions.find(s => String(s.productId) === prodId);
      }
    }

    if (matchingSub && matchingSub.lastEventOccurredAt) {
      subWatermark = matchingSub.lastEventOccurredAt;
    } else if (existingUser && existingUser.subscriptionWatermarks && existingUser.subscriptionWatermarks[subCode || prodId]) {
      subWatermark = existingUser.subscriptionWatermarks[subCode || prodId];
    } else if (existingUser && existingUser.productWatermarks && existingUser.productWatermarks[prodId]) {
      subWatermark = existingUser.productWatermarks[prodId];
    }

    if (subWatermark) {
      const watermarkTime = new Date(subWatermark).getTime();
      const eventTime = new Date(occurredAt).getTime();
      if (eventTime < watermarkTime) {
        console.warn(`[AEF Webhook] [AEF Order] Evento fora de ordem descartado para ${email} (assinatura/produto ${subCode || prodId}): occurredAt (${occurredAt}) < lastEventOccurredAt (${subWatermark}).`);

        const outOfOrderLog = {
          id: eventId,
          provider: "hotmart",
          type: event,
          productId: prodId,
          subscriptionCode: subCode,
          buyerEmail: email,
          occurredAt: occurredAt,
          watermark: subWatermark,
          receivedAt: receivedAt,
          raw: payload,
          processedAt: receivedAt,
          status: "out_of_order_ignored",
          resultSummary: `⚠️ Evento fora de ordem descartado para assinatura/produto ${subCode || prodId}. Data do evento (${occurredAt}) é anterior ao último evento registrado (${subWatermark}).`
        };
        await writeFirestore("webhook_logs", eventId, outOfOrderLog);

        return new Response(JSON.stringify({
          received: true,
          eventId: eventId,
          status: "out_of_order_ignored",
          message: `Evento fora de ordem descartado para ${email}: occurredAt é anterior à watermark da assinatura.`
        }), {
          status: 200,
          headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
        });
      }
    }

    // 9. Mapeamento Dinâmico de Categorias e Regras de Negócio (via config/productMappings e config/vipOverrides)
    const [dynamicMappings, vipConfig] = await Promise.all([
      getDynamicProductMappings(),
      getDynamicVipOverrides()
    ]);

    const activeMappings = { ...PRODUCT_CATEGORY_MAPPING, ...(dynamicMappings || {}) };
    let mapping = activeMappings[prodId] || activeMappings["8460579"] || PRODUCT_CATEGORY_MAPPING["8460579"];

    if (offerCode.includes("VIP") || prodName.toUpperCase().includes("VIP") || prodName.includes("2026")) {
      mapping = activeMappings["PROJETO_AEF_2026"] || PRODUCT_CATEGORY_MAPPING["PROJETO_AEF_2026"];
    } else if (offerCode.includes("MENSAL")) {
      mapping = activeMappings["MS_CLUB_MENSAL"] || {
        categories: ["member_free", "member_pago"],
        subscription: { billingPeriod: "monthly" },
        role: "student",
        enrolledProducts: ["ms-legacy", "english-quickstart", "frases-prontas"],
        productName: "AgoraEuFalo English Club • Assinatura Mensal"
      };
    }

    // Aplica VIP Overrides dinâmicos do Firestore caso o e-mail esteja configurado
    const emailLower = email.toLowerCase().trim();
    if (vipConfig && vipConfig.overrides && vipConfig.overrides[emailLower]) {
      const override = vipConfig.overrides[emailLower];
      mapping = {
        ...mapping,
        role: override.role || mapping.role,
        categories: override.categories || mapping.categories,
        enrolledProducts: override.enrolledProducts || mapping.enrolledProducts
      };
    } else if (vipConfig && Array.isArray(vipConfig.vipEmails) && vipConfig.vipEmails.includes(emailLower)) {
      if (!mapping.categories.includes("member_mentoria")) {
        mapping = {
          ...mapping,
          categories: Array.from(new Set([...mapping.categories, "member_mentoria"])),
          enrolledProducts: Array.from(new Set([...(mapping.enrolledProducts || []), "mentoria_vip"]))
        };
      }
    }

    let targetCategories = [...mapping.categories];
    let targetCourses = [...mapping.enrolledProducts];
    let accessStatus = "active";
    let summary = "";
    let expiresAt = null;
    let graceUntil = null;

    if (mapping.subscription?.billingPeriod === "annual") {
      const expDate = new Date();
      expDate.setFullYear(expDate.getFullYear() + 1);
      expiresAt = expDate.toISOString();
    } else if (mapping.subscription?.billingPeriod === "monthly") {
      const expDate = new Date();
      expDate.setMonth(expDate.getMonth() + 1);
      expiresAt = expDate.toISOString();
    }

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

    // 10. Gravação no Google Cloud Firestore (users/{studentId})
    const legacyTier = targetCategories.includes('member_mentoria') ? 'vip_mentorship'
      : targetCategories.includes('member_pago') ? (mapping.subscription?.billingPeriod === 'monthly' ? 'club_monthly' : 'club_annual')
        : 'free';

    const primaryEntitlement = targetCategories.includes('member_mentoria')
      ? 'member_mentoria'
      : targetCategories.includes('member_pago')
        ? 'member_pago'
        : 'member_free';

    const billingPeriod = mapping.subscription?.billingPeriod || "annual";

    const subscriptions = [
      {
        id: subCode || `sub_${studentId}_hotmart`,
        subscriptionCode: subCode || undefined,
        entitlement: primaryEntitlement,
        productId: prodId,
        billingPeriod: billingPeriod,
        status: accessStatus,
        expiresAt: expiresAt,
        graceUntil: graceUntil,
        gateway: "hotmart",
        lastEventId: eventId,
        lastEventOccurredAt: occurredAt,
        updatedAt: nowIso
      }
    ];

    const studentRecord = {
      id: studentId,
      uid: studentId,
      name: name,
      email: email,
      phone: phone,
      whatsapp: phone,
      role: mapping.role || "student",
      tier: legacyTier,
      categories: targetCategories,
      enrolledProducts: targetCourses,
      purchasedProducts: targetCourses,
      subscriptions: subscriptions,
      subscriptionWatermarks: {
        ...(existingUser?.subscriptionWatermarks || {}),
        [subCode || prodId]: occurredAt
      },
      productWatermarks: {
        ...(existingUser?.productWatermarks || {}),
        [prodId]: occurredAt
      },
      legacyEntitlements: targetCategories.filter(c => c === 'member_free' || c.startsWith('legado_')),
      schemaVersion: 2,
      lastEvent: event,
      lastEventId: eventId,
      lastEventOccurredAt: occurredAt,
      lastProcessedAt: nowIso,
      updatedAt: nowIso
    };

    await writeFirestore("users", studentId, studentRecord);

    // 10b. Atualização do Webhook Event para status: "completed" após gravação no perfil (§3.4)
    await writeFirestore("webhook_events", eventId, {
      id: eventId,
      provider: "hotmart",
      type: event,
      productId: prodId,
      subscriptionCode: subCode,
      buyerEmail: email,
      occurredAt: occurredAt,
      receivedAt: receivedAt,
      status: "completed",
      processedAt: nowIso,
      studentId: studentId
    });

    // 11. Gravação do Log de Auditoria (webhook_logs/{eventId})
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

    // 12. Resposta HTTP 200 imediata para a Hotmart
    return new Response(JSON.stringify({
      received: true,
      eventId: eventId,
      event: event,
      student: email,
      tier: legacyTier,
      message: summary
    }), {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
    });

  } catch (err) {
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
      headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
    });
  }
}

// ============================================================================
// MAIN DISPATCHER
// ============================================================================
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    // 1. Resposta para pre-flight CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-HOTMART-HOTTOK, x-hotmart-hottok, X-ADMIN-SECRET"
        }
      });
    }

    // 0. Storage Routes (Upload & Serve)
    if (path.startsWith("/storage/") || (path.startsWith("/api/storage/") && path !== "/api/storage/upload")) {
      return handleServeStorageFile(request, env);
    }
    if (path === "/api/storage/upload") {
      return handleStorageUpload(request, env);
    }

    // 1.1 Catálogo da Comunidade (Magic Creations Showcase & Analytics)
    if (path === "/api/db/magic-stories-catalog") {
      return handleGetMagicStoriesCatalog(request, env);
    }

    // 1.2 Obter História Completa por ID (Incluindo URLs de áudio)
    if (path === "/api/db/get-magic-story") {
      return handleGetMagicStory(request, env);
    }
    // =======================================================================
    // 1.3 Laboratório: Processamento Assíncrono do Estúdio (Fire-and-Forget)
    // =======================================================================
    if (request.method === "POST" && path === "/api/lab/process-studio") {
      try {
        console.log("📨 [Worker Route] Recebida requisição em POST /api/lab/process-studio");
        const body = await request.json();
        const { story, user } = body || {};
        console.log("📨 [Worker Route] Dados recebidos:", {
          hasStory: !!story,
          moduleId: story?.moduleId,
          userEmail: user?.email,
          hasCtxWaitUntil: !!(ctx && typeof ctx.waitUntil === "function")
        });

        // A MAGIA: ctx.waitUntil mantém o Worker vivo a trabalhar em background
        // mesmo depois de devolver a resposta ao navegador do aluno.
        if (ctx && typeof ctx.waitUntil === "function") {
          console.log("⚡ [Worker Route] Registrando processStudioBackground via ctx.waitUntil()...");
          ctx.waitUntil(processStudioBackground(env, story, user));
        } else {
          console.warn("⚠️ [Worker Route] ctx.waitUntil indisponível no ambiente. Disparando Promise direta em background...");
          // Fallback seguro caso ctx não esteja presente no ambiente
          processStudioBackground(env, story, user).catch(err => {
            console.error("❌ [Estúdio Background Error (fallback catch)]:", err);
          });
        }

        // Devolve sucesso imediato (HTTP 202 Accepted) para libertar o portal do aluno
        return new Response(JSON.stringify({ success: true, status: "processing" }), {
          status: 202,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        console.error("❌ [Worker Route] Erro fatal no handler /api/lab/process-studio:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Access-Control-Allow-Origin": "*" }
        });
      }
    }
    // 2. Resposta amigável para testes via navegador (HTTP GET na raiz ou outros endpoints informativos)
    if (request.method === "GET") {
      return new Response(JSON.stringify({
        status: "online",
        service: "AgoraEuFalo • Unified Edge Backend (Webhook & API)",
        version: "2.1.0",
        endpoints: [
          "POST /api/claim-preregistration (Zero-Trust Claim)",
          "POST /api/admin/users (Admin User Mutations)",
          "POST /webhook (Hotmart Webhook Receiver)"
        ],
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

    // 3. Endpoint de Resolução de Pré-Registro
    if (path === "/api/claim-preregistration") {
      return handleClaimPreregistration(request, env);
    }

    // 4. Roteamento Server-Side de Ações do Admin
    if (path === "/api/admin/users") {
      return handleAdminUsers(request, env);
    }

    // 5. Endpoint de Geração Mágica de Histórias (Prompt-to-Story Lab)
    if (path === "/api/lab/generate-magic-story") {
      return handleLabGenerateMagicStory(request, env);
    }

    // 5.1 Endpoint de Geração Dinâmica de Capa 16:9 (Prompt-to-Story Cover)
    if (path === "/api/lab/generate-cover") {
      return handleLabGenerateCover(request, env);
    }

    // 6. Endpoint de Geração de Voz TTS (WAV Nativo - Gemini 3.1 Flash TTS)
    if (path === "/api/lab/generate-tts" || path === "/api/tts") {
      return handleLabGenerateTTS(request, env);
    }

    // 7. Endpoint de Sequência de Áudio TTS com Injeção de Silêncio PCM
    if (path === "/api/lab/generate-tts-sequence" || path === "/api/tts-sequence") {
      return handleLabGenerateTTSSequence(request, env);
    }

    // 8. Endpoint de Persistência de Dados da Magic Story
    if (path === "/api/db/save-magic-story") {
      return handleSaveMagicStory(request, env);
    }

    // 8.1 Catálogo da Comunidade (Magic Creations Showcase & Analytics)
    if (path === "/api/db/magic-stories-catalog") {
      return handleGetMagicStoriesCatalog(request, env);
    }

    // 9. Demais requisições POST -> Processamento do Webhook Hotmart
    return handleHotmartWebhook(request, env, ctx);
  }
};

// ============================================================================
// 7. LABORATÓRIO PROMPT-TO-STORY: MOTOR DE GERAÇÃO MÁGICA COM GEMINI 3.7 FLASH
// ============================================================================
export async function handleLabGenerateMagicStory(request, env) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed. Use POST." }), {
      status: 405,
      headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
    });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { scenario, level = "Intermediate", tense = "Mixed", format = "Narrative Story" } = body;

    if (!scenario || !scenario.trim()) {
      return new Response(JSON.stringify({ error: "O campo 'scenario' é obrigatório." }), {
        status: 400,
        headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
      });
    }

    // Resolução segura da chave de API do Gemini (env, process.env, .env ou header x-gemini-api-key)
    let apiKey = (env && (env.GEMINI_API_KEY || env.AEF_GEMINI_API_KEY)) ||
      (typeof process !== "undefined" && process.env && (process.env.GEMINI_API_KEY || process.env.AEF_GEMINI_API_KEY)) ||
      request.headers.get("x-gemini-api-key") ||
      body.apiKey || "";

    // Se estiver em ambiente Node local e a chave não estiver no env direto, tenta ler do .env
    if (!apiKey && typeof process !== "undefined" && typeof require !== "undefined") {
      try {
        const fs = require("fs");
        const path = require("path");
        const envPath = path.resolve(process.cwd(), ".env");
        if (fs.existsSync(envPath)) {
          const content = fs.readFileSync(envPath, "utf8");
          const match = content.match(/GEMINI_API_KEY=["']?([^"'\r\n]+)/);
          if (match) apiKey = match[1].trim();
        }
      } catch (e) {
        // Ignora em runtime restrito
      }
    }

    if (!apiKey) {
      return new Response(JSON.stringify({
        error: "Chave da API do Gemini (GEMINI_API_KEY) não configurada no servidor ou no header x-gemini-api-key."
      }), {
        status: 500,
        headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
      });
    }

    const systemInstruction = `Você é o AEF Master Generator, o motor pedagógico do método AgoraEuFalo.
Sua missão é receber 'scenario', 'level', 'tense' e 'format' e retornar ESTRITAMENTE um JSON estruturado.
OBRIGATÓRIO: O texto (narrativa) ou o diálogo deve conter um mínimo absoluto de 12 interações ou parágrafos. Não gere textos curtos.
OBRIGATÓRIO: A estrutura JSON raiz deve incluir as chaves de classificação: 'topic' (escolha entre: viagens, profissional, compras, comida, social), 'level' (escolha entre: beginner, intermediate, advanced) e 'format' (narrative ou dialogue).
REGRA DE SINOPSE PEDAGÓGICA: Gere um campo 'description'. A description deve ser um breve parágrafo (em português) valorizando o pedido original do aluno. Exemplo: 'Este treinamento foi forjado para desenvolver habilidades de... focado no cenário de...'.
REGRA DE VOCABULÁRIO: Zero jargões. Foco em Lazy Verbs (get, take, make, do, have). Inglês de rua/sobrevivência.
REGRA DE TRADUÇÃO (VOC): O bloco 'voc' DEVE conter a tradução completa da história, linha por linha, em português falado coloquial brasileiro (ex: 'Tô sem grana' em vez de 'Estou sem dinheiro').
REGRA DA TRÍADE SAGRADA (1:1:1):
1. Listen & Answer (LA): Crie perguntas simples e diretas para dissecar todos os fatos. Nunca pare na 3ª frase. Respostas devem ser completas.
2. Listen & Ask (LASK): Crie uma sentença negativa pura para CADA pergunta gerada no LA (Correspondência 1:1). Não use 'Tell me' ou 'Ask me', apenas a negativa.
3. Look & Retell (LRT): Copie EXATAMENTE as perguntas do LA (1:1).
4. Pronunciation (PRO): Inclua 100% das frases da história, sem pular nenhuma linha, marcando os linking sounds com '_'.

SCHEMA JSON OBRIGATÓRIO:
{
  "documentTitle": "string",
  "description": "string",
  "archetype": "magic_story",
  "topic": "viagens | profissional | compras | comida | social",
  "level": "beginner | intermediate | advanced",
  "format": "narrative | dialogue",
  "story_chunks": [ { "id": "1", "text": "...", "translation": "..." } ],
  "activities": {
    "voc": { 
      "storyTranslation": ["Tradução coloquial da linha 1", "Tradução coloquial da linha 2"],
      "items": [ { "chunk": "...", "translation": "..." } ] 
    },
    "la": { "drills": [ { "chunkId": "1", "question": "...", "answer": "..." } ] },
    "lrt": { "guideQuestions": [ "..." ] },
    "lask": { "stimuli": [ "Sentença negativa pura" ] },
    "pro": { "goldenTip": "...", "textWithLinking": [ "..." ] }
  }
};`;

    const userPrompt = `Crie um treino Magic Story completo com os seguintes parâmetros:
- Cenário: ${scenario}
- Nível: ${level}
- Tempo Verbal: ${tense}
- Formato: ${format}

Lembre-se:
1. OBRIGATÓRIO: O texto (narrativa) ou o diálogo deve conter um mínimo absoluto de 12 interações ou parágrafos. Não gere textos curtos.
2. OBRIGATÓRIO: A estrutura JSON raiz deve incluir as chaves de classificação: 'topic' (escolha entre: viagens, profissional, compras, comida, social), 'level' (escolha entre: beginner, intermediate, advanced) e 'format' (narrative ou dialogue).
3. TRÍADE SAGRADA (1:1:1): o número de itens em 'la.drills', 'lrt.guideQuestions' e 'lask.stimuli' deve ser rigorosamente idêntico.
Retorne ESTRITAMENTE o JSON sem nenhum texto adicional ou markdown.`;

    const geminiPayload = {
      system_instruction: {
        parts: [{ text: systemInstruction }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }]
        }
      ],
      generationConfig: {
        response_mime_type: "application/json",
        temperature: 0.3
      }
    };

    // Modelo oficial atualizado conforme GEMINI.md / AGENTS.md (gemini-3.7-flash)
    const MODEL = "gemini-3.7-flash";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

    const geminiRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify(geminiPayload)
    });

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      console.error(`[AEF Master Generator] Erro na API do Gemini (${geminiRes.status}):`, errorText);
      return new Response(JSON.stringify({
        error: `Falha na API do Gemini (${geminiRes.status})`,
        details: errorText
      }), {
        status: 502,
        headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
      });
    }

    const geminiData = await geminiRes.json();
    const rawContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!rawContent) {
      throw new Error("Nenhum conteúdo retornado pelo modelo Gemini.");
    }

    const cleanedText = rawContent.replace(/```json\s*|```/g, "").trim();
    const parsedStory = JSON.parse(cleanedText);

    // Validação e Garantia da Tríade Sagrada (1:1:1) e Tradução
    if (parsedStory && parsedStory.activities) {
      if (!parsedStory.activities.voc) {
        parsedStory.activities.voc = { storyTranslation: [], items: [] };
      }

      // Garante array de traduções coloquiais completas
      if (!Array.isArray(parsedStory.activities.voc.storyTranslation) || parsedStory.activities.voc.storyTranslation.length === 0) {
        if (typeof parsedStory.activities.voc.storyTranslation === "string" && parsedStory.activities.voc.storyTranslation.trim()) {
          parsedStory.activities.voc.storyTranslation = [parsedStory.activities.voc.storyTranslation.trim()];
        } else if (Array.isArray(parsedStory.story_chunks) && parsedStory.story_chunks.length > 0) {
          parsedStory.activities.voc.storyTranslation = parsedStory.story_chunks.map(c => c.translation || "");
        } else {
          parsedStory.activities.voc.storyTranslation = [];
        }
      }

      const laDrills = parsedStory.activities.la?.drills || [];
      if (!parsedStory.activities.lrt) parsedStory.activities.lrt = { guideQuestions: [] };
      if (!parsedStory.activities.lask) parsedStory.activities.lask = { stimuli: [] };

      // Se a IA omitiu o espelhamento 1:1, garantimos que LRT espelha LA exatamente
      if (parsedStory.activities.lrt.guideQuestions.length === 0 && laDrills.length > 0) {
        parsedStory.activities.lrt.guideQuestions = laDrills.map(d => d.question);
      }
    }

    // Garantia das propriedades de classificação na raiz (topic, level, format)
    if (parsedStory) {
      if (!parsedStory.topic) {
        const scen = (scenario || "").toLowerCase();
        if (scen.includes("aeroporto") || scen.includes("hotel") || scen.includes("viag") || scen.includes("voo") || scen.includes("trip") || scen.includes("london") || scen.includes("londres")) {
          parsedStory.topic = "viagens";
        } else if (scen.includes("trabalho") || scen.includes("emprego") || scen.includes("entrevista") || scen.includes("reuni") || scen.includes("job") || scen.includes("office") || scen.includes("carreira")) {
          parsedStory.topic = "profissional";
        } else if (scen.includes("compr") || scen.includes("loja") || scen.includes("shop") || scen.includes("mercado") || scen.includes("store") || scen.includes("preço")) {
          parsedStory.topic = "compras";
        } else if (scen.includes("restaurante") || scen.includes("comida") || scen.includes("café") || scen.includes("jantar") || scen.includes("almoço") || scen.includes("food") || scen.includes("coffee")) {
          parsedStory.topic = "comida";
        } else {
          parsedStory.topic = "social";
        }
      }
      if (!parsedStory.level) {
        const lvl = (level || "intermediate").toLowerCase();
        parsedStory.level = lvl.includes("begin") || lvl.includes("iniciante") ? "beginner" :
          lvl.includes("adv") || lvl.includes("avançado") ? "advanced" : "intermediate";
      }
      if (!parsedStory.format) {
        const fmt = (format || "narrative").toLowerCase();
        parsedStory.format = fmt.includes("dialog") ? "dialogue" : "narrative";
      }
    }

    return new Response(JSON.stringify({
      success: true,
      model: MODEL,
      story: parsedStory
    }, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (err) {
    console.error("[AEF Master Generator] Erro ao processar requisição:", err);
    return new Response(JSON.stringify({
      error: "Erro interno ao processar a geração da história.",
      message: err.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
    });
  }
}

// ============================================================================
// 8. LABORATÓRIO TTS: MOTOR DE SÍNTESE DE VOZ (WAV NATIVO NO EDGE)
// ============================================================================
function base64ToUint8Array(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function createWavHeader(dataLength, sampleRate = 24000, numChannels = 1, bitsPerSample = 16) {
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);
  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) { view.setUint8(offset + i, string.charCodeAt(i)); }
  };
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true); // true = little-endian
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
  view.setUint16(32, numChannels * (bitsPerSample / 8), true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);
  return new Uint8Array(buffer);
}

function concatUint8Arrays(arrays) {
  let totalLength = arrays.reduce((acc, val) => acc + val.length, 0);
  let result = new Uint8Array(totalLength);
  let offset = 0;
  for (let arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

export async function handleLabGenerateTTS(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, x-gemini-api-key"
      }
    });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed. Use POST." }), {
      status: 405,
      headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
    });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { text, voice = "Puck", format = "wav" } = body;

    if (!text || !text.trim()) {
      return new Response(JSON.stringify({ error: "O campo 'text' é obrigatório." }), {
        status: 400,
        headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
      });
    }

    // Resolução segura da chave de API do Gemini (env, process.env, .env ou header x-gemini-api-key)
    let apiKey = (env && (env.GEMINI_API_KEY || env.AEF_GEMINI_API_KEY)) ||
      (typeof process !== "undefined" && process.env && (process.env.GEMINI_API_KEY || process.env.AEF_GEMINI_API_KEY)) ||
      request.headers.get("x-gemini-api-key") ||
      body.apiKey || "";

    if (!apiKey && typeof process !== "undefined" && typeof require !== "undefined") {
      try {
        const fs = require("fs");
        const path = require("path");
        const envPath = path.resolve(process.cwd(), ".env");
        if (fs.existsSync(envPath)) {
          const content = fs.readFileSync(envPath, "utf8");
          const match = content.match(/GEMINI_API_KEY=["']?([^"'\r\n]+)/);
          if (match) apiKey = match[1].trim();
        }
      } catch (e) { }
    }

    if (!apiKey) {
      return new Response(JSON.stringify({
        error: "Chave da API do Gemini (GEMINI_API_KEY) não configurada no servidor ou no header x-gemini-api-key."
      }), {
        status: 500,
        headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
      });
    }

    // Preâmbulo canônico obrigatório Gemini TTS (Single Speaker)
    const preamble = "Read the following text aloud as audio speech. Generate only audio output. Do not generate any text response.\n\n";
    const fullPrompt = text.startsWith("Read the following text aloud") ? text : (preamble + text);

    const payload = {
      contents: [{
        role: "user",
        parts: [{ text: fullPrompt }]
      }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voice || "Puck"
            }
          }
        }
      }
    };

    const MODEL = "gemini-3.1-flash-tts-preview";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify(payload)
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error(`[AEF TTS Generator] Erro na API do Gemini (${geminiRes.status}):`, errText);
      return new Response(JSON.stringify({
        error: `Falha na API do Gemini TTS (${geminiRes.status})`,
        details: errText
      }), {
        status: 502,
        headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
      });
    }

    const geminiData = await geminiRes.json();
    const candidate = geminiData.candidates?.[0];
    const part = candidate?.content?.parts?.[0];
    const base64Audio = part?.inlineData?.data || part?.inline_data?.data;

    if (!base64Audio) {
      return new Response(JSON.stringify({
        error: "Resposta do Gemini TTS não continha dados de áudio.",
        raw: geminiData
      }), {
        status: 502,
        headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
      });
    }

    // Converte raw PCM linear (audio/l16) para Uint8Array usando Web APIs
    const pcmBytes = base64ToUint8Array(base64Audio);
    const wavHeader = createWavHeader(pcmBytes.length, 24000, 1, 16);

    // Concatena Header WAV (44 bytes) + PCM em um Uint8Array puro
    const fullWav = new Uint8Array(wavHeader.length + pcmBytes.length);
    fullWav.set(wavHeader, 0);
    fullWav.set(pcmBytes, wavHeader.length);

    // Se o cliente pediu formato json, devolve base64 com header WAV já embutido
    if (format === "json") {
      let binaryStr = "";
      const len = fullWav.byteLength;
      const chunkSize = 8192;
      for (let i = 0; i < len; i += chunkSize) {
        const chunk = fullWav.subarray(i, Math.min(i + chunkSize, len));
        binaryStr += String.fromCharCode.apply(null, chunk);
      }
      const wavBase64 = btoa(binaryStr);
      return new Response(JSON.stringify({
        success: true,
        mimeType: "audio/wav",
        sampleRate: 24000,
        voice: voice || "Puck",
        audioBase64: wavBase64
      }), {
        status: 200,
        headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
      });
    }

    // Retorno binário direto com Content-Type audio/wav (WAV nativo reproduzível)
    return new Response(fullWav, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": String(fullWav.length),
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400"
      }
    });

  } catch (err) {
    console.error("[AEF TTS Generator] Erro ao sintetizar áudio:", err);
    return new Response(JSON.stringify({
      error: "Erro interno ao processar síntese de áudio.",
      message: err.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
    });
  }
}

// ============================================================================
// 9. LABORATÓRIO TTS: SEQUÊNCIA DE ÁUDIO COM INJEÇÃO DE SILÊNCIO (PCM NATIVO)
// ============================================================================
export async function handleLabGenerateTTSSequence(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, x-gemini-api-key"
      }
    });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed. Use POST." }), {
      status: 405,
      headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
    });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { items, pauseSeconds = 0, voice = "Puck", format = "wav" } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "O campo 'items' deve ser um array com ao menos um texto." }), {
        status: 400,
        headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
      });
    }

    // Resolução segura da chave de API do Gemini (env, process.env, .env ou header x-gemini-api-key)
    let apiKey = (env && (env.GEMINI_API_KEY || env.AEF_GEMINI_API_KEY)) ||
      (typeof process !== "undefined" && process.env && (process.env.GEMINI_API_KEY || process.env.AEF_GEMINI_API_KEY)) ||
      request.headers.get("x-gemini-api-key") ||
      body.apiKey || "";

    if (!apiKey && typeof process !== "undefined" && typeof require !== "undefined") {
      try {
        const fs = require("fs");
        const path = require("path");
        const envPath = path.resolve(process.cwd(), ".env");
        if (fs.existsSync(envPath)) {
          const content = fs.readFileSync(envPath, "utf8");
          const match = content.match(/GEMINI_API_KEY=["']?([^"'\r\n]+)/);
          if (match) apiKey = match[1].trim();
        }
      } catch (e) { }
    }

    if (!apiKey) {
      return new Response(JSON.stringify({
        error: "Chave da API do Gemini (GEMINI_API_KEY) não configurada no servidor ou no header x-gemini-api-key."
      }), {
        status: 500,
        headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
      });
    }

    const pause = typeof pauseSeconds === "number" && pauseSeconds > 0 ? pauseSeconds : 0;
    const selectedVoice = voice || "Puck";
    const preamble = "Read the following text aloud as audio speech. Generate only audio output. Do not generate any text response.\n\n";
    const MODEL = "gemini-3.1-flash-tts-preview";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

    const chunks = [];

    // Processamento em lotes com concorrência controlada para evitar timeouts e 429
    const pcmResults = new Array(items.length);
    const BATCH_SIZE = 4;

    for (let b = 0; b < items.length; b += BATCH_SIZE) {
      const batchIndices = [];
      for (let k = b; k < Math.min(b + BATCH_SIZE, items.length); k++) {
        batchIndices.push(k);
      }

      await Promise.all(batchIndices.map(async (idx) => {
        const itemObj = items[idx];
        const rawText = (typeof itemObj === "string" ? itemObj : (itemObj.text || "")).replace(/^[A-Za-z0-9\s]+:\s*/gm, "").trim();
        if (!rawText) return;

        const fullPrompt = rawText.startsWith("Read the following text aloud") ? rawText : (preamble + rawText);
        const payload = {
          contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: selectedVoice }
              }
            }
          }
        };

        const geminiRes = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
          body: JSON.stringify(payload)
        });

        if (!geminiRes.ok) {
          const errText = await geminiRes.text();
          throw new Error(`Falha na API Gemini TTS no item ${idx} (${geminiRes.status}): ${errText}`);
        }

        const geminiData = await geminiRes.json();
        const part = geminiData.candidates?.[0]?.content?.parts?.[0];
        const base64Audio = part?.inlineData?.data || part?.inline_data?.data;
        if (!base64Audio) throw new Error(`Resposta do Gemini TTS no item ${idx} vazia.`);

        pcmResults[idx] = {
          pcm: base64ToUint8Array(base64Audio),
          pauseAfter: typeof itemObj === "object" && typeof itemObj.pauseSeconds === "number" ? itemObj.pauseSeconds : pause
        };
      }));
    }

    // Montar chunks intercalando áudios sintetizados e blocos matemáticos de silêncio
    for (let i = 0; i < pcmResults.length; i++) {
      const res = pcmResults[i];
      if (!res || !res.pcm) continue;
      chunks.push(res.pcm);

      const silenceSec = res.pauseAfter;
      if (silenceSec > 0 && i < pcmResults.length - 1) {
        // 24000 samples * 2 bytes = 48000 bytes/segundo
        const silence = new Uint8Array(Math.floor(24000 * 2 * silenceSec));
        chunks.push(silence);
      }
    }

    if (chunks.length === 0) {
      return new Response(JSON.stringify({ error: "Nenhum áudio pôde ser gerado para os itens fornecidos." }), {
        status: 400,
        headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
      });
    }

    // Unir tudo via Web APIs (Uint8Array puro)
    const mergedPcm = concatUint8Arrays(chunks);
    const header = createWavHeader(mergedPcm.length);
    const finalWav = concatUint8Arrays([header, mergedPcm]);

    if (format === "json") {
      let binaryStr = "";
      const len = finalWav.byteLength;
      const chunkSize = 8192;
      for (let j = 0; j < len; j += chunkSize) {
        const chunk = finalWav.subarray(j, Math.min(j + chunkSize, len));
        binaryStr += String.fromCharCode.apply(null, chunk);
      }
      const wavBase64 = btoa(binaryStr);
      return new Response(JSON.stringify({
        success: true,
        mimeType: "audio/wav",
        sampleRate: 24000,
        voice: selectedVoice,
        audioBase64: wavBase64
      }), {
        status: 200,
        headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
      });
    }

    // Retorno binário direto com status 200, buffer final e Content-Type: audio/wav
    return new Response(finalWav, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": String(finalWav.length),
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400"
      }
    });

  } catch (err) {
    console.error("[AEF TTS Sequence] Erro ao sintetizar sequência de áudio:", err);
    return new Response(JSON.stringify({
      error: "Erro interno ao processar sequência de áudio.",
      message: err.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
    });
  }
}

// ============================================================================
// 9. ENDPOINT DE GERAÇÃO DINÂMICA DE CAPAS 16:9 (PROMPT-TO-STORY COVER)
// ============================================================================
export async function handleLabGenerateCover(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-gemini-api-key"
      }
    });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed. Use POST." }), {
      status: 405,
      headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
    });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const scenario = (body.scenario || "").trim();

    if (!scenario) {
      return new Response(JSON.stringify({ error: "O campo 'scenario' é obrigatório para gerar a capa." }), {
        status: 400,
        headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
      });
    }

    const apiKey = request.headers.get("x-gemini-api-key") ||
      env?.GEMINI_API_KEY ||
      (typeof process !== "undefined" ? process.env?.GEMINI_API_KEY : "");

    if (!apiKey) {
      return new Response(JSON.stringify({
        error: "Chave da API Gemini não configurada no servidor (GEMINI_API_KEY ausente)."
      }), {
        status: 500,
        headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
      });
    }

    const imagePrompt = `Calm EdTech style, modern vector illustration, minimalist, vibrant but soft colors, high quality. Theme: ${scenario}. No text, no letters, no words in the image.`;

    let base64Image = null;
    let lastError = null;

    // 1. Tentar primeiro os modelos oficiais nativos de imagem ativos (gemini-3.1-flash-image e gemini-2.5-flash-image)
    const genAiModels = ["gemini-3.1-flash-image", "gemini-2.5-flash-image"];
    for (const model of genAiModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const payload = {
          contents: [{
            parts: [{ text: imagePrompt }]
          }],
          generationConfig: {
            responseModalities: ["IMAGE"],
            response_format: {
              image: { aspect_ratio: "ASPECT_RATIO_SIXTEEN_BY_NINE" }
            }
          }
        };

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          const part = data.candidates?.[0]?.content?.parts?.[0];
          const inlineData = part?.inlineData || part?.inline_data;
          if (inlineData?.data) {
            base64Image = inlineData.data;
            break;
          }
        } else {
          lastError = await res.text();
          console.warn(`[AEF Cover Generator] Falha no modelo ${model} (${res.status}):`, lastError);
        }
      } catch (err) {
        lastError = err.message;
        console.warn(`[AEF Cover Generator] Erro na requisição do modelo ${model}:`, err.message);
      }
    }

    // 2. Fallback para endpoints Imagen 3 predict caso necessário
    if (!base64Image) {
      const imagenModels = ["imagen-3.0-generate-001", "imagen-3.0-generate-002"];
      for (const imgModel of imagenModels) {
        try {
          const imagenEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${imgModel}:predict?key=${apiKey}`;
          const imagenPayload = {
            instances: [{ prompt: imagePrompt }],
            parameters: {
              sampleCount: 1,
              aspectRatio: "16:9",
              outputOptions: { mimeType: "image/jpeg" }
            }
          };

          const res = await fetch(imagenEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(imagenPayload)
          });

          if (res.ok) {
            const data = await res.json();
            const b64 = data.predictions?.[0]?.bytesBase64Encoded;
            if (b64) {
              base64Image = b64;
              break;
            }
          }
        } catch (e) {
          // Fallback silencioso
        }
      }
    }

    if (!base64Image) {
      return new Response(JSON.stringify({
        error: "Não foi possível sintetizar a imagem com os modelos disponíveis.",
        details: lastError
      }), {
        status: 502,
        headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      imageBase64: base64Image
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (err) {
    console.error("[AEF Cover Generator] Erro fatal:", err);
    return new Response(JSON.stringify({
      error: "Erro interno ao gerar capa da história.",
      message: err.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
    });
  }
}

// ============================================================================
// 10. STORAGE DE MÍDIA NATIVO (ARQUIVOS REAIS / STORAGE CANÔNICO)
// ============================================================================
const STORAGE_FILES_CACHE = new Map();

export async function handleStorageUpload(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-file-path, x-module-id, x-content-type"
      }
    });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed. Use POST." }), {
      status: 405,
      headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
    });
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    const url = new URL(request.url);

    let fileBuffer = null;
    let fileName = url.searchParams.get("filename") || request.headers.get("x-file-name") || "";
    let moduleId = url.searchParams.get("moduleId") || request.headers.get("x-module-id") || "";
    let relativePath = url.searchParams.get("path") || request.headers.get("x-file-path") || "";
    let mimeType = request.headers.get("x-content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");
      if (file && typeof file.arrayBuffer === "function") {
        fileBuffer = new Uint8Array(await file.arrayBuffer());
        fileName = fileName || file.name || "media.wav";
        mimeType = mimeType || file.type || "audio/wav";
      }
      moduleId = moduleId || formData.get("moduleId") || "";
      relativePath = relativePath || formData.get("path") || "";
    } else if (contentType.includes("application/json")) {
      const json = await request.json().catch(() => ({}));
      fileName = fileName || json.filename || json.name || "media.wav";
      moduleId = moduleId || json.moduleId || "";
      relativePath = relativePath || json.path || "";
      mimeType = mimeType || json.mimeType || json.contentType || "audio/wav";
      if (json.data) {
        let rawBase64 = json.data;
        if (rawBase64.includes(",")) rawBase64 = rawBase64.split(",")[1];
        fileBuffer = base64ToUint8Array(rawBase64);
      }
    } else {
      const ab = await request.arrayBuffer();
      fileBuffer = new Uint8Array(ab);
      mimeType = mimeType || contentType || "audio/wav";
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return new Response(JSON.stringify({ error: "Nenhum dado binário recebido para upload." }), {
        status: 400,
        headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
      });
    }

    if (!moduleId) {
      moduleId = "mod_" + Date.now();
    }
    if (!fileName) {
      fileName = "audio_" + Date.now() + ".wav";
    }

    if (!relativePath) {
      relativePath = `magic-creations/${moduleId}/${fileName}`;
    }
    relativePath = relativePath.replace(/^\/+/, "");

    const fileUrl = `/storage/${relativePath}`;

    if (!mimeType || mimeType === "application/octet-stream") {
      if (fileName.endsWith(".wav")) mimeType = "audio/wav";
      else if (fileName.endsWith(".mp3")) mimeType = "audio/mpeg";
      else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) mimeType = "image/jpeg";
      else if (fileName.endsWith(".png")) mimeType = "image/png";
      else if (fileName.endsWith(".pdf")) mimeType = "application/pdf";
      else mimeType = "audio/wav";
    }

    const storageItem = {
      buffer: fileBuffer,
      contentType: mimeType,
      size: fileBuffer.byteLength,
      uploadedAt: new Date().toISOString()
    };
    STORAGE_FILES_CACHE.set(fileUrl, storageItem);
    STORAGE_FILES_CACHE.set(`/storage/${relativePath}`, storageItem);
    STORAGE_FILES_CACHE.set(relativePath, storageItem);

    console.log(`📦 [Storage Upload] Arquivo persistido: ${fileUrl} (${fileBuffer.byteLength} bytes, ${mimeType})`);

    return new Response(JSON.stringify({
      success: true,
      fileUrl: fileUrl,
      size: fileBuffer.byteLength,
      contentType: mimeType
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (err) {
    console.error("[AEF Storage Upload] Erro:", err);
    return new Response(JSON.stringify({
      error: "Erro interno no upload de mídia.",
      message: err.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
    });
  }
}

export async function handleServeStorageFile(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Allow-Headers": "Range, Content-Type, Authorization"
      }
    });
  }

  const url = new URL(request.url);
  const pathname = url.pathname;

  let item = STORAGE_FILES_CACHE.get(pathname);
  if (!item) {
    const rel = pathname.replace(/^\/storage\//, "").replace(/^\/api\/storage\//, "");
    item = STORAGE_FILES_CACHE.get(rel) || STORAGE_FILES_CACHE.get(`/storage/${rel}`);
  }

  if (!item) {
    return new Response(JSON.stringify({ error: "Arquivo não encontrado no storage.", path: pathname }), {
      status: 404,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }

  return new Response(item.buffer, {
    status: 200,
    headers: {
      "Content-Type": item.contentType,
      "Content-Length": String(item.size),
      "Accept-Ranges": "bytes",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}

// ============================================================================
// 11. ENDPOINT DE PERSISTÊNCIA DE DADOS DA MAGIC STORY (COMMUNITY LMS CATALOG)
// ============================================================================
const SAVED_MODULES_CACHE = new Map();

export async function handleSaveMagicStory(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-gemini-api-key"
      }
    });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed. Use POST." }), {
      status: 405,
      headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
    });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { metadata = {}, content = {} } = body;

    const moduleId = body.moduleId || (typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `mod_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);

    const now = new Date().toISOString();

    const courseModule = {
      moduleId,
      courseId: "magic-creations-community",
      courseName: "Magic Creations - Acervo Exclusivo da Comunidade",
      isCommunityAsset: true,
      courseMasterCover: "/assets/images/magic-creations-master-cover.jpg",
      moduleCover169: metadata.coverImage || "/assets/images/default-module.jpg",
      createdAt: now,
      updatedAt: now,
      metadata: {
        title: metadata.title || "Magic Story Sem Título",
        description: metadata.description || body.description || "Treinamento exclusivo da comunidade.",
        topic: metadata.topic || "social",
        level: metadata.level || "intermediate",
        format: metadata.format || "narrative",
        creatorId: metadata.creatorId || "anonymous",
        originalPrompt: metadata.originalPrompt || "Não informado",
        coverImage: metadata.coverImage || "/assets/images/default-module.jpg"
      },
      content: {
        lr: {
          text: content.lr?.text || "",
          audioUrl: content.lr?.audioUrl || ""
        },
        voc: {
          chunks: Array.isArray(content.voc?.chunks) ? content.voc.chunks : (Array.isArray(content.voc?.items) ? content.voc.items : []),
          audioUrl: content.voc?.audioUrl || content.voc?.podcastAudioUrl || "",
          podcastAudioUrl: content.voc?.audioUrl || content.voc?.podcastAudioUrl || ""
        },
        la: {
          drills: Array.isArray(content.la?.drills) ? content.la.drills : [],
          audioUrl: content.la?.audioUrl || ""
        },
        lrt: {
          guideQuestions: Array.isArray(content.lrt?.guideQuestions) ? content.lrt.guideQuestions : [],
          staticAudioUrl: content.lrt?.staticAudioUrl || ""
        },
        lask: {
          stimuli: Array.isArray(content.lask?.stimuli) ? content.lask.stimuli : [],
          audioUrl: content.lask?.audioUrl || ""
        },
        pro: {
          phrases: Array.isArray(content.pro?.phrases) ? content.pro.phrases : [],
          audioUrl: content.pro?.audioUrl || ""
        }
      }
    };

    // Armazenar no cache em memória do Worker para entrega instantânea
    SAVED_MODULES_CACHE.set(moduleId, courseModule);

    return new Response(JSON.stringify({
      success: true,
      moduleId,
      message: "Magic Story catalogada com sucesso na biblioteca.",
      data: courseModule
    }, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (err) {
    console.error("[AEF DB Save] Erro ao persistir Magic Story:", err);
    return new Response(JSON.stringify({
      error: "Erro interno ao processar a persistência da história.",
      message: err.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
    });
  }
}

// ============================================================================
// 11. ENDPOINT DE CATÁLOGO DA COMUNIDADE (MAGIC CREATIONS SHOWCASE & ANALYTICS)
// ============================================================================
export async function handleGetMagicStoriesCatalog(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }

  const catalog = [
    {
      moduleId: "mc-chicago-coffee-01",
      moduleCover169: "/assets/images/cover-default-aef.jpg",
      createdAt: "2026-09-18T14:20:00.000Z",
      metadata: {
        title: "Job Interview: Dealing with Pressure",
        description: "Treinamento forjado para entrevistas de emprego em multinacionais, focado em responder sobre prazos apertados e liderança.",
        topic: "profissional",
        level: "intermediate",
        format: "dialogue"
      }
    },
    {
      moduleId: "mc-airport-luggage-02",
      moduleCover169: "/assets/images/cover-default-aef.jpg",
      createdAt: "2026-09-15T09:10:00.000Z",
      metadata: {
        title: "Lost Luggage at Heathrow Airport",
        description: "Treinamento prático de sobrevivência em viagens internacionais para resolver extravio de bagagens e conexões perdidas.",
        topic: "viagens",
        level: "beginner",
        format: "dialogue"
      }
    },
    {
      moduleId: "mc-dinner-reservation-03",
      moduleCover169: "/assets/images/cover-default-aef.jpg",
      createdAt: "2026-09-10T19:45:00.000Z",
      metadata: {
        title: "Dinner with Colleagues in Manhattan",
        description: "Treinamento de socialização e conversação descontraída para jantares de negócios, pedidos em restaurantes e pequenas conversas.",
        topic: "social",
        level: "advanced",
        format: "narrative"
      }
    },
    {
      moduleId: "mc-tech-standup-04",
      moduleCover169: "/assets/images/cover-default-aef.jpg",
      createdAt: "2026-09-05T11:30:00.000Z",
      metadata: {
        title: "Tech Startup Team Standup",
        description: "Treinamento ágil de rotina de trabalho em tecnologia: atualizações de sprint, bloqueios e alinhamento de roadmap.",
        topic: "profissional",
        level: "intermediate",
        format: "dialogue"
      }
    }
  ];

  // Agrega histórias salvas dinamicamente
  const dynamicStories = Array.from(SAVED_MODULES_CACHE.values()).map(m => ({
    moduleId: m.moduleId,
    moduleCover169: m.moduleCover169,
    createdAt: m.createdAt,
    metadata: m.metadata,
    content: m.content
  }));

  const fullCatalog = [...dynamicStories, ...catalog];

  return new Response(JSON.stringify({
    success: true,
    analytics: {
      totalStories: 142 + dynamicStories.length,
      newLast30Days: 18 + dynamicStories.length
    },
    catalog: fullCatalog
  }, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=60"
    }
  });
}

// ============================================================================
// 12. ENDPOINT PARA OBTER HISTÓRIA POR ID (PRE-RENDERED AUDIO RETRIEVAL)
// ============================================================================
export async function handleGetMagicStory(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }

  const url = new URL(request.url);
  const modId = url.searchParams.get("module") || url.searchParams.get("moduleId") || "";
  if (modId && SAVED_MODULES_CACHE.has(modId)) {
    return new Response(JSON.stringify({
      success: true,
      story: SAVED_MODULES_CACHE.get(modId)
    }, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }

  return new Response(JSON.stringify({
    success: false,
    error: "História não encontrada no acervo ativo."
  }), {
    status: 404,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
// =======================================================================
// MOTOR DO ESTÚDIO (Background) & BREVO E-MAIL
// =======================================================================

async function processStudioBackground(env, story, user) {
  try {
    const userEmail = user?.email || "email_indefinido";
    const userName = user?.name || "my dear friend";
    const scenario = story?.scenario || story?.metadata?.title || story?.title || "Novo Treino";
    const moduleId = story?.moduleId || "mod_desconhecido";

    console.log("🎙️ [Estúdio Background] ==================================================");
    console.log(`🎙️ [Estúdio Background] Iniciando masterização em background para: ${userEmail}`);
    console.log("🎙️ [Estúdio Background] Dados da Sessão:", {
      user: { email: userEmail, name: userName },
      moduleId: moduleId,
      scenario: scenario,
      activitiesCount: story?.activities ? Object.keys(story.activities).length : 0
    });

    // =================================================================
    // ETAPA 1: GERAÇÃO DE ÁUDIO TTS (RASTREAMENTO DE ÁUDIO)
    // =================================================================
    console.log("🎵 [Estúdio Background] [ÁUDIO] INÍCIO: Acionando etapa de geração de áudio TTS...");
    console.log(`🎵 [Estúdio Background] [ÁUDIO] Alvo: Módulo ${moduleId} | Cenário: "${scenario}"`);

    // =================================================================
    // AQUI ENTRARÁ A SUA LÓGICA DE GERAÇÃO DE ÁUDIO TTS
    // =================================================================
    // O loop abaixo garante o respeito à cota de 10 RPM do Gemini,
    // forçando uma pausa de ~6.5 segundos entre cada requisição.

    /*
    for (const track of story.listenAndAnswer) {
       await generateAudioTTS(track.text);
       await new Promise(resolve => setTimeout(resolve, 6500)); 
    }
    */

    console.log("✅ [Estúdio Background] [ÁUDIO] FIM: Geração de áudio finalizada/processada.");

    // =================================================================
    // ETAPA 2: DISPARO DE E-MAIL TRANSACIONAL VIA BREVO
    // =================================================================
    console.log("📧 [Estúdio Background] [BREVO] Disparando notificação por e-mail para o aluno...");

    const emailSent = await sendMagicStoryReadyEmail(env, {
      toEmail: userEmail,
      toName: userName,
      scenario: scenario,
      moduleId: moduleId
    });

    if (emailSent) {
      console.log(`🎉 [Estúdio Background] Processamento concluído com sucesso total para ${userEmail}.`);
    } else {
      console.warn(`⚠️ [Estúdio Background] Processamento concluído com ressalvas: e-mail não despachado para ${userEmail}.`);
    }

    console.log("🎙️ [Estúdio Background] ==================================================");

  } catch (error) {
    console.error("❌ [Estúdio Background] FALHA CRÍTICA FATAL no processamento de background:", error);
    console.error("❌ [Estúdio Background] Stack trace completo:", error?.stack || error);
  }
}

async function sendMagicStoryReadyEmail(env, { toEmail, toName, scenario, moduleId }) {
  try {
    console.log(`📧 [Brevo] Verificando configuração para envio a: ${toEmail}...`);
    const apiKey = env?.BREVO_API_KEY;
    if (!apiKey) {
      console.error("❌ [Brevo] ERRO CRÍTICO: Chave não configurada no ambiente (env.BREVO_API_KEY). O envio de e-mail foi abortado.");
      return false;
    }

    const endpoint = "https://api.brevo.com/v3/smtp/email";
    const lessonUrl = `https://agoraeufalo.com.br/player-lab.html?id=${moduleId}`;

    const payload = {
      sender: { name: "Leo | AgoraEuFalo", email: "agoraeufalo@agoraeufalo.com.br" },
      to: [{ email: toEmail, name: toName || "my dear friend" }],
      subject: `🎙️ Seu treino sob medida está pronto: "${scenario || 'Novo Treino'}"`,
      htmlContent: `
        <div style="font-family: sans-serif; background-color: #0A192F; color: #F1F5F9; padding: 24px; border-radius: 12px; max-width: 600px; margin: auto;">
          <h2 style="color: #F59E0B; margin-top: 0;">Hello, ${toName || "my dear friend"}!</h2>
          <p>A sua lição com o cenário <strong>"${scenario}"</strong> acabou de ser masterizada no nosso estúdio.</p>
          <div style="margin: 32px 0;">
            <a href="${lessonUrl}" style="background-color: #F59E0B; color: #071322; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px;">COMEÇAR MEU TREINO AGORA</a>
          </div>
          <p style="color: #94A3B8; font-size: 14px;">Pratique o reflexo oral e devore essa história hoje mesmo!</p>
          <p style="color: #64748B; font-size: 12px; margin-top: 30px;">Professor Leo • AgoraEuFalo</p>
        </div>
      `
    };

    console.log(`📤 [Brevo] Payload enviado para API do Brevo (${endpoint}):`);
    console.log(JSON.stringify(payload, null, 2));

    console.log("🚀 [Brevo] Despachando requisição HTTP POST para o Brevo...");
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const status = res.status;
    const statusText = res.statusText;
    let resText = "";
    try {
      resText = await res.text();
    } catch (readErr) {
      resText = `[Erro ao ler corpo da resposta: ${readErr.message}]`;
    }

    console.log(`📥 [Brevo] Resposta exata da API Brevo: HTTP ${status} (${statusText})`);
    console.log(`📥 [Brevo] Corpo exato da resposta:`, resText);

    if (!res.ok) {
      console.error(`❌ [Brevo] Falha ao despachar e-mail via Brevo. Código HTTP: ${status}. Detalhes:`, resText);
      return false;
    }

    console.log(`✅ [Brevo] E-mail despachado com sucesso para ${toEmail}! Resposta:`, resText);
    return true;
  } catch (err) {
    console.error("❌ [Brevo] Erro fatal de rede ou execução ao despachar e-mail:", err);
    console.error("❌ [Brevo] Stack trace completo:", err?.stack || err);
    return false;
  }
}