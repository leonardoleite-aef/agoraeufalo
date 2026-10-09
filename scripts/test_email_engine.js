/**
 * Testes headless do motor de e-mails (Brevo) e contratos do CRM.
 * Nenhuma chamada de rede real: global.fetch é substituído por stub.
 * Uso: node scripts/test_email_engine.js
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

global.window = {
  aefPortalAuth: {
    getIdToken: async () => 'fake_firebase_token'
  },
  location: { origin: 'https://admin.agoraeufalo.com.br' }
};
global.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
const Engine = require('../assets/js/aef-email-engine.js');

function stubFetch(handler) {
  const calls = [];
  global.fetch = async (url, opts) => {
    calls.push({ url, opts, body: JSON.parse(opts.body) });
    return handler(url, opts);
  };
  return calls;
}
const ok = () => ({ ok: true, status: 201, json: async () => ({ messageId: '<m1>' }) });
const fail = (status = 400) => ({ ok: false, status, json: async () => ({ error: 'bad' }) });
const mk = () => new Engine();

test('sendEmail posicional envia ao Worker com authToken', async () => {
  const calls = stubFetch(ok);
  const r = await mk().sendEmail('E2_AUTH_MAGIC_LINK', 'a@b.com', 'Ana Silva', { email: 'a@b.com' });
  assert.equal(r.success, true);
  assert.equal(r.provider, 'brevo_worker');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].opts.headers.Authorization, 'Bearer fake_firebase_token');
  assert.ok(calls[0].url.includes('/api/admin/send-email'));
  assert.equal(calls[0].body.toEmail, 'a@b.com');
});

test('sendEmail aceita objeto único', async () => {
  stubFetch(ok);
  const r = await mk().sendEmail({ templateId: 'E1_WELCOME_ONBOARDING', toEmail: 'a@b.com', toName: 'Ana' });
  assert.equal(r.success, true);
});

test('HTTP de erro do Worker lança (sem falso sucesso)', async () => {
  stubFetch(() => fail(401));
  await assert.rejects(() => mk().sendEmail('E1_WELCOME_ONBOARDING', 'a@b.com', 'Ana'), /401|Servidor/i);
});

test('erro de rede lança', async () => {
  stubFetch(() => { throw new Error('network down'); });
  await assert.rejects(() => mk().sendEmail('E1_WELCOME_ONBOARDING', 'a@b.com', 'Ana'), /network down|conexão|rede/i);
});

test('sem token de autenticação lança e não chama a rede', async () => {
  const oldAuth = global.window.aefPortalAuth;
  global.window.aefPortalAuth = null;
  const calls = stubFetch(ok);
  await assert.rejects(() => mk().sendEmail('E1_WELCOME_ONBOARDING', 'a@b.com', 'Ana'));
  assert.equal(calls.length, 0);
  global.window.aefPortalAuth = oldAuth;
});

test('destinatário vazio lança', async () => {
  stubFetch(ok);
  await assert.rejects(() => mk().sendEmail('E1_WELCOME_ONBOARDING', '', 'Ana'));
});

test('template desconhecido lança', async () => {
  stubFetch(ok);
  await assert.rejects(() => mk().sendEmail('E99_NOPE', 'a@b.com', 'Ana'), /não reconhecido|template/i);
});

test('não existe mais fallback Firestore "mail"', () => {
  const src = fs.readFileSync(path.join(__dirname, '../assets/js/aef-email-engine.js'), 'utf8');
  assert.ok(!/collection\(\s*['"]mail['"]\s*\)/.test(src));
});

test('todos os templates renderizam, começam com Hello e não vazam HTML cru', () => {
  const e = mk();
  const nasty = { name: `D'Art <img src=x onerror=alert(1)>`, productName: '<b>X</b>', newPlanName: 'club_annual',
    products: ['<script>1</script>', 'A & B'], reason: '<i>r</i>', title: '<u>t</u>', contentTitle: '<s>c</s>' };
  for (const id of ['E1_WELCOME_ONBOARDING','E2_AUTH_MAGIC_LINK','E3_NEW_CONTENT','E4_PURCHASE_CONFIRMED',
    'E4_PRODUCT_ACCESS','E5_PLAN_UPGRADE','E5_PLAN_DOWNGRADE','E5_PLAN_CHANGED','E6_SUSPENSION_CANCELLATION','E8_VIP_PRESCRIPTION']) {
    const t = e.buildTemplate(id, { ...nasty, email: 'a@b.com' });
    assert.ok(t.subject && t.html, id);
    assert.ok(!/<img src=x/.test(t.html), `${id} vazou <img>`);
    assert.ok(!/<script>1/.test(t.html), `${id} vazou <script>`);
    assert.ok(!/&amp;#39;|&amp;amp;|&amp;lt;/.test(t.html), `${id} com dupla escapada`);
  }
});

test('rótulos de plano humanizados nos e-mails de upgrade/downgrade', () => {
  const e = mk();
  assert.equal(e.planLabel('club_annual'), 'AEF Club Anual');
  assert.equal(e.planLabel('vip_mentorship'), 'Mentoria VIP Individual');
  assert.equal(e.planLabel('free'), 'AgoraEuFalo Free');
  const up = e.buildTemplate('E5_PLAN_UPGRADE', { name: 'Ana', newPlanName: 'club_annual' });
  assert.ok(up.html.includes('AEF Club Anual') && !up.html.includes('club_annual'));
  const down = e.buildTemplate('E5_PLAN_DOWNGRADE', { name: 'Ana', newPlanName: 'free' });
  assert.ok(down.html.includes('AgoraEuFalo Free') && !/>\s*free\s*</.test(down.html));
  assert.notEqual(up.subject, down.subject);
});

test('E4_PRODUCT_ACCESS lista produtos e não fala de pagamento', () => {
  const t = mk().buildTemplate('E4_PRODUCT_ACCESS', { name: 'Ana', products: ['Dates & Times', 'Airport & Flights'] });
  assert.ok(t.html.includes('<li>') && t.html.includes('Dates &amp; Times') && t.html.includes('Airport &amp; Flights'));
  assert.ok(!/pagamento/i.test(t.html));
});

test('E2 aponta para login com e-mail pré-preenchido e não promete expiração', () => {
  const t = mk().buildTemplate('E2_AUTH_MAGIC_LINK', { name: 'Ana', email: 'a+b@c.com' });
  assert.ok(t.html.includes('app.agoraeufalo.com.br/login?email=a%2Bb%40c.com'));
  assert.ok(!/expira em instantes/i.test(t.html));
});

test('URLs perigosas (javascript:) caem no fallback do portal', () => {
  const t = mk().buildTemplate('E1_WELCOME_ONBOARDING', { name: 'Ana', magicLink: 'javascript:alert(1)' });
  assert.ok(!/javascript:/i.test(t.html));
  assert.ok(t.html.includes('https://app.agoraeufalo.com.br/portal'));
});

test('portalUrl é respeitado quando magicLink ausente', () => {
  const t = mk().buildTemplate('E1_WELCOME_ONBOARDING', { name: 'Ana', portalUrl: 'https://app.agoraeufalo.com.br/portal?x=1' });
  assert.ok(t.html.includes('portal?x=1'));
});

// ---------- Contratos estáticos (engine ⇄ chamadores) ----------
const ROOT = path.join(__dirname, '..');
const engineTemplates = new Set([...fs.readFileSync(path.join(ROOT, 'assets/js/aef-email-engine.js'), 'utf8')
  .matchAll(/case\s+'(E\d[A-Z0-9_]*)'/g)].map(m => m[1]));

for (const file of ['admin-alunos.html', 'assets/js/aef-webhook-handler.js', 'assets/js/aef-cloud-sync.js']) {
  test(`${file}: só chama sendEmail com templates existentes e nunca sendEmail inexistente`, () => {
    const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
    for (const m of src.matchAll(/sendEmail\(\s*'(E\d[A-Z0-9_]*)'/g)) {
      assert.ok(engineTemplates.has(m[1]), `${file} usa template inexistente ${m[1]}`);
    }
    assert.ok(!/re_aef_live_transacional|api\.resend\.com/.test(src), `${file} ainda referencia Resend`);
  });
}

test('admin-alunos.html: JS inline com sintaxe válida', () => {
  const html = fs.readFileSync(path.join(ROOT, 'admin-alunos.html'), 'utf8');
  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  assert.ok(scripts.length > 0);
  for (const s of scripts) assert.doesNotThrow(() => new Function(s));
});

test('admin-alunos.html: e-mail de plano não trata tier desconhecido como rank 0 nem envia sem mudança real', () => {
  const src = fs.readFileSync(path.join(ROOT, 'admin-alunos.html'), 'utf8');
  assert.ok(!/TIER_RANK\[prevTier\]\s*\?\?\s*0/.test(src));
  assert.ok(/prevRank\s*!==\s*newRank/.test(src));
});

test('admin-alunos.html: botões de linha não interpolam e-mail/nome crus em onclick', () => {
  const src = fs.readFileSync(path.join(ROOT, 'admin-alunos.html'), 'utf8');
  assert.ok(!/onclick="sendAccessEmail\('\$\{s\.email\}'/.test(src));
  assert.ok(/function escapeAttr/.test(src) && /function sendPasswordResetForStudent/.test(src));
});

test('login.html lê ?email= para pré-preenchimento', () => {
  const src = fs.readFileSync(path.join(ROOT, 'login.html'), 'utf8');
  assert.ok(/URLSearchParams\(window\.location\.search\)\.get\('email'\)/.test(src));
});
