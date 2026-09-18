#!/usr/bin/env node
/**
 * AgoraEuFalo • Migração do Catálogo de Cursos para Contrato V2 (AccessGrant)
 * Professor Leonardo Leite
 * 
 * Este script migra formalmente todos os cursos da coleção 'courses/*' no
 * Google Cloud Firestore para a especificação canônica V2:
 * - schemaVersion: 2
 * - accessTier: "all_access" | "standalone" | "free"
 * - access: AccessGrant {
 *     entitlements: EntitlementCategory[],
 *     requiresProductId: string[],
 *     legacyGrantIds: string[]
 *   }
 * - isPublished: boolean
 * 
 * Alinhado estritamente com:
 * - assets/js/aef-courses-metadata.js
 * - assets/js/aef-access-engine.js (normalizeCourseToV2)
 * - src/types/core.ts
 */

const meta = require("../assets/js/aef-courses-metadata.js");
const { normalizeCourseToV2 } = require("../assets/js/aef-access-engine.js");

const FIRESTORE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "agoraeufalo-3463a";
const FIRESTORE_API_KEY = process.env.FIREBASE_API_KEY || "AIzaSyCdcFzySfxGK6Uo0DM1-y_HpACvt5E71Sk";

// Conversores Firestore REST
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

/**
 * Busca todos os cursos no Firestore
 */
async function fetchAllCourses() {
  const url = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents/courses?pageSize=100&key=${FIRESTORE_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Falha ao listar cursos (${res.status}): ${await res.text()}`);
  }
  const data = await res.json();
  return (data.documents || []).map(d => parseRestDoc(d));
}

/**
 * Constrói o bloco V2 AccessGrant e metadados canônicos para um curso
 */
function buildV2CourseFields(courseDoc) {
  const cid = courseDoc.id;
  const metadata = meta.getCourseMetadata(cid);

  // Normalização canônica via access engine
  const baseNormalized = normalizeCourseToV2({
    ...courseDoc,
    ...(metadata || {})
  });

  let accessTier = baseNormalized.accessTier;
  let access = {
    entitlements: baseNormalized.access?.entitlements ? [...baseNormalized.access.entitlements] : [],
    requiresProductId: baseNormalized.access?.requiresProductId ? [...baseNormalized.access.requiresProductId] : [],
    legacyGrantIds: baseNormalized.access?.legacyGrantIds ? [...baseNormalized.access.legacyGrantIds] : []
  };

  // Regras de catálogo oficiais
  if (cid === "dtc_curso" || cid === "aef-experience") {
    accessTier = "free";
    access.entitlements = ["member_free", "member_pago"];
    access.requiresProductId = [];
  } else if (cid === "english-quickstart" || cid === "fs-aef-ec" || cid === "ms-legacy") {
    accessTier = "all_access";
    access.entitlements = ["member_pago"];
    access.requiresProductId = [];
  } else if (cid === "airport_flight_level_1") {
    accessTier = "standalone";
    access.entitlements = ["venda_avulsa"];
    access.requiresProductId = ["airport_flight_level_1"];
  } else if (cid.startsWith("mentoria-")) {
    accessTier = "standalone";
    access.entitlements = ["member_mentoria"];
    access.requiresProductId = Array.from(new Set([
      cid,
      "PROJETO_AEF_2026",
      "MENTORIA_VIP"
    ]));
    if (metadata && Array.isArray(metadata.access?.requiresProductId)) {
      access.requiresProductId = Array.from(new Set([
        ...access.requiresProductId,
        ...metadata.access.requiresProductId
      ]));
    }
  }

  // Deduplicação
  access.entitlements = Array.from(new Set(access.entitlements));
  access.requiresProductId = Array.from(new Set(access.requiresProductId));
  access.legacyGrantIds = Array.from(new Set(access.legacyGrantIds));

  return {
    schemaVersion: 2,
    accessTier: accessTier,
    access: access,
    isPublished: courseDoc.published !== false && courseDoc.isPublished !== false,
    published: courseDoc.published !== false && courseDoc.isPublished !== false,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Atualiza um curso no Firestore usando updateMask.fieldPaths
 */
async function patchCourseV2(courseId, updateData) {
  const fields = {
    schemaVersion: toFirestoreField(updateData.schemaVersion),
    accessTier: toFirestoreField(updateData.accessTier),
    access: toFirestoreField(updateData.access),
    isPublished: toFirestoreField(updateData.isPublished),
    published: toFirestoreField(updateData.published),
    updatedAt: toFirestoreField(updateData.updatedAt)
  };

  const fieldPaths = ["schemaVersion", "accessTier", "access", "isPublished", "published", "updatedAt"];
  const maskQuery = fieldPaths.map(p => `updateMask.fieldPaths=${encodeURIComponent(p)}`).join("&");
  const url = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents/courses/${courseId}?key=${FIRESTORE_API_KEY}&${maskQuery}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields })
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status} ao atualizar courses/${courseId}: ${txt}`);
  }

  const resultDoc = await res.json();
  return parseRestDoc(resultDoc);
}

/**
 * Verifica leitura do curso para atestar persistência
 */
async function verifyCourseV2(courseId) {
  const url = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents/courses/${courseId}?key=${FIRESTORE_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ao verificar courses/${courseId}`);
  }
  const data = await res.json();
  return parseRestDoc(data);
}

/**
 * Execução da migração
 */
async function migrateCourses(options = {}) {
  const { dryRun = false } = options;

  console.log("=================================================================");
  console.log("📚 AGORAEUFALO • MIGRAÇÃO DO CATÁLOGO DE CURSOS (courses/* V2)");
  console.log("=================================================================");
  console.log(`Modo:        ${dryRun ? "🔍 DRY-RUN (SIMULAÇÃO)" : "⚡ LIVE (GRAVAÇÃO REAL NO FIRESTORE)"}`);
  console.log(`Projeto:     ${FIRESTORE_PROJECT_ID}`);
  console.log(`Timestamp:   ${new Date().toISOString()}`);
  console.log("-----------------------------------------------------------------");

  console.log("📥 Carregando catálogo completo de courses/*...");
  const courses = await fetchAllCourses();
  console.log(`✅ ${courses.length} cursos encontrados no Firestore.\n`);

  const results = [];

  for (let i = 0; i < courses.length; i++) {
    const c = courses[i];
    const cid = c.id;
    const v2Fields = buildV2CourseFields(c);

    console.log(`[${i + 1}/${courses.length}] Processando "${c.title || cid}" (${cid})...`);
    console.log(`   accessTier: ${v2Fields.accessTier}`);
    console.log(`   access:     ${JSON.stringify(v2Fields.access)}`);

    if (dryRun) {
      console.log(`   🔍 [SIMULAÇÃO] Campo access e schemaVersion: 2 seriam gravados.`);
      results.push({ id: cid, status: "simulated", v2Fields });
    } else {
      try {
        await patchCourseV2(cid, v2Fields);
        const verified = await verifyCourseV2(cid);

        const hasV2 = verified.schemaVersion === 2;
        const hasTier = Boolean(verified.accessTier);
        const hasAccessObj = Boolean(verified.access && Array.isArray(verified.access.entitlements));

        if (hasV2 && hasTier && hasAccessObj) {
          console.log(`   ✅ LIVE: Persistido e verificado com sucesso! (schemaVersion: ${verified.schemaVersion}, accessTier: ${verified.accessTier})`);
          results.push({ id: cid, status: "persisted", verified });
        } else {
          console.warn(`   ⚠️ LIVE: Persistido porém validação parcial:`, verified);
          results.push({ id: cid, status: "partial", verified });
        }
      } catch (err) {
        console.error(`   ❌ Falha ao migrar ${cid}:`, err.message);
        results.push({ id: cid, status: "error", error: err.message });
      }
    }
  }

  console.log("\n=================================================================");
  console.log("📊 RELATÓRIO CONSOLIDADO DA MIGRAÇÃO DE CURSOS");
  console.log("=================================================================");
  console.log(`Total de Cursos no Firestore: ${courses.length}`);
  console.log(`Sucesso na Migração:          ${results.filter(r => r.status === "persisted" || r.status === "simulated").length}`);
  console.log(`Falhas:                       ${results.filter(r => r.status === "error").length}`);
  console.log("=================================================================\n");

  return results;
}

if (require.main === module) {
  const isDryRun = process.argv.includes("--dry-run");
  migrateCourses({ dryRun: isDryRun }).catch(err => {
    console.error("❌ Erro fatal na migração de cursos:", err);
    process.exit(1);
  });
}

module.exports = {
  fetchAllCourses,
  buildV2CourseFields,
  patchCourseV2,
  verifyCourseV2,
  migrateCourses
};
