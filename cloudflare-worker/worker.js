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
    } catch (_) {}
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
  } catch (_) {}
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
    } catch (_) {}
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

    // 2. Resposta amigável para testes via navegador (HTTP GET)
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

    // 5. Demais requisições POST -> Processamento do Webhook Hotmart
    return handleHotmartWebhook(request, env, ctx);
  }
};
