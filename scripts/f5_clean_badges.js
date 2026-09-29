// scripts/f5_clean_badges.js
const https = require('https');

const UPDATES = [
  // [courseId, ação: 'remove_badge' | 'fix_tier_and_badge', novoAccessTier]
  ['aef-experience',              'remove_badge',          'free'],
  ['airport_flight_level_1',      'remove_badge',          'standalone'],
  ['dtc_curso',                   'remove_badge',          'free'],
  ['english-quickstart',          'remove_badge',          'all_access'],
  ['fs-aef-ec',                   'remove_badge',          'all_access'],
  ['mentoria-andre',              'fix_tier_and_badge',    'mentoria_vip'],
  ['mentoria-estevaopin',         'fix_tier_and_badge',    'mentoria_vip'],
  ['mentoria-mateus.s.gomes.novo','fix_tier_and_badge',    'mentoria_vip'],
  ['mentoria-thomasskt21',        'fix_tier_and_badge',    'mentoria_vip'],
  ['ms-legacy',                   'remove_badge',          'all_access'],
];

const BASE = 'https://firestore.googleapis.com/v1/projects/agoraeufalo-3463a/databases/(default)/documents/courses';

async function patchDoc(courseId, action, newTier) {
  return new Promise((resolve, reject) => {
    const fields = {
      updatedAt: { stringValue: new Date().toISOString() }
    };
    let mask = 'updatedAt';
    
    if (action === 'fix_tier_and_badge' || action === 'remove_badge') {
      // Atualiza accessTier
      fields.accessTier = { stringValue: newTier };
      mask += ',accessTier';
      // NÃO inclui badge no fields → o updateMask com badge sem valor no fields REMOVE o campo
    }
    
    // Monta URL com updateMask que inclui 'badge' para deletar o campo
    const path = `/${courseId}?updateMask.fieldPaths=badge&updateMask.fieldPaths=accessTier&updateMask.fieldPaths=updatedAt`;
    const body = JSON.stringify({ fields });
    
    const options = {
      hostname: 'firestore.googleapis.com',
      path: `/v1/projects/agoraeufalo-3463a/databases/(default)/documents/courses${path}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ ${courseId} → accessTier=${newTier}, badge=REMOVIDO (HTTP ${res.statusCode})`);
          resolve({ ok: true, status: res.statusCode, courseId });
        } else {
          console.error(`❌ ${courseId} → HTTP ${res.statusCode}: ${data.slice(0,200)}`);
          resolve({ ok: false, status: res.statusCode, courseId, data: data.slice(0, 200) });
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('Iniciando limpeza do Firestore — 10 cursos...');
  let success = 0;
  const results = [];
  for (const [courseId, action, tier] of UPDATES) {
    const res = await patchDoc(courseId, action, tier);
    results.push(res);
    if (res.ok) success++;
    await new Promise(r => setTimeout(r, 200)); // throttle
  }
  console.log(`\nConcluído: ${success}/${UPDATES.length} cursos atualizados.`);
}

main().catch(console.error);
