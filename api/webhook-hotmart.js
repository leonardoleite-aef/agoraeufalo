/**
 * AgoraEuFalo • Universal Hotmart Webhook Receiver Endpoint (API)
 * Professor Leonardo Leite
 * 
 * Compatível com:
 * 1. Vercel Serverless Function (export default handler)
 * 2. Node.js / Express / Cloud Function
 * 3. Cloudflare Worker (via adapter)
 */

const https = require('https');

const PROJECT_ID = 'agoraeufalo-3463a';
const API_KEY = 'AIzaSyCdcFzySfxGK6Uo0DM1-y_HpACvt5E71Sk';

// Mapeamento Canônico de Produtos & Tiers
const PRODUCT_TIER_MAPPING = {
  '8460579': {
    tier: 'club_annual',
    role: 'student',
    enrolledProducts: ['ms-legacy', 'english-quickstart', 'frases-prontas'],
    productName: 'Magic Stories Club (Assinatura Anual)'
  },
  'MAGIC_STORIES_CLUB': {
    tier: 'club_annual',
    role: 'student',
    enrolledProducts: ['ms-legacy', 'english-quickstart', 'frases-prontas'],
    productName: 'Magic Stories Club'
  },
  'PROJETO_AEF_2026': {
    tier: 'vip_mentorship',
    role: 'student',
    enrolledProducts: ['ms-legacy', 'english-quickstart', 'frases-prontas', 'all_access_master', 'mentoria_vip'],
    productName: 'Projeto AgoraEuFalo 2026 (Mentoria VIP)'
  }
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
          resolve(true);
        } else {
          console.error(`❌ [Firestore REST Error ${res.statusCode}]:`, body);
          resolve(false);
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function handleWebhook(body, headers = {}) {
  const eventId = body.id || `wh_${Date.now()}`;
  const event = body.event || 'PURCHASE_APPROVED';
  const data = body.data || body;
  const buyer = data.buyer || body.buyer || {};
  const product = data.product || body.product || {};
  const purchase = data.purchase || body.purchase || {};
  const subscription = data.subscription || body.subscription || {};

  const email = (buyer.email || body.email || '').trim().toLowerCase();
  const name = (buyer.name || body.name || email.split('@')[0] || 'Aluno AgoraEuFalo').trim();
  const phone = buyer.checkout_phone || buyer.phone || '';
  const prodName = product.name || 'Magic Stories Club';
  const prodId = String(product.id || '8460579');
  const offerCode = purchase.offer?.code || '';
  const transactionId = purchase.transaction || `tx_${Date.now()}`;
  const isRecurrent = Boolean(purchase.recurrent || purchase.recurrence_number > 1);

  if (!email) {
    throw new Error('E-mail do comprador não encontrado.');
  }

  const studentId = email.replace(/[^a-zA-Z0-9]/g, '_');
  const nowIso = new Date().toISOString();

  // Mapeamento de Tiers
  let mapping = PRODUCT_TIER_MAPPING[prodId] || PRODUCT_TIER_MAPPING['8460579'];
  if (offerCode.includes('VIP') || prodName.includes('VIP') || prodName.includes('2026')) {
    mapping = PRODUCT_TIER_MAPPING['PROJETO_AEF_2026'];
  }

  let targetTier = mapping.tier;
  let targetCourses = mapping.enrolledProducts;
  let status = 'active';

  if (event === 'PURCHASE_DELAYED') {
    status = 'overdue_grace_period';
  } else if (event === 'SUBSCRIPTION_CANCELLATION') {
    status = 'canceled_grace';
  } else if (event === 'PURCHASE_REFUNDED' || event === 'PURCHASE_CHARGEBACK') {
    targetTier = 'free';
    targetCourses = [];
    status = 'revoked';
  }

  // 1. Grava no Firestore na coleção 'users'
  const userPayload = {
    uid: studentId,
    email: email,
    name: name,
    phone: phone,
    tier: targetTier,
    role: 'student',
    enrolledProducts: targetCourses,
    subscriptionState: {
      status: status,
      isRecurrent: isRecurrent,
      lastEvent: event,
      updatedAt: nowIso
    },
    lastTransaction: {
      gateway: 'hotmart',
      event: event,
      productName: prodName,
      transactionId: transactionId,
      processedAt: nowIso
    },
    updatedAt: nowIso
  };

  await writeFirestoreDoc('users', studentId, userPayload);

  // 2. Grava log de auditoria em 'webhook_logs'
  const logPayload = {
    id: eventId,
    event: event,
    provider: 'hotmart',
    buyerEmail: email,
    buyerName: name,
    productName: prodName,
    transactionId: transactionId,
    amountFormatted: purchase.price?.value ? `R$ ${purchase.price.value}` : 'R$ 0,00',
    status: status === 'revoked' ? 'warning' : 'processed',
    resultSummary: `Evento ${event} processado para ${name} (Tier: ${targetTier})`,
    processedAt: nowIso
  };

  await writeFirestoreDoc('webhook_logs', eventId, logPayload);

  return {
    success: true,
    studentId: studentId,
    tier: targetTier,
    event: event
  };
}

// Export Vercel / Node HTTP Handler
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const result = await handleWebhook(req.body, req.headers);
    return res.status(200).json({ received: true, ...result });
  } catch (err) {
    console.error('❌ Erro no processamento do webhook:', err);
    return res.status(400).json({ error: err.message });
  }
};
