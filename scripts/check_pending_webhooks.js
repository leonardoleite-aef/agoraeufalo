#!/usr/bin/env node
/**
 * AgoraEuFalo • Monitoramento de Webhooks Pendentes (Verificação 1.5)
 * Professor Leonardo Leite
 * 
 * Consulta webhooks com status == 'pending' há mais de 5 minutos no Cloud Firestore
 * (coleção 'webhook_events/*').
 * 
 * Como a regra Zero Trust bloqueia leituras não autenticadas (allow read, write: if false),
 * este script suporta autenticação administrativa server-side via:
 * 1. Arquivo de Service Account do Google Cloud / Firebase:
 *    - Variável GOOGLE_APPLICATION_CREDENTIALS=/caminho/service-account.json
 *    - Flag --key /caminho/service-account.json
 *    - Arquivo local ./service-account.json ou ./firebase-service-account.json
 * 2. Fallback REST para ambientes com token OAuth Bearer configurado
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const FIRESTORE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "agoraeufalo-3463a";

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

/**
 * Localiza o arquivo de credenciais de serviço local
 */
function findServiceAccountPath(customPath) {
  if (customPath && fs.existsSync(customPath)) return customPath;
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    return process.env.GOOGLE_APPLICATION_CREDENTIALS;
  }
  if (process.env.FIREBASE_SERVICE_ACCOUNT && fs.existsSync(process.env.FIREBASE_SERVICE_ACCOUNT)) {
    return process.env.FIREBASE_SERVICE_ACCOUNT;
  }
  const rootDir = path.resolve(__dirname, '..');
  const candidates = [
    path.join(rootDir, 'service-account.json'),
    path.join(rootDir, 'firebase-service-account.json'),
    path.join(rootDir, 'agoraeufalo-service-account.json')
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

/**
 * Gera um Google OAuth2 Access Token a partir de Service Account JSON nativamente (RS256)
 */
async function getAccessTokenFromServiceAccount(saPath) {
  const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'));
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: sa.client_email,
    sub: sa.client_email,
    aud: "https://oauth2.googleapis.com/token",
    scope: "https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/cloud-platform",
    iat: now,
    exp: now + 3600
  };

  const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const unsignedToken = `${b64(header)}.${b64(payload)}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedToken);
  signer.end();
  const signature = signer.sign(sa.private_key, 'base64url');
  const jwt = `${unsignedToken}.${signature}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    })
  });

  if (!tokenRes.ok) {
    const errTxt = await tokenRes.text();
    throw new Error(`Falha ao obter Access Token da Service Account: ${errTxt}`);
  }

  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

async function queryPendingWebhooks(options = {}) {
  const thresholdMinutes = options.thresholdMinutes !== undefined ? options.thresholdMinutes : 5;
  const projectId = options.projectId || FIRESTORE_PROJECT_ID;
  const saPath = findServiceAccountPath(options.keyPath);

  let headers = { "Content-Type": "application/json" };

  if (saPath) {
    const accessToken = await getAccessTokenFromServiceAccount(saPath);
    headers["Authorization"] = `Bearer ${accessToken}`;
  } else if (process.env.FIREBASE_ACCESS_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.FIREBASE_ACCESS_TOKEN}`;
  } else {
    // Sem credencial de serviço explícita
    throw new Error(
      "Credencial de serviço do Firebase/Google Cloud não encontrada.\n" +
      "Como as regras Zero Trust bloqueiam leitura client-side em 'webhook_events/*',\n" +
      "execute o script com:\n" +
      "  node scripts/check_pending_webhooks.js --key /caminho/service-account.json\n" +
      "  ou defina a variável: export GOOGLE_APPLICATION_CREDENTIALS=/caminho/service-account.json"
    );
  }

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
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
    headers,
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
  let keyPath = null;

  const threshIdx = args.indexOf("--threshold");
  if (threshIdx !== -1 && args[threshIdx + 1]) {
    threshold = parseInt(args[threshIdx + 1], 10) || 5;
  }

  const keyIdx = args.indexOf("--key");
  if (keyIdx !== -1 && args[keyIdx + 1]) {
    keyPath = args[keyIdx + 1];
  }

  console.log("=================================================================");
  console.log("🔍 AGORAEUFALO • MONITORAMENTO DE WEBHOOKS PENDENTES (1.5)");
  console.log("=================================================================");
  console.log(`Projeto:     ${FIRESTORE_PROJECT_ID}`);
  console.log(`Threshold:   ${threshold} minutos`);
  console.log(`Horário:     ${new Date().toISOString()}`);
  console.log("-----------------------------------------------------------------");

  try {
    const report = await queryPendingWebhooks({ thresholdMinutes: threshold, keyPath });

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
    console.error("❌ Falha na consulta de webhooks:", err.message || err);
    process.exit(1);
  }
}

if (require.main === module) {
  runCli();
}

module.exports = { queryPendingWebhooks };
