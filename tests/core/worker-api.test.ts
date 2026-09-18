/**
 * AgoraEuFalo Ecosystem - Cloudflare Worker Edge API & Webhook Suite
 * Professor Leonardo Leite
 * 
 * Validação rigorosa dos 4 pilares de borda homologados pelo Chief Architect:
 * §3.1 Validação Criptográfica do ID Token (RS256 contra Google JWKS)
 * §3.2 Isolamento de Origem do Segredo Admin (X-ADMIN-SECRET bloqueado em browsers)
 * §3.3 Watermark de Ordenação por Assinatura (lastEventOccurredAt por assinatura/produto)
 * §3.4 Prevenção de Perda por Crash (status pending -> completed) & Claim-Once atômico
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

// @ts-expect-error importação de módulo JS no runner de testes
import worker, {
  handleClaimPreregistration,
  handleAdminUsers,
  handleHotmartWebhook,
  saveAtomicWebhookEvent,
  readFirestoreDoc,
  deleteFirestoreDoc,
  normalizeUserV2,
  clearJwksCache,
  verifyFirebaseIdToken
} from '../../cloudflare-worker/worker.js';

describe('Suite de Testes de Endpoints Edge & Webhook (Chief Architect Audit)', () => {
  const originalFetch = globalThis.fetch;
  const SECRET_HOTTOK = 'HOTTOK_TEST_SECRET_ABC123';
  const ADMIN_SECRET = 'AEF_ADMIN_SECRET_XYZ987';
  const mockEnv = {
    HOTMART_HOTTOK: SECRET_HOTTOK,
    ADMIN_SECRET: ADMIN_SECRET
  };

  // Setup de Criptografia Web Crypto para testes reais de RS256
  let testKeyPair: CryptoKeyPair;
  let testPublicJwk: any;

  function uint8ArrayToBase64Url(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  async function createSignedIdToken(payloadOverrides: Record<string, any> = {}, headerOverrides: Record<string, any> = {}) {
    const header = { alg: 'RS256', kid: testPublicJwk.kid, typ: 'JWT', ...headerOverrides };
    const nowSec = Math.floor(Date.now() / 1000);
    const payload = {
      iss: 'https://securetoken.google.com/agoraeufalo-3463a',
      aud: 'agoraeufalo-3463a',
      sub: 'uid_test_123',
      email: 'aluno@agoraeufalo.com.br',
      email_verified: true,
      iat: nowSec - 10,
      exp: nowSec + 3600,
      ...payloadOverrides
    };

    const headerB64 = uint8ArrayToBase64Url(new TextEncoder().encode(JSON.stringify(header)));
    const payloadB64 = uint8ArrayToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
    const dataToSign = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', testKeyPair.privateKey, dataToSign);
    const signatureB64 = uint8ArrayToBase64Url(new Uint8Array(signature));

    return `${headerB64}.${payloadB64}.${signatureB64}`;
  }

  beforeEach(async () => {
    clearJwksCache();
    testKeyPair = await crypto.subtle.generateKey(
      {
        name: 'RSASSA-PKCS1-v1_5',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256'
      },
      true,
      ['sign', 'verify']
    );
    const exported = await crypto.subtle.exportKey('jwk', testKeyPair.publicKey);
    testPublicJwk = {
      ...exported,
      kid: 'test_key_kid_2026',
      alg: 'RS256',
      use: 'sig'
    };
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    clearJwksCache();
  });

  // ==========================================================================
  // 1. VALIDAÇÃO CRIPTOGRÁFICA DO ID TOKEN (§3.1)
  // ==========================================================================
  describe('§3.1 Validação Criptográfica do ID Token no Worker (RS256 & Google JWKS)', () => {
    it('deve rejeitar com HTTP 401 se token for omitido em /api/claim-preregistration', async () => {
      const req = new Request('https://api.agoraeufalo.com.br/api/claim-preregistration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: 'uid_123', email: 'teste@exemplo.com' })
      });

      const res = await worker.fetch(req, mockEnv, {});
      assert.strictEqual(res.status, 401);
      const data = await res.json() as { error: string };
      assert.strictEqual(data.error, 'Unauthorized');
    });

    it('deve rejeitar com HTTP 401 se assinatura criptográfica for adulterada', async () => {
      const validToken = await createSignedIdToken();
      const tamperedToken = validToken.substring(0, validToken.length - 8) + 'ABCDEFGH';

      globalThis.fetch = async (input: RequestInfo | URL): Promise<Response> => {
        const urlStr = String(input);
        if (urlStr.includes('securetoken@system.gserviceaccount.com')) {
          return new Response(JSON.stringify({ keys: [testPublicJwk] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response('Not Found', { status: 404 });
      };

      const req = new Request('https://api.agoraeufalo.com.br/api/claim-preregistration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tamperedToken}`
        }
      });

      const res = await worker.fetch(req, mockEnv, {});
      assert.strictEqual(res.status, 401);
    });

    it('deve rejeitar com HTTP 401 se issuer não for https://securetoken.google.com/agoraeufalo-3463a', async () => {
      const invalidIssToken = await createSignedIdToken({ iss: 'https://malicious-issuer.com' });

      globalThis.fetch = async (input: RequestInfo | URL): Promise<Response> => {
        if (String(input).includes('securetoken@system.gserviceaccount.com')) {
          return new Response(JSON.stringify({ keys: [testPublicJwk] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response('Not Found', { status: 404 });
      };

      const req = new Request('https://api.agoraeufalo.com.br/api/claim-preregistration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${invalidIssToken}`
        }
      });

      const res = await worker.fetch(req, mockEnv, {});
      assert.strictEqual(res.status, 401);
    });

    it('deve rejeitar com HTTP 401 se audience for diferente de agoraeufalo-3463a', async () => {
      const invalidAudToken = await createSignedIdToken({ aud: 'wrong-project-id' });

      globalThis.fetch = async (input: RequestInfo | URL): Promise<Response> => {
        if (String(input).includes('securetoken@system.gserviceaccount.com')) {
          return new Response(JSON.stringify({ keys: [testPublicJwk] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response('Not Found', { status: 404 });
      };

      const req = new Request('https://api.agoraeufalo.com.br/api/claim-preregistration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${invalidAudToken}`
        }
      });

      const res = await worker.fetch(req, mockEnv, {});
      assert.strictEqual(res.status, 401);
    });

    it('deve rejeitar com HTTP 401 se o token estiver expirado', async () => {
      const expiredToken = await createSignedIdToken({ exp: Math.floor(Date.now() / 1000) - 100 });

      globalThis.fetch = async (input: RequestInfo | URL): Promise<Response> => {
        if (String(input).includes('securetoken@system.gserviceaccount.com')) {
          return new Response(JSON.stringify({ keys: [testPublicJwk] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response('Not Found', { status: 404 });
      };

      const req = new Request('https://api.agoraeufalo.com.br/api/claim-preregistration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${expiredToken}`
        }
      });

      const res = await worker.fetch(req, mockEnv, {});
      assert.strictEqual(res.status, 401);
    });

    it('deve rejeitar com HTTP 401 se email_verified não for true', async () => {
      const unverifiedEmailToken = await createSignedIdToken({ email_verified: false });

      globalThis.fetch = async (input: RequestInfo | URL): Promise<Response> => {
        if (String(input).includes('securetoken@system.gserviceaccount.com')) {
          return new Response(JSON.stringify({ keys: [testPublicJwk] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response('Not Found', { status: 404 });
      };

      const req = new Request('https://api.agoraeufalo.com.br/api/claim-preregistration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${unverifiedEmailToken}`
        }
      });

      const res = await worker.fetch(req, mockEnv, {});
      assert.strictEqual(res.status, 401);
    });

    it('deve aceitar com HTTP 200 ID token validado criptograficamente com RS256', async () => {
      const email = 'aluno.legado@exemplo.com';
      const uid = 'uid_crypto_verified_123';
      const legacyId = email.replace(/[^a-zA-Z0-9]/g, '_');
      const validToken = await createSignedIdToken({ sub: uid, email: email, email_verified: true });

      globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const urlStr = String(input);
        if (urlStr.includes('securetoken@system.gserviceaccount.com')) {
          return new Response(JSON.stringify({ keys: [testPublicJwk] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        if (urlStr.includes(`/documents/users/${legacyId}`)) {
          return new Response(JSON.stringify({
            name: `projects/agoraeufalo-3463a/databases/(default)/documents/users/${legacyId}`,
            fields: {
              email: { stringValue: email },
              tier: { stringValue: 'club_annual' },
              categories: { arrayValue: { values: [{ stringValue: 'magic_stories' }] } }
            }
          }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        if (init && init.method === 'PATCH') {
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response('Not Found', { status: 404 });
      };

      const req = new Request('https://api.agoraeufalo.com.br/api/claim-preregistration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${validToken}`
        }
      });

      const res = await worker.fetch(req, mockEnv, {});
      assert.strictEqual(res.status, 200);
      const data = await res.json() as { success: boolean; claimed: boolean; user: any };
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.claimed, true);
      assert.strictEqual(data.user.uid, uid);
    });
  });

  // ==========================================================================
  // 2. ISOLAMENTO DE ORIGEM DO SEGREDO ADMIN (§3.2)
  // ==========================================================================
  describe('§3.2 Isolamento de Origem do Segredo Admin (X-ADMIN-SECRET)', () => {
    it('deve rejeitar com HTTP 403 Forbidden se requisição web/browser (com Origin) usar X-ADMIN-SECRET', async () => {
      const req = new Request('https://api.agoraeufalo.com.br/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://admin.agoraeufalo.com.br',
          'X-ADMIN-SECRET': ADMIN_SECRET
        },
        body: JSON.stringify({ userId: 'usr_1', userData: { tier: 'vip' } })
      });

      const res = await worker.fetch(req, mockEnv, {});
      assert.strictEqual(res.status, 403);
      const data = await res.json() as { error: string; message: string };
      assert.strictEqual(data.error, 'Forbidden');
      assert.ok(data.message.includes('X-ADMIN-SECRET'));
    });

    it('deve rejeitar com HTTP 403 Forbidden se requisição web (Sec-Fetch-Site) usar X-ADMIN-SECRET', async () => {
      const req = new Request('https://api.agoraeufalo.com.br/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Sec-Fetch-Site': 'same-origin',
          'X-ADMIN-SECRET': ADMIN_SECRET
        },
        body: JSON.stringify({ userId: 'usr_1', userData: { tier: 'vip' } })
      });

      const res = await worker.fetch(req, mockEnv, {});
      assert.strictEqual(res.status, 403);
    });

    it('deve autorizar requisição web/browser exclusivamente via Bearer ID Token com privilégio de admin', async () => {
      const adminToken = await createSignedIdToken({
        email: 'selexenglish@gmail.com',
        admin: true,
        role: 'admin'
      });

      globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const urlStr = String(input);
        if (urlStr.includes('securetoken@system.gserviceaccount.com')) {
          return new Response(JSON.stringify({ keys: [testPublicJwk] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        if (init && init.method === 'PATCH') {
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response('Not Found', { status: 404 });
      };

      const req = new Request('https://api.agoraeufalo.com.br/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://admin.agoraeufalo.com.br',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ userId: 'aluno_promovido', userData: { tier: 'vip' } })
      });

      const res = await worker.fetch(req, mockEnv, {});
      assert.strictEqual(res.status, 200);
      const data = await res.json() as { success: boolean; user: any };
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.user.tier, 'vip');
    });

    it('deve autorizar scripts/CLI server-to-server (sem Origin/Sec-Fetch-Site) via X-ADMIN-SECRET', async () => {
      globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        if (init && init.method === 'PATCH') {
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response('Not Found', { status: 404 });
      };

      const req = new Request('https://api.agoraeufalo.com.br/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-ADMIN-SECRET': ADMIN_SECRET
        },
        body: JSON.stringify({ userId: 'aluno_cli_update', userData: { tier: 'club_annual' } })
      });

      const res = await worker.fetch(req, mockEnv, {});
      assert.strictEqual(res.status, 200);
      const data = await res.json() as { success: boolean };
      assert.strictEqual(data.success, true);
    });
  });

  // ==========================================================================
  // 3. WATERMARK DE ORDENAÇÃO POR ASSINATURA (§3.3)
  // ==========================================================================
  describe('§3.3 Watermark de Ordenação por Assinatura / Produto', () => {
    it('NÃO deve descartar evento se occurredAt for anterior a updatedAt global alterado por admin, mas sem watermark anterior', async () => {
      const email = 'aluno.admin.edit@exemplo.com';
      const studentId = email.replace(/[^a-zA-Z0-9]/g, '_');
      const eventId = 'wh_watermark_pass_1';

      // Aluno teve perfil editado por admin às 15:00 (updatedAt: 15:00)
      // O evento da Hotmart ocorreu às 14:00, mas a assinatura não tinha evento prévio
      globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const urlStr = String(input);
        if (urlStr.includes(`/documents/users/${studentId}`) && (!init || init.method === 'GET' || !init.method)) {
          return new Response(JSON.stringify({
            name: `projects/agoraeufalo-3463a/databases/(default)/documents/users/${studentId}`,
            fields: {
              email: { stringValue: email },
              updatedAt: { stringValue: '2026-09-18T15:00:00.000Z' }, // alterado por admin
              subscriptions: { arrayValue: { values: [] } } // sem watermark de assinatura
            }
          }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      };

      const req = new Request('https://api.agoraeufalo.com.br/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-HOTMART-HOTTOK': SECRET_HOTTOK
        },
        body: JSON.stringify({
          id: eventId,
          event: 'PURCHASE_APPROVED',
          buyer: { email: email, name: 'Aluno Admin Edit' },
          purchase: { transaction: 'tx_wat_1', order_date: '2026-09-18T14:00:00.000Z' },
          product: { id: '8460579', name: 'AgoraEuFalo Club' }
        })
      });

      const res = await worker.fetch(req, mockEnv, {});
      assert.strictEqual(res.status, 200);
      const data = await res.json() as { received: boolean; status?: string };
      assert.strictEqual(data.received, true);
      assert.notStrictEqual(data.status, 'out_of_order_ignored'); // NÃO descartado!
    });

    it('DEVE descartar como out_of_order_ignored se occurredAt for anterior ao lastEventOccurredAt daquela assinatura', async () => {
      const email = 'aluno.sub.stale@exemplo.com';
      const studentId = email.replace(/[^a-zA-Z0-9]/g, '_');
      const eventId = 'wh_watermark_stale_1';
      const subCode = 'SUB_HOTMART_123';

      globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const urlStr = String(input);
        if (urlStr.includes(`/documents/users/${studentId}`) && (!init || init.method === 'GET' || !init.method)) {
          return new Response(JSON.stringify({
            name: `projects/agoraeufalo-3463a/databases/(default)/documents/users/${studentId}`,
            fields: {
              email: { stringValue: email },
              subscriptions: {
                arrayValue: {
                  values: [
                    {
                      mapValue: {
                        fields: {
                          id: { stringValue: subCode },
                          productId: { stringValue: '8460579' },
                          lastEventOccurredAt: { stringValue: '2026-09-18T16:00:00.000Z' } // watermark da assinatura: 16:00
                        }
                      }
                    }
                  ]
                }
              }
            }
          }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      };

      // Evento que ocorreu às 14:00 (anterior à watermark de 16:00 da assinatura)
      const req = new Request('https://api.agoraeufalo.com.br/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-HOTMART-HOTTOK': SECRET_HOTTOK
        },
        body: JSON.stringify({
          id: eventId,
          event: 'PURCHASE_APPROVED',
          buyer: { email: email, name: 'Aluno Sub Stale' },
          subscription: { subscriber_code: subCode },
          purchase: { transaction: 'tx_wat_old', order_date: '2026-09-18T14:00:00.000Z' },
          product: { id: '8460579', name: 'AgoraEuFalo Club' }
        })
      });

      const res = await worker.fetch(req, mockEnv, {});
      assert.strictEqual(res.status, 200);
      const data = await res.json() as { received: boolean; status: string };
      assert.strictEqual(data.received, true);
      assert.strictEqual(data.status, 'out_of_order_ignored'); // Descartado corretamente!
    });
  });

  // ==========================================================================
  // 4. PREVENÇÃO DE PERDA POR CRASH & CLAIM-ONCE ATÔMICO (§3.4)
  // ==========================================================================
  describe('§3.4 Prevenção de Perda por Crash & Claim-Once Atômico', () => {
    it('deve gravar webhook_events inicialmente com status: "pending" e atualizar para "completed" após gravação', async () => {
      const eventId = 'wh_crash_test_1';
      const eventsWritten: any[] = [];

      globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const urlStr = String(input);
        if (urlStr.includes(`/documents/webhook_events/${eventId}`) && init && init.method === 'PATCH') {
          eventsWritten.push(JSON.parse(String(init.body)));
        }
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      };

      const req = new Request('https://api.agoraeufalo.com.br/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-HOTMART-HOTTOK': SECRET_HOTTOK
        },
        body: JSON.stringify({
          id: eventId,
          event: 'PURCHASE_APPROVED',
          buyer: { email: 'comprador.crash@exemplo.com', name: 'Comprador' },
          purchase: { transaction: 'tx_crash_1', order_date: '2026-09-18T10:00:00Z' },
          product: { id: '8460579', name: 'AgoraEuFalo Club' }
        })
      });

      const res = await worker.fetch(req, mockEnv, {});
      assert.strictEqual(res.status, 200);
      assert.ok(eventsWritten.length >= 2);
      // Primeiro registro: status pending
      assert.strictEqual(eventsWritten[0].fields.status.stringValue, 'pending');
      // Segundo registro (após gravação no aluno): status completed
      assert.strictEqual(eventsWritten[1].fields.status.stringValue, 'completed');
    });

    it('deve rejeitar com HTTP 409 Conflict se pré-registro já foi vinculado a outro UID (Claim-Once)', async () => {
      const email = 'aluno.duplicado@exemplo.com';
      const newUid = 'uid_tentativa_ladra_999';
      const legacyId = email.replace(/[^a-zA-Z0-9]/g, '_');
      const token = await createSignedIdToken({ sub: newUid, email: email, email_verified: true });

      globalThis.fetch = async (input: RequestInfo | URL): Promise<Response> => {
        const urlStr = String(input);
        if (urlStr.includes('securetoken@system.gserviceaccount.com')) {
          return new Response(JSON.stringify({ keys: [testPublicJwk] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        // Retorna pré-registro já vinculado a outro UID
        if (urlStr.includes(`/documents/users/${legacyId}`)) {
          return new Response(JSON.stringify({
            name: `projects/agoraeufalo-3463a/databases/(default)/documents/users/${legacyId}`,
            fields: {
              email: { stringValue: email },
              linkedUid: { stringValue: 'uid_original_legitimo_111' }, // já vinculado!
              tier: { stringValue: 'club_annual' }
            }
          }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response('Not Found', { status: 404 });
      };

      const req = new Request('https://api.agoraeufalo.com.br/api/claim-preregistration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const res = await worker.fetch(req, mockEnv, {});
      assert.strictEqual(res.status, 409);
      const data = await res.json() as { error: string; message: string };
      assert.strictEqual(data.error, 'Conflict');
      assert.ok(data.message.includes('uid_original_legitimo_111'));
    });

    it('deve aceitar de forma idempotente se o MESMO UID tentar reivindicar novamente', async () => {
      const email = 'aluno.mesmo.uid@exemplo.com';
      const sameUid = 'uid_mesmo_aluno_777';
      const legacyId = email.replace(/[^a-zA-Z0-9]/g, '_');
      const token = await createSignedIdToken({ sub: sameUid, email: email, email_verified: true });

      globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const urlStr = String(input);
        if (urlStr.includes('securetoken@system.gserviceaccount.com')) {
          return new Response(JSON.stringify({ keys: [testPublicJwk] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        if (urlStr.includes(`/documents/users/${legacyId}`)) {
          return new Response(JSON.stringify({
            name: `projects/agoraeufalo-3463a/databases/(default)/documents/users/${legacyId}`,
            fields: {
              email: { stringValue: email },
              linkedUid: { stringValue: sameUid } // já vinculado a ele mesmo!
            }
          }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        if (init && init.method === 'PATCH') {
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response('Not Found', { status: 404 });
      };

      const req = new Request('https://api.agoraeufalo.com.br/api/claim-preregistration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const res = await worker.fetch(req, mockEnv, {});
      assert.strictEqual(res.status, 200);
      const data = await res.json() as { success: boolean };
      assert.strictEqual(data.success, true);
    });

    it('deve rejeitar com HTTP 409 Conflict se precondição atômica falhar por concorrência de vinculação (Verificação 1.6)', async () => {
      const email = 'aluno.concorrente@exemplo.com';
      const uid1 = 'uid_vencedor_111';
      const uid2 = 'uid_perdedor_222';
      const legacyId = email.replace(/[^a-zA-Z0-9]/g, '_');
      const token = await createSignedIdToken({ sub: uid2, email: email, email_verified: true });

      let patchAttempts = 0;

      globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const urlStr = String(input);
        if (urlStr.includes('securetoken@system.gserviceaccount.com')) {
          return new Response(JSON.stringify({ keys: [testPublicJwk] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        // Primeira leitura: parece desvinculado
        if (urlStr.includes(`/documents/users/${legacyId}`) && (!init || init.method === 'GET' || !init.method)) {
          if (patchAttempts === 0) {
            return new Response(JSON.stringify({
              name: `projects/agoraeufalo-3463a/databases/(default)/documents/users/${legacyId}`,
              updateTime: '2026-09-18T10:00:00.000Z',
              fields: {
                email: { stringValue: email },
                tier: { stringValue: 'club_annual' }
              }
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          } else {
            // Releitura após falha de precondição: documento foi vinculado pelo UID concorrente
            return new Response(JSON.stringify({
              name: `projects/agoraeufalo-3463a/databases/(default)/documents/users/${legacyId}`,
              updateTime: '2026-09-18T10:00:01.000Z',
              fields: {
                email: { stringValue: email },
                linkedUid: { stringValue: uid1 },
                tier: { stringValue: 'club_annual' }
              }
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
        }
        // PATCH com precondição falha com status FAILED_PRECONDITION
        if (init && init.method === 'PATCH' && urlStr.includes(`/documents/users/${legacyId}`)) {
          patchAttempts++;
          return new Response(JSON.stringify({
            error: {
              code: 400,
              message: "The document's update_time does not match the precondition.",
              status: "FAILED_PRECONDITION"
            }
          }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response('Not Found', { status: 404 });
      };

      const req = new Request('https://api.agoraeufalo.com.br/api/claim-preregistration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const res = await worker.fetch(req, mockEnv, {});
      assert.strictEqual(res.status, 409);
      const data = await res.json() as { error: string; message: string };
      assert.strictEqual(data.error, 'Conflict');
      assert.ok(data.message.includes(uid1));
    });

    it('deve executar retry transparente com sucesso se precondição falhar mas linkedUid continuar livre (Nota 2.b)', async () => {
      const email = 'aluno.retry.transparente@exemplo.com';
      const uid = 'uid_retry_sucesso_333';
      const legacyId = email.replace(/[^a-zA-Z0-9]/g, '_');
      const token = await createSignedIdToken({ sub: uid, email: email, email_verified: true });

      let patchAttempts = 0;

      globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const urlStr = String(input);
        if (urlStr.includes('securetoken@system.gserviceaccount.com')) {
          return new Response(JSON.stringify({ keys: [testPublicJwk] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        if (urlStr.includes(`/documents/users/${legacyId}`) && (!init || init.method === 'GET' || !init.method)) {
          // Na primeira leitura updateTime = T0, na segunda (após conflito benigno) updateTime = T1, mas linkedUid ainda vazio!
          return new Response(JSON.stringify({
            name: `projects/agoraeufalo-3463a/databases/(default)/documents/users/${legacyId}`,
            updateTime: patchAttempts === 0 ? '2026-09-18T10:00:00.000Z' : '2026-09-18T10:00:05.000Z',
            fields: {
              email: { stringValue: email },
              tier: { stringValue: 'club_annual' }
              // linkedUid NÃO está definido (livre!)
            }
          }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        if (init && init.method === 'PATCH') {
          patchAttempts++;
          if (patchAttempts === 1 && urlStr.includes(`/documents/users/${legacyId}`)) {
            // Primeira tentativa de vincular falha com FAILED_PRECONDITION (ex: admin atualizou doc simultaneamente)
            return new Response(JSON.stringify({
              error: {
                code: 400,
                message: "The document's update_time does not match the precondition.",
                status: "FAILED_PRECONDITION"
              }
            }), { status: 400, headers: { 'Content-Type': 'application/json' } });
          }
          // Segunda tentativa (retry com novo updateTime) e escrita no users/{uid} sucedem!
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response('Not Found', { status: 404 });
      };

      const req = new Request('https://api.agoraeufalo.com.br/api/claim-preregistration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const res = await worker.fetch(req, mockEnv, {});
      assert.strictEqual(res.status, 200);
      const data = await res.json() as { success: boolean; claimed: boolean; user: any };
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.claimed, true);
      assert.strictEqual(data.user.uid, uid);
      assert.ok(patchAttempts >= 2, 'Deve ter realizado retry na escrita');
    });
  });
});
