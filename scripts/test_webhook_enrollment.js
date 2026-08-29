/**
 * AgoraEuFalo - Webhook Enrollment Test Script
 * Simulates a Hotmart / Stripe purchase approval and verifies Firestore payload.
 */

const https = require('https');

const PROJECT_ID = 'agoraeufalo-3463a';
const API_KEY = 'AIzaSyCdcFzySfxGK6Uo0DM1-y_HpACvt5E71Sk';

const TEST_STUDENT = {
  email: 'teste.aluno.vip@agoraeufalo.com.br',
  name: 'Aluno Teste VIP 2026',
  tier: 'vip_mentorship',
  role: 'student',
  enrolledProducts: ['ms-legacy', 'english-quickstart', 'frases-prontas', 'all_access_master', 'mentoria_vip'],
  productName: 'Projeto AgoraEuFalo 2026 (Mentoria VIP + Formação Completa)'
};

function convertValueToFirestore(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'string') return { stringValue: val };
  if (typeof val === 'number') {
    return Number.isInteger(val) ? { integerValue: val.toString() } : { doubleValue: val };
  }
  if (typeof val === 'boolean') return { booleanValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(convertValueToFirestore) } };
  }
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) fields[k] = convertValueToFirestore(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function writeFirestoreDoc(collection, docId, data) {
  return new Promise((resolve, reject) => {
    const fields = {};
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) fields[k] = convertValueToFirestore(v);
    }

    const payload = JSON.stringify({ fields });
    const path = `/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${docId}?key=${API_KEY}`;

    const req = https.request({
      hostname: 'firestore.googleapis.com',
      path: path,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ [Firestore OK] Saved ${collection}/${docId}`);
          resolve(true);
        } else {
          console.error(`❌ [Firestore Error] (${res.statusCode}):`, body);
          resolve(false);
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function runTest() {
  console.log('🧪 Iniciando Teste de Matrícula Automática via Webhook (Simulação)...');
  const docId = TEST_STUDENT.email.replace(/[^a-zA-Z0-9]/g, '_');

  const userPayload = {
    uid: docId,
    email: TEST_STUDENT.email,
    name: TEST_STUDENT.name,
    tier: TEST_STUDENT.tier,
    role: TEST_STUDENT.role,
    enrolledProducts: TEST_STUDENT.enrolledProducts,
    lastTransaction: {
      gateway: 'hotmart_simulation',
      event: 'PURCHASE_APPROVED',
      productName: TEST_STUDENT.productName,
      processedAt: new Date().toISOString()
    },
    updatedAt: new Date().toISOString()
  };

  const success = await writeFirestoreDoc('users', docId, userPayload);
  if (success) {
    console.log(`🎉 Aluno ${TEST_STUDENT.name} matriculado com sucesso no Firestore como ${TEST_STUDENT.tier}!`);
  } else {
    console.error('❌ Falha ao matricular aluno no Firestore.');
  }
}

runTest().catch(console.error);
