#!/usr/bin/env node
/**
 * AgoraEuFalo • Monitoramento de Webhooks Pendentes (Verificação 1.5)
 * Professor Leonardo Leite
 * 
 * Consulta rápida para listar webhooks com status == 'pending' há mais de 5 minutos
 * no Cloud Firestore (webhook_events/*), prevenindo perda silenciosa de eventos por crash.
 * 
 * Uso:
 *   node scripts/check_pending_webhooks.js
 *   node scripts/check_pending_webhooks.js --threshold 10
 */

const FIRESTORE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "agoraeufalo-3463a";
const FIRESTORE_API_KEY = process.env.FIREBASE_API_KEY || "AIzaSyCdcFzySfxGK6Uo0DM1-y_HpACvt5E71Sk";

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
  const obj = { id: docId, _createTime: doc.createTime, _updateTime: doc.updateTime };
  for (const [k, v] of Object.entries(doc.fields || {})) {
    obj[k] = parseRestField(v);
  }
  return obj;
}

export async function queryPendingWebhooks(options = {}) {
  const thresholdMinutes = options.thresholdMinutes !== undefined ? options.thresholdMinutes : 5;
  const projectId = options.projectId || FIRESTORE_PROJECT_ID;
  const apiKey = options.apiKey || FIRESTORE_API_KEY;

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`;
  const queryPayload = {
    structuredQuery: {
      from: [{ collectionId: "webhook_events" }],
      where: {
        fieldFilter: {
          field: { fieldPath: "status" },
          op: "EQUAL",
          value: { stringValue: "pending" }
        }
      }
    }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(queryPayload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status} ao consultar Firestore: ${errText}`);
  }

  const results = await res.json();
  const allPending = [];

  if (Array.isArray(results)) {
    for (const item of results) {
      if (item.document) {
        allPending.push(parseRestDoc(item.document));
      }
    }
  }

  const now = Date.now();
  const thresholdMs = thresholdMinutes * 60 * 1000;

  const stalePending = [];
  const recentPending = [];

  for (const doc of allPending) {
    const tsStr = doc.receivedAt || doc.createdAt || doc._createTime || doc.eventTime;
    const tsDate = tsStr ? new Date(tsStr) : null;
    const ageMs = tsDate && !isNaN(tsDate.getTime()) ? (now - tsDate.getTime()) : thresholdMs + 1000;
    const ageMinutes = Math.round(ageMs / 60000);

    const enriched = {
      ...doc,
      ageMinutes,
      ageMs,
      timestamp: tsStr || "desconhecido"
    };

    if (ageMs >= thresholdMs) {
      stalePending.push(enriched);
    } else {
      recentPending.push(enriched);
    }
  }

  return {
    thresholdMinutes,
    totalPending: allPending.length,
    stalePending,
    recentPending
  };
}

async function runCli() {
  const args = process.argv.slice(2);
  let threshold = 5;
  const threshIdx = args.indexOf("--threshold");
  if (threshIdx !== -1 && args[threshIdx + 1]) {
    threshold = parseInt(args[threshIdx + 1], 10) || 5;
  }

  console.log("=================================================================");
  console.log("🔍 AGORAEUFALO • MONITORAMENTO DE WEBHOOKS PENDENTES (1.5)");
  console.log("=================================================================");
  console.log(`Projeto:     ${FIRESTORE_PROJECT_ID}`);
  console.log(`Threshold:   ${threshold} minutos`);
  console.log(`Horário:     ${new Date().toISOString()}`);
  console.log("-----------------------------------------------------------------");

  try {
    const report = await queryPendingWebhooks({ thresholdMinutes: threshold });

    if (report.stalePending.length === 0) {
      console.log(`✅ Nenhum webhook pendente há mais de ${threshold} minutos!`);
      console.log(`   Webhooks pendentes recentes em processamento (< ${threshold}m): ${report.recentPending.length}`);
      console.log("-----------------------------------------------------------------");
      process.exit(0);
    } else {
      console.warn(`⚠️  ALERTA: Encontrados ${report.stalePending.length} webhooks travados como "pending" (> ${threshold}m)!`);
      console.log("-----------------------------------------------------------------");
      console.table(
        report.stalePending.map(item => ({
          "Event ID": item.id,
          "Evento": item.event || item.eventType || "N/A",
          "Email": item.buyerEmail || item.email || "N/A",
          "Idade (min)": item.ageMinutes,
          "Criado Em": item.timestamp
        }))
      );
      console.log("-----------------------------------------------------------------");
      console.warn("💡 Recomenda-se investigar os logs do Cloudflare Worker para estes Event IDs.");
      process.exit(1);
    }
  } catch (err) {
    console.error("❌ Falha ao executar consulta no Firestore:", err.message || err);
    process.exit(1);
  }
}

if (process.argv[1] && process.argv[1].endsWith("check_pending_webhooks.js")) {
  runCli();
}
