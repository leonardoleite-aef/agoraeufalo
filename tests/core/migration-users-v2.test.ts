/**
 * AgoraEuFalo Ecosystem - Firestore Users Migration V2 Test Suite (P0-3)
 * Professor Leonardo Leite
 * 
 * Validação rigorosa do script de migração auditável de usuários (scripts/migrate_users_v2.js):
 * - Idempotência (schemaVersion: 2)
 * - Conversão de campos legados (tier, subscription singular, enrolledProducts)
 * - Preservação de campos legados raiz
 * - Modo Dry-Run e Métricas de Auditoria
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Importação do módulo de migração CommonJS
// @ts-expect-error importação de script JS no test runner
import { migrateUserDocument, migrateUsers, parseRestDoc, toFirestoreFields } from '../../scripts/migrate_users_v2.js';

describe('Suite de Testes de Migração de Usuários Firestore V2 (P0-3)', () => {

  describe('Função de Migração Individual (migrateUserDocument)', () => {
    it('deve ignorar documentos que já possuem schemaVersion: 2 (idempotência)', () => {
      const v2User = {
        schemaVersion: 2,
        id: 'usr_already_v2',
        uid: 'usr_already_v2',
        email: 'aluno.v2@agoraeufalo.com.br',
        name: 'Aluno V2',
        role: 'student',
        subscriptions: [
          {
            id: 'sub_1',
            entitlement: 'member_pago',
            productId: '8460579',
            billingPeriod: 'annual',
            status: 'active',
            expiresAt: '2027-01-01T00:00:00Z',
            graceUntil: null,
            gateway: 'hotmart',
            lastEventId: 'evt_1',
            updatedAt: '2026-09-01T00:00:00Z'
          }
        ],
        purchasedProducts: [],
        legacyEntitlements: ['member_free'],
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: '2026-09-01T00:00:00Z'
      };

      const res = migrateUserDocument(v2User);
      assert.strictEqual(res.status, 'already_v2');
      assert.strictEqual(res.user.schemaVersion, 2);
      assert.deepStrictEqual(res.user.subscriptions, v2User.subscriptions);
    });

    it('deve migrar usuário legado com subscription singular e marcar schemaVersion: 2', () => {
      const legacyUser = {
        uid: 'user_hotmart_legacy',
        id: 'user_hotmart_legacy',
        email: 'legacy@gmail.com',
        name: 'Aluno Legado Hotmart',
        role: 'student',
        tier: 'club_annual',
        categories: ['member_free', 'member_pago'],
        subscription: {
          id: 'sub_singular_1',
          productId: '8460579',
          billingPeriod: 'annual',
          status: 'active',
          expiresAt: '2027-09-01T00:00:00Z',
          gateway: 'hotmart'
        },
        enrolledProducts: ['ms-legacy', 'english-quickstart']
      };

      const res = migrateUserDocument(legacyUser);
      assert.strictEqual(res.status, 'migrated');
      const u = res.user;

      // Validação do Contrato V2
      assert.strictEqual(u.schemaVersion, 2);
      assert.strictEqual(Array.isArray(u.subscriptions), true);
      assert.strictEqual(u.subscriptions.length, 1);
      assert.strictEqual(u.subscriptions[0].entitlement, 'member_pago');
      assert.strictEqual(u.subscriptions[0].productId, '8460579');

      // Preservação de campos legados raiz para retrocompatibilidade
      assert.strictEqual(u.tier, 'club_annual');
      assert.deepStrictEqual(u.categories, ['member_free', 'member_pago']);
      assert.strictEqual(u.subscription.id, 'sub_singular_1');

      // Backup em u.legacy
      assert.strictEqual(u.legacy.tier, 'club_annual');
      assert.strictEqual(u.legacy.subscription.id, 'sub_singular_1');
    });

    it('deve inferir subscription ativa para usuário com tier club_annual sem objeto subscription', () => {
      const legacyUser = {
        uid: 'user_tier_only',
        id: 'user_tier_only',
        email: 'tier_only@gmail.com',
        tier: 'club_annual',
        role: 'student'
      };

      const res = migrateUserDocument(legacyUser);
      assert.strictEqual(res.status, 'migrated');
      const u = res.user;

      assert.strictEqual(u.schemaVersion, 2);
      assert.strictEqual(u.subscriptions.length, 1);
      assert.strictEqual(u.subscriptions[0].entitlement, 'member_pago');
      assert.strictEqual(u.subscriptions[0].status, 'active');
      assert.strictEqual(u.subscriptions[0].productId, '8460579');
      assert.strictEqual(u.tier, 'club_annual');
    });

    it('deve mapear turma histórica ms_legacy para legado_1 em legacyEntitlements', () => {
      const msUser = {
        uid: 'user_ms',
        email: 'ms@agoraeufalo.com.br',
        tier: 'ms_legacy',
        categories: ['legado_1']
      };

      const res = migrateUserDocument(msUser);
      assert.strictEqual(res.status, 'migrated');
      const u = res.user;

      assert.strictEqual(u.schemaVersion, 2);
      assert.strictEqual(u.legacyEntitlements.includes('legado_1'), true);
      assert.strictEqual(u.legacyEntitlements.includes('member_free'), true);
      assert.strictEqual(u.tier, 'ms_legacy');
    });

    it('deve retornar status error com segurança ao receber payload nulo ou inválido', () => {
      const res = migrateUserDocument(null);
      assert.strictEqual(res.status, 'error');
      assert.strictEqual(res.error instanceof Error, true);
    });
  });

  describe('Serialização REST do Firestore (toFirestoreFields & parseRestDoc)', () => {
    it('deve converter documento REST em objeto JavaScript limpo', () => {
      const mockRestDoc = {
        name: 'projects/agoraeufalo-3463a/databases/(default)/documents/users/doc_test_123',
        fields: {
          email: { stringValue: 'teste@exemplo.com' },
          role: { stringValue: 'admin' },
          active: { booleanValue: true },
          count: { integerValue: '42' },
          tags: {
            arrayValue: {
              values: [
                { stringValue: 'tag1' },
                { stringValue: 'tag2' }
              ]
            }
          }
        }
      };

      const parsed = parseRestDoc(mockRestDoc);
      assert.strictEqual(parsed.id, 'doc_test_123');
      assert.strictEqual(parsed.uid, 'doc_test_123');
      assert.strictEqual(parsed.email, 'teste@exemplo.com');
      assert.strictEqual(parsed.role, 'admin');
      assert.strictEqual(parsed.active, true);
      assert.strictEqual(parsed.count, 42);
      assert.deepStrictEqual(parsed.tags, ['tag1', 'tag2']);
    });

    it('deve serializar objeto JS com arrays e mapas para schema REST do Firestore', () => {
      const jsObj = {
        id: 'usr_test', // id deve ser omitido dos campos
        schemaVersion: 2,
        email: 'teste@exemplo.com',
        subscriptions: [
          {
            id: 'sub_1',
            status: 'active',
            productId: '8460579'
          }
        ],
        legacyEntitlements: ['member_free', 'legado_1']
      };

      const fields = toFirestoreFields(jsObj);
      assert.strictEqual('id' in fields, false, 'campo id não deve ir nos fields REST');
      assert.strictEqual(fields.schemaVersion.integerValue, '2');
      assert.strictEqual(fields.email.stringValue, 'teste@exemplo.com');
      assert.strictEqual(fields.legacyEntitlements.arrayValue.values.length, 2);
      assert.strictEqual(fields.subscriptions.arrayValue.values.length, 1);
    });
  });

  describe('Execução em Lote com Métricas de Auditoria (migrateUsers)', () => {
    it('deve registrar métricas precisas em modo dry-run sem efetuar gravações', async () => {
      const mockBatch = [
        // 1. Já em V2 (deve incrementar alreadyMigrated)
        {
          id: 'u1',
          schemaVersion: 2,
          email: 'v2@agoraeufalo.com.br',
          subscriptions: [],
          legacyEntitlements: ['member_free']
        },
        // 2. Legado 1 (deve incrementar migratedSuccess)
        {
          id: 'u2',
          email: 'legado1@agoraeufalo.com.br',
          tier: 'club_annual',
          role: 'student'
        },
        // 3. Legado 2 (deve incrementar migratedSuccess)
        {
          id: 'u3',
          email: 'legado2@agoraeufalo.com.br',
          tier: 'ms_legacy',
          categories: ['legado_1']
        }
      ];

      const metrics = await migrateUsers({
        dryRun: true,
        verbose: false,
        customDocs: mockBatch
      });

      assert.strictEqual(metrics.totalRead, 3);
      assert.strictEqual(metrics.alreadyMigrated, 1);
      assert.strictEqual(metrics.migratedSuccess, 2);
      assert.strictEqual(metrics.failed, 0);
      assert.strictEqual(metrics.dryRun, true);
      assert.strictEqual(metrics.details.length, 3);
      assert.strictEqual(metrics.details[0].status, 'skipped_already_v2');
      assert.strictEqual(metrics.details[1].status, 'simulated_success');
      assert.strictEqual(metrics.details[2].status, 'simulated_success');
    });
  });

});
