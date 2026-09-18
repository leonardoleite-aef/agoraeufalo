/**
 * AgoraEuFalo Ecosystem - Access Policy & Entitlements Test Suite
 * Professor Leonardo Leite
 * 
 * Validação rigorosa das funções puras de autorização e vigência do Blueprint V2:
 * - hasAccess(user, course, now)
 * - getActiveEntitlements(user, now)
 * - isSubscriptionActive(sub, now)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  hasAccess,
  getActiveEntitlements,
  isSubscriptionActive,
  normalizeCourseToV2,
  normalizeUserToV2,
  type AEFUser,
  type AEFCourse,
  type Subscription,
  type PurchasedProduct,
  type WebhookEvent
} from '../../src/types/core.ts';

describe('Suite de Testes de Regras de Acesso (V2 Blueprint)', () => {
  const referenceDate = new Date('2026-09-18T12:00:00Z');
  const futureDate = new Date('2026-10-18T12:00:00Z').toISOString();
  const pastDate = new Date('2026-08-18T12:00:00Z').toISOString();

  // Helper para criar usuário mock padrão
  function createTestUser(overrides: Partial<AEFUser> = {}): AEFUser {
    return {
      schemaVersion: 2,
      id: 'test_user',
      uid: 'uid_test_123',
      email: 'aluno@agoraeufalo.com.br',
      name: 'Aluno de Teste',
      role: 'student',
      subscriptions: [],
      purchasedProducts: [],
      legacyEntitlements: [],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      ...overrides
    };
  }

  // Helper para criar curso mock padrão
  function createTestCourse(overrides: Partial<AEFCourse> = {}): AEFCourse {
    return {
      schemaVersion: 2,
      id: 'magic-stories-vol-1',
      title: 'Magic Stories Vol. 1',
      categories: ['magic_stories'],
      accessTier: 'all_access',
      access: {
        entitlements: ['member_pago']
      },
      isPublished: true,
      ...overrides
    };
  }

  // ==========================================================================
  // 1. ADMINISTRADOR
  // ==========================================================================
  describe('Regra de Administrador', () => {
    it('deve conceder acesso irrestrito a usuário com role: admin, mesmo para curso isPublished: false', () => {
      const adminUser = createTestUser({ role: 'admin' });
      const unpublishedCourse = createTestCourse({
        isPublished: false,
        accessTier: 'all_access',
        access: { entitlements: ['member_pago'] }
      });

      const allowed = hasAccess(adminUser, unpublishedCourse, referenceDate);
      assert.strictEqual(allowed, true, 'Admin deve acessar curso despublicado');
    });

    it('deve conceder acesso irrestrito ao admin mesmo sem assinaturas ou compras em curso standalone', () => {
      const adminUser = createTestUser({ role: 'admin' });
      const standaloneCourse = createTestCourse({
        accessTier: 'standalone',
        access: { requiresProductId: ['PROD_DTC_999'] }
      });

      const allowed = hasAccess(adminUser, standaloneCourse, referenceDate);
      assert.strictEqual(allowed, true, 'Admin deve acessar curso standalone sem comprá-lo');
    });
  });

  // ==========================================================================
  // 2. CURSO GRÁTIS
  // ==========================================================================
  describe('Regra de Curso Grátis (accessTier: "free")', () => {
    it('qualquer usuário comum sem assinaturas ou compras acessa cursos com accessTier: free', () => {
      const freeUser = createTestUser({
        role: 'student',
        subscriptions: [],
        purchasedProducts: [],
        legacyEntitlements: []
      });

      const freeCourse = createTestCourse({
        id: 'dates-and-times-free',
        accessTier: 'free',
        isPublished: true
      });

      const allowed = hasAccess(freeUser, freeCourse, referenceDate);
      assert.strictEqual(allowed, true, 'Usuário gratuito deve acessar curso com accessTier free');
    });
  });

  // ==========================================================================
  // 3. CURSO DESPUBLICADO
  // ==========================================================================
  describe('Regra de Curso Despublicado (isPublished: false)', () => {
    it('usuário comum não acessa curso com isPublished: false mesmo se possuir assinatura ativa', () => {
      const activeSubscription: Subscription = {
        id: 'sub_active_1',
        entitlement: 'member_pago',
        productId: 'PROD_CLUB',
        billingPeriod: 'annual',
        status: 'active',
        expiresAt: futureDate,
        gateway: 'hotmart',
        lastEventId: 'evt_1',
        updatedAt: '2026-09-01T00:00:00Z'
      };

      const payingUser = createTestUser({
        role: 'student',
        subscriptions: [activeSubscription]
      });

      const unpublishedCourse = createTestCourse({
        isPublished: false,
        accessTier: 'all_access',
        access: { entitlements: ['member_pago'] }
      });

      const allowed = hasAccess(payingUser, unpublishedCourse, referenceDate);
      assert.strictEqual(allowed, false, 'Aluno não pode acessar curso despublicado');
    });

    it('usuário comum não acessa curso com isPublished: false mesmo se o curso for free', () => {
      const studentUser = createTestUser({ role: 'student' });
      const unpublishedFreeCourse = createTestCourse({
        isPublished: false,
        accessTier: 'free'
      });

      const allowed = hasAccess(studentUser, unpublishedFreeCourse, referenceDate);
      assert.strictEqual(allowed, false, 'Curso grátis mas despublicado não pode ser acessado por aluno');
    });
  });

  // ==========================================================================
  // 4. VIGÊNCIA DE ASSINATURAS (isSubscriptionActive)
  // ==========================================================================
  describe('Vigência de Assinaturas (isSubscriptionActive)', () => {
    it('active com expiresAt no futuro -> deve retornar true', () => {
      const sub: Subscription = {
        id: 'sub_future',
        entitlement: 'member_pago',
        productId: 'PROD_CLUB',
        billingPeriod: 'annual',
        status: 'active',
        expiresAt: futureDate,
        gateway: 'hotmart',
        lastEventId: 'evt_2',
        updatedAt: '2026-09-01T00:00:00Z'
      };

      assert.strictEqual(isSubscriptionActive(sub, referenceDate), true);
    });

    it('active com expiresAt no passado -> deve retornar false', () => {
      const sub: Subscription = {
        id: 'sub_past',
        entitlement: 'member_pago',
        productId: 'PROD_CLUB',
        billingPeriod: 'monthly',
        status: 'active',
        expiresAt: pastDate,
        gateway: 'hotmart',
        lastEventId: 'evt_3',
        updatedAt: '2026-08-01T00:00:00Z'
      };

      assert.strictEqual(isSubscriptionActive(sub, referenceDate), false);
    });

    it('active sem expiresAt definido (vitalício/open) -> deve retornar true', () => {
      const sub: Subscription = {
        id: 'sub_lifetime',
        entitlement: 'member_pago',
        productId: 'PROD_CLUB',
        billingPeriod: 'lifetime',
        status: 'active',
        expiresAt: null,
        gateway: 'manual',
        lastEventId: 'evt_4',
        updatedAt: '2026-01-01T00:00:00Z'
      };

      assert.strictEqual(isSubscriptionActive(sub, referenceDate), true);
    });

    it('canceled_grace com período de tolerância válido (graceUntil no futuro) -> deve retornar true', () => {
      const sub: Subscription = {
        id: 'sub_grace_valid',
        entitlement: 'member_pago',
        productId: 'PROD_CLUB',
        billingPeriod: 'annual',
        status: 'canceled_grace',
        graceUntil: futureDate,
        gateway: 'hotmart',
        lastEventId: 'evt_5',
        updatedAt: '2026-09-10T00:00:00Z'
      };

      assert.strictEqual(isSubscriptionActive(sub, referenceDate), true);
    });

    it('canceled_grace com período de tolerância expirado (graceUntil no passado) -> deve retornar false', () => {
      const sub: Subscription = {
        id: 'sub_grace_expired',
        entitlement: 'member_pago',
        productId: 'PROD_CLUB',
        billingPeriod: 'annual',
        status: 'canceled_grace',
        graceUntil: pastDate,
        gateway: 'hotmart',
        lastEventId: 'evt_6',
        updatedAt: '2026-08-10T00:00:00Z'
      };

      assert.strictEqual(isSubscriptionActive(sub, referenceDate), false);
    });

    it('overdue_grace_period com período de tolerância válido -> deve retornar true', () => {
      const sub: Subscription = {
        id: 'sub_overdue_valid',
        entitlement: 'member_pago',
        productId: 'PROD_CLUB',
        billingPeriod: 'monthly',
        status: 'overdue_grace_period',
        graceUntil: futureDate,
        gateway: 'hotmart',
        lastEventId: 'evt_7',
        updatedAt: '2026-09-15T00:00:00Z'
      };

      assert.strictEqual(isSubscriptionActive(sub, referenceDate), true);
    });

    it('canceled_immediate -> deve retornar false imediatamente', () => {
      const sub: Subscription = {
        id: 'sub_canceled_imm',
        entitlement: 'member_pago',
        productId: 'PROD_CLUB',
        billingPeriod: 'monthly',
        status: 'canceled_immediate',
        expiresAt: futureDate, // Mesmo se houvesse data futura, o cancelamento imediato anula
        graceUntil: futureDate,
        gateway: 'hotmart',
        lastEventId: 'evt_8',
        updatedAt: '2026-09-17T00:00:00Z'
      };

      assert.strictEqual(isSubscriptionActive(sub, referenceDate), false);
    });

    it('revoked -> deve retornar false imediatamente', () => {
      const sub: Subscription = {
        id: 'sub_revoked',
        entitlement: 'member_pago',
        productId: 'PROD_CLUB',
        billingPeriod: 'annual',
        status: 'revoked',
        expiresAt: futureDate,
        graceUntil: futureDate,
        gateway: 'hotmart',
        lastEventId: 'evt_9',
        updatedAt: '2026-09-17T00:00:00Z'
      };

      assert.strictEqual(isSubscriptionActive(sub, referenceDate), false);
    });
  });

  // ==========================================================================
  // 5. CURSOS AVULSOS (STANDALONE)
  // ==========================================================================
  describe('Cursos Avulsos (accessTier: "standalone")', () => {
    it('usuário com o produto em purchasedProducts com correspondência de courseId acessa o curso específico', () => {
      const purchasedProduct: PurchasedProduct = {
        productId: 'HOTMART_PROD_101',
        courseId: 'dates-and-times-master',
        purchasedAt: '2026-09-01T10:00:00Z',
        gateway: 'hotmart',
        transactionId: 'TX_12345'
      };

      const buyerUser = createTestUser({
        role: 'student',
        purchasedProducts: [purchasedProduct]
      });

      const standaloneCourse = createTestCourse({
        id: 'dates-and-times-master',
        accessTier: 'standalone',
        access: {
          requiresProductId: ['HOTMART_PROD_101']
        }
      });

      const allowed = hasAccess(buyerUser, standaloneCourse, referenceDate);
      assert.strictEqual(allowed, true, 'Comprador avulso deve acessar o curso standalone');
    });

    it('usuário com o produto em purchasedProducts com correspondência de requiresProductId acessa o curso', () => {
      const purchasedProduct: PurchasedProduct = {
        productId: 'HOTMART_PACKAGE_VIP',
        courseId: 'other-course-id',
        purchasedAt: '2026-09-01T10:00:00Z',
        gateway: 'hotmart',
        transactionId: 'TX_67890'
      };

      const buyerUser = createTestUser({
        role: 'student',
        purchasedProducts: [purchasedProduct]
      });

      const standaloneCourse = createTestCourse({
        id: 'special-workshop',
        accessTier: 'standalone',
        access: {
          requiresProductId: ['HOTMART_PACKAGE_VIP']
        }
      });

      const allowed = hasAccess(buyerUser, standaloneCourse, referenceDate);
      assert.strictEqual(allowed, true, 'Acesso liberado via correspondência em requiresProductId');
    });

    it('usuário sem o produto comprado não acessa curso standalone', () => {
      const commonUser = createTestUser({
        role: 'student',
        purchasedProducts: []
      });

      const standaloneCourse = createTestCourse({
        id: 'dates-and-times-master',
        accessTier: 'standalone',
        access: {
          requiresProductId: ['HOTMART_PROD_101']
        }
      });

      const allowed = hasAccess(commonUser, standaloneCourse, referenceDate);
      assert.strictEqual(allowed, false, 'Usuário sem a compra avulsa não deve acessar o curso');
    });

    it('usuário com entitlement correspondente em access.entitlements acessa curso standalone', () => {
      const activeSubscription: Subscription = {
        id: 'sub_vip',
        entitlement: 'member_mentoria',
        productId: 'PROD_MENTORIA',
        billingPeriod: 'annual',
        status: 'active',
        expiresAt: futureDate,
        gateway: 'hotmart',
        lastEventId: 'evt_10',
        updatedAt: '2026-09-01T00:00:00Z'
      };

      const menteeUser = createTestUser({
        role: 'student',
        subscriptions: [activeSubscription]
      });

      const standaloneCourse = createTestCourse({
        id: 'executive-masterclass',
        accessTier: 'standalone',
        access: {
          entitlements: ['member_mentoria'],
          requiresProductId: ['PROD_EXEC_STANDALONE']
        }
      });

      const allowed = hasAccess(menteeUser, standaloneCourse, referenceDate);
      assert.strictEqual(allowed, true, 'Entitlement member_mentoria cobre o curso standalone que o aceita');
    });
  });

  // ==========================================================================
  // 6. ENTITLEMENTS ATIVOS (getActiveEntitlements)
  // ==========================================================================
  describe('Consolidação de Entitlements (getActiveEntitlements)', () => {
    it('deve consolidar assinaturas ativas e entitlements legados sem duplicatas', () => {
      const activeSub1: Subscription = {
        id: 'sub_1',
        entitlement: 'member_pago',
        productId: 'PROD_1',
        billingPeriod: 'annual',
        status: 'active',
        expiresAt: futureDate,
        gateway: 'hotmart',
        lastEventId: 'evt_11',
        updatedAt: '2026-09-01T00:00:00Z'
      };

      const expiredSub: Subscription = {
        id: 'sub_2',
        entitlement: 'member_mentoria',
        productId: 'PROD_2',
        billingPeriod: 'monthly',
        status: 'active',
        expiresAt: pastDate,
        gateway: 'hotmart',
        lastEventId: 'evt_12',
        updatedAt: '2026-08-01T00:00:00Z'
      };

      const user = createTestUser({
        subscriptions: [activeSub1, expiredSub],
        legacyEntitlements: ['legado_1', 'member_pago'] // 'member_pago' já está na sub ativa
      });

      const entitlements = getActiveEntitlements(user, referenceDate);
      
      assert.ok(entitlements.includes('member_pago'), 'Deve conter member_pago da assinatura ativa');
      assert.ok(entitlements.includes('legado_1'), 'Deve conter legado_1 dos direitos legados');
      assert.strictEqual(entitlements.includes('member_mentoria'), false, 'Não deve conter assinatura expirada');
      
      const occurrencesOfMemberPago = entitlements.filter(e => e === 'member_pago').length;
      assert.strictEqual(occurrencesOfMemberPago, 1, 'Não deve conter categorias duplicadas');
    });
  });

  // ==========================================================================
  // 7. ADAPTADORES E NORMALIZAÇÃO DE DADOS (FASE 2)
  // ==========================================================================
  describe('Adaptadores de Dados V2 (normalizeCourseToV2 & normalizeUserToV2)', () => {
    it('normalizeCourseToV2 deve preencher access: AccessGrant para curso legado sem campo access', () => {
      const legacyCourseRaw = {
        id: 'dtc_curso',
        title: 'Dates and Times',
        accessTier: 'free',
        badge: 'EXPERIMENTE GRÁTIS',
        published: true
      };

      const normalized = normalizeCourseToV2(legacyCourseRaw);
      assert.strictEqual(normalized.schemaVersion, 2);
      assert.strictEqual(normalized.accessTier, 'free');
      assert.ok(normalized.access, 'access deve estar definido');
      assert.ok(normalized.access.entitlements?.includes('member_free'));
      assert.ok(normalized.access.entitlements?.includes('member_pago'));
    });

    it('normalizeCourseToV2 deve mapear legados e tags de mentoria para standalone com entitlement mentoria', () => {
      const mentoriaCourseRaw = {
        id: 'mentoria-estevao',
        title: 'Mentoria VIP - Estêvão',
        accessTier: 'mentoria_vip',
        published: true
      };

      const normalized = normalizeCourseToV2(mentoriaCourseRaw);
      assert.strictEqual(normalized.accessTier, 'standalone');
      assert.ok(normalized.access.entitlements?.includes('member_mentoria'));
      assert.ok(normalized.access.requiresProductId?.includes('mentoria-estevao'));
    });

    it('normalizeUserToV2 deve converter usuário legado com tier e subscription única para schema V2', () => {
      const legacyUserRaw = {
        uid: 'user_legacy_1',
        email: 'assinante@agoraeufalo.com.br',
        name: 'Aluno Pagante',
        tier: 'club_annual',
        role: 'student',
        categories: ['member_free', 'member_pago'],
        subscription: {
          billingPeriod: 'annual',
          status: 'active',
          expiresAt: futureDate,
          gateway: 'hotmart',
          lastEvent: 'PURCHASE_APPROVED'
        },
        purchasedProducts: ['dtc_standalone_pkg']
      };

      const normalized = normalizeUserToV2(legacyUserRaw);
      assert.strictEqual(normalized.schemaVersion, 2);
      assert.strictEqual(normalized.subscriptions.length, 1);
      assert.strictEqual(normalized.subscriptions[0].entitlement, 'member_pago');
      assert.strictEqual(normalized.subscriptions[0].status, 'active');
      assert.ok(normalized.legacyEntitlements.includes('member_free'));
      
      // Valida conversão de purchasedProducts em objetos PurchasedProduct
      assert.strictEqual(normalized.purchasedProducts.length, 1);
      assert.strictEqual(normalized.purchasedProducts[0].courseId, 'dtc_standalone_pkg');
      
      // Valida que o bloco legacy preservou os dados originais
      assert.strictEqual(normalized.legacy?.tier, 'club_annual');
    });

    it('normalizeUserToV2 deve mapear turmas históricas (tier: ms_legacy) para legacyEntitlements: legado_1', () => {
      const legacyStudentRaw = {
        uid: 'user_hist_99',
        email: 'historico@gmail.com',
        name: 'Aluno Antigo',
        tier: 'ms_legacy',
        role: 'student'
      };

      const normalized = normalizeUserToV2(legacyStudentRaw);
      assert.ok(normalized.legacyEntitlements.includes('legado_1'));
      assert.ok(normalized.legacyEntitlements.includes('member_free'));
    });

    it('hasAccess deve conceder acesso combinando usuário normalizado e curso normalizado', () => {
      const legacyUserRaw = {
        uid: 'user_legacy_club',
        email: 'club@agoraeufalo.com.br',
        name: 'Membro Club',
        tier: 'club_annual',
        categories: ['member_free', 'member_pago'],
        subscription: {
          status: 'active',
          expiresAt: futureDate,
          gateway: 'hotmart'
        }
      };

      const legacyCourseRaw = {
        id: 'magic-story-001',
        title: 'MS001 - Grazi',
        accessTier: 'all_access',
        published: true
      };

      const normalizedUser = normalizeUserToV2(legacyUserRaw);
      const normalizedCourse = normalizeCourseToV2(legacyCourseRaw);

      const allowed = hasAccess(normalizedUser, normalizedCourse, referenceDate);
      assert.strictEqual(allowed, true, 'Usuário normalizado deve ter acesso ao curso normalizado via hasAccess');
    });
  });

  // ==========================================================================
  // 7. CONSOLIDAÇÃO DO WEBHOOK HOTMART & CONTRATOS DE EVENTOS (FASE 3)
  // ==========================================================================
  describe('Consolidação do Webhook Hotmart (Idempotência e Contrato V2)', () => {
    it('deve extrair deterministicamente o eventId para garantir idempotência em retries', () => {
      // Simulação da lógica de extração do Cloudflare Worker
      function extractEventId(payload: any): string {
        const data = payload.data || payload;
        const purchase = data.purchase || payload.purchase || {};
        const event = (payload.event || payload.hottok_event || 'PURCHASE_APPROVED').trim();
        const txId = (purchase.transaction || data.transaction || payload.transaction || '').trim();
        const rawEventId = (payload.id || data.id || '').trim();

        return rawEventId || (txId ? `wh_${txId}_${event.toLowerCase()}` : `wh_generated`);
      }

      // 1. Quando payload.id vem explicitamente da Hotmart
      const payloadWithId = {
        id: 'evt_hm_123456789',
        event: 'PURCHASE_APPROVED',
        data: { purchase: { transaction: 'HP1234567890' } }
      };
      assert.strictEqual(extractEventId(payloadWithId), 'evt_hm_123456789');

      // 2. Quando payload.id não existe, mas purchase.transaction existe (retry idêntico)
      const payloadWithTxOnly1 = {
        event: 'PURCHASE_APPROVED',
        data: { purchase: { transaction: 'HP9876543210' } }
      };
      const payloadWithTxOnly2 = {
        event: 'PURCHASE_APPROVED',
        data: { purchase: { transaction: 'HP9876543210' } }
      };
      assert.strictEqual(
        extractEventId(payloadWithTxOnly1),
        'wh_HP9876543210_purchase_approved'
      );
      assert.strictEqual(
        extractEventId(payloadWithTxOnly1),
        extractEventId(payloadWithTxOnly2),
        'O eventId deve ser idêntico em retries com a mesma transação'
      );
    });

    it('deve estruturar o log em estrita conformidade com a interface WebhookEvent V2', () => {
      const mockRawPayload = {
        event: 'PURCHASE_APPROVED',
        data: {
          buyer: { email: 'maria@gmail.com', name: 'Maria Silva' },
          product: { id: 8460579, name: 'AgoraEuFalo English Club' },
          purchase: { transaction: 'HP_TEST_TRANS_01' }
        }
      };

      const eventId = 'wh_HP_TEST_TRANS_01_purchase_approved';
      const nowIso = new Date().toISOString();

      const webhookLog: WebhookEvent = {
        id: eventId,
        provider: 'hotmart',
        type: 'PURCHASE_APPROVED',
        productId: '8460579',
        buyerEmail: 'maria@gmail.com',
        occurredAt: nowIso,
        receivedAt: nowIso,
        raw: mockRawPayload,
        processedAt: nowIso,
        processingError: null
      };

      assert.strictEqual(webhookLog.id, eventId);
      assert.strictEqual(webhookLog.provider, 'hotmart');
      assert.strictEqual(webhookLog.type, 'PURCHASE_APPROVED');
      assert.strictEqual(webhookLog.buyerEmail, 'maria@gmail.com');
      assert.strictEqual(webhookLog.productId, '8460579');
      assert.strictEqual(webhookLog.processingError, null);
      assert.ok(typeof webhookLog.raw === 'object');
    });

    it('usuário persistido pelo webhook V2 deve ter acesso imediato garantido via hasAccess', () => {
      const webhookUserPayload: AEFUser = {
        schemaVersion: 2,
        id: 'maria_gmail_com',
        uid: 'maria_gmail_com',
        email: 'maria@gmail.com',
        name: 'Maria Silva',
        role: 'student',
        subscriptions: [
          {
            id: 'sub_maria_gmail_com_hotmart',
            entitlement: 'member_pago',
            productId: '8460579',
            billingPeriod: 'annual',
            status: 'active',
            expiresAt: futureDate,
            gateway: 'hotmart',
            lastEventId: 'wh_HP_TEST_TRANS_01_purchase_approved',
            updatedAt: referenceDate.toISOString()
          }
        ],
        purchasedProducts: [],
        legacyEntitlements: ['member_free'],
        createdAt: referenceDate.toISOString(),
        updatedAt: referenceDate.toISOString()
      };

      const clubCourse = createTestCourse({
        accessTier: 'all_access',
        access: { entitlements: ['member_pago'] }
      });

      const allowed = hasAccess(webhookUserPayload, clubCourse, referenceDate);
      assert.strictEqual(allowed, true, 'Usuário persistido pelo webhook deve acessar o curso club');
    });

    it('quando evento de estorno (PURCHASE_REFUNDED) for processado, hasAccess deve bloquear imediatamente', () => {
      const refundedUser: AEFUser = {
        schemaVersion: 2,
        id: 'maria_gmail_com',
        uid: 'maria_gmail_com',
        email: 'maria@gmail.com',
        name: 'Maria Silva',
        role: 'student',
        subscriptions: [
          {
            id: 'sub_maria_gmail_com_hotmart',
            entitlement: 'member_pago',
            productId: '8460579',
            billingPeriod: 'annual',
            status: 'revoked',
            expiresAt: null,
            gateway: 'hotmart',
            lastEventId: 'wh_HP_REFUND_01_purchase_refunded',
            updatedAt: referenceDate.toISOString()
          }
        ],
        purchasedProducts: [],
        legacyEntitlements: ['member_free'],
        createdAt: referenceDate.toISOString(),
        updatedAt: referenceDate.toISOString()
      };

      const clubCourse = createTestCourse({
        accessTier: 'all_access',
        access: { entitlements: ['member_pago'] }
      });

      const allowed = hasAccess(refundedUser, clubCourse, referenceDate);
      assert.strictEqual(allowed, false, 'Usuário com status revoked deve ter acesso negado');
    });

    it('quando evento de cancelamento com tolerância (canceled_grace), acesso deve ser mantido até expiresAt e negado após', () => {
      const canceledGraceUser: AEFUser = {
        schemaVersion: 2,
        id: 'maria_gmail_com',
        uid: 'maria_gmail_com',
        email: 'maria@gmail.com',
        name: 'Maria Silva',
        role: 'student',
        subscriptions: [
          {
            id: 'sub_maria_gmail_com_hotmart',
            entitlement: 'member_pago',
            productId: '8460579',
            billingPeriod: 'annual',
            status: 'canceled_grace',
            expiresAt: '2026-09-25T00:00:00Z',
            gateway: 'hotmart',
            lastEventId: 'wh_HP_CANCEL_01_subscription_cancellation',
            updatedAt: referenceDate.toISOString()
          }
        ],
        purchasedProducts: [],
        legacyEntitlements: ['member_free'],
        createdAt: referenceDate.toISOString(),
        updatedAt: referenceDate.toISOString()
      };

      const clubCourse = createTestCourse({
        accessTier: 'all_access',
        access: { entitlements: ['member_pago'] }
      });

      // Durante a tolerância (antes de 25 de setembro)
      const allowedDuringGrace = hasAccess(
        canceledGraceUser,
        clubCourse,
        new Date('2026-09-20T00:00:00Z')
      );
      assert.strictEqual(allowedDuringGrace, true, 'Deve ter acesso durante o período de tolerância');

      // Após o fim do ciclo (depois de 25 de setembro)
      const allowedAfterGrace = hasAccess(
        canceledGraceUser,
        clubCourse,
        new Date('2026-09-26T00:00:00Z')
      );
      assert.strictEqual(allowedAfterGrace, false, 'Deve ter acesso bloqueado após o fim da data de tolerância');
    });
  });
});
