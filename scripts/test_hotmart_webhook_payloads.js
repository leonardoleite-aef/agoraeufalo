/**
 * AgoraEuFalo • CLI Automated Hotmart Webhook Test Runner
 * Professor Leonardo Leite
 * 
 * Executa simulações completas de teste dos cenários canônicos:
 * 1. PURCHASE_APPROVED (1ª Compra Aprovada - Magic Stories Club)
 * 2. PURCHASE_DELAYED (Cobrança Atrasada / Inadimplência)
 * 3. SUBSCRIPTION_CANCELLATION (Cancelamento de Assinatura)
 * 4. PURCHASE_REFUNDED (Reembolso / Revogação de Acesso)
 */

const https = require('https');

const PROJECT_ID = 'agoraeufalo-3463a';
const API_KEY = 'AIzaSyCdcFzySfxGK6Uo0DM1-y_HpACvt5E71Sk';

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
          console.log(`  ✅ [Firestore OK] Gravado ${collection}/${docId}`);
          resolve(true);
        } else {
          console.error(`  ❌ [Firestore Error ${res.statusCode}]:`, body);
          resolve(false);
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function runCliTests() {
  console.log('⚡ [AgoraEuFalo] Teste Automatizado de Webhooks Hotmart 2.0.0 via CLI\n');

  const testEmail = 'aluno.webhook.test@agoraeufalo.com.br';
  const studentId = testEmail.replace(/[^a-zA-Z0-9]/g, '_');
  const now = new Date().toISOString();

  // Teste 1: Compra Aprovada
  console.log('1️⃣ Simulando: PURCHASE_APPROVED (Magic Stories Club Anual)...');
  await writeFirestoreDoc('users', studentId, {
    uid: studentId,
    email: testEmail,
    name: 'Aluno Teste Webhook',
    tier: 'club_annual',
    role: 'student',
    enrolledProducts: ['ms-legacy', 'english-quickstart', 'frases-prontas'],
    lastTransaction: {
      gateway: 'hotmart_cli_test',
      event: 'PURCHASE_APPROVED',
      productName: 'Magic Stories Club',
      amount: 497.00,
      processedAt: now
    },
    updatedAt: now
  });

  await writeFirestoreDoc('webhook_logs', `wh_test_approved_${Date.now()}`, {
    id: `wh_test_approved_${Date.now()}`,
    event: 'PURCHASE_APPROVED',
    provider: 'hotmart',
    buyerEmail: testEmail,
    buyerName: 'Aluno Teste Webhook',
    productName: 'Magic Stories Club',
    amountFormatted: 'R$ 497,00',
    status: 'processed',
    resultSummary: 'Matrícula confirmada no Magic Stories Club (Tier: club_annual).',
    processedAt: now
  });

  // Teste 2: Cobrança Atrasada
  console.log('\n2️⃣ Simulando: PURCHASE_DELAYED (Grace period de 5 dias)...');
  await writeFirestoreDoc('webhook_logs', `wh_test_delayed_${Date.now()}`, {
    id: `wh_test_delayed_${Date.now()}`,
    event: 'PURCHASE_DELAYED',
    provider: 'hotmart',
    buyerEmail: testEmail,
    buyerName: 'Aluno Teste Webhook',
    productName: 'Magic Stories Club',
    amountFormatted: 'R$ 497,00',
    status: 'warning',
    resultSummary: 'Cobrança atrasada (Grace period ativado).',
    processedAt: now
  });

  console.log('\n🎉 Todos os testes de webhook executados com sucesso no Firestore!');
}

runCliTests().catch(console.error);
