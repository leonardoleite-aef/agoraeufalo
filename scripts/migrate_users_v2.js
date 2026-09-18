#!/usr/bin/env node
/**
 * AgoraEuFalo • Script de Migração de Usuários para Contrato V2 (P0-3)
 * Professor Leonardo Leite
 * 
 * Este script realiza a migração auditável, idempotente e segura dos documentos de
 * usuários (coleção 'users/*') no Cloud Firestore para a especificação canônica V2.
 * 
 * Regras Canônicas de Migração:
 * 1. Idempotência: Se o documento já contiver `schemaVersion: 2`, ele é ignorado.
 * 2. Normalização V2: Transforma subscription singular, tier legado, categories soltas
 *    e enrolledProducts nos arrays tipados `subscriptions[]`, `legacyEntitlements[]`
 *    e `purchasedProducts[]`.
 * 3. Retrocompatibilidade: Preserva intactos todos os campos legados de primeiro nível
 *    (tier, categories, enrolledProducts, etc.) para garantir zero quebra em clientes legados.
 * 4. Backup Estruturado: Cria o nó `legacy: { tier, enrolledProducts, categories, subscription, role }`.
 * 5. Dry-Run Seguro: A flag `--dry-run` simula toda a migração com cálculo de métricas sem gravar no banco.
 */

const engine = require("../assets/js/aef-access-engine.js");

const FIRESTORE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "agoraeufalo-3463a";
const FIRESTORE_API_KEY = process.env.FIREBASE_API_KEY || "AIzaSyCdcFzySfxGK6Uo0DM1-y_HpACvt5E71Sk";

// ============================================================================
// CONVERSORES REST FIRESTORE (JS <-> FIRESTORE REST SCHEMA)
// ============================================================================

function parseRestField(field) {
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

function parseRestDoc(doc, fallbackId = "") {
  if (!doc) return null;
  const docId = doc.name ? doc.name.split("/").pop() : fallbackId;
  const obj = { id: docId, uid: docId };
  for (const [k, v] of Object.entries(doc.fields || {})) {
    obj[k] = parseRestField(v);
  }
  return obj;
}

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

function toFirestoreFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && typeof v !== "function" && k !== "id") {
      fields[k] = toFirestoreField(v);
    }
  }
  return fields;
}

// ============================================================================
// TRANSFORMAÇÃO CANÔNICA DE DOCUMENTO DE USUÁRIO
// ============================================================================

/**
 * Avalia e migra um documento individual de usuário para o Contrato V2.
 * Retorna { status: 'already_v2' | 'migrated' | 'error', user, error }
 */
function migrateUserDocument(rawUser) {
  if (!rawUser) {
    return { status: "error", error: new Error("Documento de usuário nulo ou indefinido") };
  }

  // 1. Verificação de Idempotência
  if (rawUser.schemaVersion === 2 && Array.isArray(rawUser.subscriptions) && Array.isArray(rawUser.legacyEntitlements)) {
    return {
      status: "already_v2",
      user: rawUser
    };
  }

  try {
    // 2. Aplicação da normalização canônica V2
    const normalized = engine.normalizeUser(rawUser);

    // 3. Garantir preservação estrita de campos de perfil existentes
    const migratedUser = {
      ...rawUser,
      ...normalized,
      schemaVersion: 2,
      updatedAt: new Date().toISOString()
    };

    return {
      status: "migrated",
      user: migratedUser
    };
  } catch (err) {
    return {
      status: "error",
      error: err,
      user: rawUser
    };
  }
}

// ============================================================================
// MOTOR DE EXECUÇÃO EM LOTE (DRY-RUN OU LIVE)
// ============================================================================

/**
 * Busca todos os documentos da coleção users via API REST com suporte a paginação.
 */
async function fetchAllUserDocs({ projectId, apiKey, limit = 0 }) {
  const documents = [];
  let pageToken = null;
  const pageSize = 100;

  do {
    let url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users?pageSize=${pageSize}&key=${apiKey}`;
    if (pageToken) {
      url += `&pageToken=${encodeURIComponent(pageToken)}`;
    }

    const res = await fetch(url);
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Falha ao listar usuários no Firestore HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    if (Array.isArray(data.documents)) {
      for (const d of data.documents) {
        documents.push(d);
        if (limit > 0 && documents.length >= limit) {
          return documents;
        }
      }
    }

    pageToken = data.nextPageToken || null;
  } while (pageToken);

  return documents;
}

/**
 * Persiste a atualização de um documento no Firestore via REST PATCH.
 */
async function saveUserDoc({ projectId, apiKey, docId, migratedUser }) {
  const fields = toFirestoreFields(migratedUser);
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${docId}?key=${apiKey}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} ao gravar users/${docId}: ${text}`);
  }

  return await res.json();
}

/**
 * Executa o fluxo de migração completo (com métricas detalhadas e suporte a dry-run).
 */
async function migrateUsers(options = {}) {
  const {
    dryRun = false,
    verbose = false,
    limit = 0,
    projectId = FIRESTORE_PROJECT_ID,
    apiKey = FIRESTORE_API_KEY,
    customDocs = null
  } = options;

  const metrics = {
    totalRead: 0,
    alreadyMigrated: 0,
    migratedSuccess: 0,
    failed: 0,
    dryRun: Boolean(dryRun),
    startedAt: new Date().toISOString(),
    finishedAt: null,
    details: []
  };

  console.log("=================================================================");
  console.log("🚀 AGORAEUFALO • MIGRAÇÃO DE USUÁRIOS PARA O CONTRATO V2 (P0-3)");
  console.log("=================================================================");
  console.log(`Modo de Execução: ${dryRun ? "🔍 DRY-RUN (SIMULAÇÃO AUDITÁVEL)" : "⚡ LIVE (GRAVAÇÃO REAL NO BANCO)"}`);
  console.log(`Projeto Firestore: ${projectId}`);
  if (limit > 0) console.log(`Limite configurado: ${limit} documentos`);
  console.log("-----------------------------------------------------------------");

  let rawDocs = [];
  if (Array.isArray(customDocs)) {
    rawDocs = customDocs;
  } else {
    try {
      console.log("📡 Conectando ao Cloud Firestore e listando documentos de users/*...");
      rawDocs = await fetchAllUserDocs({ projectId, apiKey, limit });
    } catch (fetchErr) {
      console.error("❌ Erro fatal ao carregar documentos do Firestore:", fetchErr.message);
      metrics.failed = 1;
      metrics.finishedAt = new Date().toISOString();
      return metrics;
    }
  }

  metrics.totalRead = rawDocs.length;
  console.log(`📥 Total de documentos encontrados na coleção: ${metrics.totalRead}`);
  console.log("-----------------------------------------------------------------");

  for (let i = 0; i < rawDocs.length; i++) {
    const rawRestDoc = rawDocs[i];
    const parsedUser = rawRestDoc.fields ? parseRestDoc(rawRestDoc) : rawRestDoc;
    const docId = parsedUser.id || parsedUser.uid || `doc_${i}`;
    const email = parsedUser.email || "sem_email";

    const result = migrateUserDocument(parsedUser);

    if (result.status === "already_v2") {
      metrics.alreadyMigrated++;
      if (verbose) {
        console.log(`⏩ [IDEMPOTENTE] #${i + 1} (${email}): Já possui schemaVersion: 2`);
      }
      metrics.details.push({
        id: docId,
        email,
        status: "skipped_already_v2"
      });
      continue;
    }

    if (result.status === "error") {
      metrics.failed++;
      console.error(`❌ [ERRO] #${i + 1} (${email}): Falha na normalização: ${result.error?.message}`);
      metrics.details.push({
        id: docId,
        email,
        status: "error",
        error: result.error?.message
      });
      continue;
    }

    // result.status === 'migrated'
    const migratedUser = result.user;

    if (dryRun) {
      metrics.migratedSuccess++;
      const subsCount = migratedUser.subscriptions?.length || 0;
      const legCount = migratedUser.legacyEntitlements?.length || 0;
      const prodCount = migratedUser.purchasedProducts?.length || 0;
      
      console.log(`🔍 [SIMULAÇÃO] #${i + 1} (${email}) -> schemaVersion: 2 | Subs: ${subsCount} | Legacy: [${(migratedUser.legacyEntitlements || []).join(", ")}] | Prods: ${prodCount}`);
      
      metrics.details.push({
        id: docId,
        email,
        status: "simulated_success",
        subscriptionsCount: subsCount,
        legacyEntitlements: migratedUser.legacyEntitlements,
        purchasedProductsCount: prodCount
      });
    } else {
      try {
        await saveUserDoc({ projectId, apiKey, docId, migratedUser });
        metrics.migratedSuccess++;
        console.log(`✅ [GRAVADO] #${i + 1} (${email}) -> Migrado para V2 com sucesso no Firestore`);
        metrics.details.push({
          id: docId,
          email,
          status: "migrated_success"
        });
      } catch (writeErr) {
        metrics.failed++;
        console.error(`❌ [FALHA GRAVAÇÃO] #${i + 1} (${email}): ${writeErr.message}`);
        metrics.details.push({
          id: docId,
          email,
          status: "write_error",
          error: writeErr.message
        });
      }
    }
  }

  metrics.finishedAt = new Date().toISOString();

  console.log("=================================================================");
  console.log("📊 RELATÓRIO FINAL DE MIGRAÇÃO (P0-3)");
  console.log("=================================================================");
  console.log(`Total de Documentos Lidos:       ${metrics.totalRead}`);
  console.log(`Já Migrados (Idempotência V2):   ${metrics.alreadyMigrated}`);
  console.log(`Convertidos / Gravados com Êxito: ${metrics.migratedSuccess}`);
  console.log(`Falhas Registradas:              ${metrics.failed}`);
  console.log(`Modo Dry-Run:                     ${metrics.dryRun ? "SIM (Nenhuma gravação efetuada)" : "NÃO (Banco modificado)"}`);
  console.log(`Duração:                          ${new Date(metrics.finishedAt) - new Date(metrics.startedAt)} ms`);
  console.log("=================================================================\n");

  return metrics;
}

// ============================================================================
// CLI ENTRYPOINT
// ============================================================================

if (require.main === module) {
  const args = process.argv.slice(2);
  const isDryRun = args.includes("--dry-run");
  const isVerbose = args.includes("--verbose");
  const limitArg = args.find(a => a.startsWith("--limit="));
  const limit = limitArg ? parseInt(limitArg.split("=")[1], 10) : 0;

  migrateUsers({
    dryRun: isDryRun,
    verbose: isVerbose,
    limit
  }).then(metrics => {
    if (metrics.failed > 0) {
      console.warn("⚠️ A migração finalizou com pendências ou falhas.");
      process.exit(1);
    } else {
      console.log("🎉 Processo de migração concluído com 100% de sucesso!");
      process.exit(0);
    }
  }).catch(err => {
    console.error("❌ Falha crítica inesperada:", err);
    process.exit(1);
  });
}

module.exports = {
  migrateUsers,
  migrateUserDocument,
  parseRestDoc,
  parseRestField,
  toFirestoreFields,
  toFirestoreField
};
