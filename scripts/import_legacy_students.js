#!/usr/bin/env node
/**
 * import_legacy_students.js — v3
 * Lê o access_token ativo do Firebase CLI e usa como Bearer.
 */

const fs    = require('fs');
const path  = require('path');
const https = require('https');
const os    = require('os');

// ── Config ────────────────────────────────────────────────────────────────────
const FIRESTORE_PROJECT_ID = 'agoraeufalo-3463a';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents`;
const BATCH_WRITE_URL = `${BASE_URL}:batchWrite`;

const CSV_PATH = path.join(__dirname, '..', 'data', 'alunos_master_todos_legados.csv');

const SKIP_EMAILS = new Set([
  'estevaopin@gmail.com',
  'thomasskt21@gmail.com',
  'selexenglish@gmail.com',
]);

const BATCH_SIZE = 400;

// ── Read access token from Firebase CLI config ────────────────────────────────
function getAccessToken() {
  const configPath = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const token = config?.tokens?.access_token;
  if (!token) throw new Error('No access_token in firebase-tools.json');
  return token;
}

// ── Firestore value helpers ───────────────────────────────────────────────────
function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number' && Number.isInteger(val)) return { integerValue: String(val) };
  if (typeof val === 'number') return { doubleValue: val };
  if (typeof val === 'string') return { stringValue: val };
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toFirestoreValue) } };
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) fields[k] = toFirestoreValue(v);
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function buildFirestoreDoc(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) fields[k] = toFirestoreValue(v);
  return { fields };
}

// ── HTTP helper ───────────────────────────────────────────────────────────────
function httpPost(url, body, accessToken) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const urlObj  = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path:     urlObj.pathname + urlObj.search,
      method:   'POST',
      headers:  {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Authorization':  `Bearer ${accessToken}`,
      },
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// ── CSV Parsing ───────────────────────────────────────────────────────────────
function parseCSV(filePath) {
  const raw   = fs.readFileSync(filePath, 'utf-8');
  const lines = raw.split('\n').map(l => l.replace(/\r/g, '').trim()).filter(Boolean);
  const header = lines[0].split(';').map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(';');
    const row  = {};
    header.forEach((h, idx) => { row[h] = (cols[idx] || '').trim(); });
    rows.push(row);
  }
  return rows;
}

// ── Build user document ───────────────────────────────────────────────────────
function slugify(email) {
  return email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
}

function buildUserDoc(row, now) {
  const email     = (row.email || '').toLowerCase().trim();
  const name      = (row.nome  || row.name || '').trim();
  const categoria = (row.categoria || '').trim();
  const origem    = (row.origem || '').trim();

  const enrolledProducts = categoria === 'magic_stories_legacy'
    ? ['ms-legacy']
    : ['first-steps'];

  const uid = slugify(email);

  return {
    uid,
    email,
    name:        name || email.split('@')[0],
    displayName: name || email.split('@')[0],
    tier:   'free',
    role:   'student',
    categories:        ['member_free'],
    enrolledProducts,
    purchasedProducts: [],
    subscriptions:     [],
    legacy: { tier: 'free', role: 'student', enrolledProducts },
    legacyEntitlements: ['member_free'],
    schemaVersion: 2,
    origem,
    legacyCategoria: categoria,
    source:     'bulk_import_legacy_2026',
    createdAt:  now,
    lastLoginAt: now,
    photoURL:   '',
    preferences: {},
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🔐  Reading access token from Firebase CLI config…');
  const accessToken = getAccessToken();
  console.log('    ✅ Token loaded.\n');

  console.log('📂  Reading CSV…');
  const rows = parseCSV(CSV_PATH);
  console.log(`    Total rows: ${rows.length}`);

  const now = new Date().toISOString();

  const seen    = new Set();
  const toWrite = [];

  for (const row of rows) {
    const email = (row.email || '').toLowerCase().trim();
    if (!email) continue;
    if (SKIP_EMAILS.has(email)) { console.log(`  ⏭  Skipping VIP: ${email}`); continue; }
    if (seen.has(email)) continue;
    seen.add(email);
    toWrite.push(buildUserDoc(row, now));
  }

  console.log(`\n📋  Documents to write: ${toWrite.length}`);
  console.log(`    (Skipped ${rows.length - toWrite.length} rows)\n`);

  const batches = [];
  for (let i = 0; i < toWrite.length; i += BATCH_SIZE) {
    batches.push(toWrite.slice(i, i + BATCH_SIZE));
  }

  console.log(`🚀  Sending ${batches.length} batches of up to ${BATCH_SIZE} docs each…\n`);

  let totalWritten = 0;
  let totalErrors  = 0;

  for (let bi = 0; bi < batches.length; bi++) {
    const batch  = batches[bi];
    const writes = batch.map(doc => ({
      update: {
        name: `projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents/users/${doc.uid}`,
        ...buildFirestoreDoc(doc),
      },
    }));

    const { status, body } = await httpPost(BATCH_WRITE_URL, { writes }, accessToken);

    if (status === 200) {
      const errs = (body.status || []).filter(s => s && s.code && s.code !== 0);
      if (errs.length) {
        console.error(`  ❌  Batch ${bi + 1}/${batches.length}: ${errs.length} write errors`);
        errs.slice(0, 3).forEach(e => console.error('    ', JSON.stringify(e)));
        totalErrors  += errs.length;
        totalWritten += (batch.length - errs.length);
      } else {
        const running = totalWritten + batch.length;
        console.log(`  ✅  Batch ${bi + 1}/${batches.length}: ${batch.length} docs  →  cumulative: ${running}`);
        totalWritten += batch.length;
      }
    } else {
      console.error(`  ❌  Batch ${bi + 1}/${batches.length}: HTTP ${status}`);
      if (body && body.error) console.error('    ', JSON.stringify(body.error));
      totalErrors += batch.length;
    }

    if (bi < batches.length - 1) await new Promise(r => setTimeout(r, 250));
  }

  console.log('\n══════════════════════════════════════════════');
  console.log('✅  Import complete!');
  console.log(`    Documents written : ${totalWritten}`);
  console.log(`    Errors            : ${totalErrors}`);
  console.log('══════════════════════════════════════════════\n');

  if (totalErrors > 0) process.exit(1);
}

main().catch(err => {
  console.error('💥  Fatal error:', err);
  process.exit(1);
});
